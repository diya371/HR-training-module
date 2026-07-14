import { useState } from 'react'
import { createIntern } from '../../api'

const DEPTS = ['Electronics & Radar', 'Computer Science', 'Aerospace Systems', 'Mechanical Engineering', 'Defence Systems', 'Cybersecurity', 'Biotechnology']
const DURATIONS = ['1 Month', '2 Months', '3 Months', '6 Months']

const EMPTY = { name: '', age: '', contact: '', address: '', qualification: '', department: '', duration: '', start_date: '' }

export default function AddNewIntern() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    for (const [k, v] of Object.entries(form)) {
      if (!v.toString().trim()) return `Please fill in: ${k.replace('_', ' ')}`
    }
    if (isNaN(form.age) || form.age < 16 || form.age > 35) return 'Age must be between 16 and 35'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError(''); setSuccess('')
    try {
    const intern = await createIntern({ ...form, age: parseInt(form.age) }, photoFile)
    setSuccess(`Intern added successfully! ID: ${intern.intern_id}`)
    setForm(EMPTY)
    setPhotoFile(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Add New Intern</h1>
        <p>Register a new intern into the DRDO training programme</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="card">
        <p className="section-title">Student Details</p>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Riya Malhotra" />
          </div>
          <div className="form-group">
            <label>Age *</label>
            <input type="number" value={form.age} onChange={set('age')} placeholder="e.g. 22" min="16" max="35" />
          </div>
          <div className="form-group">
            <label>Contact Number *</label>
            <input value={form.contact} onChange={set('contact')} placeholder="e.g. 9876543210" />
          </div>
          <div className="form-group">
          <label>Photo (optional)</label>
          <input
          type="file"
          accept="image/*"
            onChange={e => setPhotoFile(e.target.files[0])}
          />
        </div>
          <div className="form-group">
            <label>Educational Qualification *</label>
            <input value={form.qualification} onChange={set('qualification')} placeholder="e.g. B.Tech, IIT Delhi (3rd Year)" />
          </div>
          <div className="form-group form-full">
            <label>Address *</label>
            <textarea value={form.address} onChange={set('address')} placeholder="Full residential address" rows={2} />
          </div>
        </div>

        <div className="divider" />
        <p className="section-title">Internship Details</p>
        <div className="form-grid">
          <div className="form-group">
            <label>Department *</label>
            <select value={form.department} onChange={set('department')}>
              <option value="">— Select Department —</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Duration *</label>
            <select value={form.duration} onChange={set('duration')}>
              <option value="">— Select Duration —</option>
              {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" value={form.start_date} onChange={set('start_date')} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-outline" onClick={() => { setForm(EMPTY); setSuccess(''); setError('') }}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding…' : '➕ Add Intern'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="section-title">Bulk Upload</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
          Upload a CSV or Excel file to add multiple interns at once. File must include columns: name, age, contact, address, qualification, department, duration, start_date.
        </p>
        <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 24, marginBottom: 6 }}>📂</p>
          <p style={{ fontSize: 13 }}>Drag & drop CSV/Excel here, or <span style={{ color: 'var(--navy)', cursor: 'pointer', fontWeight: 600 }}>browse</span></p>
          <p style={{ fontSize: 11, marginTop: 6 }}>Supported formats: .csv, .xlsx</p>
        </div>
      </div>
    </>
  )
}
