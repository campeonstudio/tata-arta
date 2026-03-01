import { useState } from 'react'
import { useOnboarding } from '../OnboardingContext'
import { WALLET_TYPES, WALLET_COLORS } from '@/lib/constants'
import styles from './Steps.module.css'

const NEW_WALLET = { name: '', type: 'bank', balance: '', color: WALLET_COLORS[0] }

export default function StepWallet() {
  const { data, updateData, nextStep, prevStep } = useOnboarding()
  const [wallets, setWallets] = useState(data.wallets || [])
  const [form, setForm] = useState(NEW_WALLET)
  const [showForm, setShowForm] = useState(true)

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const addWallet = () => {
    if (!form.name.trim()) return
    const newWallet = {
      ...form,
      id: Date.now(),
      balance: Number(form.balance) || 0,
      is_default: wallets.length === 0,
    }
    setWallets(prev => [...prev, newWallet])
    setForm(NEW_WALLET)
    setShowForm(false)
  }

  const removeWallet = (id) => {
    setWallets(prev => prev.filter(w => w.id !== id))
  }

  const handleNext = () => {
    updateData({ wallets })
    nextStep()
  }

  const typeInfo = (type) => WALLET_TYPES.find(t => t.value === type)

  return (
    <div className={styles.step}>
      <div className={styles.header}>
        <h2 className={styles.title}>Set up your wallets</h2>
        <p className={styles.subtitle}>
          Add at least one wallet to track where your money lives.
          You can always add more later.
        </p>
      </div>

      {/* Existing wallets */}
      {wallets.length > 0 && (
        <div className={styles.walletList}>
          {wallets.map(w => (
            <div key={w.id} className={`card-inset ${styles.walletItem}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  className={styles.walletIcon}
                  style={{ background: w.color + '22', color: w.color }}
                >
                  {typeInfo(w.type)?.icon || '💳'}
                </div>
                <div>
                  <p className={styles.walletName}>{w.name}</p>
                  <p className={styles.walletMeta}>
                    {typeInfo(w.type)?.label}
                    {w.balance > 0 && ` · Rp${Number(w.balance).toLocaleString()}`}
                    {w.is_default && ' · Default'}
                  </p>
                </div>
              </div>
              <button
                className={styles.removeBtn}
                type="button"
                onClick={() => removeWallet(w.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add wallet form */}
      {showForm ? (
        <div className={`card ${styles.card}`}>
          <div className="input-group">
            <label className="input-label">Wallet name</label>
            <input
              className="input"
              placeholder="e.g. BCA Savings, GoPay"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
            <label className="input-label">Type</label>
            <div className={styles.typeGrid}>
              {WALLET_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`${styles.typeBtn} ${form.type === t.value ? styles.typeBtnActive : ''}`}
                  onClick={() => set('type', t.value)}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
            <label className="input-label">
              Current balance <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input
              className="input"
              type="number"
              placeholder="0"
              value={form.balance}
              onChange={e => set('balance', e.target.value)}
              min="0"
            />
          </div>

          <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
            <label className="input-label">Color</label>
            <div className={styles.colorPicker}>
              {WALLET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorSwatch} ${form.color === c ? styles.colorSwatchActive : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            {wallets.length > 0 && (
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            )}
            <button
              className="btn btn-primary"
              type="button"
              onClick={addWallet}
              disabled={!form.name.trim()}
              style={{ flex: 1 }}
            >
              Add Wallet +
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-secondary w-full"
          type="button"
          onClick={() => setShowForm(true)}
          style={{ marginTop: 'var(--space-2)' }}
        >
          + Add another wallet
        </button>
      )}

      <div className={styles.actions}>
        <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={wallets.length === 0}
          style={{ flex: 1 }}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
