<template>
  <div class="product-admin p-3">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-0">Quản Lý Sản Phẩm</h2>

      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-sm btn-outline-success btn-add-product d-flex align-items-center gap-2"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle"></i>
          <span class="btn-label small-text">Thêm sản phẩm</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="tab-content p-4 bg-white rounded shadow-sm">
      <ProductsView
        :showCreateModal="showCreateModal"
        @close-create-modal="showCreateModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductsView from './sanpham/viewsanpham/ProductsView.vue'

const showCreateModal = ref(false)

function openCreateModal() {
  showCreateModal.value = true
}
</script>

<style scoped>
.product-admin {
  min-height: 80vh;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  max-width: 1200px;
  margin: 0 auto;
}

.btn-add-product {
  background: #fff;
  color: #16a34a;
  border: 1px solid #16a34a;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px; /* same as other buttons */
  box-shadow: none;
  transition: all 0.2s ease;
}

.btn-add-product:hover {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}

.btn-add-product:active {
  transform: translateY(1px);
}

.btn-add-product .btn-label {
  letter-spacing: 0.2px;
}

.small-text {
  font-size: 0.9rem;
}

.dropdown-menu.show {
  display: block;
  min-width: 220px;
  z-index: 1000;
}

.dropdown-item {
  cursor: pointer;
  font-size: 1rem;
  padding: 10px 18px;
  transition:
    background 0.15s,
    color 0.15s;
}

.dropdown-item:hover {
  background: #e5f1fb;
  color: #007aff;
}


.tab-content {
  min-height: 300px;
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  margin-top: -2px;
}

/* Button styling for consistency */
.btn-outline-success {
  background: #fff;
  color: #16a34a;
  border: 1px solid #16a34a;
  transition: all 0.2s ease;
}

.btn-outline-success:hover {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}

@media (max-width: 768px) {
  .product-admin {
    padding: 0.5rem;
    min-height: unset;
  }

  .tab-content {
    padding: 1rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .product-admin {
    padding: 0.2rem;
    border-radius: 0;
    box-shadow: none;
  }

  .tab-content {
    padding: 0.5rem 0.2rem;
    border-radius: 0 0 8px 8px;
  }
}
</style>
