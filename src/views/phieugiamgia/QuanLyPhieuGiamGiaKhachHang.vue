// FILE: src/views/phieugiamgia/QuanLyPhieuGiamGiaKhachHang.vue
<template>
  <main class="container mt-4">
    <!-- Breadcrumb / Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/quan-li-phieu-giam-gia">Phiếu giảm giá</router-link>
            </li>
            <li class="breadcrumb-item active">Quản lý khách hàng</li>
          </ol>
        </nav>
        <h4 class="mb-0">Quản lý khách hàng của phiếu: <strong>{{ phieuGiamGia?.ma }}</strong> – {{ phieuGiamGia?.tenPhieuGiamGia }}</h4>
      </div>
      <button class="btn btn-outline-secondary" @click="goBack">
        ← Quay lại
      </button>
    </div>

    <!-- Card 1: Thông tin phiếu (readonly) -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Thông tin phiếu giảm giá</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Mã:</label>
            <p class="form-control-plaintext">{{ phieuGiamGia?.ma || '-' }}</p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Tên phiếu:</label>
            <p class="form-control-plaintext">{{ phieuGiamGia?.tenPhieuGiamGia || '-' }}</p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Hình thức giảm:</label>
            <p class="form-control-plaintext">{{ phieuGiamGia?.loaiPhieuGiamGia === 0 ? '%' : 'VND' }}</p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Giá trị:</label>
            <p class="form-control-plaintext">{{ formatCurrency(phieuGiamGia?.giaTriGiamGia) }}</p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Giảm tối đa:</label>
            <p class="form-control-plaintext">{{ formatCurrency(phieuGiamGia?.soTienGiamToiDa) }}</p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Hóa đơn tối thiểu:</label>
            <p class="form-control-plaintext">{{ formatCurrency(phieuGiamGia?.hoaDonToiThieu) }}</p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Bắt đầu:</label>
            <p class="form-control-plaintext">{{ formatDate(phieuGiamGia?.ngayBatDau) }}</p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Kết thúc:</label>
            <p class="form-control-plaintext">{{ formatDate(phieuGiamGia?.ngayKetThuc) }}</p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Trạng thái:</label>
            <p class="form-control-plaintext">
              <span :class="phieuGiamGia?.trangThai === 1 ? 'text-success' : 'text-danger'">
                {{ phieuGiamGia?.trangThai === 1 ? 'Bật' : 'Tắt' }}
              </span>
            </p>
          </div>
          <div class="col-md-3 mb-2">
            <label class="form-label fw-bold">Riêng tư:</label>
            <p class="form-control-plaintext">
              {{ phieuGiamGia?.riengTu ? 'Cá nhân' : 'Công khai' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Gán phiếu cho khách hàng -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Gán phiếu cho khách hàng</h5>
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-8">
            <input
              v-model="searchKhachHang"
              type="text"
              class="form-control"
              placeholder="Tìm khách theo tên, email, số điện thoại…"
              @keyup.enter="timKhachHang"
            />
          </div>
          <div class="col-md-4">
            <button class="btn btn-primary w-100" @click="timKhachHang" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Tìm
            </button>
          </div>
        </div>

        <div v-if="ketQuaTimKiem.length > 0" class="mb-3">
          <table class="table table-sm table-hover">
            <thead class="table-light">
              <tr>
                <th width="50">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>Mã KH</th>
                <th>Tên</th>
                <th>Email</th>
                <th>SĐT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="kh in ketQuaTimKiem" :key="kh.id">
                <td>
                  <input
                    type="checkbox"
                    :value="kh.id"
                    v-model="selectedKhachHangIds"
                  />
                </td>
                <td>{{ kh.maKhachHang }}</td>
                <td>{{ kh.hoTen }}</td>
                <td>{{ kh.email || '-' }}</td>
                <td>{{ kh.soDienThoai || '-' }}</td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex align-items-center justify-content-between">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="sendEmailCheck"
                v-model="sendEmailAfterAssign"
              />
              <label class="form-check-label" for="sendEmailCheck">
                Gửi email ngay sau khi gán
              </label>
            </div>
            <button
              class="btn btn-success"
              @click="ganPhieuChoKhachHang"
              :disabled="selectedKhachHangIds.length === 0 || loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Gán phiếu cho khách đã chọn ({{ selectedKhachHangIds.length }})
            </button>
          </div>
        </div>
        <div v-else-if="hasSearched" class="text-muted text-center py-3">
          Không tìm thấy khách hàng
        </div>
      </div>
    </div>

    <!-- Card 3: Danh sách khách hàng đã được gán phiếu -->
    <div class="card">
      <div class="card-header d-flex align-items-center justify-content-between">
        <h5 class="mb-0">Danh sách khách hàng đã được gán phiếu</h5>
        <input
          v-model="filterKhachHang"
          type="text"
          class="form-control form-control-sm"
          style="max-width: 250px"
          placeholder="Lọc theo email / tên..."
        />
      </div>
      <div class="card-body">
        <table class="table table-striped table-bordered table-sm">
          <thead class="table-light">
            <tr>
              <th width="50">#</th>
              <th>Mã KH</th>
              <th>Tên khách</th>
              <th>Email</th>
              <th>SĐT</th>
              <th width="120">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(kh, idx) in filteredKhachHangDaGan" :key="kh.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ kh.maKhachHang }}</td>
              <td>{{ kh.hoTen }}</td>
              <td>{{ kh.email || '-' }}</td>
              <td>{{ kh.soDienThoai || '-' }}</td>
              <td>
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="sendEmailToKhachHang(kh.id)"
                  :disabled="loadingEmail === kh.id"
                >
                  <span v-if="loadingEmail === kh.id" class="spinner-border spinner-border-sm me-1"></span>
                  Gửi email
                </button>
              </td>
            </tr>
            <tr v-if="filteredKhachHangDaGan.length === 0">
              <td colspan="6" class="text-center text-muted">Chưa có khách hàng nào được gán phiếu</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-2 text-muted">
          Tổng: {{ filteredKhachHangDaGan.length }} khách hàng
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getVoucherById } from '@/service/phieugiamgia/PhieuGiamGiaService'
import * as phieuGiamGiaKhachHangService from '@/service/phieugiamgia/PhieuGiamGiaKhachHangService'
import KhachHangService from '@/service/taikhoan/khachHangService'
import { useToast } from '@/composables/useToast'

const { success: showSuccess, error: showError, warning: showWarning } = useToast()
const route = useRoute()
const router = useRouter()

const phieuGiamGiaId = route.params.id
const phieuGiamGia = ref(null)
const loading = ref(false)
const loadingEmail = ref(null)

const searchKhachHang = ref('')
const ketQuaTimKiem = ref([])
const hasSearched = ref(false)
const selectedKhachHangIds = ref([])
const sendEmailAfterAssign = ref(false)
const filterKhachHang = ref('')
const khachHangDaGan = ref([])

const allSelected = computed(() => {
  return ketQuaTimKiem.value.length > 0 && 
         selectedKhachHangIds.value.length === ketQuaTimKiem.value.length
})

const filteredKhachHangDaGan = computed(() => {
  const filter = filterKhachHang.value.trim().toLowerCase()
  if (!filter) return khachHangDaGan.value
  return khachHangDaGan.value.filter(kh => {
    const email = (kh.email || '').toLowerCase()
    const ten = (kh.hoTen || '').toLowerCase()
    return email.includes(filter) || ten.includes(filter)
  })
})

const fetchPhieuGiamGia = async () => {
  try {
    const res = await getVoucherById(phieuGiamGiaId)
    phieuGiamGia.value = res?.data || res
  } catch (e) {
    console.error(e)
    showError('Không thể tải thông tin phiếu giảm giá')
  }
}

const fetchKhachHangDaGan = async () => {
  try {
    const res = await phieuGiamGiaKhachHangService.getKhachHangCuaPhieuGiamGia(phieuGiamGiaId)
    khachHangDaGan.value = res?.data || []
  } catch (e) {
    console.error(e)
    showError('Không thể tải danh sách khách hàng')
  }
}

const timKhachHang = async () => {
  if (!searchKhachHang.value.trim()) {
    showError('Vui lòng nhập từ khóa tìm kiếm')
    return
  }

  loading.value = true
  hasSearched.value = true
  selectedKhachHangIds.value = []

  try {
    const res = await KhachHangService.search(searchKhachHang.value.trim(), null)
    const data = res?.data?.data || res?.data || []
    
    const khachHangDaGanIds = new Set(khachHangDaGan.value.map(kh => kh.id))
    ketQuaTimKiem.value = data.filter(kh => !khachHangDaGanIds.has(kh.id))
  } catch (e) {
    console.error(e)
    showError('Lỗi khi tìm kiếm khách hàng')
    ketQuaTimKiem.value = []
  } finally {
    loading.value = false
  }
}

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedKhachHangIds.value = ketQuaTimKiem.value.map(kh => kh.id)
  } else {
    selectedKhachHangIds.value = []
  }
}

const ganPhieuChoKhachHang = async () => {
  if (selectedKhachHangIds.value.length === 0) {
    showError('Vui lòng chọn ít nhất một khách hàng')
    return
  }

  loading.value = true
  try {
    await phieuGiamGiaKhachHangService.ganPhieuGiamGiaChoKhachHang(
      phieuGiamGiaId,
      selectedKhachHangIds.value
    )
    
    showSuccess('Gán phiếu giảm giá thành công')
    
    if (sendEmailAfterAssign.value) {
      let successCount = 0
      let failCount = 0
      const errors = []
      
      for (const customerId of selectedKhachHangIds.value) {
        try {
          await phieuGiamGiaKhachHangService.sendEmailPhieuGiamGia(phieuGiamGiaId, customerId)
          successCount++
        } catch (e) {
          failCount++
          const errorMsg = e?.message || e?.data?.message || 'Lỗi không xác định'
          errors.push(errorMsg)
          console.error(`Lỗi gửi email cho khách hàng ${customerId}:`, e)
        }
      }
      
      if (failCount === 0) {
        showSuccess(`Đã gửi email thành công cho ${successCount} khách hàng`)
      } else if (successCount > 0) {
        showWarning(`Đã gửi email cho ${successCount} khách hàng, ${failCount} khách hàng gặp lỗi. ${errors[0]}`)
      } else {
        showError(`Không thể gửi email cho bất kỳ khách hàng nào. ${errors[0] || 'Vui lòng kiểm tra cấu hình email.'}`)
      }
    }
    
    selectedKhachHangIds.value = []
    searchKhachHang.value = ''
    ketQuaTimKiem.value = []
    hasSearched.value = false
    await fetchKhachHangDaGan()
  } catch (e) {
    console.error(e)
    showError(e?.message || 'Lỗi khi gán phiếu giảm giá')
  } finally {
    loading.value = false
  }
}

const sendEmailToKhachHang = async (customerId) => {
  loadingEmail.value = customerId
  try {
    const response = await phieuGiamGiaKhachHangService.sendEmailPhieuGiamGia(phieuGiamGiaId, customerId)
    if (response?.message) {
      showSuccess(response.message)
    } else {
      showSuccess('Đã gửi email thành công')
    }
  } catch (e) {
    console.error('Lỗi khi gửi email:', e)
    // Hiển thị message từ backend nếu có
    const errorMessage = e?.message || e?.data?.message || 'Lỗi khi gửi email. Vui lòng kiểm tra cấu hình email.'
    showError(errorMessage)
  } finally {
    loadingEmail.value = null
  }
}

const goBack = () => {
  router.push('/quan-li-phieu-giam-gia')
}

const formatCurrency = (v) => {
  if (v === null || v === undefined) return '-'
  const number = parseFloat(v)
  if (isNaN(number)) return String(v)
  return new Intl.NumberFormat('vi-VN').format(number) + ' VND'
}

const formatDate = (v) => {
  if (!v) return '-'
  const d = new Date(String(v))
  if (isNaN(d.getTime())) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(async () => {
  await fetchPhieuGiamGia()
  await fetchKhachHangDaGan()
})
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 0.5rem;
}
</style>

