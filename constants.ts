
import { AssetType, Portfolio, SocialPost, Holding, PortfolioSummary, Transaction, NewsItem, ManualAsset, Liability, BrokerProvider } from './types';

// Helper to generate consistent financials
const generateFinancials = () => [
    { year: '2020', assets: 323, liabilities: 258, equity: 65, debt: 112 },
    { year: '2021', assets: 351, liabilities: 287, equity: 64, debt: 124 },
    { year: '2022', assets: 352, liabilities: 302, equity: 50, debt: 120 },
    { year: '2023', assets: 380, liabilities: 315, equity: 65, debt: 110 },
];

const generateCompetitors = (symbol: string) => {
    if (symbol === 'AAPL') return [
        { symbol: 'MSFT', name: 'Microsoft', marketCap: '2.8T', peRatio: 35.2, dividendYield: 0.8, revenueGrowth: 12.4 },
        { symbol: 'GOOGL', name: 'Alphabet', marketCap: '1.7T', peRatio: 24.1, dividendYield: 0.0, revenueGrowth: 10.1 },
        { symbol: 'Samsung', name: 'Samsung Elec', marketCap: '350B', peRatio: 14.5, dividendYield: 2.1, revenueGrowth: -4.5 },
    ];
    if (symbol === 'O') return [
        { symbol: 'ADC', name: 'Agree Realty', marketCap: '6.2B', peRatio: 18.4, dividendYield: 4.9, revenueGrowth: 24.1 },
        { symbol: 'VICI', name: 'VICI Properties', marketCap: '32B', peRatio: 14.1, dividendYield: 5.8, revenueGrowth: 18.2 },
        { symbol: 'NNN', name: 'NNN REIT', marketCap: '7.5B', peRatio: 13.5, dividendYield: 5.6, revenueGrowth: 4.5 },
    ];
    return [
        { symbol: 'CMP1', name: 'Competitor A', marketCap: '50B', peRatio: 20.5, dividendYield: 2.5, revenueGrowth: 8.5 },
        { symbol: 'CMP2', name: 'Competitor B', marketCap: '35B', peRatio: 15.2, dividendYield: 3.1, revenueGrowth: 5.2 },
        { symbol: 'CMP3', name: 'Competitor C', marketCap: '12B', peRatio: 28.1, dividendYield: 0.5, revenueGrowth: 15.1 },
    ];
};

export const DEFAULT_BROKER_PROVIDERS: BrokerProvider[] = [
    { id: 'trading212', name: 'Trading 212', type: 'Stock', logo: 'https://logo.clearbit.com/trading212.com', isEnabled: true },
    { id: 'binance', name: 'Binance', type: 'Crypto', logo: 'https://logo.clearbit.com/binance.com', isEnabled: true },
    { id: 'ibkr', name: 'Interactive Brokers', type: 'Stock', logo: 'https://logo.clearbit.com/interactivebrokers.com', isEnabled: true },
    { id: 'coinbase', name: 'Coinbase', type: 'Crypto', logo: 'https://logo.clearbit.com/coinbase.com', isEnabled: true },
    { id: 'etoro', name: 'eToro', type: 'Mixed', logo: 'https://logo.clearbit.com/etoro.com', isEnabled: true },
    { id: 'kraken', name: 'Kraken', type: 'Crypto', logo: 'https://logo.clearbit.com/kraken.com', isEnabled: true },
    { id: 'robinhood', name: 'Robinhood', type: 'Stock', logo: 'https://logo.clearbit.com/robinhood.com', isEnabled: true },
    { id: 'fidelity', name: 'Fidelity', type: 'Stock', logo: 'https://logo.clearbit.com/fidelity.com', isEnabled: true },
];

export const MOCK_HOLDINGS: Holding[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 50,
    avgPrice: 150.00,
    currentPrice: 178.35,
    assetType: AssetType.STOCK,
    sector: 'Technology',
    country: 'USA',
    dividendYield: 0.55,
    expenseRatio: 0,
    safetyScore: 95,
    snowflake: { value: 3, future: 4, past: 5, health: 5, dividend: 2, total: 19 },
    targetAllocation: 25,
    logoUrl: 'https://logo.clearbit.com/apple.com',
    financials: generateFinancials(),
    competitors: generateCompetitors('AAPL')
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 30,
    avgPrice: 280.00,
    currentPrice: 335.20,
    assetType: AssetType.STOCK,
    sector: 'Technology',
    country: 'USA',
    dividendYield: 0.88,
    expenseRatio: 0,
    safetyScore: 99,
    snowflake: { value: 2, future: 5, past: 5, health: 5, dividend: 3, total: 20 },
    targetAllocation: 20,
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    financials: generateFinancials(),
    competitors: generateCompetitors('MSFT')
  },
  {
    id: '3',
    symbol: 'O',
    name: 'Realty Income',
    shares: 100,
    avgPrice: 58.50,
    currentPrice: 54.10,
    assetType: AssetType.STOCK,
    sector: 'Real Estate',
    country: 'USA',
    dividendYield: 5.65,
    expenseRatio: 0,
    safetyScore: 80,
    snowflake: { value: 4, future: 2, past: 3, health: 3, dividend: 5, total: 17 },
    targetAllocation: 15,
    logoUrl: 'https://logo.clearbit.com/realtyincome.com',
    financials: generateFinancials(),
    competitors: generateCompetitors('O')
  },
  {
    id: '4',
    symbol: 'SCHD',
    name: 'Schwab US Div. Equity ETF',
    shares: 200,
    avgPrice: 72.00,
    currentPrice: 76.45,
    assetType: AssetType.ETF,
    sector: 'Diversified',
    country: 'USA',
    dividendYield: 3.5,
    expenseRatio: 0.06,
    safetyScore: 90,
    snowflake: { value: 4, future: 3, past: 4, health: 5, dividend: 4, total: 20 },
    targetAllocation: 25,
  },
  {
    id: '5',
    symbol: 'BTC',
    name: 'Bitcoin',
    shares: 0.25,
    avgPrice: 45000,
    currentPrice: 62000,
    assetType: AssetType.CRYPTO,
    sector: 'Digital Assets',
    country: 'Global',
    dividendYield: 0,
    expenseRatio: 0,
    safetyScore: 40,
    snowflake: { value: 1, future: 5, past: 5, health: 3, dividend: 0, total: 14 },
    targetAllocation: 5,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png'
  },
  {
    id: '6',
    symbol: 'SHEL',
    name: 'Shell PLC',
    shares: 150,
    avgPrice: 55.00,
    currentPrice: 68.50,
    assetType: AssetType.STOCK,
    sector: 'Energy',
    country: 'UK',
    dividendYield: 3.8,
    expenseRatio: 0,
    safetyScore: 85,
    snowflake: { value: 4, future: 3, past: 3, health: 4, dividend: 4, total: 18 },
    targetAllocation: 5,
    logoUrl: 'https://logo.clearbit.com/shell.com',
    financials: generateFinancials()
  },
  {
    id: '7',
    symbol: 'ASML',
    name: 'ASML Holding',
    shares: 5,
    avgPrice: 600.00,
    currentPrice: 900.00,
    assetType: AssetType.STOCK,
    sector: 'Technology',
    country: 'Netherlands',
    dividendYield: 1.1,
    expenseRatio: 0,
    safetyScore: 88,
    snowflake: { value: 2, future: 5, past: 5, health: 5, dividend: 3, total: 20 },
    targetAllocation: 5,
    logoUrl: 'https://logo.clearbit.com/asml.com',
    financials: generateFinancials()
  },
  {
    id: '8',
    symbol: 'HIMX',
    name: 'Himax Technologies',
    shares: 400,
    avgPrice: 8.00,
    currentPrice: 5.50,
    assetType: AssetType.STOCK,
    sector: 'Technology',
    country: 'Taiwan',
    dividendYield: 9.5, // High yield
    expenseRatio: 0,
    safetyScore: 35, // Low safety to trigger alerts
    snowflake: { value: 5, future: 2, past: 1, health: 3, dividend: 5, total: 16 },
    targetAllocation: 5,
    logoUrl: 'https://logo.clearbit.com/himax.com.tw',
    financials: generateFinancials()
  }
];

// Expanded dataset for the "Market" / Screener
export const MOCK_MARKET_ASSETS: Holding[] = [
    ...MOCK_HOLDINGS,
    {
        id: '9', symbol: 'JPM', name: 'JPMorgan Chase', shares: 0, avgPrice: 0, currentPrice: 145.20, assetType: AssetType.STOCK, sector: 'Financial', country: 'USA', dividendYield: 2.9, expenseRatio: 0, safetyScore: 92, snowflake: { value: 4, future: 3, past: 4, health: 4, dividend: 4, total: 19 }, logoUrl: 'https://logo.clearbit.com/jpmorganchase.com', financials: generateFinancials(), competitors: generateCompetitors('JPM')
    },
    {
        id: '10', symbol: 'JNJ', name: 'Johnson & Johnson', shares: 0, avgPrice: 0, currentPrice: 155.00, assetType: AssetType.STOCK, sector: 'Healthcare', country: 'USA', dividendYield: 3.0, expenseRatio: 0, safetyScore: 99, snowflake: { value: 3, future: 2, past: 4, health: 5, dividend: 5, total: 19 }, logoUrl: 'https://logo.clearbit.com/jnj.com', financials: generateFinancials(), competitors: generateCompetitors('JNJ')
    },
    {
        id: '11', symbol: 'PG', name: 'Procter & Gamble', shares: 0, avgPrice: 0, currentPrice: 152.50, assetType: AssetType.STOCK, sector: 'Consumer Defensive', country: 'USA', dividendYield: 2.4, expenseRatio: 0, safetyScore: 99, snowflake: { value: 2, future: 3, past: 4, health: 5, dividend: 5, total: 19 }, logoUrl: 'https://logo.clearbit.com/pg.com', financials: generateFinancials(), competitors: generateCompetitors('PG')
    },
    {
        id: '12', symbol: 'TSLA', name: 'Tesla Inc.', shares: 0, avgPrice: 0, currentPrice: 240.00, assetType: AssetType.STOCK, sector: 'Consumer Cyclical', country: 'USA', dividendYield: 0, expenseRatio: 0, safetyScore: 45, snowflake: { value: 1, future: 5, past: 5, health: 4, dividend: 0, total: 15 }, logoUrl: 'https://logo.clearbit.com/tesla.com', financials: generateFinancials(), competitors: generateCompetitors('TSLA')
    },
    {
        id: '13', symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 0, avgPrice: 0, currentPrice: 135.00, assetType: AssetType.STOCK, sector: 'Technology', country: 'USA', dividendYield: 0, expenseRatio: 0, safetyScore: 60, snowflake: { value: 3, future: 4, past: 5, health: 5, dividend: 0, total: 17 }, logoUrl: 'https://logo.clearbit.com/google.com', financials: generateFinancials(), competitors: generateCompetitors('GOOGL')
    },
    {
        id: '14', symbol: 'KO', name: 'Coca-Cola Co', shares: 0, avgPrice: 0, currentPrice: 58.00, assetType: AssetType.STOCK, sector: 'Consumer Defensive', country: 'USA', dividendYield: 3.1, expenseRatio: 0, safetyScore: 90, snowflake: { value: 3, future: 2, past: 3, health: 4, dividend: 5, total: 17 }, logoUrl: 'https://logo.clearbit.com/coca-cola.com', financials: generateFinancials(), competitors: generateCompetitors('KO')
    },
    {
        id: '15', symbol: 'MAIN', name: 'Main Street Capital', shares: 0, avgPrice: 0, currentPrice: 41.50, assetType: AssetType.STOCK, sector: 'Financial', country: 'USA', dividendYield: 6.8, expenseRatio: 0, safetyScore: 75, snowflake: { value: 4, future: 3, past: 4, health: 3, dividend: 5, total: 19 }, logoUrl: 'https://logo.clearbit.com/mainst.com', financials: generateFinancials(), competitors: generateCompetitors('MAIN')
    },
    {
        id: '16', symbol: 'PEP', name: 'PepsiCo Inc.', shares: 0, avgPrice: 0, currentPrice: 168.00, assetType: AssetType.STOCK, sector: 'Consumer Defensive', country: 'USA', dividendYield: 2.8, expenseRatio: 0, safetyScore: 93, snowflake: { value: 3, future: 3, past: 4, health: 4, dividend: 5, total: 19 }, logoUrl: 'https://logo.clearbit.com/pepsico.com', financials: generateFinancials(), competitors: generateCompetitors('PEP')
    },
    {
        id: '17', symbol: 'V', name: 'Visa Inc.', shares: 0, avgPrice: 0, currentPrice: 245.00, assetType: AssetType.STOCK, sector: 'Financial', country: 'USA', dividendYield: 0.8, expenseRatio: 0, safetyScore: 98, snowflake: { value: 2, future: 5, past: 5, health: 5, dividend: 3, total: 20 }, logoUrl: 'https://logo.clearbit.com/visa.com', financials: generateFinancials(), competitors: generateCompetitors('V')
    },
    {
        id: '18', symbol: 'NVDA', name: 'NVIDIA Corp', shares: 0, avgPrice: 0, currentPrice: 460.00, assetType: AssetType.STOCK, sector: 'Technology', country: 'USA', dividendYield: 0.03, expenseRatio: 0, safetyScore: 50, snowflake: { value: 1, future: 5, past: 5, health: 5, dividend: 1, total: 17 }, logoUrl: 'https://logo.clearbit.com/nvidia.com', financials: generateFinancials(), competitors: generateCompetitors('NVDA')
    },
    {
        id: '19', symbol: 'ABBV', name: 'AbbVie Inc.', shares: 0, avgPrice: 0, currentPrice: 148.00, assetType: AssetType.STOCK, sector: 'Healthcare', country: 'USA', dividendYield: 4.0, expenseRatio: 0, safetyScore: 70, snowflake: { value: 4, future: 2, past: 4, health: 3, dividend: 4, total: 17 }, logoUrl: 'https://logo.clearbit.com/abbvie.com', financials: generateFinancials(), competitors: generateCompetitors('ABBV')
    },
    {
        id: '20', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 0, avgPrice: 0, currentPrice: 410.00, assetType: AssetType.ETF, sector: 'Diversified', country: 'USA', dividendYield: 1.5, expenseRatio: 0.03, safetyScore: 95, snowflake: { value: 3, future: 3, past: 3, health: 5, dividend: 3, total: 17 }, logoUrl: 'https://logo.clearbit.com/vanguard.com', financials: generateFinancials(), competitors: []
    },
    {
        id: '21', symbol: 'ARWK', name: 'Ark Innovation ETF', shares: 0, avgPrice: 0, currentPrice: 42.00, assetType: AssetType.ETF, sector: 'Technology', country: 'USA', dividendYield: 0, expenseRatio: 0.75, safetyScore: 30, snowflake: { value: 1, future: 5, past: 2, health: 4, dividend: 0, total: 12 }, logoUrl: 'https://logo.clearbit.com/ark-funds.com', financials: generateFinancials(), competitors: []
    },
    {
        id: '22', symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 0, avgPrice: 0, currentPrice: 145.00, assetType: AssetType.STOCK, sector: 'Consumer Cyclical', country: 'USA', dividendYield: 0, expenseRatio: 0, safetyScore: 75, snowflake: { value: 3, future: 5, past: 4, health: 4, dividend: 0, total: 16 }, logoUrl: 'https://logo.clearbit.com/amazon.com', financials: generateFinancials(), competitors: generateCompetitors('AMZN')
    },
    {
        id: '23', symbol: 'VUSA', name: 'Vanguard S&P 500 (Dist)', shares: 0, avgPrice: 0, currentPrice: 64.10, assetType: AssetType.ETF, sector: 'Diversified', country: 'UK', dividendYield: 1.45, expenseRatio: 0.07, safetyScore: 95, snowflake: { value: 3, future: 3, past: 3, health: 5, dividend: 3, total: 17 }, logoUrl: 'https://logo.clearbit.com/vanguard.co.uk', financials: generateFinancials(), competitors: []
    }
];

export const MOCK_NEWS: NewsItem[] = [
    { id: '1', title: 'Apple beats earnings expectations, announces buyback', source: 'Bloomberg', date: '2h ago', sentiment: 'Positive', url: '#', relatedSymbols: ['AAPL'] },
    { id: '2', title: 'Tech sector faces headwinds from rising rates', source: 'CNBC', date: '4h ago', sentiment: 'Negative', url: '#', relatedSymbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL'] },
    { id: '3', title: 'Realty Income raises monthly dividend again', source: 'Seeking Alpha', date: '1d ago', sentiment: 'Positive', url: '#', relatedSymbols: ['O'] },
    { id: '4', title: 'Microsoft integrates AI into Office suite', source: 'The Verge', date: '5h ago', sentiment: 'Positive', url: '#', relatedSymbols: ['MSFT'] },
    { id: '5', title: 'Oil prices stabilize amid geopolitical tensions', source: 'Reuters', date: '3h ago', sentiment: 'Neutral', url: '#', relatedSymbols: ['SHEL', 'XOM'] },
    { id: '6', title: 'Bitcoin surges past resistance levels', source: 'CoinDesk', date: '30m ago', sentiment: 'Positive', url: '#', relatedSymbols: ['BTC'] },
    { id: '7', title: 'Consumer spending data shows unexpected slowdown', source: 'WSJ', date: '6h ago', sentiment: 'Negative', url: '#', relatedSymbols: ['KO', 'PEP', 'PG'] },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-24', type: 'BUY', symbol: 'AAPL', shares: 10, price: 175.50, totalValue: 1755.00 },
  { id: 't2', date: '2023-10-15', type: 'BUY', symbol: 'MSFT', shares: 5, price: 330.00, totalValue: 1650.00 },
  { id: 't3', date: '2023-09-20', type: 'SELL', symbol: 'TSLA', shares: 2, price: 250.00, totalValue: 500.00 },
  { id: 't4', date: '2023-09-01', type: 'BUY', symbol: 'O', shares: 50, price: 56.00, totalValue: 2800.00 },
  { id: 't5', date: '2023-08-12', type: 'BUY', symbol: 'SCHD', shares: 100, price: 71.20, totalValue: 7120.00 },
  { id: 't6', date: '2023-07-05', type: 'BUY', symbol: 'BTC', shares: 0.1, price: 28000, totalValue: 2800.00 },
];

// New Mock Data for Kubera-style Assets & Liabilities
export const MOCK_MANUAL_ASSETS: ManualAsset[] = [
    { id: 'ma1', name: 'Primary Residence', type: 'Real Estate', value: 450000, currency: 'USD', purchaseDate: '2019-05-15', purchasePrice: 380000 },
    { id: 'ma2', name: 'Tesla Model 3', type: 'Vehicle', value: 32000, currency: 'USD', purchaseDate: '2022-01-10', purchasePrice: 48000 },
    { id: 'ma3', name: 'Vintage Watch Collection', type: 'Art/Collectibles', value: 15000, currency: 'USD' }
];

export const MOCK_LIABILITIES: Liability[] = [
    { id: 'l1', name: 'Home Mortgage', type: 'Mortgage', amount: 310000, interestRate: 3.5, monthlyPayment: 1850 },
    { id: 'l2', name: 'Car Loan', type: 'Loan', amount: 12000, interestRate: 4.9, monthlyPayment: 450 }
];

export const MOCK_PORTFOLIO: Portfolio = {
  id: 'p1',
  name: 'Main Growth & Income',
  totalValue: 0, // Calculated dynamically
  cashBalance: 5400.50,
  holdings: MOCK_HOLDINGS,
  transactions: MOCK_TRANSACTIONS,
  manualAssets: MOCK_MANUAL_ASSETS,
  liabilities: MOCK_LIABILITIES
};

export const MOCK_PORTFOLIOS_LIST: PortfolioSummary[] = [
  { id: 'p1', name: 'Main Growth & Income', type: 'Growth' },
  { id: 'p2', name: 'High Yield Portfolio', type: 'Income' },
  { id: 'p3', name: 'Crypto & Speculative', type: 'Speculative' },
];

export const MOCK_POSTS: SocialPost[] = [
  {
    id: '101',
    user: 'Sarah Jenkins',
    avatar: 'https://picsum.photos/50/50?random=1',
    content: 'Just increased my position in $O. The yield spread against the 10y treasury is looking very attractive historically. #dividendinvesting',
    timestamp: '2h ago',
    likes: 45,
    comments: 12,
    tickers: ['O']
  },
  {
    id: '102',
    user: 'TechBull_99',
    avatar: 'https://picsum.photos/50/50?random=2',
    content: 'Does anyone else think $AAPL is slightly overvalued at these levels compared to $MSFT? Looking at the PEG ratios.',
    timestamp: '5h ago',
    likes: 23,
    comments: 34,
    tickers: ['AAPL', 'MSFT']
  }
];

export const CHART_DATA_PERFORMANCE = [
  { name: 'Jan', portfolio: 10000, sp500: 10000 },
  { name: 'Feb', portfolio: 10500, sp500: 10200 },
  { name: 'Mar', portfolio: 10800, sp500: 10600 },
  { name: 'Apr', portfolio: 10400, sp500: 10100 },
  { name: 'May', portfolio: 11200, sp500: 10800 },
  { name: 'Jun', portfolio: 11800, sp500: 11200 },
  { name: 'Jul', portfolio: 12500, sp500: 11900 },
];

export const BENCHMARK_DATA = [
    { date: 'Jan', portfolio: 0, sp500: 0, nasdaq: 0 },
    { date: 'Feb', portfolio: 2.5, sp500: 1.8, nasdaq: 3.2 },
    { date: 'Mar', portfolio: 1.2, sp500: 2.4, nasdaq: 4.1 },
    { date: 'Apr', portfolio: 4.5, sp500: 3.1, nasdaq: 5.5 },
    { date: 'May', portfolio: 5.8, sp500: 3.9, nasdaq: 7.2 },
    { date: 'Jun', portfolio: 4.2, sp500: 4.8, nasdaq: 8.9 },
    { date: 'Jul', portfolio: 8.5, sp500: 6.2, nasdaq: 10.4 },
    { date: 'Aug', portfolio: 9.1, sp500: 7.1, nasdaq: 11.2 },
    { date: 'Sep', portfolio: 7.8, sp500: 6.5, nasdaq: 9.8 },
    { date: 'Oct', portfolio: 12.4, sp500: 8.2, nasdaq: 13.5 },
];

export const DIVIDEND_MONTHLY_DATA = [
  { name: 'Jan', income: 120 },
  { name: 'Feb', income: 45 },
  { name: 'Mar', income: 180 },
  { name: 'Apr', income: 125 },
  { name: 'May', income: 50 },
  { name: 'Jun', income: 195 },
];
