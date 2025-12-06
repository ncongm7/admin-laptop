<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEdit ? 'Sửa Quy đổi Điểm' : 'Thêm Quy đổi Điểm' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Tiền tích điểm (VND) <span class="text-danger">*</span></label>
              <input
                v-model.number="formData.tienTichDiem"
                type="number"
                class="form-control"
                step="1000"
                min="1000"
                required
                placeholder="Ví dụ: 100000"
              />
              <small class="form-text text-muted">
                Số tiền cần chi để tích được 1 điểm
              </small>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Tiền tiêu điểm (VND/điểm) <span class="text-danger">*</span></label>
              <input
                v-model.number="formData.tienTieuDiem"
                type="number"
                class="form-control"
                step="100"
                min="100"
                required
                placeholder="Ví dụ: 1000"
              />
              <small class="form-text text-muted">
                Giá trị của 1 điểm khi sử dụng (VND)
              </small>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Trạng thái</label>
              <select v-model.number="formData.trangThai" class="form-select">
                <option :value="1">Đang hoạt động</option>
                <option :value="0">Vô hiệu hóa</option>
              </select>
              <small class="form-text text-muted">
                Lưu ý: Chỉ có thể có 1 quy đổi điểm đang hoạt động tại một thời điểm
              </small>
            </div>
            
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { quyDoiDiemService } from '@/service/diem/quyDoiDiemService'

export default {
  name: 'QuyDoiDiemModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  data() {
    return {
      formData: {
        tienTichDiem: null,
        tienTieuDiem: null,
        trangThai: 1
      },
      loading: false,
      error: null
    }
  },
  computed: {
    isEdit() {
      return !!this.item
    }
  },
  watch: {
    item: {
      immediate: true,
      handler(newItem) {
        if (newItem) {
          this.formData = {
            tienTichDiem: newItem.tienTichDiem,
            tienTieuDiem: newItem.tienTieuDiem,
            trangThai: newItem.trangThai
          }
        } else {
          this.formData = {
            tienTichDiem: null,
            tienTieuDiem: null,
            trangThai: 1
          }
        }
        this.error = null
      }
    }
  },
  methods: {
    async handleSubmit() {
      // Validate
      if (!this.formData.tienTichDiem || this.formData.tienTichDiem <= 0) {
        this.error = 'Tiền tích điểm phải lớn hơn 0'
        return
      }
      if (!this.formData.tienTieuDiem || this.formData.tienTieuDiem <= 0) {
        this.error = 'Tiền tiêu điểm phải lớn hơn 0'
        return
      }
      
      try {
        this.loading = true
        this.error = null
        
        if (this.isEdit) {
          await quyDoiDiemService.updateQuyDoiDiem(this.item.id, this.formData)
        } else {
          await quyDoiDiemService.createQuyDoiDiem(this.formData)
        }
        
        this.$emit('saved')
      } catch (error) {
        console.error('Lỗi khi lưu quy đổi điểm:', error)
        this.error = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.modal.show {
  display: block;
}
</style>

