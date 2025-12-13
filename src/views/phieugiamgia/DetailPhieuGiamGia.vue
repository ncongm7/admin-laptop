<template>
  <div class="voucher-form-page">
    <h2 class="form-header">Cập nhật phiếu giảm giá</h2>
    <PhieuGiamGiaForm mode="update" :voucherId="voucherId" />
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import PhieuGiamGiaForm from '../components/phieugiamgia/PhieuGiamGiaForm.vue'
const route = useRoute()
const voucherId = route.params.id
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