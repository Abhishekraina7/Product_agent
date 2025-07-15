
# 🧠 Intelligent Product Recommender – Backend

This is the backend server for the **Intelligent Product Recommender** system. It powers real-time product suggestions using:

- 🧠 **Llama3 LLM + LangChain** for intelligent keyword extraction  
- 🔍 **Playwright** for live web scraping (Snapdeal)  
- 🔌 **Flask + Socket.IO** for fast real-time chat response

> It listens to user queries via socket events, extracts intent, scrapes products, and sends live responses to the frontend.

---

## 📹 Demo

Watch a working demo here:  
👉 [https://www.youtube.com/watch?v=evSACLFsneE](https://www.youtube.com/watch?v=evSACLFsneE)


---

## ⚙️ Features

- 🧠 LLM Powered Product intent understanding (via LangChain)
- 🔍 Live web scraping with Playwright
- ⚡ Real-time communication with Socket.IO architecture
- 💬 Easy integration with any Socket.IO-based frontend

---

## 🏗️ Tech Stack

| Component     | Technology            |
|---------------|------------------------|
| Language      | Python 3.9+            |
| Framework     | Flask                  |
| Real-time     | Flask-SocketIO         |
| Scraping      | Playwright (headless)  |
| LLM API       | Llama3 + LangChain     |
| Deployment    | Localhost / Any WSGI   |

---

## 📁 Folder Structure

Backend_with_scrapper_n_LLM/
├── run.py # Entry point to run the Flask server
├── index.html # Basic test client (browser chat interface)
├── requirements.txt # Python dependencies
└── app/
└── .env # Place your groq_api_key here

---

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
GitHub: @Danish811


