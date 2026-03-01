import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../OnboardingContext'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { WALLET_TYPES } from '@/lib/constants'
import styles from './Steps.module.css'

export default function StepDone() {
  const { data } = useOnboarding()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const currencySymbol = data.currency === 'IDR' ? 'Rp'
    : data.currency === 'USD' ? '$'
    : data.currency === 'EUR' ? '€' : 'S$'

  const handleFinish = async () => {
    setSaving(true)
    setError('')

    try {
      // 1. Upsert budget settings
      const { error: settingsError } = await supabase
        .from('budget_settings')
        .upsert({
          user_id: user.id,
          income: data.income,
          currency: data.currency,
          pay_cycle: data.cycle,
          pay_cycle_day: 1,
          period_type: 'calendar',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      if (settingsError) throw settingsError

      // 2. Delete existing budget groups (re-create from scratch)
      await supabase.from('budget_groups').delete().eq('user_id', user.id)

      // 3. Insert budget groups and their categories
      for (let i = 0; i < data.budgetGroups.length; i++) {
        const group = data.budgetGroups[i]

        const { data: createdGroup, error: groupError } = await supabase
          .from('budget_groups')
          .insert({
            user_id: user.id,
            name: group.label || group.name,
            percentage: group.percentage,
            color: group.color,
            sort_order: i,
            is_default: true,
          })
          .select()
          .single()
        if (groupError) throw groupError

        // Insert categories for this group
        if (group.categories?.length > 0) {
          const cats = group.categories.map((cat, j) => ({
            user_id: user.id,
            group_id: createdGroup.id,
            name: cat.label || cat.name,
            icon: cat.icon || null,
            sort_order: j,
          }))
          const { error: catError } = await supabase.from('budget_categories').insert(cats)
          if (catError) throw catError
        }
      }

      // 4. Insert wallets
      if (data.wallets?.length > 0) {
        const walletsToInsert = data.wallets.map((w, i) => ({
          user_id: user.id,
          name: w.name,
          type: w.type,
          balance: Number(w.balance) || 0,
          color: w.color,
          sort_order: i,
          is_default: i === 0,
        }))
        const { error: walletError } = await supabase.from('wallets').insert(walletsToInsert)
        if (walletError) throw walletError
      }

      // 5. Mark onboarding complete
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      navigate('/dashboard')
    } catch (err) {
      console.error('Onboarding save error:', err)
      setError('Could not save your setup. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const walletTypeLabel = (type) => WALLET_TYPES.find(t => t.value === type)?.label || type

  return (
    <div className={styles.step}>
      <div className={styles.doneScreen}>
        <div className={styles.doneIcon}>✓</div>
        <h2 className={styles.doneTitle}>You're all set!</h2>
        <p className={styles.doneSubtitle}>Here's a quick summary:</p>

        <div className={`card ${styles.summaryCard}`}>
          {/* Income */}
          <div className={styles.summaryRow}>
            <span className="text-muted text-sm">Income</span>
            <span className={styles.summaryValue}>
              {currencySymbol}{Number(data.income).toLocaleString()} / {data.cycle}
            </span>
          </div>

          <hr className="divider" />

          {/* Budget groups */}
          {data.budgetGroups.map(group => (
            <div key={group.id} className={styles.summaryRow}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: group.color, display: 'inline-block' }} />
                <span className="text-sm">{group.label || group.name}</span>
              </span>
              <span className={styles.summaryValue}>
                {group.percentage}% · {currencySymbol}{((group.percentage / 100) * Number(data.income)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}

          {/* Wallets */}
          {data.wallets?.length > 0 && (
            <>
              <hr className="divider" />
              {data.wallets.map(w => (
                <div key={w.id} className={styles.summaryRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: w.color, display: 'inline-block' }} />
                    <span className="text-sm">{w.name}</span>
                  </span>
                  <span className={styles.summaryValue}>
                    {walletTypeLabel(w.type)}
                    {w.balance > 0 && ` · ${currencySymbol}${Number(w.balance).toLocaleString()}`}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Goals */}
          {data.goals.length > 0 && (
            <>
              <hr className="divider" />
              <div className={styles.summaryRow}>
                <span className="text-muted text-sm">Goals selected</span>
                <span className={styles.summaryValue}>{data.goals.length}</span>
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
          {saving ? 'Setting up...' : 'Go to Dashboard →'}
        </button>

        <p className={styles.doneHint}>
          Everything can be adjusted anytime from Settings.
        </p>
      </div>
    </div>
  )
}
