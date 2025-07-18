<template>
  <div class="voucher-form-page">
    <h2 class="form-header">Tạo mới phiếu giảm giá</h2>
    <PhieuGiamGiaForm mode="add" />
  </div>
</template>
<script setup>
import PhieuGiamGiaForm from '../components/phieugiamgia/PhieuGiamGiaForm.vue'
</script>
<style scoped>
.voucher-form-page {
  padding: 32px 0;
  background: #fafbfc;
  min-height: 100vh;
}
.form-header {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
}
</style> 