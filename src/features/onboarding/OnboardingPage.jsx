import { OnboardingProvider, useOnboarding } from './OnboardingContext'
import StepIncome from './steps/StepIncome'
import StepBudget from './steps/StepBudget'
import StepWallet from './steps/StepWallet'
import StepGoals from './steps/StepGoals'
import StepDone from './steps/StepDone'
import styles from './OnboardingPage.module.css'

function OnboardingSteps() {
  const { step, totalSteps } = useOnboarding()
  const STEP_LABELS = ['Income', 'Budget', 'Wallets', 'Goals', 'Done']

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.progress}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`${styles.progressDot} ${i + 1 <= step ? styles.progressDotActive : ''}`}
            />
          ))}
        </div>
        <p className={styles.stepLabel}>{STEP_LABELS[step - 1]}</p>
        {step === 1 && <StepIncome />}
        {step === 2 && <StepBudget />}
        {step === 3 && <StepWallet />}
        {step === 4 && <StepGoals />}
        {step === 5 && <StepDone />}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingSteps />
    </OnboardingProvider>
  )
}
