const fs = require('fs');

const companyContent = fs.readFileSync('company_data.js', 'utf8');
const companyMatch = companyContent.match(/const companyData = (\[[\s\S]*?\]);/);
const companies = JSON.parse(companyMatch[1]);

// 检查type字段
const withType = companies.filter(c => c.type);
const withoutType = companies.filter(c => !c.type);

console.log('总数据条数:', companies.length);
console.log('有type字段的数据:', withType.length);
console.log('没有type字段的数据:', withoutType.length);

if (withType.length > 0) {
  const typeStats = withType.reduce((stats, c) => {
    stats[c.type] = (stats[c.type] || 0) + 1;
    return stats;
  }, {});
  console.log('Type统计:', typeStats);
}

// 显示前几条数据的type字段
console.log('\n前5条数据的type字段:');
companies.slice(0, 5).forEach((c, i) => {
  console.log(`${i + 1}. ${c.name}: ${c.type || '无type字段'}`);
});