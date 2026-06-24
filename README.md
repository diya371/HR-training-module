# DRDO HR Training Module

Intern Training Management System for DRDO — built with React (Vite) + FastAPI + SQLite.

## Project Structure

```
hr-training-module/
├── backend/          # FastAPI + SQLite
└── frontend/         # React + Vite
```

## Setup & Running

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server (auto-creates DB and seeds data on first run)
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Demo Login Credentials

| Role     | Username        | Password    |
|----------|----------------|-------------|
| HR Admin | `admin`        | `drdo123`   |
| Mentor 1 | `mentor1`      | `mentor123` |
| Mentor 2 | `mentor2`      | `mentor123` |
| Mentor 3 | `mentor3`      | `mentor123` |
| Mentor 4 | `mentor4`      | `mentor123` |
| Mentor 5 | `mentor5`      | `mentor123` |

---

## Intern Status Flow

```
New → Assigned → Ongoing → Completed → Issued
              ↘ Rejected → (Reassigned) → Assigned
```

| Status    | Triggered by                              |
|-----------|-------------------------------------------|
| New       | HR adds a new intern                      |
| Assigned  | HR assigns a mentor                       |
| Rejected  | Mentor rejects the intern                 |
| Ongoing   | Mentor accepts and assigns a project      |
| Completed | Mentor submits completion details         |
| Issued    | HR issues the completion certificate      |

---

## Features

### HR Admin
- Add new interns (form or bulk CSV upload UI)
- Assign mentors from a dropdown list
- View and reassign rejected interns (see rejection remarks + suggested mentor)
- Monitor ongoing internships
- Review completed interns and issue certificates
- View all issued certificates and reprint them
- Live status counts in sidebar

### Mentor
- View new interns assigned to them
- Accept (assign project) or Reject (with remarks + suggest another mentor)
- Mark ongoing interns as complete (project submitted Y/N, attendance, remarks)
- View completed interns month-wise with certificate issued column
- Print completion certificates

### Certificate
- Auto-generated printable DRDO certificate at `/certificate/print/:id`
- Includes intern details, project, mentor name, HR remarks, signatures
