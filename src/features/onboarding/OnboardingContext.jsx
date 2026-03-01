import { createContext, useContext, useState } from 'react'
import { DEFAULT_BUDGET_GROUPS } from '@/lib/constants'

const OnboardingContext = createContext(null)

const initialData = {
  // Step 1: Account (already done via auth)
  // Step 2: Income
  income: '',
  currency: 'IDR',
  cycle: 'monthly',
  // Step 3: Budget allocation
  budgetGroups: DEFAULT_BUDGET_GROUPS,
  // Step 4: Goals
  goals: [],
}

export function OnboardingProvider({ children }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(initialData)

  const totalSteps = 4

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
