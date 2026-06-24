import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'
import HRLayout from './pages/hr/HRLayout'
import AddNewIntern from './pages/hr/AddNewIntern'
import AssignMentor from './pages/hr/AssignMentor'
import RejectedByMentor from './pages/hr/RejectedByMentor'
import HROngoing from './pages/hr/HROngoing'
import HRCompleted from './pages/hr/HRCompleted'
import IssuedCertificate from './pages/hr/IssuedCertificate'

import MentorLayout from './pages/mentor/MentorLayout'
import NewInterns from './pages/mentor/NewInterns'
import MentorOngoing from './pages/mentor/MentorOngoing'
import MentorCompleted from './pages/mentor/MentorCompleted'

import CertificatePrint from './pages/CertificatePrint'

function PrivateRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/certificate/print/:id" element={<CertificatePrint />} />

          <Route path="/hr" element={
            <PrivateRoute role="hr"><HRLayout /></PrivateRoute>
          }>
            <Route index element={<Navigate to="add-intern" replace />} />
            <Route path="add-intern"     element={<AddNewIntern />} />
            <Route path="assign-mentor"  element={<AssignMentor />} />
            <Route path="rejected"       element={<RejectedByMentor />} />
            <Route path="ongoing"        element={<HROngoing />} />
            <Route path="completed"      element={<HRCompleted />} />
            <Route path="issued"         element={<IssuedCertificate />} />
          </Route>

          <Route path="/mentor" element={
            <PrivateRoute role="mentor"><MentorLayout /></PrivateRoute>
          }>
            <Route index element={<Navigate to="new-interns" replace />} />
            <Route path="new-interns" element={<NewInterns />} />
            <Route path="ongoing"     element={<MentorOngoing />} />
            <Route path="completed"   element={<MentorCompleted />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
