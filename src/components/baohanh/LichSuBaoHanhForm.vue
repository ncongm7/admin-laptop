<template>
  <div class="warranty-management">
    <!-- Statistics Dashboard -->

    <div class="card mb-3">
      <div class="card-body d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div>
          <h5 class="mb-1">Quản lý bảo hành</h5>
          <p class="text-muted mb-0">Danh sách phiếu bảo hành và trạng thái xử lý</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" :disabled="loading" @click="fetchData">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" />
            Làm mới
          </button>
          <button class="btn btn-primary" @click="showOfflineModal = true">
            Tạo phiếu bảo hành
          </button>
        </div>
      </div>
    </div>

    <OfflineWarrantyModal
      :visible="showOfflineModal"
      @close="showOfflineModal = false"
      @created="handleOfflineCreated"
    />


    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Tìm kiếm</label>
            <input
              v-model="searchText"
              type="text"
              class="form-control"
              placeholder="Mã phiếu / Serial / SĐT / Khách hàng / Sản phẩm"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Trạng thái</label>
            <select v-model="statusFilter" class="form-select">
              <option value="">Tất cả</option>
              <option :value="0">Chờ xử lý</option>
              <option :value="1">Đã tiếp nhận</option>
              <option :value="2">Đang sửa chữa</option>
              <option :value="3">Chờ bàn giao</option>
              <option :value="4">Hoàn thành</option>
              <option :value="5">Đã hủy</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <div class="text-end w-100">
              <div class="small text-muted">Tổng số: {{ filteredWarranties.length }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div v-if="error" class="alert alert-danger m-3">
          {{ error }}
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 130px">Mã phiếu</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Serial/IMEI</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th class="text-center">Trạng thái</th>
                <th class="text-end" style="width: 140px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-4">
                  <span class="spinner-border spinner-border-sm me-2" />
                  Đang tải dữ liệu...
                </td>
              </tr>
              <tr v-else-if="filteredWarranties.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">Không có dữ liệu</td>
              </tr>
              <tr v-for="item in filteredWarranties" :key="item.id">
                <td class="fw-semibold">{{ item.maPhieuBaoHanh || shortId(item.id) }}</td>
                <td>
                  <div class="fw-semibold">
                    {{ item.hoTenKhachHang || item.customerName || 'N/A' }}
                  </div>
                  <div class="text-muted small">
                    {{ item.soDienThoai || item.customerPhone || '—' }}
                  </div>
                </td>
                <td>
                  <div class="fw-semibold">{{ item.tenSanPham || item.productName || 'N/A' }}</div>
                  <div class="text-muted small">{{ item.maSanPham || item.productCode || '' }}</div>
                </td>
                <td>{{ item.soSerial || item.imei || '—' }}</td>
                <td>{{ formatDate(item.ngayBatDau || item.startDate) }}</td>
                <td>{{ formatDate(item.ngayKetThuc || item.endDate) }}</td>
                <td class="text-center">
                  <span class="badge" :class="statusBadgeClass(item.trangThai ?? item.status)">
                    {{ warrantyStatusText(item.trangThai ?? item.status) }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-primary" @click="openDetail(item)">
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <WarrantyDetail
      v-if="showDetail && selectedWarranty"
      :warranty="selectedWarranty"
      @close="closeDetail"
      @refresh="handleRefresh"
      @warranty-updated="handleWarrantyUpdated"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import OfflineWarrantyModal from './OfflineWarrantyModal.vue'
import WarrantyDetail from './WarrantyDetail.vue'
import { getPhieuBaoHanh } from '@/service/baohanh/PhieuBaoHanhService'

const warranties = ref([])
const loading = ref(false)
const error = ref(null)
const searchText = ref('')
const statusFilter = ref('')
const showDetail = ref(false)
const showOfflineModal = ref(false)
const selectedWarranty = ref(null)

const shortId = (id) => {
  if (!id) return 'N/A'
  return id.toString().substring(0, 8).toUpperCase()
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN')
}

const warrantyStatusText = (status) => {
  // Status values: 0=Chờ xử lý, 1=Đã tiếp nhận, 2=Đang sửa chữa, 3=Chờ bàn giao, 4=Hoàn thành, 5=Đã hủy
  if (typeof status === 'number') {
    const map = {
      0: 'Chờ xử lý',
      1: 'Đã tiếp nhận',
      2: 'Đang sửa chữa',
      3: 'Chờ bàn giao',
      4: 'Hoàn thành',
      5: 'Đã hủy',
    }
    return map[status] || `Trạng thái ${status}`
  }
  // Backward compatibility for string statuses
  const map = {
    ACTIVE: 'Đang bảo hành',
    EXPIRED: 'Hết hạn',
    CANCELLED: 'Đã hủy',
    CHO_XU_LY: 'Chờ xử lý',
    DA_TIEP_NHAN: 'Đã tiếp nhận',
    DANG_SUA_CHUA: 'Đang sửa chữa',
    CHO_BAN_GIAO: 'Chờ bàn giao',
    HOAN_THANH: 'Hoàn thành',
    DA_HUY: 'Đã hủy',
  }
  return map[status] || status || '—'
}

const statusBadgeClass = (status) => {
  // Status values: 0=Chờ xử lý, 1=Đã tiếp nhận, 2=Đang sửa chữa, 3=Chờ bàn giao, 4=Hoàn thành, 5=Đã hủy
  if (typeof status === 'number') {
    const map = {
      0: 'bg-warning text-dark', // Chờ xử lý
      1: 'bg-info text-white', // Đã tiếp nhận
      2: 'bg-primary text-white', // Đang sửa chữa
      3: 'bg-warning text-dark', // Chờ bàn giao
      4: 'bg-success text-white', // Hoàn thành
      5: 'bg-danger text-white', // Đã hủy
    }
    return map[status] || 'bg-secondary'
  }
  // Backward compatibility
  return {
    'bg-success': status === 'ACTIVE' || status === 'HOAN_THANH',
    'bg-secondary': status === 'EXPIRED',
    'bg-danger': status === 'CANCELLED' || status === 'DA_HUY',
    'bg-warning text-dark': status === 'CHO_XU_LY' || status === 'CHO_BAN_GIAO',
    'bg-info text-white': status === 'DA_TIEP_NHAN',
    'bg-primary text-white': status === 'DANG_SUA_CHUA',
  }
}

const filteredWarranties = computed(() => {
  const text = searchText.value.trim().toLowerCase()
  return warranties.value
    .filter((item) => {
      if (
        statusFilter.value !== '' &&
        Number(statusFilter.value) !== (item.trangThai ?? item.status)
      ) {
        return false
      }
      if (!text) return true
      const haystack = [
        item.maPhieuBaoHanh,
        item.soSerial,
        item.imei,
        item.hoTenKhachHang,
        item.soDienThoai,
        item.tenSanPham,
        item.maSanPham,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(text)
    })
    .sort((a, b) => {
      const dateA = new Date(a.ngayBatDau || a.startDate || 0).getTime()
      const dateB = new Date(b.ngayBatDau || b.startDate || 0).getTime()
      return dateB - dateA
    })
})

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await getPhieuBaoHanh()
    warranties.value = Array.isArray(data) ? data : []

    // Keep selectedWarranty in sync if open
    if (selectedWarranty.value) {
      const updated = warranties.value.find((w) => w.id === selectedWarranty.value.id)
      if (updated) {
        selectedWarranty.value = updated
      }
    }
  } catch (err) {
    console.error('Error loading warranties:', err)
    error.value = err?.message || 'Không thể tải danh sách bảo hành'
    warranties.value = []
  } finally {
    loading.value = false
  }
}

const openDetail = (item) => {
  selectedWarranty.value = item
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  selectedWarranty.value = null
}

const handleRefresh = () => {
  fetchData()
}

const handleWarrantyUpdated = (updated) => {
  if (!updated?.id) return
  const idx = warranties.value.findIndex((w) => w.id === updated.id)
  if (idx !== -1) {
    warranties.value[idx] = { ...warranties.value[idx], ...updated }
    // Update selectedWarranty if it matches
    if (selectedWarranty.value && selectedWarranty.value.id === updated.id) {
      selectedWarranty.value = warranties.value[idx]
    }
  }
}

const handleOfflineCreated = () => {
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.warranty-management {
  max-width: 100%;
}

.table td,
.table th {
  vertical-align: middle;
}

.badge {
  min-width: 110px;
}
</style>
