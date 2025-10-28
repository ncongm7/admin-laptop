<template>
  <main class="container">
    <h2 class="text-center mb-3">{{ title }}</h2>

    <form @submit.prevent="save" class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Tên khuyến mãi *</label>
        <input class="form-control" v-model="form.tenKm" :disabled="isDetail" />
      </div>

      <div class="col-md-6">
        <label class="form-label">Giá trị (VND) *</label>
        <input
          type="number"
          class="form-control"
          v-model.number="form.giaTri"
          :min="0"
          :step="1000"
          :disabled="isDetail"
        />
        <small class="text-muted">{{ vndFormat(+form.giaTri || 0) }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Ngày bắt đầu *</label>
        <input type="datetime-local" class="form-control" v-model="form.ngayBatDau" :disabled="isDetail" />
      </div>

      <div class="col-md-6">
        <label class="form-label">Ngày kết thúc *</label>
        <input type="datetime-local" class="form-control" v-model="form.ngayKetThuc" :disabled="isDetail" />
      </div>

      <div class="col-12">
        <label class="form-label">Mô tả</label>
        <textarea class="form-control" rows="3" v-model="form.moTa" :disabled="isDetail"></textarea>
      </div>

      <div class="col-md-6">
        <label class="form-label">Hoạt động</label>
        <select class="form-select" v-model.number="form.trangThai" :disabled="isDetail">
          <option :value="1">Bật</option>
          <option :value="0">Tắt</option>
        </select>
      </div>

      <div class="col-12 mt-2">
        <button v-if="!isDetail" type="submit" class="btn btn-success me-2">Lưu</button>
        <button type="button" class="btn btn-secondary" @click="back">Quay lại</button>
      </div>
    </form>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDotGiamGiaById, addDotGiamGia, updateDotGiamGia } from '@/service/dotgiamgia/DotGiamGiaService'

const vndFormat = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const route = useRoute()
const router = useRouter()

const mode = ref('add')
const id = route.params.id

const form = ref({
  tenKm: '',
  giaTri: 0,
  moTa: '',
  ngayBatDau: '', // 'yyyy-MM-ddTHH:mm'
  ngayKetThuc: '',
  trangThai: 1   // mặc định Bật
})

/** =======================
 *  Helpers chuyển đổi thời gian
 *  ======================= */

function toInstantISOString(localStr) {
  if (!localStr) return null
  const dtLocal = new Date(localStr)
  return dtLocal.toISOString()
}

function instantToLocalInput(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const pad = (n) => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${y}-${m}-${day}T${hh}:${mm}`
}

onMounted(async () => {
  if (route.path.includes('edit')) mode.value = 'edit'
  else if (route.path.includes('detail')) mode.value = 'detail'

  if (id) {
    const res = await getDotGiamGiaById(id)
    const data = res?.data ?? res ?? {}
    form.value = {
      tenKm: data.tenKm,
      giaTri: data.giaTri,
      moTa: data.moTa,
      ngayBatDau: instantToLocalInput(data.ngayBatDau),
      ngayKetThuc: instantToLocalInput(data.ngayKetThuc),
      trangThai: data.trangThai ?? 1
    }
  }
})

const isDetail = computed(() => mode.value === 'detail')
const title = computed(() => mode.value === 'add'
  ? 'Thêm Đợt Giảm Giá'
  : mode.value === 'edit'
    ? 'Cập Nhật Đợt Giảm Giá'
    : 'Chi Tiết Đợt Giảm Giá')

function normalizedPayload() {
  return {
    ...form.value,
    giaTri: Number(form.value.giaTri),
    ngayBatDau: toInstantISOString(form.value.ngayBatDau),
    ngayKetThuc: toInstantISOString(form.value.ngayKetThuc),
    trangThai: Number(form.value.trangThai ?? 1)
  }
}

function precheck () {
  if (!form.value.tenKm?.trim()) { alert('Thiếu tên khuyến mãi'); return false }
  if (form.value.giaTri == null || +form.value.giaTri < 0) { alert('Giá trị phải >= 0'); return false }
  if (!form.value.ngayBatDau || !form.value.ngayKetThuc) { alert('Thiếu thời gian'); return false }
  return true
}

const save = async () => {
  try {
    if (!precheck()) return
    const payload = normalizedPayload()
    if (mode.value === 'add') {
      await addDotGiamGia(payload)
      alert('Thêm thành công!')
    } else if (mode.value === 'edit') {
      await updateDotGiamGia(payload, id)
      alert('Cập nhật thành công!')
    }
    router.push('/dot-giam-gia')
  } catch (e) {
    console.error(e)
  }
}

const back = () => router.push('/dot-giam-gia')
</script>
