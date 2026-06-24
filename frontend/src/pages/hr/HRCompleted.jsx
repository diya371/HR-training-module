import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInterns, issueCertificate } from '../../api'
import Modal from '../../components/Modal'
import InternDetail from '../../components/InternDetail'

export default function HRCompleted() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewIntern, setViewIntern] = useState(null)
  const [certIntern, setCertIntern] = useState(null)
  const [certForm, setCertForm] = useState({ fee_details: '', hr_final_remarks: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try { setInterns(await getInterns('completed')) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCert = (intern) => {
    setCertIntern(intern)
    setCertForm({ fee_details: '', hr_final_remarks: '' })
    setError('')
  }

  const handleIssueCert = async () => {
    if (!certForm.fee_details || !certForm.hr_final_remarks) {
      setError('Please fill in all fields.'); return
    }
    setSaving(true); setError('')
    try {
      await issueCertificate(certIntern.id, certForm)
      setSuccess(`Certificate issued for ${certIntern.name}.`)
      setCertIntern(null)
      load()
      setTimeout(() => navigate(`/certificate/print/${certIntern.id}`), 800)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Completed Internships</h1>
          <p>Interns who have been marked complete by their mentor — review and issue certificates</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}

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
                <th>Project Submitted</th>
                <th>Attendance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : interns.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <p>No completed internships yet</p>
                    <span>Interns marked complete by mentors will appear here.</span>
                  </div>
                </td></tr>
              ) : interns.map(i => (
                <tr key={i.id}>
                  <td><code style={{ fontSize: 12, color: 'var(--navy)' }}>{i.intern_id}</code></td>
                  <td style={{ fontWeight: 600 }}>{i.name}</td>
                  <td>{i.department}</td>
                  <td>{i.mentor?.name || '—'}</td>
                  <td style={{ fontSize: 12, maxWidth: 140 }}>{i.project || '—'}</td>
                  <td>
                    <span className={`badge ${i.project_submitted ? 'badge-completed' : 'badge-rejected'}`}>
                      {i.project_submitted === true ? 'Yes' : i.project_submitted === false ? 'No' : '—'}
                    </span>
                  </td>
                  <td>{i.attendance || '—'}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewIntern(i)}>👁 View</button>
                      <button className="btn btn-success btn-sm" onClick={() => openCert(i)}>🎓 Issue Certificate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewIntern && (
        <Modal title="Intern Completion Details" onClose={() => setViewIntern(null)} size="modal-lg"
          footer={<button className="btn btn-outline" onClick={() => setViewIntern(null)}>Close</button>}>
          <InternDetail intern={viewIntern} />
          <div className="divider" />
          <p className="section-title">Completion Summary</p>
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
            <div className="detail-item" style={{ gridColumn: '1/-1' }}>
              <label>Mentor Remarks</label>
              <span>{viewIntern.completion_remarks || '—'}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Issue Certificate Modal */}
      {certIntern && (
        <Modal title="Issue Certificate" onClose={() => setCertIntern(null)} size="modal-lg"
          footer={<>
            <button className="btn btn-outline" onClick={() => setCertIntern(null)}>Cancel</button>
            <button className="btn btn-success" onClick={handleIssueCert} disabled={saving}>
              {saving ? 'Processing…' : '🎓 Issue & Print'}
            </button>
          </>}>
          <InternDetail intern={certIntern} />
          <div className="divider" />
          <p className="section-title">HR Final Details</p>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Fee Details *</label>
              <input
                value={certForm.fee_details}
                onChange={e => setCertForm(f => ({ ...f, fee_details: e.target.value }))}
                placeholder="e.g. Stipend: ₹5000/month, No fee"
              />
            </div>
            <div className="form-group form-full">
              <label>HR Final Remarks *</label>
              <textarea
                value={certForm.hr_final_remarks}
                onChange={e => setCertForm(f => ({ ...f, hr_final_remarks: e.target.value }))}
                placeholder="Overall performance, recommendation, etc."
                rows={3}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
