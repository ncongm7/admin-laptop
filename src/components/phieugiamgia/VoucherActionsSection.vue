<template>
  <div class="filter-actions">
    <button class="btn btn-secondary" type="button" @click="$emit('reset')">Đặt lại bộ lọc</button>
    <button class="btn btn-primary" type="button" @click="$emit('export-excel')">Xuất Excel</button>
    <button class="btn btn-primary" type="button" @click="$emit('add-voucher')">Thêm Phiếu Giảm Giá</button>
  </div>
</template>
<script setup>
// Không cần props, chỉ emit các sự kiện
</script>
<style scoped>
@import url('../../views/QuanLiPhieuGiamGia.vue');
</style> 