import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { useBudget } from '@/hooks/useBudget'
import { useWallets } from '@/hooks/useWallets'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, formatDateShort, getPeriodDates } from '@/lib/utils'
import AddTransactionSheet from '@/features/transactions/AddTransactionSheet'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const { settings, groupsWithStats, loading: budgetLoading, refetch: refetchBudget } = useBudget()
  const { wallets, totalBalance, loading: walletsLoading } = useWallets()
  const { transactions, todayStats, loading: txLoading, refetch: refetchTx } = useTransactions({
    limit: 5,
    periodOnly: true,
    settings,
  })
  const [sheetOpen, setSheetOpen] = useState(false)

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const currency = settings?.currency || 'IDR'
  const loading = budgetLoading || walletsLoading

  const handleTransactionAdded = useCallback(() => {
    setSheetOpen(false)
    refetchBudget()
    refetchTx()
  }, [refetchBudget, refetchTx])

  const getHour = () => new Date().getHours()
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 17 ? 'Good afternoon' : 'Good evening'

  const txTypeColor = (type) => {
    if (type === 'income') return 'var(--savings-color)'
    if (type === 'expense') return '#B07A6E'
    if (type === 'transfer') return 'var(--wants-color)'
    return 'var(--needs-color)'
  }

  const txTypeSign = (type) => {
    if (type === 'income') return '+'
    if (type === 'transfer') return '⇄'
    return '−'
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting},</p>
          <h1 className={styles.name}>{userName} 👋</h1>
        </div>
        {settings && (
          <div className={styles.periodBadge}>
            <span>{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading your dashboard...</p>
        </div>
      ) : !settings ? (
        <div className={styles.emptyState}>
          <p>Complete your setup to see your dashboard.</p>
          <Link to="/onboarding" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Complete Setup →
          </Link>
        </div>
      ) : (
        <>
          {/* ── TODAY SNAPSHOT ── */}
          <div className={styles.snapshotRow}>
            <div className={`card-inset ${styles.snapshotCard}`}>
              <p className={styles.snapshotLabel}>Income today</p>
              <p className={`${styles.snapshotValue} ${styles.snapshotIncome}`}>
                +{formatCurrency(todayStats.income, currency)}
              </p>
            </div>
            <div className={`card-inset ${styles.snapshotCard}`}>
              <p className={styles.snapshotLabel}>Spent today</p>
              <p className={`${styles.snapshotValue} ${styles.snapshotExpense}`}>
                −{formatCurrency(todayStats.expense, currency)}
              </p>
            </div>
          </div>

          {/* ── BUDGET PROGRESS ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Budget this period</h2>
              <Link to="/budget" className={styles.sectionLink}>Manage →</Link>
            </div>

            <div className={styles.budgetCards}>
              {groupsWithStats.map(group => (
                <div key={group.id} className={`card ${styles.budgetCard}`}>
                  <div className={styles.budgetCardTop}>
                    <div className={styles.budgetGroupLabel}>
                      <span className={styles.groupDot} style={{ background: group.color }} />
                      <span className={styles.groupName}>{group.name}</span>
                      {group.isOverBudget && (
                        <span className={styles.overBudgetBadge}>Over</span>
                      )}
                    </div>
                    <div className={styles.budgetAmounts}>
                      <span className={styles.budgetSpent}>
                        {formatCurrency(group.spent, currency)}
                      </span>
                      <span className={styles.budgetTotal}>
                        / {formatCurrency(group.budgetAmount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="progress-track" style={{ marginTop: 'var(--space-3)' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${group.percentUsed}%`,
                        background: group.isOverBudget
                          ? 'linear-gradient(90deg, #B07A6E, #C4785A)'
                          : `linear-gradient(90deg, ${group.color}cc, ${group.color})`,
                      }}
                    />
                  </div>

                  <div className={styles.budgetRemaining}>
                    {group.isOverBudget ? (
                      <span className={styles.overAmount}>
                        Over by {formatCurrency(group.spent - group.budgetAmount, currency)}
                      </span>
                    ) : (
                      <span className={styles.remainingAmount}>
                        {formatCurrency(group.remaining, currency)} remaining
                      </span>
                    )}
                    <span className={styles.percentUsed}>{Math.round(group.percentUsed)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── WALLETS SUMMARY ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Wallets</h2>
              <Link to="/wallets" className={styles.sectionLink}>View all →</Link>
            </div>
            <div className={styles.walletScroll}>
              {wallets.map(wallet => (
                <div key={wallet.id} className={`card ${styles.walletCard}`}>
                  <div className={styles.walletIcon} style={{ background: wallet.color + '22', color: wallet.color }}>
                    {wallet.type === 'cash' ? '💵' : wallet.type === 'bank' ? '🏦' : wallet.type === 'ewallet' ? '📲' : '💳'}
                  </div>
                  <p className={styles.walletName}>{wallet.name}</p>
                  <p className={styles.walletBalance}>{formatCurrency(wallet.balance, currency)}</p>
                </div>
              ))}
              <Link to="/wallets" className={`card ${styles.walletAddCard}`}>
                <span>+</span>
                <span>Add wallet</span>
              </Link>
            </div>
          </section>

          {/* ── RECENT TRANSACTIONS ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent transactions</h2>
              <Link to="/transactions" className={styles.sectionLink}>See all →</Link>
            </div>

            {transactions.length === 0 ? (
              <div className={`card ${styles.emptyTx}`}>
                <p className={styles.emptyTxText}>No transactions yet this period.</p>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSheetOpen(true)}
                >
                  + Add your first transaction
                </button>
              </div>
            ) : (
              <div className={`card ${styles.txList}`}>
                {transactions.map((tx, i) => (
                  <div key={tx.id} className={styles.txItem} style={{
                    borderBottom: i < transactions.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div className={styles.txLeft}>
                      <div
                        className={styles.txTypeIcon}
                        style={{ color: txTypeColor(tx.type), background: txTypeColor(tx.type) + '18' }}
                      >
                        {tx.category?.icon || txTypeSign(tx.type)}
                      </div>
                      <div className={styles.txInfo}>
                        <p className={styles.txNote}>
                          {tx.note || tx.category?.name || tx.group?.name || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </p>
                        <p className={styles.txMeta}>
                          {tx.type === 'transfer'
                            ? `${tx.from_wallet?.name} → ${tx.to_wallet?.name}`
                            : tx.wallet?.name || '—'
                          }
                          {' · '}{formatDateShort(tx.date)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={styles.txAmount}
                      style={{ color: txTypeColor(tx.type) }}
                    >
                      {txTypeSign(tx.type)}{formatCurrency(tx.amount, currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Mobile FAB - only shown when no bottom nav (extra shortcut) */}
      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  )
}
