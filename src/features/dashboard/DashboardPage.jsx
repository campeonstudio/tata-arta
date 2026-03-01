import { useAuth } from '@/features/auth/AuthContext'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={`card ${styles.placeholder}`}>
          <h2>👋 Welcome to your Dashboard</h2>
          <p>Dashboard, budget tracking, and expense features coming next!</p>
          <p className="text-sm text-muted" style={{ marginTop: '8px' }}>Signed in as: {user?.email}</p>
          <button className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }} onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
