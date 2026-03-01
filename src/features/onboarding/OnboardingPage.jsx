import { OnboardingProvider, useOnboarding } from './OnboardingContext'
import StepIncome from './steps/StepIncome'
import StepBudget from './steps/StepBudget'
import StepGoals from './steps/StepGoals'
import StepDone from './steps/StepDone'
import styles from './OnboardingPage.module.css'

function OnboardingContent() {
  const { step, totalSteps } = useOnboarding()

  const steps = {
    1: StepIncome,
    2: StepBudget,
    3: StepGoals,
    4: StepDone,
  }

  const CurrentStep = steps[step]

  return (
    <div className={styles.page}>
      {/* Progress indicator */}
      {step < totalSteps && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(step / (totalSteps - 1)) * 100}%` }} />
        </div>
      )}

      <div className={styles.container}>
        {/* Step counter */}
        {step < totalSteps && (
          <p className={styles.stepCount}>Step {step} of {totalSteps - 1}</p>
        )}

        <CurrentStep />
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  )
}
