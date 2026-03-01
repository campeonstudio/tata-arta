import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import AddTransactionSheet from '@/features/transactions/AddTransactionSheet'
import styles from './AppLayout.module.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/transactions', label: 'Transactions', icon: '↕' },
  { to: '/budget', label: 'Budget', icon: '◎' },
  { to: '/wallets', label: 'Wallets', icon: '◈' },
]

export default function AppLayout({ children, onTransactionAdded }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()

  return (
    <div className={styles.layout}>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandLogo}>T</div>
          <span className={styles.brandName}>Tata Arta</span>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop: Add Transaction button */}
        <button
          className={styles.sidebarAddBtn}
          onClick={() => setSheetOpen(true)}
        >
          <span>+</span>
          <span>Add Transaction</span>
        </button>

        <div className={styles.sidebarFooter}>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
            }
          >
            <span className={styles.navIcon}>⚙</span>
            <span>Settings</span>
          </NavLink>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            <span className={styles.navIcon}>→</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className={styles.main}>
        {/* Mobile header */}
        <header className={styles.mobileHeader}>
          <div className={styles.brandLogo} style={{ width: 32, height: 32, fontSize: '0.875rem' }}>T</div>
          <span className={styles.brandName}>Tata Arta</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <NavLink to="/settings" className={styles.mobileHeaderBtn}>⚙</NavLink>
            <div className={styles.userAvatar}>{userInitial}</div>
          </div>
        </header>

        <div className={styles.pageContent}>
          {children}
        </div>

        {/* Mobile: bottom padding so content not hidden by nav */}
        <div className={styles.bottomNavSpacer} />
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.slice(0, 2).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
            }
          >
            <span className={styles.bottomNavIcon}>{item.icon}</span>
            <span className={styles.bottomNavLabel}>{item.label}</span>
          </NavLink>
        ))}

        {/* Center add button */}
        <button
          className={styles.bottomNavAdd}
          onClick={() => setSheetOpen(true)}
        >
          <span>+</span>
        </button>

        {NAV_ITEMS.slice(2).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`
            }
          >
            <span className={styles.bottomNavIcon}>{item.icon}</span>
            <span className={styles.bottomNavLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── ADD TRANSACTION SHEET ── */}
      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => {
          setSheetOpen(false)
          onTransactionAdded?.()
        }}
      />
    </div>
  )
}
