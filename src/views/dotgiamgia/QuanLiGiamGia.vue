<template>
  <main class="container">
    <h1>Quản lý Đợt Giảm Giá</h1>

    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="d-flex gap-2">
        <input
          v-model="q"
          class="form-control"
          placeholder="Tìm theo tên..."
          style="max-width: 280px"
        />
      </div>
      <button class="btn btn-success" @click="goToAdd">+ Thêm mới</button>
    </div>

   <table class="table table-bordered table-hover">
  <thead class="table-light">
    <tr>
      <th>#</th>
      <th>Tên Đợt</th>
      <th>Giá trị (VND)</th>
      <th>Mô tả</th>
      <th>Bắt đầu</th>
      <th>Kết thúc</th>
      <th>Trạng thái</th>
      <!-- Đồng bộ width 220px như bên Phiếu Giảm Giá -->
      <th style="width: 220px">Hành động</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(it, idx) in paged" :key="it.id">
      <td>{{ (page - 1) * pageSize + idx + 1 }}</td>
      <td>{{ it.tenKm }}</td>
      <td>{{ it.giaTri }}</td>
      <td>{{ it.moTa }}</td>
      <td>{{ showDate(it.ngayBatDau) }}</td>
      <td>{{ showDate(it.ngayKetThuc) }}</td>
      <td>{{ it.trangThai === 1 ? 'Hoạt động' : 'Ngưng' }}</td>
      <!-- Đồng bộ bố cục nút: d-flex gap-2, cùng kiểu class và thứ tự -->
      <td class="d-flex gap-2">
        <button class="btn btn-info" @click="viewProducts(it.id)">Chi tiết</button>
        <button class="btn btn-warning" @click="edit(it.id)">Sửa</button>
        <button class="btn btn-danger" @click="remove(it.id)">Xóa</button>
      </td>
    </tr>
    <tr v-if="paged.length === 0">
      <td colspan="8" class="text-center text-muted">Không có dữ liệu</td>
    </tr>
  </tbody>
</table>


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
import { getDotGiamGias, deleteDotGiamGia } from '@/service/dotgiamgia/DotGiamGiaService'

// ... (phần script không đổi)
const router = useRouter()
const list = ref([])
const q = ref('')

// --- state phân trang ---
const page = ref(1)
const pageSize = ref(5)

const fetchList = async () => {
  try {
    const res = await getDotGiamGias()
    list.value = res?.data ?? res ?? []
    page.value = 1
  } catch (e) {
    console.error(e)
  }
}

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return list.value
  return list.value.filter(x => (x.tenKm || '').toLowerCase().includes(s))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const prevPage = () => { if (page.value > 1) page.value-- }
const nextPage = () => { if (page.value < totalPages.value) page.value++ }

watch(q, () => { page.value = 1 })

// Điều hướng
const goToAdd = () => router.push('/dot-giam-gia/add')
const edit = (id) => router.push(`/dot-giam-gia/edit/${id}`)
const viewProducts = (id) => router.push(`/chi-tiet-giam-gia/${id}`)
const remove = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa không?')) return
  try {
    await deleteDotGiamGia(id)
    alert('Xóa thành công!')
    await fetchList()
    if (page.value > totalPages.value) page.value = totalPages.value
  } catch (e) {
    console.error(e)
  }
}

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