export const regions = [
  { id: 'all', label: 'All' },
  { id: 'usa', label: 'USA' },
  { id: 'india', label: 'India' },
  { id: 'uk', label: 'UK' },
  { id: 'germany', label: 'Germany' },
]

const ukStocks = []
const ukCrypto = []
const ukEtfs = []
const ukMutualFunds = []
const germanyStocks = []
const germanyCrypto = []
const germanyEtfs = []
const germanyMutualFunds = []

const usaStocks = [
  { name: 'Apple Inc', symbol: 'AAPL', value: 4250, changePct: 2.4, quantity: 25 },
  { name: 'Microsoft Corp', symbol: 'MSFT', value: 6120, changePct: 1.8, quantity: 20 },
  { name: 'Amazon.com Inc', symbol: 'AMZN', value: 3180, changePct: -0.5, quantity: 24 },
  { name: 'Alphabet Inc', symbol: 'GOOGL', value: 2850, changePct: 1.2, quantity: 22 },
]
const usaCrypto = [
  { name: 'Bitcoin', symbol: 'BTC', value: 12500, changePct: 5.2, quantity: 0.25 },
  { name: 'Ethereum', symbol: 'ETH', value: 4200, changePct: 3.1, quantity: 1.2 },
]
const usaEtfs = [
  { name: 'SPDR S&P 500', symbol: 'SPY', value: 8500, changePct: 0.9, quantity: 18 },
  { name: 'Invesco QQQ', symbol: 'QQQ', value: 6200, changePct: 1.5, quantity: 15 },
]
const usaMutualFunds = [
  { name: 'Vanguard Total Stock Market', symbol: 'VTSAX', value: 11200, changePct: 1.1, quantity: 85 },
  { name: 'Fidelity 500 Index', symbol: 'FXAIX', value: 6800, changePct: 0.8, quantity: 42 },
]

const indiaStocks = [
  { name: 'Reliance Industries', symbol: 'RELIANCE', value: 18500, changePct: 1.2, quantity: 50 },
  { name: 'TCS', symbol: 'TCS', value: 12400, changePct: -0.3, quantity: 40 },
  { name: 'HDFC Bank', symbol: 'HDFCBANK', value: 9200, changePct: 2.1, quantity: 80 },
]
const indiaCrypto = [
  { name: 'Bitcoin', symbol: 'BTC', value: 8200, changePct: 5.2, quantity: 0.12 },
]
const indiaEtfs = [
  { name: 'Nifty 50 ETF', symbol: 'NIFTYBEES', value: 15600, changePct: 0.8, quantity: 100 },
  { name: 'Bank Nifty ETF', symbol: 'BANKBEES', value: 4200, changePct: -0.2, quantity: 30 },
]
const indiaMutualFunds = [
  { name: 'HDFC Top 100 Fund', symbol: 'HDFC100', value: 9500, changePct: 1.4, quantity: 380 },
  { name: 'ICICI Pru Bluechip', symbol: 'ICICIBLU', value: 6200, changePct: 0.6, quantity: 250 },
  { name: 'SBI Equity Hybrid', symbol: 'SBIHYB', value: 4100, changePct: -0.1, quantity: 180 },
]

export const investmentsByRegion = {
  all: {
    stocks: [...usaStocks, ...indiaStocks, ...ukStocks, ...germanyStocks],
    crypto: [...usaCrypto, ...indiaCrypto, ...ukCrypto, ...germanyCrypto],
    etfs: [...usaEtfs, ...indiaEtfs, ...ukEtfs, ...germanyEtfs],
    mutualFunds: [...usaMutualFunds, ...indiaMutualFunds, ...ukMutualFunds, ...germanyMutualFunds],
  },
  usa: { stocks: usaStocks, crypto: usaCrypto, etfs: usaEtfs, mutualFunds: usaMutualFunds },
  india: { stocks: indiaStocks, crypto: indiaCrypto, etfs: indiaEtfs, mutualFunds: indiaMutualFunds },
  uk: { stocks: ukStocks, crypto: ukCrypto, etfs: ukEtfs, mutualFunds: ukMutualFunds },
  germany: { stocks: germanyStocks, crypto: germanyCrypto, etfs: germanyEtfs, mutualFunds: germanyMutualFunds },
}

function sum(items) {
  return items.reduce((s, i) => s + i.value, 0)
}

export function getTotals(regionId) {
  const data = investmentsByRegion[regionId] || investmentsByRegion.all
  const stocksTotal = sum(data.stocks)
  const cryptoTotal = sum(data.crypto)
  const etfsTotal = sum(data.etfs)
  const mutualFundsTotal = sum(data.mutualFunds)
  const total = stocksTotal + cryptoTotal + etfsTotal + mutualFundsTotal
  const totalChange = total
    ? (data.stocks.reduce((s, i) => s + i.value * (i.changePct / 100), 0) +
        data.crypto.reduce((s, i) => s + i.value * (i.changePct / 100), 0) +
        data.etfs.reduce((s, i) => s + i.value * (i.changePct / 100), 0) +
        data.mutualFunds.reduce((s, i) => s + i.value * (i.changePct / 100), 0)) /
      total
    : 0
  return { total, stocksTotal, cryptoTotal, etfsTotal, mutualFundsTotal, totalChange }
}

export const totalValueHistory = {
  labels: ["Sep '25", "Oct '25", "Nov '25", "Dec '25", "Jan", "Feb"],
  series: [
    { name: "All", values: [138200, 141500, 145800, 148900, 151200, 153700] },
    { name: "USA", values: [58200, 59800, 61500, 63200, 64500, 65800] },
    { name: "India", values: [80000, 81800, 84300, 85800, 86900, 87900] },
    { name: "UK", values: [0, 0, 0, 0, 0, 0] },
    { name: "Germany", values: [0, 0, 0, 0, 0, 0] },
  ],
}
