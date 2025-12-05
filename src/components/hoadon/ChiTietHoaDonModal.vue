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
          <SkeletonLoader
            type="card"
            :lines="8"
            :line-widths="['100%', '80%', '100%', '60%', '100%', '90%', '100%', '70%']"
          />
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
                    <td class="fw-semibold">
                      {{ hoaDon.khachHang?.hoTen || hoaDon.tenKhachHang || 'Khách lẻ' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-muted">Số điện thoại:</td>
                    <td class="fw-semibold">
                      {{ hoaDon.khachHang?.soDienThoai || hoaDon.sdt || 'N/A' }}
                    </td>
                  </tr>
                  <tr v-if="hoaDon.khachHang?.email || hoaDon.email">
                    <td class="text-muted">Email:</td>
                    <td class="fw-semibold">
                      {{ hoaDon.khachHang?.email || hoaDon.email || 'N/A' }}
                    </td>
                  </tr>
                  <tr v-if="hoaDon.khachHang?.diaChi || hoaDon.diaChi">
                    <td class="text-muted">Địa chỉ:</td>
                    <td class="fw-semibold">
                      {{ hoaDon.khachHang?.diaChi || hoaDon.diaChi || 'N/A' }}
                    </td>
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
                    <td class="fw-semibold">
                      {{ hoaDon.nhanVien?.hoTen || hoaDon.tenNhanVien || 'N/A' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-muted">Mã NV:</td>
                    <td class="fw-semibold">
                      {{ hoaDon.nhanVien?.maNhanVien || hoaDon.maNhanVien || 'N/A' }}
                    </td>
                  </tr>
                  <tr v-if="hoaDon.nhanVien?.chucVu || hoaDon.chucVu">
                    <td class="text-muted">Chức vụ:</td>
                    <td class="fw-semibold">
                      {{ hoaDon.nhanVien?.chucVu || hoaDon.chucVu || '' }}
                    </td>
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
                          <div class="d-flex align-items-center gap-2 flex-wrap">
                            <span :class="['badge', getStatusBadgeClass(hoaDon.trangThai)]">
                              {{ getTrangThaiLabel(hoaDon.trangThai) }}
                            </span>
                            <!-- Badge cho đơn online đã thanh toán nhưng chờ xác nhận -->
                            <span
                              v-if="
                                isOnlineOrder &&
                                (hoaDon.trangThai === 'CHO_THANH_TOAN' || hoaDon.trangThai === 0) &&
                                hoaDon.trangThaiThanhToan === 1
                              "
                              class="badge bg-info text-white"
                              title="Đơn hàng đã thanh toán, đang chờ admin xác nhận"
                            >
                              <i class="bi bi-clock-history me-1"></i>CHỜ XÁC NHẬN
                            </span>
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
                    <th style="width: 50px">#</th>
                    <th style="min-width: 200px">Mã CTSP & Thông tin</th>
                    <th style="min-width: 250px">Tên sản phẩm</th>
                    <th style="min-width: 150px">Thông số biến thể</th>
                    <th class="text-center" style="width: 100px">SL</th>
                    <th class="text-end" style="width: 120px">Đơn giá</th>
                    <th class="text-end" style="width: 120px">Thành tiền</th>
                    <th>Serial/IMEI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in hoaDon.chiTietList || hoaDon.hoaDonChiTiet || []"
                    :key="item.id"
                  >
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>
                      <!-- Mã CTSP - NỔI BẬT -->
                      <div class="ctsp-code-cell">
                        <span class="ctsp-badge-small">
                          <i class="bi bi-tag-fill me-1"></i>
                          <code class="ctsp-code-text">{{ getCTSPCode(item) }}</code>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div class="product-name-cell">
                        <strong>{{ item.tenSanPham || item.tenSP || 'N/A' }}</strong>
                      </div>
                    </td>
                    <td>
                      <!-- Thông số biến thể -->
                      <div v-if="getCTSPSpecs(item)" class="ctsp-specs-cell">
                        <div class="spec-item-small" v-if="getCTSPSpecs(item).cpu">
                          <i class="bi bi-cpu"></i> {{ getCTSPSpecs(item).cpu }}
                        </div>
                        <div class="spec-item-small" v-if="getCTSPSpecs(item).ram">
                          <i class="bi bi-memory"></i> {{ getCTSPSpecs(item).ram }}
                        </div>
                        <div class="spec-item-small" v-if="getCTSPSpecs(item).storage">
                          <i class="bi bi-hdd"></i> {{ getCTSPSpecs(item).storage }}
                        </div>
                        <div class="spec-item-small" v-if="getCTSPSpecs(item).color">
                          <i class="bi bi-palette"></i> {{ getCTSPSpecs(item).color }}
                        </div>
                      </div>
                      <span v-else class="text-muted small">-</span>

                      <!-- Serial numbers (nếu có) -->
                      <div v-if="getSerialsForItem(item)" class="mt-1">
                        <small class="text-info">
                          <i class="bi bi-upc-scan"></i>
                          <span v-for="(serial, idx) in getSerialsForItem(item)" :key="idx">
                            {{ serial
                            }}<span v-if="idx < getSerialsForItem(item).length - 1">, </span>
                          </span>
                        </small>
                      </div>
                    </td>
                    <td class="text-center">{{ item.soLuong || 0 }}</td>
                    <td class="text-end">{{ formatCurrency(item.donGia) }}</td>
                    <td class="text-end fw-semibold text-danger">
                      {{ formatCurrency(item.thanhTien || item.donGia * item.soLuong) }}
                    </td>
                    <td>
                      <div
                        v-if="getSerialsForItem(item) && getSerialsForItem(item).length > 0"
                        class="serial-list"
                      >
                        <small class="text-info">
                          <i class="bi bi-upc-scan"></i>
                          <span
                            v-for="(serial, idx) in getSerialsForItem(item)"
                            :key="idx"
                            class="serial-badge"
                          >
                            {{ serial }}
                            <span v-if="idx < getSerialsForItem(item).length - 1">, </span>
                          </span>
                        </small>
                      </div>
                      <span v-else class="text-muted small">-</span>
                    </td>
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
          <!-- Action buttons for online orders -->
          <div v-if="isOnlineOrder && canConfirmOrder" class="me-auto">
            <button
              type="button"
              class="btn btn-success me-2"
              @click="handleConfirmOrder"
              :disabled="confirmingOrder"
            >
              <span v-if="confirmingOrder" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-check-circle me-1"></i>
              {{ confirmingOrder ? 'Đang xác nhận...' : 'Xác nhận đơn hàng' }}
            </button>
            <button
              type="button"
              class="btn btn-danger me-2"
              @click="handleCancelOrder"
              :disabled="cancelingOrder"
            >
              <span v-if="cancelingOrder" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-x-circle me-1"></i>
              {{ cancelingOrder ? 'Đang hủy...' : 'Hủy đơn hàng' }}
            </button>
          </div>

          <!-- Action buttons for offline orders (xác nhận thủ công) -->
          <div v-if="!isOnlineOrder && canConfirmOrder" class="me-auto">
            <button
              type="button"
              class="btn btn-success me-2"
              @click="handleConfirmOrderManual"
              :disabled="confirmingOrder"
              title="Xác nhận đơn hàng tại quầy (chuyển sang trạng thái Đã thanh toán)"
            >
              <span v-if="confirmingOrder" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-check-circle me-1"></i>
              {{ confirmingOrder ? 'Đang xác nhận...' : 'Xác nhận thanh toán' }}
            </button>
            <button
              type="button"
              class="btn btn-danger me-2"
              @click="handleCancelOrder"
              :disabled="cancelingOrder"
            >
              <span v-if="cancelingOrder" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-x-circle me-1"></i>
              {{ cancelingOrder ? 'Đang hủy...' : 'Hủy đơn hàng' }}
            </button>
          </div>

          <!-- Nút chuyển trạng thái tiếp theo (cho cả online và offline) -->

          <button type="button" class="btn btn-secondary" @click="close">
            <i class="bi bi-x-circle"></i> Đóng
          </button>
          <button type="button" class="btn btn-primary" @click="printInvoice">
            <i class="bi bi-printer"></i> In hóa đơn
          </button>
          <button type="button" class="btn btn-info text-white" @click="openSendEmail">
            <i class="bi bi-envelope"></i> Gửi email
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  getHoaDonDetail,
  capNhatTrangThai,
  xacNhanDonHang,
  huyDonHang,
} from '@/service/hoaDonService'
import { inHoaDon } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import SendEmailModal from './SendEmailModal.vue'

const props = defineProps({
  idHoaDon: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const hoaDon = ref(null)
const loading = ref(false)
const error = ref(null)

// Status change

// Serial/IMEI view
const expandedSerials = ref({})

const toggleSerialView = (index) => {
  expandedSerials.value[index] = !expandedSerials.value[index]
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccess('Đã copy vào clipboard!')
  } catch (err) {
    console.error('Lỗi khi copy:', err)
    showError('Không thể copy!')
  }
}

// Send email
const showSendEmailModal = ref(false)

const openSendEmail = () => {
  if (!hoaDon.value) {
    showError('Không có thông tin hóa đơn!')
    return
  }
  showSendEmailModal.value = true
}

const closeSendEmailModal = () => {
  showSendEmailModal.value = false
}

const handleEmailSent = () => {
  closeSendEmailModal()
}

const { success: showSuccess, error: showError } = useToast()
const { confirm } = useConfirm()

// States for order actions
const confirmingOrder = ref(false)
const cancelingOrder = ref(false)

// Computed properties
const isOnlineOrder = computed(() => {
  return hoaDon.value?.loaiHoaDon === 1
})

const canConfirmOrder = computed(() => {
  if (!hoaDon.value) return false

  const trangThai = hoaDon.value.trangThai
  const loaiHoaDon = hoaDon.value.loaiHoaDon

  // Đơn online: chỉ xác nhận khi CHO_THANH_TOAN (0) và chưa hủy
  if (loaiHoaDon === 1) {
    return (
      (trangThai === 'CHO_THANH_TOAN' || trangThai === 0) &&
      trangThai !== 'DA_HUY' &&
      trangThai !== 2
    )
  }

  // Đơn tại quầy: có thể xác nhận thủ công khi CHO_THANH_TOAN (0) và chưa hủy
  if (loaiHoaDon === 0) {
    return (
      (trangThai === 'CHO_THANH_TOAN' || trangThai === 0) &&
      trangThai !== 'DA_HUY' &&
      trangThai !== 2
    )
  }

  return false
})

const canCancelOrder = computed(() => {
  if (!hoaDon.value) return false

  const trangThai = hoaDon.value.trangThai

  // Chỉ có thể hủy khi CHO_THANH_TOAN (0) và chưa hủy
  return (
    (trangThai === 'CHO_THANH_TOAN' || trangThai === 0) && trangThai !== 'DA_HUY' && trangThai !== 2
  )
})

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

// Xác nhận đơn hàng online (trừ kho và chuyển sang DANG_GIAO)
const handleConfirmOrder = async () => {
  if (!hoaDon.value?.id) {
    showError('Không có thông tin hóa đơn!')
    return
  }

  const confirmed = await confirm({
    title: 'Xác nhận đơn hàng online',
    message:
      `Bạn có chắc chắn muốn xác nhận đơn hàng ${hoaDon.value.ma}?\n\n` +
      `📦 Sản phẩm: ${hoaDon.value.chiTietList?.length || 0} sản phẩm\n` +
      `💰 Tổng tiền: ${formatCurrency(hoaDon.value.tongTienSauGiam)}\n\n` +
      `⚠️ Lưu ý: Hệ thống sẽ trừ kho và chuyển sang trạng thái "Đang giao hàng" khi xác nhận.`,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'warning',
  })

  if (!confirmed) {
    return
  }

  confirmingOrder.value = true
  try {
    const response = await xacNhanDonHang(hoaDon.value.id)
    showSuccess(
      '✅ Xác nhận đơn hàng thành công!\nHệ thống đã trừ kho, cập nhật serial và chuyển sang trạng thái "Đang giao hàng".',
    )

    // Đợi một chút để đảm bảo backend đã commit transaction
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Reload chi tiết hóa đơn để lấy serial và trạng thái mới
    await loadHoaDonDetail()

    // Emit event để parent component refresh danh sách
    emit('order-confirmed', hoaDon.value.id)
  } catch (err) {
    console.error('❌ Lỗi khi xác nhận đơn hàng:', err)
    showError(err.response?.data?.message || 'Không thể xác nhận đơn hàng. Vui lòng thử lại!')
  } finally {
    confirmingOrder.value = false
  }
}

// Xác nhận đơn hàng tại quầy thủ công (chuyển sang DA_THANH_TOAN)
const handleConfirmOrderManual = async () => {
  if (!hoaDon.value?.id) {
    showError('Không có thông tin hóa đơn!')
    return
  }

  const confirmed = await confirm({
    title: 'Xác nhận thanh toán đơn tại quầy',
    message:
      `Bạn có chắc chắn muốn xác nhận đơn hàng ${hoaDon.value.ma}?\n\n` +
      `📦 Sản phẩm: ${hoaDon.value.chiTietList?.length || 0} sản phẩm\n` +
      `💰 Tổng tiền: ${formatCurrency(hoaDon.value.tongTienSauGiam)}\n\n` +
      `ℹ️ Lưu ý: Đơn hàng sẽ chuyển sang trạng thái "Đã thanh toán".`,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'info',
  })

  if (!confirmed) {
    return
  }

  confirmingOrder.value = true
  try {
    // Chuyển trạng thái sang DA_THANH_TOAN (1) cho đơn tại quầy
    await capNhatTrangThai(hoaDon.value.id, 1) // 1 = DA_THANH_TOAN
    showSuccess(
      '✅ Xác nhận thanh toán thành công!\nĐơn hàng đã chuyển sang trạng thái "Đã thanh toán".',
    )

    // Đợi một chút để đảm bảo backend đã commit transaction
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Reload chi tiết hóa đơn để lấy trạng thái mới
    await loadHoaDonDetail()

    // Emit event để parent component refresh danh sách
    emit('order-confirmed', hoaDon.value.id)
  } catch (err) {
    console.error('❌ Lỗi khi xác nhận đơn hàng:', err)
    showError(err.response?.data?.message || 'Không thể xác nhận đơn hàng. Vui lòng thử lại!')
  } finally {
    confirmingOrder.value = false
  }
}

// Hủy đơn hàng online
const handleCancelOrder = async () => {
  if (!hoaDon.value?.id) {
    showError('Không có thông tin hóa đơn!')
    return
  }

  const confirmed = await confirm({
    title: 'Hủy đơn hàng',
    message: `Bạn có chắc chắn muốn hủy đơn hàng ${hoaDon.value.ma}?\n\nHành động này không thể hoàn tác.`,
    confirmText: 'Hủy đơn',
    cancelText: 'Không',
    type: 'danger',
  })

  if (!confirmed) {
    return
  }

  cancelingOrder.value = true
  try {
    await huyDonHang(hoaDon.value.id)
    showSuccess('Hủy đơn hàng thành công!')

    // Reload chi tiết hóa đơn
    await loadHoaDonDetail()

    // Emit event để parent component refresh danh sách
    emit('order-cancelled', hoaDon.value.id)
  } catch (err) {
    console.error('❌ Lỗi khi hủy đơn hàng:', err)
    showError(err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại!')
  } finally {
    cancelingOrder.value = false
  }
}

const printInvoice = async () => {
  if (!hoaDon.value?.id) {
    showError('Không có thông tin hóa đơn để in!')
    return
  }

  try {
    const blob = await inHoaDon(hoaDon.value.id)

    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      }
      showSuccess('Đang mở hộp thoại in...')
    } else {
      // Fallback: download
      const link = document.createElement('a')
      link.href = url
      link.download = `HoaDon_${hoaDon.value.ma || hoaDon.value.id}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showSuccess('Đã tải hóa đơn thành công!')
    }
  } catch (err) {
    console.error('❌ Lỗi khi in hóa đơn:', err)
    showError('Không thể in hóa đơn. Vui lòng thử lại!')
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
  // Mapping theo enum TrangThaiHoaDon:
  // 0: CHO_THANH_TOAN, 1: DA_THANH_TOAN, 2: DA_HUY, 3: DANG_GIAO, 4: HOAN_THANH

  // Xử lý number (từ backend)
  if (typeof trangThai === 'number') {
    const labels = {
      0: 'Chờ thanh toán', // CHO_THANH_TOAN
      1: 'Đã thanh toán', // DA_THANH_TOAN
      2: 'Đã hủy', // DA_HUY
      3: 'Đang giao hàng', // DANG_GIAO
      4: 'Hoàn thành', // HOAN_THANH
    }
    return labels[trangThai] || `Trạng thái ${trangThai}`
  }

  // Xử lý string (tương thích với format cũ)
  if (typeof trangThai === 'string') {
    const labels = {
      CHO_THANH_TOAN: 'Chờ thanh toán',
      DA_THANH_TOAN: 'Đã thanh toán',
      DANG_GIAO: 'Đang giao hàng',
      HOAN_THANH: 'Hoàn thành',
      DA_HUY: 'Đã hủy',
      // Tương thích với format cũ (nếu có)
      CHO_XAC_NHAN: 'Chờ xác nhận',
      DA_XAC_NHAN: 'Đã xác nhận',
    }
    return labels[trangThai] || trangThai
  }

  return 'Không xác định'
}

const getStatusBadgeClass = (trangThai) => {
  // Mapping theo enum TrangThaiHoaDon:
  // 0: CHO_THANH_TOAN, 1: DA_THANH_TOAN, 2: DA_HUY, 3: DANG_GIAO, 4: HOAN_THANH

  // Xử lý number (từ backend)
  if (typeof trangThai === 'number') {
    const classes = {
      0: 'bg-warning text-dark', // CHO_THANH_TOAN - Chờ thanh toán (vàng)
      1: 'bg-info text-white', // DA_THANH_TOAN - Đã thanh toán (xanh dương)
      2: 'bg-danger text-white', // DA_HUY - Đã hủy (đỏ)
      3: 'bg-primary text-white', // DANG_GIAO - Đang giao hàng (xanh)
      4: 'bg-success text-white', // HOAN_THANH - Hoàn thành (xanh lá)
    }
    return classes[trangThai] || 'bg-secondary'
  }

  // Xử lý string (tương thích với format cũ)
  if (typeof trangThai === 'string') {
    const classes = {
      CHO_THANH_TOAN: 'bg-warning text-dark',
      DA_THANH_TOAN: 'bg-info text-white',
      DANG_GIAO: 'bg-primary text-white',
      HOAN_THANH: 'bg-success text-white',
      DA_HUY: 'bg-danger text-white',
      // Tương thích với format cũ
      CHO_XAC_NHAN: 'bg-warning text-dark',
      DA_XAC_NHAN: 'bg-info text-white',
    }
    return classes[trangThai] || 'bg-secondary'
  }

  return 'bg-secondary'
}

/**
<<<<<<< HEAD
 * Lấy mã CTSP từ item
 */
const getCTSPCode = (item) => {
  return (
    item.maCtsp ||
    item.maCTSP ||
    item.maChiTietSanPham ||
    item.chiTietSanPham?.maCTSP ||
    item.chiTietSanPham?.maCtsp ||
    'N/A'
  )
}

/**
 * Lấy thông số CTSP từ item
 */
const getCTSPSpecs = (item) => {
  if (!item) return null

  const ctsp = item.chiTietSanPham || item.ctsp || item
  const specs = {}

  if (ctsp.tenCpu || item.tenCpu) {
    specs.cpu = ctsp.tenCpu || item.tenCpu
  }

  if (ctsp.tenRam || item.tenRam) {
    specs.ram = ctsp.tenRam || item.tenRam
  }

  if (ctsp.dungLuongOCung || item.dungLuongOCung) {
    specs.storage = ctsp.dungLuongOCung || item.dungLuongOCung
  }

  if (ctsp.tenMauSac || item.tenMauSac) {
    specs.color = ctsp.tenMauSac || item.tenMauSac
  }

  return Object.keys(specs).length > 0 ? specs : null
}

/**
 * Lấy serial numbers cho item (nếu có)
 * @param {Object} item - chiTietList item
 * @returns {Array|null} - Danh sách serial numbers hoặc null
 */
const getSerialsForItem = (item) => {
  if (!item) return null

  // Kiểm tra từ backend response - serialNumbers (từ HoaDonDetailResponse)
  if (item.serialNumbers && Array.isArray(item.serialNumbers) && item.serialNumbers.length > 0) {
    const serials = item.serialNumbers
      .map((s) => {
        // Hỗ trợ nhiều format: { serialNumber, serialNo, serial_no } hoặc string
        return typeof s === 'string' ? s : s.serialNumber || s.serialNo || s.serial_no || s
      })
      .filter((s) => s) // Filter out null/undefined

    if (serials.length > 0) {
      console.log('✅ [getSerialsForItem] Found serials from serialNumbers:', serials)
      return serials
    }
  }

  // Kiểm tra từ chiTietSanPham
  if (item.chiTietSanPham?.serials && Array.isArray(item.chiTietSanPham.serials)) {
    const serials = item.chiTietSanPham.serials
      .map((s) => s.serialNo || s.serialNumber || s)
      .filter((s) => s)
    if (serials.length > 0) {
      console.log('✅ [getSerialsForItem] Found serials from chiTietSanPham:', serials)
      return serials
    }
  }

  // Debug: Log để kiểm tra
  console.log('⚠️ [getSerialsForItem] No serials found for item:', {
    id: item.id,
    tenSp: item.tenSanPham,
    serialNumbers: item.serialNumbers,
    chiTietSanPham: item.chiTietSanPham,
  })

  return null
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

<<<<<<< HEAD
/* CTSP Code - NỔI BẬT */
.ctsp-code-cell {
  padding: 0.25rem 0;
}

.ctsp-badge-small {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.6rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.ctsp-code-text {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* CTSP Specs */
.ctsp-specs-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spec-item-small {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.4rem;
  background: #f0f4ff;
  color: #4a5568;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid #cbd5e0;
  width: fit-content;
}

.spec-item-small i {
  color: #667eea;
  font-size: 0.75rem;
}

.product-name-cell {
  font-weight: 600;
  color: #212529;
}

.serial-list {
  max-width: 300px;
}

.serial-badge {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  background-color: #e7f3ff;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 4px;
}
</style>
