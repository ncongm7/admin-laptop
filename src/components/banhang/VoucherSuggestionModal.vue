<template>
    <!-- Modal gợi ý voucher -->
    <div v-if="isVisible" class="modal fade show d-block" tabindex="-1" style="z-index: 9999;">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <!-- Header -->
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-ticket-perforated"></i> Chọn Khuyến Mãi
                    </h5>
                    <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
                </div>

                <!-- Body -->
                <div class="modal-body">
                    <!-- Loading -->
                    <div v-if="isLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Đang tải...</span>
                        </div>
                        <p class="mt-3 text-muted">Đang tìm kiếm khuyến mãi phù hợp...</p>
                    </div>

                    <!-- Không có voucher -->
                    <div v-else-if="!isLoading && vouchers.length === 0" class="text-center py-5">
                        <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
                        <p class="mt-3 text-muted">Không có khuyến mãi nào phù hợp với hóa đơn này</p>
                        <small class="text-muted">
                            Có thể do:<br />
                            - Chưa đủ điều kiện về giá trị đơn hàng<br />
                            - Voucher đã hết hạn hoặc hết lượt sử dụng
                        </small>
                    </div>

                    <!-- Danh sách voucher -->
                    <div v-else class="voucher-list">
                        <div v-for="voucher in vouchers" :key="voucher.id" class="voucher-card mb-3">
                            <div class="card border h-100" :class="getVoucherCardClass(voucher)">
                                <div class="card-body p-3">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <!-- Thông tin voucher -->
                                        <div class="flex-grow-1 me-3">
                                            <div class="d-flex align-items-center mb-2">
                                                <h6 class="mb-0 me-2">{{ voucher.tenPhieuGiamGia }}</h6>
                                                <span class="badge bg-warning text-dark">{{ voucher.ma }}</span>
                                            </div>
                                            
                                            <!-- Số tiền giảm -->
                                            <div class="voucher-discount mb-2">
                                                <span class="discount-amount text-success fw-bold fs-5">
                                                    -{{ formatCurrency(voucher.tienGiamDuKien) }}
                                                </span>
                                                <small class="text-muted ms-2">
                                                    {{ getDiscountTypeText(voucher) }}
                                                </small>
                                            </div>
                                            
                                            <!-- Điều kiện -->
                                            <div class="voucher-conditions">
                                                <small class="text-muted d-block mb-1">
                                                    <i class="bi bi-info-circle"></i>
                                                    <strong>Điều kiện:</strong>
                                                    {{ getConditionText(voucher) }}
                                                </small>
                                                
                                                <small class="text-muted d-block mb-1" v-if="voucher.ngayKetThuc">
                                                    <i class="bi bi-calendar-x"></i>
                                                    <strong>Hết hạn:</strong>
                                                    {{ formatDate(voucher.ngayKetThuc) }}
                                                </small>
                                                
                                                <small class="text-muted d-block" v-if="voucher.soLuongDung !== null">
                                                    <i class="bi bi-box"></i>
                                                    <strong>Còn lại:</strong>
                                                    {{ voucher.soLuongDung }} lượt
                                                </small>
                                            </div>
                                            
                                            <!-- Mô tả -->
                                            <p v-if="voucher.moTa" class="text-muted small mt-2 mb-0">
                                                {{ voucher.moTa }}
                                            </p>
                                        </div>
                                        
                                        <!-- Nút áp dụng -->
                                        <div class="flex-shrink-0">
                                            <button 
                                                class="btn btn-success"
                                                @click="handleApplyVoucher(voucher)"
                                                :disabled="isApplying">
                                                <i class="bi bi-check-circle"></i>
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="isApplying">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Backdrop -->
    <div v-if="isVisible" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { layGoiYVoucher } from '@/service/banHangService'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    idHoaDon: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['close', 'voucher-selected'])

// State
const isVisible = ref(false)
const isLoading = ref(false)
const isApplying = ref(false)
const vouchers = ref([])

// Watch visible prop
watch(() => props.visible, (newVal) => {
    isVisible.value = newVal
    if (newVal && props.idHoaDon) {
        loadVoucherSuggestions()
    }
})

// Watch idHoaDon - reload khi đổi hóa đơn
watch(() => props.idHoaDon, (newId) => {
    if (isVisible.value && newId) {
        loadVoucherSuggestions()
    }
})

// Methods
const loadVoucherSuggestions = async () => {
    if (!props.idHoaDon) {
        console.warn('⚠️ [VoucherSuggestionModal] Không có ID hóa đơn')
        return
    }

    isLoading.value = true
    vouchers.value = []

    try {
        console.log('🔍 [VoucherSuggestionModal] Đang tải gợi ý voucher cho hóa đơn:', props.idHoaDon)
        const response = await layGoiYVoucher(props.idHoaDon)
        
        // Parse response - có thể là { data: [...] } hoặc trực tiếp [...]
        const vouchersData = response?.data || response || []
        vouchers.value = Array.isArray(vouchersData) ? vouchersData : []
        
        console.log('✅ [VoucherSuggestionModal] Đã tải', vouchers.value.length, 'voucher')
    } catch (error) {
        console.error('❌ [VoucherSuggestionModal] Lỗi khi tải gợi ý voucher:', error)
        // Toast sẽ được hiển thị từ parent component
    } finally {
        isLoading.value = false
    }
}

// Import composables
import { useConfirm } from '@/composables/useConfirm'

const { showConfirm } = useConfirm()

const handleApplyVoucher = async (voucher) => {
    if (isApplying.value) return

    const confirmed = await showConfirm({
        title: 'Xác nhận áp dụng voucher',
        message: `Bạn có chắc chắn muốn áp dụng voucher "${voucher.tenPhieuGiamGia}"?\n\nGiảm: ${formatCurrency(voucher.tienGiamDuKien)}`,
        confirmText: 'Áp dụng',
        cancelText: 'Hủy',
        type: 'info'
    })
    
    if (!confirmed) return

    isApplying.value = true
    try {
        // Emit event để parent component xử lý
        emit('voucher-selected', voucher)
    } catch (error) {
        console.error('❌ [VoucherSuggestionModal] Lỗi khi áp dụng voucher:', error)
    } finally {
        isApplying.value = false
    }
}

const closeModal = () => {
    if (isApplying.value) return
    emit('close')
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    } catch (error) {
        return dateString
    }
}

const getDiscountTypeText = (voucher) => {
    if (voucher.loaiPhieuGiamGia === 0) {
        // Phần trăm
        const percent = voucher.giaTriGiamGia ? voucher.giaTriGiamGia.toFixed(0) : '0'
        return `Giảm ${percent}%`
    } else {
        // Tiền mặt
        return `Giảm ${formatCurrency(voucher.giaTriGiamGia)}`
    }
}

const getConditionText = (voucher) => {
    if (voucher.hoaDonToiThieu && voucher.hoaDonToiThieu > 0) {
        return `Cho đơn từ ${formatCurrency(voucher.hoaDonToiThieu)}`
    }
    return 'Không có điều kiện'
}

const getVoucherCardClass = (voucher) => {
    // Highlight voucher có giá trị cao
    if (voucher.tienGiamDuKien > 100000) {
        return 'border-success border-2'
    }
    return ''
}
</script>

<style scoped>
.modal {
    z-index: 9999;
}

.modal-backdrop {
    z-index: 9998;
}

.voucher-list {
    max-height: 500px;
    overflow-y: auto;
}

.voucher-card {
    transition: transform 0.2s, box-shadow 0.2s;
}

.voucher-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.voucher-discount {
    display: flex;
    align-items: baseline;
}

.discount-amount {
    font-size: 1.25rem;
    font-weight: 700;
}

.voucher-conditions {
    font-size: 0.85rem;
}

.voucher-conditions i {
    margin-right: 0.25rem;
}

.card.border-success {
    background: linear-gradient(to right, #ffffff 0%, #f0fff4 100%);
}
</style>

