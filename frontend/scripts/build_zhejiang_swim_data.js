#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { xlsx: '', out: path.join(process.cwd(), 'src/data/zhejiangswim.js'), sheet: '' }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--xlsx') out.xlsx = args[++i]
    else if (a === '--out') out.out = args[++i]
    else if (a === '--sheet') out.sheet = args[++i]
  }
  if (!out.xlsx) { console.error('Missing --xlsx <file.xlsx>'); process.exit(1) }
  out.xlsx = path.isAbsolute(out.xlsx) ? out.xlsx : path.join(process.cwd(), out.xlsx)
  out.out = path.isAbsolute(out.out) ? out.out : path.join(process.cwd(), out.out)
  return out
}

function firstNonEmpty(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') return String(obj[k]).trim()
  }
  return ''
}

function firstNonEmptyByRegex(obj, regexes) {
  const keys = Object.keys(obj)
  for (const rgx of regexes) {
    const k = keys.find((kk) => rgx.test(String(kk)))
    if (k && obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') return String(obj[k]).trim()
  }
  return ''
}

function parseRegion(address) {
  if (!address) return { province: '', city: '', district: '' }
  const text = String(address)
  let province = '', city = '', district = ''
  const provIdx = text.indexOf('省') >= 0 ? text.indexOf('省') : text.indexOf('自治区')
  const cityIdx = text.indexOf('市')
  const distIdx = text.indexOf('区') >= 0 ? text.indexOf('区') : text.indexOf('县')
  try {
    if (provIdx > 0) province = text.slice(0, provIdx + 1)
    if (cityIdx > 0) {
      const start = province ? provIdx + 1 : 0
      city = text.slice(start, cityIdx + 1).replace(/^.*[省自治区]/, '')
    }
    if (distIdx > 0) {
      const start = city ? cityIdx + 1 : (province ? provIdx + 1 : 0)
      district = text.slice(start, distIdx + 1).replace(/^.*市/, '')
    }
  } catch {}
  return { province: province.trim(), city: city.trim(), district: district.trim() }
}

function transformRow(r) {
  const company = firstNonEmpty(r, ['企业名称','公司名称','公司名','名称'])
    || firstNonEmptyByRegex(r, [/公司.*名|企业.*名|公司.*称|企业.*称/i])
  const boss = firstNonEmpty(r, ['法定代表人','老板','负责人','联系人','法人'])
    || firstNonEmptyByRegex(r, [/法定代表|法人|负责人|联系人|老板/i])
  const registerCapital = firstNonEmpty(r, ['注册资本','注册资金'])
    || firstNonEmptyByRegex(r, [/注册.*资(本|金)/i])
  const paidInCapital = firstNonEmpty(r, ['实缴资本','实收资本','实缴出资','注册资本实缴'])
    || firstNonEmptyByRegex(r, [/实(缴|收).*资(本|金)/i])
  const address = firstNonEmpty(r, ['注册地址','地址','企业地址'])
    || firstNonEmptyByRegex(r, [/地址|注册地址/i])
  let province = firstNonEmpty(r, ['所属省份','省','省份'])
    || firstNonEmptyByRegex(r, [/省(份)?/i])
  let city = firstNonEmpty(r, ['所属城市','市','城市'])
    || firstNonEmptyByRegex(r, [/市|城市/i])
  let district = firstNonEmpty(r, ['所属区县','区','区县'])
    || firstNonEmptyByRegex(r, [/区|县/i])
  if ((!province || !city) && address) {
    const region = parseRegion(address)
    province = province || region.province
    city = city || region.city
    district = district || region.district
  }
  const usefulPhone = firstNonEmpty(r, ['有效手机号','有效电话号码','对外电话','电话','联系电话'])
    || firstNonEmptyByRegex(r, [/有效.*(手机号|手机|电话)|联系电话|电话/i])
  const morePhone = firstNonEmpty(r, ['更多电话','更多电话号码','其它电话','备用电话','手机'])
    || firstNonEmptyByRegex(r, [/更多.*电话|手机|备用|其它|其他.*电话/i])
  const people = firstNonEmpty(r, ['参保人数','人数','从业人数'])
    || firstNonEmptyByRegex(r, [/参保|人数|人员|从业.*人数/i])
  const scale = firstNonEmpty(r, ['企业规模','规模'])
    || firstNonEmptyByRegex(r, [/规模/i])
  const profile = firstNonEmpty(r, ['企业简介','公司简介','简介'])
    || firstNonEmptyByRegex(r, [/简介/i])
  const businessScope = firstNonEmpty(r, ['经营范围'])
    || firstNonEmptyByRegex(r, [/经营范围|业务范围/i])

  return {
    company,
    boss,
    registerCapital,
    paidInCapital,
    address,
    province,
    city,
    district,
    usefulPhone,
    morePhone,
    people,
    scale,
    profile,
    businessScope,
  }
}

function isBadHeaders(keys) {
  if (!keys || !keys.length) return true
  const allBlankish = keys.every(k => !String(k).trim() || /^_\d+$/.test(String(k)) || String(k).includes('__EMPTY'))
  const hasMeaningful = keys.some(k => /公司|企业|名称|地址|电话|法人|负责人|省|市|区|注册|参保|规模|简介|经营范围|实缴|实收/.test(String(k)))
  return allBlankish || !hasMeaningful
}

function smartParseSheet(sh) {
  let rows = XLSX.utils.sheet_to_json(sh, { defval: '' })
  let headerKeys = rows.length ? Object.keys(rows[0]) : []
  if (!isBadHeaders(headerKeys)) return { rows, headerKeys, rangeUsed: 0 }
  for (let r = 1; r <= 3; r++) {
    rows = XLSX.utils.sheet_to_json(sh, { defval: '', range: r })
    headerKeys = rows.length ? Object.keys(rows[0]) : []
    if (!isBadHeaders(headerKeys)) return { rows, headerKeys, rangeUsed: r }
  }
  const matrix = XLSX.utils.sheet_to_json(sh, { defval: '', header: 1 })
  if (matrix.length >= 2) {
    const hdr = matrix[1].map(v => String(v || '').trim())
    const dataRows = matrix.slice(2).map(arr => Object.fromEntries(arr.map((v, i) => [hdr[i] || `COL_${i}`, v])))
    headerKeys = hdr
    if (!isBadHeaders(headerKeys)) return { rows: dataRows, headerKeys, rangeUsed: 1 }
  }
  const hdr = (matrix[0] || []).map(v => String(v || '').trim())
  const dataRows = (matrix.slice(1) || []).map(arr => Object.fromEntries(arr.map((v, i) => [hdr[i] || `COL_${i}`, v])))
  return { rows: dataRows.length ? dataRows : XLSX.utils.sheet_to_json(sh, { defval: '' }), headerKeys: hdr, rangeUsed: 0 }
}

function main() {
  const { xlsx, out, sheet } = parseArgs()
  if (!fs.existsSync(xlsx)) { console.error('XLSX file not found:', xlsx); process.exit(1) }
  const wb = XLSX.readFile(xlsx)
  let chosenRows = []
  let chosenSheetName = ''
  if (sheet) {
    let targetName = sheet
    const idx = Number.isInteger(Number(sheet)) ? Number(sheet) : NaN
    if (!isNaN(idx) && idx >= 0 && idx < wb.SheetNames.length) targetName = wb.SheetNames[idx]
    if (wb.SheetNames.includes(targetName)) {
      const sh = wb.Sheets[targetName]
      const parsed = smartParseSheet(sh)
      chosenRows = parsed.rows
      chosenSheetName = targetName
      console.log(`Using specified sheet '${chosenSheetName}' -> rows: ${chosenRows.length} (range shift: ${parsed.rangeUsed})`)
      console.log('Detected headers:', (parsed.headerKeys || []).join(' | '))
    } else {
      console.warn(`Specified sheet '${sheet}' not found. Fallback to auto-select by max rows.`)
    }
  }
  if (!chosenRows.length) {
    let bestSheetName = wb.SheetNames[0]
    let bestRows = []
    let bestHeaderKeys = []
    let bestRangeUsed = 0
    for (const sn of wb.SheetNames) {
      const sh = wb.Sheets[sn]
      const parsed = smartParseSheet(sh)
      console.log(`Sheet '${sn}' -> rows: ${parsed.rows.length} (range shift: ${parsed.rangeUsed})`)
      if (parsed.rows.length > bestRows.length) { bestRows = parsed.rows; bestSheetName = sn; bestHeaderKeys = parsed.headerKeys; bestRangeUsed = parsed.rangeUsed }
    }
    chosenRows = bestRows
    chosenSheetName = bestSheetName
    console.log(`Using sheet '${chosenSheetName}' with ${chosenRows.length} rows (range shift: ${bestRangeUsed})`)
    console.log('Detected headers:', (bestHeaderKeys || []).join(' | '))
  }

  const data = chosenRows.map(transformRow)

  const outDir = path.dirname(out)
  fs.mkdirSync(outDir, { recursive: true })
  const js = `export const zhejiangSwimData = ${JSON.stringify(data, null, 2)}\n`
  fs.writeFileSync(out, js, 'utf8')
  console.log('Written JS data to', out)
}

main()

