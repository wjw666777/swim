<template>
  <div class="container">
    <div class="header">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1>石狮服装企业CRM系统</h1>
          <p>企业客户关系管理平台</p>
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
        <a-input-search allow-clear placeholder="搜索企业名称、老板或电话..." v-model="query" @search="onSearch"
          class="search-input" />
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
            <th>老板</th>
            <th>联系电话</th>
            <th>地址</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(company, i) in filteredCompanies" :key="company.id" @click="openDetail(company)">
            <td data-label="企业名称">{{ company.name }}</td>
            <td data-label="老板">{{ company.boss || '-' }}</td>
            <td data-label="联系电话">
              <div class="phone-list" v-if="company.phone">
                <a v-for="(p, i) in splitPhones(company.phone)" :key="company.id + '-tel-' + i" class="tel-link"
                  :href="telHref(p)" @click.stop>{{ p }}</a>
              </div>
              <template v-else>-</template>
            </td>
            <td data-label="地址">{{ company.address || '-' }}</td>
            <td data-label="状态"><span class="status-badge" :class="statusClass(visitStatus[company.id] || 1)">{{
              statusText(visitStatus[company.id] || 1) }}</span></td>
            <td data-label="操作">
              <button class="btn btn-secondary" @click.stop="openDetail(company)">详情</button>
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
            <a-tag :color="statusTagColor(visitStatus[company.id] || 1)">{{ statusText(visitStatus[company.id] || 1)
            }}</a-tag>
          </template>
          <div class="card-meta">
            <div class="meta-item"><span class="meta-label">老板</span><span class="meta-value">{{ company.boss || '-'
            }}</span></div>
            <div class="meta-item">
              <span class="meta-label">电话</span>
              <div class="meta-value phone-list">
                <a v-for="(p, i) in splitPhones(company.phone)" :key="company.id + '-mtel-' + i" class="tel-link"
                  :href="telHref(p)" @click.stop>{{ p }}</a>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <a-button type="primary" size="small" @click.stop="openDetail(company)">详情</a-button>
          </div>
        </a-card>
      </a-space>
    </div>

    <button class="fab-add" v-if="isMobile" @click="menuOpen = true" aria-label="菜单">＋</button>

    <a-drawer v-model:visible="showDetail" placement="bottom" :height="isMobile ? '85vh' : '70vh'" :footer="false"
      :title="currentCompany?.name || '企业详情'">
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">老板</div>
          <div class="detail-value">{{ currentCompany?.boss || '-' }}</div>
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
          <div class="detail-label">省市区</div>
          <div class="detail-value">{{ [currentCompany?.raw?.province, currentCompany?.raw?.city,
          currentCompany?.raw?.district].filter(Boolean).join(' / ') || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">注册资本</div>
          <div class="detail-value">{{ currentCompany?.raw?.registerCapital || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">企业规模</div>
          <div class="detail-value">{{ currentCompany?.raw?.scale || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">参保人数</div>
          <div class="detail-value">{{ currentCompany?.raw?.people || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">公司简介</div>
          <div class="detail-value">{{ currentCompany?.raw?.profile || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">经营范围</div>
          <div class="detail-value">{{ currentCompany?.raw?.businessScope || '-' }}</div>
        </div>
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

    <MenuDrawer v-model:visible="menuOpen" current="shishi" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { IconMenu } from '@arco-design/web-vue/es/icon'
import { shishiClothesData } from '../data/shishiClothes.js'
import MenuDrawer from '../components/MenuDrawer.vue'

const STORAGE_KEY = 'shishi_clothes_companies'
const STATUS_KEY = 'shishi_clothes_status'
const NOTES_KEY = 'shishi_clothes_notes'
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
  try {
    companies.value = (shishiClothesData && shishiClothesData.length)
      ? shishiClothesData.map((r, i) => ({
        id: String(i + 1),
        name: r.company || '',
        boss: r.boss || '',
        address: r.address || '',
        phone: [r.usefulPhone, r.morePhone].filter(v => !!v && String(v).trim() && String(v).trim() !== '-').join(';'),
        raw: r,
      }))
      : []
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
    try { visitStatus.value = JSON.parse(localStorage.getItem(STATUS_KEY) || '{}') } catch { visitStatus.value = {} }
  } finally {
    loading.value = false
  }
})
onUnmounted(() => { window.removeEventListener('resize', onResize) })

const filteredCompanies = computed(() => {
  const q = (query.value || '').toLowerCase()
  if (!q) return companies.value
  return companies.value.filter(c =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.boss || '').toLowerCase().includes(q) ||
    (c.phone || '').toLowerCase().includes(q)
  )
})

function onSearch() { }
function splitPhones(v) {
  return String(v || '')
    .split(/[；;]/)
    .map(s => s.trim())
    .filter(s => !!s && s !== '-' && s !== '—')
}
function telHref(p) { return 'tel:' + String(p).replace(/\s+/g, '') }

function statusText(s) {
  return { 1: '未拜访', 2: '已拜访', 3: '已拒绝', 4: '已合作', 5: '已签单' }[s] || '未知'
}
function statusClass(s) {
  return { 1: 'status-unvisited', 2: 'status-visited', 3: 'status-rejected', 4: 'status-cooperating', 5: 'status-signed' }[s] || 'status-unvisited'
}
function statusTagColor(s) {
  return { 1: 'gold', 2: 'arcoblue', 3: 'red', 4: 'green', 5: 'purple' }[s] || 'gold'
}

const showDetail = ref(false)
const currentCompany = ref(null)
const editStatus = ref(1)
const editNotes = ref('')
const visitStatus = ref({})

function openDetail(c) {
  currentCompany.value = { ...c }
  editStatus.value = visitStatus.value[c.id] || 1
  editNotes.value = ''
  showDetail.value = true
}

async function saveRecord() {
  const id = currentCompany.value?.id
  if (!id) return
  visitStatus.value[id] = editStatus.value
  localStorage.setItem(STATUS_KEY, JSON.stringify(visitStatus.value))
  const note = (editNotes.value || '').trim()
  if (note) {
    let logs
    try { logs = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') } catch { logs = {} }
    const arr = Array.isArray(logs[id]) ? logs[id] : []
    arr.push({ date: new Date().toISOString(), note })
    logs[id] = arr
    localStorage.setItem(NOTES_KEY, JSON.stringify(logs))
  }
  Message.success('已保存（本地存储）')
  showDetail.value = false
}
function closeDetail() { showDetail.value = false }
</script>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  background: #f0f2f5;
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
  text-align: center;
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
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.85);
}

.menu-btn:active {
  transform: translateY(1px);
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

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.loading {
  display: none;
  text-align: center;
  padding: 20px;
  color: #666;
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

  .header p {
    display: none;
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

  .search-input :deep(.arco-input) {
    font-size: 16px;
  }

  .search-bar :deep(.arco-btn) {
    width: 100%;
  }

  .search-results-info {
    padding: 0 16px;
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

  .card-actions {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
  }

  .status-badge {
    min-width: auto;
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

  :deep(.arco-drawer-body) {
    -webkit-overflow-scrolling: touch;
  }

  .detail-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.2rem;
  }
}
</style>
