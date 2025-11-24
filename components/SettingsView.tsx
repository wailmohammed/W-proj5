
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { User, Shield, CreditCard, LogOut, CheckCircle, Copy, Check, X, Loader2, Link as LinkIcon, Plus, RefreshCw, FileSpreadsheet, UploadCloud, Briefcase, Layers, Network, Eye, Edit2, Globe, Database, AlertCircle } from 'lucide-react';
import { PlanTier, CryptoWallet, PortfolioSummary } from '../types';

// --- HELPER COMPONENTS DEFINED FIRST TO AVOID INITIALIZATION ERRORS ---

const PaymentModal: React.FC<{
    planId: PlanTier;
    wallets: CryptoWallet[];
    price: number;
    onClose: () => void;
    onSuccess: (planId: PlanTier) => void;
}> = ({ planId, wallets, price, onClose, onSuccess }) => {
    const [selectedWallet, setSelectedWallet] = useState<string>(wallets[0]?.id || '');
    const [processing, setProcessing] = useState(false);

    const handlePayment = () => {
        setProcessing(true);
        setTimeout(() => {
            onSuccess(planId);
            setProcessing(false);
        }, 2000);
    };

    const wallet = wallets.find(w => w.id === selectedWallet);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Upgrade to {planId}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Total to Pay</div>
                        <div className="text-3xl font-bold text-white">${price} <span className="text-sm text-slate-500 font-normal">/ month</span></div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Payment Method</label>
                        <div className="space-y-2">
                            {wallets.length > 0 ? wallets.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => setSelectedWallet(w.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedWallet === w.id ? 'bg-brand-600/10 border-brand-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedWallet === w.id ? 'bg-brand-600 text-white' : 'bg-slate-800'}`}>
                                        {w.coin[0]}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">{w.coin}</div>
                                        <div className="text-xs opacity-70">{w.network}</div>
                                    </div>
                                    {selectedWallet === w.id && <CheckCircle className="w-5 h-5 text-brand-500 ml-auto" />}
                                </button>
                            )) : (
                                <div className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
                                    No payment methods available. Please contact admin.
                                </div>
                            )}
                        </div>
                    </div>

                    {wallet && (
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                            <div className="text-xs text-slate-500 mb-2">Send payment to address:</div>
                            <div className="font-mono text-xs text-white break-all bg-slate-900 p-2 rounded border border-slate-700 mb-2">
                                {wallet.address}
                            </div>
                            <div className="text-[10px] text-amber-400 flex items-center justify-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Only send {wallet.coin} ({wallet.network})
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={processing || !wallet}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {processing ? 'Verifying...' : 'I have made the payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConnectBrokerModal: React.FC<{
    provider: { id: string, name: string, type: string, logo: string },
    portfolios: PortfolioSummary[],
    onClose: () => void,
    onSuccess: (creds: any, config: { mode: 'new' | 'existing' | 'none', id?: string }) => Promise<void>,
    existingCredentials?: { apiKey: string, apiSecret?: string }
}> = ({ provider, portfolios, onClose, onSuccess, existingCredentials }) => {
    const [apiKey, setApiKey] = useState(existingCredentials?.apiKey || '');
    const [apiSecret, setApiSecret] = useState(existingCredentials?.apiSecret || '');
    const [connecting, setConnecting] = useState(false);
    
    const [connectionMethod, setConnectionMethod] = useState<'api' | 'oauth'>(
        (provider.type === 'Crypto' || existingCredentials) ? 'api' : 'oauth'
    );
    
    const [targetMode, setTargetMode] = useState<'new' | 'existing'>('new');
    const [existingPortfolioId, setExistingPortfolioId] = useState(portfolios[0]?.id || '');

    const isEditing = !!existingCredentials;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setConnecting(true);
        
        try {
            const config = isEditing 
                ? { mode: 'none' as const }
                : { mode: targetMode, id: existingPortfolioId };

            await onSuccess({ apiKey, apiSecret }, config);
        } catch (error) {
            console.error("Connection failed", error);
            alert("Failed to update connection. Please try again.");
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={provider.logo} alt={provider.name} className="w-8 h-8 rounded bg-white p-0.5 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                        <h3 className="text-xl font-bold text-white">{isEditing ? 'Update' : 'Connect'} {provider.name}</h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
                </div>

                <div className="px-6 pt-6 pb-0">
                    <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
                        <button 
                            type="button"
                            onClick={() => setConnectionMethod('oauth')}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${connectionMethod === 'oauth' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            OAuth 2.0
                        </button>
                        <button 
                            type="button"
                            onClick={() => setConnectionMethod('api')}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${connectionMethod === 'api' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            API Key
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {!isEditing && (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="target" checked={targetMode === 'new'} onChange={() => setTargetMode('new')} className="text-brand-600 focus:ring-brand-500" />
                                <span className="text-sm text-slate-300">Create new Portfolio</span>
                            </label>
                            <div className="border-t border-slate-800 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input type="radio" name="target" checked={targetMode === 'existing'} onChange={() => setTargetMode('existing')} className="text-brand-600 focus:ring-brand-500" />
                                    <span className="text-sm text-slate-300">Link to existing Portfolio</span>
                                </label>
                                {targetMode === 'existing' && (
                                    <select 
                                        value={existingPortfolioId}
                                        onChange={(e) => setExistingPortfolioId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-4 text-white focus:border-brand-500 outline-none appearance-none cursor-pointer text-sm"
                                    >
                                        {portfolios.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    {connectionMethod === 'api' ? (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">API Key</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-3 text-white focus:border-brand-500 outline-none text-sm font-mono"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter API Key"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">API Secret (Optional)</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-3 text-white focus:border-brand-500 outline-none text-sm font-mono"
                                    value={apiSecret}
                                    onChange={(e) => setApiSecret(e.target.value)}
                                    placeholder="Enter API Secret"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6 bg-slate-950 border border-slate-800 rounded-xl">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                <img src={provider.logo} alt={provider.name} className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                            </div>
                            <p className="text-slate-400 text-sm mb-4 px-4">
                                You will be redirected to {provider.name} to securely authorize access. We never see your password.
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={connecting}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {connecting ? 'Connecting...' : (isEditing ? 'Update Connection' : 'Connect Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const SettingsView: React.FC = () => {
  const { user, logout, plans, wallets, updateUserPlan, integrations, connectBroker, disconnectBroker, brokerProviders } = useAuth();
  const { addNewPortfolio, importPortfolio, marketDataApiKey, setMarketDataApiKey, syncBroker, portfolios, activePortfolioId } = usePortfolio();
  const [activeSection, setActiveSection] = useState<'profile' | 'billing' | 'security' | 'integrations'>('profile');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importTargetPortfolio, setImportTargetPortfolio] = useState(activePortfolioId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localApiKey, setLocalApiKey] = useState(marketDataApiKey || '');
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
      if (marketDataApiKey) {
          setLocalApiKey(marketDataApiKey);
      }
  }, [marketDataApiKey]);

  useEffect(() => {
      if(activePortfolioId) setImportTargetPortfolio(activePortfolioId);
  }, [activePortfolioId, showImportModal]);

  const activeProvider = brokerProviders.find(p => p.id === selectedProviderId);

  const handleConnectSuccess = async (
      providerId: string, 
      name: string, 
      type: string, 
      logo: string, 
      credentials: any, 
      targetPortfolioConfig: { mode: 'new' | 'existing' | 'none', id?: string }
  ) => {
      const performConnect = async () => {
          try {
              await connectBroker(providerId, name, type as any, logo, credentials);
              
              if (targetPortfolioConfig.mode === 'new') {
                  await addNewPortfolio(`${name} Portfolio`, type as any);
              }
          } catch (e) {
              console.error("Connection flow error:", e);
          }
      };

      // Increased timeout to 10s for better large dataset support
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 10000));
      
      await Promise.race([performConnect(), timeoutPromise]);
      
      setShowConnectModal(false);
  };

  const openEditModal = (integration: { providerId: string }) => {
      setSelectedProviderId(integration.providerId);
      setShowConnectModal(true);
  }

  const handleSaveMarketKey = () => {
      setSavingKey(true);
      try {
          setMarketDataApiKey(localApiKey);
          alert("API Key Saved Successfully!");
      } catch (e) {
          console.error("Failed to save API Key", e);
      } finally {
          setSavingKey(false);
      }
  };

  const handleSync = async (brokerId: string) => {
      setSyncing(prev => ({ ...prev, [brokerId]: true }));
      await syncBroker(brokerId);
      setSyncing(prev => ({ ...prev, [brokerId]: false }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setImportFile(e.target.files[0]);
      }
  };

  const parseCSV = (text: string) => {
        const lines = text.split(/\r\n|\n/);
        if (lines.length < 2) return [];
        
        // Improved Header Normalization for Trading 212 specific format
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]+/g, '').replace(/^\ufeff/, ''));
        const data = [];
        
        console.log("CSV Headers:", headers);

        // Robust Column Mapping - PRIORITIZE TICKER OVER ISIN
        // Identify indexes
        let symIdx = -1;
        // Explicit Priority: Ticker > Symbol > Instrument > ISIN
        if (headers.includes('ticker')) symIdx = headers.indexOf('ticker');
        else if (headers.includes('symbol')) symIdx = headers.indexOf('symbol');
        else if (headers.includes('instrument')) symIdx = headers.indexOf('instrument');
        else if (headers.includes('isin')) symIdx = headers.indexOf('isin');

        // Find Name column
        const nameIdx = headers.indexOf('name');

        // Other columns
        let qtyIdx = headers.findIndex(h => h === 'no. of shares' || h === 'quantity' || h === 'shares' || h === 'qty');
        let priceIdx = headers.findIndex(h => h === 'price / share' || h === 'price' || h === 'avg price' || h === 'cost');
        let typeIdx = headers.findIndex(h => h === 'action' || h === 'type' || h === 'side');
        let dateIdx = headers.findIndex(h => h === 'time' || h === 'date');

        if (symIdx === -1 || qtyIdx === -1 || priceIdx === -1) {
            alert("Error: Missing required columns. Please ensure your CSV has 'Ticker', 'No. of shares', and 'Price / share' headers.");
            return [];
        }

        for(let i=1; i<lines.length; i++) {
            if(!lines[i].trim()) continue;
            
            // Regex split to handle commas inside quotes (common in T212 names)
            const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            
            if (row.length < 3) continue;
            
            const rawSymbol = row[symIdx];
            const rawName = nameIdx > -1 ? row[nameIdx] : '';
            const rawQty = row[qtyIdx];
            const rawPrice = row[priceIdx];
            const rawType = typeIdx > -1 ? row[typeIdx] : 'BUY';
            const rawDate = dateIdx > -1 ? row[dateIdx] : new Date().toISOString();

            // Skip lines without essential data
            if (!rawSymbol || !rawQty || !rawPrice) continue;

            // Skip Dividends/Deposits/Withdrawals/Conversions to prevent skewing share counts
            const lowerType = rawType.toLowerCase();
            if (lowerType.includes('dividend') || lowerType.includes('deposit') || lowerType.includes('withdrawal') || lowerType.includes('conversion')) {
                continue;
            }

            const cleanNumber = (str: string) => {
                if (!str) return 0;
                // Support T212 formats like "1,234.56" or "1234.56"
                // Remove currency symbols or commas
                return parseFloat(str.replace(/[^0-9.-]+/g, ''));
            };

            const shares = cleanNumber(rawQty);
            const price = cleanNumber(rawPrice);
            
            if (isNaN(shares) || isNaN(price)) continue;

            // Handle T212 "Market sell" / "Limit sell"
            let type: 'BUY' | 'SELL' = 'BUY';
            if (lowerType.includes('sell')) type = 'SELL';
            
            // Fix date parsing for formats like "2025-09-01 11:58:10"
            let date = new Date().toISOString().split('T')[0];
            try {
                const parsedDate = new Date(rawDate);
                if (!isNaN(parsedDate.getTime())) {
                    date = parsedDate.toISOString().split('T')[0];
                }
            } catch (e) {}

            // Normalize Ticker (remove _US_EQ suffix if present)
            let symbol = rawSymbol.toUpperCase();
            // Common T212 suffix removal
            if (symbol.endsWith('_US_EQ')) symbol = symbol.replace('_US_EQ', '');
            else if (symbol.endsWith('_UK_EQ')) symbol = symbol.replace('_UK_EQ', '');
            else if (symbol.includes('_')) symbol = symbol.split('_')[0];

            data.push({
                symbol,
                name: rawName || symbol, // Capture name if available
                date,
                type,
                shares,
                price
            });
        }
        return data;
  };

  const handleImport = () => {
      if (!importFile) return;
      setIsImporting(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target?.result as string;
          const transactions = parseCSV(text);
          
          if (transactions.length > 0) {
              await importPortfolio(`Imported ${new Date().toLocaleDateString()}`, transactions, importTargetPortfolio);
              setShowImportModal(false);
              setImportFile(null);
          } else {
              alert("No valid transactions found in file. Please check headers.");
          }
          setIsImporting(false);
      };
      reader.readAsText(importFile);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="space-y-2">
            <button 
                onClick={() => setActiveSection('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
                <User className="w-5 h-5" /> Profile
            </button>
            <button 
                onClick={() => setActiveSection('integrations')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === 'integrations' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
                <LinkIcon className="w-5 h-5" /> Integrations
            </button>
            <button 
                onClick={() => setActiveSection('billing')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === 'billing' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
                <CreditCard className="w-5 h-5" /> Subscription
            </button>
            <button 
                onClick={() => setActiveSection('security')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === 'security' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
                <Shield className="w-5 h-5" /> Security
            </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
            {/* PROFILE SECTION */}
            {activeSection === 'profile' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Profile Details</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-3xl font-bold text-white">
                            {user?.name[0]}
                        </div>
                        <div>
                            <button className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg border border-slate-700 transition-colors">
                                Change Avatar
                            </button>
                            <div className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size 800K</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                            <input type="text" defaultValue={user?.name} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                            <input type="email" defaultValue={user?.email} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" disabled />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* INTEGRATIONS SECTION */}
            {activeSection === 'integrations' && (
                <div className="space-y-8">
                     {/* Market Data Configuration */}
                     <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 mb-6 flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-500" /> Market Data Configuration
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-emerald-500" />
                                        <span className="font-bold text-white text-sm">Free Market Data</span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${marketDataApiKey ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                        {marketDataApiKey ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mb-3">
                                    We use <strong>CoinGecko</strong> for real-time crypto prices. For Stocks & ETFs, please provide a free API key below to enable real-time updates.
                                </p>
                                
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">Finnhub API Key (Stocks)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="password" 
                                            value={localApiKey}
                                            onChange={(e) => setLocalApiKey(e.target.value)}
                                            placeholder="Enter your Finnhub.io API Key"
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 outline-none"
                                        />
                                        <button 
                                            onClick={handleSaveMarketKey}
                                            disabled={savingKey}
                                            className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold px-4 rounded-lg transition-colors disabled:opacity-50 min-w-[80px]"
                                        >
                                            {savingKey ? (
                                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                            ) : (
                                                'Save'
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        Don't have a key? <a href="https://finnhub.io/register" target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">Get a free one here</a>.
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* Connected Integrations */}
                     <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 mb-6 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" /> Connected Brokerages
                        </h2>
                        {integrations.length > 0 ? (
                            <div className="space-y-4">
                                {integrations.map(integration => (
                                    <div key={integration.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            {integration.logo ? (
                                                <img src={integration.logo} alt={integration.name} className="w-10 h-10 rounded-lg bg-white p-1 object-contain" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700">
                                                    <FileSpreadsheet className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-white">{integration.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${integration.status === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    {integration.status}
                                                    <span className="text-slate-600">•</span>
                                                    Last synced: {integration.lastSync}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleSync(integration.id)}
                                                className="p-2 text-slate-400 hover:text-brand-400 transition-colors" 
                                                title="Sync Now"
                                                disabled={syncing[integration.id]}
                                            >
                                                <RefreshCw className={`w-4 h-4 ${syncing[integration.id] ? 'animate-spin text-brand-500' : ''}`} />
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(integration)}
                                                className="p-2 text-slate-400 hover:text-brand-400 transition-colors" 
                                                title="Edit Credentials"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => disconnectBroker(integration.id)}
                                                className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No brokerage accounts connected yet. Connect one below to sync your portfolio automatically.
                            </div>
                        )}
                     </div>

                     {/* Available Providers */}
                     <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-brand-500" /> Connect New Account
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Manual Import Card */}
                            <button 
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-4 p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-brand-500/50">
                                    <FileSpreadsheet className="w-6 h-6 text-slate-400 group-hover:text-brand-500 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-white group-hover:text-brand-400 transition-colors">Manual Import</div>
                                    <div className="text-xs text-slate-500">CSV / Excel Upload</div>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                    Import
                                </div>
                            </button>

                            {/* API Providers from Context */}
                            {brokerProviders.filter(p => p.isEnabled && !integrations.find(i => i.providerId === p.id)).map(provider => (
                                <button 
                                    key={provider.id}
                                    onClick={() => {
                                        setSelectedProviderId(provider.id);
                                        setShowConnectModal(true);
                                    }}
                                    className="flex items-center gap-4 p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group text-left"
                                >
                                    <img src={provider.logo} alt={provider.name} className="w-12 h-12 rounded-lg bg-white p-1 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                                    <div className="flex-1">
                                        <div className="font-bold text-white group-hover:text-brand-400 transition-colors">{provider.name}</div>
                                        <div className="text-xs text-slate-500">{provider.type}</div>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                        Connect
                                    </div>
                                </button>
                            ))}
                        </div>
                     </div>
                </div>
            )}

            {/* SECURITY SECTION */}
            {activeSection === 'security' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Security</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                            <input type="password" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">New Password</label>
                            <input type="password" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                        <button className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                            Update Password
                        </button>
                        <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Sign out of all devices
                        </button>
                    </div>
                </div>
            )}

            {/* BILLING SECTION */}
            {activeSection === 'billing' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex justify-between items-center">
                        <div>
                            <div className="text-sm text-slate-400">Current Plan</div>
                            <div className="text-2xl font-bold text-white flex items-center gap-2">
                                {user?.plan} Tier
                                {user?.plan !== 'Free' && <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">Active</span>}
                            </div>
                            {user?.plan === 'Free' ? (
                                <div className="text-sm text-slate-500 mt-1">Upgrade to unlock advanced analytics and automatic syncing.</div>
                            ) : (
                                <div className="text-sm text-emerald-400 mt-1">Next billing date: Oct 24, 2023</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <div key={plan.id} className={`relative bg-slate-900 border rounded-xl p-6 flex flex-col transition-all ${user?.plan === plan.id ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-slate-800 hover:border-slate-600'}`}>
                                {plan.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
                                <div className="mb-4 text-center border-b border-slate-800 pb-4">
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                                    <div className="flex items-end justify-center gap-1 mt-3">
                                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                                        <span className="text-slate-500 mb-1">/mo</span>
                                    </div>
                                </div>
                                
                                {/* Limits Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        <Briefcase className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-white">{plan.limits.portfolios === -1 ? '∞' : plan.limits.portfolios}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Ports</div>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        <Layers className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-white">{plan.limits.holdings === -1 ? '∞' : plan.limits.holdings}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Holds</div>
                                    </div>
                                     <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        <Network className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-white">{plan.limits.connections === -1 ? '∞' : plan.limits.connections}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Conns</div>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        <Eye className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-white">{plan.limits.watchlists === -1 ? '∞' : plan.limits.watchlists}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Watch</div>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <CheckCircle className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                                            <span className="leading-tight text-xs">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    disabled={user?.plan === plan.id}
                                    onClick={() => {
                                        setSelectedPlan(plan.id);
                                        setShowPaymentModal(true);
                                    }}
                                    className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${user?.plan === plan.id ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
                                >
                                    {user?.plan === plan.id ? 'Current Plan' : 'Upgrade'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Connect Broker Modal */}
        {showConnectModal && activeProvider && (
            <ConnectBrokerModal 
                provider={activeProvider}
                portfolios={portfolios}
                onClose={() => setShowConnectModal(false)}
                onSuccess={(credentials, config) => handleConnectSuccess(
                    activeProvider.id, 
                    activeProvider.name, 
                    activeProvider.type, 
                    activeProvider.logo,
                    credentials,
                    config
                )}
                existingCredentials={integrations.find(i => i.providerId === activeProvider.id)?.apiCredentials}
            />
        )}

        {/* Import Modal */}
        {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-600/20 p-2 rounded-lg">
                                <FileSpreadsheet className="w-6 h-6 text-brand-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Import Portfolio Data</h3>
                        </div>
                        <button onClick={() => { setShowImportModal(false); setImportFile(null); }}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
                    </div>
                    
                    <div className="p-8">
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Portfolio</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <select 
                                    value={importTargetPortfolio}
                                    onChange={(e) => setImportTargetPortfolio(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-brand-500 outline-none appearance-none cursor-pointer"
                                >
                                    {portfolios.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group ${importFile ? 'border-brand-500 bg-brand-500/5' : 'border-slate-700 hover:border-brand-500 bg-slate-950/50'}`}>
                            {importFile ? (
                                <>
                                    <FileSpreadsheet className="w-16 h-16 text-brand-500 mb-4" />
                                    <p className="text-lg font-medium text-white mb-2">{importFile.name}</p>
                                    <p className="text-sm text-slate-500">{(importFile.size / 1024).toFixed(2)} KB</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-16 h-16 text-slate-600 group-hover:text-brand-500 mb-4 transition-colors" />
                                    <p className="text-lg font-medium text-white mb-2">Drop your CSV file here</p>
                                    <p className="text-sm text-slate-500 mb-6">or click to browse from your computer</p>
                                    <span className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">Select File</span>
                                </>
                            )}
                        </div>
                        <div className="mt-6 flex justify-between items-center text-xs text-slate-500">
                            <div>Supported format: .CSV (T212 Export)</div>
                            <button className="text-brand-400 hover:underline">Download Template</button>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                        <button onClick={() => { setShowImportModal(false); setImportFile(null); }} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                         <button onClick={handleImport} disabled={!importFile || isImporting} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                            {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isImporting ? 'Importing...' : 'Import Data'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showPaymentModal && selectedPlan && (
            <PaymentModal 
                planId={selectedPlan} 
                wallets={wallets.filter(w => w.isEnabled)}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={(planId) => {
                    updateUserPlan(planId);
                    setShowPaymentModal(false);
                    setActiveSection('billing');
                }}
                price={plans.find(p => p.id === selectedPlan)?.price || 0}
            />
        )}
      </div>
    </div>
  );
};

export default SettingsView;
