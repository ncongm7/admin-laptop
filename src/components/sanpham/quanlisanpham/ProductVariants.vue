<template>
  <div class="product-variants">
    <div class="variants-header">
      <div class="action-buttons">
        <button class="btn btn-sm btn-success" @click="addVariant">
          <i class="bi bi-plus-lg"></i> Thêm biến thể
        </button>
        <button class="btn btn-sm btn-outline-success" @click="refreshVariants">
          <i class="bi bi-arrow-clockwise"></i> Làm mới
        </button>
      </div>
    </div>

    <div class="variants-list">
      <div v-for="(variant, index) in variants" :key="variant.id || index" class="variant-card">
        <div class="variant-header">
          <span class="variant-number">Biến thể #{{ index + 1 }}</span>
          <button class="btn btn-sm btn-link text-danger" @click="removeVariant(index)" v-if="variants.length > 1">
            <i class="bi bi-trash"></i>
          </button>
        </div>

        <div class="variant-content">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">RAM</label>
              <select class="form-select" v-model="variant.ram_id">
                <option value="">Chọn RAM</option>
                <option v-for="ram in rams" :value="ram.id">{{ ram.dungLuong }}</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label">Ổ cứng</label>
              <select class="form-select" v-model="variant.o_cung_id">
                <option value="">Chọn ổ cứng</option>
                <option v-for="storage in storages" :value="storage.id">
                  {{ storage.tenOCung }}
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label">Màu sắc</label>
              <select class="form-select" v-model="variant.mau_sac_id">
                <option value="">Chọn màu</option>
                <option v-for="color in colors" :value="color.id">{{ color.tenMau }}</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Giá bán (VND)</label>
              <input type="number" class="form-control" v-model.number="variant.giaBan" min="0" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Số lượng</label>
              <input type="number" class="form-control" v-model.number="variant.soLuong" min="0" />
            </div>

            <div class="col-md-12" v-if="variant.id">
              <label class="form-label">IMEI ({{ variant.imeis.length }})</label>
              <div class="imei-badges">
                <span v-for="imei in variant.imeis.slice(0, 3)" :key="imei.id"
                  class="badge bg-light text-dark me-2 mb-2">
                  {{ imei.soImei }}
                </span>
                <span v-if="variant.imeis.length > 3" class="badge bg-secondary me-2 mb-2">
                  +{{ variant.imeis.length - 3 }} more
                </span>
                <button class="btn btn-sm btn-outline-success mb-2">
                  <i class="bi bi-upc-scan"></i> Quản lý
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  variants: {
    type: Array,
    default: () => [],
  },
  rams: {
    type: Array,
    default: () => [],
  },
  storages: {
    type: Array,
    default: () => [],
  },
  colors: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:variants', 'refresh'])

const variants = ref([...props.variants])

const addVariant = () => {
  variants.value.push({
    ram_id: null,
    o_cung_id: null,
    mau_sac_id: null,
    giaBan: 0,
    soLuong: 0,
    imeis: [],
  })
  emitUpdate()
}

const removeVariant = (index) => {
  if (variants.value.length > 1) {
    variants.value.splice(index, 1)
    emitUpdate()
  }
}

const refreshVariants = () => {
  emit('refresh')
}

const emitUpdate = () => {
  emit('update:variants', variants.value)
}

// Watch for changes in variants and emit update
watch(
  variants,
  () => {
    emitUpdate()
  },
  { deep: true },
)
</script>

<style scoped>
.product-variants {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.variants-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-buttons .btn {
  opacity: 1 !important;
  cursor: pointer;
  position: relative;
  z-index: 10;
}

.action-buttons .btn-success {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
  font-weight: 600;
  padding: 6px 16px;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
  transition: all 0.2s ease;
}

.action-buttons .btn-success:hover {
  background: #15803d;
  border-color: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.4);
}

.action-buttons .btn-outline-success {
  background: #fff;
  border: 2px solid #16a34a;
  color: #16a34a;
  font-weight: 600;
  padding: 5px 14px;
  transition: all 0.2s ease;
}

.action-buttons .btn-outline-success:hover {
  background: #16a34a;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3);
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.variant-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.variant-card:hover {
  border-color: #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
}

.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #22c55e;
}

.variant-number {
  font-weight: 600;
  color: #22c55e;
  font-size: 14px;
}

.imei-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
</style>
