<template>
  <div class="container">
    <div class="header">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1>泳装企业CRM系统</h1>
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
        <a-input-search
          allow-clear
          placeholder="搜索企业名称、类型或电话..."
          v-model="query"
          @search="onSearch"
          class="search-input"
        />
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
            <td data-label="类型">{{ company.type || '未分类' }}</td>
            <td data-label="联系人">{{ company.contact || '-' }}</td>
            <td data-label="联系电话">
              <div class="phone-list" v-if="company.phone">
                <a
                  v-for="(p, i) in splitPhones(company.phone)"
                  :key="company.id + '-tel-' + i"
                  class="tel-link"
                  :href="telHref(p)"
                  @click.stop
                >{{ p }}</a>
              </div>
              <template v-else>-</template>
            </td>
            <td data-label="状态"><span class="status-badge" :class="statusClass(company.status)">{{ statusText(company.status) }}</span></td>
            <td data-label="操作">
              <button class="btn btn-secondary" @click.stop="openDetail(company)">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 移动端卡片列表（Arco）-->
    <div class="cards-container" v-else>
      <a-space direction="vertical" :size="12" style="width: 100%">
        <a-card
          v-for="(company, i) in filteredCompanies"
          :key="company.id"
          hoverable
          @click="openDetail(company)"
        >
          <template #title>
            <div class="card-title">{{ company.name }}</div>
          </template>
          <template #extra>
            <a-tag :color="statusTagColor(company.status)">{{ statusText(company.status) }}</a-tag>
          </template>
          <div class="card-meta">
            <div class="meta-item"><span class="meta-label">类型</span><span class="meta-value">{{ company.type || '未分类' }}</span></div>
            <div class="meta-item">
              <span class="meta-label">电话</span>
              <div class="meta-value phone-list">
                <a
                  v-for="(p, i) in splitPhones(company.phone)"
                  :key="company.id + '-mtel-' + i"
                  class="tel-link"
                  :href="telHref(p)"
                  @click.stop
                >{{ p }}</a>
              </div>
            </div>
            <div class="meta-item"><span class="meta-label">联系人</span><span class="meta-value">{{ company.contact || '-' }}</span></div>
          </div>
          <div class="card-actions">
            <a-button type="primary" size="small" @click.stop="openDetail(company)">详情</a-button>
          </div>
        </a-card>
      </a-space>
    </div>

    <!-- 移动端悬浮新增按钮 -->
    <button class="fab-add" v-if="isMobile" @click="showAddModal = true" aria-label="新增企业">＋</button>

    <!-- 详细信息抽屉（Arco） -->
    <a-drawer
      v-model:visible="showDetail"
      placement="bottom"
      :height="isMobile ? '85vh' : '70vh'"
      :footer="false"
      :title="currentCompany?.name || '企业详情'"
    >
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">类型</div><div class="detail-value">{{ currentCompany?.type || '未分类' }}</div></div>
        <div class="detail-item"><div class="detail-label">电话</div><div class="detail-value">{{ currentCompany?.phone || '-' }}</div></div>
        <div class="detail-item"><div class="detail-label">地址</div><div class="detail-value">{{ currentCompany?.address || '-' }}</div></div>
        <div class="detail-item"><div class="detail-label">行业</div><div class="detail-value">{{ currentCompany?.industry || '-' }}</div></div>
        <div class="detail-item"><div class="detail-label">联系人</div><div class="detail-value">{{ currentCompany?.contact || '-' }}</div></div>
        <div class="detail-item"><div class="detail-label">公司详情</div><div class="detail-value">{{ currentCompany?.description || '-' }}</div></div>
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

    <!-- 新增企业抽屉（Arco） -->
    <a-drawer
      v-model:visible="showAddModal"
      placement="bottom"
      :height="isMobile ? '85vh' : '70vh'"
      title="新增企业"
      :footer="false"
    >
      <a-form layout="vertical" :model="addForm">
        <a-form-item field="name" label="企业名称 *">
          <a-input v-model="addForm.name" allow-clear placeholder="请输入企业名称" />
        </a-form-item>
        <a-form-item field="type" label="类型 *">
          <a-select v-model="addForm.type" placeholder="请选择类型">
            <a-option value="成衣">成衣</a-option>
            <a-option value="面料">面料</a-option>
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
          <a-button @click="showAddModal=false">取消</a-button>
          <a-button type="primary" style="margin-left: 8px" @click="addCompany">新增</a-button>
        </div>
      </a-form>
    </a-drawer>

    <!-- 页面切换抽屉 -->
    <a-drawer v-model:visible="menuOpen" placement="right" width="240" :footer="false">
      <template #title>页面切换</template>
      <a-space direction="vertical" fill>
        <a-button long type="primary" @click="go('/swim')">泳装 CRM</a-button>
        <a-button long @click="go('/chongfengyi')">冲锋衣 CRM</a-button>
        <a-button long @click="go('/fabric')">面料 CRM</a-button>
        <a-button long @click="go('/lalian')">拉链 CRM</a-button>
      </a-space>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { swimData } from '../data/swimCompany.js'
import { Message } from '@arco-design/web-vue'
import { fetchCompanies, addCompanyApi, deleteCompanyApi, updateCompanyApi, API_BASE } from '../api/client.js'
import { useRouter } from 'vue-router'
import { IconMenu } from '@arco-design/web-vue/es/icon'

const STORAGE_KEY = 'companiesData'
const loading = ref(false)
const query = ref('')
const companies = ref([])
const isMobile = ref(false)
const menuOpen = ref(false)
const router = useRouter()
const onResize = () => { isMobile.value = window.innerWidth <= 768 }

function go(path) { router.push(path); menuOpen.value = false }

// 初始化数据：localStorage优先
onMounted(() => {
  loading.value = true
  onResize()
  window.addEventListener('resize', onResize)
  ;(async () => {
    try {
      if (API_BASE) {
        const timeoutMs = 3000
        const serverData = await Promise.race([
          fetchCompanies(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
        ])
        if (Array.isArray(serverData) && serverData.length) {
          companies.value = serverData
          localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
        } else {
          const saved = localStorage.getItem(STORAGE_KEY)
          companies.value = saved ? JSON.parse(saved) : swimData
          localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY)
        companies.value = saved ? JSON.parse(saved) : swimData
        localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
      }
    } catch (e) {
      const saved = localStorage.getItem(STORAGE_KEY)
      companies.value = saved ? JSON.parse(saved) : swimData
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies.value))
      Message.warning('接口超时或异常，已使用本地swimCompany.js数据')
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

function onSearch() {}
function clearSearch() { query.value = '' }

// 多号码拆分与tel链接生成
function splitPhones(v) {
  return String(v || '')
    .split(/[；;]/)
    .map(s => s.trim())
    .filter(Boolean)
}
function telHref(p) {
  return 'tel:' + String(p).replace(/\s+/g, '')
}

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

// Arco Tag 颜色映射
function statusTagColor(s) {
  return {
    1: 'gold',
    2: 'arcoblue',
    3: 'red',
    4: 'green',
    5: 'purple'
  }[s] || 'gold'
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
    name: (query.value || '').trim() || '未命名',
    type: '成衣',
    contact: addForm.value.contact || '',
    phone: '',
    address: '',
    industry: '泳装相关',
    description: addForm.value.description || '',
    status: 1
  }
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

const showAddModal = ref(false)
const addForm = ref({ name: '', type: '成衣', contact: '', phone: '', address: '', industry: '泳装相关', scale: '', description: '' })
</script>

<style scoped>
* { box-sizing: border-box; }
body { background: #f0f2f5; }
.container { max-width: 1200px; margin: 20px auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
.header h1 { font-size: 2rem; margin-bottom: 10px; font-weight: 300; }
.search-bar { padding: 20px 30px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
.search-container { display: flex; gap: 15px; align-items: center; }
.search-input { flex: 1; }
.menu-btn { color: #fff; border: 1px solid rgba(255,255,255,0.55); background: rgba(255,255,255,0.16); backdrop-filter: blur(6px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
.menu-btn:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.85); }
.menu-btn:active { transform: translateY(1px); }
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
/* 旧模态样式移除，改用 Arco Drawer */
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
.detail-item { background: #f8f9fa; padding: 15px; border-radius: 10px; border-left: 4px solid #667eea; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; margin-bottom: 8px; font-weight: 600; color: #495057; }
.form-control { width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; }
.btn { padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-right: 10px; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-secondary { background: #6c757d; color: white; }
.loading { display: none; text-align: center; padding: 20px; color: #666; }

/* 移动端适配（卡片视图 + 全屏模态 + 悬浮新增）*/
@media (max-width: 768px) {
  .container { max-width: none; margin: 0; border-radius: 0; box-shadow: none; }
  .header { padding: 16px; }
  .header h1 { font-size: 1.4rem; }
  .header p { display: none; }
  .search-bar { padding: 12px 16px; position: sticky; top: 0; z-index: 10; }
  .search-container { flex-direction: column; gap: 8px; align-items: stretch; }
  .search-input :deep(.arco-input) { font-size: 16px; }
  .search-bar :deep(.arco-btn) { width: 100%; }
  .search-results-info { padding: 0 16px; }

  /* 卡片列表 */
  .cards-container { padding: 0 16px 70px; }
  /* 使用 Arco Card，移除旧卡片容器样式 */
  .card-title { font-size: 16px; font-weight: 600; color: #212529; }
  .card-meta { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 6px; color: #495057; }
  .meta-item { display: flex; gap: 6px; align-items: center; }
  .meta-label { font-weight: 600; color: #6c757d; }
  .meta-value { color: #343a40; }
.tel-link { color: #0d6efd; text-decoration: none; }
.tel-link:active { opacity: 0.8; }
.phone-list a + a::before { content: '；'; color: #adb5bd; margin: 0 6px; }
  .card-actions { margin-top: 10px; display: flex; justify-content: flex-end; }
  /* 移动端按钮使用 Arco Button 默认样式 */
  .status-badge { min-width: auto; }

  /* 悬浮新增按钮 */
  .fab-add { position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom)); width: 52px; height: 52px; border-radius: 50%; border: none; color: #fff; font-size: 24px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px rgba(102,126,234,0.35); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

  /* Drawer 内容滚动优化 */
  :deep(.arco-drawer-body) { -webkit-overflow-scrolling: touch; }
  .detail-grid { grid-template-columns: 1fr; gap: 12px; }
}

@media (max-width: 480px) {
  .header h1 { font-size: 1.2rem; }
}
</style>