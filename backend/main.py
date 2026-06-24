from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import models, schemas
from database import engine, get_db, Base

app = FastAPI(title="DRDO HR Training Module")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://hr-training-module-1.onrender.com"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_db(db: Session):
    if db.query(models.User).count() > 0:
        return

    # HR admin user
    hr_user = models.User(username="admin", password="drdo123", role="hr")
    db.add(hr_user)
    db.flush()

    # Mentor users and profiles
    mentor_data = [
        ("Dr. Rajesh Kumar", "Electronics & Radar", "rajesh.kumar@drdo.gov.in"),
        ("Dr. Priya Sharma", "Computer Science", "priya.sharma@drdo.gov.in"),
        ("Dr. Amit Singh", "Aerospace Systems", "amit.singh@drdo.gov.in"),
        ("Dr. Sunita Verma", "Mechanical Engineering", "sunita.verma@drdo.gov.in"),
        ("Dr. Vikram Nair", "Defence Systems", "vikram.nair@drdo.gov.in"),
    ]

    for i, (name, dept, email) in enumerate(mentor_data, start=1):
        user = models.User(username=f"mentor{i}", password="mentor123", role="mentor")
        db.add(user)
        db.flush()
        mentor = models.Mentor(name=name, department=dept, email=email, user_id=user.id)
        db.add(mentor)

    db.commit()


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    seed_db(db)


# ── AUTH ────────────────────────────────────────────────
@app.post("/api/login")
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == req.username).first()
    if not user or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    result = {"user_id": user.id, "role": user.role, "username": user.username}
    if user.role == "mentor":
        mentor = db.query(models.Mentor).filter(models.Mentor.user_id == user.id).first()
        if mentor:
            result["mentor_id"] = mentor.id
            result["mentor_name"] = mentor.name
    return result


# ── MENTORS ─────────────────────────────────────────────
@app.get("/api/mentors", response_model=list[schemas.MentorOut])
def get_mentors(db: Session = Depends(get_db)):
    return db.query(models.Mentor).all()


# ── STATS ───────────────────────────────────────────────
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    statuses = ["new", "assigned", "rejected", "ongoing", "completed", "issued"]
    return {s: db.query(models.Intern).filter(models.Intern.status == s).count() for s in statuses}


# ── INTERNS (HR) ─────────────────────────────────────────
def generate_intern_id(db: Session) -> str:
    year = datetime.now().year
    count = db.query(models.Intern).count() + 1
    return f"DRDO-{year}-{count:04d}"


@app.get("/api/interns", response_model=list[schemas.InternOut])
def get_interns(status: str = None, db: Session = Depends(get_db)):
    q = db.query(models.Intern)
    if status:
        statuses = status.split(",")
        q = q.filter(models.Intern.status.in_(statuses))
    return q.order_by(models.Intern.created_at.desc()).all()


@app.get("/api/interns/{intern_id}", response_model=schemas.InternOut)
def get_intern(intern_id: int, db: Session = Depends(get_db)):
    intern = db.query(models.Intern).filter(models.Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    return intern


@app.post("/api/interns", response_model=schemas.InternOut)
def create_intern(data: schemas.InternCreate, db: Session = Depends(get_db)):
    intern = models.Intern(
        intern_id=generate_intern_id(db),
        **data.model_dump(),
        status="new"
    )
    db.add(intern)
    db.commit()
    db.refresh(intern)
    return intern


@app.put("/api/interns/{intern_id}/assign-mentor", response_model=schemas.InternOut)
def assign_mentor(intern_id: int, req: schemas.AssignMentorRequest, db: Session = Depends(get_db)):
    intern = db.query(models.Intern).filter(models.Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    intern.mentor_id = req.mentor_id
    intern.status = "assigned"
    intern.rejection_reason = None
    intern.rejection_remarks = None
    db.commit()
    db.refresh(intern)
    return intern


@app.put("/api/interns/{intern_id}/issue-certificate", response_model=schemas.InternOut)
def issue_certificate(intern_id: int, req: schemas.IssueCertificateRequest, db: Session = Depends(get_db)):
    intern = db.query(models.Intern).filter(models.Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    intern.fee_details = req.fee_details
    intern.hr_final_remarks = req.hr_final_remarks
    intern.certificate_issued = True
    intern.status = "issued"
    db.commit()
    db.refresh(intern)
    return intern


# ── MENTOR ACTIONS ───────────────────────────────────────
@app.get("/api/mentor/{mentor_id}/interns", response_model=list[schemas.InternOut])
def get_mentor_interns(mentor_id: int, status: str = None, db: Session = Depends(get_db)):
    q = db.query(models.Intern).filter(models.Intern.mentor_id == mentor_id)
    if status:
        statuses = status.split(",")
        q = q.filter(models.Intern.status.in_(statuses))
    return q.order_by(models.Intern.created_at.desc()).all()


@app.put("/api/interns/{intern_id}/accept", response_model=schemas.InternOut)
def accept_intern(intern_id: int, req: schemas.AcceptInternRequest, db: Session = Depends(get_db)):
    intern = db.query(models.Intern).filter(models.Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    intern.project = req.project
    intern.status = "ongoing"
    db.commit()
    db.refresh(intern)
    return intern


@app.put("/api/interns/{intern_id}/reject", response_model=schemas.InternOut)
def reject_intern(intern_id: int, req: schemas.RejectInternRequest, db: Session = Depends(get_db)):
    intern = db.query(models.Intern).filter(models.Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    intern.rejection_remarks = req.remarks
    intern.suggested_mentor_id = req.suggested_mentor_id
    intern.status = "rejected"
    db.commit()
    db.refresh(intern)
    return intern


@app.put("/api/interns/{intern_id}/mark-complete", response_model=schemas.InternOut)
def mark_complete(intern_id: int, req: schemas.CompleteInternRequest, db: Session = Depends(get_db)):
    intern = db.query(models.Intern).filter(models.Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    intern.project_submitted = req.project_submitted
    intern.completion_remarks = req.remarks
    intern.attendance = req.attendance
    intern.status = "completed"
    db.commit()
    db.refresh(intern)
    return intern


@app.get("/api/mentor/{mentor_id}/stats")
def get_mentor_stats(mentor_id: int, db: Session = Depends(get_db)):
    statuses = ["assigned", "ongoing", "completed", "issued"]
    return {
        s: db.query(models.Intern)
           .filter(models.Intern.mentor_id == mentor_id, models.Intern.status == s)
           .count()
        for s in statuses
    }
