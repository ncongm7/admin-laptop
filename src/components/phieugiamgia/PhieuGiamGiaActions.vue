<template>
  <div class="actions-bar">
    <button :disabled="!selected.length" @click="$emit('send')">Gửi cho khách hàng</button>
    <select :disabled="!selected.length" v-model="status" @change="emitChangeStatus">
      <option value="">Đổi trạng thái</option>
      <option value="Chưa gửi">Chưa gửi</option>
      <option value="Đã gửi">Đã gửi</option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ selected: { type: Array, default: () => [] } })
const emit = defineEmits(['send', 'changeStatus'])
const status = ref('')
function emitChangeStatus() {
  if (status.value) emit('changeStatus', status.value)
  status.value = ''
}
</script>

<style scoped>
.actions-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
button {
  background: #1976d2;
  color: #fff;
  border: none;
  padding: 7px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style> 