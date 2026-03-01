import { useState } from 'react'
import { useOnboarding } from '../OnboardingContext'
import { DEFAULT_BUDGET_GROUPS } from '@/lib/constants'
import styles from './Steps.module.css'

export default function StepBudget() {
  const { data, updateData, nextStep, prevStep } = useOnboarding()
  const [groups, setGroups] = useState(data.budgetGroups)

  const total = groups.reduce((sum, g) => sum + Number(g.percentage), 0)
  const isValid = total === 100

  const updatePercentage = (id, value) => {
    const num = Math.max(0, Math.min(100, Number(value) || 0))
    setGroups(prev => prev.map(g => g.id === id ? { ...g, percentage: num } : g))
  }

  const resetToDefault = () => {
    setGroups(DEFAULT_BUDGET_GROUPS)
  }

  const handleNext = () => {
    if (!isValid) return
    updateData({ budgetGroups: groups })
    nextStep()
  }

  const currencySymbol = data.currency === 'IDR' ? 'Rp'
    : data.currency === 'USD' ? '$'
    : data.currency === 'EUR' ? '€'
    : 'S$'

  return (
    <div className={styles.step}>
      <div className={styles.header}>
        <h2 className={styles.title}>Set your allocation</h2>
        <p className={styles.subtitle}>
          Distribute your {currencySymbol}{Number(data.income).toLocaleString()} across these categories.
          Drag to adjust or type a percentage.
        </p>
      </div>

      <div className={`card ${styles.card}`}>
        {/* Total indicator */}
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total allocated</span>
          <span className={`${styles.totalValue} ${!isValid ? styles.totalError : styles.totalOk}`}>
            {total}%
          </span>
        </div>
        {!isValid && (
          <p className={styles.validationMsg}>
            {total > 100 ? `Over by ${total - 100}% — reduce some categories` : `${100 - total}% remaining to allocate`}
          </p>
        )}

        <hr className="divider" />

        {/* Group cards */}
        <div className={styles.groupList}>
          {groups.map((group) => {
            const amount = ((group.percentage / 100) * Number(data.income))
            return (
              <div key={group.id} className={styles.groupCard}>
                <div className={styles.groupTop}>
                  <div className={styles.groupDot} style={{ background: group.color }} />
                  <div className={styles.groupInfo}>
                    <span className={styles.groupLabel}>{group.label}</span>
                    <span className={styles.groupDesc}>{group.description}</span>
                  </div>
                  <div className={styles.groupInputWrap}>
                    <input
                      className={styles.percentInput}
                      type="number"
                      min="0"
                      max="100"
                      value={group.percentage}
                      onChange={(e) => updatePercentage(group.id, e.target.value)}
                    />
                    <span className={styles.percentSymbol}>%</span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={group.percentage}
                  onChange={(e) => updatePercentage(group.id, e.target.value)}
                  className={styles.slider}
                  style={{ '--slider-color': group.color }}
                />

                {/* Amount */}
                <div className={styles.groupAmount}>
                  <span>{currencySymbol}{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span>per {data.cycle === 'biweekly' ? '2 weeks' : data.cycle}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reset */}
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={resetToDefault}
          style={{ marginTop: 'var(--space-2)', width: '100%' }}
        >
          ↺ Reset to 50/30/20 default
        </button>
      </div>

      <div className={styles.actions}>
        <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!isValid}
          style={{ flex: 1 }}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
