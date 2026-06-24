import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getMentorInterns, markComplete } from '../../api'
import Modal from '../../components/Modal'
import InternDetail from '../../components/InternDetail'

export default function MentorOngoing() {
  const { user } = useAuth()
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewIntern, setViewIntern] = useState(null)
  const [completeIntern, setCompleteIntern] = useState(null)
  const [form, setForm] = useState({ project_submitted: '', remarks: '', attendance: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { setInterns(await getMentorInterns(user.mentor_id, 'ongoing')) }
    finally { setLoading(false) }
  }, [user.mentor_id])

  useEffect(() => { load() }, [load])

  const openComplete = (intern) => {
    setCompleteIntern(intern)
    setForm({ project_submitted: '', remarks: '', attendance: '' })
    setError('')
  }

  const handleComplete = async () => {
    if (form.project_submitted === '') { setError('Please indicate whether the project was submitted.'); return }
    if (!form.remarks.trim()) { setError('Please add remarks.'); return }
    if (!form.attendance.trim()) { setError('Please enter attendance.'); return }
    setSaving(true); setError('')
    try {
      await markComplete(completeIntern.id, {
        project_submitted: form.project_submitted === 'yes',
        remarks: form.remarks,
        attendance: form.attendance
      })
      setSuccess(`${completeIntern.name}'s internship has been marked as complete.`)
      setCompleteIntern(null)
      load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Ongoing Internships</h1>
          <p>Interns currently under your supervision</p>
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
                <th>Qualification</th>
                <th>Department</th>
                <th>Project</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : interns.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <p>No ongoing interns</p>
                    <span>Interns you accept will appear here.</span>
                  </div>
                </td></tr>
              ) : interns.map(i => (
                <tr key={i.id}>
                  <td><code style={{ fontSize: 12, color: 'var(--navy)' }}>{i.intern_id}</code></td>
                  <td style={{ fontWeight: 600 }}>{i.name}</td>
                  <td>{i.qualification}</td>
                  <td>{i.department}</td>
                  <td style={{ fontSize: 12, maxWidth: 160 }}>{i.project || '—'}</td>
                  <td>{i.duration}</td>
                  <td>{i.start_date}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewIntern(i)}>👁 View</button>
                      <button className="btn btn-success btn-sm" onClick={() => openComplete(i)}>✅ Complete</button>
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
        <Modal title="Intern Details" onClose={() => setViewIntern(null)}
          footer={<button className="btn btn-outline" onClick={() => setViewIntern(null)}>Close</button>}>
          <InternDetail intern={viewIntern} />
          <div className="divider" />
          <div className="detail-grid">
            <div className="detail-item" style={{ gridColumn: '1/-1' }}>
              <label>Assigned Project</label>
              <span>{viewIntern.project || '—'}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Complete Modal */}
      {completeIntern && (
        <Modal title="Mark Internship Complete" onClose={() => setCompleteIntern(null)} size="modal-lg"
          footer={<>
            <button className="btn btn-outline" onClick={() => setCompleteIntern(null)}>Cancel</button>
            <button className="btn btn-success" onClick={handleComplete} disabled={saving}>
              {saving ? 'Submitting…' : '✅ Submit Completion'}
            </button>
          </>}>
          <InternDetail intern={completeIntern} />
          <div className="divider" />
          <p className="section-title">Completion Details</p>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Project Submitted? *</label>
              <select value={form.project_submitted} onChange={e => setForm(f => ({ ...f, project_submitted: e.target.value }))}>
                <option value="">— Select —</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Attendance *</label>
              <input
                value={form.attendance}
                onChange={e => setForm(f => ({ ...f, attendance: e.target.value }))}
                placeholder="e.g. 95%, 22/25 days"
              />
            </div>
            <div className="form-group form-full">
              <label>Mentor Remarks *</label>
              <textarea
                value={form.remarks}
                onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                placeholder="Overall performance, areas of strength, recommendations…"
                rows={3}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
