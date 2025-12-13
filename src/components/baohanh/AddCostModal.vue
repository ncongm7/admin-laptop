<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content" @click.stop>
        <div class="modal-header bg-warning text-dark">
          <h5 class="modal-title">
            <i class="bi bi-cash-coin me-2"></i>
            Thêm chi phí phát sinh
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Chi phí phát sinh (VND) <span class="text-danger">*</span></label>
              <input v-model.number="formData.chiPhiPhatSinh" type="number" class="form-control" required min="0" step="1000">
            </div>
            <div class="mb-3">
              <label class="form-label">Lý do chi phí <span class="text-danger">*</span></label>
              <textarea v-model="formData.lyDo" class="form-control" rows="3" required placeholder="Mô tả lý do phát sinh chi phí..."></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Đã thanh toán</label>
              <div class="form-check">
                <input v-model="formData.daThanhToan" class="form-check-input" type="checkbox" id="daThanhToan">
                <label class="form-check-label" for="daThanhToan">
                  Khách hàng đã thanh toán chi phí này
                </label>
              </div>
            </div>
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Email thông báo chi phí sẽ được gửi tự động đến khách hàng sau khi lưu.
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button type="button" class="btn btn-warning" @click="handleSubmit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-circle me-2"></i>
            Thêm và gửi email
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref } from 'vue'
import baohanhService from '@/service/baohanh/baohanhService'

const props = defineProps({
  warranty: {
    type: Object,
    required: true
  },
  lichSuBaoHanh: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)

const formData = ref({
  chiPhiPhatSinh: 0,
  lyDo: '',
  daThanhToan: false
})

const handleSubmit = async () => {
  if (!formData.value.chiPhiPhatSinh || formData.value.chiPhiPhatSinh <= 0) {
    alert('Vui lòng nhập chi phí hợp lệ')
    return
  }

  if (!formData.value.lyDo || formData.value.lyDo.trim() === '') {
    alert('Vui lòng nhập lý do chi phí')
    return
  }

  loading.value = true
  try {
    // Tìm lịch sử bảo hành gần nhất
    const latestLichSu = props.lichSuBaoHanh.length > 0 ? props.lichSuBaoHanh[0] : null
    if (!latestLichSu) {
      alert('Không tìm thấy lịch sử bảo hành')
      return
    }

    const requestData = {
      chiPhiPhatSinh: formData.value.chiPhiPhatSinh,
      lyDo: formData.value.lyDo,
      daThanhToan: formData.value.daThanhToan
    }

    await baohanhService.themChiPhiPhatSinh(latestLichSu.id, requestData)
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Lỗi khi thêm chi phí:', error)
    alert('Có lỗi xảy ra khi thêm chi phí')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
}
</style>

