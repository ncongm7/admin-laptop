<template>
  <div class="nhanvien-form-wrapper">
    <div class="header-breadcrumb">
      <h1 class="main-title">Thêm Nhân Viên</h1>
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Trang chủ</router-link> /
        <router-link to="/nhan-vien" class="breadcrumb-link">Nhân viên</router-link> /
        <span>Thêm nhân viên</span>
      </div>
    </div>
    <form class="form-card" @submit.prevent="onSubmit">
      <div class="form-avatar-row">
        <label class="avatar-upload-label">
          <div class="avatar-circle avatar-upload-preview">
            <template v-if="form.avatar">
              <img :src="form.avatar" alt="avatar" class="avatar-img" />
            </template>
            <template v-else>
              <i class="bi bi-camera" style="font-size: 2.5rem; color: #bdbdbd"></i>
            </template>
          </div>
          <input type="file" accept="image/*" class="avatar-upload-input" @change="onAvatarChange" />
          <span class="avatar-upload-text">Chọn ảnh<br /><span style="font-size: 0.95em; color: #bdbdbd">JPG, PNG tối đa
              5MB</span></span>
        </label>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Mã nhân viên</label>
          <input v-model="form.maNhanVien" type="text" class="form-control"
            placeholder="Nhập mã (bỏ trống sẽ tự tạo)" />
        </div>
        <div class="form-group">
          <label>Tên nhân viên</label>
          <input v-model="form.name" type="text" class="form-control" placeholder="Nhập tên nhân viên" required />
        </div>
        <div class="form-group">
          <label>Số điện thoại</label>
          <input v-model="form.phone" type="text" class="form-control" placeholder="Nhập số điện thoại" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" class="form-control" placeholder="Nhập email" required />
        </div>
        <div class="form-group">
          <label>Chức vụ</label>
          <input v-model="form.chucVu" type="text" class="form-control" placeholder="Ví dụ: Nhân viên, Quản trị" />
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
          <input v-model="form.chucVu" type="text" class="form-control" placeholder="Ví dụ: Bán hàng" />
        </div>
        <div class="form-group" style="flex: 2">
          <label>Địa chỉ</label>
          <input v-model="form.diaChi" type="text" class="form-control" placeholder="Nhập địa chỉ" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group" style="flex: 1">
          <label>Đánh giá</label>
          <textarea v-model="form.danhGia" class="form-control" rows="3" placeholder="Ghi chú, đánh giá"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-cancel" @click="onCancel">Hủy</button>
        <button type="submit" class="btn btn-success">Thêm</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { nhanVienApi } from '@/service/ApiNhanVien'
const router = useRouter()
const form = ref({
  maNhanVien: '',
  name: '',
  phone: '',
  email: '',
  gender: 'Nam',
  trangThai: 1,
  chucVu: 'Bán hàng',
  diaChi: '',
  danhGia: '',
  avatar: '',
})
function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.value.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
}
function onCancel() {
  router.push('/nhan-vien')
}
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
    maNhanVien: form.value.maNhanVien || `NV${Date.now().toString().slice(-6)}`,
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
  nhanVienApi
    .add(payload)
    .then(() => router.push('/nhan-vien'))
    .catch((e) => {
      const data = e?.response?.data
      const fallback = 'Thêm nhân viên thất bại.'
      const msg =
        typeof data === 'string' ? data : data?.message || (data ? JSON.stringify(data) : fallback)
      console.error('Add nhân viên lỗi:', e)
      alert(msg)
    })
}
</script>

<style scoped>
.nhanvien-form-wrapper {
  background: #f4f6fb;
  min-height: 100vh;
  padding: 32px 24px 40px 24px;
}

.header-breadcrumb {
  margin-bottom: 18px;
}

.main-title {
  color: #1aaf5d;
  font-size: 2.1rem;
  font-weight: 800;
  margin-bottom: 2px;
}

.breadcrumb {
  font-size: 1.1rem;
  color: #1aaf5d;
  margin-bottom: 12px;
}

.breadcrumb-link {
  color: #1aaf5d;
  text-decoration: underline;
  cursor: pointer;
}

.form-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px #1976d211;
  padding: 40px 32px 32px 32px;
  max-width: 100%;
  width: 100%;
  margin: 0;
}

.form-avatar-row {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.avatar-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.avatar-upload-input {
  display: none;
}

.avatar-upload-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #f4f6fb;
  border: 2.5px dashed #bdbdbd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  overflow: hidden;
  position: relative;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.avatar-upload-text {
  font-size: 1.05em;
  color: #888;
  margin-top: 6px;
  text-align: center;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 4px;
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
}

.form-control::placeholder {
  color: #9ca3af;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
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
}

.gender-group label:hover {
  border-color: #2D7458;
  color: #2D7458;
  background: #f0fdf4;
}

.gender-group input[type="radio"] {
  margin: 0;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #2D7458;
}

.gender-group label:has(input[type="radio"]:checked) {
  border-color: #2D7458;
  color: #2D7458;
  background: linear-gradient(135deg, #f0fdf4 0%, #e7f9ef 100%);
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
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

.btn-success {
  background: linear-gradient(135deg, #2D7458 0%, #396E7C 100%);
  color: #fff;
}

.btn-success:hover {
  background: linear-gradient(135deg, #25634d 0%, #2d5a6b 100%);
}
</style>