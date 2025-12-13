<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-pencil-square me-2"></i>
            Thêm/Bớt Điểm Thủ công
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Khách hàng</label>
              <input
                type="text"
                class="form-control"
                :value="khachHang?.tenKhachHang || 'N/A'"
                disabled
              />
            </div>
            
            <div class="mb-3">
              <label class="form-label">Tổng điểm hiện tại</label>
              <input
                type="text"
                class="form-control"
                :value="tichDiem?.tongDiem || 0"
                disabled
              />
            </div>
            
            <div class="mb-3">
              <label class="form-label">
                Số điểm <span class="text-danger">*</span>
                <small class="text-muted">(Dương = thêm, Âm = bớt)</small>
              </label>
              <input
                v-model.number="formData.soDiemCong"
                type="number"
                class="form-control"
                :min="tichDiem?.tongDiem ? -tichDiem.tongDiem : undefined"
                required
                placeholder="Ví dụ: 100 hoặc -50"
              />
              <small class="form-text text-muted">
                <span v-if="formData.soDiemCong > 0" class="text-success">
                  Sẽ thêm {{ formData.soDiemCong }} điểm
                </span>
                <span v-else-if="formData.soDiemCong < 0" class="text-danger">
                  Sẽ trừ {{ Math.abs(formData.soDiemCong) }} điểm
                  <span v-if="tichDiem && tichDiem.tongDiem + formData.soDiemCong < 0" class="d-block text-danger">
                    ⚠️ Cảnh báo: Tổng điểm sẽ âm!
                  </span>
                </span>
              </small>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Lý do <span class="text-danger">*</span></label>
              <input
                v-model="formData.lyDo"
                type="text"
                class="form-control"
                required
                placeholder="Ví dụ: Bù điểm do lỗi hệ thống"
              />
            </div>
            
            <div class="mb-3">
              <label class="form-label">Ghi chú</label>
              <textarea
                v-model="formData.ghiChu"
                class="form-control"
                rows="3"
                placeholder="Ghi chú thêm (nếu có)"
              ></textarea>
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
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tichDiemService } from '@/service/diem/tichDiemService'

export default {
  name: 'ManualPointsModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    khachHang: {
      type: Object,
      default: null
    },
    tichDiem: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  data() {
    return {
      formData: {
        userId: null,
        soDiemCong: null,
        lyDo: '',
        ghiChu: ''
      },
      loading: false,
      error: null
    }
  },
  watch: {
    khachHang: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.formData.userId = newVal.userId
        }
      }
    }
  },
  methods: {
    async handleSubmit() {
      // Validate
      if (!this.formData.soDiemCong || this.formData.soDiemCong === 0) {
        this.error = 'Số điểm không được bằng 0'
        return
      }
      
      if (!this.formData.lyDo || !this.formData.lyDo.trim()) {
        this.error = 'Vui lòng nhập lý do'
        return
      }
      
      // Check if subtracting more than available
      if (this.formData.soDiemCong < 0 && this.tichDiem) {
        const tongDiem = this.tichDiem.tongDiem || 0
        if (Math.abs(this.formData.soDiemCong) > tongDiem) {
          this.error = `Không thể trừ quá ${tongDiem} điểm. Tổng điểm hiện tại: ${tongDiem}`
          return
        }
      }
      
      try {
        this.loading = true
        this.error = null
        
        await tichDiemService.themBotDiemThuCong(this.formData)
        
        alert('Thêm/bớt điểm thành công')
        this.$emit('saved')
      } catch (error) {
        console.error('Lỗi khi thêm/bớt điểm:', error)
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

