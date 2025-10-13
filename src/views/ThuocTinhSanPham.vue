<template>
  <div class="product-attributes-page p-3">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-0">Thuộc tính sản phẩm</h2>
        <p class="text-muted mb-0">Quản lý các thuộc tính sản phẩm như CPU, RAM, GPU, màu sắc...</p>
      </div>
      <!-- <div class="d-flex gap-2">
        <button class="btn btn-outline-success btn-sm" @click="showAddAttributeModal">
          <i class="bi bi-plus-circle"></i> Thêm thuộc tính
        </button>
        <button class="btn btn-outline-success btn-sm">
          <i class="bi bi-arrow-clockwise"></i> Làm mới
        </button>
      </div> -->
    </div>

    <div class="tab-content p-4 bg-white rounded shadow-sm">
      <ProductAttributesView @open-attribute-modal="openAttributeModal" />
    </div>

    <!-- Attribute CRUD Modal -->
    <AttributeCrudModal v-if="showAttrModal" :type="currentAttrType" @close="showAttrModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductAttributesView from './sanpham/viewsanpham/ProductAttributesView.vue'
import AttributeCrudModal from '@/components/sanpham/quanlisanpham/AttributeCrudModal.vue'

const showAttrModal = ref(false)
const currentAttrType = ref('')

function openAttributeModal(type) {
  currentAttrType.value = type
  showAttrModal.value = true
}

function showAddAttributeModal() {
  // Show modal to add new attribute category
  console.log('Show add attribute modal')
}
</script>

<style scoped>
.product-attributes-page {
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
  .product-attributes-page {
    padding: 0.5rem;
    min-height: unset;
  }

  .tab-content {
    padding: 1rem 0.5rem;
  }
}
</style>
