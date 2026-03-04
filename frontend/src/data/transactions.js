export const transactionTabs = [
  { id: 'banks', label: 'Banks & Cards' },
  { id: 'manual', label: 'Manual entry' },
  { id: 'combined', label: 'Combined' },
]

export const bankTransactions = [
  { id: 'b1', date: '2026-03-01', name: 'Interest', amount: 3.75, status: null, icon: 'interest' },
  { id: 'b2', date: '2026-03-01', name: 'Google One', amount: -14.29, status: 'Pending', icon: 'subscription' },
  { id: 'b3', date: '2026-02-28', name: 'Apple Card', amount: -2533.34, status: null, icon: 'card' },
  { id: 'b4', date: '2026-02-28', name: 'APPLE GS SAVINGS TRAN', amount: 4008.31, status: null, icon: 'transfer' },
  { id: 'b5', date: '2026-02-28', name: 'Kraken', amount: -200, status: null, icon: 'transfer' },
  { id: 'b6', date: '2026-02-27', name: 'ELEVATED EMP CR PAYR', amount: 200, status: null, icon: 'income' },
  { id: 'b7', date: '2026-02-27', name: 'Deposit', amount: 1000, status: null, icon: 'deposit' },
  { id: 'b8', date: '2026-02-26', name: 'Netflix', amount: -15.99, status: null, icon: 'subscription' },
  { id: 'b9', date: '2026-02-26', name: 'Electricity', amount: -120, status: null, icon: 'bill' },
  { id: 'b10', date: '2026-02-25', name: 'Grocery Store', amount: -85.42, status: null, icon: 'shopping' },
]

export const categories = [
  { id: 'income', label: 'Income', subcategories: [
    { id: 'salary', label: 'Salary' },
    { id: 'interest', label: 'Interest' },
    { id: 'other', label: 'Other income' },
  ]},
  { id: 'expense', label: 'Expense', subcategories: [
    { id: 'food', label: 'Food & Dining' },
    { id: 'transport', label: 'Transport' },
    { id: 'bills', label: 'Bills & Utilities' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'other', label: 'Other expense' },
  ]},
  { id: 'transfer', label: 'Transfer', subcategories: [
    { id: 'between', label: 'Between accounts' },
    { id: 'investment', label: 'To investment' },
    { id: 'other', label: 'Other transfer' },
  ]},
]

export const currencies = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
]

function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function groupByDate(transactions) {
  const byDate = {}
  for (const t of transactions) {
    const key = t.date
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(t)
  }
  const keys = Object.keys(byDate).sort((a, b) => parseDate(b).getTime() - parseDate(a).getTime())
  return keys.map((date) => ({ date, items: byDate[date] }))
}

export function filterByMonth(transactions, monthFilter) {
  if (!monthFilter || monthFilter === 'all') return transactions
  const [y, m] = monthFilter.split('-').map(Number)
  return transactions.filter((t) => {
    const [ty, tm] = t.date.split('-').map(Number)
    return ty === y && tm === m
  })
}
