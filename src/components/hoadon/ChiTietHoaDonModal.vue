<template>
  <!-- Backdrop -->
  <div class="modal-backdrop fade show"></div>

  <!-- Modal -->
  <div class="modal fade show d-block" tabindex="-1" style="z-index: 9999">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-receipt"></i> Chi tiết hóa đơn: {{ hoaDon?.ma || 'Đang tải...' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>

        <!-- Body -->
        <div class="modal-body" v-if="loading">
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Đang tải chi tiết hóa đơn...</p>
          </div>
        </div>

        <div class="modal-body" v-else-if="error">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> {{ error }}
          </div>
        </div>

        <div class="modal-body" v-else-if="hoaDon">
          <!-- Thông tin cơ bản -->
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="info-card">
                <h6 class="fw-bold mb-3">
                  <i class="bi bi-person-circle text-primary"></i> Thông tin khách hàng
                </h6>
                <table class="table table-sm table-borderless">
                  <tr>
                    <td class="text-muted" style="width: 40%">Họ tên:</td>
                    <td class="fw-semibold">{{ hoaDon.khachHang?.hoTen || 'Khách lẻ' }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Số điện thoại:</td>
                    <td class="fw-semibold">{{ hoaDon.khachHang?.soDienThoai || 'N/A' }}</td>
                  </tr>
                  <tr v-if="hoaDon.khachHang?.email">
                    <td class="text-muted">Email:</td>
                    <td class="fw-semibold">{{ hoaDon.khachHang.email }}</td>
                  </tr>
                  <tr v-if="hoaDon.khachHang?.diaChi">
                    <td class="text-muted">Địa chỉ:</td>
                    <td class="fw-semibold">{{ hoaDon.khachHang.diaChi }}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="col-md-6">
              <div class="info-card">
                <h6 class="fw-bold mb-3">
                  <i class="bi bi-person-badge text-success"></i> Thông tin nhân viên
                </h6>
                <table class="table table-sm table-borderless">
                  <tr>
                    <td class="text-muted" style="width: 40%">Họ tên:</td>
                    <td class="fw-semibold">{{ hoaDon.nhanVien?.hoTen || 'N/A' }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Mã NV:</td>
                    <td class="fw-semibold">{{ hoaDon.nhanVien?.maNhanVien || 'N/A' }}</td>
                  </tr>
                  <tr v-if="hoaDon.nhanVien?.chucVu">
                    <td class="text-muted">Chức vụ:</td>
                    <td class="fw-semibold">{{ hoaDon.nhanVien.chucVu }}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Thông tin hóa đơn -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="info-card">
                <h6 class="fw-bold mb-3">
                  <i class="bi bi-file-earmark-text text-info"></i> Thông tin hóa đơn
                </h6>
                <div class="row">
                  <div class="col-md-4">
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td class="text-muted">Mã HĐ:</td>
                        <td class="fw-semibold">{{ hoaDon.ma }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted">Loại HĐ:</td>
                        <td>
                          <span class="badge bg-secondary">
                            {{ hoaDon.loaiHoaDon === 0 ? 'Tại quầy' : 'Online' }}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div class="col-md-4">
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td class="text-muted">Ngày tạo:</td>
                        <td class="fw-semibold">{{ formatDate(hoaDon.ngayTao) }}</td>
                      </tr>
                      <tr v-if="hoaDon.ngayThanhToan">
                        <td class="text-muted">Ngày TT:</td>
                        <td class="fw-semibold">{{ formatDate(hoaDon.ngayThanhToan) }}</td>
                      </tr>
                    </table>
                  </div>
                  <div class="col-md-4">
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td class="text-muted">Trạng thái:</td>
                        <td>
                          <div class="d-flex align-items-center gap-2">
                            <span :class="['badge', getStatusBadgeClass(hoaDon.trangThai)]">
                              {{ getTrangThaiLabel(hoaDon.trangThai) }}
                            </span>
                            <select
                              v-model="newStatus"
                              class="form-select form-select-sm"
                              style="width: auto"
                              @change="updateStatus"
                              :disabled="updatingStatus"
                            >
                              <option :value="null">Cập nhật trạng thái</option>
                              <option value="0">Chờ thanh toán</option>
                              <option value="1">Đã thanh toán</option>
                              <option value="3">Đang giao hàng</option>
                              <option value="4">Hoàn thành</option>
                              <option value="2">Đã hủy</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted">Thanh toán:</td>
                        <td>
                          <span
                            :class="[
                              'badge',
                              hoaDon.trangThaiThanhToan === 1 ? 'bg-success' : 'bg-warning',
                            ]"
                          >
                            {{
                              hoaDon.trangThaiThanhToan === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'
                            }}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Danh sách sản phẩm -->
          <div class="mb-4">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-cart3 text-warning"></i> Danh sách sản phẩm
            </h6>
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Mã CTSP</th>
                    <th>Tên sản phẩm</th>
                    <th class="text-center">Số lượng</th>
                    <th class="text-end">Đơn giá</th>
                    <th class="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in hoaDon.chiTietList" :key="item.id">
                    <td>{{ index + 1 }}</td>
                    <td class="fw-semibold">{{ item.maCtsp }}</td>
                    <td>{{ item.tenSanPham }}</td>
                    <td class="text-center">{{ item.soLuong }}</td>
                    <td class="text-end">{{ formatCurrency(item.donGia) }}</td>
                    <td class="text-end fw-semibold">{{ formatCurrency(item.thanhTien) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Thông tin thanh toán -->
          <div class="row">
            <div class="col-md-6" v-if="hoaDon.thanhToanList && hoaDon.thanhToanList.length > 0">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-credit-card text-success"></i> Phương thức thanh toán
              </h6>
              <table class="table table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Phương thức</th>
                    <th class="text-end">Số tiền</th>
                    <th>Mã GD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tt in hoaDon.thanhToanList" :key="tt.id">
                    <td>{{ tt.tenPhuongThuc }}</td>
                    <td class="text-end">{{ formatCurrency(tt.soTienThanhToan) }}</td>
                    <td>
                      <small class="text-muted">{{ tt.maGiaoDich || 'N/A' }}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="col-md-6">
              <h6 class="fw-bold mb-3"><i class="bi bi-calculator text-danger"></i> Tổng kết</h6>
              <table class="table table-sm">
                <tr>
                  <td class="text-muted">Tổng tiền hàng:</td>
                  <td class="text-end fw-semibold">{{ formatCurrency(hoaDon.tongTien) }}</td>
                </tr>
                <tr v-if="hoaDon.tienDuocGiam && hoaDon.tienDuocGiam > 0">
                  <td class="text-muted">Giảm giá:</td>
                  <td class="text-end text-danger">-{{ formatCurrency(hoaDon.tienDuocGiam) }}</td>
                </tr>
                <tr v-if="hoaDon.soDiemSuDung && hoaDon.soDiemSuDung > 0">
                  <td class="text-muted">Điểm tích lũy ({{ hoaDon.soDiemSuDung }} điểm):</td>
                  <td class="text-end text-danger">-{{ formatCurrency(hoaDon.soTienQuyDoi) }}</td>
                </tr>
                <tr class="table-active">
                  <td class="fw-bold">TỔNG THANH TOÁN:</td>
                  <td class="text-end fw-bold text-primary fs-5">
                    {{ formatCurrency(hoaDon.tongTienSauGiam) }}
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Ghi chú -->
          <div v-if="hoaDon.ghiChu" class="alert alert-info mb-0">
            <strong>Ghi chú:</strong> {{ hoaDon.ghiChu }}
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">
            <i class="bi bi-x-circle"></i> Đóng
          </button>
          <button type="button" class="btn btn-primary" @click="printInvoice">
            <i class="bi bi-printer"></i> In hóa đơn
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHoaDonDetail, updateOrderStatus } from '@/service/hoaDonService'

const props = defineProps({
  idHoaDon: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'updated'])

const hoaDon = ref(null)
const loading = ref(false)
const error = ref(null)
const newStatus = ref(null)
const updatingStatus = ref(false)

// Load data
onMounted(async () => {
  await loadHoaDonDetail()
})

const loadHoaDonDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await getHoaDonDetail(props.idHoaDon)
    hoaDon.value = response.data
    console.log('✅ [ChiTietHoaDonModal] Loaded:', hoaDon.value)
  } catch (err) {
    console.error('❌ [ChiTietHoaDonModal] Error:', err)
    error.value = err.response?.data?.message || 'Không thể tải chi tiết hóa đơn'
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}

const printInvoice = () => {
  alert('Chức năng in hóa đơn đang được phát triển!')
}

const updateStatus = async () => {
  if (!newStatus.value || newStatus.value === null) return

  if (!confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng này?`)) {
    newStatus.value = null
    return
  }

  updatingStatus.value = true
  try {
    const response = await updateOrderStatus(props.idHoaDon, parseInt(newStatus.value))

    // Parse response
    let result = response
    if (response && response.data) {
      if (response.data.data) {
        result = response.data
      } else {
        result = response
      }
    }

    if (result.success || result.data) {
      // Reload data
      await loadHoaDonDetail()
      alert('Cập nhật trạng thái thành công!')
      // Emit event to parent to refresh list
      emit('updated')
    } else {
      throw new Error(result.message || 'Không thể cập nhật trạng thái')
    }
  } catch (err) {
    console.error('Error updating status:', err)
    alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
  } finally {
    updatingStatus.value = false
    newStatus.value = null
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getTrangThaiLabel = (trangThai) => {
  const labels = {
    CHO_THANH_TOAN: 'Chờ thanh toán',
    CHO_XAC_NHAN: 'Chờ xác nhận',
    DA_XAC_NHAN: 'Đã xác nhận',
    DANG_GIAO: 'Đang giao hàng',
    HOAN_THANH: 'Hoàn thành',
    DA_HUY: 'Đã hủy',
  }
  return labels[trangThai] || trangThai
}

const getStatusBadgeClass = (trangThai) => {
  const classes = {
    CHO_THANH_TOAN: 'bg-secondary',
    CHO_XAC_NHAN: 'bg-warning',
    DA_XAC_NHAN: 'bg-info',
    DANG_GIAO: 'bg-primary',
    HOAN_THANH: 'bg-success',
    DA_HUY: 'bg-danger',
  }
  return classes[trangThai] || 'bg-secondary'
}
</script>

<style scoped>
/* Fix z-index cho modal */
.modal-backdrop {
  z-index: 9998 !important;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  z-index: 9999 !important;
}

.info-card {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.table td,
.table th {
  vertical-align: middle;
}
</style>
