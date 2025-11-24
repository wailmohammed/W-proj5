
import React, { useState, useMemo } from 'react';
import { Info, CheckCircle2, TrendingUp, ShieldCheck, AlertOctagon, ZapOff, XCircle, Calendar as CalendarIcon, BarChart3, Clock, Sliders, RefreshCw, AlertTriangle, Wallet, BarChart2, ArrowDownUp, ArrowUp, ArrowDown, Droplets, ListFilter, LayoutGrid } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell, BarChart } from 'recharts';
import DividendCalendar, { CalendarDividend } from './DividendCalendar';
import { usePortfolio } from '../context/PortfolioContext';

const InfoTooltip = ({ content }: { content: string }) => (
  <div className="group relative flex items-center justify-center ml-1.5">
    <Info className="w-3.5 h-3.5 text-slate-500 hover:text-brand-400 cursor-help transition-colors" />
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-800 text-xs text-slate-300 rounded-lg shadow-xl border border-slate-700 z-50 whitespace-normal text-left leading-relaxed">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

const getSafetyGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-400/10', border: 'border-emerald-200 dark:border-emerald-400/20', label: 'Very Safe' };
    if (score >= 80) return { grade: 'B', color: 'text-emerald-500 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-300/10', border: 'border-emerald-100 dark:border-emerald-300/20', label: 'Safe' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-400/10', border: 'border-yellow-200 dark:border-yellow-400/20', label: 'Borderline' };
    if (score >= 40) return { grade: 'D', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-400/10', border: 'border-orange-200 dark:border-orange-400/20', label: 'Unsafe' };
    return { grade: 'F', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-400/10', border: 'border-red-200 dark:border-red-400/20', label: 'Very Unsafe' };
};

const getPayoutColor = (ratio: number, sector: string) => {
    const isReit = sector === 'Real Estate';
    const safeLimit = isReit ? 90 : 60;
    const warningLimit = isReit ? 100 : 90;
    if (ratio <= safeLimit) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20';
    if (ratio <= warningLimit) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
};

// Helper Component for Dividend Row (DRY)
const DividendRow: React.FC<{ payment: CalendarDividend, isCut: boolean }> = ({ payment, isCut }) => {
    const safety = getSafetyGrade(payment.safetyScore);
    const payoutStyle = getPayoutColor(payment.payoutRatio, payment.sector);
    const snowflakeScore = payment.snowflake?.total || 0;

    const getSnowflakeStyle = (score: number) => {
        if (score >= 20) return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/10 border-indigo-200 dark:border-indigo-400/20';
        if (score >= 15) return 'text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-400/10 border-brand-200 dark:border-brand-400/20';
        if (score >= 10) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20';
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
    };
    const snowflakeStyle = getSnowflakeStyle(snowflakeScore);
    
    return (
      <div className={`p-4 md:px-6 md:py-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${isCut ? 'opacity-50 grayscale' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Top Row on Mobile: Date + Symbol + Amount */}
              <div className="flex items-center justify-between w-full md:w-auto">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm shrink-0">
                          <span>DAY</span>
                          <span className="text-slate-900 dark:text-white text-xs md:text-sm">{payment.payDay}</span>
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{payment.symbol}</span>
                              {isCut && <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 rounded">CUT</span>}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[120px] md:max-w-none">{payment.name}</div>
                      </div>
                  </div>
                  {/* Amount shown here on mobile for visibility */}
                  <div className="text-right md:hidden">
                      <div className="text-[10px] text-slate-500 uppercase mb-0.5">Est. Pay</div>
                      <div className={`font-bold font-mono ${isCut ? 'text-red-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                          ${payment.amount}
                      </div>
                  </div>
              </div>

              {/* Bottom Row on Mobile / Right Side on Desktop: Metrics */}
              <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 w-full md:flex-1 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 md:border-0">
                  
                  <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                      <div className="text-left md:text-center min-w-[60px]">
                          <div className="text-[10px] text-slate-500 uppercase mb-1 hidden md:block">Payout</div>
                          <div className="text-[10px] text-slate-500 uppercase mb-0.5 md:hidden">Payout</div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${payoutStyle}`}>
                              {payment.payoutRatio}%
                          </span>
                      </div>
                      
                      <div className="text-left md:text-center min-w-[60px]">
                          <div className="text-[10px] text-slate-500 uppercase mb-1 hidden md:block">Safety</div>
                          <div className="text-[10px] text-slate-500 uppercase mb-0.5 md:hidden">Safety</div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${safety.color} ${safety.bg} ${safety.border}`}>
                              {payment.safetyScore}/100
                          </span>
                      </div>

                      <div className="text-left md:text-center min-w-[60px]">
                          <div className="text-[10px] text-slate-500 uppercase mb-1 hidden md:block">Health</div>
                          <div className="text-[10px] text-slate-500 uppercase mb-0.5 md:hidden">Health</div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${snowflakeStyle}`}>
                              {snowflakeScore}/25
                          </span>
                      </div>
                  </div>

                  {/* Desktop Amount */}
                  <div className="hidden md:block text-right pl-4 border-l border-slate-100 dark:border-slate-800 min-w-[80px]">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Amount</div>
                      <div className={`font-bold font-mono ${isCut ? 'text-red-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                          ${payment.amount}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
};

const DividendsView: React.FC = () => {
  const { activePortfolio } = usePortfolio();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [recessionMode, setRecessionMode] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'yield' | 'safety'>('date');
  
  // Projection State
  const [projectedCagr, setProjectedCagr] = useState(7); // Annual Dividend Growth Rate
  const [reinvestMode, setReinvestMode] = useState(true); // DRIP Toggle

  const holdings = activePortfolio.holdings;

  // Memoized Calculations to prevent re-runs
  const dividendData = useMemo(() => {
      const alerts = holdings
        .filter(h => h.dividendYield > 0 && h.safetyScore < 50)
        .map(h => ({
            id: h.id,
            symbol: h.symbol,
            type: 'danger',
            message: `DIVIDEND CUT ANNOUNCED: ${h.symbol} has announced a suspension of its dividend due to cash flow constraints. Safety Score: ${h.safetyScore}/100.`
        }));

      // Prepare data for dividend view
      const raw: CalendarDividend[] = holdings
        .filter(h => h.dividendYield > 0)
        .map(h => {
            const annualIncome = h.shares * h.currentPrice * (h.dividendYield / 100);
            const deterministicDay = (h.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 28) + 1;
            
            const paymentGroup = h.symbol.charCodeAt(0) % 3;
            const paymentMonths = [0, 1, 2, 3].map(i => i * 3 + paymentGroup);

            let basePayout = 0;
            if (h.sector === 'Real Estate') basePayout = 85;
            else if (h.sector === 'Technology') basePayout = 25;
            else if (h.sector === 'Energy') basePayout = 45;
            else basePayout = 50;

            const variance = (h.symbol.charCodeAt(0) % 20) - 10; 
            const payoutRatio = Math.max(0, Math.min(150, basePayout + variance));

            return {
                ...h,
                amount: (annualIncome / 4).toFixed(2),
                payDay: deterministicDay, 
                payDayStr: deterministicDay.toString(),
                payoutRatio,
                paymentMonths
            };
        });
        
      return { alerts, raw };
  }, [holdings]);

  const { alerts: dividendAlerts, raw: rawDividends } = dividendData;

  // --- Group Dividends by Month for List View (Date Sort) ---
  const monthsList = useMemo(() => {
      const currentMonthIndex = new Date().getMonth();
      return Array.from({ length: 12 }, (_, i) => {
          const monthIndex = (currentMonthIndex + i) % 12;
          const monthName = new Date(2023, monthIndex, 1).toLocaleString('default', { month: 'long' });
          const yearOffset = (currentMonthIndex + i) >= 12 ? 1 : 0;
          const year = new Date().getFullYear() + yearOffset;
          
          // Find dividends paying in this month index
          const payments = rawDividends
              .filter(d => d.paymentMonths.includes(monthIndex))
              .sort((a, b) => a.payDay - b.payDay);
          
          const totalIncome = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

          return {
              name: monthName,
              year,
              payments,
              totalIncome
          };
      });
  }, [rawDividends]);

  // --- Flat Sorted List for other Sort Modes ---
  const sortedDividends = useMemo(() => {
      const data = [...rawDividends];
      if (sortBy === 'amount') return data.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
      if (sortBy === 'yield') return data.sort((a, b) => b.dividendYield - a.dividendYield);
      if (sortBy === 'safety') return data.sort((a, b) => b.safetyScore - a.safetyScore);
      return data; 
  }, [rawDividends, sortBy]);

  // --- Income Calculations ---
  const incomeStats = useMemo(() => {
      let projectedIncome = 0;
      rawDividends.forEach(h => {
          const annual = parseFloat(h.amount) * 4;
          if (h.safetyScore >= 80) projectedIncome += annual;
          else if (h.safetyScore >= 60) projectedIncome += annual * 0.75;
          else if (h.safetyScore >= 40) projectedIncome += annual * 0.50;
          else projectedIncome += 0;
      });

      const currentAnnualIncome = rawDividends.reduce((acc, curr) => acc + (parseFloat(curr.amount) * 4), 0);
      const stressedIncome = projectedIncome;
      const riskExposure = currentAnnualIncome - stressedIncome;
      const portfolioYield = activePortfolio.totalValue > 0 ? (currentAnnualIncome / activePortfolio.totalValue) : 0;

      return { currentAnnualIncome, stressedIncome, riskExposure, portfolioYield };
  }, [rawDividends, activePortfolio.totalValue]);

  const { currentAnnualIncome, stressedIncome, riskExposure, portfolioYield } = incomeStats;

  // --- Long Term Projection Data ---
  const longTermProjectionData = useMemo(() => {
      const projectionYears = [1, 3, 5, 10, 15, 20, 25, 30];
      const baseIncomeForProjection = recessionMode ? stressedIncome : currentAnnualIncome;
      
      return projectionYears.map(year => {
          const growthRate = recessionMode ? projectedCagr * 0.5 : projectedCagr;
          const effectiveRate = (growthRate / 100) + (reinvestMode ? portfolioYield : 0);
          return {
              year: `Year ${year}`,
              income: Math.round(baseIncomeForProjection * Math.pow(1 + effectiveRate, year)),
          };
      });
  }, [recessionMode, stressedIncome, currentAnnualIncome, projectedCagr, reinvestMode, portfolioYield]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
        {/* Alert Banner for Dividend Cuts */}
        {dividendAlerts.length > 0 && (
            <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 animate-fade-in-up">
                <div className="flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Portfolio Alert: Dividend Cuts</h4>
                        <div className="mt-1 space-y-1">
                            {dividendAlerts.map(alert => (
                                <div key={alert.id} className="text-xs text-slate-600 dark:text-slate-300">
                                    {alert.message}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Dividends</h1>
            <div className="flex flex-wrap gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                    <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">Analysis</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                    <CalendarIcon className="w-4 h-4" /> <span className="hidden sm:inline">Calendar</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Simply Safe Dividends Feature: Income Stress Test */}
        <div className={`border rounded-xl p-6 relative overflow-hidden transition-all duration-500 ${recessionMode ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${recessionMode ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                        {recessionMode ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6 text-brand-500" />}
                        {recessionMode ? 'Recession Simulation Active' : 'Income Stress Test'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {recessionMode ? 'Simulating a severe market downturn. Dividends from low-quality stocks are cut.' : 'Simulate a severe recession to see your portfolio\'s "Safe Income Floor".'}
                    </p>
                </div>
                <button 
                    onClick={() => setRecessionMode(!recessionMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 w-full md:w-auto justify-center ${
                        recessionMode 
                        ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    {recessionMode ? <ZapOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {recessionMode ? 'Deactivate Mode' : 'Simulate Recession'}
                </button>
            </div>

            <div className="relative pt-4 pb-2">
                <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    <span>Projected Cut: <span className="text-red-500">-${Math.round(riskExposure).toLocaleString()}</span></span>
                    <span>Safe Income: <span className="text-emerald-500">${Math.round(stressedIncome).toLocaleString()}</span></span>
                </div>
                <div className="w-full h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-700">
                    {/* Safe Portion */}
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
                        style={{ width: currentAnnualIncome > 0 ? `${(stressedIncome / currentAnnualIncome) * 100}%` : '0%' }}
                    ></div>
                    {/* Risk Portion */}
                    <div 
                        className={`h-full bg-red-500 transition-all duration-700 ease-out ${recessionMode ? 'opacity-100' : 'opacity-30'}`} 
                        style={{ width: currentAnnualIncome > 0 ? `${(riskExposure / currentAnnualIncome) * 100}%` : '0%' }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Forecasting & History Section - Only show in list mode */}
        {viewMode === 'list' && (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Forecast Stats Small */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <TrendingUp className="w-32 h-32 text-brand-500" />
                    </div>
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">Next 12 Months</h3>
                        <div className="mb-6">
                            <div className={`text-4xl font-bold tracking-tight transition-colors duration-500 ${recessionMode ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                ${Math.round(recessionMode ? stressedIncome : currentAnnualIncome).toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                {recessionMode ? 'Recession Scenario Income' : 'Projected Annual Income'}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Yield on Cost</span>
                                <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400">
                                    {(activePortfolio.totalValue > 0 ? (currentAnnualIncome / activePortfolio.totalValue * 1.2) * 100 : 0).toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Current Yield</span>
                                <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">
                                    {(activePortfolio.totalValue > 0 ? (currentAnnualIncome / activePortfolio.totalValue) * 100 : 0).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Future Income Engine */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-brand-500" /> Passive Income Forecaster
                            </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 w-full md:w-auto">
                            <div className="flex items-center gap-2 px-2 w-full sm:w-auto justify-between">
                                <div className="flex items-center gap-1">
                                    <Sliders className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Growth: {projectedCagr}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="15" 
                                    step="0.5" 
                                    value={projectedCagr} 
                                    onChange={(e) => setProjectedCagr(parseFloat(e.target.value))}
                                    className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                />
                            </div>
                            <div className="hidden sm:block w-px h-6 bg-slate-300 dark:bg-slate-800"></div>
                            <button 
                                onClick={() => setReinvestMode(!reinvestMode)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md border transition-all text-xs font-bold ${reinvestMode ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                {reinvestMode ? <RefreshCw className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                                {reinvestMode ? 'DRIP On' : 'DRIP Off'}
                            </button>
                        </div>
                     </div>
                     
                     <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={longTermProjectionData}>
                                <CartesianGrid strokeDasharray="3 3" strokeDashoffset={2} vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#1e293b', opacity: 0.5 }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Projected Income']}
                                />
                                <Bar dataKey="income" fill={recessionMode ? '#ef4444' : '#6366f1'} radius={[4, 4, 0, 0]}>
                                    {longTermProjectionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fillOpacity={0.5 + (index / longTermProjectionData.length) * 0.5} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>

            {/* List Header & Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ListFilter className="w-5 h-5 text-emerald-500" /> Income Breakdown
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="text-slate-500">Sort by:</span>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <option value="date">📅 Payment Date</option>
                        <option value="amount">💰 Amount (High to Low)</option>
                        <option value="yield">% Yield (High to Low)</option>
                        <option value="safety">🛡️ Safety Score</option>
                    </select>
                </div>
            </div>

            {/* Dividends List Content */}
            <div className="space-y-6">
                {/* DATE SORT: Grouped by Month */}
                {sortBy === 'date' ? (
                    monthsList.map((monthData, index) => {
                        if (monthData.payments.length === 0) return null;
                        
                        return (
                            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm animate-fade-in">
                                {/* Month Header */}
                                <div className="bg-slate-50 dark:bg-slate-950/50 px-4 md:px-6 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase">
                                            {monthData.name.substring(0, 3)}
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">{monthData.name} {monthData.year}</h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Est. Income</div>
                                        <div className="text-emerald-500 font-bold font-mono text-base md:text-lg">${monthData.totalIncome.toFixed(2)}</div>
                                    </div>
                                </div>

                                {/* Payments List */}
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {monthData.payments.map(payment => {
                                        const isCut = recessionMode && payment.safetyScore < 60;
                                        return <DividendRow key={`${payment.id}-${monthData.name}`} payment={payment} isCut={isCut} />;
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* OTHER SORTS: Flat List */
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm animate-fade-in">
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {sortedDividends.map(payment => {
                                const isCut = recessionMode && payment.safetyScore < 60;
                                return <DividendRow key={payment.id} payment={payment} isCut={isCut} />;
                            })}
                        </div>
                    </div>
                )}
                
                {rawDividends.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
                        <Droplets className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Dividends Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Add dividend-paying stocks to your portfolio to see your income schedule.</p>
                    </div>
                )}
            </div>
        </>
        )}

        {viewMode === 'calendar' && (
             <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-sm">
                <div className="min-w-[600px]">
                    <DividendCalendar dividends={rawDividends} />
                </div>
             </div>
        )}
    </div>
  );
};

export default DividendsView;
