import { useState, useEffect } from 'react'
import { useBudget } from '@/hooks/useBudget'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { CURRENCY_OPTIONS, CYCLE_OPTIONS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { settings, refetch } = useBudget()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setForm({
        income: settings.income,
        currency: settings.currency,
        pay_cycle: settings.pay_cycle,
        pay_cycle_day: settings.pay_cycle_day || 1,
        period_type: settings.period_type || 'calendar',
      })
    }
  }, [settings])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    await supabase
      .from('budget_settings')
      .update({
        income: Number(form.income),
        currency: form.currency,
        pay_cycle: form.pay_cycle,
        pay_cycle_day: Number(form.pay_cycle_day),
        period_type: form.period_type,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
    setSaving(false)
    setSaved(true)
    refetch()
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const userName = user?.user_metadata?.full_name || user?.email || ''
  const selectedCurrency = CURRENCY_OPTIONS.find(c => c.value === form?.currency)

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Settings</h1>

      {/* Profile */}
      <div className={`card ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <div className={styles.profileRow}>
          <div className={styles.avatar}>
            {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className={styles.profileName}>{userName}</p>
            <p className={styles.profileEmail}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Budget settings */}
      {form && (
        <div className={`card ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Budget settings</h2>

          <div className={styles.fields}>
            <div className="input-group">
              <label className="input-label">Currency</label>
              <select className="select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Monthly income</label>
              <div className="input-prefix">
                <span className="prefix-symbol">{selectedCurrency?.symbol}</span>
                <input
                  className="input"
                  type="number"
                  value={form.income}
                  onChange={e => set('income', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Pay cycle</label>
              <div className={styles.cycleGrid}>
                {CYCLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.cycleBtn} ${form.pay_cycle === opt.value ? styles.cycleBtnActive : ''}`}
                    onClick={() => set('pay_cycle', opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Period type</label>
              <div className={styles.cycleGrid}>
                <button
                  type="button"
                  className={`${styles.cycleBtn} ${form.period_type === 'calendar' ? styles.cycleBtnActive : ''}`}
                  onClick={() => set('period_type', 'calendar')}
                >
                  Calendar (1st of month)
                </button>
                <button
                  type="button"
                  className={`${styles.cycleBtn} ${form.period_type === 'paycycle' ? styles.cycleBtnActive : ''}`}
                  onClick={() => set('period_type', 'paycycle')}
                >
                  Pay cycle
                </button>
              </div>
            </div>

            {form.period_type === 'paycycle' && (
              <div className="input-group">
                <label className="input-label">Payday (day of month)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="31"
                  value={form.pay_cycle_day}
                  onChange={e => set('pay_cycle_day', e.target.value)}
                  style={{ maxWidth: 120 }}
                />
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: 'var(--space-6)' }}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}

      {/* Sign out */}
      <div className={`card ${styles.section}`}>
        <button
          className="btn btn-secondary w-full"
          onClick={handleSignOut}
          style={{ color: '#B07A6E' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
