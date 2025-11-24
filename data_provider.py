from enum import Enum
import yfinance as yf
import requests
import pandas as pd
from dotenv import load_dotenv
import os
from typing import Dict, List, Any

load_dotenv()

class Provider(str, Enum):
    YFINANCE = "yfinance"
    FMP = "fmp"
    EODHD = "eodhd"

CURRENT_PROVIDER = Provider(os.getenv("CURRENT_PROVIDER", "yfinance"))

FMP_KEY = os.getenv("FMP_KEY")
EODHD_KEY = os.getenv("EODHD_KEY")

class DataProvider:
    @staticmethod
    def get_price(ticker: str) -> Dict[str, Any]:
        ticker = ticker.upper()
        try:
            if CURRENT_PROVIDER == Provider.YFINANCE:
                stock = yf.Ticker(ticker)
                info = stock.info
                price = info.get("currentPrice", None)
                if price is None:
                    hist = stock.history(period="1d")
                    price = hist["Close"].iloc[-1] if not hist.empty else None
                return {"ticker": ticker, "price": round(float(price), 2) if price else None, "source": "yfinance", "timestamp": pd.Timestamp.now().isoformat()}
            elif CURRENT_PROVIDER == Provider.FMP:
                if not FMP_KEY: raise ValueError("Set FMP_KEY in .env")
                url = f"https://financialmodelingprep.com/api/v3/quote/{ticker}?apikey={FMP_KEY}"
                resp = requests.get(url).json()
                price = resp[0]["price"] if resp else None
                return {"ticker": ticker, "price": round(float(price), 2) if price else None, "source": "fmp", "timestamp": pd.Timestamp.now().isoformat()}
            elif CURRENT_PROVIDER == Provider.EODHD:
                if not EODHD_KEY: raise ValueError("Set EODHD_KEY in .env")
                url = f"https://eodhd.com/api/real-time/{ticker}.US?api_token={EODHD_KEY}&fmt=json"
                resp = requests.get(url).json()
                price = resp.get("close")
                return {"ticker": ticker, "price": round(float(price), 2) if price else None, "source": "eodhd", "timestamp": pd.Timestamp.now().isoformat()}
        except Exception as e:
            return {"ticker": ticker, "error": str(e), "source": CURRENT_PROVIDER.value}

    @staticmethod
    def get_historical(ticker: str, days: int = 365) -> Dict[str, Any]:
        ticker = ticker.upper()
        try:
            if CURRENT_PROVIDER == Provider.YFINANCE:
                df = yf.Ticker(ticker).history(period=f"{days}d")
                df = df[["Open", "High", "Low", "Close", "Volume", "Dividends"]].round(2)
            elif CURRENT_PROVIDER == Provider.FMP:
                if not FMP_KEY: raise ValueError("Set FMP_KEY in .env")
                url = f"https://financialmodelingprep.com/api/v3/historical-price-full/{ticker}?apikey={FMP_KEY}&limit={days}"
                resp = requests.get(url).json()
                df = pd.DataFrame(resp["historical"])
                df["date"] = pd.to_datetime(df["date"])
                df.set_index("date", inplace=True)
                df = df[["open", "high", "low", "close", "volume"]].rename(columns=lambda x: x.capitalize())
                df["Dividends"] = 0.0  # Add separate dividends call if needed
            elif CURRENT_PROVIDER == Provider.EODHD:
                if not EODHD_KEY: raise ValueError("Set EODHD_KEY in .env")
                from_date = (pd.Timestamp.now() - pd.Timedelta(days=days)).strftime("%Y-%m-%d")
                url = f"https://eodhd.com/api/eod/{ticker}.US?from={from_date}&period=d&api_token={EODHD_KEY}&fmt=json"
                resp = requests.get(url).json()
                df = pd.DataFrame(resp)
                df["date"] = pd.to_datetime(df["date"])
                df.set_index("date", inplace=True)
                df = df[["open", "high", "low", "close", "adjusted_close", "volume"]].round(2)
                df.rename(columns={"adjusted_close": "Close"}, inplace=True)
                df["Dividends"] = 0.0
            return {"ticker": ticker, "data": df.reset_index().to_dict("records"), "source": CURRENT_PROVIDER.value}
        except Exception as e:
            return {"ticker": ticker, "error": str(e), "source": CURRENT_PROVIDER.value}

    @staticmethod
    def get_dividends(ticker: str, limit: int = 10) -> Dict[str, Any]:
        ticker = ticker.upper()
        try:
            if CURRENT_PROVIDER == Provider.YFINANCE:
                divs = yf.Ticker(ticker).dividends.tail(limit).reset_index()
                records = [{"date": str(row.Date), "amount": round(row.Dividends, 4)} for _, row in divs.iterrows()]
            elif CURRENT_PROVIDER == Provider.FMP:
                if not FMP_KEY: raise ValueError("Set FMP_KEY in .env")
                url = f"https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/{ticker}?apikey={FMP_KEY}&limit={limit}"
                resp = requests.get(url).json()
                records = [{"date": d["exDivDate"], "amount": float(d["dividend"])} for d in resp["historicalDividend"][:limit] if d["dividend"]]
            elif CURRENT_PROVIDER == Provider.EODHD:
                if not EODHD_KEY: raise ValueError("Set EODHD_KEY in .env")
                url = f"https://eodhd.com/api/div/{ticker}.US?api_token={EODHD_KEY}&fmt=json&limit={limit}"
                resp = requests.get(url).json()
                records = [{"date": d["date"], "amount": float(d["value"])} for d in resp[:limit]]
            return {"ticker": ticker, "dividends": records, "source": CURRENT_PROVIDER.value}
        except Exception as e:
            return {"ticker": ticker, "error": str(e), "source": CURRENT_PROVIDER.value}