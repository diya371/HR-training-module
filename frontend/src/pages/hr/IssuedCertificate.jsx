import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInterns } from '../../api'
import Modal from '../../components/Modal'
import InternDetail from '../../components/InternDetail'

export default function IssuedCertificate() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewIntern, setViewIntern] = useState(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try { setInterns(await getInterns('issued')) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Issued Certificates</h1>
          <p>All interns who have been issued their completion certificate</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Intern ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Mentor</th>
                <th>Project</th>
                <th>Duration</th>
                <th>Fee Details</th>
                <th>Certificate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : interns.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <p>No certificates issued yet</p>
                    <span>Issue certificates from the Completed section.</span>
                  </div>
                </td></tr>
              ) : interns.map(i => (
                <tr key={i.id}>
                  <td><code style={{ fontSize: 12, color: 'var(--navy)' }}>{i.intern_id}</code></td>
                  <td style={{ fontWeight: 600 }}>{i.name}</td>
                  <td>{i.department}</td>
                  <td>{i.mentor?.name || '—'}</td>
                  <td style={{ fontSize: 12, maxWidth: 140 }}>{i.project || '—'}</td>
                  <td>{i.duration}</td>
                  <td style={{ fontSize: 12 }}>{i.fee_details || '—'}</td>
                  <td>
                    <span className="badge badge-issued">
                      {i.certificate_issued ? '✅ Issued' : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewIntern(i)}>👁 View</button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/certificate/print/${i.id}`)}
                      >
                        🖨 Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewIntern && (
        <Modal title="Certificate Details" onClose={() => setViewIntern(null)} size="modal-lg"
          footer={
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setViewIntern(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => navigate(`/certificate/print/${viewIntern.id}`)}>
                🖨 Print Certificate
              </button>
            </div>
          }>
          <InternDetail intern={viewIntern} />
          <div className="divider" />
          <p className="section-title">Certificate & Completion Info</p>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Mentor</label>
              <span>{viewIntern.mentor?.name || '—'}</span>
            </div>
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
              <label>Fee Details</label>
              <span>{viewIntern.fee_details || '—'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}>
              <label>HR Final Remarks</label>
              <span>{viewIntern.hr_final_remarks || '—'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}>
              <label>Mentor Remarks</label>
              <span>{viewIntern.completion_remarks || '—'}</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
