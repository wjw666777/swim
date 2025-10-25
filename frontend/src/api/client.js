// 优先使用环境变量，其次使用本地存储，最后使用默认Worker地址（便于本地预览）
export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof localStorage !== 'undefined' ? localStorage.getItem('API_BASE') : '') ||
  'https://crm-api-worker.939338219.workers.dev'
)

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

// -------- Chongfengyi API --------
export async function fetchChongfengyiCompanies() {
  const url = buildUrl('/api/chongfengyi/data')
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function addChongfengyiCompany(company) {
  const url = buildUrl('/api/chongfengyi/company')
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(company)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteChongfengyiCompany(id) {
  const url = buildUrl(`/api/chongfengyi/company/${id}`)
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateChongfengyiCompany(id, update) {
  const url = buildUrl(`/api/chongfengyi/company/${id}`)
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(update)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// -------- Chongfengyi Visit Status / Logs --------
export async function fetchChongfengyiVisitStatus() {
  const url = buildUrl('/api/chongfengyi/visit/status')
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateChongfengyiVisitStatus(id, status) {
  const url = buildUrl('/api/chongfengyi/visit/status')
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ id, status })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchChongfengyiVisitLogs(id) {
  const url = buildUrl(`/api/chongfengyi/visit/logs/${id}`)
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function addChongfengyiVisitLog(id, log) {
  const url = buildUrl(`/api/chongfengyi/visit/logs/${id}`)
  if (!url) throw new Error('API base url not set')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(log)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}