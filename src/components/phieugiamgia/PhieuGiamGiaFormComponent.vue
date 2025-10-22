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
        <select class="form-select" v-model.number="form.loaiPhieuGiamGia" :disabled="isDetail" @change="onChangeLoai">
          <option :value="0">%</option>
          <option :value="1">VND</option>
        </select>
      </div>

      <div class="col-md-4">
        <label class="form-label">Giá trị giảm *</label>
        <input type="number" class="form-control" v-model.number="form.giaTriGiamGia" :disabled="isDetail" />
      </div>

      <div class="col-md-4"  v-if="showCap">
        <label class="form-label">Số tiền giảm tối đa</label>
        <input type="number" class="form-control" v-model.number="form.soTienGiamToiDa" :disabled="isDetail" />
      </div>

      <div class="col-md-4">
        <label class="form-label">Hóa đơn tối thiểu</label>
        <input type="number" class="form-control" v-model.number="form.hoaDonToiThieu" :disabled="isDetail" />
      </div>

      <div class="col-md-4">
        <label class="form-label">Số lượng dùng *</label>
        <input type="number" min="1" class="form-control" v-model.number="form.soLuongDung" :disabled="isDetail" />
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
import { getVoucherById, addVoucher, updateVoucher } from '@/service/phieugiamgia/PhieuGiamGiaService'

const route = useRoute()
const router = useRouter()

const mode = ref('add')
const id = route.params.id

const form = ref({
  ma: '',
  tenPhieuGiamGia: '',
  loaiPhieuGiamGia: 0,        // 0=% 1=VND
  giaTriGiamGia: 0,
  soTienGiamToiDa: 0,
  hoaDonToiThieu: 0,
  soLuongDung: 1,
  ngayBatDau: '',              // 'yyyy-MM-ddTHH:mm' (phù hợp input datetime-local)
  ngayKetThuc: '',
  riengTu: false,
  moTa: ''
})
//ô giá trị giảm
const showCap = ref(form.value.loaiPhieuGiamGia === 0) // 0=%, 1=VND

function onChangeLoai () {
   if (Number(form.value.loaiPhieuGiamGia) === 1) {
    // VND: ẩn ô và set cap = giá trị giảm (BE cũng sẽ set lại)
     showCap.value = false
     form.value.soTienGiamToiDa = form.value.giaTriGiamGia || 0
   } else {
     // %: hiện ô
     showCap.value = true
     form.value.soTienGiamToiDa = 0}
}

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
      trangThai: data.trangThai
    }
  }
})

const isDetail = computed(() => mode.value === 'detail')
const title = computed(() => mode.value === 'add'
  ? 'Thêm Phiếu Giảm Giá'
  : mode.value === 'edit'
    ? 'Cập Nhật Phiếu Giảm Giá'
    : 'Chi Tiết Phiếu Giảm Giá')

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

const save = async () => {
  try {
    const payload = normalizedPayload()
    let resp
    if (mode.value === 'add') {
      resp = await addVoucher(payload) // lỗi đã alert ở service
      alert(resp?.message || 'Thêm thành công!')
    } else if (mode.value === 'edit') {
      resp = await updateVoucher(payload, id)
      alert(resp?.message || 'Cập nhật thành công!')
    }
    router.push('/phieu-giam-gia2')
  } catch (e) {
    console.error(e) // service đã alert lỗi rồi
  }
}

const back = () => router.push('/phieu-giam-gia2')
</script>
