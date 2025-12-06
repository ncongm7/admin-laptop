<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content" @click.stop>
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">
            <i class="bi bi-box-arrow-right me-2"></i>
            Bàn giao sản phẩm
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Upload ảnh sau sửa chữa</label>
              <input type="file" @change="handleFileChange" multiple accept="image/*" class="form-control">
              <small class="text-muted">Có thể chọn nhiều ảnh (tối đa 5 ảnh)</small>
            </div>
            <div v-if="previewImages.length > 0" class="mb-3">
              <div class="d-flex flex-wrap gap-2">
                <div v-for="(img, idx) in previewImages" :key="idx" class="position-relative" style="width: 100px; height: 100px;">
                  <img :src="img.url" class="img-thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" @click="removeImage(idx)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Ghi chú bàn giao</label>
              <textarea v-model="formData.ghiChu" class="form-control" rows="3" placeholder="Ghi chú về quá trình sửa chữa và bàn giao..."></textarea>
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input v-model="formData.xacNhanKhachHang" class="form-check-input" type="checkbox" id="xacNhanKhachHang">
                <label class="form-check-label" for="xacNhanKhachHang">
                  Khách hàng đã xác nhận nhận lại sản phẩm
                </label>
              </div>
            </div>
            <div class="alert alert-success">
              <i class="bi bi-info-circle me-2"></i>
              Email hoàn thành bảo hành sẽ được gửi tự động đến khách hàng sau khi bàn giao.
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button type="button" class="btn btn-success" @click="handleSubmit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-circle me-2"></i>
            Xác nhận bàn giao
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
  ghiChu: '',
  xacNhanKhachHang: false
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
  loading.value = true
  try {
    const requestData = {
      idNhanVienBanGiao: authStore.user?.id,
      ghiChu: formData.value.ghiChu,
      hinhAnhSauSua: selectedFiles.value,
      xacNhanKhachHang: formData.value.xacNhanKhachHang
    }

    await baohanhService.banGiaoSanPham(props.warranty.id, requestData)
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Lỗi khi bàn giao sản phẩm:', error)
    alert('Có lỗi xảy ra khi bàn giao sản phẩm')
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

