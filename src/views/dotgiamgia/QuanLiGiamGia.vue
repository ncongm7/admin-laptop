<template>
  <main class="container">
    <h1>Quản lý Đợt Giảm Giá</h1>

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

   <table class="table table-bordered table-hover">
  <thead class="table-light">
    <tr>
      <th>#</th>
      <th>Tên Đợt</th>
      <th>Giá trị (VND)</th>
      <th>Mô tả</th>
      <th>Bắt đầu</th>
      <th>Kết thúc</th>
      <th>Hiệu lực</th>
      <th>Hoạt động</th>
      <!-- Đồng bộ width 220px như bên Phiếu Giảm Giá -->
      <th style="width: 220px">Hành động</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(it, idx) in paged" :key="it.id">
      <td>{{ (page - 1) * pageSize + idx + 1 }}</td>
      <td>{{ it.tenKm }}</td>
      <td>{{ showCurrency(it.giaTri) }}</td>
      <td>{{ it.moTa }}</td>
      <td>{{ showDate(it.ngayBatDau) }}</td>
      <td>{{ showDate(it.ngayKetThuc) }}</td>
      <!-- Hiệu lực theo thời gian (FE tính) -->
      <td>
        <span v-if="calcTrangThaiTinh(it.ngayBatDau, it.ngayKetThuc, nowMs) === 0">Sắp diễn ra</span>
        <span v-else-if="calcTrangThaiTinh(it.ngayBatDau, it.ngayKetThuc, nowMs) === 1">Đang hiệu lực</span>
        <span v-else>Hết hạn</span>
      </td>
      <!-- Hoạt động (công tắc quản trị: 1=Bật, khác=Tắt) -->
      <td>
        <span v-if="it.trangThai === 1">Bật</span>
        <span v-else>Tắt</span>
      </td>
      <!-- Đồng bộ bố cục nút: d-flex gap-2, cùng kiểu class và thứ tự -->
      <td class="d-flex gap-2">
        <button class="btn btn-info" @click="viewProducts(it.id)">Chi tiết</button>
        <button class="btn btn-warning" @click="edit(it.id)">Sửa</button>
        <button class="btn btn-danger" @click="remove(it.id)">Xóa</button>
      </td>
    </tr>
    <tr v-if="paged.length === 0">
      <td colspan="9" class="text-center text-muted">Không có dữ liệu</td>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getDotGiamGias, deleteDotGiamGia } from '@/service/dotgiamgia/DotGiamGiaService'

// Tính hiệu lực theo thời gian: 0=Sắp diễn ra, 1=Đang hiệu lực, 2=Hết hạn
const calcTrangThaiTinh = (startIso, endIso, nowMs = Date.now()) => {
  const s = Date.parse(startIso)
  const e = Date.parse(endIso)
  if (isNaN(s) || isNaN(e)) return null
  return nowMs < s ? 0 : nowMs > e ? 2 : 1
}

// Định dạng số/tiền theo vi-VN
const showCurrency = (v) => {
  if (v === null || v === undefined) return ''
  const n = parseFloat(v)
  if (isNaN(n)) return String(v)
  return new Intl.NumberFormat('vi-VN').format(n)
}

const router = useRouter()
const list = ref([])
const q = ref('')
const nowMs = ref(Date.now())
let timerId
let serverOffsetMs = 0 // nếu không dùng giờ server, để 0

// --- state phân trang ---
const page = ref(1)
const pageSize = ref(5)

const fetchList = async () => {
  try {
    const res = await getDotGiamGias()
    list.value = res?.data ?? res ?? []
  } catch (e) {
    console.error(e)
  }
}

function scheduleTick() {
  clearTimeout(timerId)
  const now = Date.now() - serverOffsetMs

  const deltas = []
  for (const x of list.value) {
    const s = Date.parse(x.ngayBatDau)
    const e = Date.parse(x.ngayKetThuc)
    if (!isNaN(s) && s > now) deltas.push(s - now)
    if (!isNaN(e) && e > now) deltas.push(e - now)
  }

  const nextDelta = deltas.length ? Math.min(...deltas) : 30000
  const wait = Math.max(50, Math.min(nextDelta + 20, 30000))
  timerId = setTimeout(() => {
    nowMs.value = Date.now() - serverOffsetMs
    scheduleTick()
  }, wait)
}

//
const status = ref('') // '' | 0 | 1 | 2 (Hiệu lực)
const active = ref('') // '' | 1 (Bật) | 0 (Tắt)

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  return list.value.filter(x => {
    const textOk = !s || (x.tenKm || '').toLowerCase().includes(s)

    // hiệu lực theo thời gian (FE)
    const stTime = calcTrangThaiTinh(x.ngayBatDau, x.ngayKetThuc, nowMs.value)
    const statusOk = status.value === '' || stTime === Number(status.value)

    // hoạt động theo công tắc quản trị
    const activeOk =
      active.value === '' ||
      (Number(active.value) === 1 ? x.trangThai === 1 : x.trangThai !== 1)

    return textOk && statusOk && activeOk
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const prevPage = () => { if (page.value > 1) page.value-- }
const nextPage = () => { if (page.value < totalPages.value) page.value++ }

watch([q, status, active], () => { page.value = 1 })

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp || 1
})

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
  } catch (e) {
    console.error(e)
  }
}

//Định dạng hiển thị
const showDate = (v) => {
  if (!v) return ''
  const d = new Date(String(v))
  if (isNaN(d)) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(async () => {
  await fetchList()
  scheduleTick()
})

onUnmounted(() => { clearTimeout(timerId) })

watch(list, () => scheduleTick())
</script>

<style scoped>
h1 { text-align: center; margin-bottom: 16px; }
</style>