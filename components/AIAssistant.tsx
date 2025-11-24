
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { usePortfolio } from '../context/PortfolioContext';
import { MessageSquare, X, Send, Loader2, Sparkles, Bot, ChevronDown, CheckCircle2, Mic, MicOff } from 'lucide-react';
import { MOCK_MARKET_ASSETS } from '../constants';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; isTool?: boolean }[]>([
    { role: 'model', text: 'Hello! I am WealthGPT. I can analyze your portfolio, explain financial concepts, or even add transactions for you (e.g., "Buy 10 shares of AAPL"). How can I help?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activePortfolio, addTransaction } = usePortfolio();
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  // Initialize the AI client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Define Function Tools
  const addTransactionTool: FunctionDeclaration = {
    name: 'addTransaction',
    description: 'Add a new transaction (Buy or Sell) to the portfolio.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        symbol: { type: Type.STRING, description: 'The stock ticker symbol (e.g., AAPL, TSLA)' },
        type: { type: Type.STRING, description: 'The type of transaction', enum: ['BUY', 'SELL'] },
        shares: { type: Type.NUMBER, description: 'Number of shares' },
        price: { type: Type.NUMBER, description: 'Price per share in USD' },
      },
      required: ['symbol', 'type', 'shares', 'price']
    }
  };

  // Initialize Chat Session when opened with enhanced Context
  useEffect(() => {
    if (isOpen && !chatSession) {
        const totalVal = activePortfolio.totalValue;
        const cash = activePortfolio.cashBalance;
        const holdingsCount = activePortfolio.holdings.length;
        
        // Sort for gainers/losers
        const sortedByPerformance = [...activePortfolio.holdings].sort((a, b) => {
            const gainA = (a.currentPrice - a.avgPrice) / a.avgPrice;
            const gainB = (b.currentPrice - b.avgPrice) / b.avgPrice;
            return gainB - gainA;
        });
        
        const bestPerformer = sortedByPerformance[0];
        const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

        // Calculate Sector Weights
        const sectorWeights = activePortfolio.holdings.reduce((acc, h) => {
            const val = h.shares * h.currentPrice;
            acc[h.sector] = (acc[h.sector] || 0) + val;
            return acc;
        }, {} as Record<string, number>);
        
        const sectorString = Object.entries(sectorWeights)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([k, v]) => `${k}: ${(((v as number) / totalVal) * 100).toFixed(1)}%`)
            .join(', ');

        // Calculate Detailed Metrics
        const totalYield = totalVal > 0 
            ? activePortfolio.holdings.reduce((acc, h) => acc + (h.shares * h.currentPrice * (h.dividendYield/100)), 0) / totalVal * 100 
            : 0;

        // Aggregate Financial Health Metrics (Debt/Equity, Free Cash Flow Proxy)
        let totalWeightedDebtToEquity = 0;
        let totalWeightedFCFYield = 0;
        let healthMetricCount = 0;

        // Calculate Aggregate Snowflake Score
        let aggSnowflake = { value: 0, future: 0, past: 0, health: 0, dividend: 0 };
        activePortfolio.holdings.forEach(h => {
             const weight = (h.shares * h.currentPrice) / totalVal;
             aggSnowflake.value += h.snowflake.value * weight;
             aggSnowflake.future += h.snowflake.future * weight;
             aggSnowflake.past += h.snowflake.past * weight;
             aggSnowflake.health += h.snowflake.health * weight;
             aggSnowflake.dividend += h.snowflake.dividend * weight;

             // Advanced Financials Calculation
             if (h.financials && h.financials.length > 0) {
                 const latest = h.financials[h.financials.length - 1];
                 if (latest.equity > 0) {
                     const de = latest.debt / latest.equity;
                     totalWeightedDebtToEquity += de * weight;
                     healthMetricCount++;
                 }
                 // Proxy FCF Yield based on mock health score if exact FCF unavailable
                 const fcfProxy = (h.snowflake.health / 5) * 0.08; 
                 totalWeightedFCFYield += fcfProxy * weight;
             } else {
                 // Fallback estimation based on snowflake health
                 const fcfProxy = (h.snowflake.health / 5) * 0.06; 
                 totalWeightedFCFYield += fcfProxy * weight;
                 // Mock Debt/Equity based on sector
                 const de = h.sector === 'Technology' ? 0.5 : h.sector === 'Utilities' ? 1.2 : 0.8;
                 totalWeightedDebtToEquity += de * weight;
                 healthMetricCount++;
             }
        });

        const avgDebtToEquity = healthMetricCount > 0 ? totalWeightedDebtToEquity.toFixed(2) : '0.85';
        const estFCFYield = (totalWeightedFCFYield * 100).toFixed(2);

        // Calculate Beta & Sharpe Ratio (Mocked approximation)
        const calculateBeta = (sector: string, type: string) => {
            if (type === 'Crypto') return 2.5;
            if (sector === 'Technology') return 1.3;
            if (sector === 'Utilities') return 0.5;
            return 1.0;
        }
        const portfolioBeta = totalVal > 0 
            ? activePortfolio.holdings.reduce((acc, h) => acc + (calculateBeta(h.sector, h.assetType) * ((h.shares * h.currentPrice)/totalVal)), 0)
            : 1.0;
        
        // Simulated Sharpe Ratio (Return - RiskFree) / StdDev
        // Assuming RiskFree = 4% and Market Return = 10%, Portfolio Return = Market * Beta
        const expectedReturn = 0.04 + (portfolioBeta * 0.06);
        const estimatedVol = 0.15 * portfolioBeta; // Base market vol 15%
        const sharpeRatio = (expectedReturn - 0.04) / estimatedVol;

        const topConcentration = sortedByPerformance.length > 0 
            ? (sortedByPerformance[0].shares * sortedByPerformance[0].currentPrice / totalVal * 100).toFixed(1)
            : '0';

        const portfolioContext = `
            CURRENT PORTFOLIO SNAPSHOT (${new Date().toLocaleDateString()}):
            Portfolio Name: ${activePortfolio.name}
            Total Net Asset Value: $${totalVal.toFixed(2)}
            Cash Available: $${cash.toFixed(2)}
            Number of Holdings: ${holdingsCount}
            
            RISK & PERFORMANCE METRICS:
            Portfolio Beta: ${portfolioBeta.toFixed(2)} (1.0 is Market Average)
            Estimated Sharpe Ratio: ${sharpeRatio.toFixed(2)}
            Top Asset Concentration: ${topConcentration}% in ${sortedByPerformance[0]?.symbol || 'None'}
            Sector Allocation: ${sectorString}
            Best Performer: ${bestPerformer ? `${bestPerformer.symbol} (${((bestPerformer.currentPrice - bestPerformer.avgPrice)/bestPerformer.avgPrice*100).toFixed(1)}%)` : 'None'}
            Worst Performer: ${worstPerformer ? `${worstPerformer.symbol} (${((worstPerformer.currentPrice - worstPerformer.avgPrice)/worstPerformer.avgPrice*100).toFixed(1)}%)` : 'None'}
            
            FINANCIAL HEALTH ANALYSIS (Aggregate):
            - Value Score: ${aggSnowflake.value.toFixed(1)}/5 (Higher is undervalued)
            - Future Growth Score: ${aggSnowflake.future.toFixed(1)}/5
            - Balance Sheet Health: ${aggSnowflake.health.toFixed(1)}/5
            - Dividend Safety: ${aggSnowflake.dividend.toFixed(1)}/5
            - Weighted Debt-to-Equity Ratio: ${avgDebtToEquity} (Lower is generally safer, >2.0 is high leverage)
            - Est. Free Cash Flow Yield: ${estFCFYield}% (Cash generation efficiency)
            
            INCOME:
            Weighted Dividend Yield: ${totalYield.toFixed(2)}%
            
            HOLDINGS DETAIL:
            ${activePortfolio.holdings.map(h => 
                `- ${h.symbol} (${h.name}): ${h.shares} sh @ $${h.currentPrice.toFixed(2)}. Total Val: $${(h.shares * h.currentPrice).toFixed(0)}. Sector: ${h.sector}. Yield: ${h.dividendYield}%. SafetyScore: ${h.safetyScore}.`
            ).join('\n')}
        `;

        const session = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are WealthOS AI, an expert financial assistant embedded in a wealth management app.
                You are helpful, professional, and concise.
                
                Your goal is to provide personalized insights based on the user's specific portfolio data provided below.
                - If the user asks for "risk analysis", analyze their Portfolio Beta (${portfolioBeta.toFixed(2)}) and sector concentration. Mention their Debt-to-Equity ratio (${avgDebtToEquity}) as a measure of leverage.
                - If the user asks for "dividend advice", look at their yield and aggregate Dividend Safety score.
                - If the user asks to "compare to S&P 500", note that the portfolio's growth score is ${aggSnowflake.future.toFixed(1)}.
                - If asking about financial health, reference the Free Cash Flow yield (${estFCFYield}%) and Balance Sheet Health.
                
                CRITICAL: When a user asks to buy or sell a stock, you MUST use the 'addTransaction' tool. 
                If you use the tool, confirm the action in your text response briefly.
                
                ${portfolioContext}`,
                tools: [{ functionDeclarations: [addTransactionTool] }]
            }
        });
        setChatSession(session);
    }
  }, [isOpen]); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        const result = await chatSession.sendMessage({ message: userMsg });
        
        // Handle Function Calls
        const functionCalls = result.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
            for (const call of functionCalls) {
                if (call.name === 'addTransaction') {
                    const args = call.args as any;
                    
                    // Look up the real asset ID from constants
                    const marketAsset = MOCK_MARKET_ASSETS.find(
                      a => a.symbol.toUpperCase() === args.symbol.toUpperCase()
                    );

                    let responseText = '';
                    if (marketAsset) {
                      const date = new Date().toISOString().split('T')[0];
                      // Execute Context Action
                      addTransaction(marketAsset.id, args.type, args.shares, args.price, date);
                      responseText = `✅ Executed: ${args.type} ${args.shares} ${args.symbol.toUpperCase()} @ $${args.price}`;
                    } else {
                      responseText = `⚠️ Error: Could not find asset '${args.symbol}'. Transaction not executed.`;
                    }
                    
                    // Send tool response back to model to continue conversation
                    await chatSession.sendMessage({
                        message: [{
                            functionResponse: {
                                name: call.name,
                                response: { result: responseText },
                                id: call.id
                            }
                        }]
                    });

                    setMessages(prev => [...prev, { role: 'model', text: responseText, isTool: true }]);
                }
            }
        } 
        
        // If there is text response (either standalone or after tool use)
        if (result.text && (!functionCalls || functionCalls.length === 0)) {
             setMessages(prev => [...prev, { role: 'model', text: result.text || "" }]);
        } else if (result.text) {
             // Append text explanation if it came with tool
             setMessages(prev => [...prev, { role: 'model', text: result.text || "" }]);
        }

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { role: 'model', text: "I encountered an error processing that request." }]);
    } finally {
        setIsLoading(false);
    }
  };

  // Voice Recognition Handler
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Optional: Auto-send could be triggered here if desired
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
        {/* Floating Toggle Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-300 shadow-2xl shadow-brand-600/40 ${isOpen ? 'w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:text-white scale-0 md:scale-100 md:w-12 md:h-12' : 'w-14 h-14 rounded-full bg-brand-600 text-white hover:bg-brand-500 hover:scale-105'}`}
        >
            {isOpen ? <ChevronDown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </button>

        {/* Chat Window */}
        {isOpen && (
            <div className="fixed inset-0 z-[60] md:inset-auto md:bottom-24 md:right-6 md:z-40 w-full h-full md:w-[380px] md:h-[600px] md:max-h-[calc(100vh-140px)] bg-slate-900 md:bg-slate-900/95 backdrop-blur-md border border-slate-800 md:border-slate-700/50 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 md:bg-slate-950/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">WealthGPT</h3>
                            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-full md:bg-transparent md:p-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-brand-600 text-white rounded-br-none' 
                                : msg.isTool 
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-tl-none'
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                            }`}>
                                {msg.isTool && <div className="flex items-center gap-2 mb-1 font-bold text-xs uppercase"><CheckCircle2 className="w-3 h-3" /> Action Completed</div>}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                                <span className="text-xs text-slate-400">Processing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 md:bg-slate-950/50 border-t border-slate-800 pb-8 md:pb-4">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="relative flex gap-2"
                    >
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? "Listening..." : "Ask 'Analyze my risks'"}
                                className={`w-full bg-slate-900 border text-white text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-1 transition-all ${isListening ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'}`}
                            />
                            <button 
                                type="button"
                                onClick={toggleListening}
                                className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                            >
                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                        </div>
                        <button 
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-brand-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-500 transition-colors shadow-lg"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    <div className="text-[10px] text-center text-slate-600 mt-2">
                        AI-executed trades are simulations only.
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default AIAssistant;
