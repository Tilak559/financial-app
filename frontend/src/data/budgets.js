const monthlyBudgetDataUSA = [
  { month: "Nov '25", income: 8200, expenses: 7100 },
  { month: "Dec '25", income: 9500, expenses: 8100 },
  { month: "Jan", income: 10200, expenses: 7800 },
  { month: "Feb", income: 10180.41, expenses: 7836.42 },
]

const monthlyBudgetDataIndia = [
  { month: "Nov '25", income: 185000, expenses: 142000 },
  { month: "Dec '25", income: 192000, expenses: 158000 },
  { month: "Jan", income: 210000, expenses: 165000 },
  { month: "Feb", income: 218000, expenses: 172500 },
]

export const monthlyBudgetData = monthlyBudgetDataUSA

const categoryBreakdownUSA = [
  { name: "Food & Dining", value: 1240, color: "rgba(34, 197, 94, 0.9)" },
  { name: "Transport", value: 980, color: "rgba(20, 184, 166, 0.9)" },
  { name: "Shopping", value: 1150, color: "rgba(251, 146, 60, 0.9)" },
  { name: "Utilities", value: 720, color: "rgba(234, 179, 8, 0.9)" },
  { name: "Rent", value: 2200, color: "rgba(139, 92, 246, 0.9)" },
  { name: "Entertainment", value: 546, color: "rgba(59, 130, 246, 0.9)" },
  { name: "Health", value: 400, color: "rgba(249, 115, 22, 0.9)" },
  { name: "Other", value: 600.42, color: "rgba(107, 114, 128, 0.9)" },
]

const categoryBreakdownIndia = [
  { name: "Food & Dining", value: 28000, color: "rgba(34, 197, 94, 0.9)" },
  { name: "Transport", value: 22000, color: "rgba(20, 184, 166, 0.9)" },
  { name: "Shopping", value: 25000, color: "rgba(251, 146, 60, 0.9)" },
  { name: "Utilities", value: 16500, color: "rgba(234, 179, 8, 0.9)" },
  { name: "Rent", value: 45000, color: "rgba(139, 92, 246, 0.9)" },
  { name: "Entertainment", value: 12000, color: "rgba(59, 130, 246, 0.9)" },
  { name: "Health", value: 9000, color: "rgba(249, 115, 22, 0.9)" },
  { name: "Other", value: 13500, color: "rgba(107, 114, 128, 0.9)" },
]

const monthlyBudgetDataUK = [
  { month: "Nov '25", income: 3200, expenses: 2800 },
  { month: "Dec '25", income: 3500, expenses: 2900 },
  { month: "Jan", income: 3800, expenses: 3100 },
  { month: "Feb", income: 3750, expenses: 3050 },
]
const categoryBreakdownUK = [
  { name: "Food & Dining", value: 420, color: "rgba(34, 197, 94, 0.9)" },
  { name: "Transport", value: 380, color: "rgba(20, 184, 166, 0.9)" },
  { name: "Shopping", value: 350, color: "rgba(251, 146, 60, 0.9)" },
  { name: "Utilities", value: 220, color: "rgba(234, 179, 8, 0.9)" },
  { name: "Rent", value: 900, color: "rgba(139, 92, 246, 0.9)" },
  { name: "Other", value: 430, color: "rgba(107, 114, 128, 0.9)" },
]

const monthlyBudgetDataGermany = [
  { month: "Nov '25", income: 3800, expenses: 3200 },
  { month: "Dec '25", income: 4100, expenses: 3400 },
  { month: "Jan", income: 4200, expenses: 3550 },
  { month: "Feb", income: 4350, expenses: 3680 },
]
const categoryBreakdownGermany = [
  { name: "Food & Dining", value: 520, color: "rgba(34, 197, 94, 0.9)" },
  { name: "Transport", value: 420, color: "rgba(20, 184, 166, 0.9)" },
  { name: "Shopping", value: 480, color: "rgba(251, 146, 60, 0.9)" },
  { name: "Utilities", value: 280, color: "rgba(234, 179, 8, 0.9)" },
  { name: "Rent", value: 1100, color: "rgba(139, 92, 246, 0.9)" },
  { name: "Other", value: 400, color: "rgba(107, 114, 128, 0.9)" },
]

export const categoryBreakdown = categoryBreakdownUSA

export const budgetRegions = [
  { id: 'all', label: 'All' },
  { id: 'usa', label: 'USA' },
  { id: 'india', label: 'India' },
  { id: 'uk', label: 'UK' },
  { id: 'germany', label: 'Germany' },
]

export const budgetsByRegion = {
  all: {
    monthlyData: monthlyBudgetDataUSA,
    categoryBreakdown: categoryBreakdownUSA,
    totalIncome: 10180.41,
    totalExpenses: 7836.42,
    totalBudget: 8500,
    netCashFlow: 2343.99,
    spentThisMonth: 7836,
  },
  usa: {
    monthlyData: monthlyBudgetDataUSA,
    categoryBreakdown: categoryBreakdownUSA,
    totalIncome: 10180.41,
    totalExpenses: 7836.42,
    totalBudget: 8500,
    netCashFlow: 2343.99,
    spentThisMonth: 7836,
  },
  india: {
    monthlyData: monthlyBudgetDataIndia,
    categoryBreakdown: categoryBreakdownIndia,
    totalIncome: 218000,
    totalExpenses: 172500,
    totalBudget: 180000,
    netCashFlow: 45500,
    spentThisMonth: 172500,
  },
  uk: {
    monthlyData: monthlyBudgetDataUK,
    categoryBreakdown: categoryBreakdownUK,
    totalIncome: 3750,
    totalExpenses: 3050,
    totalBudget: 3200,
    netCashFlow: 700,
    spentThisMonth: 3050,
  },
  germany: {
    monthlyData: monthlyBudgetDataGermany,
    categoryBreakdown: categoryBreakdownGermany,
    totalIncome: 4350,
    totalExpenses: 3680,
    totalBudget: 4000,
    netCashFlow: 670,
    spentThisMonth: 3680,
  },
}

export const netCashFlow = 2343.99
export const totalIncome = 10180.41
export const totalExpenses = 7836.42
export const totalBudget = 8500
export const spentThisMonth = 7836
