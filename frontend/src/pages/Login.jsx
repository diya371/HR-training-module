import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin } from '../api'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      const user = await apiLogin(form)
      login(user)
      navigate(user.role === 'hr' ? '/hr' : '/mentor')
    } catch (e) {
      setError(e.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-emblem">🛡️</div>
          <h1>DRDO HR Module</h1>
          <p>Intern Training Management System</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            onKeyDown={handleKey}
            autoFocus
          />
        </div>

        <div className="form-group" style={{ marginBottom: 22 }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={handleKey}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ marginTop: 24, padding: '14px', background: '#f7fafc', borderRadius: 8, fontSize: 12, color: '#718096' }}>
          <p style={{ fontWeight: 600, marginBottom: 6, color: '#4a5568' }}>Demo Credentials</p>
          <p>HR Admin: <strong>admin</strong> / <strong>drdo123</strong></p>
          <p>Mentor: <strong>mentor1</strong> (to mentor5) / <strong>mentor123</strong></p>
        </div>
      </div>
    </div>
  )
}
