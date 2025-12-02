<template>
  <div class="page">
    <div class="topbar">
      <div class="title">拉链公司 CRM</div>
      <a-button type="text" @click="menuOpen = true">菜单</a-button>
    </div>
    <div class="search-bar">
      <div class="search-container">
        <a-input-search allow-clear placeholder="搜索企业名称、类型或电话..." v-model="query" @search="onSearch"
          class="search-input" />
        <a-select v-model="selectedProvince" :options="provinceOptions" placeholder="选择省份"
          :style="{ width: '160px' }" />
        <a-button size="small" @click="clearProvince">清空省份</a-button>
      </div>
    </div>
    <div class="search-results-info" :class="{ show: query }">
      找到 <span>{{ filteredCompanies.length }}</span> 条匹配结果
    </div>
    <div id="loading" v-show="loading" class="loading">正在加载数据...</div>

    <div class="content" v-if="!isMobile">
      <a-spin :loading="loading">
        <a-table :data="filteredCompanies" :columns="columns" row-key="id" size="small">
          <template #visit="{ record }">
            <a-select v-model="visitStatus[record.id]" size="mini" style="width: 120px">
              <a-option value="未拜访">未拜访</a-option>
              <a-option value="已拜访">已拜访</a-option>
              <a-option value="跟进中">跟进中</a-option>
            </a-select>
          </template>
          <template #phone="{ record }">
            <div class="phone-list">
              <a v-for="(p, i) in splitPhones(record.phone)" :key="record.id + '-tel-' + i" class="tel-link"
                :href="telHref(p)" @click.stop>{{ p }}</a>
            </div>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button size="mini" @click="openDetail(record)">详情</a-button>
              <a-button size="mini" status="danger" @click="remove(record)">删除</a-button>
            </a-space>
          </template>
        </a-table>
      </a-spin>
    </div>

    <!-- 移动端卡片列表 -->
    <div class="cards-container" v-else>
      <a-space direction="vertical" :size="12" style="width: 100%">
        <a-card v-for="(company, i) in filteredCompanies" :key="company.id" hoverable @click="openDetail(company)">
          <template #title>
            <div class="card-title">{{ company.name }}</div>
          </template>
          <template #extra>
            <a-tag :color="statusColor(visitStatus[company.id] || '未拜访')">
              {{ visitStatus[company.id] || '未拜访' }}
            </a-tag>
          </template>
          <div class="card-meta">
            <div class="meta-item">
              <span class="meta-label">电话</span>
              <div class="meta-value phone-list">
                <a v-for="(p, i) in splitPhones(company.phone)" :key="company.id + '-mtel-' + i" class="tel-link"
                  :href="telHref(p)" @click.stop>{{ p }}</a>
              </div>
            </div>
            <div class="meta-item"><span class="meta-label">老板</span><span class="meta-value">{{ company.boss || '-'
            }}</span></div>
          </div>
          <div class="card-actions">
            <a-button type="primary" size="small" @click.stop="openDetail(company)">详情</a-button>
          </div>
        </a-card>
      </a-space>
    </div>

    <MenuDrawer v-model:visible="menuOpen" current="lalian" />

    <a-drawer v-model:visible="detailOpen" placement="bottom" :height="isMobile ? '85vh' : '70vh'">
      <template #title>{{ current?.name || '详情' }}</template>
      <div class="detail">
        <div>
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="企业名称">{{ current?.raw?.company || current?.raw?.companyName || current?.name
            }}</a-descriptions-item>
            <a-descriptions-item label="登记状态">{{ current?.raw?.registerStatus || current?.raw?.registrationStatus || '-'
            }}</a-descriptions-item>
            <a-descriptions-item label="老板名称">{{ current?.raw?.boss || current?.boss }}</a-descriptions-item>
            <a-descriptions-item label="注册资本">{{ current?.raw?.registerCapital || '-' }}</a-descriptions-item>
            <a-descriptions-item label="成立日期">{{ current?.raw?.createTime || '-' }}</a-descriptions-item>
            <a-descriptions-item label="地址">{{ current?.raw?.address || '-' }}</a-descriptions-item>
            <a-descriptions-item label="省市区">{{ [current?.raw?.province, current?.raw?.city,
            current?.raw?.district].filter(Boolean).join(' / ') }}</a-descriptions-item>
            <a-descriptions-item label="电话">
              <div class="phone-list">
                <a v-for="(p, i) in splitPhones(current?.raw?.usefulPhone || current?.raw?.mobile || current?.phone)"
                  :key="'d-tel-' + i" class="tel-link" :href="telHref(p)" @click.stop>{{ p }}</a>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="更多电话">
              <div class="phone-list">
                <a v-for="(p, i) in splitPhones(current?.raw?.morePhone || current?.raw?.phones)" :key="'d-mtel-' + i"
                  class="tel-link" :href="telHref(p)" @click.stop>{{ p }}</a>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="邮箱">{{ current?.raw?.email || '-' }}</a-descriptions-item>
            <a-descriptions-item label="公司类型">{{ current?.raw?.公司类型 || current?.raw?.companyType || '-'
            }}</a-descriptions-item>
            <a-descriptions-item label="人员规模">{{ current?.raw?.people || current?.raw?.从业人数 || '-'
            }}</a-descriptions-item>
            <a-descriptions-item label="企业规模">{{ current?.raw?.scale || current?.raw?.企业规模 || '-'
            }}</a-descriptions-item>
            <a-descriptions-item label="公司简介">{{ current?.raw?.profile || '-' }}</a-descriptions-item>
            <a-descriptions-item label="经营范围">{{ current?.raw?.businessScope || '-' }}</a-descriptions-item>
          </a-descriptions>
          <div style="margin-top: 12px">
            <div class="form-label">拜访状态</div>
            <a-select v-model="detailStatus" placeholder="选择状态">
              <a-option value="未拜访">未拜访</a-option>
              <a-option value="已拜访">已拜访</a-option>
              <a-option value="跟进中">跟进中</a-option>
            </a-select>
          </div>
          <div>
            <div class="form-label">回访记录</div>
            <a-textarea v-model="detailNotes" :auto-size="{ minRows: 3, maxRows: 6 }" placeholder="请输入回访记录..." />
          </div>
        </div>
      </div>
      <template #footer>
        <a-space>
          <a-button @click="detailOpen = false">取消</a-button>
          <a-button type="primary" @click="saveDetailRecord">保存</a-button>
        </a-space>
      </template>
    </a-drawer>

    <a-modal v-model:visible="editOpen" title="编辑企业" @ok="confirmEdit" @cancel="cancelEdit">
      <a-form :model="editForm" layout="vertical">
        <a-form-item field="name" label="企业名称"><a-input v-model="editForm.name" /></a-form-item>
        <a-form-item field="boss" label="老板名称"><a-input v-model="editForm.boss" /></a-form-item>
        <a-form-item field="phone" label="电话"><a-input v-model="editForm.phone" /></a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { lalianData } from '../data/lalian.js'
import MenuDrawer from '../components/MenuDrawer.vue'

const router = useRouter()
const menuOpen = ref(false)
const loading = ref(false)
const companies = ref([])
const detailOpen = ref(false)
const editOpen = ref(false)
const current = ref(null)
const editForm = ref({ id: '', name: '', boss: '', phone: '' })
const query = ref('')
const selectedProvince = ref()
const isMobile = ref(false)
const detailStatus = ref('未拜访')
const detailNotes = ref('')

const VISIT_STATUS_KEY = 'lalian_visit_status'
const VISIT_LOGS_KEY = 'lalian_visit_logs'
const visitStatus = ref({})

const columns = [
  { title: '企业名称', dataIndex: 'name' },
  { title: '老板名称', dataIndex: 'boss' },
  { title: '电话', slotName: 'phone' },
  { title: '拜访状态', slotName: 'visit', width: 140 },
  { title: '操作', slotName: 'actions', width: 260 }
]

function go(path) { router.push(path); menuOpen.value = false }

const filteredCompanies = computed(() => {
  const q = (query.value || '').trim().toLowerCase()
  const province = selectedProvince.value
  let list = companies.value
  if (q) {
    list = list.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.boss || '').toLowerCase().includes(q)
    )
  }
  if (province) {
    if (province === '其他') {
      list = list.filter(c => ((c.raw?.province ?? '').trim()) === '')
    } else {
      list = list.filter(c => (c.raw?.province || '') === province)
    }
  }
  return list
})
function onSearch() { }
// 多号码拆分与tel链接生成
function splitPhones(v) {
  return String(v || '')
    .split(/[；;]/)
    .map(s => s.trim())
    .filter(s => !!s && s !== '-' && s !== '—')
}
function telHref(p) {
  return 'tel:' + String(p).replace(/\s+/g, '')
}
function statusColor(s) {
  switch (s) {
    case '未拜访': return 'gray'
    case '已拜访': return 'blue'
    case '跟进中': return 'red'
    default: return 'arcoblue'
  }
}

const provinceOptions = computed(() => {
  const s = new Set()
  let hasEmpty = false
  for (const c of companies.value) {
    const p = (c.raw?.province ?? '').trim()
    if (p) s.add(p)
    else hasEmpty = true
  }
  const opts = Array.from(s)
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
    .map(p => ({ label: p, value: p }))
  if (hasEmpty) opts.push({ label: '其他', value: '其他' })
  return opts
})

function clearProvince() { selectedProvince.value = undefined }
const onResize = () => { isMobile.value = window.innerWidth <= 768 }

function openDetail(record) {
  current.value = record
  detailStatus.value = visitStatus.value[record.id] || '未拜访'
  detailNotes.value = ''
  detailOpen.value = true
}

async function saveDetailRecord() {
  const id = current.value?.id
  if (!id) return
  visitStatus.value[id] = detailStatus.value
  localStorage.setItem(VISIT_STATUS_KEY, JSON.stringify(visitStatus.value))
  const note = (detailNotes.value || '').trim()
  if (note) {
    const rawLogs = localStorage.getItem(VISIT_LOGS_KEY) || '{}'
    let logsMap
    try { logsMap = JSON.parse(rawLogs) } catch { logsMap = {} }
    const arr = Array.isArray(logsMap[id]) ? logsMap[id] : []
    arr.push({ date: new Date().toISOString(), note })
    logsMap[id] = arr
    localStorage.setItem(VISIT_LOGS_KEY, JSON.stringify(logsMap))
  }
  Message.success('已保存（本地存储）')
  detailOpen.value = false
}

function startEdit(record) {
  current.value = record
  editForm.value = { id: record.id, name: record.name, boss: record.boss, phone: record.phone }
  editOpen.value = true
}

async function confirmEdit() {
  const idx = companies.value.findIndex(c => c.id === editForm.value.id)
  if (idx >= 0) companies.value[idx] = { ...companies.value[idx], ...editForm.value }
  Message.success('已更新（本地）')
  editOpen.value = false
}

function cancelEdit() { editOpen.value = false }

async function remove(record) {
  companies.value = companies.value.filter(c => c.id !== record.id)
  Message.success('已删除（本地）')
}

async function loadData() {
  loading.value = true
  try {
    // 仅使用本地JS数据（由 福建省拉链公司.xlsx 生成）
    companies.value = (lalianData && lalianData.length)
      ? lalianData.map((r, i) => ({
        id: r.id || String(i + 1),
        name: r.company || r.name || r.companyName || '',
        boss: r.boss || r.owner || r.contact || '',
        phone: [r.usefulPhone, r.morePhone, r.phone, r.tel]
          .filter(v => !!v && String(v).trim() && String(v).trim() !== '-')
          .join(';'),
        raw: r,
      }))
      : []
    try { visitStatus.value = JSON.parse(localStorage.getItem(VISIT_STATUS_KEY) || '{}') } catch { visitStatus.value = {} }
    localStorage.setItem('lalian_companies', JSON.stringify(companies.value))
  } finally {
    loading.value = false
  }
}

onMounted(() => { onResize(); window.addEventListener('resize', onResize); loadData() })
onUnmounted(() => { window.removeEventListener('resize', onResize) })
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border-2);
}

.title {
  font-weight: 600;
}

.content {
  padding: 12px;
  overflow: auto;
  flex: 1;
}

.detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.raw {
  background: var(--color-fill-2);
  padding: 12px;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .detail {
    grid-template-columns: 1fr;
  }
}

.search-bar {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.search-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
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

@media (max-width: 768px) {
  .detail {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
