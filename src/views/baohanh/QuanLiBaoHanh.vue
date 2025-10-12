<template>
  <main class="container">
    <h1>Quản lý Phiếu Bảo Hành</h1>

    <!-- Thanh công cụ -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="d-flex gap-2">
        <input
          v-model="q"
          class="form-control"
          placeholder="Tìm theo SDT / Serial"
          style="max-width: 280px"
        />
      </div>
    </div>

    <!-- Bảng danh sách -->
    <table class="table table-bordered table-hover">
      <thead class="table-light">
        <tr>
          <th>#</th>
          <th>Khách Hàng</th>
          <th>Sản Phẩm</th>
          <th>Số Serial</th>
          <th>Ngày bắt đầu</th>
          <th>Ngày kết thúc</th>
          <th>Trạng thái</th>
          <th style="width: 220px">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <!-- dùng paged để hiển thị theo trang -->
        <tr v-for="(it, idx) in paged" :key="it.id">
          <td>{{ (page - 1) * pageSize + idx + 1 }}</td>
          <td>{{ it.hoTenKhachHang }} <br> {{ it.sdt }} </td>
          <td>{{ it.tenSP }}</td>
          <td>{{ it.soSerial }}</td>
          <td>{{ showDate(it.ngayBatDau) }}</td>
          <td>{{ showDate(it.ngayKetThuc) }}</td>
          <td>{{ it.trangThai === 1 ? 'Hoạt động' : 'Ngưng' }}</td>
          <td class="d-flex gap-2">
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
import { getPhieuBaoHanh, deletePhieuBaoHanh } from '@/service/baohanh/PhieuBaoHanhService'

const list = ref([])
const q = ref('')

// --- state phân trang ---
const page = ref(1)       // 1-based
const pageSize = ref(5)   // số dòng mỗi trang

// Nạp danh sách
const fetchList = async () => {
  try {
    const res = await getPhieuBaoHanh()
    list.value = res?.data ?? res ?? []
    page.value = 1
  } catch (e) {
    console.error(e)
  }
}

// Lọc realtime ở client
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return list.value
  return list.value.filter(
    x =>
      (x.soDienThoai || '').toLowerCase().includes(s) ||
      (x.soSerial || '').toLowerCase().includes(s)
  )
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

// Xóa
const remove = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa không?')) return
  try {
    const resp = await deletePhieuBaoHanh(id)
    alert(resp?.message || 'Xóa thành công!')
    await fetchList()
    // nếu trang hiện tại > tổng trang mới -> kéo về trang cuối
    if (page.value > totalPages.value) page.value = totalPages.value
  } catch (e) {
    console.error(e)
  }
}

// Helpers hiển thị
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
