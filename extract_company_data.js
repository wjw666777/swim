const fs=require('fs');
const path=require('path');
const src=path.join(__dirname,'index.html');
const out=path.join(__dirname,'frontend','src','data','fujian_swim.js');
const html=fs.readFileSync(src,'utf8');
const match=html.match(/const\s+companyData\s*=\s*(\[[\s\S]*?\]);/);
if(!match){
  console.error('未在index.html中找到companyData数组');
  process.exit(1);
}
const arrayCode=match[1];
const header='// 福建泳装企业数据(从index.html提取)\n' +
             'export const fujianSwimCompanies = ' + arrayCode + ';\n' +
             'export default fujianSwimCompanies;\n';
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,header,'utf8');
console.log('已生成:', out);
console.log('记录数估算:', (arrayCode.match(/\{\s*\"id\"/g)||[]).length);
