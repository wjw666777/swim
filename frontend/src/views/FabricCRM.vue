<template>
  <div class="page">
    <div class="topbar">
      <div class="title">面料 CRM</div>
      <a-button type="text" @click="menuOpen = true">菜单</a-button>
    </div>

    <div class="search-bar">
      <div class="search-container">
        <a-input-search allow-clear placeholder="搜索企业名称、老板或电话..." v-model="query" @search="onSearch"
          class="search-input" />
        <a-select v-model="selectedProvince" :options="provinceOptions" placeholder="选择省份"
          :style="{ width: '160px' }" />
        <a-button size="small" @click="clearProvince">清空省份</a-button>
        <a-button type="primary" @click="showAddModal = true">新增企业</a-button>
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
              <a-button size="mini" @click="startEdit(record)">编辑</a-button>
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

    <MenuDrawer v-model:visible="menuOpen" current="fabric" />

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
                <a v-for="(p, i) in splitPhones(current?.raw?.morePhone || current?.raw?.phones || '-')"
                  :key="'d-mtel-' + i" class="tel-link" :href="telHref(p)" @click.stop>{{ p }}</a>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="邮箱">{{ current?.raw?.email || '-' }}</a-descriptions-item>
            <a-descriptions-item label="公司类型">{{ current?.raw?.companyType || '-' }}</a-descriptions-item>
            <a-descriptions-item label="人员规模">{{ current?.raw?.people || current?.raw?.insuredCount || '-'
              }}</a-descriptions-item>
            <a-descriptions-item label="企业规模">{{ current?.raw?.scale || current?.raw?.companySize || '-'
              }}</a-descriptions-item>
            <a-descriptions-item label="公司简介">{{ current?.raw?.profile || current?.raw?.companyIntro || '-'
              }}</a-descriptions-item>
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

    <a-modal v-model:visible="showAddModal" title="新增企业" @ok="addCompany" @cancel="() => showAddModal = false">
      <a-form :model="addForm" layout="vertical">
        <a-form-item field="name" label="企业名称"><a-input v-model="addForm.name" /></a-form-item>
        <a-form-item field="boss" label="老板名称"><a-input v-model="addForm.boss" /></a-form-item>
        <a-form-item field="phone" label="电话"><a-input v-model="addForm.phone" /></a-form-item>
        <a-form-item field="province" label="省份"><a-input v-model="addForm.province" /></a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { fabricData } from '../data/fabric.js'
import MenuDrawer from '../components/MenuDrawer.vue'

const router = useRouter()
const menuOpen = ref(false)
const loading = ref(false)
const companies = ref([])
const detailOpen = ref(false)
const editOpen = ref(false)
const current = ref(null)
const editForm = ref({ id: '', name: '', boss: '', phone: '' })
const showAddModal = ref(false)
const addForm = ref({ name: '', boss: '', phone: '', province: '' })
const query = ref('')
const selectedProvince = ref()
const isMobile = ref(false)
const detailStatus = ref('未拜访')
const detailNotes = ref('')

const VISIT_STATUS_KEY = 'fabric_visit_status'
const VISIT_LOGS_KEY = 'fabric_visit_logs'
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
function splitPhones(v) {
  return String(v || '')
    .split(/[；;]/)
    .map(s => s.trim())
    .filter(s => !!s && s !== '-' && s !== '—')
}
function telHref(p) { return 'tel:' + String(p).replace(/\s+/g, '') }
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

// 本地缓存解析与有效性校验
function parseLocalCompanies() {
  const saved = localStorage.getItem('fabric_companies')
  if (!saved) return null
  try { return JSON.parse(saved) } catch { return null }
}
function hasValidCompanies(list) {
  return Array.isArray(list) && list.length && list.some(c => ((c?.name || '').trim()) || ((c?.raw?.company || c?.raw?.name || '').trim()))
}

function openDetail(record) {
  current.value = record
  detailStatus.value = visitStatus.value[record.id] || '未拜访'
  detailNotes.value = ''
  detailOpen.value = true
}

function saveDetailRecord() {
  const id = current.value?.id
  if (!id) return
  try {
    visitStatus.value[id] = detailStatus.value
    localStorage.setItem(VISIT_STATUS_KEY, JSON.stringify(visitStatus.value))
    // 保存回访记录本地
    const logsRaw = localStorage.getItem(VISIT_LOGS_KEY)
    const logs = logsRaw ? JSON.parse(logsRaw) : {}
    const arr = Array.isArray(logs[id]) ? logs[id] : []
    if ((detailNotes.value || '').trim()) {
      arr.push({ date: new Date().toISOString(), note: detailNotes.value })
    }
    logs[id] = arr
    localStorage.setItem(VISIT_LOGS_KEY, JSON.stringify(logs))
    Message.success('状态与回访记录已保存到本地')
  } catch (e) {
    console.warn('saveDetailRecord failed:', e)
    Message.warning('状态保存失败')
  }
}

function startEdit(record) {
  editForm.value = { id: record.id, name: record.name || '', boss: record.boss || '', phone: record.phone || '' }
  editOpen.value = true
}

function confirmEdit() {
  const id = editForm.value.id
  const idx = companies.value.findIndex(c => c.id === id)
  if (idx >= 0) {
    const updated = { ...companies.value[idx], ...editForm.value }
    companies.value[idx] = updated
    localStorage.setItem('fabric_companies', JSON.stringify(companies.value))
    editOpen.value = false
    Message.success('更新成功（本地）')
  } else {
    editOpen.value = false
  }
}
function cancelEdit() { editOpen.value = false }

function remove(record) {
  const id = record.id
  companies.value = companies.value.filter(c => c.id !== id)
  localStorage.setItem('fabric_companies', JSON.stringify(companies.value))
  Message.success('已删除（本地）')
}

function addCompany() {
  const newId = String(Date.now())
  const raw = { company: addForm.value.name, boss: addForm.value.boss, usefulPhone: addForm.value.phone, province: addForm.value.province }
  const phone = [raw.usefulPhone].filter(v => !!v && String(v).trim() && String(v).trim() !== '-').join(';')
  const company = { id: newId, name: raw.company || '', boss: raw.boss || '', phone, raw }
  companies.value.unshift(company)
  localStorage.setItem('fabric_companies', JSON.stringify(companies.value))
  showAddModal.value = false
  addForm.value = { name: '', boss: '', phone: '', province: '' }
  Message.success('新增成功（本地）')
}

onMounted(() => {
  onResize(); window.addEventListener('resize', onResize)
  loading.value = true
  try {
    const savedVisit = localStorage.getItem(VISIT_STATUS_KEY)
    const savedCompaniesParsed = parseLocalCompanies()
    if (hasValidCompanies(savedCompaniesParsed)) {
      companies.value = savedCompaniesParsed
    } else {
      companies.value = Array.isArray(fabricData) && fabricData.length
        ? fabricData.map((r, i) => ({ id: r.id || String(i + 1), name: r.company || r.name || '', boss: r.boss || '', phone: [r.usefulPhone, r.morePhone, r.phone].filter(v => !!v && String(v).trim() && String(v).trim() !== '-').join(';'), raw: r }))
        : []
      localStorage.setItem('fabric_companies', JSON.stringify(companies.value))
    }
    visitStatus.value = savedVisit ? JSON.parse(savedVisit) : {}
  } catch (e) {
    console.warn('Load fabric data failed:', e)
    companies.value = []
  } finally {
    loading.value = false
  }
})
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

.loading {
  padding: 8px 12px;
  color: #666;
}

.search-results-info {
  padding: 6px 16px;
  font-size: 12px;
  color: #666;
  display: none;
}

.search-results-info.show {
  display: block;
}
</style>
