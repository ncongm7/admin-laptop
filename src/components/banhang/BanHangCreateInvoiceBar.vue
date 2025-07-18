<template>
  <div class="banhang-create-invoice-bar d-flex align-items-center justify-content-between mb-4 p-3">
    <div class="d-flex align-items-center gap-2">
      <i class="lucide lucide-file-text text-primary fs-4"></i>
      <span class="fw-bold text-primary fs-5">Tạo hóa đơn mới</span>
    </div>
    <button class="btn btn-warning text-white fw-bold px-4 py-2 rounded-pill shadow-sm" @click="$emit('create-invoice')">
      <i class="lucide lucide-plus"></i> Tạo hóa đơn
    </button>
  </div>
</template>

<script setup>
// No props needed, emits 'create-invoice'
</script>

<style scoped>
.banhang-create-invoice-bar {
  background: linear-gradient(90deg, #f8fafc 60%, #e3f0ff 100%);
  border-radius: 16px;
  box-shadow: 0 2px 12px #0d6efd11;
}
.btn-warning {
  background: linear-gradient(90deg, #ffb300 60%, #ffd54f 100%);
  border: none;
  color: #fff !important;
  box-shadow: 0 2px 8px #ffb30022;
  transition: background 0.2s, color 0.2s;
}
.btn-warning:hover {
  background: linear-gradient(90deg, #ffa000 60%, #ffe082 100%);
  color: #fff !important;
}
</style>
