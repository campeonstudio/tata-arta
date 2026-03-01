// Default budget allocations (user can modify)
export const DEFAULT_BUDGET_GROUPS = [
  {
    id: 'needs',
    label: 'Needs',
    description: 'Essential expenses you must pay',
    percentage: 50,
    color: '#8B7355',
    categories: [
      { id: 'housing', label: 'Housing', subcategories: ['Rent', 'Mortgage', 'Utilities', 'Internet'] },
      { id: 'food', label: 'Food & Groceries', subcategories: ['Groceries', 'Work Meals'] },
      { id: 'transport', label: 'Transportation', subcategories: ['Fuel', 'Public Transit', 'Vehicle Maintenance'] },
      { id: 'health', label: 'Health', subcategories: ['Insurance', 'Medicine', 'Doctor Visits'] },
    ],
  },
  {
    id: 'wants',
    label: 'Wants',
    description: 'Things you enjoy but could live without',
    percentage: 30,
    color: '#6B8CAE',
    categories: [
      { id: 'dining', label: 'Dining Out', subcategories: ['Restaurants', 'Coffee', 'Delivery'] },
      { id: 'entertainment', label: 'Entertainment', subcategories: ['Streaming', 'Movies', 'Games', 'Events'] },
      { id: 'shopping', label: 'Shopping', subcategories: ['Clothes', 'Electronics', 'Home Decor'] },
      { id: 'hobbies', label: 'Hobbies', subcategories: [] },
    ],
  },
  {
    id: 'savings',
    label: 'Savings & Debt',
    description: 'Building your future & clearing obligations',
    percentage: 20,
    color: '#7A9E7E',
    categories: [
      { id: 'emergency', label: 'Emergency Fund', subcategories: [] },
      { id: 'investment', label: 'Investments', subcategories: ['Stocks', 'Mutual Funds', 'Crypto'] },
      { id: 'debt', label: 'Debt Payments', subcategories: ['Credit Card', 'Student Loan', 'Personal Loan'] },
      { id: 'goals', label: 'Goals', subcategories: [] },
    ],
  },
]

export const CYCLE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
]

export const CURRENCY_OPTIONS = [
  { value: 'IDR', label: 'IDR — Indonesian Rupiah', symbol: 'Rp' },
  { value: 'USD', label: 'USD — US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR — Euro', symbol: '€' },
  { value: 'SGD', label: 'SGD — Singapore Dollar', symbol: 'S$' },
]
