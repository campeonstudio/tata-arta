import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import AuthPage from '@/features/auth/AuthPage'
import OnboardingPage from '@/features/onboarding/OnboardingPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import TransactionsPage from '@/features/transactions/TransactionsPage'
import BudgetPage from '@/features/budget/BudgetPage'
import WalletsPage from '@/features/wallets/WalletsPage'
import SettingsPage from '@/features/settings/SettingsPage'

// Wrapper that provides AppLayout to all protected app routes
function AppRoutes() {
  const [refreshKey, setRefreshKey] = useState(0)
  const handleTransactionAdded = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <AppLayout onTransactionAdded={handleTransactionAdded}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage key={refreshKey} />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/wallets" element={<WalletsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Onboarding — protected but no app layout */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* All app pages — protected + app layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
