import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import MentorSidebar from '../../components/MentorSidebar'

export default function MentorLayout() {
  const { user } = useAuth()
  const initials = user?.mentor_name
    ? user.mentor_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'M'

  return (
    <div className="layout">
      <MentorSidebar />
      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">Mentor Portal</span>
          <div className="topbar-user">
            <span>Welcome, {user?.mentor_name || 'Mentor'}</span>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </div>
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
