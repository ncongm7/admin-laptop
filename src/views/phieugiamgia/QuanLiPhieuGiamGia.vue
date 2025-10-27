<template>
  <main class="container">
    <h1>Quản lý Phiếu Giảm Giá</h1>

    <!-- Thanh công cụ -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="d-flex gap-2">
        <input v-model="q" class="form-control" placeholder="Tìm theo mã / tên…" style="max-width: 280px" />
        <select v-model="status" class="form-select" style="max-width: 160px">
          <option value="">Tất cả hiệu lực</option>
          <option :value="0">Sắp diễn ra</option>
          <option :value="1">Đang hiệu lực</option>
          <option :value="2">Hết hạn</option>
        </select>
        <select v-model="active" class="form-select" style="max-width: 140px">
          <option value="">Tất cả hoạt động</option>
          <option :value="1">Bật</option>
          <option :value="0">Tắt</option>
        </select>
      </div>
      <button class="btn btn-success" @click="goToAdd">+ Thêm mới</button>
    </div>


    <!-- Bảng danh sách -->
    <table class="table table-bordered table-hover">
      <thead class="table-light">
        <tr>
          <th>#</th>
          <th>Mã</th>
          <th>Tên phiếu</th>
          <th>Hình thức giảm</th>
          <th>Giá trị giảm</th>
          <th>Giảm tối đa</th>
          <th>HĐ tối thiểu</th>
          <th>Số lượng</th>
          <th>Bắt đầu</th>
          <th>Kết thúc</th>
          <th>Hiệu lực</th>
          <th>Hoạt động</th>
          <th style="width: 220px">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <!-- dùng paged để hiển thị theo trang -->
        <tr v-for="(it, idx) in paged" :key="it.id">
          <td>{{ (page - 1) * pageSize + idx + 1 }}</td>
          <td>{{ it.ma }}</td>
          <td>{{ it.tenPhieuGiamGia }}</td>
          <td>{{ showLoai(it.loaiPhieuGiamGia) }}</td>
          <td>{{ showCurrency(it.giaTriGiamGia) }}</td>
          <td>{{ showCurrency(it.soTienGiamToiDa) }}</td>
          <td>{{ showCurrency(it.hoaDonToiThieu) }}</td>
          <td>{{ it.soLuongDung }}</td>
          <td>{{ showDate(it.ngayBatDau) }}</td>
          <td>{{ showDate(it.ngayKetThuc) }}</td>
          <!-- Hiệu lực theo thời gian (FE tính) -->
          <td>
            <span
              v-if="calcTrangThaiTinh(it.ngayBatDau, it.ngayKetThuc, nowMs) === 0"
             >Sắp diễn ra</span>
            <span
              v-else-if="calcTrangThaiTinh(it.ngayBatDau, it.ngayKetThuc, nowMs) === 1"
              >Đang hiệu lực</span>
            <span
              v-else
              >Hết hạn</span>
          </td>

          <!-- Hoạt động (công tắc quản trị: 1=Bật, khác=Tắt) -->
          <td>
            <span v-if="it.trangThai === 1">Bật</span>
            <span v-else >Tắt</span>
          </td>
          <td class="d-flex gap-2">
            <button class="btn btn-info" @click="viewDetail(it.id)">Chi tiết</button>
            <button class="btn btn-warning" @click="edit(it.id)">Sửa</button>
            <button class="btn btn-danger" @click="remove(it.id)">Xóa</button>
          </td>
        </tr>
        <tr v-if="paged.length === 0">
          <td colspan="13" class="text-center text-muted">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>

    <!-- Phân trang đơn giản -->
    <div class="d-flex align-items-center justify-content-between mt-2">
      <div>Tổng: {{ filtered.length }} bản ghi</div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary" :disabled="page <= 1" @click="prevPage">
          « Trang trước
        </button>
        <span>Trang {{ page }} / {{ totalPages || 1 }}</span>
        <button class="btn btn-outline-secondary" :disabled="page >= totalPages" @click="nextPage">
          Trang sau »
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getVouchers, deleteVoucher } from '@/service/phieugiamgia/PhieuGiamGiaService'

// === Hiệu lực theo thời gian (0=Sắp diễn ra, 1=Đang hiệu lực, 2=Hết hạn) ===
const calcTrangThaiTinh = (startIso, endIso, nowMs = Date.now()) => {
  const s = Date.parse(startIso)
  const e = Date.parse(endIso)
  if (isNaN(s) || isNaN(e)) return null
  return nowMs < s ? 0 : nowMs > e ? 2 : 1
}

// Tick nhẹ để UI tự đổi nhãn mỗi 30s (có thể bỏ nếu không cần)
const nowMs = ref(Date.now())
let timerId
let serverOffsetMs = 0 // nếu không dùng giờ server, cứ để 0

const router = useRouter()
const list = ref([])
const q = ref('')

// --- state phân trang ---
const page = ref(1)       // 1-based
const pageSize = ref(5)   // số dòng mỗi trang

// Nạp danh sách
const fetchList = async () => {
  try {
    const res = await getVouchers()
    // Lấy giờ server nếu có
    const serverDateStr = res?.headers?.date || res?.headers?.Date
    if (serverDateStr) {
      const serverNow = new Date(serverDateStr).getTime()
      serverOffsetMs = Date.now() - serverNow
    }
    list.value = res?.data ?? res ?? []
    page.value = 1
  } catch (e) {
    console.error(e)
  }
}

// Lọc realtime ở client
// const filtered = computed(() => {
//   const s = q.value.trim().toLowerCase()
//   if (!s) return list.value
//   return list.value.filter(
//     x =>
//       (x.ma || '').toLowerCase().includes(s) ||
//       (x.tenPhieuGiamGia || '').toLowerCase().includes(s)
//   )
// })
const status = ref('') // '' = tất cả; 0/1/2 = lọc theo trạng thái
const active = ref('') // '' = tất cả; 1 = Bật; 0 = Tắt

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  return list.value.filter(x => {
    // text
    const textOk =
      !s ||
      (x.ma || '').toLowerCase().includes(s) ||
      (x.tenPhieuGiamGia || '').toLowerCase().includes(s)

    // hiệu lực theo thời gian (đã có)
    const stTime = calcTrangThaiTinh(x.ngayBatDau, x.ngayKetThuc, nowMs.value)
    const statusOk = status.value === '' || stTime === Number(status.value)

    // hoạt động theo công tắc quản trị (1=Bật, khác=Tắt)
    const activeOk =
      active.value === '' ||
      (Number(active.value) === 1 ? x.trangThai === 1 : x.trangThai !== 1)

    return textOk && statusOk && activeOk
  })
})
// Tính trang & cắt trang
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

// Chuyển trang
const prevPage = () => { if (page.value > 1) page.value-- }
const nextPage = () => { if (page.value < totalPages.value) page.value++ }

// Khi gõ tìm kiếm -> quay về trang 1
watch([q, status, active], () => { page.value = 1 })

// Điều hướng
const goToAdd = () => router.push('/phieu-giam-gia2/add')
const viewDetail = (id) => router.push(`/phieu-giam-gia2/detail/${id}`)
const edit = (id) => router.push(`/phieu-giam-gia2/edit/${id}`)

// Xóa
const remove = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa không?')) return
  try {
    const resp = await deleteVoucher(id)
    alert(resp?.message || 'Xóa thành công!')
    await fetchList()
    // nếu trang hiện tại > tổng trang mới -> kéo về trang cuối
    if (page.value > totalPages.value) page.value = totalPages.value
  } catch (e) {
    console.error(e)
  }
}

// 

// Helpers hiển thị
const showCurrency = (v) => {
  if (v === null || v === undefined) return ''
  const number = parseFloat(v)
  if (isNaN(number)) return String(v)
  return new Intl.NumberFormat('vi-VN').format(number)
}

const showLoai = (n) => (n === 0 ? '%' : n === 1 ? 'VND' : n)

const showDate = (v) => {
  if (!v) return ''
  const d = new Date(String(v))
  if (isNaN(d)) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function scheduleTick() {
  clearTimeout(timerId)
  const now = Date.now() - serverOffsetMs

  // Tìm mốc start/end gần nhất trong tương lai
  const deltas = []
  for (const x of list.value) {
    const s = Date.parse(x.ngayBatDau)
    const e = Date.parse(x.ngayKetThuc)
    if (!isNaN(s) && s > now) deltas.push(s - now)
    if (!isNaN(e) && e > now) deltas.push(e - now)
  }

  // Fallback 30s nếu không có mốc nào (UI vẫn “đập nhịp”)
  const nextDelta = deltas.length ? Math.min(...deltas) : 30000

  // Đợi đến mốc (đệm 20ms), nhưng không quá 30s
  const wait = Math.max(50, Math.min(nextDelta + 20, 30000))
  timerId = setTimeout(() => {
    nowMs.value = Date.now() - serverOffsetMs
    scheduleTick()
  }, wait)
}

onMounted(async () => {
  await fetchList()
  scheduleTick()
})

onUnmounted(() => {
  clearTimeout(timerId)
})

// Khi danh sách đổi (refetch / xoá / thêm), lên lịch lại
watch(list, () => scheduleTick())
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 16px;
}
</style>
