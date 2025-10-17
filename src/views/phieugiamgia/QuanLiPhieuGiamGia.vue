<template>
  <main class="container">
    <h1>Quản lý Phiếu Giảm Giá</h1>

    <!-- Thanh công cụ -->
    <div class="d-flex align-items-center justify-content-between mb-3">
  <div class="d-flex gap-2">
    <input v-model="q" class="form-control" placeholder="Tìm theo mã / tên…" style="max-width: 280px" />
    <select v-model="status" class="form-select" style="max-width: 160px">
      <option value="">Tất cả trạng thái</option>
      <option :value="0">0 - Sắp diễn ra</option>
      <option :value="1">1 - Đang hiệu lực</option>
      <option :value="2">2 - Hết hạn</option>
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
          <th>Trạng thái</th>
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
          <td>{{ it.giaTriGiamGia }}</td>
          <td>{{ it.soTienGiamToiDa }}</td>
          <td>{{ it.hoaDonToiThieu }}</td>
          <td>{{ it.soLuongDung }}</td>
          <td>{{ showDate(it.ngayBatDau) }}</td>
          <td>{{ showDate(it.ngayKetThuc) }}</td>
           <td>{{ showTrangThai(it.trangThai) }}</td>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getVouchers, deleteVoucher } from '@/service/phieugiamgia/PhieuGiamGiaService'

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

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  return list.value.filter(x => {
    // text
    const textOk =
      !s ||
      (x.ma || '').toLowerCase().includes(s) ||
      (x.tenPhieuGiamGia || '').toLowerCase().includes(s)

    // status (đổi x.trangThaiTinh -> nếu BE trả trường ấy; còn không thì x.trangThai)
    const cur = Number(x.trangThai ?? x.trangThaiTinh)
    const statusOk = status.value === '' || cur === Number(status.value)

    return textOk && statusOk
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
watch(q, () => { page.value = 1 })

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
const showLoai = (n) => (n === 0 ? '%' : n === 1 ? 'VND' : n)
const showTrangThai=(n)=> (n===0?'Chưa diễn ra':n===1?'Đang diễn ra':n===2?'Đã kết thúc':n)  
const showDate = (v) => {
  if (!v) return ''
  const d = new Date(String(v))
  if (isNaN(d)) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(fetchList)
</script>

<style scoped>
h1 { text-align: center; margin-bottom: 16px; }
</style>
