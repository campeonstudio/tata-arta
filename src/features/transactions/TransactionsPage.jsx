import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useBudget } from '@/hooks/useBudget'
import { formatCurrency, formatDate } from '@/lib/utils'
import styles from './TransactionsPage.module.css'

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'savings', label: 'Savings' },
]

export default function TransactionsPage() {
  const { settings } = useBudget()
  const { transactions, loading, deleteTransaction } = useTransactions({ settings })
  const [filter, setFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const currency = settings?.currency || 'IDR'

  const filtered = filter === 'all' ? transactions : transactions.filter(tx => tx.type === filter)

  // Group by date
  const grouped = filtered.reduce((acc, tx) => {
    const date = tx.date
    if (!acc[date]) acc[date] = []
    acc[date].push(tx)
    return acc
  }, {})

  const txTypeColor = (type) => {
    if (type === 'income') return 'var(--savings-color)'
    if (type === 'expense') return '#B07A6E'
    if (type === 'transfer') return 'var(--wants-color)'
    return 'var(--needs-color)'
  }

  const txSign = (type) => {
    if (type === 'income') return '+'
    if (type === 'transfer') return '⇄'
    return '−'
  }

  const handleDelete = async (id) => {
    await deleteTransaction(id)
    setConfirmDelete(null)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Transactions</h1>

      {/* Type filter chips */}
      <div className={styles.filterChips}>
        {TYPE_FILTERS.map(f => (
          <button
            key={f.value}
            className={`${styles.chip} ${filter === f.value ? styles.chipActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>No transactions found.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {Object.entries(grouped)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, txs]) => (
              <div key={date} className={styles.dateGroup}>
                <p className={styles.dateLabel}>{formatDate(date)}</p>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {txs.map((tx, i) => (
                    <div
                      key={tx.id}
                      className={styles.txItem}
                      style={{ borderBottom: i < txs.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                    >
                      <div
                        className={styles.txIcon}
                        style={{ color: txTypeColor(tx.type), background: txTypeColor(tx.type) + '18' }}
                      >
                        {tx.category?.icon || txSign(tx.type)}
                      </div>
                      <div className={styles.txInfo}>
                        <p className={styles.txNote}>
                          {tx.note || tx.category?.name || tx.group?.name || tx.type}
                        </p>
                        <p className={styles.txMeta}>
                          {tx.type === 'transfer'
                            ? `${tx.from_wallet?.name} → ${tx.to_wallet?.name}`
                            : tx.wallet?.name || '—'
                          }
                          {tx.group && ` · ${tx.group.name}`}
                        </p>
                      </div>
                      <div className={styles.txRight}>
                        <p className={styles.txAmount} style={{ color: txTypeColor(tx.type) }}>
                          {txSign(tx.type)}{formatCurrency(tx.amount, currency)}
                        </p>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => setConfirmDelete(tx.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmDelete(null)}>
          <div className="card" style={{ maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)', fontWeight: 400 }}>
              Delete transaction?
            </h3>
            <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-6)' }}>
              This cannot be undone. Wallet balance will not be automatically reversed.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary w-full" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
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
