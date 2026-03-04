export const accountRegions = [
  { id: 'all', label: 'All' },
  { id: 'usa', label: 'USA' },
  { id: 'india', label: 'India' },
  { id: 'uk', label: 'UK' },
  { id: 'germany', label: 'Germany' },
]

const ukBanks = []
const ukCreditCards = []
const ukAssets = []
const germanyBanks = []
const germanyCreditCards = []
const germanyAssets = []

const usaBanks = [
  { id: 'ub1', name: 'Chase Checking', source: 'Chase', balance: 12450, region: 'usa' },
  { id: 'ub2', name: 'Chase Savings', source: 'Chase', balance: 8200, region: 'usa' },
  { id: 'ub3', name: 'Apple Savings', source: 'Apple', balance: 5600, region: 'usa' },
]
const indiaBanks = [
  { id: 'ib1', name: 'HDFC Savings', source: 'HDFC', balance: 185000, region: 'india' },
  { id: 'ib2', name: 'ICICI Current', source: 'ICICI', balance: 42000, region: 'india' },
]

const usaCreditCards = [
  { id: 'ucc1', name: 'Chase Sapphire', source: 'Chase', limit: 10000, used: 2533, balanceDue: 2533, region: 'usa' },
  { id: 'ucc2', name: 'Apple Card', source: 'Apple', limit: 5000, used: 1200, balanceDue: 1200, region: 'usa' },
  { id: 'ucc3', name: 'Amex Blue', source: 'Amex', limit: 8000, used: 0, balanceDue: 0, region: 'usa' },
]
const indiaCreditCards = [
  { id: 'icc1', name: 'HDFC Regalia', source: 'HDFC', limit: 300000, used: 45000, balanceDue: 45000, region: 'india' },
  { id: 'icc2', name: 'ICICI Amazon', source: 'ICICI', limit: 150000, used: 28000, balanceDue: 28000, region: 'india' },
]

const usaAssets = [
  { id: 'ua1', name: 'Brokerage', source: 'Fidelity', value: 28500, region: 'usa' },
  { id: 'ua2', name: '401(k)', source: 'Employer', value: 42000, region: 'usa' },
]
const indiaAssets = [
  { id: 'ia1', name: 'PPF', source: 'Govt', value: 520000, region: 'india' },
  { id: 'ia2', name: 'Mutual funds', source: 'HDFC', value: 180000, region: 'india' },
]

function sum(items, key = 'balance') {
  return items.reduce((s, i) => s + (i[key] || 0), 0)
}

export const accountsByRegion = {
  all: {
    banks: [...usaBanks, ...indiaBanks, ...ukBanks, ...germanyBanks],
    creditCards: [...usaCreditCards, ...indiaCreditCards, ...ukCreditCards, ...germanyCreditCards],
    assets: [...usaAssets, ...indiaAssets, ...ukAssets, ...germanyAssets],
  },
  usa: { banks: usaBanks, creditCards: usaCreditCards, assets: usaAssets },
  india: { banks: indiaBanks, creditCards: indiaCreditCards, assets: indiaAssets },
  uk: { banks: ukBanks, creditCards: ukCreditCards, assets: ukAssets },
  germany: { banks: germanyBanks, creditCards: germanyCreditCards, assets: germanyAssets },
}

export function getAccountTotals(regionId) {
  const data = accountsByRegion[regionId] || accountsByRegion.all
  const totalInBank = sum(data.banks, 'balance')
  const totalLiabilities = sum(data.creditCards, 'balanceDue')
  const totalAssets = sum(data.assets, 'value') + totalInBank
  return {
    totalInBank,
    totalLiabilities,
    totalAssets,
    netWorth: totalAssets - totalLiabilities,
  }
}

export function banksBySource(regionId) {
  const data = accountsByRegion[regionId] || accountsByRegion.all
  const bySource = {}
  data.banks.forEach((b) => {
    bySource[b.source] = (bySource[b.source] || 0) + b.balance
  })
  return Object.entries(bySource).map(([source, balance]) => ({ source, balance }))
}

export function liabilitiesBySource(regionId) {
  const data = accountsByRegion[regionId] || accountsByRegion.all
  const bySource = {}
  data.creditCards.forEach((c) => {
    bySource[c.source] = (bySource[c.source] || 0) + c.balanceDue
  })
  return Object.entries(bySource).map(([source, balanceDue]) => ({ source, balanceDue }))
}

export function assetsBySource(regionId) {
  const data = accountsByRegion[regionId] || accountsByRegion.all
  const bySource = {}
  data.assets.forEach((a) => {
    bySource[a.source] = (bySource[a.source] || 0) + a.value
  })
  data.banks.forEach((b) => {
    bySource[b.source] = (bySource[b.source] || 0) + b.balance
  })
  return Object.entries(bySource).map(([source, value]) => ({ source, value }))
}
