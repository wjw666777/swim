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
      // ---------- Chongfengyi CRUD ----------
      // 获取冲锋衣数据
      if (request.method === 'GET' && path === '/api/chongfengyi/data') {
        const data = await env.CHONGFENGYI_KV.get('chongfengyiData')
        const body = data || JSON.stringify([])
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 导入/覆盖冲锋衣全部数据
      if (request.method === 'POST' && path === '/api/chongfengyi/data') {
        const requestData = await request.json()
        if (!Array.isArray(requestData)) {
          return new Response(JSON.stringify({ error: '数据格式错误，需要数组格式' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        await env.CHONGFENGYI_KV.put('chongfengyiData', JSON.stringify(requestData))
        return new Response(JSON.stringify({ success: true, message: '冲锋衣数据保存成功' }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 更新单个冲锋衣企业
      if (request.method === 'PUT' && path.startsWith('/api/chongfengyi/company/')) {
        const companyId = path.split('/').pop()
        const updateData = await request.json()
        const existingData = await env.CHONGFENGYI_KV.get('chongfengyiData')
        let companies = existingData ? JSON.parse(existingData) : []
        const idx = companies.findIndex(c => String(c.id) === String(companyId))
        if (idx !== -1) {
          companies[idx] = { ...companies[idx], ...updateData }
          await env.CHONGFENGYI_KV.put('chongfengyiData', JSON.stringify(companies))
          return new Response(JSON.stringify({ success: true, data: companies[idx] }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        return new Response(JSON.stringify({ error: '企业不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 获取单个冲锋衣企业
      if (request.method === 'GET' && path.startsWith('/api/chongfengyi/company/')) {
        const companyId = path.split('/').pop()
        const existingData = await env.CHONGFENGYI_KV.get('chongfengyiData')
        let companies = existingData ? JSON.parse(existingData) : []
        const company = companies.find(c => String(c.id) === String(companyId))
        if (company) {
          return new Response(JSON.stringify(company), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        return new Response(JSON.stringify({ error: '企业不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 删除冲锋衣企业
      if (request.method === 'DELETE' && path.startsWith('/api/chongfengyi/company/')) {
        const companyId = path.split('/').pop()
        const existingData = await env.CHONGFENGYI_KV.get('chongfengyiData')
        let companies = existingData ? JSON.parse(existingData) : []
        const idx = companies.findIndex(c => String(c.id) === String(companyId))
        if (idx !== -1) {
          const deleted = companies.splice(idx, 1)[0]
          await env.CHONGFENGYI_KV.put('chongfengyiData', JSON.stringify(companies))
          return new Response(JSON.stringify({ success: true, data: deleted }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        return new Response(JSON.stringify({ error: '企业不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 添加冲锋衣企业
      if (request.method === 'POST' && path === '/api/chongfengyi/company') {
        const newCompany = await request.json()
        const existingData = await env.CHONGFENGYI_KV.get('chongfengyiData')
        let companies = existingData ? JSON.parse(existingData) : []
        const maxId = companies.length > 0 ? Math.max(...companies.map(c => parseInt(c.id) || 0)) : 0
        const id = (parseInt(newCompany?.id) || maxId + 1).toString()
        const company = { id, ...newCompany }
        companies.push(company)
        await env.CHONGFENGYI_KV.put('chongfengyiData', JSON.stringify(companies))
        return new Response(JSON.stringify({ success: true, data: company }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // ---------- Visit Status (后端持久化) ----------
      // 获取拜访状态对象 { [id]: status }
      if (request.method === 'GET' && path === '/api/chongfengyi/visit/status') {
        const vsRaw = await env.CHONGFENGYI_KV.get('chongfengyiVisitStatus')
        const vs = vsRaw ? JSON.parse(vsRaw) : {}
        return new Response(JSON.stringify(vs), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }
      // 更新单个企业的拜访状态
      if (request.method === 'PUT' && path === '/api/chongfengyi/visit/status') {
        const { id, status } = await request.json()
        if (!id) {
          return new Response(JSON.stringify({ error: '缺少企业ID' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        const vsRaw = await env.CHONGFENGYI_KV.get('chongfengyiVisitStatus')
        const vs = vsRaw ? JSON.parse(vsRaw) : {}
        vs[String(id)] = status || '未拜访'
        await env.CHONGFENGYI_KV.put('chongfengyiVisitStatus', JSON.stringify(vs))
        return new Response(JSON.stringify({ success: true, data: vs }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // ---------- Visit Logs (后端持久化) ----------
      // 获取某企业的回访记录数组
      if (request.method === 'GET' && path.startsWith('/api/chongfengyi/visit/logs/')) {
        const companyId = path.split('/').pop()
        const logsRaw = await env.CHONGFENGYI_KV.get('chongfengyiVisitLogs')
        let logs = logsRaw ? JSON.parse(logsRaw) : {}
        const items = Array.isArray(logs[companyId]) ? logs[companyId] : []
        return new Response(JSON.stringify(items), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }
      // 追加某企业的回访记录
      if (request.method === 'POST' && path.startsWith('/api/chongfengyi/visit/logs/')) {
        const companyId = path.split('/').pop()
        const item = await request.json()
        const logsRaw = await env.CHONGFENGYI_KV.get('chongfengyiVisitLogs')
        let logs = logsRaw ? JSON.parse(logsRaw) : {}
        const list = Array.isArray(logs[companyId]) ? logs[companyId] : []
        list.unshift({ date: item?.date || new Date().toISOString(), note: item?.note || '' })
        logs[companyId] = list
        await env.CHONGFENGYI_KV.put('chongfengyiVisitLogs', JSON.stringify(logs))
        return new Response(JSON.stringify({ success: true, data: list }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }
      // ---------- Fabric CRUD ----------
      // 获取面料数据
      if (request.method === 'GET' && path === '/api/fabric/data') {
        const data = await env.CRM_KV.get('fabricData')
        const body = data || JSON.stringify([])
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 导入/覆盖面料全部数据
      if (request.method === 'POST' && path === '/api/fabric/data') {
        const requestData = await request.json()
        if (!Array.isArray(requestData)) {
          return new Response(JSON.stringify({ error: '数据格式错误，需要数组格式' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        await env.CRM_KV.put('fabricData', JSON.stringify(requestData))
        return new Response(JSON.stringify({ success: true, message: '面料数据保存成功' }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 更新单个面料企业
      if (request.method === 'PUT' && path.startsWith('/api/fabric/company/')) {
        const companyId = path.split('/').pop()
        const updateData = await request.json()
        const existingData = await env.CRM_KV.get('fabricData')
        let companies = existingData ? JSON.parse(existingData) : []
        const idx = companies.findIndex(c => String(c.id) === String(companyId))
        if (idx !== -1) {
          companies[idx] = { ...companies[idx], ...updateData }
          await env.CRM_KV.put('fabricData', JSON.stringify(companies))
          return new Response(JSON.stringify({ success: true, data: companies[idx] }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        return new Response(JSON.stringify({ error: '企业不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 获取单个面料企业
      if (request.method === 'GET' && path.startsWith('/api/fabric/company/')) {
        const companyId = path.split('/').pop()
        const existingData = await env.CRM_KV.get('fabricData')
        let companies = existingData ? JSON.parse(existingData) : []
        const company = companies.find(c => String(c.id) === String(companyId))
        if (company) {
          return new Response(JSON.stringify(company), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        return new Response(JSON.stringify({ error: '企业不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 删除面料企业
      if (request.method === 'DELETE' && path.startsWith('/api/fabric/company/')) {
        const companyId = path.split('/').pop()
        const existingData = await env.CRM_KV.get('fabricData')
        let companies = existingData ? JSON.parse(existingData) : []
        const idx = companies.findIndex(c => String(c.id) === String(companyId))
        if (idx !== -1) {
          const deleted = companies.splice(idx, 1)[0]
          await env.CRM_KV.put('fabricData', JSON.stringify(companies))
          return new Response(JSON.stringify({ success: true, data: deleted }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        return new Response(JSON.stringify({ error: '企业不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // 添加面料企业
      if (request.method === 'POST' && path === '/api/fabric/company') {
        const newCompany = await request.json()
        const existingData = await env.CRM_KV.get('fabricData')
        let companies = existingData ? JSON.parse(existingData) : []
        const maxId = companies.length > 0 ? Math.max(...companies.map(c => parseInt(c.id) || 0)) : 0
        const id = (parseInt(newCompany?.id) || maxId + 1).toString()
        const company = { id, ...newCompany }
        companies.push(company)
        await env.CRM_KV.put('fabricData', JSON.stringify(companies))
        return new Response(JSON.stringify({ success: true, data: company }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // ---------- Fabric Visit Status ----------
      if (request.method === 'GET' && path === '/api/fabric/visit/status') {
        const raw = await env.CRM_KV.get('fabricVisitStatus')
        const vs = raw ? JSON.parse(raw) : {}
        return new Response(JSON.stringify(vs), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }
      if (request.method === 'PUT' && path === '/api/fabric/visit/status') {
        const { id, status } = await request.json()
        if (!id) {
          return new Response(JSON.stringify({ error: '缺少企业ID' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
        }
        const raw = await env.CRM_KV.get('fabricVisitStatus')
        const vs = raw ? JSON.parse(raw) : {}
        vs[String(id)] = status || '未拜访'
        await env.CRM_KV.put('fabricVisitStatus', JSON.stringify(vs))
        return new Response(JSON.stringify({ success: true, data: vs }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }

      // ---------- Fabric Visit Logs ----------
      if (request.method === 'GET' && path.startsWith('/api/fabric/visit/logs/')) {
        const companyId = path.split('/').pop()
        const logsRaw = await env.CRM_KV.get('fabricVisitLogs')
        let logs = logsRaw ? JSON.parse(logsRaw) : {}
        const items = Array.isArray(logs[companyId]) ? logs[companyId] : []
        return new Response(JSON.stringify(items), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }
      if (request.method === 'POST' && path.startsWith('/api/fabric/visit/logs/')) {
        const companyId = path.split('/').pop()
        const item = await request.json()
        const logsRaw = await env.CRM_KV.get('fabricVisitLogs')
        let logs = logsRaw ? JSON.parse(logsRaw) : {}
        const list = Array.isArray(logs[companyId]) ? logs[companyId] : []
        list.unshift({ date: item?.date || new Date().toISOString(), note: item?.note || '' })
        logs[companyId] = list
        await env.CRM_KV.put('fabricVisitLogs', JSON.stringify(logs))
        return new Response(JSON.stringify({ success: true, data: list }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      }
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