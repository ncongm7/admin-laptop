<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content" @click.stop>
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title">
            <i class="bi bi-box-seam me-2"></i>
            Tiếp nhận sản phẩm bảo hành
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Upload ảnh tình trạng sản phẩm</label>
              <input type="file" @change="handleFileChange" multiple accept="image/*" class="form-control">
              <small class="text-muted">Có thể chọn nhiều ảnh (tối đa 5 ảnh)</small>
            </div>
            <div v-if="previewImages.length > 0" class="mb-3">
              <div class="d-flex flex-wrap gap-2">
                <div v-for="(img, idx) in previewImages" :key="idx" class="position-relative"
                  style="width: 100px; height: 100px;">
                  <img :src="img.url" class="img-thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0"
                    @click="removeImage(idx)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Ghi chú tiếp nhận</label>
              <textarea v-model="formData.ghiChu" class="form-control" rows="3"
                placeholder="Ghi chú về tình trạng sản phẩm khi tiếp nhận..."></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button type="button" class="btn btn-info" @click="handleSubmit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-circle me-2"></i>
            Xác nhận tiếp nhận
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
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  warranty: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const authStore = useAuthStore()
const loading = ref(false)
const previewImages = ref([])
const selectedFiles = ref([])

const formData = ref({
  ghiChu: ''
})

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  if (files.length + selectedFiles.value.length > 5) {
    alert('Chỉ có thể chọn tối đa 5 ảnh')
    return
  }

  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      selectedFiles.value.push(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImages.value.push({ file, url: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeImage = (index) => {
  previewImages.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

const handleSubmit = async () => {
  // Validate idNhanVienTiepNhan
  if (!authStore.user?.id) {
    alert('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.')
    return
  }

  loading.value = true
  try {
    const requestData = {
      idNhanVienTiepNhan: authStore.user.id, // Đảm bảo không null
      ghiChu: formData.value.ghiChu || null,
      hinhAnhTinhTrang: selectedFiles.value.length > 0 ? selectedFiles.value : null
    }

    console.log('📤 [ReceiveProductModal] Request data:', {
      idBaoHanh: props.warranty.id,
      idNhanVienTiepNhan: requestData.idNhanVienTiepNhan,
      ghiChu: requestData.ghiChu,
      hasImages: requestData.hinhAnhTinhTrang ? requestData.hinhAnhTinhTrang.length : 0
    })

    await baohanhService.tiepNhanSanPham(props.warranty.id, requestData)
    emit('success')
    emit('close')
  } catch (error) {
    console.error('❌ [ReceiveProductModal] Lỗi khi tiếp nhận sản phẩm:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tiếp nhận sản phẩm'
    alert(`Lỗi: ${errorMessage}`)
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
