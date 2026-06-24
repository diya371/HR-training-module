import { useState, useEffect, useCallback } from 'react'
import { getInterns } from '../../api'
import Modal from '../../components/Modal'
import InternDetail from '../../components/InternDetail'

export default function HROngoing() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewIntern, setViewIntern] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setInterns(await getInterns('ongoing')) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Ongoing Internships</h1>
          <p>Interns currently active and working under their assigned mentor</p>
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
                <th>Start Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : interns.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <p>No ongoing internships</p>
                    <span>Once a mentor accepts an intern, they'll appear here.</span>
                  </div>
                </td></tr>
              ) : interns.map(i => (
                <tr key={i.id}>
                  <td><code style={{ fontSize: 12, color: 'var(--navy)' }}>{i.intern_id}</code></td>
                  <td style={{ fontWeight: 600 }}>{i.name}</td>
                  <td>{i.department}</td>
                  <td>{i.mentor?.name || '—'}</td>
                  <td style={{ maxWidth: 160, fontSize: 12 }}>{i.project || '—'}</td>
                  <td>{i.duration}</td>
                  <td>{i.start_date}</td>
                  <td><span className="badge badge-ongoing">Ongoing</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewIntern(i)}>👁 View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewIntern && (
        <Modal title="Intern Details" onClose={() => setViewIntern(null)}
          footer={<button className="btn btn-outline" onClick={() => setViewIntern(null)}>Close</button>}>
          <InternDetail intern={viewIntern} />
          <div className="divider" />
          <div className="detail-grid">
            <div className="detail-item">
              <label>Mentor</label>
              <span>{viewIntern.mentor?.name || '—'}</span>
            </div>
            <div className="detail-item">
              <label>Mentor Department</label>
              <span>{viewIntern.mentor?.department || '—'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}>
              <label>Assigned Project</label>
              <span>{viewIntern.project || '—'}</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
