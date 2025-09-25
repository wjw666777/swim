// 数据导入脚本 - 将 company_data.js 中的数据导入到 Cloudflare API
const fs = require('fs');
const path = require('path');

// Cloudflare Worker API 地址
const API_BASE_URL = 'https://crm-api-worker.939338219.workers.dev';

// 读取 company_data.js 文件
function loadCompanyData() {
    try {
        const filePath = path.join(__dirname, 'company_data.js');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // 提取 companyData 数组
        const match = fileContent.match(/const companyData = (\[[\s\S]*?\]);/);
        if (!match) {
            throw new Error('无法找到 companyData 数组');
        }
        
        // 使用 eval 解析数组（注意：在生产环境中应该使用更安全的方法）
        const companyData = eval(match[1]);
        return companyData;
    } catch (error) {
        console.error('读取数据文件失败:', error);
        return null;
    }
}

// 发送 API 请求
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

// 导入单个企业数据
async function importCompany(company) {
    try {
        // 跳过第一条数据（表头）
        if (company.id === 2 && company.name === '企业名称') {
            console.log('跳过表头数据');
            return { success: true, skipped: true };
        }
        
        // 准备企业数据
        const companyData = {
            name: company.name,
            contact: company.contact,
            phone: company.phone,
            address: company.address || '',
            industry: company.industry || '泳装相关',
            scale: company.scale || '',
            capital: company.capital || '',
            registration: company.registration || '',
            province: company.province || '',
            city: company.city || '',
            district: company.district || '',
            registrationStatus: company.registrationStatus || '存续',
            email: company.email || '',
            website: company.website || '',
            description: company.description || '',
            status: company.status || 1,
            visitRecord: company.visitRecord || ''
        };
        
        const result = await apiRequest('/api/crm/company', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
        
        console.log(`✓ 成功导入: ${company.name} (ID: ${result.data.id})`);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(`✗ 导入失败: ${company.name} - ${error.message}`);
        return { success: false, error: error.message };
    }
}

// 批量导入数据
async function importAllData() {
    console.log('开始导入企业数据...\n');
    
    const companyData = loadCompanyData();
    if (!companyData) {
        console.error('无法加载企业数据');
        return;
    }
    
    console.log(`找到 ${companyData.length} 条企业数据\n`);
    
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;
    
    // 逐个导入企业数据
    for (let i = 0; i < companyData.length; i++) {
        const company = companyData[i];
        console.log(`[${i + 1}/${companyData.length}] 正在导入: ${company.name}`);
        
        const result = await importCompany(company);
        
        if (result.success) {
            if (result.skipped) {
                skipCount++;
            } else {
                successCount++;
            }
        } else {
            failCount++;
        }
        
        // 添加延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n导入完成！');
    console.log(`成功: ${successCount} 条`);
    console.log(`跳过: ${skipCount} 条`);
    console.log(`失败: ${failCount} 条`);
}

// 检查 API 连接
async function checkApiConnection() {
    try {
        console.log('检查 API 连接...');
        const result = await apiRequest('/api/health');
        console.log('✓ API 连接正常\n');
        return true;
    } catch (error) {
        console.error('✗ API 连接失败:', error.message);
        return false;
    }
}

// 主函数
async function main() {
    console.log('=== 企业数据导入工具 ===\n');
    
    // 检查 API 连接
    const apiConnected = await checkApiConnection();
    if (!apiConnected) {
        console.log('请确保 Cloudflare Worker 正在运行');
        return;
    }
    
    // 开始导入数据
    await importAllData();
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error);
}