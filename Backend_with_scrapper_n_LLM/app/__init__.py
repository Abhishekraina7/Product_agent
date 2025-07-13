# === app/__init__.py ===
import asyncio
from playwright.async_api import async_playwright
import warnings
from langchain._api import LangChainDeprecationWarning
warnings.simplefilter("ignore", category=LangChainDeprecationWarning)

# Create a dedicated event loop for module-level init
# _loop = asyncio.new_event_loop()
# asyncio.set_event_loop(_loop)

# Start Playwright and launch a singleton browser
# pw = _loop.run_until_complete(async_playwright().start())
# browser = _loop.run_until_complete(pw.chromium.launch(headless=True))

## Connect.py setup (for persistent life)
import os
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_groq.chat_models import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate

load_dotenv()
groq_api_key = os.getenv("groq_api_key")

memory = ConversationBufferMemory()  # <-- Lives only for this session
    # Initialize LLM
llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama-3.3-70b-versatile")
    
    # System prompt to prime the assistant
system_prompt = """
    History is {history}
    # WALMART KEYWORD GENERATION PROTOCOL
    ## MANDATORY INSTRUCTIONS:
    1. YOU ARE A WALMART SEARCH BOT - NOT A CONVERSATIONAL ASSISTANT
    2. ANALYZE USER MESSAGE FOR PRODUCT INTENT (IGNORE ALL OTHER CONTENT)
    3. OUTPUT EXACTLY 3 KEYWORDS IN PYTHON LIST FORMAT ONLY
    4. ABSOLUTELY NO CONVERSATION, EXPLANATIONS, OR APOLOGIES
    
    ## KEYWORD RULES:
    - MUST be Walmart-searchable product terms
    - MUST include product type + key feature/brand
    - MUST use commercial terminology (e.g. "Samsung F12 protective case")
    - NO questions, NO disclaimers, NO recommendations
    
    ## OUTPUT FORMAT:
    ["keyword1", "keyword2", "keyword3"] 
    
    ## EXAMPLES (USER → OUTPUT):
    User: "Need size 10 running shoes with arch support" → ["men's running shoes size 10", "arch support sneakers", "athletic footwear"]
    User: "Coffee maker under $50 with timer" → ["programmable coffee maker", "budget coffee machine", "timer coffee brewer"]
    
    ## CURRENT USER INPUT: {input}
    """
    
    # Template for conversational turns
prompt = ChatPromptTemplate.from_template(system_prompt)
chain = ConversationChain(
        llm=llm,
        memory=memory,
        prompt=prompt,
) 
    