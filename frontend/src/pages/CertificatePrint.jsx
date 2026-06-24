import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getIntern } from '../api'

export default function CertificatePrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [intern, setIntern] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getIntern(id)
      .then(setIntern)
      .catch(() => setError('Could not load intern details.'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => window.print()

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#718096' }}>
      Loading certificate…
    </div>
  )

  if (error || !intern) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#c53030', marginBottom: 12 }}>{error || 'Intern not found.'}</p>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', cursor: 'pointer' }}>← Go Back</button>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f0f4f8', minHeight: '100vh', padding: '24px' }}>

      {/* Print controls — hidden when printing */}
      <div className="no-print" style={{ maxWidth: 720, margin: '0 auto 20px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '8px 16px', background: 'transparent', border: '1.5px solid #cbd5e0', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          style={{ padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      {/* Certificate */}
      <div style={{ maxWidth: 720, margin: '0 auto', background: '#fff', padding: '60px 60px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <div style={{ border: '6px double #1e3a5f', padding: '40px', textAlign: 'center' }}>

          {/* Header */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#718096', textTransform: 'uppercase', marginBottom: 4 }}>
              Government of India
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Defence Research & Development Organisation
            </h1>
            <div style={{ fontSize: 12, color: '#718096', marginBottom: 20 }}>Ministry of Defence, New Delhi</div>
            <div style={{ width: 80, height: 2, background: '#c8a951', margin: '0 auto 20px' }} />
          </div>

          {/* Title */}
          <div style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#c8a951', margin: '0 0 6px', letterSpacing: '0.04em' }}>
              INTERNSHIP COMPLETION
            </h2>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#c8a951', margin: 0, letterSpacing: '0.04em' }}>
              CERTIFICATE
            </h2>
          </div>

          {/* Body */}
          <div style={{ fontSize: 15, lineHeight: 1.9, color: '#2d3748', maxWidth: 520, margin: '0 auto 30px' }}>
            <p>This is to certify that</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: '#1e3a5f', margin: '10px 0', fontStyle: 'italic' }}>
              {intern.name}
            </p>
            <p style={{ fontSize: 13, color: '#718096', marginBottom: 10 }}>
              {intern.qualification}
            </p>
            <p>
              has successfully completed an internship at DRDO under the{' '}
              <strong>{intern.department}</strong> division from{' '}
              <strong>{intern.start_date}</strong> for a duration of{' '}
              <strong>{intern.duration}</strong>.
            </p>
            {intern.project && (
              <p style={{ marginTop: 10 }}>
                The intern worked on the project: <strong>"{intern.project}"</strong>
              </p>
            )}
            {intern.attendance && (
              <p style={{ marginTop: 10, fontSize: 13 }}>
                Attendance: <strong>{intern.attendance}</strong>
              </p>
            )}
            {intern.hr_final_remarks && (
              <p style={{ marginTop: 10, fontStyle: 'italic', color: '#4a5568', fontSize: 13 }}>
                "{intern.hr_final_remarks}"
              </p>
            )}
          </div>

          {/* Intern ID */}
          <div style={{ marginBottom: 30, fontSize: 12, color: '#718096' }}>
            Intern ID: <strong style={{ color: '#1e3a5f' }}>{intern.intern_id}</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            Issue Date: <strong style={{ color: '#1e3a5f' }}>{today}</strong>
          </div>

          <div style={{ width: 80, height: 2, background: '#c8a951', margin: '0 auto 30px' }} />

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ textAlign: 'center', minWidth: 160 }}>
              <div style={{ borderTop: '1.5px solid #2d3748', paddingTop: 8, fontSize: 12, color: '#4a5568' }}>
                <strong>{intern.mentor?.name || 'Mentor'}</strong>
                <br />Mentor, {intern.mentor?.department || 'DRDO'}
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 160 }}>
              <div style={{ borderTop: '1.5px solid #2d3748', paddingTop: 8, fontSize: 12, color: '#4a5568' }}>
                <strong>HR Administrator</strong>
                <br />Human Resources, DRDO
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 160 }}>
              <div style={{ borderTop: '1.5px solid #2d3748', paddingTop: 8, fontSize: 12, color: '#4a5568' }}>
                <strong>Director</strong>
                <br />DRDO, New Delhi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
