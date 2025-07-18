<template>
  <div class="dialog-backdrop">
    <div class="dialog-content">
      <h3>Gửi phiếu cho khách hàng</h3>
      <div class="customer-list">
        <label v-for="c in customers" :key="c.id">
          <input type="checkbox" :value="c.id" v-model="selectedCustomers" />
          {{ c.ten }} ({{ c.sdt }})
        </label>
      </div>
      <div class="dialog-actions">
        <button @click="$emit('close')">Hủy</button>
        <button :disabled="!selectedCustomers.length" @click="send">Gửi</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ vouchers: Array, customers: Array })
const emit = defineEmits(['send', 'close'])
const selectedCustomers = ref([])
function send() {
  emit('send', { vouchers: props.vouchers, customers: selectedCustomers.value })
}
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px 32px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
}
.customer-list {
  max-height: 200px;
  overflow-y: auto;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
button {
  padding: 7px 16px;
  border-radius: 4px;
  border: none;
  background: #1976d2;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 