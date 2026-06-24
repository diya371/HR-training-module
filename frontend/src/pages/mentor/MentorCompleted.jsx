import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMentorInterns } from '../../api'
import Modal from '../../components/Modal'
import InternDetail from '../../components/InternDetail'

function groupByMonth(interns) {
  const groups = {}
  for (const intern of interns) {
    const date = intern.created_at ? new Date(intern.created_at) : new Date()
    const key = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(intern)
  }
  return groups
}

export default function MentorCompleted() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewIntern, setViewIntern] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMentorInterns(user.mentor_id, 'completed,issued')
      setInterns(data)
    } finally { setLoading(false) }
  }, [user.mentor_id])

  useEffect(() => { load() }, [load])

  const grouped = groupByMonth(interns)

  const handlePrint = () => window.print()

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Completed Internships</h1>
          <p>All interns who have completed their tenure under your supervision</p>
        </div>
        <div className="flex-gap">
          <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
          <button className="btn btn-primary btn-sm no-print" onClick={handlePrint}>🖨 Print Report</button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</div>
      ) : interns.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>No completed internships yet</p>
            <span>Interns you mark complete will appear here, grouped by month.</span>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([month, monthInterns]) => (
          <div key={month} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{month}</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— {monthInterns.length} intern{monthInterns.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Intern ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Project</th>
                      <th>Project Submitted</th>
                      <th>Attendance</th>
                      <th>Certificate Issued</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthInterns.map(i => (
                      <tr key={i.id}>
                        <td><code style={{ fontSize: 12, color: 'var(--navy)' }}>{i.intern_id}</code></td>
                        <td style={{ fontWeight: 600 }}>{i.name}</td>
                        <td>{i.department}</td>
                        <td style={{ fontSize: 12, maxWidth: 160 }}>{i.project || '—'}</td>
                        <td>
                          <span className={`badge ${i.project_submitted ? 'badge-completed' : 'badge-rejected'}`}>
                            {i.project_submitted === true ? 'Yes' : i.project_submitted === false ? 'No' : '—'}
                          </span>
                        </td>
                        <td>{i.attendance || '—'}</td>
                        <td>
                          <span className={`badge ${i.certificate_issued ? 'badge-issued' : 'badge-assigned'}`}>
                            {i.certificate_issued ? 'Y — Issued' : 'N — Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="action-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => setViewIntern(i)}>👁 View</button>
                            {i.certificate_issued && (
                              <button
                                className="btn btn-primary btn-sm no-print"
                                onClick={() => navigate(`/certificate/print/${i.id}`)}
                              >
                                🖨 Print Cert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}

      {viewIntern && (
        <Modal title="Completion Details" onClose={() => setViewIntern(null)} size="modal-lg"
          footer={
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setViewIntern(null)}>Close</button>
              {viewIntern.certificate_issued && (
                <button className="btn btn-primary" onClick={() => navigate(`/certificate/print/${viewIntern.id}`)}>
                  🖨 Print Certificate
                </button>
              )}
            </div>
          }>
          <InternDetail intern={viewIntern} />
          <div className="divider" />
          <p className="section-title">Completion Summary</p>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Project</label>
              <span>{viewIntern.project || '—'}</span>
            </div>
            <div className="detail-item">
              <label>Project Submitted</label>
              <span>{viewIntern.project_submitted === true ? '✅ Yes' : viewIntern.project_submitted === false ? '❌ No' : '—'}</span>
            </div>
            <div className="detail-item">
              <label>Attendance</label>
              <span>{viewIntern.attendance || '—'}</span>
            </div>
            <div className="detail-item">
              <label>Certificate Issued</label>
              <span>{viewIntern.certificate_issued ? '✅ Yes' : '⏳ Not yet'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}>
              <label>Your Remarks</label>
              <span>{viewIntern.completion_remarks || '—'}</span>
            </div>
            {viewIntern.hr_final_remarks && (
              <div className="detail-item" style={{ gridColumn: '1/-1' }}>
                <label>HR Final Remarks</label>
                <span>{viewIntern.hr_final_remarks}</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
