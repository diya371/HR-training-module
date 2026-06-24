import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStats } from '../api'

const NAV = [
  { to: '/hr/add-intern',   icon: '➕', label: 'Add New Intern'     },
  { to: '/hr/assign-mentor',icon: '🔗', label: 'Assign Mentor'       },
  { to: '/hr/rejected',     icon: '↩️', label: 'Rejected by Mentor'  },
  { to: '/hr/ongoing',      icon: '⚙️', label: 'Ongoing'             },
  { to: '/hr/completed',    icon: '✅', label: 'Completed'           },
  { to: '/hr/issued',       icon: '🎓', label: 'Issued Certificate'  },
]

const STATUS_LABELS = [
  { key: 'new',       label: 'New'       },
  { key: 'assigned',  label: 'Assigned'  },
  { key: 'rejected',  label: 'Rejected'  },
  { key: 'ongoing',   label: 'Ongoing'   },
  { key: 'completed', label: 'Completed' },
  { key: 'issued',    label: 'Issued'    },
]

export default function HRSidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
    const interval = setInterval(() => {
      getStats().then(setStats).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>DRDO</h2>
        <p>HR Training Module</p>
      </div>

      <div className="sidebar-section-label">Actions</div>
      <ul className="sidebar-nav">
        {NAV.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
              <span><span className="nav-icon">{icon}</span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-section-label" style={{ marginTop: 14 }}>Status</div>
      <ul className="sidebar-nav">
        {STATUS_LABELS.map(({ key, label }) => (
          <li key={key}>
            <span style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', color:'rgba(255,255,255,0.55)', fontSize:13 }}>
              <span>{label}</span>
              <span className={`sidebar-badge ${stats[key] > 0 ? 'has-items' : ''}`}>
                {stats[key] ?? 0}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="sidebar-logout">
        <button onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
