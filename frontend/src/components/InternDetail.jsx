export default function InternDetail({ intern }) {
  if (!intern) return null
  return (
    <div className="detail-grid">
      <div className="detail-item">
        <label>Intern ID</label>
        <span>{intern.intern_id}</span>
      </div>
      <div className="detail-item">
        <label>Name</label>
        <span>{intern.name}</span>
      </div>
      <div className="detail-item">
        <label>Age</label>
        <span>{intern.age}</span>
      </div>
      <div className="detail-item">
        <label>Contact</label>
        <span>{intern.contact}</span>
      </div>
      <div className="detail-item">
        <label>Qualification</label>
        <span>{intern.qualification}</span>
      </div>
      <div className="detail-item">
        <label>Department</label>
        <span>{intern.department}</span>
      </div>
      <div className="detail-item">
        <label>Duration</label>
        <span>{intern.duration}</span>
      </div>
      <div className="detail-item">
        <label>Start Date</label>
        <span>{intern.start_date}</span>
      </div>
      <div className="detail-item" style={{ gridColumn: '1/-1' }}>
        <label>Address</label>
        <span>{intern.address}</span>
      </div>
    </div>
  )
}
