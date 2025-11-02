#!/usr/bin/env node
/**
 * Convert an XLSX file to a JS module exporting `jacketsData`.
 * Usage:
 *   node scripts/build_jackets_data.js --xlsx ./path/to/file.xlsx [--out ./src/data/jackets.js]
 */
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { xlsx: '', out: path.join(process.cwd(), 'src/data/jackets.js'), sheet: '' }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--xlsx') out.xlsx = args[++i]
    else if (a === '--out') out.out = args[++i]
    else if (a === '--sheet') out.sheet = args[++i]
  }
  if (!out.xlsx) {
    console.error('Missing --xlsx <file.xlsx>')
    process.exit(1)
  }
  out.xlsx = path.isAbsolute(out.xlsx) ? out.xlsx : path.join(process.cwd(), out.xlsx)
  out.out = path.isAbsolute(out.out) ? out.out : path.join(process.cwd(), out.out)
  return out
}

function firstNonEmpty(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
      return String(obj[k]).trim()
    }
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

function transformRow(r, idx) {
  const company = firstNonEmpty(r, ['公司名称','企业名称','公司名','名称'])
  const registerStatus = firstNonEmpty(r, ['登记状态','状态'])
  const boss = firstNonEmpty(r, ['法定代表人','老板','老板名称','负责人','联系人','企业负责人','法人'])
  const registerCapital = firstNonEmpty(r, ['注册资本','注册资金'])
  const createTime = firstNonEmpty(r, ['成立日期','成立时间','注册日期'])
  const address = firstNonEmpty(r, ['地址','注册地址','企业地址'])
  let province = firstNonEmpty(r, ['省','省份','所在省'])
  let city = firstNonEmpty(r, ['市','城市','所在市'])
  let district = firstNonEmpty(r, ['区','区县','所在区县'])
  if ((!province || !city) && address) {
    const region = parseRegion(address)
    province = province || region.province
    city = city || region.city
    district = district || region.district
  }
  const usefulPhone = firstNonEmpty(r, ['有效电话号码','有效手机号','有效手机','有用电话','对外电话','电话','联系电话'])
  const morePhone = firstNonEmpty(r, ['更多号码','更多电话','其它电话','备用电话','手机'])
  const emailRaw = firstNonEmpty(r, ['邮箱','电子邮箱','Email','email'])
  const email = emailRaw.replace(/；/g,';').replace(/\s+/g,'')
  const companyType = firstNonEmpty(r, ['公司类型','企业类型','类型'])
  const people = firstNonEmpty(r, ['人员规模','人数','从业人数'])
  const scale = firstNonEmpty(r, ['企业规模','规模'])
  const profile = firstNonEmpty(r, ['简介','公司简介','企业简介'])
  const businessScope = firstNonEmpty(r, ['经营范围'])

  return {
    company,
    registerStatus,
    boss,
    registerCapital,
    createTime,
    address,
    province,
    city,
    district,
    usefulPhone,
    morePhone,
    email,
    companyType,
    people,
    scale,
    profile,
    businessScope,
  }
}

function main() {
  const { xlsx, out, sheet } = parseArgs()
  if (!fs.existsSync(xlsx)) {
    console.error('XLSX file not found:', xlsx)
    process.exit(1)
  }
  const wb = XLSX.readFile(xlsx)
  let chosenRows = []
  let chosenSheetName = ''
  if (sheet) {
    // 支持通过名称或索引选择工作表
    let targetName = sheet
    const idx = Number.isInteger(Number(sheet)) ? Number(sheet) : NaN
    if (!isNaN(idx) && idx >= 0 && idx < wb.SheetNames.length) {
      targetName = wb.SheetNames[idx]
    }
    if (wb.SheetNames.includes(targetName)) {
      const sh = wb.Sheets[targetName]
      chosenRows = XLSX.utils.sheet_to_json(sh, { defval: '' })
      chosenSheetName = targetName
      console.log(`Using specified sheet '${chosenSheetName}' -> rows: ${chosenRows.length}`)
    } else {
      console.warn(`Specified sheet '${sheet}' not found. Fallback to auto-select by max rows.`)
    }
  }
  if (!chosenRows.length) {
    // 选择“包含最多数据行”的工作表，避免默认第一个工作表导致数据不全
    let bestSheetName = wb.SheetNames[0]
    let bestRows = []
    for (const sn of wb.SheetNames) {
      const sh = wb.Sheets[sn]
      const rs = XLSX.utils.sheet_to_json(sh, { defval: '' })
      console.log(`Sheet '${sn}' -> rows: ${rs.length}`)
      if (rs.length > bestRows.length) { bestRows = rs; bestSheetName = sn }
    }
    chosenRows = bestRows
    chosenSheetName = bestSheetName
    console.log(`Using sheet '${chosenSheetName}' with ${chosenRows.length} rows`)
  }
  const data = chosenRows.map(transformRow)

  const outDir = path.dirname(out)
  fs.mkdirSync(outDir, { recursive: true })
  const js = `export const jacketsData = ${JSON.stringify(data, null, 2)}\n`
  fs.writeFileSync(out, js, 'utf8')
  console.log('Written JS data to', out)
}

main()