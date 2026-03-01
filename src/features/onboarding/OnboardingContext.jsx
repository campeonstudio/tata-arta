import { createContext, useContext, useState } from 'react'
import { DEFAULT_BUDGET_GROUPS } from '@/lib/constants'

const OnboardingContext = createContext(null)

const initialData = {
  income: '',
  currency: 'IDR',
  cycle: 'monthly',
  budgetGroups: DEFAULT_BUDGET_GROUPS,
  wallets: [],  // NEW: wallet setup step
  goals: [],
}

export function OnboardingProvider({ children }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(initialData)

  const totalSteps = 5  // income, budget, wallets, goals, done

  const updateData = (partial) => {
    setData(prev => ({ ...prev, ...partial }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))
  const goToStep = (n) => setStep(n)

  return (
    <OnboardingContext.Provider value={{ step, totalSteps, data, updateData, nextStep, prevStep, goToStep }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider')
  return context
}
