










import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertTriangle, CheckCircle, FileText, Sparkles, Loader2, Users, Briefcase, Lock, Plus, ExternalLink, Scale, BarChart, Newspaper, ThumbsUp, ThumbsDown, Eye, EyeOff, List, ChevronDown, PlusCircle, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart, Bar, Legend } from 'recharts';
import SnowflakeChart from './SnowflakeChart';
import { MOCK_MARKET_ASSETS, MOCK_NEWS } from '../constants';
import { analyzeStock, analyzeStockRisks } from '../services/geminiService';
import { usePortfolio } from '../context/PortfolioContext';

const ResearchView: React.FC = () => {
  const { selectedResearchSymbol, viewStock, openAddAssetModal, watchlists, activeWatchlistId, toggleWatchlist, createWatchlist, switchWatchlist } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sync local search state with global selection
  const [selectedSymbol, setSelectedSymbol] = useState(selectedResearchSymbol);

  // Watchlist UI State
  const [isWatchlistMenuOpen, setIsWatchlistMenuOpen] = useState(false);
  const [isCreatingWatchlist, setIsCreatingWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  useEffect(() => {
      setSelectedSymbol(selectedResearchSymbol);
  }, [selectedResearchSymbol]);
  
  // AI State
  const [aiProfile, setAiProfile] = useState<string | null>(null);
  const [aiRisks, setAiRisks] = useState<{strengths: string[], risks: string[]} | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Combine portfolio holdings and other market assets for the search mock
  const asset = MOCK_MARKET_ASSETS.find(a => a.symbol === selectedSymbol) || MOCK_MARKET_ASSETS[0];

  // Filter for autocomplete
  const searchResults = searchTerm.length > 0 
    ? MOCK_MARKET_ASSETS.filter(a => a.symbol.includes(searchTerm.toUpperCase()) || a.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
      const fetchAI = async () => {
          setAnalyzing(true);
          setAiProfile(null);
          setAiRisks(null);
          try {
              const [profile, riskData] = await Promise.all([
                  analyzeStock(asset.symbol),
                  analyzeStockRisks(asset.symbol)
              ]);
              setAiProfile(profile);
              setAiRisks(riskData);
          } catch (e) {
              console.error("AI Analysis failed", e);
          } finally {
              setAnalyzing(false);
          }
      };
      fetchAI();
  }, [asset.symbol]);

  // Watchlist State with Safe Fallback
  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0] || { id: 'default', name: 'My Watchlist', symbols: [] };
  const isWatching = activeWatchlist.symbols.includes(asset.symbol);

  const handleCreateWatchlist = (e: React.FormEvent) => {
      e.preventDefault();
      if (newWatchlistName.trim()) {
          createWatchlist(newWatchlistName.trim());
          setNewWatchlistName('');
          setIsCreatingWatchlist(false);
          setIsWatchlistMenuOpen(false);
      }
  };

  // Mock Ownership Data (Simply Wall St Feature)
  const ownershipData = [
      { name: 'General Public', value: 45, color: '#3b82f6' },
      { name: 'Institutions', value: 35, color: '#6366f1' },
      { name: 'Individual Insiders', value: 15, color: '#f59e0b' },
      { name: 'Government/State', value: 5, color: '#64748b' },
  ];

  const insiderTrades = [
      { date: '2023-10-15', name: 'Tim Cook', type: 'Sell', shares: '511,000', value: '$87.8M', impact: 'High' },
      { date: '2023-09-22', name: 'Katherine Adams', type: 'Sell', shares: '23,000', value: '$4.1M', impact: 'Medium' },
      { date: '2023-08-05', name: 'Luca Maestri', type: 'Buy', shares: '5,000', value: '$0.9M', impact: 'Low' },
  ];

  // Mock Price History Data (simulated based on current price)
  const priceHistoryData = Array.from({ length: 30 }, (_, i) => {
      const day = 30 - i;
      // Random walk around current price
      const volatility = asset.assetType === 'Crypto' ? 0.05 : 0.02;
      const randomFactor = 1 + (Math.random() * volatility - volatility / 2);
      const price = asset.currentPrice * (1 - (day * 0.005)) * randomFactor;
      return {
          date: `Day -${day}`,
          price: parseFloat(price.toFixed(2))
      };
  });

  // Mock Balance Sheet Data
  const financialData = asset.financials || [];

  // Filter News
  const relevantNews = MOCK_NEWS.filter(n => 
    n.relatedSymbols.includes(asset.symbol) || n.relatedSymbols.length === 0
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-10">
        <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input 
                type="text"
                placeholder="Search ticker, company, or ETF..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                {searchResults.map(res => (
                    <button 
                        key={res.id}
                        onClick={() => {
                            viewStock(res.symbol);
                            setSearchTerm('');
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700 text-left transition-colors"
                    >
                        <div>
                            <div className="font-bold text-white">{res.symbol}</div>
                            <div className="text-xs text-slate-400">{res.name}</div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-slate-900 rounded text-slate-300">{res.assetType}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Main Content for Selected Asset */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Snowflake, Score, and Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-1 h-fit sticky top-4 space-y-6">
            <div>
                <div className="flex items-center gap-4 mb-6">
                    {asset.logoUrl ? (
                        <img src={asset.logoUrl} alt={asset.symbol} className="w-16 h-16 rounded-lg bg-white p-1" />
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500">{asset.symbol[0]}</div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-white">{asset.symbol}</h1>
                        <div className="text-slate-400">{asset.name}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mb-6 p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-end mb-2">
                         <div className="text-xs text-slate-500">Current Price</div>
                         <div className="text-2xl font-bold text-white">${asset.currentPrice.toLocaleString()}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => openAddAssetModal(asset.symbol)}
                            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-3 py-2.5 rounded-lg transition-colors shadow-lg shadow-brand-600/20"
                        >
                            <Plus className="w-4 h-4" /> Add to Portfolio
                        </button>
                        <button 
                            onClick={() => toggleWatchlist(asset.symbol)}
                            className={`flex items-center justify-center gap-2 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors border ${
                                isWatching 
                                ? 'bg-slate-800 text-emerald-400 border-emerald-500/30 hover:bg-slate-700' 
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            {isWatching ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {isWatching ? 'Unwatch' : 'Watch'}
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-sm font-bold text-white mb-4 text-center uppercase tracking-wider">Health Analysis</h3>
                    <SnowflakeChart data={asset.snowflake} height={250} />
                    <div className="text-center mt-4">
                        <div className="text-4xl font-bold text-brand-400">{asset.snowflake.total}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Total Score / 25</div>
                    </div>
                </div>
            </div>

            {/* Watchlist Preview Section */}
            <div className="border-t border-slate-800 pt-6">
                 {/* Watchlist Switcher/Creator */}
                 <div className="relative mb-4">
                    <button 
                        onClick={() => setIsWatchlistMenuOpen(!isWatchlistMenuOpen)}
                        className="w-full flex items-center justify-between text-sm font-bold text-white hover:text-brand-400 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <List className="w-4 h-4 text-brand-500" />
                            {activeWatchlist.name}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-normal">{activeWatchlist.symbols.length} Items</span>
                            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isWatchlistMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {isWatchlistMenuOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                            <div className="p-1 space-y-1">
                                {watchlists.map(w => (
                                    <button 
                                        key={w.id}
                                        onClick={() => {
                                            switchWatchlist(w.id);
                                            setIsWatchlistMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                                            activeWatchlistId === w.id 
                                            ? 'bg-brand-600/10 text-brand-400' 
                                            : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        <span>{w.name}</span>
                                        {activeWatchlistId === w.id && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                            <div className="border-t border-slate-800 p-2 bg-slate-950">
                                {isCreatingWatchlist ? (
                                    <form onSubmit={handleCreateWatchlist} className="flex flex-col gap-2">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-brand-500 outline-none"
                                            placeholder="Watchlist Name"
                                            value={newWatchlistName}
                                            onChange={(e) => setNewWatchlistName(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-1 rounded">Create</button>
                                            <button type="button" onClick={() => setIsCreatingWatchlist(false)} className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <button 
                                        onClick={() => setIsCreatingWatchlist(true)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <PlusCircle className="w-3 h-3" /> Create Watchlist
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                 </div>

                 <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                     {activeWatchlist.symbols.map(sym => {
                         const item = MOCK_MARKET_ASSETS.find(m => m.symbol === sym);
                         if (!item) return null;
                         return (
                             <div key={sym} onClick={() => viewStock(sym)} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                                 <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded bg-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-800">
                                         {sym[0]}
                                     </div>
                                     <span className={`text-sm font-bold ${sym === asset.symbol ? 'text-brand-400' : 'text-slate-300 group-hover:text-white'}`}>{sym}</span>
                                 </div>
                                 <span className="text-xs text-slate-400">${item.currentPrice}</span>
                             </div>
                         );
                     })}
                     {activeWatchlist.symbols.length === 0 && (
                         <div className="text-center text-xs text-slate-600 py-4 italic">
                             Your watchlist is empty.
                         </div>
                     )}
                 </div>
            </div>
        </div>

        {/* Right Column: Details, DCF, Risks */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Price History Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Price History (30D)
                    </h3>
                    <div className="flex gap-2">
                         {['1W', '1M', '3M', '1Y', '5Y'].map(tf => (
                             <button key={tf} className={`px-2 py-1 text-xs font-bold rounded ${tf === '1M' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>
                                 {tf}
                             </button>
                         ))}
                    </div>
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={priceHistoryData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis hide dataKey="date" />
                            <YAxis 
                                domain={['auto', 'auto']} 
                                stroke="#64748b" 
                                fontSize={11} 
                                tickFormatter={(val) => `$${val}`} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                            />
                            <Area type="monotone" dataKey="price" stroke="#10b981" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Financial Health (SimplyWall.st feature) */}
            {financialData && financialData.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-brand-500" /> Financial Health (Balance Sheet)
                    </h3>
                    <div className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                             <RechartsBarChart data={financialData}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                 <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}B`} />
                                 <RechartsTooltip 
                                     cursor={{ fill: '#1e293b', opacity: 0.5 }}
                                     contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                 />
                                 <Legend />
                                 <Bar dataKey="assets" name="Assets" fill="#10b981" radius={[4, 4, 0, 0]} />
                                 <Bar dataKey="liabilities" name="Liabilities" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                 <Bar dataKey="debt" name="Debt" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                             </RechartsBarChart>
                         </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center">Figures in Billions. Short term assets vs long term liabilities analysis.</p>
                </div>
            )}

             {/* Peer Comparison */}
            {asset.competitors && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-hidden">
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-brand-500" /> Peer Comparison
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-950 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Company</th>
                                    <th className="px-4 py-3 text-right">Mkt Cap</th>
                                    <th className="px-4 py-3 text-right">P/E Ratio</th>
                                    <th className="px-4 py-3 text-right">Yield</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Rev Growth</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                <tr className="bg-brand-900/10">
                                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-500"></div> {asset.symbol}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-300">-</td>
                                    <td className="px-4 py-3 text-right font-bold text-white">24.5x</td>
                                    <td className="px-4 py-3 text-right text-emerald-400">{asset.dividendYield}%</td>
                                    <td className="px-4 py-3 text-right text-emerald-400">8.4%</td>
                                </tr>
                                {asset.competitors.map(comp => (
                                    <tr key={comp.symbol} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-300">{comp.symbol}</td>
                                        <td className="px-4 py-3 text-right text-slate-400">{comp.marketCap}</td>
                                        <td className="px-4 py-3 text-right text-slate-300">{comp.peRatio}x</td>
                                        <td className="px-4 py-3 text-right text-slate-300">{comp.dividendYield}%</td>
                                        <td className={`px-4 py-3 text-right ${comp.revenueGrowth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {comp.revenueGrowth > 0 ? '+' : ''}{comp.revenueGrowth}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Valuation Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-500" /> Valuation (DCF)
                </h3>
                
                <div className="relative pt-8 pb-4 px-4">
                    {/* Progress Bar Background */}
                    <div className="h-4 bg-slate-800 rounded-full w-full relative">
                        {/* Fair Value Marker */}
                        <div className="absolute top-0 h-full w-1 bg-white z-10 left-[60%] shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                             <div className="absolute bottom-full mb-2 -translate-x-1/2 text-xs font-bold text-white bg-slate-700 px-2 py-1 rounded border border-slate-600 whitespace-nowrap">
                                Fair Value: ${(asset.currentPrice * 1.2).toFixed(2)}
                             </div>
                        </div>
                        
                        {/* Current Price Marker (Animated) */}
                        <div className="absolute top-0 h-full w-1 bg-brand-500 z-20 left-[45%]">
                             <div className="absolute top-full mt-2 -translate-x-1/2 text-xs font-bold text-brand-400 whitespace-nowrap">
                                Current: ${asset.currentPrice}
                             </div>
                        </div>

                         {/* Zones */}
                         <div className="absolute top-0 left-0 h-full w-[40%] bg-emerald-500/20 rounded-l-full"></div>
                         <div className="absolute top-0 left-[40%] h-full w-[40%] bg-slate-700/20"></div>
                         <div className="absolute top-0 left-[80%] h-full w-[20%] bg-red-500/20 rounded-r-full"></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-8">
                        <span>Undervalued</span>
                        <span>About Right</span>
                        <span>Overvalued</span>
                    </div>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                    {asset.symbol} is trading approximately <span className="text-emerald-400 font-bold">20% below</span> our estimate of its fair value based on Discounted Cash Flow analysis.
                </p>
            </div>

            {/* Risk Analysis (AI Powered) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-brand-500" /> Risk & Rewards
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-brand-400 bg-brand-400/10 px-2 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" /> AI Generated
                    </div>
                </div>

                {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
                        <p className="text-slate-500 text-sm">Analyzing latest financial reports...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Strengths</h4>
                            {aiRisks?.strengths && aiRisks.strengths.length > 0 ? (
                                aiRisks.strengths.map((str, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg animate-fade-in">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-300">{str}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500 italic">No specific strengths detected.</div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Risks</h4>
                            {aiRisks?.risks && aiRisks.risks.length > 0 ? (
                                aiRisks.risks.map((risk, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg animate-fade-in">
                                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-300">{risk}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500 italic">No major risks detected.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Simply Wall St Style: Ownership & Insider Trading */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-500" /> Ownership
                    </h3>
                    <div className="h-[200px] relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ownershipData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {ownershipData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <div className="text-xs text-slate-500">Institutions</div>
                                <div className="text-xl font-bold text-white">35%</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {ownershipData.map(d => (
                            <div key={d.name} className="flex items-center gap-1 text-[10px] text-slate-400">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-brand-500" /> Insider Trading
                    </h3>
                    <div className="space-y-3">
                        {insiderTrades.map((trade, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                <div>
                                    <div className="font-bold text-sm text-white">{trade.name}</div>
                                    <div className="text-xs text-slate-500">{trade.date}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${trade.type === 'Buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {trade.type}
                                    </div>
                                    <div className="text-xs text-slate-300">{trade.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-4 p-3 bg-brand-500/10 rounded-lg flex items-start gap-2">
                        <Lock className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Insiders have sold more shares than they bought in the last 3 months.
                        </p>
                    </div>
                </div>
            </div>

            {/* News & Sentiment Feed (Yahoo Finance / Getquin style) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-brand-500" /> News & Sentiment
                </h3>
                <div className="space-y-4">
                    {relevantNews.length > 0 ? (
                        relevantNews.map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.source}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                        <span className="text-xs text-slate-500">{item.date}</span>
                                    </div>
                                    <h4 className="text-white font-bold text-base hover:text-brand-400 cursor-pointer transition-colors">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-3">
                                        {item.relatedSymbols.map(sym => (
                                            <span key={sym} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">${sym}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 sm:border-l border-slate-800 sm:pl-4">
                                     <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border w-24 text-center ${
                                         item.sentiment === 'Positive' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                         item.sentiment === 'Negative' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                         'bg-slate-800 border-slate-700 text-slate-400'
                                     }`}>
                                         {item.sentiment === 'Positive' ? <ThumbsUp className="w-4 h-4" /> : 
                                          item.sentiment === 'Negative' ? <ThumbsDown className="w-4 h-4" /> : 
                                          <Scale className="w-4 h-4" />}
                                         <span className="text-[10px] font-bold">{item.sentiment}</span>
                                     </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 italic">No recent news found for {asset.symbol}.</div>
                    )}
                </div>
            </div>

            {/* Company Profile (AI Powered) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-500" /> Profile
                    </h3>
                    {!analyzing && (
                        <span className="text-[10px] text-slate-600 uppercase">Last Updated: Today</span>
                    )}
                </div>
               
                {analyzing ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-800 rounded w-4/6"></div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 leading-relaxed animate-fade-in">
                        {aiProfile || `${asset.name} operates in the ${asset.sector} sector.`}
                    </p>
                )}

                <div className="mt-4 flex gap-2">
                     <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">Sector: {asset.sector}</span>
                     <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">Country: {asset.country}</span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ResearchView;
