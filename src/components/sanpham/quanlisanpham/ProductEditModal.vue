<template>
  <teleport to="body">
    <!-- Modal backdrop -->
    <div class="modal-backdrop fade show" @click="close"></div>
    
    <!-- Modal dialog -->
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Chỉnh sửa sản phẩm: {{ product?.maSanPham || 'N/A' }}
            </h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="save">
              <div class="row g-3">
                <!-- Mã sản phẩm (readonly) -->
                <div class="col-md-12">
                  <label class="form-label">Mã sản phẩm</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.maSanPham"
                    readonly
                    style="background-color: #f8f9fa;"
                  />
                </div>

                <!-- Tên sản phẩm -->
                <div class="col-md-12">
                  <label class="form-label">
                    Tên sản phẩm <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.tenSanPham"
                    required
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <!-- Mô tả -->
                <div class="col-md-12">
                  <label class="form-label">Mô tả</label>
                  <textarea
                    class="form-control"
                    v-model="form.moTa"
                    rows="3"
                    placeholder="Nhập mô tả sản phẩm"
                  ></textarea>
                </div>

                <!-- Trạng thái -->
                <div class="col-md-12">
                  <label class="form-label">Trạng thái</label>
                  <select class="form-select" v-model="form.trangThai">
                    <option :value="1">Hoạt động</option>
                    <option :value="0">Ẩn</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close">
              <i class="bi bi-x-circle"></i> Hủy
            </button>
            <button type="button" class="btn btn-primary" @click="save">
              <i class="bi bi-check-circle"></i> Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

// Form data - including description field
const form = ref({
  id: null,
  maSanPham: '',
  tenSanPham: '',
  moTa: '',
  trangThai: 1
})

// Initialize form with product data
const initializeForm = () => {
  if (props.product) {
    form.value = {
      id: props.product.id,
      maSanPham: props.product.maSanPham || '',
      tenSanPham: props.product.tenSanPham || '',
      moTa: props.product.moTa || '',
      trangThai: props.product.trangThai !== undefined ? props.product.trangThai : 1
    }
  }
}

// Initialize form when component is created
onMounted(() => {
  initializeForm()
})

// Watch for product prop changes to reinitialize form
watch(() => props.product, () => {
  initializeForm()
}, { deep: true })

const close = () => {
  emit('close')
}

const save = () => {
  // Validate required fields
  if (!form.value.tenSanPham?.trim()) {
    alert('Vui lòng nhập tên sản phẩm')
    return
  }

  emit('save', { ...form.value })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1050;
  width: auto;
  height: auto;
}

.modal-dialog {
  max-width: 500px;
  width: 90vw;
  margin: 0;
  position: relative;
}

.modal-content {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #dee2e6;
  background: white;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
  background: white;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control,
.form-select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 14px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  width: 100%;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  outline: 0;
}

.form-control[readonly] {
  background-color: #f8f9fa;
  opacity: 1;
  color: #6c757d;
}

.text-danger {
  color: #dc3545 !important;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-radius: 0 0 8px 8px;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1.25rem;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5c636a;
  border-color: #565e64;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.5;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  opacity: 1;
}

.btn-close::before {
  content: "×";
  font-size: 1.5rem;
  line-height: 1;
}
</style>
