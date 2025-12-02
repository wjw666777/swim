<template>
  <div class="container">
    <div class="header">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1>库存公司CRM系统</h1>
          <p>企业库存客户关系管理平台</p>
        </div>
        <a-button class="menu-btn" shape="round" size="small" @click="menuOpen = true">
          <template #icon>
            <icon-menu />
          </template>
          菜单
        </a-button>
      </div>
    </div>

    <div class="search-bar">
      <div class="search-container">
        <a-input-search allow-clear placeholder="搜索企业名称、类型或电话..." v-model="query" @search="onSearch"
          class="search-input" />
        <a-button type="primary" @click="showAddModal = true">新增企业</a-button>
      </div>
    </div>

    <div class="search-results-info" :class="{ show: query }">
      找到 <span>{{ filteredCompanies.length }}</span> 条匹配结果
    </div>

    <div id="loading" v-show="loading" class="loading">正在加载数据...</div>

    <div class="table-container" v-if="!isMobile">
      <table class="company-table" id="companyTable">
        <thead>
          <tr>
            <th>企业名称</th>
            <th>类型</th>
            <th>联系人</th>
            <th>联系电话</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(company, i) in filteredCompanies" :key="company.id" @click="openDetail(company)">
            <td data-label="企业名称">{{ company.name }}</td>
            <td data-label="类型">{{ company.type || '库存贸易商' }}</td>
            <td data-label="联系人">{{ company.contact || '-' }}</td>
            <td data-label="联系电话">
              <div class="phone-list" v-if="company.phone">
                <a v-for="(p, i) in splitPhones(company.phone)" :key="company.id + '-tel-' + i" class="tel-link"
                  :href="telHref(p)" @click.stop>{{ p }}</a>
              </div>
              <template v-else>-</template>
            </td>
            <td data-label="状态"><span class="status-badge" :class="statusClass(company.status)">{{
              statusText(company.status) }}</span></td>
            <td data-label="操作">
              <div class="btn btn-secondary" @click.stop="openDetail(company)">详情
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="cards-container" v-else>
      <a-space direction="vertical" :size="12" style="width: 100%">
        <a-card v-for="(company, i) in filteredCompanies" :key="company.id" hoverable @click="openDetail(company)">
          <template #title>
            <div class="card-title">{{ company.name }}</div>
          </template>
          <template #extra>
            <a-tag :color="statusTagColor(company.status)">{{ statusText(company.status) }}</a-tag>
          </template>
          <div class="card-meta">
            <div class="meta-item"><span class="meta-label">类型</span><span class="meta-value">{{ company.type || '库存贸易商'
                }}</span></div>
            <div class="meta-item">
              <span class="meta-label">电话</span>
              <div class="meta-value phone-list">
                <a v-for="(p, i) in splitPhones(company.phone)" :key="company.id + '-mtel-' + i" class="tel-link"
                  :href="telHref(p)" @click.stop>{{ p }}</a>
              </div>
            </div>
            <div class="meta-item"><span class="meta-label">联系人</span><span class="meta-value">{{ company.contact || '-'
                }}</span></div>
          </div>
          <div class="card-actions">
            <a-button type="primary" size="small" @click.stop="openDetail(company)">详情</a-button>
          </div>
        </a-card>
      </a-space>
    </div>

    <button class="fab-add" v-if="isMobile" @click="showAddModal = true" aria-label="新增企业">＋</button>

    <a-drawer v-model:visible="showDetail" placement="bottom" :height="isMobile ? '85vh' : '70vh'" :footer="false"
      :title="currentCompany?.name || '企业详情'">
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">类型</div>
          <div class="detail-value">{{ currentCompany?.type || '库存贸易商' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">电话</div>
          <div class="detail-value">{{ currentCompany?.phone || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">地址</div>
          <div class="detail-value">{{ currentCompany?.address || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">行业</div>
          <div class="detail-value">{{ currentCompany?.industry || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">联系人</div>
          <div class="detail-value">{{ currentCompany?.contact || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">公司详情</div>
          <div class="detail-value">{{ currentCompany?.description || '-' }}</div>
        </div>
      </div>

      <div>
        <div class="form-label">编辑企业信息</div>
        <a-switch v-model="basicEditMode">编辑模式</a-switch>
      </div>
      <div v-if="basicEditMode">
        <a-form layout="vertical" :model="currentCompany">
          <a-form-item label="企业名称"><a-input v-model="currentCompany.name" /></a-form-item>
          <a-form-item label="类型">
            <a-select v-model="currentCompany.type">
              <a-option value="库存贸易商">库存贸易商</a-option>
              <a-option value="买货公司">买货公司</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="联系人"><a-input v-model="currentCompany.contact" /></a-form-item>
          <a-form-item label="联系电话"><a-input v-model="currentCompany.phone" /></a-form-item>
          <a-form-item label="地址"><a-input v-model="currentCompany.address" /></a-form-item>
          <a-form-item label="行业"><a-input v-model="currentCompany.industry" /></a-form-item>
          <a-form-item label="公司详情"><a-textarea v-model="currentCompany.description"
              :auto-size="{ minRows: 2, maxRows: 6 }" /></a-form-item>
          <div style="text-align: right; margin-top: 8px">
            <a-button @click="basicEditMode = false">取消</a-button>
            <a-button type="primary" style="margin-left: 8px" @click="saveBasicInfo">保存</a-button>
          </div>
        </a-form>
      </div>

      <div style="text-align: right; margin-top: 8px">
        <a-button status="danger" @click="deleteCompany(currentCompany?.id)">删除该企业</a-button>
      </div>

      <a-space direction="vertical" :size="12" style="width: 100%">
        <div>
          <div class="form-label">拜访状态</div>
          <a-select v-model="editStatus" placeholder="选择状态">
            <a-option :value="1">未拜访</a-option>
            <a-option :value="2">已拜访</a-option>
            <a-option :value="3">已拒绝</a-option>
            <a-option :value="4">已合作</a-option>
            <a-option :value="5">已签单</a-option>
          </a-select>
        </div>
        <div>
          <div class="form-label">回访记录</div>
          <a-textarea v-model="editNotes" :auto-size="{ minRows: 3, maxRows: 6 }" placeholder="请输入回访记录..." />
        </div>
        <div style="text-align: right; margin-top: 8px">
          <a-button @click="closeDetail">取消</a-button>
          <a-button type="primary" style="margin-left: 8px" @click="saveRecord">保存</a-button>
        </div>
      </a-space>
    </a-drawer>

    <a-drawer v-model:visible="showAddModal" placement="bottom" :height="isMobile ? '85vh' : '70vh'" title="新增企业"
      :footer="false">
      <a-form layout="vertical" :model="addForm">
        <a-form-item field="name" label="企业名称 *">
          <a-input v-model="addForm.name" allow-clear placeholder="请输入企业名称" />
        </a-form-item>
        <a-form-item field="type" label="类型 *">
          <a-select v-model="addForm.type" placeholder="请选择类型">
            <a-option value="库存贸易商">库存贸易商</a-option>
            <a-option value="卖货公司">卖货公司</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="contact" label="联系人">
          <a-input v-model="addForm.contact" allow-clear placeholder="可选" />
        </a-form-item>
        <a-form-item field="phone" label="联系电话 *">
          <a-input v-model="addForm.phone" allow-clear placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item field="address" label="地址">
          <a-input v-model="addForm.address" allow-clear placeholder="可选" />
        </a-form-item>
        <a-form-item field="industry" label="行业">
          <a-input v-model="addForm.industry" allow-clear placeholder="可选" />
        </a-form-item>
        <a-form-item field="scale" label="企业规模">
          <a-input v-model="addForm.scale" allow-clear placeholder="可选" />
        </a-form-item>
        <a-form-item field="description" label="公司详情">
          <a-textarea v-model="addForm.description" :auto-size="{ minRows: 2, maxRows: 6 }" placeholder="可选" />
        </a-form-item>
        <div style="text-align: right">
          <a-button @click="showAddModal = false">取消</a-button>
          <a-button type="primary" style="margin-left: 8px" @click="addCompany">新增</a-button>
        </div>
      </a-form>
    </a-drawer>

    <MenuDrawer v-model:visible="menuOpen" current="wholesale" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { wholesaleCompanies } from '../data/wholesale_company.js'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { IconMenu } from '@arco-design/web-vue/es/icon'
import MenuDrawer from '../components/MenuDrawer.vue'

const STORAGE_KEY = 'wholesale_companies'
const loading = ref(false)
const query = ref('')
const companies = ref([])
const isMobile = ref(false)
const menuOpen = ref(false)
const router = useRouter()
const onResize = () => { isMobile.value = window.innerWidth <= 768 }

function go(path) { router.push(path); menuOpen.value = false }

onMounted(() => {
  loading.value = true
  onResize()
  window.addEventListener('resize', onResize)
    ; (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        companies.value = saved ? JSON.parse(saved) : wholesaleCompanies
        localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
      } catch (e) {
        companies.value = wholesaleCompanies
        localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
        Message.warning('已使用本地wholesale_company.js数据')
      } finally {
        loading.value = false
      }
    })()
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
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

function onSearch() { }
function clearSearch() { query.value = '' }

function splitPhones(v) {
  return String(v || '')
    .split(/[；;]/)
    .map(s => s.trim())
    .filter(Boolean)
}
function telHref(p) { return 'tel:' + String(p).replace(/\s+/g, '') }

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
function statusTagColor(s) {
  return { 1: 'gold', 2: 'arcoblue', 3: 'red', 4: 'green', 5: 'purple' }[s] || 'gold'
}

const showDetail = ref(false)
const currentCompany = ref(null)
const editStatus = ref(1)
const editNotes = ref('')

function openDetail(c) {
  currentCompany.value = { ...c }
  editStatus.value = c.status || 1
  editNotes.value = c.visitRecord || ''
  showDetail.value = true
  basicEditMode.value = false
}

async function saveRecord() {
  const idx = companies.value.findIndex(c => c.id === currentCompany.value?.id)
  if (idx >= 0) {
    companies.value[idx].status = editStatus.value
    companies.value[idx].visitRecord = editNotes.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
  showDetail.value = false
}
function closeDetail() { showDetail.value = false }

async function addCompany() {
  const newItem = {
    id: String(Date.now()),
    name: (addForm.value.name || '').trim() || '未命名',
    type: addForm.value.type,
    contact: addForm.value.contact || '',
    phone: addForm.value.phone || '',
    address: addForm.value.address || '',
    industry: addForm.value.industry || '泳装相关',
    description: addForm.value.description || '',
    status: 1
  }
  companies.value.unshift(newItem)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
  showAddModal.value = false
  addForm.value = { name: '', type: '库存贸易商', contact: '', phone: '', address: '', industry: '泳装相关', scale: '' }
}

async function deleteCompany(id) {
  const idx = companies.value.findIndex(c => c.id === id)
  if (idx < 0) return
  companies.value.splice(idx, 1)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
}

const showAddModal = ref(false)
const addForm = ref({ name: '', type: '库存贸易商', contact: '', phone: '', address: '', industry: '泳装相关', scale: '', description: '' })
const basicEditMode = ref(false)
function saveBasicInfo() {
  const idx = companies.value.findIndex(c => c.id === currentCompany.value?.id)
  if (idx >= 0) {
    companies.value[idx] = { ...companies.value[idx], ...currentCompany.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
    Message.success('已保存企业信息')
  }
  basicEditMode.value = false
}
</script>
<style>
button {
  background-color: none !important;
}
</style>
<style scoped>
button {
  background-color: none !important;
}

* {
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 20px auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: 300;
}

.search-bar {
  padding: 20px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.search-container {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  flex: 1;
}

.menu-btn {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: #de13f029;
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.85);
}

.table-container {
  overflow-x: auto;
  padding: 0 30px;
}

.company-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.company-table th {
  background: #f8f9fa;
  padding: 18px 20px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
}

.company-table td {
  padding: 18px 20px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1.6;
}

.company-table tr:hover {
  background: #f8f9fa;
}

.status-badge {
  padding: 3px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  display: inline-block;
  min-width: 50px;
  white-space: nowrap;
}

.status-unvisited {
  background: #ffeaa7;
  color: #d63031;
}

.status-visited {
  background: #74b9ff;
  color: white;
}

.status-rejected {
  background: #fd79a8;
  color: white;
}

.status-cooperating {
  background: #00b894;
  color: white;
}

.status-signed {
  background: #6c5ce7;
  color: white;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.detail-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.tel-link {
  color: #0d6efd;
  text-decoration: none;
}

.tel-link:active {
  opacity: 0.8;
}

.phone-list a+a::before {
  content: '；';
  color: #adb5bd;
  margin: 0 6px;
}

@media (max-width: 768px) {
  .container {
    max-width: none;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .header {
    padding: 16px;
  }

  .header h1 {
    font-size: 1.4rem;
  }

  .search-bar {
    padding: 12px 16px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .search-container {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .cards-container {
    padding: 0 16px 70px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #212529;
  }

  .card-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 6px;
    color: #495057;
  }

  .meta-item {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .meta-label {
    font-weight: 600;
    color: #6c757d;
  }

  .meta-value {
    color: #343a40;
  }

  .fab-add {
    position: fixed;
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom));
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.35);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}
</style>
