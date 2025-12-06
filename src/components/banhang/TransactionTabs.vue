<template>
    <div class="transaction-tabs card mb-3">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
                <i class="bi bi-layers"></i> Hóa đơn chờ
                <span class="badge bg-light text-dark ms-2">{{ pendingBills.length }}</span>
            </h6>
            <button class="btn btn-sm btn-light" @click="$emit('create-new')" :disabled="pendingBills.length >= 10">
                <i class="bi bi-plus"></i>
            </button>
        </div>

        <div class="card-body p-2" style="position: relative;">
            <!-- Danh sách hóa đơn chờ -->
            <div v-if="pendingBills.length > 0" class="bills-list">
                <div v-for="(bill, index) in pendingBills" :key="bill.id" class="bill-tab"
                    :class="{ active: bill.id === selectedBillId }" @click="$emit('select-bill', bill)">
                    <div class="bill-info">
                        <div class="bill-number">
                            <i class="bi bi-receipt"></i>
                            <span>Hóa đơn {{ index + 1 }}</span>
                            <span v-if="bill.isDraft" class="badge bg-warning text-dark ms-2"
                                style="font-size: 0.7rem;">
                                Draft
                            </span>
                        </div>
                        <div class="bill-code">{{ bill.ma || 'Đang tạo...' }}</div>
                        <div class="bill-total">
                            {{ formatCurrency(bill.tongTienSauGiam || bill.tongTien || 0) }}
                        </div>
                        <div class="bill-items-count text-muted small">
                            <i class="bi bi-cart3"></i> {{ getBillItemsCount(bill) }} sản phẩm
                        </div>
                    </div>
                    <div class="bill-actions">
                        <button class="btn-copy-bill" @click.stop="confirmCopy(bill)" title="Copy hóa đơn"
                            :disabled="isCopying || getBillItemsCount(bill) === 0" v-if="getBillItemsCount(bill) > 0">
                            <span v-if="isCopying && copyingBillId === bill.id"
                                class="spinner-border spinner-border-sm me-1"></span>
                            <i v-else class="bi bi-files"></i>
                        </button>
                        <button class="btn-close-bill" @click.stop="confirmRemove(bill)" title="Xóa hóa đơn">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Trống -->
            <div v-else class="empty-bills text-center py-3">
                <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted small mb-0 mt-2">Chưa có hóa đơn nào</p>
            </div>

            <!-- Cảnh báo giới hạn -->
            <div v-if="pendingBills.length >= 10" class="alert alert-warning alert-sm mt-2 mb-0" role="alert">
                <i class="bi bi-exclamation-triangle"></i> Tối đa 10 hóa đơn chờ
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConfirm } from '@/composables/useConfirm'

const props = defineProps({
    bills: {
        type: Array,
        default: () => []
    },
    selectedBillId: {
        type: String,
        default: null
    },
    isCopying: {
        type: Boolean,
        default: false
    },
    copyingBillId: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['select-bill', 'remove-bill', 'create-new', 'copy-bill'])

const { showConfirm } = useConfirm()

/**
 * Filter bills to only show pending invoices (chưa thanh toán)
 * Đảm bảo không hiển thị hóa đơn đã thanh toán, đang giao, hoàn thành
 */
const pendingBills = computed(() => {
    return props.bills.filter(bill => {
        // Lọc ra các hóa đơn chưa thanh toán
        const trangThai = bill.trangThai
        const trangThaiThanhToan = bill.trangThaiThanhToan

        // Nếu có trangThai, kiểm tra trạng thái
        if (trangThai) {
            // Chỉ hiển thị hóa đơn chờ thanh toán
            return trangThai === 'CHO_THANH_TOAN' || trangThai === 'CHO'
        }

        // Fallback: dựa vào trangThaiThanhToan
        return trangThaiThanhToan === 0 || trangThaiThanhToan === undefined || trangThaiThanhToan === null
    })
})

const getBillItemsCount = (bill) => {
    return bill.hoaDonChiTiet?.length || 0
}

const confirmRemove = async (bill) => {
    const itemsCount = getBillItemsCount(bill)
    if (itemsCount > 0) {
        const confirmed = await showConfirm({
            title: 'Xác nhận xóa hóa đơn',
            message: `Hóa đơn này có ${itemsCount} sản phẩm. Bạn có chắc chắn muốn xóa?`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            type: 'warning'
        })

        if (confirmed) {
            emit('remove-bill', bill.id)
        }
    } else {
        emit('remove-bill', bill.id)
    }
}

const confirmCopy = async (bill) => {
    const itemsCount = getBillItemsCount(bill)
    if (itemsCount === 0) {
        return
    }

    const confirmed = await showConfirm({
        title: 'Copy hóa đơn',
        message: `Bạn có muốn copy hóa đơn này (${itemsCount} sản phẩm) thành hóa đơn mới?`,
        confirmText: 'Copy',
        cancelText: 'Hủy',
        type: 'info'
    })

    if (confirmed) {
        emit('copy-bill', bill)
    }
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}
</script>

<style scoped>
.transaction-tabs {
    height: fit-content;
}

/* Đảm bảo header luôn có thể click được */
.transaction-tabs .card-header {
    pointer-events: auto;
    z-index: 1;
}

.bills-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 12rem;
    /* Hiển thị khoảng 2 hóa đơn */
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 0.25rem;
    /* Thêm khoảng trống cho scrollbar */
    position: relative;
    /* Đảm bảo không ảnh hưởng đến các phần khác */
    pointer-events: auto;
    /* Đảm bảo có thể click vào các phần tử bên trong */
}

/* Tùy chỉnh scrollbar cho đẹp hơn */
.bills-list::-webkit-scrollbar {
    width: 6px;
}

.bills-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.bills-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.bills-list::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.bill-tab {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.bill-tab:hover {
    background: #e9ecef;
    border-color: #dee2e6;
}

.bill-tab.active {
    background: #d1ecf1;
    border-color: #0dcaf0;
    box-shadow: 0 2px 8px rgba(13, 202, 240, 0.2);
}

.bill-info {
    flex: 1;
}

.bill-number {
    font-weight: 600;
    font-size: 0.95rem;
    color: #212529;
    margin-bottom: 0.25rem;
}

.bill-number i {
    margin-right: 0.25rem;
}

.bill-code {
    font-size: 0.85rem;
    color: #6c757d;
    font-family: monospace;
}

.bill-total {
    font-size: 1rem;
    font-weight: 700;
    color: #dc3545;
    margin-top: 0.25rem;
}

.bill-items-count {
    font-size: 0.8rem;
    margin-top: 0.25rem;
}

.bill-actions {
    display: flex;
    gap: 0.25rem;
    align-items: center;
}

.btn-copy-bill {
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(13, 202, 240, 0.1);
    color: #0dcaf0;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-copy-bill:hover:not(:disabled) {
    background: #0dcaf0;
    color: white;
}

.btn-copy-bill:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-close-bill {
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-close-bill:hover {
    background: #dc3545;
    color: white;
}

.empty-bills {
    padding: 2rem 1rem;
}

.alert-sm {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
}

/* Draft badge */
.is-draft {
    border-left: 3px solid #ffc107;
}

.is-draft .tab-title {
    position: relative;
}

/* Responsive */
@media (max-width: 1024px) {
    .bills-list {
        max-height: 10rem;
    }
}

@media (max-width: 991px) {
    .bills-list {
        flex-direction: row;
        overflow-x: auto;
        overflow-y: hidden;
        max-height: none;
        padding-bottom: 0.5rem;
    }

    .bill-tab {
        min-width: 200px;
    }
}

@media (max-width: 767.98px) {
    .transaction-tabs {
        margin-bottom: 1rem;
    }

    .card-header {
        padding: 0.75rem;
    }

    .card-header h6 {
        font-size: 0.9rem;
    }

    .bills-list {
        gap: 0.5rem;
    }

    .bill-tab {
        min-width: 180px;
        padding: 0.6rem;
    }

    .bill-number {
        font-size: 0.85rem;
    }

    .bill-code {
        font-size: 0.75rem;
    }

    .bill-total {
        font-size: 0.9rem;
    }

    .bill-items-count {
        font-size: 0.75rem;
    }

    .bill-actions {
        gap: 0.2rem;
    }

    .btn-copy-bill,
    .btn-close-bill {
        width: 24px;
        height: 24px;
        font-size: 0.75rem;
    }
}

@media (max-width: 575.98px) {
    .bill-tab {
        min-width: 160px;
        padding: 0.5rem;
    }

    .bill-number {
        font-size: 0.8rem;
    }

    .bill-total {
        font-size: 0.85rem;
    }
}
</style>
