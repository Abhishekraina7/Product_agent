# app/server.py
from flask import Flask, request
from flask_socketio import SocketIO, emit
import asyncio
import ast
from app import chain
from search import snapdeal_scraper_multi
import logging
from playwright.async_api import async_playwright
# Load .env keys for chain
logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


playwright_loop = asyncio.new_event_loop()

# These will be assigned once
browser = None
pw = None


# Initialize Playwright in its own asyncio loop
def init_playwright():
    global browser, pw
    from playwright.async_api import async_playwright
    if browser is not None:
        return
    pw = playwright_loop.run_until_complete(async_playwright().start())
    browser = playwright_loop.run_until_complete(pw.chromium.launch(headless=True))


def chat_background(user_input, sid):
    global browser, pw
    # Lazy init
    if browser is None or pw is None:
        init_playwright()

    # Exit condition
    if user_input.lower() in ["exit", "quit"]:
        # Clear LangChain memory
        try:
            chain.memory.clear()
        except Exception:
            pass
        # Close Playwright browser and engine
        if browser:
            playwright_loop.run_until_complete(browser.close())
            browser = None
        if pw:
            playwright_loop.run_until_complete(pw.stop())
            pw = None
        # Notify client
        socketio.emit("bot_message", {"text": "Assistant: Session closed. Goodbye!"}, room=sid)
        return

    # LLM step (sync)
    response = chain.invoke(user_input)
    try:
        keywords = ast.literal_eval(response['response'])
    except Exception:
        socketio.emit("bot_message", {"text": "Assistant: Sorry, I couldn't interpret that."}, to=sid)
        return

    if not (isinstance(keywords, list) and len(keywords) == 3):
        socketio.emit("bot_message", {"text": "Assistant: Please provide exactly 3 keywords."}, to=sid)
        return

    socketio.emit("bot_message", {"text": f"Assistant: Recommending Products..."}, to=sid)
    print( f"Assistant: Searching Snapdeal for {keywords}...")
    # Scraper step
    try:
        # Use the existing browser in a new loop for scraping
        products = playwright_loop.run_until_complete(snapdeal_scraper_multi(browser, keywords))
    except Exception as e:
        socketio.emit("bot_message", {"text": f"Assistant: Scraping failed: {e}"}, to=sid)
        return

    # Emit products
    for p in products:
        # print(p)
        socketio.emit("bot_message", {"text": "Assistant: Some great products you will like..."}, to=sid)
        socketio.emit("product", p, to=sid)

    socketio.emit("bot_message", {"text": "Assistant: Do any interest you, or would you like more options?"}, to=sid)

@socketio.on("connect")
def handle_connect():
    emit("bot_message", {"text": "Assistant: Hello! I’m online and ready to help you."})
    init_playwright()
    

@socketio.on("user_message")
def handle_message(data):
    user_input = data.get("text", "").strip()
    sid = request.sid
    logging.info(f"Received message from {sid}: {user_input}")
    # Spawn background task so we don't block
    socketio.start_background_task(chat_background, user_input, sid)

