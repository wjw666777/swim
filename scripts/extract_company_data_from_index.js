#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const indexPath = path.resolve('index.html');
const outPath = path.resolve('frontend/src/data/fujian_swim.js');

function extractCompanyArray(html) {
  const assignIdx = html.indexOf('companyData');
  if (assignIdx === -1) throw new Error('companyData not found');
  const eqIdx = html.indexOf('[', assignIdx);
  if (eqIdx === -1) throw new Error('array start not found');
  let i = eqIdx;
  let depth = 0;
  let inStr = false;
  let strQuote = '';
  let escaped = false;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === strQuote) { inStr = false; strQuote=''; continue; }
      continue;
    } else {
      if (ch === '"' || ch === '\'') { inStr = true; strQuote = ch; continue; }
      if (ch === '[') { depth++; if (depth === 1) break; }
    }
  }
  // i is at first '[' position
  let start = i;
  depth = 0; inStr = false; strQuote=''; escaped=false;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === strQuote) { inStr = false; strQuote=''; continue; }
      continue;
    } else {
      if (ch === '"' || ch === '\'') { inStr = true; strQuote = ch; continue; }
      if (ch === '[') depth++;
      else if (ch === ']') { depth--; if (depth === 0) { const end = i; return html.slice(start, end+1); } }
    }
  }
  throw new Error('array end not found');
}

function main() {
  const html = fs.readFileSync(indexPath, 'utf8');
  const arrayText = extractCompanyArray(html);
  let companies;
  try {
    companies = Function('return ' + arrayText)();
  } catch (e) {
    console.error('Failed to eval array:', e.message);
    process.exit(1);
  }
  if (!Array.isArray(companies)) {
    console.error('Parsed result is not an array');
    process.exit(1);
  }
  // Normalize: ensure id, status and visitRecord fields exist
  let nextId = 1;
  companies = companies.map(c => {
    const id = typeof c.id === 'number' ? c.id : nextId++;
    return {
      id,
      name: c.name || '',
      type: c.type || '',
      phone: c.phone || '',
      address: c.address || c.addr || '',
      industry: c.industry || c.category || '',
      status: typeof c.status === 'number' ? c.status : 1,
      visitRecord: c.visitRecord || ''
    };
  });

  const header = `// Fujian swim companies data (extracted from index.html)\n` +
    `// Total: ${companies.length}\n` +
    `// Generated: ${new Date().toISOString()}\n`;
  const exportText = header + '\nexport const fujianSwimCompanies = ' + JSON.stringify(companies, null, 2) + ';\n';
  fs.writeFileSync(outPath, exportText, 'utf8');
  console.log('Wrote', outPath, 'records:', companies.length);
}

main();
