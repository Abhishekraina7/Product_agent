# run.py
from app.server import app, socketio
from app.server import browser,pw, chain
import atexit
import asyncio


@atexit.register
def cleanup_playwright():
    try:
        chain.memory.clear()
        loop = asyncio.get_event_loop()
        if browser and browser.is_connected():
            loop.run_until_complete(browser.close())
        loop.run_until_complete(pw.stop())
        print("✅ Playwright browser and engine closed.")
    except Exception as e:
        print(f"⚠️ Failed to clean up Playwright: {e}")

if __name__ == "__main__":
    # Launch Flask + Socket.IO
    socketio.run(app, debug=True, use_reloader=False, host="localhost", port=5000)
