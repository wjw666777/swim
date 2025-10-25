// 将本地JS数据(frontend/src/data/jackets.js)导入到Cloudflare KV（CHONGFENGYI_KV）
// 用法：node frontend/scripts/import_jackets.js --api https://<your-worker-domain>

import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 使用已生成的JS数据（由 scripts/build_jackets_data.js 生成）
import { jacketsData } from '../src/data/jackets.js'

async function main() {
  const argApiIndex = process.argv.indexOf('--api')
  if (argApiIndex === -1 || !process.argv[argApiIndex + 1]) {
    console.error('请提供Worker地址，例如：--api https://crm-api-worker.939338219.workers.dev')
    process.exit(1)
  }
  const apiBase = process.argv[argApiIndex + 1]

  if (!Array.isArray(jacketsData) || jacketsData.length === 0) {
    console.error('本地数据为空或格式不正确：frontend/src/data/jackets.js')
    process.exit(1)
  }

  const res = await fetch(`${apiBase}/api/chongfengyi/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jacketsData)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`导入失败：HTTP ${res.status} ${text}`)
  }
  console.log('导入成功，共', jacketsData.length, '条记录')
}

main().catch(err => { console.error(err); process.exit(1) })