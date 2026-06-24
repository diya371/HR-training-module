import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getMentorInterns, getMentors, acceptIntern, rejectIntern } from '../../api'
import Modal from '../../components/Modal'
import InternDetail from '../../components/InternDetail'

export default function NewInterns() {
  const { user } = useAuth()
  const [interns, setInterns] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewIntern, setViewIntern] = useState(null)
  const [acceptInternData, setAcceptInternData] = useState(null)
  const [rejectInternData, setRejectInternData] = useState(null)
  const [project, setProject] = useState('')
  const [rejectForm, setRejectForm] = useState({ remarks: '', suggested_mentor_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [i, m] = await Promise.all([
        getMentorInterns(user.mentor_id, 'assigned'),
        getMentors()
      ])
      setInterns(i)
      // Filter out self from suggested mentors list
      setMentors(m.filter(m => m.id !== user.mentor_id))
    } finally { setLoading(false) }
  }, [user.mentor_id])

  useEffect(() => { load() }, [load])

  const openAccept = (intern) => { setAcceptInternData(intern); setProject(''); setError('') }
  const openReject = (intern) => { setRejectInternData(intern); setRejectForm({ remarks: '', suggested_mentor_id: '' }); setError('') }

  const handleAccept = async () => {
    if (!project.trim()) { setError('Please enter a project title.'); return }
    setSaving(true); setError('')
    try {
      await acceptIntern(acceptInternData.id, project.trim())
      setSuccess(`${acceptInternData.name} has been accepted and assigned to your supervision.`)
      setAcceptInternData(null)
      load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleReject = async () => {
    if (!rejectForm.remarks.trim()) { setError('Please provide rejection remarks.'); return }
    setSaving(true); setError('')
    try {
      await rejectIntern(rejectInternData.id, {
        remarks: rejectForm.remarks,
        suggested_mentor_id: rejectForm.suggested_mentor_id ? parseInt(rejectForm.suggested_mentor_id) : null
      })
      setSuccess(`${rejectInternData.name} has been rejected. HR has been notified.`)
      setRejectInternData(null)
      load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>New Interns</h1>
          <p>Review interns assigned to you — accept or reject each one</p>
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
                <th>Duration</th>
                <th>Start Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : interns.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <p>No new interns assigned</p>
                    <span>HR will notify you when a new intern is assigned to you.</span>
                  </div>
                </td></tr>
              ) : interns.map(i => (
                <tr key={i.id}>
                  <td><code style={{ fontSize: 12, color: 'var(--navy)' }}>{i.intern_id}</code></td>
                  <td style={{ fontWeight: 600 }}>{i.name}</td>
                  <td>{i.qualification}</td>
                  <td>{i.department}</td>
                  <td>{i.duration}</td>
                  <td>{i.start_date}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewIntern(i)}>👁 View</button>
                      <button className="btn btn-success btn-sm" onClick={() => openAccept(i)}>✅ Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => openReject(i)}>❌ Reject</button>
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
        </Modal>
      )}

      {/* Accept Modal */}
      {acceptInternData && (
        <Modal title="Accept Intern" onClose={() => setAcceptInternData(null)} size="modal-lg"
          footer={<>
            <button className="btn btn-outline" onClick={() => setAcceptInternData(null)}>Cancel</button>
            <button className="btn btn-success" onClick={handleAccept} disabled={saving}>
              {saving ? 'Accepting…' : '✅ Accept & Assign Project'}
            </button>
          </>}>
          <InternDetail intern={acceptInternData} />
          <div className="divider" />
          <p className="section-title">Assign Project</p>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="form-group">
            <label>Project Title *</label>
            <input
              value={project}
              onChange={e => setProject(e.target.value)}
              placeholder="e.g. Radar Signal Processing Algorithm, ML-based Threat Detection"
              autoFocus
            />
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectInternData && (
        <Modal title="Reject Intern" onClose={() => setRejectInternData(null)} size="modal-lg"
          footer={<>
            <button className="btn btn-outline" onClick={() => setRejectInternData(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleReject} disabled={saving}>
              {saving ? 'Submitting…' : '❌ Reject'}
            </button>
          </>}>
          <InternDetail intern={rejectInternData} />
          <div className="divider" />
          <p className="section-title">Rejection Details</p>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Remarks / Reason *</label>
            <textarea
              value={rejectForm.remarks}
              onChange={e => setRejectForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="Reason for rejection (e.g. workload full, domain mismatch, lab capacity)"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Suggest Another Mentor (Optional)</label>
            <select
              value={rejectForm.suggested_mentor_id}
              onChange={e => setRejectForm(f => ({ ...f, suggested_mentor_id: e.target.value }))}
            >
              <option value="">— No suggestion —</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name} — {m.department}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </>
  )
}
