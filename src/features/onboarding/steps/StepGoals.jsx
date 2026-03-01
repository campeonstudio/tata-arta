import { useState } from 'react'
import { useOnboarding } from '../OnboardingContext'
import styles from './Steps.module.css'

const GOAL_PRESETS = [
  { id: 'emergency', label: 'Emergency Fund', icon: '🛡️' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'house', label: 'House / Property', icon: '🏠' },
  { id: 'car', label: 'Vehicle', icon: '🚗' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'retirement', label: 'Retirement', icon: '🌅' },
  { id: 'gadget', label: 'Gadget', icon: '💻' },
  { id: 'business', label: 'Business', icon: '💼' },
]

export default function StepGoals() {
  const { data, updateData, nextStep, prevStep } = useOnboarding()
  const [selected, setSelected] = useState(data.goals)

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    updateData({ goals: selected })
    nextStep()
  }

  return (
    <div className={styles.step}>
      <div className={styles.header}>
        <h2 className={styles.title}>Any financial goals?</h2>
        <p className={styles.subtitle}>
          Select what you're saving towards. This helps us give you better insights.
          You can skip this and add goals later.
        </p>
      </div>

      <div className={`card ${styles.card}`}>
        <div className={styles.goalGrid}>
          {GOAL_PRESETS.map(goal => (
            <button
              key={goal.id}
              type="button"
              className={`${styles.goalBtn} ${selected.includes(goal.id) ? styles.goalBtnActive : ''}`}
              onClick={() => toggle(goal.id)}
            >
              <span className={styles.goalIcon}>{goal.icon}</span>
              <span className={styles.goalLabel}>{goal.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
        <button className="btn btn-ghost" onClick={handleNext}>
          Skip
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={selected.length === 0}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
