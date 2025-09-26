const fs = require('fs');
const path = require('path');

// 读取factotorites.js文件
function readFactoriesData() {
    try {
        // 删除require缓存以确保重新加载
        delete require.cache[require.resolve('./factotorites.js')];
        
        // 直接引用factotorites.js
        const factories = require('./factotorites.js');
        return factories;
    } catch (error) {
        console.error('读取factotorites.js失败:', error);
        throw error;
    }
}

// 读取company_data.js文件
function readCompanyData() {
    const companyPath = path.join(__dirname, 'company_data.js');
    const companyContent = fs.readFileSync(companyPath, 'utf8');
    
    // 提取companyData数组，使用更精确的正则表达式
    const companyMatch = companyContent.match(/const companyData = (\[[\s\S]*?\]);[\s\S]*?(?=\/\/|$)/);
    if (!companyMatch) {
        throw new Error('无法解析company_data.js文件');
    }
    
    try {
        return JSON.parse(companyMatch[1]);
    } catch (error) {
        // 如果JSON.parse失败，尝试使用Function构造器
        const func = new Function('return ' + companyMatch[1]);
        return func();
    }
}

// 为原有数据添加type字段
function addTypeToExistingData(companyData) {
    return companyData.map((company) => {
        if (!company.type) {
            company.type = '成衣';
        }
        return company;
    });
}

// 转换factotorites数据格式为company_data格式
function convertFactoryToCompany(factory, maxId) {
    return {
        id: maxId + 1,
        name: factory.name,
        contact: factory.contact,
        phone: factory.phone,
        address: '',
        industry: '泳装相关',
        scale: '',
        registration: '',
        capital: '',
        status: 1,
        visitRecord: '',
        province: '',
        city: '',
        district: '',
        registrationStatus: '',
        email: '',
        website: '',
        description: factory.description,
        type: factory.type,
    };
}

// 根据name字段去重合并数据
function mergeData() {
    console.log('开始读取数据文件...');

    const factories = readFactoriesData();
    const companies = readCompanyData();

    console.log(`读取到 ${factories.length} 条factotorites数据`);
    console.log(`读取到 ${companies.length} 条company_data数据`);

    // 为原有数据添加type字段
    const companiesWithType = addTypeToExistingData(companies);
    console.log('为原有数据添加type字段完成');

    // 创建现有公司名称的集合，用于去重
    const existingNames = new Set(companiesWithType.map((company) => company.name));

    // 获取最大ID
    const maxId = Math.max(...companiesWithType.map((company) => company.id || 0));

    // 过滤出不重复的新数据
    const newFactories = factories.filter((factory) => !existingNames.has(factory.name));
    console.log(`过滤后有 ${newFactories.length} 条新数据需要添加`);

    // 转换新数据格式并分配新ID
    const convertedFactories = newFactories.map((factory, index) => convertFactoryToCompany(factory, maxId + index));

    // 合并数据
    const mergedData = [...companiesWithType, ...convertedFactories];

    console.log(`合并完成，总共 ${mergedData.length} 条数据`);

    return mergedData;
}

// 写入合并后的数据
function writeMergedData(mergedData) {
    const outputContent = `
        // 从企查查CSV文件生成的真实企业数据 + factotorites数据合并 (共${mergedData.length}条)
        const companyData = ${JSON.stringify(mergedData, null, 8)};
        
        // 导出数据供其他模块使用
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = companyData;
        }
        
        // 浏览器环境下的全局变量
        if (typeof window !== 'undefined') {
            window.companyData = companyData;
        }
    `;

    const outputPath = path.join(__dirname, 'company_data.js');
    fs.writeFileSync(outputPath, outputContent, 'utf8');
    console.log(`数据已写入 ${outputPath}`);
}

// 主函数
function main() {
    try {
        console.log('开始数据合并处理...');
        const mergedData = mergeData();
        writeMergedData(mergedData);
        console.log('数据合并完成！');

        // 输出统计信息
        const typeStats = mergedData.reduce((stats, company) => {
            stats[company.type] = (stats[company.type] || 0) + 1;
            return stats;
        }, {});

        console.log('\n数据统计：');
        Object.entries(typeStats).forEach(([type, count]) => {
            console.log(`${type}: ${count} 条`);
        });
    } catch (error) {
        console.error('数据合并失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { mergeData, writeMergedData };
