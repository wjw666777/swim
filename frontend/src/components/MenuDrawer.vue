<template>
  <a-drawer v-model:visible="drawerVisible" placement="right" width="240" :footer="false">
    <template #title>页面切换</template>
    <a-space direction="vertical" fill>
      <a-button long :type="current === 'swim' ? 'primary' : undefined" @click="go('/swim')">泳装 CRM</a-button>
      <a-button long :type="current === 'liaoning' ? 'primary' : undefined" @click="go('/liaoning')">辽宁泳装 CRM</a-button>
      <a-button long :type="current === 'zhejiang' ? 'primary' : undefined" @click="go('/zhejiang')">浙江泳装 CRM</a-button>
      <a-button long :type="current === 'nanan' ? 'primary' : undefined" @click="go('/nanan')">南安服装 CRM</a-button>
      <a-button long :type="current === 'jinjiang' ? 'primary' : undefined" @click="go('/jinjiang')">晋江服装 CRM</a-button>
      <a-button long :type="current === 'shishi' ? 'primary' : undefined" @click="go('/shishi')">石狮服装 CRM</a-button>
      <a-button long :type="current === 'chongfengyi' ? 'primary' : undefined" @click="go('/chongfengyi')">冲锋衣 CRM</a-button>
      <a-button long :type="current === 'fabric' ? 'primary' : undefined" @click="go('/fabric')">面料 CRM</a-button>
      <a-button long :type="current === 'lalian' ? 'primary' : undefined" @click="go('/lalian')">拉链 CRM</a-button>
      <a-button long :type="current === 'wholesale' ? 'primary' : undefined" @click="go('/wholesale')">库存 CRM</a-button>
    </a-space>
  </a-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps({ visible: { type: Boolean, default: false }, current: { type: String, default: '' } })
const emit = defineEmits(['update:visible'])
const drawerVisible = computed({ get() { return props.visible }, set(v) { emit('update:visible', v) } })
const router = useRouter()
function go(path) { router.push(path); emit('update:visible', false) }
</script>
