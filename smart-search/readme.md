# SmartSearch - AI-Powered Product Search

A modern Next.js frontend connected to a Flask + Playwright backend for intelligent product recommendations.

## 🚀 Quick Start

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
1. Clone the backend repository:
```bash
git clone https://github.com/Danish811/Intelligent-Product-Recommender-Backend
cd Intelligent-Product-Recommender-Backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install Playwright browsers:
```bash
playwright install
```

4. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000` by default.

### Testing the Integration
1. Start the backend server first
2. Start the frontend development server
3. Try searching for products like "wireless headphones" or "laptop"

### Troubleshooting
- **CORS Issues**: Make sure your Flask app has CORS enabled
- **Connection Refused**: Ensure the backend is running on port 5000
- **No Results**: Check the backend logs for scraping errors
## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the frontend root:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### API Integration
The frontend connects to your Flask backend through:
- **Search endpoint**: `POST /search`
- **Health check**: `GET /health` (optional)

## 📡 API Usage

### Search Request Format
```json
{
  "query": "wireless headphones",
  "limit": 20,
  "filters": {
    "min_price": 50,
    "max_price": 500,
    "min_rating": 4.0
  }
}
```

### Expected Response Format
```json
{
  "products": [
    {
      "id": "1",
      "name": "Product Name",
      "price": 99.99,
      "originalPrice": 129.99,
      "rating": 4.5,
      "reviews": 1234,
      "image": "https://example.com/image.jpg",
      "discount": 23,
      "url": "https://example.com/product",
      "description": "Product description"
    }
  ],
  "query": "wireless headphones",
  "total_results": 50
}
```

## 🛠️ Development

### Frontend Features
- ✨ Beautiful UI with animated gradient effects
- 🔍 Real-time search with loading states
- 📱 Responsive design
- 🎨 Modern glassmorphism design
- ⚡ TypeScript for type safety

### Backend Integration
- 🔗 RESTful API integration
- 🛡️ Error handling and fallbacks
- 🔄 Loading states and user feedback
- 📊 Type-safe data handling

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Your preferred hosting)
Make sure to update the `NEXT_PUBLIC_API_URL` environment variable to point to your production backend URL.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the integration
5. Submit a pull request