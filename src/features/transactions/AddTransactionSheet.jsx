import { useState, useEffect } from 'react'
import BottomSheet from '@/components/ui/BottomSheet'
import { useTransactions } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useBudget } from '@/hooks/useBudget'
import { todayString, getCurrencySymbol } from '@/lib/utils'
import styles from './AddTransactionSheet.module.css'

const TYPES = [
  { value: 'expense', label: 'Expense', icon: '↑' },
  { value: 'income', label: 'Income', icon: '↓' },
  { value: 'transfer', label: 'Transfer', icon: '⇄' },
  { value: 'savings', label: 'Savings', icon: '🏦' },
]

const EMPTY_FORM = {
  type: 'expense',
  amount: '',
  wallet_id: '',
  from_wallet_id: '',
  to_wallet_id: '',
  group_id: '',
  category_id: '',
  date: todayString(),
  note: '',
  transfer_fee: '',
  fee_category_id: '',
}

export default function AddTransactionSheet({ open, onClose, onSuccess }) {
  const { addTransaction } = useTransactions()
  const { wallets } = useWallets()
  const { settings, groupsWithStats, categories } = useBudget()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFee, setShowFee] = useState(false)

  const currencySymbol = getCurrencySymbol(settings?.currency)

  // Set default wallet when wallets load
  useEffect(() => {
    if (wallets.length > 0 && !form.wallet_id) {
      const def = wallets.find(w => w.is_default) || wallets[0]
      setForm(prev => ({
        ...prev,
        wallet_id: def.id,
        from_wallet_id: def.id,
      }))
    }
  }, [wallets])

  // Reset on open
  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, date: todayString() })
      setError('')
      setShowFee(false)
    }
  }, [open])

  const set = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      // Clear category when group changes
      if (key === 'group_id') next.category_id = ''
      return next
    })
    setError('')
  }

  const categoriesForGroup = categories.filter(c => c.group_id === form.group_id)

  const validate = () => {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return 'Enter a valid amount'
    if (form.type === 'transfer') {
      if (!form.from_wallet_id) return 'Select source wallet'
      if (!form.to_wallet_id) return 'Select destination wallet'
      if (form.from_wallet_id === form.to_wallet_id) return 'Source and destination must be different'
      const fromWallet = wallets.find(w => w.id === form.from_wallet_id)
      if (fromWallet && Number(fromWallet.balance) < Number(form.amount)) {
        return `Insufficient balance in ${fromWallet.name}`
      }
    } else {
      if (!form.wallet_id) return 'Select a wallet'
    }
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')

    const payload = {
      type: form.type,
      amount: Number(form.amount),
      date: form.date,
      note: form.note || null,
    }

    if (form.type === 'transfer') {
      payload.from_wallet_id = form.from_wallet_id
      payload.to_wallet_id = form.to_wallet_id
      payload.transfer_fee = Number(form.transfer_fee) || 0
      payload.fee_category_id = form.fee_category_id || null
    } else {
      payload.wallet_id = form.wallet_id
      payload.group_id = form.group_id || null
      payload.category_id = form.category_id || null
    }

    const { error: txErr } = await addTransaction(payload)
    setLoading(false)

    if (txErr) {
      setError(txErr.message)
    } else {
      onSuccess?.()
    }
  }

  const isExpenseOrSavings = ['expense', 'savings'].includes(form.type)

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Transaction">
      {/* Type tabs */}
      <div className={styles.typeTabs}>
        {TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            className={`${styles.typeTab} ${form.type === t.value ? styles.typeTabActive : ''}`}
            onClick={() => set('type', t.value)}
          >
            <span className={styles.typeTabIcon}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.fields}>
        {/* Amount */}
        <div className={styles.amountGroup}>
          <span className={styles.currencySymbol}>{currencySymbol}</span>
          <input
            className={styles.amountInput}
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            min="0"
            autoFocus
          />
        </div>

        {/* Transfer wallets */}
        {form.type === 'transfer' ? (
          <div className={styles.transferRow}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">From</label>
              <select className="select" value={form.from_wallet_id} onChange={e => set('from_wallet_id', e.target.value)}>
                <option value="">Select wallet</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.transferArrow}>→</div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">To</label>
              <select className="select" value={form.to_wallet_id} onChange={e => set('to_wallet_id', e.target.value)}>
                <option value="">Select wallet</option>
                {wallets.filter(w => w.id !== form.from_wallet_id).map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* Wallet */
          <div className="input-group">
            <label className="input-label">Wallet</label>
            <select className="select" value={form.wallet_id} onChange={e => set('wallet_id', e.target.value)}>
              <option value="">Select wallet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Category (for expense / savings) */}
        {isExpenseOrSavings && (
          <div className={styles.categoryRow}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Category</label>
              <select className="select" value={form.group_id} onChange={e => set('group_id', e.target.value)}>
                <option value="">Select group</option>
                {groupsWithStats.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            {form.group_id && categoriesForGroup.length > 0 && (
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Subcategory</label>
                <select className="select" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">Optional</option>
                  {categoriesForGroup.map(c => (
                    <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Date */}
        <div className="input-group">
          <label className="input-label">Date</label>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
          />
        </div>

        {/* Note */}
        <div className="input-group">
          <label className="input-label">Note <span style={{ opacity: 0.5 }}>(optional)</span></label>
          <input
            className="input"
            type="text"
            placeholder="What was this for?"
            value={form.note}
            onChange={e => set('note', e.target.value)}
          />
        </div>

        {/* Transfer fee toggle */}
        {form.type === 'transfer' && (
          <div>
            <button
              type="button"
              className={`btn btn-ghost btn-sm ${styles.feeToggle}`}
              onClick={() => setShowFee(v => !v)}
            >
              {showFee ? '− Remove' : '+ Add'} transfer fee
            </button>
            {showFee && (
              <div className={styles.feeRow}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Fee amount</label>
                  <div className="input-prefix">
                    <span className="prefix-symbol">{currencySymbol}</span>
                    <input
                      className="input"
                      type="number"
                      placeholder="0"
                      value={form.transfer_fee}
                      onChange={e => set('transfer_fee', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Charge to</label>
                  <select className="select" value={form.fee_category_id} onChange={e => set('fee_category_id', e.target.value)}>
                    <option value="">Select category</option>
                    {groupsWithStats.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Submit */}
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleSubmit}
          disabled={loading || !form.amount}
          style={{ marginTop: 'var(--space-2)' }}
        >
          {loading ? 'Saving...' : `Save ${TYPES.find(t => t.value === form.type)?.label}`}
        </button>
      </div>
    </BottomSheet>
  )
}
