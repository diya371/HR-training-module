import { useState, useEffect, useCallback } from 'react'
import { getInterns, getMentors, assignMentor } from '../../api'
import Modal from '../../components/Modal'
import InternDetail from '../../components/InternDetail'

export default function RejectedByMentor() {
  const [interns, setInterns] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewIntern, setViewIntern] = useState(null)
  const [reassignIntern, setReassignIntern] = useState(null)
  const [selectedMentor, setSelectedMentor] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [i, m] = await Promise.all([getInterns('rejected'), getMentors()])
      setInterns(i); setMentors(m)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openReassign = (intern) => {
    setReassignIntern(intern)
    setSelectedMentor(intern.suggested_mentor_id?.toString() || '')
    setError('')
  }

  const handleReassign = async () => {
    if (!selectedMentor) { setError('Please select a mentor.'); return }
    setSaving(true); setError('')
    try {
      await assignMentor(reassignIntern.id, parseInt(selectedMentor))
      setSuccess(`${reassignIntern.name} has been reassigned successfully.`)
      setReassignIntern(null)
      load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Rejected by Mentor</h1>
          <p>Interns whose mentor assignment was rejected — reassign them to another mentor</p>
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
                <th>Rejected By</th>
                <th>Rejection Remarks</th>
                <th>Suggested Mentor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : interns.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <p>No rejected interns</p>
                    <span>All good — no rejections at the moment.</span>
                  </div>
                </td></tr>
              ) : interns.map(i => (
                <tr key={i.id}>
                  <td><code style={{ fontSize: 12, color: 'var(--navy)' }}>{i.intern_id}</code></td>
                  <td style={{ fontWeight: 600 }}>{i.name}</td>
                  <td>{i.department}</td>
                  <td>{i.mentor?.name || '—'}</td>
                  <td style={{ maxWidth: 200 }}>
                    <span style={{ color: 'var(--danger)', fontSize: 12 }}>
                      {i.rejection_remarks || '—'}
                    </span>
                  </td>
                  <td>
                    {i.suggested_mentor ? (
                      <span style={{ fontSize: 12, color: 'var(--info)' }}>{i.suggested_mentor.name}</span>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewIntern(i)}>👁 View</button>
                      <button className="btn btn-gold btn-sm" onClick={() => openReassign(i)}>🔄 Reassign</button>
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
          <p className="section-title">Rejection Details</p>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Rejected By</label>
              <span>{viewIntern.mentor?.name || '—'}</span>
            </div>
            <div className="detail-item">
              <label>Suggested Mentor</label>
              <span>{viewIntern.suggested_mentor?.name || 'None'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}>
              <label>Remarks</label>
              <span>{viewIntern.rejection_remarks || '—'}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Reassign Modal */}
      {reassignIntern && (
        <Modal title="Reassign Mentor" onClose={() => setReassignIntern(null)} size="modal-lg"
          footer={<>
            <button className="btn btn-outline" onClick={() => setReassignIntern(null)}>Cancel</button>
            <button className="btn btn-gold" onClick={handleReassign} disabled={saving}>
              {saving ? 'Reassigning…' : '🔄 Reassign'}
            </button>
          </>}>
          <p className="section-title">Intern Information</p>
          <InternDetail intern={reassignIntern} />
          <div className="divider" />
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Previous Mentor</label>
            <input value={reassignIntern.mentor?.name || '—'} disabled style={{ background: 'var(--bg)' }} />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label>Assign New Mentor *</label>
            <select value={selectedMentor} onChange={e => setSelectedMentor(e.target.value)}>
              <option value="">— Choose a Mentor —</option>
              {mentors.filter(m => m.id !== reassignIntern.mentor_id).map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.department}
                  {reassignIntern.suggested_mentor_id === m.id ? ' ⭐ (Suggested)' : ''}
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </>
  )
}
