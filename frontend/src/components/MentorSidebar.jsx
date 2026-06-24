import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMentorStats } from '../api'

const NAV = [
  { to: '/mentor/new-interns', icon: '🆕', label: 'New Interns'  },
  { to: '/mentor/ongoing',     icon: '⚙️', label: 'Ongoing'      },
  { to: '/mentor/completed',   icon: '✅', label: 'Completed'    },
]

export default function MentorSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})

  useEffect(() => {
    if (user?.mentor_id) {
      getMentorStats(user.mentor_id).then(setStats).catch(() => {})
      const interval = setInterval(() => {
        getMentorStats(user.mentor_id).then(setStats).catch(() => {})
      }, 15000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleLogout = () => { logout(); navigate('/login') }

  const badgeKey = { '/mentor/new-interns': 'assigned', '/mentor/ongoing': 'ongoing', '/mentor/completed': 'completed' }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>DRDO</h2>
        <p>Mentor Portal</p>
      </div>

      <div className="sidebar-section-label">My Interns</div>
      <ul className="sidebar-nav">
        {NAV.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
              <span><span className="nav-icon">{icon}</span>{label}</span>
              {badgeKey[to] && stats[badgeKey[to]] > 0 && (
                <span className="sidebar-badge has-items">{stats[badgeKey[to]]}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-section-label" style={{ marginTop: 14 }}>Info</div>
      <div style={{ padding: '8px 18px', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
        <p>Assigned: {stats.assigned ?? 0}</p>
        <p>Ongoing: {stats.ongoing ?? 0}</p>
        <p>Completed: {stats.completed ?? 0}</p>
      </div>

      <div className="sidebar-logout">
        <button onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
