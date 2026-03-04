export const goalCategories = [
  { id: 'emergency', label: 'Emergency fund' },
  { id: 'vacation', label: 'Vacation' },
  { id: 'house', label: 'House / Down payment' },
  { id: 'retirement', label: 'Retirement' },
  { id: 'education', label: 'Education' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'other', label: 'Other' },
]

export const goalCurrencies = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'INR', label: 'Indian Rupee', symbol: 'Rs' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
]

export const defaultGoals = [
  { id: 'g1', name: 'Emergency fund', targetAmount: 10000, currency: 'USD', savedAmount: 4200, deadline: '2026-12-31', category: 'emergency' },
  { id: 'g2', name: 'Europe trip', targetAmount: 3500, currency: 'USD', savedAmount: 1200, deadline: '2026-06-30', category: 'vacation' },
  { id: 'g3', name: 'Down payment', targetAmount: 50000, currency: 'USD', savedAmount: 8500, deadline: '2027-12-31', category: 'house' },
  { id: 'g4', name: 'Child education', targetAmount: 5000000, currency: 'INR', savedAmount: 1200000, deadline: '2035-06-01', category: 'education' },
]

export const GOALS_STORAGE_KEY = 'financial-app-goals'
