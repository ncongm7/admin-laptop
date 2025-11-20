<template>
    <!-- Backdrop -->
    <div class="modal-backdrop fade show"></div>
    
    <!-- Modal -->
    <div class="modal fade show d-block" tabindex="-1" style="z-index: 9999;">
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
                    <SkeletonLoader type="card" :lines="8" :line-widths="['100%', '80%', '100%', '60%', '100%', '90%', '100%', '70%']" />
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
                                                    <span :class="['badge', getStatusBadgeClass(hoaDon.trangThai)]">
                                                        {{ getTrangThaiLabel(hoaDon.trangThai) }}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="text-muted">Thanh toán:</td>
                                                <td>
                                                    <span :class="['badge', hoaDon.trangThaiThanhToan === 1 ? 'bg-success' : 'bg-warning']">
                                                        {{ hoaDon.trangThaiThanhToan === 1 ? 'Đã thanh toán' : 'Chưa thanh toán' }}
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
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in hoaDon.chiTietList || hoaDon.hoaDonChiTiet || []" :key="item.id">
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
                                                        {{ serial }}<span v-if="idx < getSerialsForItem(item).length - 1">, </span>
                                                    </span>
                                                </small>
                                            </div>
                                        </td>
                                        <td class="text-center">{{ item.soLuong || 0 }}</td>
                                        <td class="text-end">{{ formatCurrency(item.donGia) }}</td>
                                        <td class="text-end fw-semibold text-danger">{{ formatCurrency(item.thanhTien || (item.donGia * item.soLuong)) }}</td>
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
                                        <td><small class="text-muted">{{ tt.maGiaoDich || 'N/A' }}</small></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="col-md-6">
                            <h6 class="fw-bold mb-3">
                                <i class="bi bi-calculator text-danger"></i> Tổng kết
                            </h6>
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
                    <button type="button" class="btn btn-info text-white" @click="openSendEmail">
                        <i class="bi bi-envelope"></i> Gửi email
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHoaDonDetail } from '@/service/hoaDonService'
import { inHoaDon } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/useToast'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import SendEmailModal from './SendEmailModal.vue'

const props = defineProps({
    idHoaDon: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['close'])

const hoaDon = ref(null)
const loading = ref(false)
const error = ref(null)

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
        currency: 'VND'
    }).format(value || 0)
}

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const getTrangThaiLabel = (trangThai) => {
    const labels = {
        'CHO_THANH_TOAN': 'Chờ thanh toán',
        'CHO_XAC_NHAN': 'Chờ xác nhận',
        'DA_XAC_NHAN': 'Đã xác nhận',
        'DANG_GIAO': 'Đang giao hàng',
        'HOAN_THANH': 'Hoàn thành',
        'DA_HUY': 'Đã hủy'
    }
    return labels[trangThai] || trangThai
}

const getStatusBadgeClass = (trangThai) => {
    const classes = {
        'CHO_THANH_TOAN': 'bg-secondary',
        'CHO_XAC_NHAN': 'bg-warning',
        'DA_XAC_NHAN': 'bg-info',
        'DANG_GIAO': 'bg-primary',
        'HOAN_THANH': 'bg-success',
        'DA_HUY': 'bg-danger'
    }
    return classes[trangThai] || 'bg-secondary'
}

/**
 * Lấy mã CTSP từ item
 */
const getCTSPCode = (item) => {
    return item.maCtsp || 
           item.maCTSP || 
           item.maChiTietSanPham || 
           item.chiTietSanPham?.maCTSP || 
           item.chiTietSanPham?.maCtsp || 
           'N/A'
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
 */
const getSerialsForItem = (item) => {
    // Kiểm tra từ backend response
    if (item.serialNumbers && Array.isArray(item.serialNumbers) && item.serialNumbers.length > 0) {
        return item.serialNumbers.map(s => {
            return s.serialNumber || s.serialNo || s.serial_no || s
        })
    }
    
    // Kiểm tra từ chiTietSanPham
    if (item.chiTietSanPham?.serials && Array.isArray(item.chiTietSanPham.serials)) {
        return item.chiTietSanPham.serials.map(s => s.serialNo || s.serialNumber || s)
    }
    
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

.table td, .table th {
    vertical-align: middle;
}

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
</style>

