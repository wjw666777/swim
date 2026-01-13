#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { xlsx: '', out: path.join(process.cwd(), 'src/data/shishiMarketVendors.js'), sheet: '' }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--xlsx') out.xlsx = args[++i]
    else if (a === '--out') out.out = args[++i]
    else if (a === '--sheet') out.sheet = args[++i]
  }
  if (!out.xlsx) process.exit(1)
  out.xlsx = path.isAbsolute(out.xlsx) ? out.xlsx : path.join(process.cwd(), out.xlsx)
  out.out = path.isAbsolute(out.out) ? out.out : path.join(process.cwd(), out.out)
  return out
}

function val(obj, keys) { for (const k of keys) { const v = obj[k]; if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim() } return '' }
function valR(obj, regs) { const keys = Object.keys(obj); for (const rgx of regs) { const k = keys.find(kk => rgx.test(String(kk))); if (k) { const v = obj[k]; if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim() } } return '' }

function parseRegion(addr) { if (!addr) return { province: '', city: '', district: '' }; const t = String(addr); let p='',c='',d=''; const pi=t.indexOf('省')>=0?t.indexOf('省'):t.indexOf('自治区'); const ci=t.indexOf('市'); const di=t.indexOf('区')>=0?t.indexOf('区'):t.indexOf('县'); try{ if(pi>0)p=t.slice(0,pi+1); if(ci>0){ const st=p?pi+1:0; c=t.slice(st,ci+1).replace(/^.*[省自治区]/,'') } if(di>0){ const st=c?ci+1:(p?pi+1:0); d=t.slice(st,di+1).replace(/^.*市/,'') } }catch{} return { province:p.trim(), city:c.trim(), district:d.trim() } }

function transform(r) {
  const company = val(r, ['企业名称','商家名称','公司名称','店铺名','店名','名称']) || valR(r, [/商家|公司.*名|企业.*名|店.*名|名称/i])
  const boss = val(r, ['法定代表人','老板','负责人','联系人','法人','店主']) || valR(r, [/法定代表|法人|负责人|联系人|老板|店主/i])
  const registerCapital = val(r, ['注册资本','注册资金']) || valR(r, [/注册.*资(本|金)/i])
  const paidInCapital = val(r, ['实缴资本','实收资本','实缴出资','注册资本实缴']) || valR(r, [/实(缴|收).*资(本|金)/i])
  const address = val(r, ['注册地址','地址','企业地址','商家地址','园区地址']) || valR(r, [/地址|注册地址/i])
  let province = val(r, ['所属省份','省','省份']) || valR(r, [/省(份)?/i])
  let city = val(r, ['所属城市','市','城市']) || valR(r, [/市|城市/i])
  let district = val(r, ['所属区县','区','区县']) || valR(r, [/区|县/i])
  if ((!province || !city) && address) { const rg = parseRegion(address); province = province || rg.province; city = city || rg.city; district = district || rg.district }
  const usefulPhone = val(r, ['有效手机号','有效电话号码','对外电话','电话','联系电话']) || valR(r, [/有效.*(手机号|手机|电话)|联系电话|电话/i])
  const morePhone = val(r, ['更多电话','更多电话号码','其它电话','备用电话','手机']) || valR(r, [/更多.*电话|手机|备用|其它|其他.*电话/i])
  const people = val(r, ['参保人数','人数','从业人数']) || valR(r, [/参保|人数|人员|从业.*人数/i])
  const scale = val(r, ['企业规模','规模']) || valR(r, [/规模/i])
  const profile = val(r, ['企业简介','公司简介','商家简介','简介']) || valR(r, [/简介/i])
  const businessScope = val(r, ['经营范围','主营']) || valR(r, [/经营范围|业务范围|主营/i])
  return { company, boss, registerCapital, paidInCapital, address, province, city, district, usefulPhone, morePhone, people, scale, profile, businessScope }
}

function bad(keys) { if (!keys || !keys.length) return true; const all = keys.every(k => !String(k).trim() || /^_\d+$/.test(String(k)) || String(k).includes('__EMPTY')); const has = keys.some(k => /公司|企业|商家|店|名称|地址|电话|法人|负责人|省|市|区|注册|参保|规模|简介|经营范围|主营|实缴|实收/.test(String(k))); return all || !has }

function parseSheet(sh) {
  let rows = XLSX.utils.sheet_to_json(sh, { defval: '' })
  let hdr = rows.length ? Object.keys(rows[0]) : []
  if (!bad(hdr)) return { rows, headerKeys: hdr, rangeUsed: 0 }
  for (let r = 1; r <= 3; r++) { rows = XLSX.utils.sheet_to_json(sh, { defval: '', range: r }); hdr = rows.length ? Object.keys(rows[0]) : [] ; if (!bad(hdr)) return { rows, headerKeys: hdr, rangeUsed: r } }
  const matrix = XLSX.utils.sheet_to_json(sh, { defval: '', header: 1 })
  if (matrix.length >= 2) { const h = matrix[1].map(v => String(v || '').trim()); const data = matrix.slice(2).map(arr => Object.fromEntries(arr.map((v, i) => [h[i] || `COL_${i}`, v]))); hdr = h; if (!bad(hdr)) return { rows: data, headerKeys: hdr, rangeUsed: 1 } }
  const h = (matrix[0] || []).map(v => String(v || '').trim())
  const data = (matrix.slice(1) || []).map(arr => Object.fromEntries(arr.map((v, i) => [h[i] || `COL_${i}`, v])))
  return { rows: data.length ? data : XLSX.utils.sheet_to_json(sh, { defval: '' }), headerKeys: h, rangeUsed: 0 }
}

function main() {
  const { xlsx, out, sheet } = parseArgs()
  if (!fs.existsSync(xlsx)) process.exit(1)
  const wb = XLSX.readFile(xlsx)
  let chosen = []
  let sheetName = ''
  if (sheet) {
    let tn = sheet
    const idx = Number.isInteger(Number(sheet)) ? Number(sheet) : NaN
    if (!isNaN(idx) && idx >= 0 && idx < wb.SheetNames.length) tn = wb.SheetNames[idx]
    if (wb.SheetNames.includes(tn)) { const sh = wb.Sheets[tn]; const p = parseSheet(sh); chosen = p.rows; sheetName = tn }
  }
  if (!chosen.length) { let best = wb.SheetNames[0]; let bestRows = [] ; for (const sn of wb.SheetNames) { const sh = wb.Sheets[sn]; const p = parseSheet(sh); if (p.rows.length > bestRows.length) { bestRows = p.rows; best = sn } } chosen = bestRows; sheetName = best }
  const data = chosen.map(transform)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, `export const shishiMarketVendorsData = ${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

main()
