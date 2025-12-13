<template>
  <main class="container">
    <h2 class="text-center mb-3">{{ title }}</h2>

    <form @submit.prevent="save" class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Mã *</label>
        <input class="form-control" v-model="form.ma" :disabled="isDetail" />
      </div>

      <div class="col-md-8">
        <label class="form-label">Tên phiếu *</label>
        <input class="form-control" v-model="form.tenPhieuGiamGia" :disabled="isDetail" />
      </div>

      <div class="col-md-4">
        <label class="form-label">Hình thức giảm *</label>
        <select
          class="form-select"
          v-model.number="form.loaiPhieuGiamGia"
          :disabled="isDetail"
          @change="onChangeLoai"
        >
          <option :value="0">%</option>
          <option :value="1">VND</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Hoạt động</label>
        <select class="form-select" v-model.number="form.trangThai" :disabled="isDetail">
          <option :value="1">ON</option>
          <option :value="0">OFF</option>
        </select>
      </div>

      <div class="col-md-4">
        <label class="form-label">Loại phiếu *</label>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            id="pggChung"
            :value="false"
            v-model="form.riengTu"
            :disabled="isDetail"
          />
          <label class="form-check-label" for="pggChung">
            Phiếu hóa đơn (dùng chung)
          </label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            id="pggCaNhan"
            :value="true"
            v-model="form.riengTu"
            :disabled="isDetail"
          />
          <label class="form-check-label" for="pggCaNhan">
            Phiếu cá nhân (gán cho khách)
          </label>
        </div>
        <small class="text-muted">
          Phiếu cá nhân chỉ dùng được khi đã gán cho khách ở màn "Khách hàng cá nhân".
        </small>
      </div>

      <div class="col-md-4">
        <label class="form-label">Giá trị giảm *</label>
        <div class="input-group">
          <template v-if="form.loaiPhieuGiamGia === 0">
            <input
              type="number"
              class="form-control"
              v-model.number="form.giaTriGiamGia"
              :min="0"
              :max="100"
              :step="0.01"
              :disabled="isDetail"
            />
            <span class="input-group-text">%</span>
          </template>
          <template v-else>
            <input
              type="text"
              class="form-control"
              :value="showCurrency(form.giaTriGiamGia)"
              @input="onInputMoney($event, 'giaTriGiamGia')"
              :disabled="isDetail"
            />
            <span class="input-group-text">VND</span>
          </template>
        </div>
      </div>

      <div class="col-md-4" v-if="showCap">
        <label class="form-label">Số tiền giảm tối đa</label>
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            :value="showCurrency(form.soTienGiamToiDa)"
            @input="onInputMoney($event, 'soTienGiamToiDa')"
            :disabled="isDetail"
          />
          <span class="input-group-text">VND</span>
        </div>
      </div>

      <div class="col-md-4">
        <label class="form-label">Hóa đơn tối thiểu</label>
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            :value="showCurrency(form.hoaDonToiThieu)"
            @input="onInputMoney($event, 'hoaDonToiThieu')"
            :disabled="isDetail"
          />
          <span class="input-group-text">VND</span>
        </div>
      </div>

      <div class="col-md-4">
        <label class="form-label">Số lượng dùng *</label>
        <input
          type="number"
          min="1"
          class="form-control"
          v-model.number="form.soLuongDung"
          :disabled="isDetail || form.riengTu"
        />
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
        <button
          v-if="mode !== 'add'"
          type="button"
          class="btn btn-outline-primary me-2"
          @click="goToKhachHangCaNhan"
        >
          KH cá nhân
        </button>
        <button type="button" class="btn btn-secondary" @click="back">Quay lại</button>
      </div>
    </form>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getVoucherById,
  addVoucher,
  updateVoucher,
} from '@/service/phieugiamgia/PhieuGiamGiaService'
import { useToast } from '@/composables/common/useToast'

const { success: showSuccess, error: showError, warning: showWarning } = useToast()

// ===== Format tiền/số theo chuẩn Việt Nam =====
const showCurrency = (v) => {
  if (v === null || v === undefined) return ''
  const n = parseFloat(v)
  if (isNaN(n)) return String(v)
  return new Intl.NumberFormat('vi-VN').format(n) // ví dụ: 1234567 -> "1.234.567"
}

const vndFormat = (n) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n)
// ví dụ: vndFormat(1234567) -> "1.234.567 ₫"

const onInputMoney = (event, field) => {
  const val = event.target.value
  // Xóa tất cả ký tự không phải số
  const number = Number(val.replace(/\D/g, ''))
  form.value[field] = number
}

const route = useRoute()
const router = useRouter()

let id = route.params.id
const mode = ref(route.params.id ? 'edit' : 'add')

const form = ref({
  ma: '',
  tenPhieuGiamGia: '',
  loaiPhieuGiamGia: 0, // 0=% 1=VND
  giaTriGiamGia: 0,
  soTienGiamToiDa: 0,
  hoaDonToiThieu: 0,
  soLuongDung: 1,
  ngayBatDau: '', // 'yyyy-MM-ddTHH:mm' (phù hợp input datetime-local)
  ngayKetThuc: '',
  riengTu: false,
  moTa: '',
  trangThai: 1,
})
//ô giá trị giảm
const showCap = ref(form.value.loaiPhieuGiamGia === 0) // 0=%, 1=VND

function onChangeLoai() {
  if (Number(form.value.loaiPhieuGiamGia) === 1) {
    // VND: ẩn ô và set cap = giá trị giảm (BE cũng sẽ set lại)
    showCap.value = false
    form.value.soTienGiamToiDa = form.value.giaTriGiamGia || 0
  } else {
    // %: hiện ô
    showCap.value = true
    form.value.soTienGiamToiDa = 0
  }
}

watch(
  () => form.value.loaiPhieuGiamGia,
  () => onChangeLoai(),
  { immediate: true },
)

watch(
  () => form.value.giaTriGiamGia,
  (v) => {
    if (Number(form.value.loaiPhieuGiamGia) === 1) {
      form.value.soTienGiamToiDa = v || 0
    }
  },
)

watch(
  () => form.value.riengTu,
  (isRiengTu) => {
    if (isRiengTu) {
      form.value.soLuongDung = 1
    }
  },
)

/** "yyyy-MM-ddTHH:mm" (local) -> ISO Instant "yyyy-MM-ddTHH:mm:ss.sssZ" */
function toInstantISOString(localStr) {
  if (!localStr) return null
  const [date, time] = localStr.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  // Tạo Date theo GIỜ CỤC BỘ (user)
  const dtLocal = new Date(y, m - 1, d, hh, mm, 0)
  return dtLocal.toISOString() // -> có Z (UTC)
}

/** ISO Instant (có 'Z') -> "yyyy-MM-ddTHH:mm" (để gán vào input) */
function instantToLocalInput(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr) // parse ISO có Z
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
    const res = await getVoucherById(id)
    const data = res?.data ?? res ?? {}
    form.value = {
      ma: data.ma,
      tenPhieuGiamGia: data.tenPhieuGiamGia,
      loaiPhieuGiamGia: data.loaiPhieuGiamGia,
      giaTriGiamGia: data.giaTriGiamGia,
      soTienGiamToiDa: data.soTienGiamToiDa,
      hoaDonToiThieu: data.hoaDonToiThieu,
      soLuongDung: data.soLuongDung,
      // ✅ BE trả Instant -> đổi về "yyyy-MM-ddTHH:mm" cho input
      ngayBatDau: instantToLocalInput(data.ngayBatDau),
      ngayKetThuc: instantToLocalInput(data.ngayKetThuc),
      riengTu: !!data.riengTu,
      moTa: data.moTa,
      trangThai: data.trangThai,
    }
  }
})

const isDetail = computed(() => mode.value === 'detail')
const title = computed(() =>
  mode.value === 'add'
    ? 'Thêm Phiếu Giảm Giá'
    : mode.value === 'edit'
      ? 'Cập Nhật Phiếu Giảm Giá'
      : 'Chi Tiết Phiếu Giảm Giá',
)

/** Chuẩn hóa payload: ép kiểu & convert datetime đúng định dạng BE (Instant) */
function normalizedPayload() {
  return {
    ...form.value,
    loaiPhieuGiamGia: Number(form.value.loaiPhieuGiamGia),
    giaTriGiamGia: Number(form.value.giaTriGiamGia),
    soTienGiamToiDa: Number(form.value.soTienGiamToiDa || 0),
    hoaDonToiThieu: Number(form.value.hoaDonToiThieu || 0),
    soLuongDung: Number(form.value.soLuongDung || 1),
    trangThai: Number(form.value.trangThai),
    riengTu: !!form.value.riengTu,
    // ✅ gửi lên BE dạng Instant ISO có Z
    ngayBatDau: toInstantISOString(form.value.ngayBatDau),
    ngayKetThuc: toInstantISOString(form.value.ngayKetThuc),
  }
}

function precheck() {
  if (!form.value.ma?.trim()) {
    showWarning('Vui lòng nhập mã phiếu giảm giá')
    return false
  }
  if (!form.value.tenPhieuGiamGia?.trim()) {
    showWarning('Vui lòng nhập tên phiếu giảm giá')
    return false
  }
  if (!form.value.ngayBatDau || !form.value.ngayKetThuc) {
    showWarning('Vui lòng chọn ngày bắt đầu và ngày kết thúc')
    return false
  }
  if (Number(form.value.loaiPhieuGiamGia) === 0) {
    const v = +form.value.giaTriGiamGia || 0
    if (v < 0 || v > 100) {
      showWarning('Giá trị giảm (%) phải trong khoảng 0–100')
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
      resp = await addVoucher(payload)
      const newId = resp?.data?.id
      showSuccess(resp?.message || 'Thêm thành công!')

      // Nếu là phiếu riêng tư, chuyển sang trang edit để gán KH
      if (payload.riengTu && newId) {
        id = newId // Cập nhật id local
        mode.value = 'edit' // Chuyển sang mode edit
        // Thay thế URL, không push vào history
        router.replace({ name: 'EditPhieuGiamGiaV2', params: { id: newId } })
      } else {
        router.push('/phieu-giam-gia2')
      }
    } else if (mode.value === 'edit') {
      resp = await updateVoucher(payload, id)
      showSuccess(resp?.message || 'Cập nhật thành công!')
      // Nếu không phải phiếu riêng tư thì mới chuyển trang
      if (!payload.riengTu) {
        router.push('/phieu-giam-gia2')
      }
    }
  } catch (e) {
    console.error(e)
    const errorMessage =
      e?.response?.data?.message || e?.message || 'Có lỗi xảy ra khi lưu phiếu giảm giá'
    showError(errorMessage)
  }
}

const back = () => router.push('/phieu-giam-gia2')

const goToKhachHangCaNhan = () => {
  if (!id) return
  router.push(`/quan-li-phieu-giam-gia/${id}/khach-hang`)
}
</script>
