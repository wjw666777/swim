export const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function buildUrl(path) {
  if (!API_BASE) return ''
  return API_BASE.replace(/\/$/, '') + path
}

export async function fetchCompanies() {
  const url = buildUrl('/api/crm/data')
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function addCompanyApi(company) {
  const url = buildUrl('/api/crm/company')
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(company)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteCompanyApi(id) {
  const url = buildUrl(`/api/crm/company/${id}`)
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateCompanyApi(id, update) {
  const url = buildUrl(`/api/crm/company/${id}`)
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(update)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}