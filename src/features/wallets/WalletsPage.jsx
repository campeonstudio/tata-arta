import { useState } from 'react'
import { useWallets } from '@/hooks/useWallets'
import { useBudget } from '@/hooks/useBudget'
import { formatCurrency } from '@/lib/utils'
import { WALLET_TYPES, WALLET_COLORS } from '@/lib/constants'
import styles from './WalletsPage.module.css'

const EMPTY_FORM = { name: '', type: 'bank', balance: '', color: WALLET_COLORS[0] }

export default function WalletsPage() {
  const { wallets, totalBalance, loading, addWallet, updateWallet, deleteWallet } = useWallets()
  const { settings } = useBudget()
  const [showAdd, setShowAdd] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const currency = settings?.currency || 'IDR'

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleAdd = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await addWallet({
      name: form.name.trim(),
      type: form.type,
      balance: Number(form.balance) || 0,
      color: form.color,
      is_default: wallets.length === 0,
    })
    setForm(EMPTY_FORM)
    setShowAdd(false)
    setSaving(false)
  }

  const handleUpdate = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await updateWallet(editingWallet.id, {
      name: form.name.trim(),
      type: form.type,
      balance: Number(form.balance) || 0,
      color: form.color,
    })
    setEditingWallet(null)
    setForm(EMPTY_FORM)
    setSaving(false)
  }

  const startEdit = (wallet) => {
    setEditingWallet(wallet)
    setForm({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance,
      color: wallet.color || WALLET_COLORS[0],
    })
    setShowAdd(false)
  }

  const handleDelete = async (id) => {
    await deleteWallet(id)
    setConfirmDelete(null)
  }

  const walletTypeInfo = (type) => WALLET_TYPES.find(t => t.value === type)

  if (loading) return (
    <div className={styles.loading}><div className={styles.spinner} /></div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Wallets</h1>
          <p className={styles.totalBalance}>
            Total · {formatCurrency(totalBalance, currency)}
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { setShowAdd(v => !v); setEditingWallet(null); setForm(EMPTY_FORM) }}
        >
          {showAdd ? '✕ Cancel' : '+ Add wallet'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className={`card ${styles.walletForm}`}>
          <h3 className={styles.formTitle}>New wallet</h3>
          <WalletForm form={form} set={set} />
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={!form.name.trim() || saving}
              style={{ flex: 1 }}
            >
              {saving ? 'Saving...' : 'Add Wallet'}
            </button>
          </div>
        </div>
      )}

      {/* Wallet list */}
      {wallets.length === 0 ? (
        <div className={styles.empty}>
          <p>No wallets yet. Add your first wallet above!</p>
        </div>
      ) : (
        <div className={styles.walletGrid}>
          {wallets.map(wallet => {
            const typeInfo = walletTypeInfo(wallet.type)
            const isEditing = editingWallet?.id === wallet.id

            return (
              <div key={wallet.id} className={`card ${styles.walletCard}`}>
                {isEditing ? (
                  <div>
                    <h3 className={styles.formTitle}>Edit wallet</h3>
                    <WalletForm form={form} set={set} />
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingWallet(null)}>
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleUpdate}
                        disabled={!form.name.trim() || saving}
                        style={{ flex: 1 }}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.walletCardTop}>
                      <div
                        className={styles.walletIcon}
                        style={{ background: (wallet.color || WALLET_COLORS[0]) + '22', color: wallet.color || WALLET_COLORS[0] }}
                      >
                        {typeInfo?.icon || '💳'}
                      </div>
                      <div className={styles.walletActions}>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(wallet)}>✏</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(wallet.id)}>✕</button>
                      </div>
                    </div>
                    <p className={styles.walletName}>{wallet.name}</p>
                    <p className={styles.walletType}>{typeInfo?.label || wallet.type}</p>
                    <p className={styles.walletBalance}>{formatCurrency(wallet.balance, currency)}</p>
                    {wallet.is_default && (
                      <span className={styles.defaultBadge}>Default</span>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmDelete(null)}>
          <div className="card" style={{ maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)', fontWeight: 400 }}>
              Delete wallet?
            </h3>
            <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-6)' }}>
              This will also delete all transactions linked to this wallet.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary w-full" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-primary w-full"
                style={{ background: 'linear-gradient(145deg, #9B5A4E, #7A3E32)' }}
                onClick={() => handleDelete(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable wallet form fields
function WalletForm({ form, set }) {
  const currencySymbol = ''; // shown in placeholder
  return (
    <div className={styles.formFields}>
      <div className="input-group">
        <label className="input-label">Name</label>
        <input
          className="input"
          placeholder="e.g. BCA Savings, GoPay"
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
      </div>
      <div className="input-group">
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
      <div className="input-group">
        <label className="input-label">Initial balance <span style={{ opacity: 0.5 }}>(optional)</span></label>
        <input
          className="input"
          type="number"
          placeholder="0"
          value={form.balance}
          onChange={e => set('balance', e.target.value)}
          min="0"
        />
      </div>
      <div className="input-group">
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
    </div>
  )
}
