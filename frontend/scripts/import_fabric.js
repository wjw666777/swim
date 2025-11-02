// 将本地JS数据(frontend/src/data/fabric.js)导入到Cloudflare KV（CRM_KV）
// 用法：node frontend/scripts/import_fabric.js --api https://<your-worker-domain>

import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 使用已生成的JS数据（由 scripts/build_fabric_data.js 生成）
import { fabricData } from '../src/data/fabric.js'

async function main() {
  const argApiIndex = process.argv.indexOf('--api')
  if (argApiIndex === -1 || !process.argv[argApiIndex + 1]) {
    console.error('请提供Worker地址，例如：--api https://crm-api-worker.939338219.workers.dev')
    process.exit(1)
  }
  const apiBase = process.argv[argApiIndex + 1]

  if (!Array.isArray(fabricData) || fabricData.length === 0) {
    console.error('本地数据为空或格式不正确：frontend/src/data/fabric.js')
    process.exit(1)
  }

  const res = await fetch(`${apiBase}/api/fabric/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fabricData)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`导入失败：HTTP ${res.status} ${text}`)
  }
  console.log('导入成功，共', fabricData.length, '条记录')
}

main().catch(err => { console.error(err); process.exit(1) })