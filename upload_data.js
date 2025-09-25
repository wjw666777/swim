const fs = require('fs');
const https = require('https');

// 读取company_data.js文件
const fileContent = fs.readFileSync('./company_data.js', 'utf8');

// 提取companyData数组
const match = fileContent.match(/const companyData = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('无法找到companyData数组');
  process.exit(1);
}

const companyDataStr = match[1];
const companyData = eval(companyDataStr);

console.log('找到', companyData.length, '条企业数据');

// 发送数据到API
const postData = JSON.stringify(companyData);

const options = {
  hostname: 'crm-api-worker.939338219.workers.dev',
  port: 443,
  path: '/api/crm/data',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('响应状态:', res.statusCode);
    console.log('响应数据:', data);
  });
});

req.on('error', (e) => {
  console.error('请求错误:', e);
});

req.write(postData);
req.end();