from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from data_provider import DataProvider, CURRENT_PROVIDER
from dotenv import load_dotenv
import uvicorn
from typing import Optional

load_dotenv()

app = FastAPI(title="W-proj5 Stock & Dividend Tracker", version="5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "W-proj5 API Live!", "provider": CURRENT_PROVIDER.value, "docs": "/docs"}

@app.get("/api/price/{ticker}")
async def api_price(ticker: str):
    return DataProvider.get_price(ticker)

@app.get("/api/historical/{ticker}")
async def api_historical(ticker: str, days: Optional[int] = Query(365, ge=1, le=7300)):
    return DataProvider.get_historical(ticker, days)

@app.get("/api/dividends/{ticker}")
async def api_dividends(ticker: str, limit: Optional[int] = Query(10, ge=1, le=50)):
    return DataProvider.get_dividends(ticker, limit)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)