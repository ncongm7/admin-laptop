<template>
  <div class="product-variants-page p-3">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-0">Quản lý biến thể sản phẩm</h2>
        <p class="text-muted mb-0">Quản lý các biến thể sản phẩm với các thuộc tính khác nhau</p>
      </div>
    </div>

    <div class="tab-content p-4 bg-white rounded shadow-sm">
      <ProductVariantsView />
    </div>
  </div>
</template>

<script setup>
import ProductVariantsView from './sanpham/viewsanpham/ProductVariantsView.vue'
</script>

<style scoped>
.product-variants-page {
  min-height: 80vh;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  max-width: 1200px;
  margin: 0 auto;
}

.tab-content {
  min-height: 300px;
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  margin-top: -2px;
}

@media (max-width: 768px) {
  .product-variants-page {
    padding: 0.5rem;
    min-height: unset;
  }

  .tab-content {
    padding: 1rem 0.5rem;
  }
}
</style>
