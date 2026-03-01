// ============================================================
// TATA ARTA — Utility Functions
// ============================================================

import { CURRENCY_OPTIONS } from './constants'

/**
 * Format number as currency string
 */
export function formatCurrency(amount, currency = 'IDR') {
  const opt = CURRENCY_OPTIONS.find(c => c.value === currency)
  const symbol = opt?.symbol || 'Rp'
  const num = Number(amount) || 0

  if (currency === 'IDR') {
    // IDR: no decimals, use dot as thousand separator
    return `${symbol}${num.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
  }
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format date for display
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Format date short (e.g. "15 Mar")
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayString() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get period start/end dates based on budget settings
 * period_type: 'calendar' | 'paycycle'
 * pay_cycle_day: day of month gajian starts (e.g. 25)
 */
export function getPeriodDates(settings) {
  const now = new Date()
  const { period_type = 'calendar', pay_cycle_day = 1 } = settings || {}

  if (period_type === 'paycycle' && pay_cycle_day) {
    const day = parseInt(pay_cycle_day)
    let periodStart

    if (now.getDate() >= day) {
      // We're in the period that started this month
      periodStart = new Date(now.getFullYear(), now.getMonth(), day)
    } else {
      // We're before the start day, so period started last month
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, day)
    }

    const periodEnd = new Date(periodStart)
    periodEnd.setMonth(periodEnd.getMonth() + 1)
    periodEnd.setDate(periodEnd.getDate() - 1)

    return {
      start: periodStart.toISOString().split('T')[0],
      end: periodEnd.toISOString().split('T')[0],
    }
  }

  // Default: calendar month
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

/**
 * Get currency symbol from currency code
 */
export function getCurrencySymbol(currency = 'IDR') {
  const opt = CURRENCY_OPTIONS.find(c => c.value === currency)
  return opt?.symbol || 'Rp'
}

/**
 * Calculate percentage safely
 */
export function calcPercentage(value, total) {
  if (!total || total === 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

/**
 * Clamp number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
