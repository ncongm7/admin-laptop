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
          <label>Tên nhân viên</label>
          <input
            v-model="form.name"
            type="text"
            class="form-control"
            placeholder="Nhập tên nhân viên"
            required
          />
        </div>
        <div class="form-group">
          <label>Số điện thoại</label>
          <input
            v-model="form.phone"
            type="text"
            class="form-control"
            placeholder="Nhập số điện thoại"
            required
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>CCCD</label>
          <input
            v-model="form.cccd"
            type="text"
            class="form-control"
            placeholder="Nhập CCCD"
            required
          />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control"
            placeholder="Nhập email"
            required
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tỉnh/Thành phố</label>
          <input
            v-model="form.tinh"
            type="text"
            class="form-control"
            placeholder="Chọn tỉnh/thành phố"
          />
        </div>
        <div class="form-group">
          <label>Quận/Huyện</label>
          <input
            v-model="form.huyen"
            type="text"
            class="form-control"
            placeholder="Chọn quận/huyện"
          />
        </div>
        <div class="form-group">
          <label>Xã/Phường</label>
          <input v-model="form.xa" type="text" class="form-control" placeholder="Chọn xã/phường" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" style="flex: 2">
          <label>Địa chỉ cụ thể</label>
          <input
            v-model="form.diachi"
            type="text"
            class="form-control"
            placeholder="Nhập địa chỉ cụ thể"
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ngày sinh</label>
          <input
            v-model="form.birthday"
            type="date"
            class="form-control"
            placeholder="nn/mm/yyyy"
          />
        </div>
        <div class="form-group">
          <label>Giới tính</label>
          <div class="gender-group">
            <label><input type="radio" value="Nam" v-model="form.gender" /> Nam</label>
            <label><input type="radio" value="Nữ" v-model="form.gender" /> Nữ</label>
          </div>
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
const router = useRouter()
const form = ref({
  name: '',
  phone: '',
  cccd: '',
  email: '',
  tinh: '',
  huyen: '',
  xa: '',
  diachi: '',
  birthday: '',
  gender: '',
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
  // emit hoặc lưu vào store, ở đây emit cho parent
  // bạn có thể thay bằng store tuỳ ý
  // emit('add', { ...form.value })
  // demo: lưu vào localStorage
  let list = JSON.parse(localStorage.getItem('nhanvien_list') || '[]')
  list.push({ ...form.value, id: Date.now() })
  localStorage.setItem('nhanvien_list', JSON.stringify(list))
  router.push('/nhan-vien')
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
