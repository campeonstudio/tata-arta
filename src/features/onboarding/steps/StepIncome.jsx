import { useState } from 'react'
import { useOnboarding } from '../OnboardingContext'
import { CYCLE_OPTIONS, CURRENCY_OPTIONS } from '@/lib/constants'
import styles from './Steps.module.css'

export default function StepIncome() {
  const { data, updateData, nextStep } = useOnboarding()
  const [income, setIncome] = useState(data.income)
  const [currency, setCurrency] = useState(data.currency)
  const [cycle, setCycle] = useState(data.cycle)

  const selectedCurrency = CURRENCY_OPTIONS.find(c => c.value === currency)

  const handleNext = () => {
    if (!income || isNaN(income) || Number(income) <= 0) return
    updateData({ income: Number(income), currency, cycle })
    nextStep()
  }

  return (
    <div className={styles.step}>
      <div className={styles.header}>
        <h2 className={styles.title}>What's your income?</h2>
        <p className={styles.subtitle}>
          We'll use this to calculate your budget allocations. You can always update this later.
        </p>
      </div>

      <div className={`card ${styles.card}`}>
        {/* Currency selector */}
        <div className="input-group">
          <label className="input-label">Currency</label>
          <select
            className="select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Income amount */}
        <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
          <label className="input-label">Amount</label>
          <div className="input-prefix">
            <span className="prefix-symbol">{selectedCurrency?.symbol}</span>
            <input
              className="input"
              type="number"
              placeholder="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Cycle */}
        <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
          <label className="input-label">Pay Cycle</label>
          <div className={styles.cycleGrid}>
            {CYCLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.cycleBtn} ${cycle === opt.value ? styles.cycleBtnActive : ''}`}
                onClick={() => setCycle(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {income && Number(income) > 0 && (
          <div className={`card-inset ${styles.preview}`}>
            <p className={styles.previewLabel}>Your {cycle === 'monthly' ? 'monthly' : cycle === 'biweekly' ? 'bi-weekly' : cycle === 'weekly' ? 'weekly' : 'custom'} budget</p>
            <p className={styles.previewAmount}>
              {selectedCurrency?.symbol}{Number(income).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleNext}
          disabled={!income || Number(income) <= 0}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
