<template>
    <div class="invoice-details card">
        <div class="card-header bg-dark text-white">
            <h6 class="mb-0">
                <i class="bi bi-receipt-cutoff"></i> Chi tiết hóa đơn
            </h6>
            <small v-if="hoaDon?.ma" class="text-light">{{ hoaDon.ma }}</small>
        </div>

        <div class="card-body p-0">
            <!-- Danh sách sản phẩm -->
            <div class="products-section">
                <div v-if="!hoaDon || !hoaDon.hoaDonChiTiet || hoaDon.hoaDonChiTiet.length === 0" 
                    class="empty-cart text-center py-4">
                    <i class="bi bi-cart-x" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="text-muted mt-2 mb-0">Chưa có sản phẩm</p>
                </div>

                <div v-else class="product-list">
                    <transition-group name="product-list" tag="div">
                        <div 
                            v-for="(item, index) in hoaDon.hoaDonChiTiet" 
                            :key="item.id" 
                            class="product-item"
                            :data-tooltip="getProductTooltip(item)"
                        >
                            <div class="item-number">{{ index + 1 }}</div>
                            
                            <!-- Ảnh sản phẩm -->
                            <div class="item-image">
                                <img 
                                    :src="getProductImage(item)" 
                                    :alt="item.tenSanPham"
                                    class="product-thumbnail"
                                    loading="lazy"
                                    @error="handleImageError"
                                />
                            </div>
                            
                            <div class="item-details">
                                <h6 class="item-name" :title="item.tenSanPham">{{ item.tenSanPham }}</h6>
                                <div class="item-code text-muted small">
                                    <code>{{ item.maChiTietSanPham }}</code>
                                </div>
                                <div class="item-quantity-price">
                                    <span class="quantity">{{ formatCurrency(item.donGia) }} × {{ item.soLuong }}</span>
                                </div>
                                <!-- Serial đã quét (nếu có) -->
                                <div v-if="getSerialsForItem(item)" class="item-serials mt-1">
                                    <small class="text-info">
                                        <i class="bi bi-upc-scan"></i> Serial:
                                        <span v-for="(serial, idx) in getSerialsForItem(item)" :key="idx" class="serial-badge">
                                            {{ serial }}
                                            <span v-if="idx < getSerialsForItem(item).length - 1">, </span>
                                        </span>
                                    </small>
                                </div>
                            </div>

                            <div class="item-total-action">
                                <!-- 
                                    TODO: Backend nên trả về thanhTien trong hoaDonChiTiet
                                    Hiện tại FE tính = donGia * soLuong (DB không có cột thanh_tien)
                                -->
                                <div class="item-total">{{ formatCurrency(item.thanhTien || (item.donGia * item.soLuong)) }}</div>
                                <div class="item-actions">
                                    <button 
                                        class="btn btn-sm btn-outline-primary" 
                                        @click="openEditQuantityModal(item)"
                                        title="Sửa số lượng (E)">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button 
                                        class="btn btn-sm btn-outline-danger" 
                                        @click="confirmDelete(item)"
                                        title="Xóa sản phẩm (Del)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </transition-group>
                </div>
            </div>
        </div>

        <!-- Phần tổng kết và khuyến mãi -->
        <div class="card-footer p-3">
            <!-- Tổng tiền hàng -->
            <div class="summary-row">
                <span>Tổng tiền hàng:</span>
                <span class="fw-bold">{{ formatCurrency(hoaDon?.tongTien || 0) }}</span>
            </div>

            <!-- Voucher/Giảm giá -->
            <div class="voucher-section mt-2">
                <label class="form-label small fw-semibold mb-1">
                    <i class="bi bi-ticket-perforated"></i> Khuyến mãi
                </label>
                
                <!-- Chưa có voucher -->
                <div v-if="!hoaDon?.idPhieuGiamGia" class="voucher-not-applied">
                    <button 
                        class="btn btn-outline-primary btn-sm w-100" 
                        @click="$emit('open-voucher-modal')">
                        <i class="bi bi-gift"></i> Chọn Khuyến Mãi
                    </button>
                </div>
                
                <!-- Đã có voucher -->
                <div v-else class="voucher-applied">
                    <div class="d-flex align-items-center justify-content-between p-2 bg-light rounded border border-success">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center mb-1">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                <strong class="text-success">{{ getVoucherName() }}</strong>
                            </div>
                            <small class="text-muted">
                                Giảm: <span class="fw-bold text-success">{{ formatCurrency(hoaDon.tienDuocGiam) }}</span>
                            </small>
                        </div>
                        <button 
                            class="btn btn-sm btn-outline-danger ms-2" 
                            @click="handleRemoveVoucher"
                            title="Xóa voucher">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Sử dụng điểm tích lũy -->
            <div v-if="hoaDon?.khachHang && hoaDon.khachHang.diemTichLuy > 0" class="points-section mt-2">
                <div class="form-check">
                    <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="usePoints"
                        v-model="usePoints" 
                        @change="toggleUsePoints" />
                    <label class="form-check-label small" for="usePoints">
                        <i class="bi bi-star-fill text-warning"></i>
                        Dùng <strong>{{ hoaDon.khachHang.diemTichLuy }}</strong> điểm 
                        (≈ {{ formatCurrency(pointsToMoney(hoaDon.khachHang.diemTichLuy)) }})
                    </label>
                </div>
            </div>

            <hr class="my-2" />

            <!-- Khách cần trả -->
            <div class="summary-row total-row">
                <span class="fw-bold">Khách cần trả:</span>
                <span class="total-amount">
                    {{ formatCurrency(hoaDon?.tongTienSauGiam || hoaDon?.tongTien || 0) }}
                </span>
            </div>
            
            <!-- Hiển thị điểm đã sử dụng (nếu có) -->
            <div v-if="hoaDon?.soDiemSuDung && hoaDon.soDiemSuDung > 0" class="summary-row mt-2">
                <span class="text-muted small">
                    <i class="bi bi-star-fill text-warning"></i> 
                    Đã sử dụng {{ hoaDon.soDiemSuDung }} điểm 
                    (≈ {{ formatCurrency(hoaDon.soTienQuyDoi || hoaDon.soDiemSuDung * 1000) }})
                </span>
            </div>
        </div>

        <!-- Các nút hành động -->
        <div class="card-footer p-3 bg-light">
            <button 
                class="btn btn-success btn-lg w-100 mb-2" 
                @click="$emit('complete-payment')"
                :disabled="!canPayment">
                <i class="bi bi-credit-card"></i> <strong>THANH TOÁN</strong>
            </button>

            <div class="row g-2 mb-2">
                <div class="col-6">
                    <button class="btn btn-sm btn-outline-secondary w-100" @click="$emit('save-draft')">
                        <i class="bi bi-save"></i> Lưu tạm
                    </button>
                </div>
                <div class="col-6">
                    <button class="btn btn-sm btn-outline-danger w-100" @click="$emit('cancel-bill')">
                        <i class="bi bi-x-circle"></i> Hủy đơn
                    </button>
                </div>
            </div>

            <!-- Nút in hóa đơn -->
            <div class="row g-2">
                <div class="col-12">
                    <InvoicePrint :hoaDon="hoaDon" :allowDraft="true" @printed="handleInvoicePrinted" />
                </div>
            </div>
        </div>
    </div>

    <!-- Modal sửa số lượng -->
    <div v-if="showEditQuantityModal" class="modal fade show d-block" style="z-index: 9999" @click.self="closeEditQuantityModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-pencil"></i> Sửa số lượng
                    </h5>
                    <button type="button" class="btn-close btn-close-white" @click="closeEditQuantityModal"></button>
                </div>
                <div class="modal-body">
                    <div v-if="editingItem" class="edit-quantity-form">
                        <div class="product-info mb-3">
                            <h6>{{ editingItem.tenSanPham }}</h6>
                            <p class="text-muted small mb-1">Mã: {{ editingItem.maChiTietSanPham }}</p>
                            <p class="text-muted small mb-0">Giá: {{ formatCurrency(editingItem.donGia) }}</p>
                        </div>
                        <hr>
                        <div class="form-group">
                            <label class="form-label">
                                Số lượng hiện tại: <strong>{{ editingItem.soLuong }}</strong>
                            </label>
                            <label class="form-label">
                                Tồn kho: <span :class="getStockClass(editingItem.soLuongTon)">
                                    {{ editingItem.soLuongTon }}
                                </span>
                            </label>
                            <div class="quantity-input-group mt-2">
                                <button 
                                    class="btn btn-outline-secondary" 
                                    @click="decreaseEditQuantity"
                                    :disabled="editQuantity <= 1 || isUpdating">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <input 
                                    type="number" 
                                    class="form-control text-center" 
                                    v-model.number="editQuantity"
                                    :max="editingItem.soLuongTon" 
                                    min="1" 
                                    @input="validateEditQuantity"
                                    :disabled="isUpdating" />
                                <button 
                                    class="btn btn-outline-secondary" 
                                    @click="increaseEditQuantity"
                                    :disabled="editQuantity >= editingItem.soLuongTon || isUpdating">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                            <small v-if="editQuantityError" class="text-danger">{{ editQuantityError }}</small>
                        </div>
                        <hr>
                        <div class="total-row">
                            <span class="label">Thành tiền:</span>
                            <span class="value total">{{ formatCurrency(editingItem.donGia * editQuantity) }}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeEditQuantityModal" :disabled="isUpdating">
                        <i class="bi bi-x-circle"></i> Hủy
                    </button>
                    <button 
                        type="button" 
                        class="btn btn-primary" 
                        @click="confirmUpdateQuantity"
                        :disabled="!canUpdateQuantity || isUpdating">
                        <span v-if="isUpdating" class="spinner-border spinner-border-sm me-1"></span>
                        <i v-else class="bi bi-check-circle"></i>
                        {{ isUpdating ? 'Đang cập nhật...' : 'Xác nhận' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showEditQuantityModal" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import InvoicePrint from './InvoicePrint.vue'
import { capNhatSoLuongSanPham } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/useToast'
import { validateQuantity } from '@/utils/validation'

const props = defineProps({
    hoaDon: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['delete-item', 'apply-voucher', 'use-points', 'complete-payment', 'save-draft', 'cancel-bill', 'open-voucher-modal', 'remove-voucher', 'update-item'])

const { success: showSuccess, error: showError } = useToast()

// State
const usePoints = ref(false)

// State cho sửa số lượng
const showEditQuantityModal = ref(false)
const editingItem = ref(null)
const editQuantity = ref(1)
const editQuantityError = ref('')
const isUpdating = ref(false)

// Computed
const canPayment = computed(() => {
    return props.hoaDon && 
           props.hoaDon.hoaDonChiTiet && 
           props.hoaDon.hoaDonChiTiet.length > 0
})

// Import composables
import { useConfirm } from '@/composables/useConfirm'

const { showConfirm } = useConfirm()

// Methods
const confirmDelete = async (item) => {
    const confirmed = await showConfirm({
        title: 'Xác nhận xóa sản phẩm',
        message: `Bạn có chắc chắn muốn xóa "${item.tenSanPham}" khỏi hóa đơn?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        type: 'warning'
    })
    
    if (confirmed) {
        emit('delete-item', item.id, item.tenSanPham)
    }
}

const handleRemoveVoucher = async () => {
    const confirmed = await showConfirm({
        title: 'Xác nhận xóa khuyến mãi',
        message: 'Bạn có chắc chắn muốn xóa khuyến mãi này khỏi hóa đơn?',
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        type: 'warning'
    })
    
    if (confirmed) {
        emit('remove-voucher')
    }
}

const getVoucherName = () => {
    // Lấy tên voucher từ hóa đơn (nếu có trong response)
    if (props.hoaDon?.phieuGiamGia?.tenPhieuGiamGia) {
        return props.hoaDon.phieuGiamGia.tenPhieuGiamGia
    }
    if (props.hoaDon?.phieuGiamGia?.ma) {
        return props.hoaDon.phieuGiamGia.ma
    }
    return 'Voucher đã áp dụng'
}

const toggleUsePoints = () => {
    if (usePoints.value) {
        const pointsValue = props.hoaDon?.khachHang?.diemTichLuy || 0
        emit('use-points', pointsValue)
    } else {
        emit('use-points', 0)
    }
}

const pointsToMoney = (points) => {
    // Quy đổi: 100 điểm = 10,000 VND (có thể điều chỉnh theo nghiệp vụ)
    return points * 100
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

// Methods cho sửa số lượng
const openEditQuantityModal = (item) => {
    editingItem.value = item
    editQuantity.value = item.soLuong
    editQuantityError.value = ''
    showEditQuantityModal.value = true
}

const closeEditQuantityModal = () => {
    showEditQuantityModal.value = false
    editingItem.value = null
    editQuantity.value = 1
    editQuantityError.value = ''
}

const increaseEditQuantity = () => {
    if (editQuantity.value < editingItem.value.soLuongTon) {
        editQuantity.value++
        validateEditQuantity()
    }
}

const decreaseEditQuantity = () => {
    if (editQuantity.value > 1) {
        editQuantity.value--
        validateEditQuantity()
    }
}

const validateEditQuantity = () => {
    editQuantityError.value = ''

    // Validate bằng utility function
    if (!validateQuantity(editQuantity.value)) {
        editQuantityError.value = 'Số lượng phải là số nguyên dương (1-9999)'
        return
    }

    if (editQuantity.value > editingItem.value.soLuongTon) {
        editQuantityError.value = `Số lượng không được vượt quá tồn kho (${editingItem.value.soLuongTon})`
        editQuantity.value = editingItem.value.soLuongTon
    }
}

const canUpdateQuantity = computed(() => {
    return editingItem.value &&
        editQuantity.value > 0 &&
        editQuantity.value <= editingItem.value.soLuongTon &&
        editQuantity.value !== editingItem.value.soLuong &&
        !editQuantityError.value
})

const confirmUpdateQuantity = async () => {
    if (!canUpdateQuantity.value || !editingItem.value) return

    isUpdating.value = true
    try {
        const response = await capNhatSoLuongSanPham(editingItem.value.id, {
            soLuong: editQuantity.value
        })

        if (response && response.data) {
            // Emit event để parent component cập nhật hóa đơn
            emit('update-item', response.data)
            showSuccess(`Đã cập nhật số lượng thành ${editQuantity.value}!`)
            closeEditQuantityModal()
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng:', error)
        showError(error.response?.data?.message || 'Không thể cập nhật số lượng. Vui lòng thử lại!')
    } finally {
        isUpdating.value = false
    }
}

const getStockClass = (stock) => {
    if (stock > 10) return 'text-success'
    if (stock > 0) return 'text-warning'
    return 'text-danger'
}

const handleInvoicePrinted = () => {
    // Có thể thêm logic sau khi in hóa đơn
    console.log('✅ Hóa đơn đã được in')
}

/**
 * Lấy ảnh sản phẩm từ item
 */
const getProductImage = (item) => {
    // Thử lấy từ chiTietSanPham.anhSanPhams
    if (item.chiTietSanPham?.anhSanPhams && item.chiTietSanPham.anhSanPhams.length > 0) {
        const defaultImage = item.chiTietSanPham.anhSanPhams.find(img => img.is_default)
        return defaultImage ? defaultImage.uri : item.chiTietSanPham.anhSanPhams[0].uri
    }
    
    // Thử lấy từ sanPham.anhSanPhams
    if (item.chiTietSanPham?.sanPham?.anhSanPhams && item.chiTietSanPham.sanPham.anhSanPhams.length > 0) {
        const defaultImage = item.chiTietSanPham.sanPham.anhSanPhams.find(img => img.is_default)
        return defaultImage ? defaultImage.uri : item.chiTietSanPham.sanPham.anhSanPhams[0].uri
    }
    
    // Fallback
    return 'https://via.placeholder.com/60x60?text=No+Image'
}

/**
 * Xử lý lỗi ảnh
 */
const handleImageError = (event) => {
    event.target.src = 'https://via.placeholder.com/60x60?text=No+Image'
}

/**
 * Lấy serial numbers cho item (nếu có)
 * 
 * TODO: Backend cần trả về serialNumbers trong hoaDonChiTiet khi load hóa đơn đã thanh toán
 * Serial được lưu trong bảng serial_da_ban với id_hoa_don_chi_tiet
 * 
 * @param {Object} item - hoa_don_chi_tiet item
 * @returns {Array|null} - Danh sách serial numbers hoặc null
 */
const getSerialsForItem = (item) => {
    // Kiểm tra xem item có serialNumbers không (từ backend)
    // Backend nên map từ bảng serial_da_ban khi load hóa đơn đã thanh toán
    if (item.serialNumbers && Array.isArray(item.serialNumbers) && item.serialNumbers.length > 0) {
        return item.serialNumbers.map(s => {
            // Hỗ trợ nhiều format: { serialNumber, serialNo, serial_no }
            return s.serialNumber || s.serialNo || s.serial_no || s
        })
    }
    
    // Fallback: Kiểm tra từ chiTietSanPham (nếu có)
    if (item.chiTietSanPham?.serials && Array.isArray(item.chiTietSanPham.serials)) {
        return item.chiTietSanPham.serials.map(s => s.serialNo || s.serialNumber || s)
    }
    
    return null
}

/**
 * Tạo tooltip text cho sản phẩm
 */
const getProductTooltip = (item) => {
    const parts = []
    parts.push(`Tên: ${item.tenSanPham}`)
    parts.push(`Mã: ${item.maChiTietSanPham}`)
    parts.push(`Giá: ${formatCurrency(item.donGia)}`)
    parts.push(`Số lượng: ${item.soLuong}`)
    parts.push(`Thành tiền: ${formatCurrency(item.thanhTien || (item.donGia * item.soLuong))}`)
    
    const serials = getSerialsForItem(item)
    if (serials && serials.length > 0) {
        parts.push(`Serial: ${serials.join(', ')}`)
    }
    
    return parts.join('\n')
}

/**
 * Keyboard shortcuts
 */
const handleKeyboardShortcut = (event) => {
    // Chỉ xử lý khi không đang focus vào input/textarea
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return
    }
    
    // E: Sửa số lượng sản phẩm đầu tiên
    if (event.key === 'e' && props.hoaDon?.hoaDonChiTiet?.length > 0) {
        event.preventDefault()
        openEditQuantityModal(props.hoaDon.hoaDonChiTiet[0])
        return
    }
    
    // Delete: Xóa sản phẩm đầu tiên
    if (event.key === 'Delete' && props.hoaDon?.hoaDonChiTiet?.length > 0) {
        event.preventDefault()
        confirmDelete(props.hoaDon.hoaDonChiTiet[0])
        return
    }
}

// Watch hoaDon để reset state khi chuyển hóa đơn
watch(() => props.hoaDon, () => {
    usePoints.value = false
    closeEditQuantityModal()
})

// Lifecycle
onMounted(() => {
    document.addEventListener('keydown', handleKeyboardShortcut)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyboardShortcut)
})
</script>

<style scoped>
.invoice-details {
    height: calc(100vh - 180px);
    display: flex;
    flex-direction: column;
}

.card-header small {
    display: block;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.products-section {
    max-height: 300px;
    overflow-y: auto;
}

.product-list {
    padding: 0.5rem;
}

.product-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    position: relative;
    cursor: default;
}

.product-item:hover {
    background-color: #f8f9fa;
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-item[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 10px;
    padding: 0.5rem 0.75rem;
    background: #212529;
    color: white;
    border-radius: 6px;
    font-size: 0.85rem;
    white-space: pre-line;
    z-index: 1000;
    min-width: 200px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
}

.item-image {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
}

.product-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #dee2e6;
}

.item-serials {
    margin-top: 0.25rem;
}

.serial-badge {
    font-family: monospace;
    font-size: 0.75rem;
    background: #e7f5ff;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    color: #0dcaf0;
}

/* Animation cho thêm/xóa sản phẩm */
.product-list-enter-active,
.product-list-leave-active {
    transition: all 0.3s ease;
}

.product-list-enter-from {
    opacity: 0;
    transform: translateX(-20px);
}

.product-list-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

.product-list-move {
    transition: transform 0.3s ease;
}

.product-item:last-child {
    border-bottom: none;
}

.item-number {
    width: 24px;
    height: 24px;
    background: #e9ecef;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
    flex-shrink: 0;
}

.item-details {
    flex: 1;
    min-width: 0;
}

.item-name {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #212529;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.item-code {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
}

.item-quantity-price {
    font-size: 0.85rem;
    color: #6c757d;
}

.item-total-action {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
}

.item-actions {
    display: flex;
    gap: 0.25rem;
}

.item-total {
    font-size: 1rem;
    font-weight: 700;
    color: #dc3545;
    white-space: nowrap;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.95rem;
}

.total-row {
    font-size: 1.1rem;
    padding-top: 0.75rem;
}

.total-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #198754;
}

.voucher-section,
.points-section {
    padding: 0.5rem 0;
}

.voucher-applied {
    display: flex;
    align-items: center;
}

.btn-success.btn-lg {
    padding: 0.75rem 1rem;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
}

.btn-success.btn-lg:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(25, 135, 84, 0.4);
}

.btn-success.btn-lg:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* Scrollbar styling */
.products-section::-webkit-scrollbar {
    width: 6px;
}

.products-section::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

.products-section::-webkit-scrollbar-thumb:hover {
    background: #999;
}

/* Responsive */
@media (max-width: 1024px) {
    .invoice-details {
        height: auto;
        max-height: calc(100vh - 200px);
    }
    
    .products-section {
        max-height: 250px;
    }
}

@media (max-width: 767.98px) {
    .invoice-details {
        height: auto;
    }
    
    .product-item {
        flex-wrap: wrap;
        padding: 0.5rem;
    }
    
    .item-image {
        width: 50px;
        height: 50px;
    }
    
    .item-number {
        width: 20px;
        height: 20px;
        font-size: 0.75rem;
    }
    
    .item-name {
        font-size: 0.85rem;
    }
    
    .item-total-action {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid #e9ecef;
    }
    
    .item-actions {
        gap: 0.25rem;
    }
    
    .item-actions .btn {
        min-width: 36px;
        min-height: 36px;
        padding: 0.25rem;
    }
    
    .card-footer {
        padding: 0.75rem !important;
    }
    
    .btn-lg {
        font-size: 1rem;
        padding: 0.75rem;
    }
    
    /* Tooltip không hiển thị trên mobile */
    .product-item[data-tooltip]:hover::after {
        display: none;
    }
}

@media (max-width: 575.98px) {
    .product-item {
        padding: 0.4rem;
    }
    
    .item-image {
        width: 40px;
        height: 40px;
    }
    
    .item-name {
        font-size: 0.8rem;
        -webkit-line-clamp: 1;
    }
    
    .item-code {
        font-size: 0.7rem;
    }
    
    .item-total {
        font-size: 0.9rem;
    }
}

/* Modal sửa số lượng */
.modal-backdrop {
    z-index: 9998;
}

.modal {
    z-index: 9999;
}

.quantity-input-group {
    display: flex;
    gap: 0.5rem;
}

.quantity-input-group input {
    flex: 1;
    font-size: 1.25rem;
    font-weight: 600;
}

.quantity-input-group button {
    width: 40px;
    padding: 0;
}
</style>

