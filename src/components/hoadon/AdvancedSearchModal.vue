<template>
  <!-- Backdrop -->
  <div class="modal-backdrop fade show" @click="close"></div>
  
  <!-- Modal -->
  <div class="modal fade show d-block" tabindex="-1" style="z-index: 9999;" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-funnel"></i> Tìm kiếm nâng cao
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSearch">
            <!-- Khoảng giá -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Tổng tiền từ (VNĐ)</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="filters.tongTienTu"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Tổng tiền đến (VNĐ)</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="filters.tongTienDen"
                  placeholder="Không giới hạn"
                  min="0"
                />
              </div>
            </div>

            <!-- Nhân viên -->
            <div class="mb-3">
              <label class="form-label">Nhân viên</label>
              <input
                type="text"
                class="form-control"
                v-model="filters.nhanVien"
                placeholder="Tên hoặc mã nhân viên"
              />
            </div>

            <!-- Phương thức thanh toán -->
            <div class="mb-3">
              <label class="form-label">Phương thức thanh toán</label>
              <select class="form-select" v-model="filters.phuongThucThanhToan">
                <option value="">Tất cả</option>
                <option value="TIEN_MAT">Tiền mặt</option>
                <option value="CHUYEN_KHOAN">Chuyển khoản</option>
                <option value="THE">Thẻ</option>
                <option value="VI_DIEN_TU">Ví điện tử</option>
              </select>
            </div>

            <!-- Voucher đã sử dụng -->
            <div class="mb-3">
              <label class="form-label">
                <input
                  type="checkbox"
                  class="form-check-input me-2"
                  v-model="filters.coVoucher"
                />
                Chỉ hiển thị hóa đơn có sử dụng voucher
              </label>
            </div>

            <!-- Sắp xếp -->
            <div class="mb-3">
              <label class="form-label">Sắp xếp theo</label>
              <select class="form-select" v-model="filters.sortBy">
                <option value="ngayTao_desc">Ngày tạo (Mới nhất)</option>
                <option value="ngayTao_asc">Ngày tạo (Cũ nhất)</option>
                <option value="tongTien_desc">Tổng tiền (Cao → Thấp)</option>
                <option value="tongTien_asc">Tổng tiền (Thấp → Cao)</option>
                <option value="ma_asc">Mã hóa đơn (A → Z)</option>
                <option value="ma_desc">Mã hóa đơn (Z → A)</option>
              </select>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="resetFilters">
            <i class="bi bi-arrow-clockwise"></i> Reset
          </button>
          <button type="button" class="btn btn-secondary" @click="close">
            <i class="bi bi-x-circle"></i> Hủy
          </button>
          <button type="button" class="btn btn-primary" @click="handleSearch">
            <i class="bi bi-search"></i> Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'search', 'update:modelValue'])

const filters = ref({
  tongTienTu: null,
  tongTienDen: null,
  nhanVien: '',
  phuongThucThanhToan: '',
  coVoucher: false,
  sortBy: 'ngayTao_desc'
})

// Sync với props
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    filters.value = { ...filters.value, ...newVal }
  }
}, { immediate: true })

/**
 * Reset filters
 */
const resetFilters = () => {
  filters.value = {
    tongTienTu: null,
    tongTienDen: null,
    nhanVien: '',
    phuongThucThanhToan: '',
    coVoucher: false,
    sortBy: 'ngayTao_desc'
  }
}

/**
 * Handle search
 */
const handleSearch = () => {
  emit('search', { ...filters.value })
  emit('update:modelValue', { ...filters.value })
  close()
}

/**
 * Close modal
 */
const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  z-index: 9998 !important;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  z-index: 9999 !important;
}
</style>

