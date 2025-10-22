<template>
  <div class="nhanvien-form-wrapper">
    <div class="header-breadcrumb">
      <h1 class="main-title">Sửa Nhân Viên</h1>
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Trang chủ</router-link> /
        <router-link to="/nhan-vien" class="breadcrumb-link">Nhân viên</router-link> /
        <span>Sửa nhân viên</span>
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
          <input
            type="file"
            accept="image/*"
            class="avatar-upload-input"
            @change="onAvatarChange"
          />
          <span class="avatar-upload-text"
            >Chọn ảnh<br /><span style="font-size: 0.95em; color: #bdbdbd"
              >JPG, PNG tối đa 5MB</span
            ></span
          >
        </label>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Mã nhân viên</label>
          <input v-model="form.maNhanVien" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label>Tên nhân viên</label>
          <input v-model="form.name" type="text" class="form-control" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Số điện thoại</label>
          <input v-model="form.phone" type="text" class="form-control" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" class="form-control" required />
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
          <input v-model="form.diaChi" type="text" class="form-control" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group" style="flex: 1">
          <label>Đánh giá</label>
          <textarea v-model="form.danhGia" class="form-control" rows="3"></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-cancel" @click="onCancel">Hủy</button>
        <button type="submit" class="btn btn-success">Lưu</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { nhanVienApi } from '@/service/ApiNhanVien'

const route = useRoute()
const router = useRouter()
const id = route.params.id

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
})

function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.')
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn file ảnh.')
    return
  }

  // Upload to server
  nhanVienApi
    .uploadAvatar(file)
    .then((response) => {
      form.value.avatar = response.data
      console.log('Upload thành công:', response.data)
    })
    .catch((error) => {
      console.error('Upload lỗi:', error)
      alert('Upload ảnh thất bại. Vui lòng thử lại.')
    })
}

function onCancel() {
  router.push('/nhan-vien')
}

onMounted(async () => {
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
})

function onSubmit() {
  // normalize
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

  nhanVienApi
    .update(id, payload)
    .then(() => router.push('/nhan-vien'))
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
  gap: 6px;
}
.form-group label {
  font-weight: 600;
  color: #222;
  margin-bottom: 2px;
}
.form-control {
  border-radius: 10px;
  border: 1.5px solid #e3eafc;
  font-size: 1em;
  padding: 10px 14px;
  background: #f8fafc;
  transition: border 0.2s;
}
.form-control:focus {
  border-color: #1aaf5d;
  outline: none;
}
.gender-group {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-top: 6px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 18px;
  margin-top: 32px;
}
.btn {
  border-radius: 8px;
  font-weight: 600;
  font-size: 1em;
  padding: 8px 28px;
  border: none;
  outline: none;
  transition: all 0.18s;
  cursor: pointer;
}
.btn-success {
  background: #1aaf5d;
  color: #fff;
}
.btn-success:hover {
  background: #178f4a;
}
.btn-cancel {
  background: #616161;
  color: #fff;
}
.btn-cancel:hover {
  background: #333;
}

@media (max-width: 1024px) {
  .form-card {
    padding: 18px 4px 12px 4px;
  }
  .form-row {
    gap: 10px;
  }
}
@media (max-width: 768px) {
  .form-card {
    padding: 8px 2px 8px 2px;
  }
  .form-row {
    flex-direction: column;
    gap: 8px;
  }
  .form-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
