<template>
  <div class="container">
    <div class="header">
      <h1>泳装企业CRM系统</h1>
      <p>企业客户关系管理平台</p>
    </div>

    <div class="search-bar">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input
            type="text"
            class="search-input"
            placeholder="搜索企业名称、类型或电话..."
            v-model.trim="query"
            @input="onSearch"
          />
          <button class="search-clear" :class="{ show: query }" @click="clearSearch" title="清空搜索">&times;</button>
        </div>
        <button class="btn btn-primary" @click="showAddModal = true" style="white-space: nowrap">新增企业</button>
      </div>
    </div>

    <div class="search-results-info" :class="{ show: query }">
      找到 <span>{{ filteredCompanies.length }}</span> 条匹配结果
    </div>

    <div id="loading" v-show="loading" class="loading">正在加载数据...</div>

    <div class="table-container">
      <table class="company-table" id="companyTable">
        <thead>
          <tr>
            <th>企业名称</th>
            <th>类型</th>
            <th>联系电话</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(company, i) in filteredCompanies" :key="company.id" @click="openDetail(company)">
            <td>{{ company.name }}</td>
            <td>{{ company.type || '未分类' }}</td>
            <td>{{ company.phone || '-' }}</td>
            <td><span class="status-badge" :class="statusClass(company.status)">{{ statusText(company.status) }}</span></td>
            <td>
              <button class="btn btn-secondary" @click.stop="openDetail(company)">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 详细信息模态框 -->
    <div class="modal" v-show="showDetail">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ currentCompany?.name }}</h2>
          <span class="close" @click="closeDetail">&times;</span>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-label">类型</div><div class="detail-value">{{ currentCompany?.type || '未分类' }}</div></div>
            <div class="detail-item"><div class="detail-label">电话</div><div class="detail-value">{{ currentCompany?.phone || '-' }}</div></div>
            <div class="detail-item"><div class="detail-label">地址</div><div class="detail-value">{{ currentCompany?.address || '-' }}</div></div>
            <div class="detail-item"><div class="detail-label">行业</div><div class="detail-value">{{ currentCompany?.industry || '-' }}</div></div>
          </div>

          <div class="form-group">
            <label class="form-label">拜访状态</label>
            <select class="form-control" v-model.number="editStatus">
              <option :value="1">未拜访</option>
              <option :value="2">已拜访</option>
              <option :value="3">已拒绝</option>
              <option :value="4">已合作</option>
              <option :value="5">已签单</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">回访记录</label>
            <textarea class="form-control" v-model="editNotes" rows="4" placeholder="请输入回访记录..."></textarea>
          </div>

          <div style="text-align: right; margin-top: 30px">
            <button class="btn btn-secondary" @click="closeDetail">取消</button>
            <button class="btn btn-primary" @click="saveRecord">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增企业模态框 -->
    <div class="modal" v-show="showAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>新增企业</h2>
          <span class="close" @click="showAddModal=false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group"><label class="form-label">企业名称 *</label><input type="text" class="form-control" v-model="addForm.name"/></div>
          <div class="form-group"><label class="form-label">类型 *</label>
            <select class="form-control" v-model="addForm.type">
              <option value="成衣">成衣</option>
              <option value="面料">面料</option>
            </select></div>
          <div class="form-group"><label class="form-label">联系电话 *</label><input type="text" class="form-control" v-model="addForm.phone"/></div>
          <div class="form-group"><label class="form-label">地址</label><input type="text" class="form-control" v-model="addForm.address"/></div>
          <div class="form-group"><label class="form-label">行业</label><input type="text" class="form-control" v-model="addForm.industry"/></div>
          <div class="form-group"><label class="form-label">企业规模</label><input type="text" class="form-control" v-model="addForm.scale"/></div>
          <div style="text-align: right; margin-top: 20px">
            <button class="btn btn-secondary" @click="showAddModal=false">取消</button>
            <button class="btn btn-primary" @click="addCompany">新增</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fujianSwimCompanies } from './data/fujian_swim.js'
import { fetchCompanies, addCompanyApi, deleteCompanyApi, updateCompanyApi, API_BASE } from './api/client.js'

const STORAGE_KEY = 'companiesData'
const loading = ref(false)
const query = ref('')
const companies = ref([])

// 初始化数据：localStorage优先
onMounted(() => {
  loading.value = true
  ;(async () => {
    try {
      if (API_BASE) {
        const serverData = await fetchCompanies()
        if (Array.isArray(serverData) && serverData.length) {
          companies.value = serverData
          localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
        } else {
          const saved = localStorage.getItem(STORAGE_KEY)
          companies.value = saved ? JSON.parse(saved) : fujianSwimCompanies
          localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY)
        companies.value = saved ? JSON.parse(saved) : fujianSwimCompanies
        localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
      }
    } catch (e) {
      const saved = localStorage.getItem(STORAGE_KEY)
      companies.value = saved ? JSON.parse(saved) : fujianSwimCompanies
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
    } finally {
      loading.value = false
    }
  })()
})

const filteredCompanies = computed(() => {
  if (!query.value) return companies.value
  const q = query.value.toLowerCase()
  return companies.value.filter(c =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.type || '').toLowerCase().includes(q) ||
    (c.phone || '').toLowerCase().includes(q)
  )
})

function onSearch() {}
function clearSearch() { query.value = '' }

function statusText(s) {
  return { 1: '未拜访', 2: '已拜访', 3: '已拒绝', 4: '已合作', 5: '已签单' }[s] || '未知'
}
function statusClass(s) {
  return {
    1: 'status-unvisited',
    2: 'status-visited',
    3: 'status-rejected',
    4: 'status-cooperating',
    5: 'status-signed'
  }[s] || 'status-unvisited'
}

// 详情与编辑
const showDetail = ref(false)
const currentCompany = ref(null)
const editStatus = ref(1)
const editNotes = ref('')

function openDetail(c) {
  currentCompany.value = { ...c }
  editStatus.value = c.status || 1
  editNotes.value = c.visitRecord || ''
  showDetail.value = true
}
function closeDetail() { showDetail.value = false }
function saveRecord() {
  const idx = companies.value.findIndex(c => c.id === currentCompany.value.id)
  if (idx >= 0) {
    const update = { status: editStatus.value, visitRecord: editNotes.value }
    ;(async () => {
      try {
        if (API_BASE) {
          const resp = await updateCompanyApi(currentCompany.value.id, update)
          if (resp && resp.data) {
            companies.value[idx] = { ...companies.value[idx], ...resp.data }
          } else {
            companies.value[idx] = { ...companies.value[idx], ...update }
          }
        } else {
          companies.value[idx] = { ...companies.value[idx], ...update }
        }
      } catch (e) {
        companies.value[idx] = { ...companies.value[idx], ...update }
      } finally {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
        showDetail.value = false
      }
    })()
  }
}

// 新增
const showAddModal = ref(false)
const addForm = ref({ name: '', type: '成衣', phone: '', address: '', industry: '泳装相关', scale: '' })
function addCompany() {
  if (!addForm.value.name || !addForm.value.type || !addForm.value.phone) return alert('请填写必填项')
  const maxId = companies.value.reduce((m, c) => Math.max(m, c.id || 0), 0)
  const newItem = { id: maxId + 1, status: 1, visitRecord: '', ...addForm.value }
  ;(async () => {
    try {
      if (API_BASE) {
        const resp = await addCompanyApi(newItem)
        if (resp && resp.data) {
          companies.value.unshift(resp.data)
        } else {
          companies.value.unshift(newItem)
        }
      } else {
        companies.value.unshift(newItem)
      }
    } catch (e) {
      companies.value.unshift(newItem)
    } finally {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
      showAddModal.value = false
      addForm.value = { name: '', type: '成衣', phone: '', address: '', industry: '泳装相关', scale: '' }
    }
  })()
}

// 可选：删除企业示例（UI未挂按钮，仅保留函数供扩展）
async function deleteCompany(id) {
  const idx = companies.value.findIndex(c => c.id === id)
  if (idx < 0) return
  try {
    if (API_BASE) await deleteCompanyApi(id)
  } catch (e) {}
  companies.value.splice(idx, 1)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
}
</script>

<style scoped>
* { box-sizing: border-box; }
body { background: #f0f2f5; }
.container { max-width: 1200px; margin: 20px auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
.header h1 { font-size: 2rem; margin-bottom: 10px; font-weight: 300; }
.search-bar { padding: 20px 30px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
.search-container { display: flex; gap: 15px; align-items: center; }
.search-input-wrapper { position: relative; flex: 1; }
.search-input { width: 100%; padding: 12px 45px 12px 20px; border: 2px solid #e9ecef; border-radius: 25px; font-size: 16px; outline: none; transition: all 0.3s ease; background: white; }
.search-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
.search-clear { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #6c757d; cursor: pointer; font-size: 18px; padding: 5px; border-radius: 50%; display: none; transition: all 0.3s ease; }
.search-clear.show { display: block; }
.table-container { overflow-x: auto; padding: 0 30px; }
.company-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.company-table th { background: #f8f9fa; padding: 18px 20px; text-align: left; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef; }
.company-table td { padding: 18px 20px; border-bottom: 1px solid #e9ecef; cursor: pointer; transition: all 0.3s ease; line-height: 1.6; }
.company-table tr:hover { background: #f8f9fa; }
.status-badge { padding: 3px 6px; border-radius: 12px; font-size: 10px; font-weight: 600; text-align: center; display: inline-block; min-width: 50px; white-space: nowrap; }
.status-unvisited { background: #ffeaa7; color: #d63031; }
.status-visited { background: #74b9ff; color: white; }
.status-rejected { background: #fd79a8; color: white; }
.status-cooperating { background: #00b894; color: white; }
.status-signed { background: #6c5ce7; color: white; }
.modal { position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); backdrop-filter: blur(5px); display: flex; }
.modal-content { background-color: white; margin: 5% auto; padding: 0; border-radius: 15px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.2); }
.modal-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px 15px 0 0; position: relative; }
.close { position: absolute; right: 20px; top: 20px; color: white; font-size: 28px; font-weight: bold; cursor: pointer; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.modal-body { padding: 30px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
.detail-item { background: #f8f9fa; padding: 15px; border-radius: 10px; border-left: 4px solid #667eea; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; margin-bottom: 8px; font-weight: 600; color: #495057; }
.form-control { width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; }
.btn { padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-right: 10px; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-secondary { background: #6c757d; color: white; }
.loading { display: none; text-align: center; padding: 20px; color: #666; }
</style>