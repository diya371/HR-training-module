const BASE = 'https://hr-training-module.onrender.com/api'
async function req(url, opts = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}x

// Auth
export const login = (body) => req('/login', { method: 'POST', body })

// Interns
export const getInterns = (status) =>
  req('/interns' + (status ? `?status=${status}` : ''))

export const getIntern = (id) => req(`/interns/${id}`)

export const createIntern = async (data, photoFile) => {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => formData.append(k, v))
  if (photoFile) formData.append('photo', photoFile)
  const res = await fetch('/api/interns', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Failed to create intern')
  return res.json()
}

export const assignMentor = (id, mentor_id) =>
  req(`/interns/${id}/assign-mentor`, { method: 'PUT', body: { mentor_id } })

export const issueCertificate = (id, body) =>
  req(`/interns/${id}/issue-certificate`, { method: 'PUT', body })

// Mentor actions
export const getMentorInterns = (mentorId, status) =>
  req(`/mentor/${mentorId}/interns` + (status ? `?status=${status}` : ''))

export const acceptIntern = (id, project) =>
  req(`/interns/${id}/accept`, { method: 'PUT', body: { project } })

export const rejectIntern = (id, body) =>
  req(`/interns/${id}/reject`, { method: 'PUT', body })

export const markComplete = (id, body) =>
  req(`/interns/${id}/mark-complete`, { method: 'PUT', body })

// Mentors list
export const getMentors = () => req('/mentors')

// Stats
export const getStats = () => req('/stats')
export const getMentorStats = (mentorId) => req(`/mentor/${mentorId}/stats`)