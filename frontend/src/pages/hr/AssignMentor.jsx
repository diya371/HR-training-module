import { useState, useEffect, useCallback } from 'react'
import { getInterns, getMentors, assignMentor } from '../../api'
import Modal from '../../components/Modal'
import InternDetail from '../../components/InternDetail'

export default function AssignMentor() {
  const [interns, setInterns] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewIntern, setViewIntern] = useState(null)
  const [assignIntern, setAssignIntern] = useState(null)
  const [selectedMentor, setSelectedMentor] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [i, m] = await Promise.all([getInterns('new'), getMentors()])
      setInterns(i); setMentors(m)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAssign = (intern) => {
    setAssignIntern(intern)
    setSelectedMentor('')
    setError('')
  }

  const handleAssign = async () => {
    if (!selectedMentor) { setError('Please select a mentor.'); return }
    setAssigning(true); setError('')
    try {
      await assignMentor(assignIntern.id, parseInt(selectedMentor))
      setSuccess(`Mentor assigned to ${assignIntern.name} successfully.`)
      setAssignIntern(null)
      load()
    } catch (e) { setError(e.message) }
    finally { setAssigning(false) }
  }

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Assign Mentor</h1>
          <p>Review new interns and assign them to a DRDO mentor</p>
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
                    <p>No new interns</p>
                    <span>All interns have been assigned or no new entries yet.</span>
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
                      <button className="btn btn-primary btn-sm" onClick={() => openAssign(i)}>🔗 Assign Mentor</button>
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

      {/* Assign Mentor Modal */}
      {assignIntern && (
        <Modal title="Assign Mentor" onClose={() => setAssignIntern(null)} size="modal-lg"
          footer={<>
            <button className="btn btn-outline" onClick={() => setAssignIntern(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAssign} disabled={assigning}>
              {assigning ? 'Assigning…' : '🔗 Assign'}
            </button>
          </>}>
          <p className="section-title">Intern Information</p>
          <InternDetail intern={assignIntern} />
          <div className="divider" />
          <p className="section-title">Select Mentor</p>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="form-group">
            <label>Mentor *</label>
            <select value={selectedMentor} onChange={e => setSelectedMentor(e.target.value)}>
              <option value="">— Choose a Mentor —</option>
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
