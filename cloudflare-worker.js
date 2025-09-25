// Cloudflare Worker for CRM Data Storage
// 使用KV存储来保存CRM数据

export default {
  async fetch(request, env, ctx) {
    // 处理CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 获取所有CRM数据
      if (request.method === 'GET' && path === '/api/crm/data') {
        const data = await env.CRM_KV.get('crmData');
        
        if (data) {
          return new Response(data, {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        } else {
          // 返回默认数据结构
          const defaultData = JSON.stringify([]);
          return new Response(defaultData, {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
      }

      // 保存CRM数据
      if (request.method === 'POST' && path === '/api/crm/data') {
        const requestData = await request.json();
        
        // 验证数据格式
        if (!Array.isArray(requestData)) {
          return new Response(JSON.stringify({ error: '数据格式错误，需要数组格式' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // 保存到KV存储
        await env.CRM_KV.put('crmData', JSON.stringify(requestData));
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: '数据保存成功',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // 更新单个企业数据
      if (request.method === 'PUT' && path.startsWith('/api/crm/company/')) {
        const companyId = parseInt(path.split('/').pop());
        const updateData = await request.json();
        
        // 获取现有数据
        const existingData = await env.CRM_KV.get('crmData');
        let companies = existingData ? JSON.parse(existingData) : [];
        
        // 查找并更新企业数据
        const companyIndex = companies.findIndex(c => c.id === companyId);
        if (companyIndex !== -1) {
          companies[companyIndex] = { ...companies[companyIndex], ...updateData };
          
          // 保存更新后的数据
          await env.CRM_KV.put('crmData', JSON.stringify(companies));
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: '企业数据更新成功',
            data: companies[companyIndex]
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        } else {
          return new Response(JSON.stringify({ error: '企业不存在' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
      }

      // 获取单个企业数据
      if (request.method === 'GET' && path.startsWith('/api/crm/company/')) {
        const companyId = parseInt(path.split('/').pop());
        
        const existingData = await env.CRM_KV.get('crmData');
        let companies = existingData ? JSON.parse(existingData) : [];
        
        const company = companies.find(c => c.id === companyId);
        if (company) {
          return new Response(JSON.stringify(company), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        } else {
          return new Response(JSON.stringify({ error: '企业不存在' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
      }

      // 删除企业数据
      if (request.method === 'DELETE' && path.startsWith('/api/crm/company/')) {
        const companyId = parseInt(path.split('/').pop());
        
        const existingData = await env.CRM_KV.get('crmData');
        let companies = existingData ? JSON.parse(existingData) : [];
        
        const companyIndex = companies.findIndex(c => c.id === companyId);
        if (companyIndex !== -1) {
          const deletedCompany = companies.splice(companyIndex, 1)[0];
          
          // 保存更新后的数据
          await env.CRM_KV.put('crmData', JSON.stringify(companies));
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: '企业删除成功',
            data: deletedCompany
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        } else {
          return new Response(JSON.stringify({ error: '企业不存在' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
      }

      // 添加新企业
      if (request.method === 'POST' && path === '/api/crm/company') {
        const newCompany = await request.json();
        
        // 获取现有数据
        const existingData = await env.CRM_KV.get('crmData');
        let companies = existingData ? JSON.parse(existingData) : [];
        
        // 生成新的ID
        const maxId = companies.length > 0 ? Math.max(...companies.map(c => c.id)) : 0;
        newCompany.id = maxId + 1;
        
        // 设置默认值
        newCompany.status = newCompany.status || 1;
        newCompany.visitRecord = newCompany.visitRecord || '';
        
        // 添加到数组
        companies.push(newCompany);
        
        // 保存数据
        await env.CRM_KV.put('crmData', JSON.stringify(companies));
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: '企业添加成功',
          data: newCompany
        }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // 健康检查
      if (request.method === 'GET' && path === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString() 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // 404 处理
      return new Response(JSON.stringify({ error: '接口不存在' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: '服务器内部错误',
        details: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};