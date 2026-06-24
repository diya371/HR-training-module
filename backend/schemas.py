from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class InternCreate(BaseModel):
    name: str
    age: int
    contact: str
    address: str
    qualification: str
    department: str
    duration: str
    start_date: str


class AssignMentorRequest(BaseModel):
    mentor_id: int


class AcceptInternRequest(BaseModel):
    project: str


class RejectInternRequest(BaseModel):
    remarks: str
    suggested_mentor_id: Optional[int] = None


class CompleteInternRequest(BaseModel):
    project_submitted: bool
    remarks: str
    attendance: str


class IssueCertificateRequest(BaseModel):
    fee_details: str
    hr_final_remarks: str


class MentorOut(BaseModel):
    id: int
    name: str
    department: str
    email: str

    class Config:
        from_attributes = True


class InternOut(BaseModel):
    id: int
    intern_id: str
    name: str
    age: int
    contact: str
    address: str
    qualification: str
    department: str
    duration: str
    start_date: str
    status: str
    mentor_id: Optional[int] = None
    project: Optional[str] = None
    rejection_reason: Optional[str] = None
    rejection_remarks: Optional[str] = None
    suggested_mentor_id: Optional[int] = None
    project_submitted: Optional[bool] = None
    completion_remarks: Optional[str] = None
    attendance: Optional[str] = None
    fee_details: Optional[str] = None
    hr_final_remarks: Optional[str] = None
    certificate_issued: bool = False
    created_at: Optional[datetime] = None
    mentor: Optional[MentorOut] = None
    suggested_mentor: Optional[MentorOut] = None

    class Config:
        from_attributes = True
