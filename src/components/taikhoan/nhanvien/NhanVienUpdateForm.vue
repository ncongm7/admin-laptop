<template>
  <div class="nhanvien-form-wrapper">
    <form class="form-card" @submit.prevent="onSubmit">
      <!-- Avatar Upload Section -->
      <div class="form-avatar-section">
        <label class="section-label">
          <i class="bi bi-person-circle"></i>
          Ảnh đại diện
        </label>
        <div class="avatar-upload-container">
          <ImageUploader v-model="form.avatar" :upload-function="uploadAvatar" placeholder="Chọn ảnh đại diện"
            hint="JPG, PNG tối đa 5MB" aspect-ratio="1/1" @upload-success="handleUploadSuccess"
            @upload-error="handleUploadError" />
        </div>
      </div>

      <!-- Form Fields Section -->
      <div class="form-section">
        <label class="section-label">
          <i class="bi bi-info-circle"></i>
          Thông tin cơ bản
        </label>

        <div class="form-row">
          <div class="form-group">
            <label>Mã nhân viên</label>
            <input v-model="form.maNhanVien" type="text" class="form-control" placeholder="Nhập mã nhân viên" />
          </div>
          <div class="form-group">
            <label>Tên nhân viên <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="form-control" placeholder="Nhập tên nhân viên" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Số điện thoại <span class="required">*</span></label>
            <input v-model="form.phone" type="text" class="form-control" placeholder="Nhập số điện thoại" required />
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input v-model="form.email" type="email" class="form-control" placeholder="Nhập email" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Giới tính</label>
            <div class="gender-group">
              <label><input type="radio" value="Nam" v-model="form.gender" /> Nam</label>
              <label><input type="radio" value="Nữ" v-model="form.gender" /> Nữ</label>
            </div>
          </div>
          <div class="form-group">
            <label>Trạng thái</label>
            <div class="gender-group">
              <label><input type="radio" :value="1" v-model="form.trangThai" /> Đang làm</label>
              <label><input type="radio" :value="0" v-model="form.trangThai" /> Đã nghỉ</label>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Chức vụ</label>
            <select v-model="form.chucVu" class="form-control">
              <option value="">Chọn chức vụ</option>
              <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
              <option value="Quản lý cửa hàng">Quản lý cửa hàng</option>
            </select>
          </div>
          <div class="form-group" style="flex: 2">
            <label>Địa chỉ</label>
            <input v-model="form.diaChi" type="text" class="form-control" placeholder="Nhập địa chỉ" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Đánh giá / Ghi chú</label>
            <textarea v-model="form.danhGia" class="form-control" rows="4"
              placeholder="Ghi chú, đánh giá về nhân viên..."></textarea>
          </div>
        </div>
      </div>

      <!-- Thông tin đăng nhập (chỉ admin) -->
      <div v-if="isAdmin" class="form-section">
        <label class="section-label">
          <i class="bi bi-key"></i>
          Thông tin đăng nhập
        </label>
        <div class="form-row">
          <div class="form-group">
            <label>Tên đăng nhập <span class="required">*</span></label>
            <input v-model="form.tenDangNhap" type="text" class="form-control"
              placeholder="Nhập tên đăng nhập (thường là SĐT)" required />
            <small class="text-muted">Tên đăng nhập để đăng nhập vào hệ thống</small>
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input v-model="form.matKhau" type="password" class="form-control"
              placeholder="Để trống nếu không đổi mật khẩu" />
            <small class="text-muted">Để trống nếu không muốn thay đổi mật khẩu</small>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-cancel" @click="onCancel">
          <i class="bi bi-x-circle"></i>
          Hủy
        </button>
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-check-circle"></i>
          Lưu thay đổi
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { nhanVienApi } from '@/service/ApiNhanVien'
import ImageUploader from '@/components/common/ImageUploader.vue'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/pinastorge'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const authStore = useAuthStore()
const userStore = useUserStore()

const isAdmin = computed(() => authStore.isAdmin)

const form = ref({
  maNhanVien: '',
  name: '',
  phone: '',
  email: '',
  gender: 'Nam',
  trangThai: 1,
  chucVu: '',
  diaChi: '',
  danhGia: '',
  avatar: '',
  tenDangNhap: '',
  matKhau: '',
})

// Upload avatar function for ImageUploader component
const uploadAvatar = async (file) => {
  try {
    const response = await nhanVienApi.uploadAvatar(file)
    return response
  } catch (error) {
    console.error('❌ Upload avatar error:', error)
    throw error
  }
}

const handleUploadSuccess = (imageUrl) => {
  form.value.avatar = imageUrl
  console.log('✅ Upload thành công:', imageUrl)
}

const handleUploadError = (error) => {
  console.error('❌ Upload lỗi:', error)
}

function onCancel() {
  router.push('/nhan-vien')
}

onMounted(async () => {
  try {
    const { data } = await nhanVienApi.getOne(id)
    form.value.maNhanVien = data.maNhanVien || ''
    form.value.name = data.hoTen || ''
    form.value.phone = data.soDienThoai || ''
    form.value.email = data.email || ''
    form.value.gender = data.gioiTinh === 0 ? 'Nữ' : 'Nam'
    form.value.trangThai = typeof data.trangThai === 'number' ? data.trangThai : 1
    form.value.chucVu = data.chucVu || ''
    form.value.diaChi = data.diaChi || ''
    form.value.danhGia = data.danhGia || ''
    form.value.avatar = data.anhNhanVien || ''

    // Load thông tin đăng nhập nếu là admin
    if (isAdmin.value) {
      try {
        const userResponse = await userStore.getUserById(id)
        let userData = null
        if (userResponse?.data?.data) {
          userData = userResponse.data.data
        } else if (userResponse?.data) {
          userData = userResponse.data
        } else if (userResponse) {
          userData = userResponse
        }

        if (userData) {
          form.value.tenDangNhap = userData.tenDangNhap || data.soDienThoai || ''
          // Không load mật khẩu vì bảo mật, để trống để user nhập mới nếu muốn đổi
          form.value.matKhau = ''
        } else {
          form.value.tenDangNhap = data.soDienThoai || ''
        }
      } catch (error) {
        console.error('Lỗi tải thông tin đăng nhập:', error)
        form.value.tenDangNhap = data.soDienThoai || ''
      }
    }
  } catch (error) {
    console.error('Lỗi tải thông tin nhân viên:', error)
    alert('Không thể tải thông tin nhân viên. Vui lòng thử lại.')
  }
})

function onSubmit() {
  // Normalize & validate
  form.value.name = (form.value.name || '').trim()
  form.value.phone = (form.value.phone || '').trim()
  form.value.email = (form.value.email || '').trim().toLowerCase()

  if (!form.value.name || !form.value.phone || !form.value.email) {
    alert('Vui lòng nhập Tên, Số điện thoại và Email')
    return
  }

  const payload = {
    maNhanVien: (form.value.maNhanVien || '').trim(),
    hoTen: form.value.name,
    soDienThoai: form.value.phone,
    email: form.value.email,
    gioiTinh: form.value.gender === 'Nam' ? 1 : 0,
    anhNhanVien: form.value.avatar ? form.value.avatar : null,
    chucVu: form.value.chucVu || '',
    diaChi: form.value.diaChi || '',
    danhGia: form.value.danhGia || '',
    trangThai: Number(form.value.trangThai),
  }

  // Thêm thông tin đăng nhập nếu là admin và có thay đổi
  if (isAdmin.value) {
    if (form.value.tenDangNhap) {
      payload.tenDangNhap = form.value.tenDangNhap.trim()
    }
    // Chỉ gửi mật khẩu nếu có nhập (không gửi nếu để trống)
    if (form.value.matKhau && form.value.matKhau.trim()) {
      payload.matKhau = form.value.matKhau.trim()
    }
  }

  nhanVienApi
    .update(id, payload)
    .then(() => {
      alert('Cập nhật nhân viên thành công!')
      router.push('/nhan-vien')
    })
    .catch((e) => {
      const data = e?.response?.data
      const fallback = 'Cập nhật nhân viên thất bại.'
      const msg =
        typeof data === 'string' ? data : data?.message || (data ? JSON.stringify(data) : fallback)
      console.error('Update nhân viên lỗi:', e)
      alert(msg)
    })
}
</script>

<style scoped>
.nhanvien-form-wrapper {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 24px;
}

.form-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #e9ecef;
}

/* Section Labels */
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2D7458;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.section-label i {
  font-size: 1.3rem;
  color: #396E7C;
}

/* Avatar Section */
.form-avatar-section {
  margin-bottom: 32px;
}

.avatar-upload-container {
  max-width: 200px;
  margin: 0 auto;
}

/* Form Sections */
.form-section {
  margin-bottom: 32px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  flex: 1 1 100%;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #dc2626;
  font-weight: 700;
}

.form-control {
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  font-size: 1rem;
  padding: 12px 16px;
  background: #fff;
  transition: all 0.2s ease;
  color: #111827;
}

.form-control:focus {
  border-color: #2D7458;
  outline: none;
  box-shadow: 0 0 0 3px rgba(45, 116, 88, 0.1);
  background: #fff;
}

.form-control::placeholder {
  color: #9ca3af;
}

.text-muted {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

/* Select dropdown styling */
select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232D7458' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  padding-right: 40px;
  cursor: pointer;
}

select.form-control:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232D7458' d='M6 3L11 8H1z'/%3E%3C/svg%3E");
}

.gender-group {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 4px;
}

.gender-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  padding: 10px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: #fff;
  flex: 1;
  justify-content: center;
  position: relative;
}

.gender-group label:hover {
  border-color: #2D7458;
  color: #2D7458;
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(45, 116, 88, 0.1);
}

.gender-group input[type="radio"] {
  margin: 0;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #2D7458;
}

.gender-group input[type="radio"]:checked+span,
.gender-group label:has(input[type="radio"]:checked) {
  border-color: #2D7458;
  color: #2D7458;
  background: linear-gradient(135deg, #f0fdf4 0%, #e7f9ef 100%);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(45, 116, 88, 0.15);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px solid #e9ecef;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  padding: 12px 24px;
  border: none;
  outline: none;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #2D7458 0%, #396E7C 100%);
  color: #fff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #25634d 0%, #2d5a6b 100%);
}

.btn-primary i {
  font-size: 1.1rem;
}

.btn-cancel {
  background: #fff;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.btn-cancel i {
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .form-card {
    padding: 24px;
  }

  .form-row {
    gap: 16px;
  }

  .avatar-upload-container {
    max-width: 180px;
  }
}

@media (max-width: 768px) {
  .nhanvien-form-wrapper {
    padding: 16px;
  }

  .form-card {
    padding: 20px;
    border-radius: 12px;
  }

  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .form-group.full-width {
    flex: 1 1 100%;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .avatar-upload-container {
    max-width: 160px;
  }

  .section-label {
    font-size: 1rem;
  }
}
</style>
