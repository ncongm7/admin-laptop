<template>
    <!-- Backdrop -->
    <div class="modal-backdrop fade show"></div>

    <!-- Modal -->
    <div class="modal fade show d-block" tabindex="-1" aria-hidden="true" style="z-index: 9999;">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-credit-card"></i> Thanh toán
                    </h5>
                    <button type="button" class="btn-close btn-close-white" @click="close"
                        :disabled="isProcessing"></button>
                </div>

                <div class="modal-body">
                    <!-- Preview hóa đơn -->
                    <div class="invoice-preview-section mb-4 p-3 bg-light rounded border">
                        <h6 class="mb-3">
                            <i class="bi bi-file-text"></i> Xem trước hóa đơn
                        </h6>
                        <div class="row g-2">
                            <div class="col-6">
                                <small class="text-muted">Mã hóa đơn:</small>
                                <div class="fw-bold">{{ hoaDon?.ma || 'N/A' }}</div>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Khách hàng:</small>
                                <div class="fw-bold">{{ hoaDon?.khachHang?.hoTen || 'Khách lẻ' }}</div>
                            </div>
                            <div class="col-12">
                                <small class="text-muted">Sản phẩm:</small>
                                <div class="preview-products">
                                    <div
                                        v-for="item in hoaDon?.hoaDonChiTiet || []"
                                        :key="item.id"
                                        class="preview-product-item"
                                    >
                                        <span>{{ item.tenSanPham }}</span>
                                        <span class="text-muted">× {{ item.soLuong }}</span>
                                        <!-- TODO: Backend nên trả về thanhTien, nếu không FE tính = donGia * soLuong -->
                                        <span class="fw-bold">{{ formatCurrency(item.thanhTien || (item.donGia * item.soLuong)) }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 mt-2 pt-2 border-top">
                                <div class="d-flex justify-content-between">
                                    <span class="fw-bold">Tổng cần trả:</span>
                                    <span class="fw-bold text-danger fs-5">{{ formatCurrency(tongTien) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-4">
                        <!-- CỘT 1: Thông tin thanh toán -->
                        <div class="col-md-5">
                            <!-- Thông tin hóa đơn -->
                            <div class="invoice-summary">
                                <h6 class="mb-3"><i class="bi bi-file-text"></i> Thông tin hóa đơn</h6>
                                <div class="summary-row">
                                    <span>Mã hóa đơn:</span>
                                    <strong>{{ hoaDon?.ma || 'N/A' }}</strong>
                                </div>
                                <div class="summary-row">
                                    <span>Tổng tiền:</span>
                                    <strong class="text-danger fs-5">
                                        {{ formatCurrency(tongTien) }}
                                    </strong>
                                </div>
                            </div>

                            <hr />

                            <!-- Chọn phương thức thanh toán -->
                            <div class="mb-3">
                                <label class="form-label fw-semibold">
                                    Phương thức thanh toán <span class="text-danger">*</span>
                                </label>

                                <!-- Cảnh báo khi không có phương thức thanh toán -->
                                <div v-if="paymentMethods.length === 0" class="alert alert-warning mb-2">
                                    <i class="bi bi-exclamation-triangle"></i>
                                    <strong>Chưa có phương thức thanh toán!</strong>
                                    <br>
                                    Vui lòng chạy file <code>SQL_INSERT_PHUONG_THUC_THANH_TOAN.sql</code> trong thư mục
                                    backend.
                                </div>

                                <select class="form-select" v-model="formData.idPhuongThucThanhToan"
                                    :disabled="isProcessing || paymentMethods.length === 0">
                                    <option value="">-- Chọn phương thức --</option>
                                    <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                                        {{ method.tenPhuongThuc }}
                                    </option>
                                </select>
                            </div>

                            <!-- Số tiền khách đưa (chỉ hiện với tiền mặt) -->
                            <div v-if="isTienMat" class="mb-3">
                                <label class="form-label fw-semibold">
                                    Số tiền khách đưa
                                </label>
                                <input
                                type="number"
                                class="form-control"
                                v-model.number="tienKhachDua"
                                :min="tongTien"
                                :max="tongTien * 10"
                                :step="1000"
                                placeholder="Nhập số tiền khách đưa"
                                :disabled="isProcessing"
                                @blur="validateTienKhachDua"
                            />
                                <div v-if="tienThua > 0" class="mt-2">
                                    <span class="text-success fw-bold">
                                        Tiền thừa trả khách: {{ formatCurrency(tienThua) }}
                                    </span>
                                </div>
                                <div v-if="tienKhachDua > 0 && tienThua < 0" class="mt-2">
                                    <span class="text-danger">
                                        Số tiền chưa đủ: {{ formatCurrency(Math.abs(tienThua)) }}
                                    </span>
                                </div>
                            </div>

                            <!-- Mã giao dịch (cho chuyển khoản/thẻ) -->
                            <div v-if="!isTienMat && formData.idPhuongThucThanhToan"
                                class="mb-3">
                                <label class="form-label fw-semibold">Mã giao dịch</label>
                                <input type="text" class="form-control" v-model="formData.maGiaoDich"
                                    placeholder="Nhập mã giao dịch (nếu có)" :disabled="isProcessing" />
                            </div>

                            <!-- Ghi chú -->
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Ghi chú</label>
                                <textarea class="form-control" rows="2" v-model="formData.ghiChu"
                                    placeholder="Ghi chú thanh toán (nếu có)" :disabled="isProcessing"></textarea>
                            </div>
                        </div>

                        <!-- CỘT 2: Quét Serial Number (YÊU CẦU QUAN TRỌNG) -->
                        <div class="col-md-7">
                            <div class="serial-section">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="mb-0">
                                        <i class="bi bi-upc-scan text-warning"></i>
                                        Quét Serial/IMEI sản phẩm
                                        <span class="badge bg-danger ms-2">Bắt buộc</span>
                                    </h6>
                                    <button class="btn btn-sm btn-outline-primary" @click="openCameraScanner"
                                        :disabled="isProcessing">
                                        <i class="bi bi-camera"></i>
                                        Bật quét
                                    </button>
                                </div>

                                <!-- Progress bar -->
                                <div class="mb-3">
                                    <div class="progress" style="height: 25px;">
                                        <div class="progress-bar" :class="{
                                            'bg-success': daQuetDu,
                                            'bg-warning': !daQuetDu && progress > 0,
                                            'bg-secondary': progress === 0
                                        }" :style="{ width: progress + '%' }" role="progressbar">
                                            {{ soLuongDaQuet }} / {{ tongSoLuongCanQuet }} Serial
                                        </div>
                                    </div>
                                    <small class="text-muted">
                                        {{ daQuetDu ? '✅ Đã quét đủ serial' : '⚠️ Cần quét serial cho tất cả sản phẩm'
                                        }}
                                    </small>
                                </div>

                                <!-- Danh sách sản phẩm cần quét serial -->
                                <div class="product-serial-list">
                                    <div v-for="product in danhSachSanPhamCanQuet" :key="product.id"
                                        class="product-serial-item mb-3" :class="{
                                            'completed': product.hoanThanh,
                                            'active': currentProduct?.id === product.id
                                        }">
                                        <div class="product-header">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div class="flex-grow-1">
                                                    <h6 class="mb-1">
                                                        {{ getProductName(product) }}
                                                    </h6>
                                                    <small class="text-muted d-block">
                                                        Mã: {{ getProductCode(product) }}
                                                    </small>
                                                    <small class="text-info d-block" v-if="product.idChiTietSanPham">
                                                        <i class="bi bi-box"></i> ID: {{
                                                            product.idChiTietSanPham.substring(0, 8) }}...
                                                    </small>
                                                </div>
                                                <div class="text-end">
                                                    <span class="badge" :class="{
                                                        'bg-success': product.hoanThanh,
                                                        'bg-warning': !product.hoanThanh && product.soLuongDaQuet > 0,
                                                        'bg-secondary': product.soLuongDaQuet === 0
                                                    }">
                                                        {{ product.soLuongDaQuet }} / {{ product.soLuongCanQuet }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Input quét serial cho sản phẩm này -->
                                        <div v-if="!product.hoanThanh" class="serial-input-group mt-2">
                                            <div class="serial-status-indicator mb-2">
                                                <span
                                                    class="badge"
                                                    :class="{
                                                        'bg-success': product.soLuongDaQuet > 0 && product.soLuongDaQuet < product.soLuongCanQuet,
                                                        'bg-warning': product.soLuongDaQuet === 0,
                                                        'bg-info': currentProduct?.id === product.id
                                                    }"
                                                >
                                                    <i class="bi" :class="{
                                                        'bi-check-circle': product.soLuongDaQuet > 0,
                                                        'bi-hourglass-split': product.soLuongDaQuet === 0,
                                                        'bi-cursor': currentProduct?.id === product.id
                                                    }"></i>
                                                    {{ getProductSerialStatusText(product) }}
                                                </span>
                                            </div>
                                            <div class="input-group">
                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    v-model="currentSerialInput"
                                                    @keyup.enter="scanSerial(product)"
                                                    @focus="handleSerialInputFocus(product)"
                                                    @blur="handleSerialInputBlur"
                                                    :placeholder="`Quét/nhập Serial ${product.soLuongDaQuet + 1}/${product.soLuongCanQuet}...`"
                                                    :disabled="isLoading || isProcessing"
                                                    :class="{
                                                        'is-valid': scanSuccess[product.id],
                                                        'is-invalid': scanError[product.id]
                                                    }"
                                                    ref="serialInputs" />
                                                <button class="btn btn-outline-secondary"
                                                    @click="loadAvailableSerials(product)"
                                                    :disabled="isLoadingSerials || isProcessing"
                                                    title="Xem danh sách serial khả dụng">
                                                    <span v-if="isLoadingSerials"
                                                        class="spinner-border spinner-border-sm"></span>
                                                    <i v-else class="bi bi-list-ul"></i>
                                                </button>
                                                <button class="btn btn-primary" @click="scanSerial(product)"
                                                    :disabled="!currentSerialInput || isLoading || isProcessing">
                                                    <span v-if="isLoading && currentProduct?.id === product.id"
                                                        class="spinner-border spinner-border-sm"></span>
                                                    <i v-else class="bi bi-check-circle"></i>
                                                    Xác nhận
                                                </button>
                                            </div>
                                            <!-- Thông báo trạng thái -->
                                            <div v-if="scanSuccess[product.id]" class="alert alert-success alert-sm mt-2 mb-0">
                                                <i class="bi bi-check-circle-fill"></i> Quét thành công!
                                            </div>
                                            <div v-if="scanError[product.id]" class="alert alert-danger alert-sm mt-2 mb-0">
                                                <i class="bi bi-exclamation-triangle-fill"></i> {{ scanError[product.id] }}
                                            </div>

                                            <!-- Dropdown danh sách serial khả dụng -->
                                            <div v-if="showSerialDropdown[product.id] && availableSerials[product.id]?.length > 0"
                                                class="serial-dropdown mt-2">
                                                <div class="dropdown-header">
                                                    <strong>Chọn serial khả dụng ({{ availableSerials[product.id].length
                                                        }})</strong>
                                                    <button class="btn-close-dropdown"
                                                        @click="showSerialDropdown[product.id] = false">
                                                        <i class="bi bi-x"></i>
                                                    </button>
                                                </div>
                                                <div class="serial-list">
                                                    <div v-for="serial in availableSerials[product.id]" :key="serial.id"
                                                        class="serial-item"
                                                        @click="selectSerialFromDropdown(product, serial)">
                                                        <i class="bi bi-upc-scan"></i>
                                                        <span class="serial-number">{{ getSerialDisplay(serial)
                                                            }}</span>
                                                        <span class="badge" :class="{
                                                            'bg-success': serial.trangThai === 1, // 1 = Trong kho (khả dụng)
                                                            'bg-warning': serial.trangThai === 2, // 2 = Đã bán
                                                            'bg-danger': serial.trangThai === 0    // 0 = Hỏng
                                                        }">
                                                            {{ getSerialStatusText(serial.trangThai) }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <small
                                                v-if="showSerialDropdown[product.id] && availableSerials[product.id]?.length === 0"
                                                class="text-warning d-block mt-2">
                                                <i class="bi bi-exclamation-triangle"></i> Không có serial khả dụng
                                            </small>

                                            <small v-if="errorMessage && currentProduct?.id === product.id"
                                                class="text-danger">
                                                {{ errorMessage }}
                                            </small>
                                        </div>

                                        <!-- Danh sách serial đã quét cho sản phẩm này -->
                                        <div v-if="product.soLuongDaQuet > 0" class="scanned-serials mt-2">
                                            <div v-for="serial in getSerialsByProduct(product.id)"
                                                :key="serial.serialNumber" class="scanned-serial-item">
                                                <i class="bi bi-check-circle text-success"></i>
                                                <span>{{ serial.serialNumber }}</span>
                                                <button class="btn btn-sm btn-link text-danger p-0"
                                                    @click="xoaSerial(serial.serialNumber)" :disabled="isProcessing">
                                                    <i class="bi bi-x-circle"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Không có sản phẩm -->
                                    <div v-if="danhSachSanPhamCanQuet.length === 0" class="text-center text-muted py-4">
                                        <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                                        <p class="mb-0">Không có sản phẩm nào trong hóa đơn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close" :disabled="isProcessing">
                        <i class="bi bi-x-circle"></i> Hủy
                    </button>
                    <button type="button" class="btn btn-success" @click="handlePayment"
                        :disabled="!canPay || isProcessing">
                        <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-check-circle"></i>
                        {{ isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Camera Scanner Modal -->
    <div v-if="showCameraScanner" class="camera-scanner-modal">
        <div class="camera-header">
            <h6 class="mb-0"><i class="bi bi-camera"></i> Quét IMEI/Serial</h6>
            <button class="btn btn-sm btn-danger" @click="closeCameraScanner">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
        <div class="camera-container">
            <StreamQrcodeBarcodeReader @decode="onBarcodeDetected" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { StreamQrcodeBarcodeReader } from 'vue3-barcode-qrcode-reader'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { useSerialValidation } from '@/composables/useSerialValidation'
import { layDanhSachPhuongThucThanhToan, layDanhSachSerialKhaDung } from '@/service/banhang/banHangService'
import { validateSerialNumber, sanitizeInput, validatePrice } from '@/utils/validation'

const props = defineProps({
    hoaDon: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'payment-confirmed'])

const paymentMethods = ref([])
const formData = ref({
    idPhuongThucThanhToan: '',
    soTienThanhToan: 0,
    ghiChu: '',
    maGiaoDich: ''
})
const tienKhachDua = ref(0)
const isProcessing = ref(false)
const serialInputs = ref([])
const showCameraScanner = ref(false)
const availableSerials = ref({})
const showSerialDropdown = ref({})
const isLoadingSerials = ref(false)

// State - Scan feedback
const scanSuccess = ref({})
const scanError = ref({})

// ==================== SERIAL VALIDATION ====================
// Normalize hoaDon trước khi truyền vào useSerialValidation
const hoaDonRef = computed(() => {
    if (!props.hoaDon) return null

    // Đảm bảo hoaDonChiTiet được normalize
    const normalizedHoaDon = {
        ...props.hoaDon,
        hoaDonChiTiet: props.hoaDon.hoaDonChiTiet || props.hoaDon.chiTietList || [],
    }

    // Debug: Log để kiểm tra cấu trúc dữ liệu
    if (normalizedHoaDon.hoaDonChiTiet && normalizedHoaDon.hoaDonChiTiet.length > 0) {
        console.log('📋 [ModalThanhToan] Hóa đơn có', normalizedHoaDon.hoaDonChiTiet.length, 'sản phẩm')
        console.log('📋 [ModalThanhToan] Sản phẩm đầu tiên:', normalizedHoaDon.hoaDonChiTiet[0])
        console.log('📋 [ModalThanhToan] Fields của sản phẩm:', Object.keys(normalizedHoaDon.hoaDonChiTiet[0]))
    }

    return normalizedHoaDon
})

const {
    isLoading,
    validatedSerials,
    currentSerialInput,
    currentProduct,
    errorMessage,
    // scanMode, // TODO: Có thể dùng trong tương lai cho chế độ quét camera tự động
    tongSoLuongCanQuet,
    soLuongDaQuet,
    daQuetDu,
    progress,
    danhSachSanPhamCanQuet,
    xacThucMotSerial,
    xoaSerial: xoaSerialComposable,
    resetSerials,
    getSerialPayload,
    // toggleScanMode // TODO: Có thể dùng trong tương lai
} = useSerialValidation(hoaDonRef)

// Computed
const tongTien = computed(() => {
    return props.hoaDon?.tongTienSauGiam || props.hoaDon?.tongTien || 0
})

const selectedMethodName = computed(() => {
    const method = paymentMethods.value.find(m => m.id === formData.value.idPhuongThucThanhToan)
    return method?.tenPhuongThuc || ''
})

// Helper: Kiểm tra xem có phải thanh toán tiền mặt không (linh hoạt với dấu)
const isTienMat = computed(() => {
    const methodName = selectedMethodName.value.toLowerCase()
    // Kiểm tra nhiều cách viết: "tiền mặt", "tien mat", "cash", v.v.
    return methodName.includes('tiền mặt') ||
           methodName.includes('tien mat') ||
           methodName.includes('cash') ||
           methodName.includes('ti?n m?t') // Trường hợp có dấu bị lỗi encoding
})

const tienThua = computed(() => {
    if (isTienMat.value) {
        return tienKhachDua.value - tongTien.value
    }
    return 0
})

const canPay = computed(() => {
    // Phải chọn phương thức thanh toán
    if (!formData.value.idPhuongThucThanhToan) return false

    // Phải quét đủ serial (YÊU CẦU QUAN TRỌNG)
    if (!daQuetDu.value) return false

    // Nếu là tiền mặt, phải đủ tiền
    if (isTienMat.value) {
        return tienKhachDua.value >= tongTien.value
    }

    return true
})

// Methods
const loadPaymentMethods = async () => {
    try {
        const response = await layDanhSachPhuongThucThanhToan()
        // Response đã được parse trong service, trực tiếp là array
        paymentMethods.value = Array.isArray(response) ? response : []

        if (paymentMethods.value.length === 0) {
            console.warn('⚠️ Không có phương thức thanh toán nào. Vui lòng chạy script SQL để thêm dữ liệu!')
        }
    } catch (error) {
        console.error('❌ Lỗi khi tải phương thức thanh toán:', error)
        paymentMethods.value = []
    }
}

const loadAvailableSerials = async (product) => {
    // Normalize idChiTietSanPham - có thể là idChiTietSanPham, idCtsp, hoặc chiTietSanPham.id
    const idChiTietSanPham = product.idChiTietSanPham || product.idCtsp || product.chiTietSanPham?.id || product.chiTietSanPhamId

    if (!idChiTietSanPham) {
        console.warn('⚠️ Sản phẩm không có idChiTietSanPham:', product)
        console.warn('   Các field có sẵn:', Object.keys(product))
        return
    }

    // Nếu đã load rồi thì không load lại
    if (availableSerials.value[product.id]) {
        showSerialDropdown.value[product.id] = true
        return
    }

    isLoadingSerials.value = true
    try {
        const serials = await layDanhSachSerialKhaDung(idChiTietSanPham)

        console.log('📦 Raw serials từ API:', serials)

        // Debug: Log serial đầu tiên để xem cấu trúc
        if (serials && serials.length > 0) {
            console.log('🔍 Serial đầu tiên (để debug):', serials[0])
            console.log('🔍 Fields của serial:', Object.keys(serials[0]))
            console.log('🔍 trangThai của serial đầu tiên:', serials[0].trangThai, serials[0].trang_thai, serials[0].status)
        }

        // Lọc ra các serial còn trong kho (trangThai = 1: Chưa bán / Trong kho)
        // Theo backend: 1 = Chưa bán (Trong kho), 2 = Đã bán, 0 = Hỏng
        // Normalize: có thể là trangThai, trang_thai, hoặc status
        const khaDung = serials.filter(s => {
            const trangThai = s.trangThai !== undefined ? s.trangThai : (s.trang_thai !== undefined ? s.trang_thai : s.status)
            // Serial khả dụng = trangThai === 1 (Chưa bán / Trong kho)
            return trangThai === 1
        })

        availableSerials.value[product.id] = khaDung
        showSerialDropdown.value[product.id] = true

        console.log('✅ Đã load', khaDung.length, 'serial khả dụng cho sản phẩm:', product.tenSanPham)

        // Debug: Log serial đầu tiên để kiểm tra cấu trúc
        if (khaDung.length > 0) {
            console.log('🔍 Serial đầu tiên:', khaDung[0])
        }
    } catch (error) {
        console.error('❌ Lỗi khi load serial:', error)
        availableSerials.value[product.id] = []
    } finally {
        isLoadingSerials.value = false
    }
}

const selectSerialFromDropdown = async (product, serial) => {
    const serialNumber = getSerialDisplay(serial)
    currentSerialInput.value = serialNumber
    showSerialDropdown.value[product.id] = false

    // Tự động scan serial đã chọn
    await scanSerial(product)
}

/**
 * Phát âm thanh khi quét thành công
 */
const playSuccessSound = () => {
    try {
        // Tạo âm thanh beep đơn giản
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800 // Tần số cao
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
        console.warn('Không thể phát âm thanh:', error)
    }
}

/**
 * Xử lý focus vào input serial
 */
const handleSerialInputFocus = (product) => {
    currentProduct.value = product
    loadAvailableSerials(product)
    // Reset trạng thái
    scanSuccess.value[product.id] = false
    scanError.value[product.id] = null
}

/**
 * Xử lý blur khỏi input serial
 */
const handleSerialInputBlur = () => {
    // Giữ lại currentProduct để biết đang quét cho sản phẩm nào
}

/**
 * Lấy text trạng thái quét serial cho sản phẩm
 */
const getProductSerialStatusText = (product) => {
    if (product.hoanThanh) {
        return 'Hoàn thành'
    }
    if (product.soLuongDaQuet > 0) {
        return `Đã quét ${product.soLuongDaQuet}/${product.soLuongCanQuet}`
    }
    if (currentProduct.value?.id === product.id) {
        return 'Đang quét...'
    }
    return 'Chưa quét'
}

const scanSerial = async (product) => {
    if (!currentSerialInput.value || !currentSerialInput.value.trim()) {
        errorMessage.value = 'Vui lòng nhập Serial Number'
        scanError.value[product.id] = 'Vui lòng nhập Serial Number'
        return
    }

    // Sanitize và validate serial
    const sanitizedSerial = sanitizeInput(currentSerialInput.value.trim())
    if (!validateSerialNumber(sanitizedSerial)) {
        errorMessage.value = 'Serial Number không hợp lệ! (7-20 ký tự, chữ và số)'
        scanError.value[product.id] = 'Serial Number không hợp lệ!'
        return
    }

    // Reset trạng thái
    scanSuccess.value[product.id] = false
    scanError.value[product.id] = null

    const success = await xacThucMotSerial(sanitizedSerial, product)

    if (success) {
        // Hiển thị thành công
        scanSuccess.value[product.id] = true
        scanError.value[product.id] = null

        // Phát âm thanh
        playSuccessSound()

        currentSerialInput.value = ''
        errorMessage.value = ''

        // Tự động focus vào input serial tiếp theo
        await nextTick()
        focusNextSerialInput(product)

        // Ẩn thông báo thành công sau 2 giây
        setTimeout(() => {
            scanSuccess.value[product.id] = false
        }, 2000)
    } else {
        scanError.value[product.id] = errorMessage.value || 'Serial không hợp lệ'
    }
}

/**
 * Focus vào input serial tiếp theo
 */
const focusNextSerialInput = (currentProduct) => {
    if (!serialInputs.value || serialInputs.value.length === 0) return

    // Tìm sản phẩm tiếp theo cần quét
    const currentIndex = danhSachSanPhamCanQuet.value.findIndex(p => p.id === currentProduct.id)

    // Nếu sản phẩm hiện tại chưa quét đủ, focus lại
    if (!currentProduct.hoanThanh) {
        const inputIndex = danhSachSanPhamCanQuet.value
            .slice(0, currentIndex + 1)
            .filter(p => !p.hoanThanh)
            .length - 1

        if (inputIndex >= 0 && serialInputs.value[inputIndex]) {
            setTimeout(() => {
                serialInputs.value[inputIndex].focus()
            }, 100)
        }
    } else {
        // Tìm sản phẩm tiếp theo chưa quét đủ
        const nextProduct = danhSachSanPhamCanQuet.value.find((p, idx) =>
            idx > currentIndex && !p.hoanThanh
        )

        if (nextProduct) {
            const nextIndex = danhSachSanPhamCanQuet.value
                .slice(0, danhSachSanPhamCanQuet.value.indexOf(nextProduct) + 1)
                .filter(p => !p.hoanThanh)
                .length - 1

            if (nextIndex >= 0 && serialInputs.value[nextIndex]) {
                setTimeout(() => {
                    serialInputs.value[nextIndex].focus()
                }, 100)
            }
        }
    }
}

const { showConfirm } = useConfirm()
const { error: showError, warning: showWarning } = useToast()

const xoaSerial = async (serialNumber) => {
    const confirmed = await showConfirm({
        title: 'Xác nhận xóa serial',
        message: `Bạn có chắc chắn muốn xóa serial "${serialNumber}"?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        type: 'warning'
    })

    if (confirmed) {
        xoaSerialComposable(serialNumber)
    }
}

const getSerialsByProduct = (productId) => {
    return validatedSerials.value.filter(s => s.idHoaDonChiTiet === productId)
}

/**
 * Validate tiền khách đưa
 */
const validateTienKhachDua = () => {
    if (isTienMat.value && tienKhachDua.value) {
        if (!validatePrice(tienKhachDua.value)) {
            showError('Số tiền không hợp lệ!')
            tienKhachDua.value = tongTien.value
            return
        }
        if (tienKhachDua.value < tongTien.value) {
            showWarning('Số tiền khách đưa chưa đủ!')
        }
        if (tienKhachDua.value > tongTien.value * 10) {
            showWarning('Số tiền quá lớn, vui lòng kiểm tra lại!')
            tienKhachDua.value = tongTien.value
        }
    }
}

const handlePayment = async () => {
    if (!canPay.value) {
        showWarning('Vui lòng kiểm tra lại thông tin thanh toán và đảm bảo đã quét đủ serial!')
        return
    }

    // Validate thêm trước khi thanh toán
    if (isTienMat.value) {
        if (!validatePrice(tienKhachDua.value) || tienKhachDua.value < tongTien.value) {
            showError('Số tiền khách đưa không hợp lệ hoặc chưa đủ!')
            return
        }
    }

    isProcessing.value = true

    try {
        const payloadData = {
            ...formData.value,
            soTienThanhToan: tongTien.value,
            serialNumbers: getSerialPayload() // QUAN TRỌNG: Gửi kèm serial numbers
        }

        // Sanitize ghi chú và mã giao dịch
        if (payloadData.ghiChu) {
            payloadData.ghiChu = sanitizeInput(payloadData.ghiChu)
        }
        if (payloadData.maGiaoDich) {
            payloadData.maGiaoDich = sanitizeInput(payloadData.maGiaoDich)
        }

        // Nếu là tiền mặt, lưu thêm thông tin tiền khách đưa và tiền trả lại
        if (isTienMat.value) {
            payloadData.tienKhachDua = tienKhachDua.value
            payloadData.tienTraLai = tienThua.value // tienThua = tienKhachDua - tongTien (số tiền trả lại)
        }

        console.log('💰 Payload thanh toán:', payloadData)

        emit('payment-confirmed', payloadData)
    } catch (error) {
        console.error('Lỗi trong quá trình thanh toán:', error)
        showError('Có lỗi xảy ra. Vui lòng thử lại!')
    } finally {
        isProcessing.value = false
    }
}

const close = async () => {
    if (!isProcessing.value) {
        if (soLuongDaQuet.value > 0) {
            const confirmed = await showConfirm({
                title: 'Xác nhận đóng',
                message: 'Bạn đã quét một số serial. Đóng cửa sổ sẽ mất dữ liệu. Bạn có chắc chắn muốn tiếp tục?',
                confirmText: 'Đóng',
                cancelText: 'Hủy',
                type: 'warning'
            })

            if (!confirmed) return
        }
        resetSerials()
        emit('close')
    }
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

// Helper methods để hiển thị thông tin sản phẩm
const getProductName = (product) => {
    // Thử nhiều field có thể có
    return product.tenSanPham ||
        product.tenSP ||
        product.chiTietSanPham?.tenSP ||
        product.chiTietSanPham?.sanPham?.tenSanPham ||
        'Sản phẩm không tên'
}

const getProductCode = (product) => {
    // Thử nhiều field có thể có
    return product.maCTSP ||
        product.maCtsp ||
        product.chiTietSanPham?.maCTSP ||
        product.chiTietSanPham?.maCtsp ||
        'N/A'
}

// Helper methods để hiển thị serial
const getSerialDisplay = (serial) => {
    // Backend entity Serial có field: serialNo
    return serial.serialNo || serial.soSerial || serial.serialNumber || 'N/A'
}

const getSerialStatusText = (trangThai) => {
    // Theo backend: 1 = Chưa bán (Trong kho), 2 = Đã bán, 0 = Hỏng
    switch (trangThai) {
        case 1:
            return 'Trong kho' // Khả dụng
        case 2:
            return 'Đã bán'
        case 0:
            return 'Hỏng'
        default:
            return 'Không xác định'
    }
}

// Camera Scanner functions
const openCameraScanner = () => {
    showCameraScanner.value = true
}

const closeCameraScanner = () => {
    showCameraScanner.value = false
}

const onBarcodeDetected = async (result) => {
    console.log('📷 Mã vạch đã quét:', result)

    // Close camera UI
    showCameraScanner.value = false

    // Set the scanned code to current input
    if (currentProduct.value) {
        currentSerialInput.value = result
        // Automatically scan the serial
        await scanSerial(currentProduct.value)
    } else {
        // No product selected, just set the input
        currentSerialInput.value = result
    }
}

// Lifecycle
onMounted(() => {
    loadPaymentMethods()

    // Tự động set số tiền khách đưa bằng tổng tiền (tiện lợi hơn)
    if (tongTien.value > 0) {
        tienKhachDua.value = tongTien.value
    }

    // Debug: Log cấu trúc hóa đơn để kiểm tra
    console.log('🧾 Hóa đơn:', props.hoaDon)
    console.log('📦 Danh sách sản phẩm cần quét:', danhSachSanPhamCanQuet.value)

    // Log chi tiết từng sản phẩm
    if (danhSachSanPhamCanQuet.value.length > 0) {
        console.log('📋 Chi tiết sản phẩm đầu tiên:', danhSachSanPhamCanQuet.value[0])
    }
})
</script>

<style scoped>
/* Fix z-index để modal không bị backdrop che và không bị sidebar/menu che */
.modal-backdrop {
    opacity: 0.5;
    z-index: 9998 !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal {
    z-index: 9999 !important;
}

.modal-dialog {
    position: relative;
    z-index: 1;
}

.modal-content {
    position: relative;
    z-index: 1;
}

.invoice-summary {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

.form-label {
    margin-bottom: 0.5rem;
    color: #495057;
}

.btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}

/* Serial Section Styles */
.serial-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    min-height: 400px;
}

.product-serial-list {
    max-height: 400px;
    overflow-y: auto;
}

.product-serial-item {
    background-color: white;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s;
}

.product-serial-item.completed {
    border-color: #28a745;
    background-color: #f0fff4;
}

.product-serial-item.active {
    border-color: #0dcaf0;
    box-shadow: 0 0 10px rgba(13, 202, 240, 0.3);
}

.product-header h6 {
    margin: 0;
    font-size: 0.95rem;
    color: #212529;
}

.serial-input-group {
    margin-top: 0.75rem;
}

.scanned-serials {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #dee2e6;
}

.scanned-serial-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
}

.scanned-serial-item i.bi-check-circle {
    flex-shrink: 0;
}

.scanned-serial-item span {
    flex: 1;
    font-family: 'Courier New', monospace;
    font-weight: 500;
}

.btn.active {
    background-color: #ffc107;
    border-color: #ffc107;
    color: #000;
}

/* Progress bar */
.progress {
    border-radius: 12px;
    overflow: hidden;
}

.progress-bar {
    transition: width 0.3s ease;
    font-weight: 600;
    font-size: 0.9rem;
}

/* Serial Dropdown Styles */
.serial-dropdown {
    position: relative;
    background: white;
    border: 2px solid #0dcaf0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-height: 300px;
    overflow: hidden;
    animation: slideDown 0.2s ease;
    z-index: 100;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    font-size: 0.9rem;
}

.btn-close-dropdown {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    font-size: 1.2rem;
    transition: color 0.2s;
}

.btn-close-dropdown:hover {
    color: #dc3545;
}

.serial-list {
    max-height: 250px;
    overflow-y: auto;
    padding: 0.5rem;
}

.serial-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.serial-item:hover {
    background: #e7f5ff;
    border-color: #0dcaf0;
    transform: translateX(4px);
}

.serial-item i {
    color: #0dcaf0;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.serial-item .serial-number {
    flex: 1;
    font-family: 'Courier New', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    color: #212529;
}

.serial-item .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}

/* Scrollbar cho serial list */
.serial-list::-webkit-scrollbar {
    width: 6px;
}

.serial-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.serial-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.serial-list::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Invoice Preview */
.invoice-preview-section {
    max-height: 300px;
    overflow-y: auto;
}

.preview-products {
    max-height: 150px;
    overflow-y: auto;
}

.preview-product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    font-size: 0.9rem;
    border-bottom: 1px solid #e9ecef;
}

.preview-product-item:last-child {
    border-bottom: none;
}

.alert-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    margin-bottom: 0;
}

.serial-status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.serial-status-indicator .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}

/* Camera Scanner Modal Styles */
.camera-scanner-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.camera-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.camera-header h6 {
    color: white;
    margin: 0;
}

.camera-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 2rem;
}

/* StreamBarcodeReader styles */
.camera-container :deep(video) {
    width: 100% !important;
    max-width: 600px;
    height: auto !important;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Responsive */
@media (max-width: 991.98px) {
    .modal-xl {
        max-width: 95%;
    }

    .modal-body .row {
        flex-direction: column;
    }

    .modal-body .col-md-5,
    .modal-body .col-md-7 {
        width: 100%;
        margin-bottom: 1.5rem;
    }

    .invoice-preview-section {
        max-height: 200px;
    }

    .serial-section {
        min-height: auto;
    }

    .product-serial-list {
        max-height: 300px;
    }
}

@media (max-width: 767.98px) {
    .modal-dialog {
        margin: 0.5rem;
    }

    .modal-xl {
        max-width: calc(100% - 1rem);
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 0.75rem;
    }

    .invoice-preview-section {
        padding: 0.75rem !important;
        max-height: 180px;
    }

    .preview-product-item {
        font-size: 0.8rem;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .product-serial-item {
        padding: 0.75rem;
    }

    .product-header h6 {
        font-size: 0.9rem;
    }

    .serial-input-group .input-group {
        flex-wrap: wrap;
    }

    .serial-input-group .form-control {
        min-height: 44px;
        font-size: 16px;
        margin-bottom: 0.5rem;
    }

    .serial-input-group .btn {
        min-height: 44px;
        flex: 1;
        margin-bottom: 0.5rem;
    }

    .serial-dropdown {
        max-height: 200px;
    }

    .camera-container {
        padding: 1rem;
    }

    .camera-container :deep(video) {
        max-width: 100%;
    }
}

@media (max-width: 575.98px) {
    .modal-dialog {
        margin: 0.25rem;
    }

    .modal-xl {
        max-width: calc(100% - 0.5rem);
    }

    .invoice-preview-section {
        max-height: 150px;
        padding: 0.5rem !important;
    }

    .preview-products {
        max-height: 100px;
    }

    .product-serial-list {
        max-height: 250px;
    }

    .product-serial-item {
        padding: 0.5rem;
    }

    .serial-status-indicator .badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.4rem;
    }
}
</style>
