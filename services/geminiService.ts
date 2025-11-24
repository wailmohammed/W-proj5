
import { GoogleGenAI, Type } from "@google/genai";
import { Portfolio } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Persistent Cache Helpers to prevent 429s across reloads
const CACHE_PREFIX = 'wealthos_cache_v1_';

const getFromCache = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (item) {
            const { data, timestamp } = JSON.parse(item);
            // Cache expires after 24 hours
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                return data;
            }
        }
    } catch (e) {
        console.warn('Cache read error', e);
    }
    return null;
};

const saveToCache = (key: string, data: any) => {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('Cache write error', e);
    }
};

const generatePortfolioHash = (portfolio: Portfolio) => {
    return `${portfolio.id}-${portfolio.holdings.length}-${portfolio.totalValue.toFixed(0)}-${portfolio.cashBalance.toFixed(0)}`;
}

// Helper to handle API errors
const handleGeminiError = (error: any, defaultMessage: string): string => {
    console.warn("Gemini API Error:", error);
    
    let errorStr = '';
    try {
        errorStr = JSON.stringify(error);
    } catch {
        errorStr = String(error);
    }

    // Check for Quota Exceeded / Rate Limit (429)
    if (
        errorStr.includes('429') || 
        errorStr.toLowerCase().includes('quota') || 
        errorStr.includes('RESOURCE_EXHAUSTED')
    ) {
        return "⚠️ AI Usage Limit Reached. Showing cached/fallback data.";
    }

    return defaultMessage;
};

interface PortfolioContextData {
    beta: number;
    yield: number;
    sectorWeights: Record<string, string>; // Percentage string
    costBasisSummary: string;
    recentTransactions: string[];
}

export const generatePortfolioInsight = async (portfolio: Portfolio, metrics?: PortfolioContextData): Promise<string> => {
  const hash = generatePortfolioHash(portfolio);
  const cacheKey = `insight_${hash}`;
  
  // 1. Check persistent cache
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    // Prepare a summary of the portfolio for the prompt
    const holdingsSummary = portfolio.holdings
      .map(h => `${h.symbol} (${h.assetType}): $${(h.shares * h.currentPrice).toFixed(0)}`)
      .join(', ');

    let advancedContext = '';
    if (metrics) {
        advancedContext = `
        Advanced Metrics:
        - Portfolio Beta: ${metrics.beta.toFixed(2)}
        - Weighted Yield: ${metrics.yield.toFixed(2)}%
        - Sector Allocation: ${JSON.stringify(metrics.sectorWeights)}
        - Cost Basis Info: ${metrics.costBasisSummary}
        - Recent Activity: ${metrics.recentTransactions.join(', ') || 'None'}
        `;
    }

    const prompt = `
      Analyze the following investment portfolio summary for a daily executive briefing:
      
      Core Data:
      - Total Cash: $${portfolio.cashBalance}
      - Total Equity Value: $${portfolio.totalValue}
      - Holdings: ${holdingsSummary}

      ${advancedContext}

      Provide a professional, 3-4 sentence executive summary. 
      1. Comment on the overall risk level (referencing beta and sectors).
      2. Mention any recent activity impact or lack thereof.
      3. Highlight one area for potential diversification or attention based on the sectors.
      
      Adopt a financial advisor persona. Be concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text || "Unable to generate insight at this time.";
    
    // 2. Save to cache
    saveToCache(cacheKey, text);
    
    return text;
  } catch (error) {
    return handleGeminiError(error, "AI Insight unavailable. Please check your API key configuration.");
  }
};

export const analyzeStockRisks = async (symbol: string): Promise<{ strengths: string[], risks: string[] }> => {
  const cacheKey = `risks_${symbol}`;
  
  // 1. Check persistent cache
  const cached = getFromCache<{ strengths: string[], risks: string[] }>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Analyze ${symbol} for an investor. Provide 3 key distinct strengths (bull case) and 3 key distinct risks (bear case). Keep them concise.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No text returned");
    
    const result = JSON.parse(text);
    
    // 2. Save to cache
    saveToCache(cacheKey, result);
    
    return result;
  } catch (error) {
    handleGeminiError(error, "");
    
    // Fallback to generic data on error (including rate limit) to keep UI intact
    return { 
      strengths: ["Strong market position", "Consistent revenue growth", "High brand value"], 
      risks: ["Regulatory challenges", "Market saturation", "Economic downturn impact"] 
    };
  }
};

export const analyzeStock = async (symbol: string): Promise<string> => {
  const cacheKey = `analysis_${symbol}`;
  
  // 1. Check persistent cache
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a concise fundamental analysis of ${symbol} in 100 words. Focus on recent growth catalysts and primary risks.`,
    });
    
    const text = response.text || "Analysis unavailable.";
    
    // 2. Save to cache
    saveToCache(cacheKey, text);
    
    return text;
  } catch (error) {
      return handleGeminiError(error, "Analysis unavailable.");
  }
}
