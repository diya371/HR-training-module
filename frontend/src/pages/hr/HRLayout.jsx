import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import HRSidebar from '../../components/HRSidebar'

export default function HRLayout() {
  const { user } = useAuth()
  return (
    <div className="layout">
      <HRSidebar />
      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">HR Administration Panel</span>
          <div className="topbar-user">
            <span>Welcome, HR Admin</span>
            <div className="topbar-avatar">HR</div>
          </div>
        </div>
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
