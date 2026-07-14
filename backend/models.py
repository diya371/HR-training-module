from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # "hr" or "mentor"
    mentor = relationship("Mentor", back_populates="user", uselist=False)


class Mentor(Base):
    __tablename__ = "mentors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    department = Column(String)
    email = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="mentor")
    interns = relationship("Intern", foreign_keys="Intern.mentor_id", back_populates="mentor")


class Intern(Base):
    __tablename__ = "interns"
    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(String, unique=True, index=True)
    name = Column(String)
    age = Column(Integer)
    contact = Column(String)
    address = Column(Text)
    qualification = Column(String)
    department = Column(String)
    duration = Column(String)
    start_date = Column(String)
    status = Column(String, default="new")  # new, assigned, rejected, ongoing, completed, issued
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=True)
    project = Column(String, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    rejection_remarks = Column(Text, nullable=True)
    suggested_mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=True)
    # Completion fields (filled by mentor)
    project_submitted = Column(Boolean, nullable=True)
    completion_remarks = Column(Text, nullable=True)
    attendance = Column(String, nullable=True)
    # Certificate fields (filled by HR)
    fee_details = Column(String, nullable=True)
    hr_final_remarks = Column(Text, nullable=True)
    certificate_issued = Column(Boolean, default=False)
    photo = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    mentor = relationship("Mentor", foreign_keys=[mentor_id], back_populates="interns")
    suggested_mentor = relationship("Mentor", foreign_keys=[suggested_mentor_id])
