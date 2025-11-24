<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/16CB5hsyrGCQaKt1klSKHLoBlDG7kX0NA

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# W-proj5: Scalable Stock & Dividend Tracker

A FastAPI-based API for fetching stock prices, historical data, and dividends. Starts free with yfinance; scales to FMP/EODHD for commercial use.

## Quick Start
1. `pip install -r requirements.txt`
2. `uvicorn main:app --reload`
3. Visit http://localhost:8000/docs

## Endpoints
- GET /api/price/{ticker} (e.g., AAPL)
- GET /api/historical/{ticker}?days=365
- GET /api/dividends/{ticker}?limit=10

## Scaling
Edit .env → Change CURRENT_PROVIDER → Redeploy.

Deploy: Railway/Render (free tiers).
