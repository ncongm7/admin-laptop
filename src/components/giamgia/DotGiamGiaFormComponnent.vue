<template>
  <main class="container">
    <h2 class="text-center mb-3">{{ title }}</h2>

    <form @submit.prevent="save" class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Tên khuyến mãi *</label>
        <input class="form-control" v-model="form.tenKm" :disabled="isDetail" />
      </div>

      <div class="col-md-3">
        <label class="form-label">Hình thức giảm *</label>
        <select
          class="form-select"
          v-model.number="form.loaiDotGiamGia"
          :disabled="isDetail"
          @change="onChangeLoai"
        >
          <option :value="1">%</option>
          <option :value="2">VND</option>
        </select>
      </div>

      <div class="col-md-3">
        <label class="form-label">Hoạt động</label>
        <select class="form-select" v-model.number="form.trangThai" :disabled="isDetail">
          <option :value="1">Bật</option>
          <option :value="0">Tắt</option>
        </select>
      </div>

      <div class="col-md-4">
        <label class="form-label">Giá trị giảm *</label>
        <input
          type="number"
          class="form-control"
          v-model.number="form.giaTri"
          :min="0"
          :max="form.loaiDotGiamGia === 1 ? 100 : undefined"
          :step="form.loaiDotGiamGia === 1 ? 0.01 : 1"
          :disabled="isDetail"
        />
        <!-- Preview -->
        <small class="text-muted">
          {{
            form.loaiDotGiamGia === 1
              ? `${(+form.giaTri || 0).toLocaleString('vi-VN')}%`
              : vndFormat(+form.giaTri || 0)
          }}
        </small>
      </div>

      <div class="col-md-4" v-if="showCap">
        <label class="form-label">Số tiền giảm tối đa</label>
        <input
          type="number"
          class="form-control"
          v-model.number="form.soTienGiamToiDa"
          :min="0"
          :disabled="isDetail"
        />
        <small class="text-muted">{{ showCurrency(form.soTienGiamToiDa) }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Ngày bắt đầu *</label>
        <input
          type="datetime-local"
          class="form-control"
          v-model="form.ngayBatDau"
          :disabled="isDetail"
        />
      </div>

      <div class="col-md-6">
        <label class="form-label">Ngày kết thúc *</label>
        <input
          type="datetime-local"
          class="form-control"
          v-model="form.ngayKetThuc"
          :disabled="isDetail"
        />
      </div>

      <div class="col-12">
        <label class="form-label">Mô tả</label>
        <textarea class="form-control" rows="3" v-model="form.moTa" :disabled="isDetail"></textarea>
      </div>

      <div class="col-12 mt-2">
        <button v-if="!isDetail" type="submit" class="btn btn-success me-2">Lưu</button>
        <button type="button" class="btn btn-secondary" @click="back">Quay lại</button>
      </div>
    </form>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getDotGiamGiaById,
  addDotGiamGia,
  updateDotGiamGia,
} from '@/service/dotgiamgia/DotGiamGiaService'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()

const { success: showSuccess, error: showError, warning: showWarning } = useToast()

const mode = ref('add')
const id = route.params.id

const form = ref({
  tenKm: '',
  loaiDotGiamGia: 1, // 1: %, 2: VND
  giaTri: 0,
  soTienGiamToiDa: 0,
  moTa: '',
  ngayBatDau: '', // 'yyyy-MM-ddTHH:mm'
  ngayKetThuc: '',
  trangThai: 1    // 1=Bật, 0=Tắt
})

// Hiển thị ô "Số tiền giảm tối đa" chỉ khi loại = 1 (%)
const showCap = computed(() => form.value.loaiDotGiamGia === 1)

function onChangeLoai() {
  if (Number(form.value.loaiDotGiamGia) === 2) {
    // VND: ẩn ô và set cap = giá trị giảm (BE cũng sẽ set lại)
    form.value.soTienGiamToiDa = form.value.giaTri || 0
  } else {
    // %: hiện ô, reset về 0
    form.value.soTienGiamToiDa = 0
  }
}

watch(
  () => form.value.loaiDotGiamGia,
  () => onChangeLoai(),
  { immediate: true },
)

watch(
  () => form.value.giaTri,
  (v) => {
    if (Number(form.value.loaiDotGiamGia) === 2) {
      form.value.soTienGiamToiDa = v || 0
    }
  },
)

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
      loaiDotGiamGia: data.loaiDotGiamGia ?? 2, // Mặc định VND nếu null (dữ liệu cũ)
      giaTri: data.giaTri,
      soTienGiamToiDa: data.soTienGiamToiDa || 0,
      moTa: data.moTa,
      ngayBatDau: instantToLocalInput(data.ngayBatDau),
      ngayKetThuc: instantToLocalInput(data.ngayKetThuc),
      trangThai: data.trangThai || 1
    }
  }
})

const isDetail = computed(() => mode.value === 'detail')
const title = computed(() =>
  mode.value === 'add'
    ? 'Thêm Đợt Giảm Giá'
    : mode.value === 'edit'
      ? 'Cập Nhật Đợt Giảm Giá'
      : 'Chi Tiết Đợt Giảm Giá',
)

function normalizedPayload() {
  return {
    ...form.value,
    loaiDotGiamGia: Number(form.value.loaiDotGiamGia),
    giaTri: Number(form.value.giaTri),
    soTienGiamToiDa: Number(form.value.soTienGiamToiDa || 0),
    trangThai: Number(form.value.trangThai),
    ngayBatDau: toInstantISOString(form.value.ngayBatDau),
    ngayKetThuc: toInstantISOString(form.value.ngayKetThuc),
  }
}

function precheck() {
  if (!form.value.tenKm?.trim()) {
    showWarning('Vui lòng nhập tên khuyến mãi')
    return false
  }
  if (!form.value.ngayBatDau || !form.value.ngayKetThuc) {
    showWarning('Vui lòng chọn ngày bắt đầu và ngày kết thúc')
    return false
  }
  if (Number(form.value.loaiDotGiamGia) === 1) {
    // %: validate 0-100
    const v = +form.value.giaTri || 0
    if (v < 0 || v > 100) {
      showWarning('Giá trị giảm (%) phải trong khoảng 0–100')
      return false
    }
  } else {
    // VND: validate >= 0
    const v = +form.value.giaTri || 0
    if (v < 0) {
      showWarning('Giá trị giảm (VND) phải >= 0')
      return false
    }
  }
  return true
}

const save = async () => {
  try {
    if (!precheck()) return
    const payload = normalizedPayload()
    let resp
    if (mode.value === 'add') {
      resp = await addDotGiamGia(payload)
      showSuccess(resp?.message || 'Thêm thành công!')
    } else if (mode.value === 'edit') {
      resp = await updateDotGiamGia(payload, id)
      showSuccess(resp?.message || 'Cập nhật thành công!')
    }
    router.push('/quan-li-giam-gia')
  } catch (e) {
    console.error(e)
    const errorMessage =
      e?.response?.data?.message || e?.message || 'Có lỗi xảy ra khi lưu đợt giảm giá'
    showError(errorMessage)
  }
}

const back = () => router.push('/quan-li-giam-gia')

const showCurrency = (v) => {
  if (v === null || v === undefined) return ''
  const number = parseFloat(v)
  if (isNaN(number)) return String(v)
  return new Intl.NumberFormat('vi-VN').format(number)
}

const vndFormat = (n) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n)
</script>
