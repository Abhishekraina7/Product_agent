# Intelligent Product Recommender Backend

This is the backend for the Intelligent Product Recommender system. It uses Flask, Socket.IO, Playwright, and LangChain with Groq LLM integration to provide real-time product recommendations via web scraping and LLM-powered keyword extraction.

## Features
- Real-time chat with product recommendations
- Snapdeal web scraping using Playwright
- LLM-powered keyword extraction (Groq)
- Socket.IO for real-time communication

## Requirements
- Python 3.9+
- Node.js (for Playwright browser installation)

## Setup Instructions

### 1. Clone the Repository
```
git clone https://github.com/Danish811/Intelligent-Product-Recommender-Backend.git
cd Intelligent-Product-Recommender-Backend
```

### 2. Create a Virtual Environment (Recommended)
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Python Dependencies
```
pip install -r requirements.txt
```

### 4. Install Playwright Browsers
```
playwright install
```

### 5. Environment Variables
Create a `.env` file in the `app/` directory with your Groq API key:
```
groq_api_key=your_groq_api_key_here
```

### 6. Run the Backend Server
```
python run.py
```
The server will start on `http://localhost:5000`.

## Connecting to a React Frontend
- Use the [socket.io-client](https://socket.io/docs/v4/client-api/) package in your React app to connect to `http://localhost:5000`.
- See the backend's `index.html` for example event names and payloads.

## Deployment Notes
- For production, use a production-ready WSGI server and configure CORS as needed.
- Session data is in-memory and not persistent across restarts or multiple workers.

## Author
Mohd. Danish Sheikh
