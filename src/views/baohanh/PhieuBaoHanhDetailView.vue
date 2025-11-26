<template>
  <div class="warranty-detail">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <button class="btn btn-outline-secondary mb-2" @click="goBack">
            <i class="bi bi-arrow-left me-1"></i>Quay lại
          </button>
          <h1 class="page-title mb-1">
            <i class="bi bi-shield-check me-2"></i>
            Chi Tiết Phiếu Bảo Hành
          </h1>
          <p class="text-muted mb-0">
            Mã phiếu:
            <code class="serial-code">{{ detail?.id || 'N/A' }}</code>
          </p>
        </div>
        <span :class="getStatusClass(detail?.trangThai)" class="status-badge-large">
          <i :class="getStatusIcon(detail?.trangThai)" class="me-1"></i>
          {{ showTrangThai(detail?.trangThai) }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-3 text-muted">Đang tải dữ liệu...</p>
    </div>

    <!-- Detail Content -->
    <div v-else-if="detail" class="row g-4">
      <!-- Left Column - Thông tin chính -->
      <div class="col-lg-8">
        <!-- Thông tin khách hàng -->
        <div class="card shadow-sm mb-4 card-plain">
          <div class="card-header card-header-light">
            <h5 class="mb-0"><i class="bi bi-person me-2"></i>Thông tin khách hàng</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="info-item mb-3">
                  <label class="text-muted small">Họ và tên</label>
                  <p class="fw-bold mb-0">{{ detail.hoTenKhachHang || 'N/A' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item mb-3">
                  <label class="text-muted small">Số điện thoại</label>
                  <p class="fw-bold mb-0">
                    <i class="bi bi-telephone me-1"></i>{{ detail.soDienThoai || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thông tin sản phẩm -->
        <div class="card shadow-sm mb-4 card-plain">
          <div class="card-header card-header-light">
            <h5 class="mb-0"><i class="bi bi-laptop me-2"></i>Thông tin sản phẩm</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="info-item mb-3">
                  <label class="text-muted small">Tên sản phẩm</label>
                  <p class="fw-bold mb-0">{{ detail.tenSP || 'N/A' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item mb-3">
                  <label class="text-muted small">Số Serial</label>
                  <p class="fw-bold mb-0">
                    <code class="serial-code">{{ detail.soSerial || 'N/A' }}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thông tin chi tiết -->
        <div class="card shadow-sm mb-4 card-plain">
          <div class="card-header card-header-light">
            <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Thông tin chi tiết</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="info-item mb-3">
                  <label class="text-muted small">Số lần sửa chữa</label>
                  <p class="fw-bold mb-0">
                    {{ detail.soLanSuaChua != null ? detail.soLanSuaChua : 0 }} lần
                  </p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item mb-3">
                  <label class="text-muted small">Tổng chi phí</label>
                  <p class="fw-bold mb-0">{{ showCurrency(detail.chiPhi) }}</p>
                </div>
              </div>
            </div>
            <div class="info-item">
              <label class="text-muted small d-block">Mô tả yêu cầu</label>
              <div class="description-box">
                {{ detail.moTa && detail.moTa.trim() ? detail.moTa : 'Không có mô tả' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Hình ảnh -->
        <div
          v-if="detail.hinhAnh && detail.hinhAnh.length > 0"
          class="card shadow-sm mb-4 card-plain"
        >
          <div class="card-header card-header-light">
            <h5 class="mb-0"><i class="bi bi-images me-2"></i>Hình ảnh minh chứng</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div v-for="(img, idx) in detail.hinhAnh" :key="idx" class="col-md-4 col-sm-6">
                <div class="image-wrapper">
                  <img
                    :src="img"
                    :alt="`Hình ảnh ${idx + 1}`"
                    class="img-thumbnail"
                    @error="handleImageError"
                  />
                  <a :href="img" target="_blank" class="btn btn-sm btn-outline-primary mt-2 w-100">
                    <i class="bi bi-zoom-in me-1"></i>Xem lớn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Thông tin bảo hành & Actions -->
      <div class="col-lg-4">
        <!-- Thông tin bảo hành -->
        <div class="card shadow-sm mb-4 card-plain">
          <div class="card-header card-header-light">
            <h5 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Thông tin bảo hành</h5>
          </div>
          <div class="card-body">
            <div class="info-item mb-3">
              <label class="text-muted small">Ngày bắt đầu</label>
              <p class="fw-bold mb-0">
                <i class="bi bi-calendar-check me-1 text-success"></i
                >{{ showDate(detail.ngayBatDau) }}
              </p>
            </div>
            <div class="info-item mb-3">
              <label class="text-muted small">Ngày kết thúc</label>
              <p class="fw-bold mb-0">
                <i class="bi bi-calendar-x me-1 text-danger"></i>{{ showDate(detail.ngayKetThuc) }}
              </p>
            </div>
            <div class="info-item">
              <label class="text-muted small">Trạng thái hiện tại</label>
              <p class="mb-0">
                <span :class="getStatusClass(detail.trangThai)" class="status-badge">
                  <i :class="getStatusIcon(detail.trangThai)" class="me-1"></i>
                  {{ showTrangThai(detail.trangThai) }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Thay đổi trạng thái -->
        <div class="card shadow-sm card-plain">
          <div class="card-header card-header-light">
            <h5 class="mb-0"><i class="bi bi-gear me-2"></i>Thay đổi trạng thái</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Chọn trạng thái mới:</label>
              <select
                :value="detail.trangThai"
                @change="updateStatus($event.target.value)"
                class="form-select"
                :disabled="updatingStatus || detail.trangThai === 0 || detail.trangThai === 3"
              >
                <option :value="1" :disabled="detail.trangThai !== 1">Chờ xác nhận</option>
                <option :value="2" :disabled="detail.trangThai !== 1">Xác nhận</option>
                <option :value="0" :disabled="detail.trangThai !== 1">Từ chối</option>
                <option :value="3" :disabled="detail.trangThai !== 2">Hoàn thành</option>
              </select>
            </div>

            <div v-if="updatingStatus" class="alert alert-info mb-3">
              <i class="bi bi-arrow-repeat spinning me-1"></i>Đang cập nhật trạng thái...
            </div>

            <div v-else-if="detail.trangThai === 0" class="alert alert-danger mb-3">
              <i class="bi bi-x-circle me-1"></i>Đơn đã bị từ chối, không thể thay đổi
            </div>

            <div v-else-if="detail.trangThai === 3" class="alert alert-success mb-3">
              <i class="bi bi-check-circle me-1"></i>Đơn đã hoàn thành, không thể thay đổi
            </div>

            <div v-else-if="detail.trangThai === 1" class="alert alert-info mb-3">
              <i class="bi bi-info-circle me-1"></i>Có thể xác nhận hoặc từ chối đơn bảo hành
            </div>

            <div v-else-if="detail.trangThai === 2" class="alert alert-warning mb-3">
              <i class="bi bi-hourglass-split me-1"></i>Có thể chuyển sang hoàn thành sau khi sửa
              chữa xong
            </div>

            <button class="btn btn-primary w-100" @click="goBack" :disabled="updatingStatus">
              <i class="bi bi-arrow-left me-1"></i>Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>Không tìm thấy thông tin phiếu bảo hành
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPhieuBaoHanhById, updateTrangThai } from '@/service/baohanh/PhieuBaoHanhService'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()

const detail = ref(null)
const loading = ref(false)
const updatingStatus = ref(false)

// Load chi tiết
const fetchDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await getPhieuBaoHanhById(id)
    detail.value = res
  } catch (e) {
    console.error('Lỗi khi tải chi tiết:', e)
    alert('Không thể tải chi tiết phiếu bảo hành. Vui lòng thử lại.')
  } finally {
    loading.value = false
  }
}

// Cập nhật trạng thái
const updateStatus = async (newStatus) => {
  const statusNum = parseInt(newStatus)
  if (isNaN(statusNum)) {
    alert('Trạng thái không hợp lệ')
    return
  }

  if (detail.value.trangThai === statusNum) {
    return // Không thay đổi
  }

  if (
    !confirm(
      `Bạn có chắc muốn thay đổi trạng thái từ "${showTrangThai(detail.value.trangThai)}" sang "${showTrangThai(statusNum)}"?`,
    )
  ) {
    return
  }

  updatingStatus.value = true
  try {
    await updateTrangThai(detail.value.id, statusNum)
    // Cập nhật lại chi tiết
    await fetchDetail()
    alert('Cập nhật trạng thái thành công!')
  } catch (e) {
    console.error('Lỗi khi cập nhật trạng thái:', e)
    alert(e.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.')
  } finally {
    updatingStatus.value = false
  }
}

// Helpers
const showTrangThai = (n) => {
  if (n === 1) return 'Chờ xác nhận'
  if (n === 2) return 'Xác nhận'
  if (n === 0) return 'Từ chối'
  if (n === 3) return 'Hoàn thành'
  return 'Không xác định'
}

const getStatusClass = (n) => {
  if (n === 1) return 'status-soft status-soft-warning'
  if (n === 2) return 'status-soft status-soft-info'
  if (n === 0) return 'status-soft status-soft-danger'
  if (n === 3) return 'status-soft status-soft-success'
  return 'status-soft status-soft-muted'
}

const getStatusIcon = (n) => {
  if (n === 1) return 'bi bi-clock-history'
  if (n === 2) return 'bi bi-check-circle'
  if (n === 0) return 'bi bi-x-circle'
  if (n === 3) return 'bi bi-check2-all'
  return 'bi bi-question-circle'
}

const showDate = (v) => {
  if (!v) return 'N/A'
  const d = new Date(String(v))
  if (isNaN(d)) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'
}

const showCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return formatCurrency(value)
}

const goBack = () => {
  router.push('/quan-li-bao-hanh')
}

onMounted(fetchDetail)
</script>

<style scoped>
.warranty-detail {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(180deg, #ffffff 0%, #f6f7fb 60%, #f0f2f8 100%);
  border-radius: 24px;
}

.page-header {
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 15px 45px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #212529;
}

.status-badge-large,
.status-badge {
  font-size: 0.85rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.4px;
  border: 1px solid transparent;
}

.status-soft {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
  border-color: transparent;
}

.status-soft-warning {
  background: rgba(251, 191, 36, 0.18);
  color: #92400e;
}

.status-soft-info {
  background: rgba(14, 165, 233, 0.18);
  color: #075985;
}

.status-soft-danger {
  background: rgba(248, 113, 113, 0.18);
  color: #7f1d1d;
}

.status-soft-success {
  background: rgba(52, 211, 153, 0.18);
  color: #065f46;
}

.status-soft-muted {
  background: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.card-plain {
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.card-header-light {
  background-color: transparent;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
  font-weight: 600;
  font-size: 1rem;
  color: #0f172a;
  padding: 1.2rem 1.5rem;
}

.card-plain .card-body {
  padding: 1.5rem;
}

.info-item {
  padding: 0.5rem 0;
}

.serial-code {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #495057;
}

.description-box {
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  white-space: pre-line;
  min-height: 60px;
}

.image-wrapper {
  text-align: center;
}

.image-wrapper img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-wrapper img:hover {
  transform: scale(1.05);
}

.card-header {
  font-weight: 600;
}

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
</style>
