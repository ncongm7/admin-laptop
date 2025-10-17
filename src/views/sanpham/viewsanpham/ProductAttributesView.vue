<template>
  <div class="product-attributes-view">
    <!-- Attribute Categories -->
    <div class="attribute-categories mb-4">
      <div class="row g-3">
        <!-- CPU -->
        <div class="col-md-4">
          <div class="attribute-card" @click="openAttributeModal('cpu')">
            <div class="attribute-icon">
              <i class="bi bi-cpu"></i>
            </div>
            <div class="attribute-info">
              <h6 class="attribute-name">CPU</h6>
      
            </div>
            <div class="attribute-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- RAM -->
        <div class="col-md-4">
          <div class="attribute-card" @click="openAttributeModal('ram')">
            <div class="attribute-icon">
              <i class="bi bi-memory"></i>
            </div>
            <div class="attribute-info">
              <h6 class="attribute-name">RAM</h6>
            
            </div>
            <div class="attribute-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- GPU -->
        <div class="col-md-4">
          <div class="attribute-card" @click="openAttributeModal('gpu')">
            <div class="attribute-icon">
              <i class="bi bi-gpu-card"></i>
            </div>
            <div class="attribute-info">
              <h6 class="attribute-name">GPU</h6>
              
            </div>
            <div class="attribute-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Màu sắc -->
        <div class="col-md-4">
          <div class="attribute-card" @click="openAttributeModal('color')">
            <div class="attribute-icon">
              <i class="bi bi-palette"></i>
            </div>
            <div class="attribute-info">
              <h6 class="attribute-name">Màu sắc</h6>
             
            </div>
            <div class="attribute-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Ổ cứng -->
        <div class="col-md-4">
          <div class="attribute-card" @click="openAttributeModal('storage')">
            <div class="attribute-icon">
              <i class="bi bi-hdd"></i>
            </div>
            <div class="attribute-info">
              <h6 class="attribute-name">Ổ cứng</h6>
              
            </div>
            <div class="attribute-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Loại màn hình -->
        <div class="col-md-4">
          <div class="attribute-card" @click="openAttributeModal('screen-type')">
            <div class="attribute-icon">
              <i class="bi bi-display"></i>
            </div>
            <div class="attribute-info">
              <h6 class="attribute-name">Loại màn hình</h6>
             
            </div>
            <div class="attribute-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Pin -->
        <div class="col-md-4">
          <div class="attribute-card" @click="openAttributeModal('battery')">
            <div class="attribute-icon">
              <i class="bi bi-battery-full"></i>
            </div>
            <div class="attribute-info">
              <h6 class="attribute-name">Pin</h6>
             
            </div>
            <div class="attribute-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['open-attribute-modal'])


const openAttributeModal = (type) => {
  emit('open-attribute-modal', type)
}

const showAddAttributeModal = () => {
  // Show modal to add new attribute category
  console.log('Show add attribute modal')
}
</script>

<style scoped>
.product-attributes-view {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
}

.attribute-categories {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.attribute-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.attribute-card:hover {
  background: #f1f5f9;
  border-color: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
}

.attribute-icon {
  width: 40px;
  height: 40px;
  background: #16a34a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.attribute-info {
  flex: 1;
}

.attribute-name {
  margin: 0;
  font-weight: 600;
  color: #1e293b;
}

.attribute-count {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.attribute-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.attribute-card:hover .attribute-actions {
  opacity: 1;
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
</style>
