import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../OnboardingContext'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import styles from './Steps.module.css'

export default function StepDone() {
  const { data } = useOnboarding()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleFinish = async () => {
    setSaving(true)
    try {
      // Save budget profile to Supabase
      const { error: profileError } = await supabase
        .from('budget_profiles')
        .upsert({
          user_id: user.id,
          income: data.income,
          currency: data.currency,
          cycle: data.cycle,
          budget_groups: data.budgetGroups,
          goals: data.goals,
          created_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      navigate('/dashboard')
    } catch (err) {
      setError('Could not save your profile. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const currencySymbol = data.currency === 'IDR' ? 'Rp'
    : data.currency === 'USD' ? '$'
    : data.currency === 'EUR' ? '€' : 'S$'

  return (
    <div className={styles.step}>
      <div className={styles.doneScreen}>
        <div className={styles.doneIcon}>✓</div>
        <h2 className={styles.doneTitle}>You're all set!</h2>
        <p className={styles.doneSubtitle}>Here's a quick summary of your budget:</p>

        <div className={`card ${styles.summaryCard}`}>
          <div className={styles.summaryRow}>
            <span className="text-muted text-sm">Income</span>
            <span className={styles.summaryValue}>
              {currencySymbol}{Number(data.income).toLocaleString()} / {data.cycle}
            </span>
          </div>

          <hr className="divider" />

          {data.budgetGroups.map(group => (
            <div key={group.id} className={styles.summaryRow}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: group.color, display: 'inline-block' }} />
                <span className="text-sm">{group.label}</span>
              </span>
              <span className={styles.summaryValue}>
                {group.percentage}% · {currencySymbol}{((group.percentage / 100) * Number(data.income)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}

          {data.goals.length > 0 && (
            <>
              <hr className="divider" />
              <div className={styles.summaryRow}>
                <span className="text-muted text-sm">Goals</span>
                <span className={styles.summaryValue}>{data.goals.length} selected</span>
              </div>
            </>
          )}
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleFinish}
          disabled={saving}
          style={{ marginTop: 'var(--space-6)' }}
        >
          {saving ? 'Saving...' : 'Go to Dashboard →'}
        </button>

        <p className={styles.doneHint}>
          Everything can be adjusted anytime from Settings.
        </p>
      </div>
    </div>
  )
}
