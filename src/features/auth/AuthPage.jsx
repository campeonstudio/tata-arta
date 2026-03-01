import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { error } = await signUp(form.email, form.password, form.fullName)
      if (error) {
        setError(error.message)
      } else {
        navigate('/onboarding')
      }
    } else {
      const { error } = await signIn(form.email, form.password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    }

    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>B</div>
          <h1 className={styles.wordmark}>Budgetly</h1>
          <p className={styles.tagline}>Your money, your rules.</p>
        </div>

        {/* Card */}
        <div className={`card ${styles.card}`}>
          {/* Tab Switch */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'signin' ? styles.tabActive : ''}`}
              onClick={() => setMode('signin')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => setMode('signup')}
              type="button"
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'signup' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  className="input"
                  type="text"
                  name="fullName"
                  placeholder="Your name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              className="btn btn-primary btn-lg w-full"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signup'
                ? 'Create Account →'
                : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
