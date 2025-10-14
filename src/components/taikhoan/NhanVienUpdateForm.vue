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
          <input v-model="form.chucVu" type="text" class="form-control" />
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
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.value.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
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
  padding: 32