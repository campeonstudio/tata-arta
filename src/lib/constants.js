// ============================================================
// TATA ARTA — Constants
// ============================================================

export const DEFAULT_BUDGET_GROUPS = [
  {
    id: 'needs',
    label: 'Needs',
    description: 'Essential expenses you must pay',
    percentage: 50,
    color: '#8B7355',
    categories: [
      { id: 'housing', label: 'Housing', icon: '🏠' },
      { id: 'food', label: 'Food & Groceries', icon: '🛒' },
      { id: 'transport', label: 'Transportation', icon: '🚌' },
      { id: 'health', label: 'Health', icon: '💊' },
      { id: 'utilities', label: 'Utilities', icon: '💡' },
    ],
  },
  {
    id: 'wants',
    label: 'Wants',
    description: 'Things you enjoy but could live without',
    percentage: 30,
    color: '#6B8CAE',
    categories: [
      { id: 'dining', label: 'Dining Out', icon: '🍜' },
      { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
      { id: 'shopping', label: 'Shopping', icon: '🛍️' },
      { id: 'hobbies', label: 'Hobbies', icon: '🎸' },
      { id: 'subscriptions', label: 'Subscriptions', icon: '📱' },
    ],
  },
  {
    id: 'savings',
    label: 'Savings & Debt',
    description: 'Building your future & clearing obligations',
    percentage: 20,
    color: '#7A9E7E',
    categories: [
      { id: 'emergency', label: 'Emergency Fund', icon: '🛡️' },
      { id: 'investment', label: 'Investments', icon: '📈' },
      { id: 'debt', label: 'Debt Payments', icon: '💳' },
      { id: 'goals', label: 'Goals', icon: '🎯' },
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

export const WALLET_TYPES = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank', label: 'Bank Account', icon: '🏦' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📲' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
]

export const WALLET_COLORS = [
  '#8B7355', '#6B8CAE', '#7A9E7E', '#B07A6E',
  '#8E7AB5', '#C4956A', '#5B8FA8', '#9E7A9E',
]

export const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense', icon: '↑' },
  { value: 'income', label: 'Income', icon: '↓' },
  { value: 'transfer', label: 'Transfer', icon: '⇄' },
  { value: 'savings', label: 'Savings', icon: '🏦' },
]

export const GOAL_PRESETS = [
  { id: 'emergency', label: 'Emergency Fund', icon: '🛡️' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'house', label: 'House / Property', icon: '🏠' },
  { id: 'car', label: 'Vehicle', icon: '🚗' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'retirement', label: 'Retirement', icon: '🌅' },
  { id: 'gadget', label: 'Gadget', icon: '💻' },
  { id: 'business', label: 'Business', icon: '💼' },
]
