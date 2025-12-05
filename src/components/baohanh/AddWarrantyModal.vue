<template>
  <div class="modal fade show d-block" style="z-index: 10000; background-color: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>Thêm phiếu bảo hành mới</h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-3 text-muted">Đang tải dữ liệu...</p>
          </div>

          <form v-else @submit.prevent="handleSubmit">
            <!-- Bước 1: Nhập mã hóa đơn -->
            <div v-if="step === 1" class="step-content">
              <h6 class="fw-bold mb-3"><i class="bi bi-1-circle me-2"></i>Nhập mã hóa đơn</h6>
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Mã hóa đơn <span class="text-danger">*</span></label
                >
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-receipt"></i>
                  </span>
                  <input
                    v-model="invoiceCode"
                    type="text"
                    class="form-control"
                    placeholder="Nhập mã hóa đơn..."
                    @keyup.enter="searchInvoiceByCode"
                    :disabled="loadingInvoiceDetail"
                  />
                  <button
                    class="btn btn-primary"
                    type="button"
                    @click="searchInvoiceByCode"
                    :disabled="!invoiceCode.trim() || loadingInvoiceDetail"
                  >
                    <span
                      v-if="loadingInvoiceDetail"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    <i v-else class="bi bi-search me-1"></i>
                    Tìm kiếm
                  </button>
                </div>
                <small class="text-muted">Nhập mã hóa đơn và nhấn Enter hoặc click Tìm kiếm</small>
              </div>

              <!-- Hiển thị thông tin hóa đơn khi tìm thấy -->
              <div v-if="selectedInvoice && !loadingInvoiceDetail" class="card border-success">
                <div class="card-body">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                    <h6 class="mb-0 text-success">
                      <i class="bi bi-check-circle me-2"></i>Đã tìm thấy hóa đơn
                    </h6>
                    <span :class="['badge', getInvoiceStatusClass(selectedInvoice)]">
                      {{ getInvoiceStatusLabel(selectedInvoice) }}
                    </span>
                  </div>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="mb-2">
                        <small class="text-muted d-block">Mã hóa đơn</small>
                        <strong>{{ selectedInvoice.ma }}</strong>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-2">
                        <small class="text-muted d-block">Ngày tạo</small>
                        <strong>{{ formatDate(selectedInvoice.ngayTao) }}</strong>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-2">
                        <small class="text-muted d-block">Khách hàng</small>
                        <strong>{{
                          selectedInvoice.tenKhachHang ||
                          selectedInvoice.khachHang?.hoTen ||
                          'Khách lẻ'
                        }}</strong>
                        <div v-if="selectedInvoice.sdt || selectedInvoice.khachHang?.soDienThoai">
                          <small class="text-muted">{{
                            selectedInvoice.sdt || selectedInvoice.khachHang?.soDienThoai
                          }}</small>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-2">
                        <small class="text-muted d-block">Tổng tiền</small>
                        <strong class="text-primary">{{
                          formatCurrency(
                            selectedInvoice.tongTienSauGiam || selectedInvoice.tongTien,
                          )
                        }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hiển thị lỗi nếu không tìm thấy -->
              <div v-if="invoiceError" class="alert alert-danger mt-3">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ invoiceError }}
              </div>
            </div>

            <!-- Bước 2: Chọn sản phẩm và điền thông tin -->
            <div v-if="step === 2" class="step-content">
              <h6 class="fw-bold mb-3"><i class="bi bi-2-circle me-2"></i>Thông tin bảo hành</h6>

              <div v-if="invoiceProducts.length > 0" class="mb-4">
                <label class="form-label fw-semibold">Sản phẩm trong hóa đơn</label>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Serial/IMEI</th>
                        <th>Chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="product in invoiceProducts" :key="product.id">
                        <td>
                          <div class="fw-semibold">{{ product.tenSanPham || product.tenSP }}</div>
                          <small class="text-muted">{{ product.maCtsp || product.maCTSP }}</small>
                        </td>
                        <td class="text-center">{{ product.soLuong }}</td>
                        <td>
                          <div
                            v-if="getSerialsForProduct(product.id).length > 0"
                            class="d-flex flex-wrap gap-1"
                          >
                            <span
                              v-for="serial in getSerialsForProduct(product.id)"
                              :key="serial"
                              class="badge bg-secondary"
                            >
                              {{ serial }}
                            </span>
                          </div>
                          <span v-else class="text-muted">—</span>
                        </td>
                        <td class="text-center">
                          <input
                            type="radio"
                            :value="product.id"
                            v-model="formData.idHoaDonChiTiet"
                            @change="onProductChange"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold"
                    >Serial/IMEI <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.idSerialDaBan"
                    class="form-select"
                    :disabled="!formData.idHoaDonChiTiet || availableSerials.length === 0"
                  >
                    <option :value="null">-- Chọn Serial/IMEI --</option>
                    <option
                      v-for="serial in availableSerials"
                      :key="serial.idSerialDaBan"
                      :value="serial.idSerialDaBan"
                    >
                      {{ serial.serialNo || serial.imei }}
                    </option>
                  </select>
                  <small v-if="!formData.idHoaDonChiTiet" class="text-muted"
                    >Vui lòng chọn sản phẩm trước</small
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tình trạng lúc trả</label>
                  <select v-model="formData.tinhTrangLucTra" class="form-select">
                    <option value="Tốt">Tốt</option>
                    <option value="Hỏng">Hỏng</option>
                    <option value="Trầy xước">Trầy xước</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold"
                    >Mô tả chi tiết tình trạng <span class="text-danger">*</span></label
                  >
                  <textarea
                    v-model="formData.moTaTinhTrang"
                    class="form-control"
                    rows="4"
                    placeholder="Mô tả chi tiết tình trạng sản phẩm, lỗi gặp phải..."
                    required
                  ></textarea>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Lý do yêu cầu bảo hành</label>
                  <textarea
                    v-model="formData.lyDoTraHang"
                    class="form-control"
                    rows="3"
                    placeholder="Lý do yêu cầu bảo hành (nếu có)..."
                  ></textarea>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Số lượng</label>
                  <input
                    v-model.number="formData.soLuong"
                    type="number"
                    class="form-control"
                    min="1"
                    :max="selectedProduct?.soLuong || 1"
                  />
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="d-flex justify-content-between mt-4 pt-3 border-top">
              <button type="button" class="btn btn-secondary" @click="close" v-if="step === 1">
                Hủy
              </button>
              <button type="button" class="btn btn-secondary" @click="step = 1" v-else>
                <i class="bi bi-arrow-left me-1"></i>Quay lại
              </button>
              <div>
                <button
                  v-if="step === 1"
                  type="button"
                  class="btn btn-primary"
                  @click="goToStep2"
                  :disabled="!selectedInvoice || loadingInvoiceDetail"
                >
                  Tiếp theo <i class="bi bi-arrow-right ms-1"></i>
                </button>
                <button
                  v-else
                  type="submit"
                  class="btn btn-success"
                  :disabled="submitting || !isFormValid"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check-circle me-2"></i>
                  Tạo phiếu bảo hành
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getHoaDons, getHoaDonDetail } from '@/service/hoaDonService'
import { taoYeuCauBaoHanh } from '@/service/baohanh/PhieuBaoHanhService'
import { useToast } from '@/composables/useToast'

const emit = defineEmits(['close', 'created'])

const { success: showSuccess, error: showError } = useToast()

// State
const step = ref(1) // 1: Nhập mã hóa đơn, 2: Điền thông tin
const loading = ref(false)
const loadingInvoiceDetail = ref(false)
const submitting = ref(false)
const invoiceCode = ref('')
const selectedInvoice = ref(null)
const invoiceDetail = ref(null)
const invoiceProducts = ref([])
const serialsMap = ref({}) // Map idHoaDonChiTiet -> [serials]
const invoiceError = ref('')

const formData = ref({
  idHoaDon: null,
  idKhachHang: null,
  idHoaDonChiTiet: null,
  idSerialDaBan: null,
  tinhTrangLucTra: 'Tốt',
  moTaTinhTrang: '',
  lyDoTraHang: '',
  soLuong: 1,
})

// Computed
const availableSerials = computed(() => {
  if (!formData.value.idHoaDonChiTiet) return []
  return serialsMap.value[formData.value.idHoaDonChiTiet] || []
})

const selectedProduct = computed(() => {
  if (!formData.value.idHoaDonChiTiet) return null
  return invoiceProducts.value.find((p) => p.id === formData.value.idHoaDonChiTiet)
})

const isFormValid = computed(() => {
  return (
    formData.value.idHoaDonChiTiet &&
    formData.value.moTaTinhTrang?.trim() &&
    formData.value.soLuong > 0
  )
})

// Methods
const close = () => {
  emit('close')
}

const formatCurrency = (value) => {
  if (!value) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
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

const getInvoiceStatusLabel = (invoice) => {
  const status = invoice.trangThai
  if (typeof status === 'number') {
    const labels = {
      0: 'Chờ thanh toán',
      1: 'Đã thanh toán',
      2: 'Đã hủy',
      3: 'Đang giao hàng',
      4: 'Hoàn thành',
    }
    return labels[status] || `Trạng thái ${status}`
  }
  const labels = {
    CHO_THANH_TOAN: 'Chờ thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    DA_HUY: 'Đã hủy',
    DANG_GIAO: 'Đang giao hàng',
    HOAN_THANH: 'Hoàn thành',
  }
  return labels[status] || status || 'Không xác định'
}

const getInvoiceStatusClass = (invoice) => {
  const status = invoice.trangThai
  if (typeof status === 'number') {
    const classes = {
      0: 'bg-warning text-dark',
      1: 'bg-info text-white',
      2: 'bg-danger text-white',
      3: 'bg-primary text-white',
      4: 'bg-success text-white',
    }
    return classes[status] || 'bg-secondary'
  }
  const classes = {
    CHO_THANH_TOAN: 'bg-warning text-dark',
    DA_THANH_TOAN: 'bg-info text-white',
    DA_HUY: 'bg-danger text-white',
    DANG_GIAO: 'bg-primary text-white',
    HOAN_THANH: 'bg-success text-white',
  }
  return classes[status] || 'bg-secondary'
}

// Tìm kiếm hóa đơn theo mã
const searchInvoiceByCode = async () => {
  if (!invoiceCode.value.trim()) {
    showError('Vui lòng nhập mã hóa đơn')
    return
  }

  invoiceError.value = ''
  loadingInvoiceDetail.value = true
  selectedInvoice.value = null

  try {
    // Tìm kiếm hóa đơn theo mã
    const response = await getHoaDons({
      page: 0,
      size: 10,
      keyword: invoiceCode.value.trim(),
    })

    const invoices = response.data?.content || []
    const foundInvoice = invoices.find((inv) => inv.ma === invoiceCode.value.trim())

    if (!foundInvoice) {
      invoiceError.value = 'Không tìm thấy hóa đơn với mã: ' + invoiceCode.value.trim()
      return
    }

    // Kiểm tra trạng thái hóa đơn (chỉ cho phép hóa đơn đã hoàn thành)
    const status = foundInvoice.trangThai
    const isCompleted = status === 4 || status === 'HOAN_THANH'

    if (!isCompleted) {
      invoiceError.value = 'Chỉ có thể tạo bảo hành cho hóa đơn đã hoàn thành'
      return
    }

    // Load chi tiết hóa đơn
    selectedInvoice.value = foundInvoice
    const detailResponse = await getHoaDonDetail(foundInvoice.id)
    invoiceDetail.value = detailResponse.data

    // Lấy danh sách sản phẩm
    invoiceProducts.value =
      invoiceDetail.value.chiTietList || invoiceDetail.value.hoaDonChiTiet || []

    // Lấy danh sách serial cho từng sản phẩm
    serialsMap.value = {}
    invoiceProducts.value.forEach((product) => {
      const serials = getSerialsForProductFromDetail(product)
      if (serials.length > 0) {
        serialsMap.value[product.id] = serials
      }
    })

    formData.value.idHoaDon = foundInvoice.id
    formData.value.idKhachHang =
      foundInvoice.khachHang?.id || foundInvoice.idKhachHang || foundInvoice.khachHang?.user_id
  } catch (error) {
    console.error('Error searching invoice:', error)
    invoiceError.value =
      error.response?.data?.message || 'Không thể tìm kiếm hóa đơn. Vui lòng thử lại.'
    showError('Không thể tìm kiếm hóa đơn')
  } finally {
    loadingInvoiceDetail.value = false
  }
}

const getSerialsForProductFromDetail = (product) => {
  const serials = []
  // Kiểm tra serialNumbers từ backend
  if (product.serialNumbers && Array.isArray(product.serialNumbers)) {
    product.serialNumbers.forEach((s) => {
      if (typeof s === 'string') {
        serials.push({ idSerialDaBan: null, serialNo: s, imei: s })
      } else if (s.idSerialDaBan) {
        serials.push({
          idSerialDaBan: s.idSerialDaBan,
          serialNo: s.serialNo || s.serialNumber,
          imei: s.imei,
        })
      }
    })
  }
  return serials
}

const getSerialsForProduct = (productId) => {
  return serialsMap.value[productId] || []
}

const onProductChange = () => {
  // Reset serial khi chọn sản phẩm khác
  formData.value.idSerialDaBan = null
}

const goToStep2 = () => {
  if (!selectedInvoice.value) {
    showError('Vui lòng tìm kiếm và chọn hóa đơn trước')
    return
  }
  if (invoiceProducts.value.length === 0) {
    showError('Hóa đơn này không có sản phẩm')
    return
  }
  step.value = 2
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    showError('Vui lòng điền đầy đủ thông tin bắt buộc')
    return
  }

  submitting.value = true
  try {
    const submitData = {
      ...formData.value,
      soLuong: formData.value.soLuong || 1,
      tinhTrangLucTra: formData.value.tinhTrangLucTra || 'Không xác định',
      lyDoTraHang: formData.value.lyDoTraHang || '',
    }

    await taoYeuCauBaoHanh(submitData)
    showSuccess('Tạo phiếu bảo hành thành công!')
    emit('created')
  } catch (error) {
    console.error('Error creating warranty:', error)
    showError(error.response?.data?.message || error.message || 'Không thể tạo phiếu bảo hành')
  } finally {
    submitting.value = false
  }
}

// Reset form khi component được mount lại (khi mở modal)
const resetForm = () => {
  step.value = 1
  invoiceCode.value = ''
  selectedInvoice.value = null
  invoiceDetail.value = null
  invoiceProducts.value = []
  serialsMap.value = {}
  invoiceError.value = ''
  formData.value = {
    idHoaDon: null,
    idKhachHang: null,
    idHoaDonChiTiet: null,
    idSerialDaBan: null,
    tinhTrangLucTra: 'Tốt',
    moTaTinhTrang: '',
    lyDoTraHang: '',
    soLuong: 1,
  }
}
</script>

<style scoped>
.step-content {
  min-height: 300px;
}

.table-responsive {
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.table th {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tbody tr {
  transition: background-color 0.2s;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table-active {
  background-color: #e7f3ff !important;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.65rem;
}
</style>
