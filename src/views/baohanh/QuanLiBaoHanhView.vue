<template>
  <div class="warranty-management">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h1 class="page-title mb-2">
            <i class="bi bi-shield-check me-2"></i>
            Quản Lý Phiếu Bảo Hành
          </h1>
          <p class="text-muted mb-0">Quản lý và theo dõi các phiếu bảo hành sản phẩm</p>
        </div>
        <div class="stats-summary">
          <div class="stat-item bg-primary text-white">
            <div class="stat-value">{{ filtered.length }}</div>
            <div class="stat-label">Tổng phiếu</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="card filter-card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold">
              <i class="bi bi-search me-1"></i>Tìm kiếm
            </label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="q"
                type="text"
                class="form-control form-control-lg"
                placeholder="Tìm theo số điện thoại hoặc Serial..."
              />
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">
              <i class="bi bi-funnel me-1"></i>Lọc theo trạng thái
            </label>
            <select v-model="status" class="form-select form-select-lg">
              <option value="">Tất cả trạng thái</option>
              <option :value="1">Chờ xác nhận</option>
              <option :value="2">Xác nhận</option>
              <option :value="0">Từ chối</option>
              <option :value="3">Hoàn thành</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button @click="fetchList" class="btn btn-primary btn-lg w-100" :disabled="loading">
              <i class="bi bi-arrow-clockwise me-1" :class="{ spinning: loading }"></i>
              Làm mới
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-3 text-muted">Đang tải dữ liệu...</p>
    </div>

    <!-- Warranty Table -->
    <div v-else-if="paged.length > 0" class="card shadow-sm table-card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-white align-middle mb-0">
            <thead>
              <tr>
                <th class="text-muted">#</th>
                <th>Mã phiếu</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Serial/IMEI</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in paged" :key="it.id">
                <td class="text-muted small">{{ (page - 1) * pageSize + idx + 1 }}</td>
                <td>
                  <div class="fw-semibold text-primary">{{ shortId(it.id) }}</div>
                  <small class="text-muted">{{ it.id }}</small>
                </td>
                <td>
                  <div class="fw-semibold">{{ it.hoTenKhachHang || 'N/A' }}</div>
                  <small class="text-muted">
                    <i class="bi bi-telephone me-1"></i>{{ it.soDienThoai || 'N/A' }}
                  </small>
                </td>
                <td>
                  <div class="fw-semibold">{{ it.tenSP || 'N/A' }}</div>
                </td>
                <td>
                  <code class="serial-code">{{ it.soSerial || 'N/A' }}</code>
                </td>
                <td>{{ showDate(it.ngayBatDau) }}</td>
                <td>{{ showDate(it.ngayKetThuc) }}</td>
                <td>
                  <span :class="getStatusClass(it.trangThai)">
                    <i :class="getStatusIcon(it.trangThai)" class="me-1"></i>
                    {{ showTrangThai(it.trangThai) }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-outline-primary btn-sm" @click="viewDetail(it.id)">
                    <i class="bi bi-eye me-1"></i>Xem
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center py-5">
      <div class="empty-icon mb-3">
        <i class="bi bi-inbox" style="font-size: 4rem; color: #dee2e6"></i>
      </div>
      <h5 class="text-muted mb-2">
        {{
          list.length === 0 ? 'Chưa có dữ liệu phiếu bảo hành' : 'Không tìm thấy kết quả phù hợp'
        }}
      </h5>
      <p class="text-muted">
        {{
          list.length === 0
            ? 'Hãy thêm phiếu bảo hành mới để bắt đầu quản lý'
            : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
        }}
      </p>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && filtered.length > 0" class="pagination-wrapper mt-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="pagination-info">
              <span class="text-muted">
                Hiển thị <strong>{{ (page - 1) * pageSize + 1 }}</strong> -
                <strong>{{ Math.min(page * pageSize, filtered.length) }}</strong>
                trong tổng số <strong>{{ filtered.length }}</strong> phiếu bảo hành
              </span>
            </div>
            <nav aria-label="Phân trang">
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: page <= 1 }">
                  <button class="page-link" @click="prevPage" :disabled="page <= 1">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                <li class="page-item active">
                  <span class="page-link">{{ page }} / {{ totalPages || 1 }}</span>
                </li>
                <li class="page-item" :class="{ disabled: page >= totalPages }">
                  <button class="page-link" @click="nextPage" :disabled="page >= totalPages">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getPhieuBaoHanh } from '@/service/baohanh/PhieuBaoHanhService'
import { useRouter } from 'vue-router'

const router = useRouter()

const list = ref([])
const q = ref('')
const loading = ref(false)

// --- state phân trang ---
const page = ref(1) // 1-based
const pageSize = ref(6) // số dòng mỗi trang (tăng lên 6 cho card layout)

// Nạp danh sách
const fetchList = async () => {
  loading.value = true
  try {
    const res = await getPhieuBaoHanh()
    // Service đã xử lý và trả về array trực tiếp
    const data = Array.isArray(res) ? res : []
    // Sắp xếp: chưa hoàn thành (trangThai !== 3) lên đầu, hoàn thành (trangThai === 3) xuống cuối
    list.value = data.sort((a, b) => {
      // Nếu cả hai đều hoàn thành hoặc chưa hoàn thành, giữ nguyên thứ tự
      const aCompleted = a.trangThai === 3
      const bCompleted = b.trangThai === 3
      if (aCompleted === bCompleted) return 0
      // Chưa hoàn thành lên đầu
      return aCompleted ? 1 : -1
    })
    page.value = 1
    console.log('Danh sách phiếu bảo hành:', list.value)
  } catch (e) {
    console.error('Lỗi khi tải danh sách phiếu bảo hành:', e)
    alert('Không thể tải danh sách phiếu bảo hành. Vui lòng thử lại.')
    list.value = []
  } finally {
    loading.value = false
  }
}

// Lọc realtime ở client
const status = ref('') // '' = tất cả; 0/1/2 = lọc theo trạng thái

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  return list.value.filter((x) => {
    // text
    const textOk =
      !s ||
      (x.soDienThoai || '').toLowerCase().includes(s) ||
      (x.soSerial || '').toLowerCase().includes(s) ||
      (x.hoTenKhachHang || '').toLowerCase().includes(s) ||
      (x.tenSP || '').toLowerCase().includes(s)

    // status
    const cur = Number(x.trangThai)
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
const prevPage = () => {
  if (page.value > 1) page.value--
}
const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}

// Khi gõ tìm kiếm hoặc thay đổi filter -> quay về trang 1
watch([q, status], () => {
  page.value = 1
})

// Xem chi tiết
const viewDetail = (id) => {
  router.push(`/quan-li-bao-hanh/chi-tiet/${id}`)
}

// Helpers hiển thị
const showTrangThai = (n) => {
  if (n === 1) return 'Chờ xác nhận'
  if (n === 2) return 'Xác nhận'
  if (n === 0) return 'Từ chối'
  if (n === 3) return 'Hoàn thành'
  return 'Không xác định'
}

const getStatusClass = (n) => {
  if (n === 1) return 'badge bg-success'
  if (n === 0) return 'badge bg-danger'
  if (n === 2) return 'badge bg-warning text-dark'
  if (n === 3) return 'badge bg-info'
  return 'badge bg-secondary'
}

const getStatusIcon = (n) => {
  if (n === 1) return 'bi bi-shield-check'
  if (n === 0) return 'bi bi-shield-x'
  if (n === 2) return 'bi bi-tools'
  if (n === 3) return 'bi bi-check-circle'
  return 'bi bi-question-circle'
}

const showDate = (v) => {
  if (!v) return 'N/A'
  const d = new Date(String(v))
  if (isNaN(d)) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const shortId = (id) => {
  if (!id) return 'N/A'
  return `${String(id).slice(0, 8)}...${String(id).slice(-4)}`
}

onMounted(fetchList)
</script>

<style scoped>
.warranty-management {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #212529;
}

.stats-summary {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem 1.5rem;
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Filter Card */
.filter-card {
  border: none;
  border-radius: 12px;
  background: white;
}

.filter-card .form-label {
  font-size: 0.875rem;
  color: #495057;
  margin-bottom: 0.5rem;
}

/* Table */
.table-card {
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.table-white {
  background-color: #fff;
}

.table-white thead th {
  background-color: #f8fafc;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.table-white tbody td {
  vertical-align: middle;
  padding: 1rem 1.25rem;
  border-color: #f1f3f5;
}

.table-white tbody tr:hover {
  background-color: #fdfdfd;
}

.serial-code {
  font-size: 0.875rem;
  color: #495057;
}

/* Status Badge */
.status-badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Customer Info */
.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0d6efd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

/* Info Rows */
.info-row {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.serial-code {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #495057;
}

/* Date Items */
.date-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.date-item i {
  font-size: 1.1rem;
}

/* Action Buttons */
.action-buttons .btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-buttons .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
}

.empty-icon {
  opacity: 0.5;
}

/* Pagination */
.pagination-wrapper {
  margin-top: 2rem;
}

.pagination-info {
  font-size: 0.9rem;
}

.pagination .page-link {
  border-radius: 8px;
  margin: 0 0.25rem;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
}

.pagination .page-link:hover:not(.disabled) {
  background-color: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-1px);
}

.pagination .page-item.active .page-link {
  background: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.pagination .page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Spinning Animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .warranty-management {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-summary {
    display: none;
  }

  .filter-card .row {
    flex-direction: column;
  }

  .pagination-wrapper .d-flex {
    flex-direction: column;
    text-align: center;
  }
}

/* Card Body Spacing */
.warranty-card .card-body {
  padding: 1.5rem;
}

/* Smooth Transitions */
* {
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
</style>
