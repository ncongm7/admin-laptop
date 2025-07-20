<template>
  <form class="voucher-filter row g-2 align-items-center" @submit.prevent>
    <div class="col-md-4">
      <input v-model="local.search" class="form-control" placeholder="Tìm phiếu giảm giá theo mã hoặc tên" @input="emitFilter" />
    </div>
    <div class="col-md-2">
      <input v-model="local.from" type="date" class="form-control" placeholder="Từ ngày" @change="emitFilter" />
    </div>
    <div class="col-md-2">
      <input v-model="local.to" type="date" class="form-control" placeholder="Đến ngày" @change="emitFilter" />
    </div>
    <div class="col-md-2">
      <select v-model="local.kieu" class="form-select" @change="emitFilter">
        <option value="">Kiểu</option>
        <option value="Cá nhân">Cá nhân</option>
        <option value="Chung">Chung</option>
      </select>
    </div>
    <div class="col-md-2">
      <select v-model="local.trang_thai" class="form-select" @change="emitFilter">
        <option value="">Trạng thái</option>
        <option value="Đang diễn ra">Đang diễn ra</option>
        <option value="Sắp diễn ra">Sắp diễn ra</option>
        <option value="Đã kết thúc">Đã kết thúc</option>
      </select>
    </div>
  </form>
</template>
<script setup>
import { reactive } from 'vue'
const emit = defineEmits(['filter'])
const local = reactive({ search: '', from: '', to: '', kieu: '', trang_thai: '' })
function emitFilter() { emit('filter', { ...local }) }
</script>
<style scoped>
.voucher-filter { margin-bottom: 0; }
input, select, .form-control, .form-select {
  font-size: 14px !important;
  height: 36px !important;
  padding: 4px 10px !important;
}
</style> 