<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content" @click.stop>
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-calendar-plus me-2"></i>
            Tạo phiếu hẹn bảo hành
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Ngày hẹn <span class="text-danger">*</span></label>
                <input v-model="formData.ngayHen" type="date" class="form-control" required :min="minDate">
              </div>
              <div class="col-md-6">
                <label class="form-label">Giờ hẹn <span class="text-danger">*</span></label>
                <input v-model="formData.gioHen" type="time" class="form-control" required>
              </div>
              <div class="col-md-12">
                <label class="form-label">Địa điểm <span class="text-danger">*</span></label>
                <select v-model="formData.diaDiem" class="form-select" required>
                  <option value="">-- Chọn địa điểm --</option>
                  <option value="Trung tâm bảo hành Hà Nội">Trung tâm bảo hành Hà Nội</option>
                  <option value="Trung tâm bảo hành TP.HCM">Trung tâm bảo hành TP.HCM</option>
                  <option value="Trung tâm bảo hành Đà Nẵng">Trung tâm bảo hành Đà Nẵng</option>
                </select>
              </div>
              <div class="col-md-12">
                <label class="form-label">Ghi chú</label>
                <textarea v-model="formData.ghiChu" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-circle me-2"></i>
            Tạo và gửi email
          </button>
          <button v-if="createdSuccessfully" type="button" class="btn btn-success" @click="$emit('close')">
            <i class="bi bi-check2-circle me-2"></i>
            Đóng và tiếp tục
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed } from 'vue'
import phieuHenBaoHanhService from '@/service/baohanh/phieuHenBaoHanhService'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  warranty: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'success', 'created'])

const authStore = useAuthStore()
const loading = ref(false)
const createdSuccessfully = ref(false)

const formData = ref({
  ngayHen: '',
  gioHen: '09:00',
  diaDiem: '',
  ghiChu: ''
})

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const handleSubmit = async () => {
  if (!formData.value.ngayHen || !formData.value.gioHen || !formData.value.diaDiem) {
    alert('Vui lòng điền đầy đủ thông tin')
    return
  }

  loading.value = true
  try {
    // Combine date and time to create Instant for ngayHen
    // Format: YYYY-MM-DDTHH:mm:ss.SSSZ (ISO 8601)
    const dateTime = new Date(`${formData.value.ngayHen}T${formData.value.gioHen}:00`)
    const requestData = {
      ngayHen: dateTime.toISOString(), // Format: 2024-01-15T09:00:00.000Z
      gioHen: formData.value.gioHen, // Format: HH:mm (e.g., "09:00")
      diaDiem: formData.value.diaDiem || '',
      ghiChu: formData.value.ghiChu || null,
      idNhanVienTiepNhan: authStore.user?.id || null
    }

    console.log('📤 [CreateAppointmentModal] Request data:', JSON.stringify(requestData, null, 2))

    const response = await phieuHenBaoHanhService.taoPhieuHen(props.warranty.id, requestData)

    console.log('✅ [CreateAppointmentModal] Response:', response)

    // Gửi email
    let emailSent = false
    try {
      const phieuHenId = response?.id || response?.data?.id
      if (phieuHenId) {
        await phieuHenBaoHanhService.guiEmailPhieuHen(phieuHenId)
        emailSent = true
      }
    } catch (error) {
      console.error('Lỗi khi gửi email:', error)
      // Không throw error để không ảnh hưởng đến việc tạo phiếu hẹn
    }

    // Hiển thị thông báo thành công
    const successMessage = emailSent
      ? '✅ Đã tạo phiếu hẹn và gửi email thành công! Khách hàng sẽ nhận được thông báo.'
      : '✅ Đã tạo phiếu hẹn thành công! (Lỗi khi gửi email, vui lòng gửi lại sau)'

    alert(successMessage)

    // Đánh dấu đã tạo thành công
    createdSuccessfully.value = true

    // Emit success với phieuHen data để parent component có thể refresh và tiếp tục
    emit('success', {
      phieuHen: response,
      emailSent
    })
    emit('created', response)

    // KHÔNG đóng modal ngay - để admin có thể tiếp tục làm việc
    // Admin có thể đóng bằng nút "Đóng và tiếp tục" hoặc click outside
  } catch (error) {
    console.error('❌ [CreateAppointmentModal] Lỗi khi tạo phiếu hẹn:', error)
    console.error('❌ [CreateAppointmentModal] Error response:', error.response?.data)
    const errorMessage = error.response?.data?.message
      || error.response?.data?.errors
      || error.message
      || 'Có lỗi xảy ra khi tạo phiếu hẹn'
    alert(`Lỗi: ${typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}`)
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
