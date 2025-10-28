<template>
    <div class="transaction-tabs card mb-3">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
                <i class="bi bi-layers"></i> Hóa đơn chờ
                <span class="badge bg-light text-dark ms-2">{{ bills.length }}</span>
            </h6>
            <button class="btn btn-sm btn-light" @click="$emit('create-new')" :disabled="bills.length >= 10">
                <i class="bi bi-plus"></i>
            </button>
        </div>

        <div class="card-body p-2">
            <!-- Danh sách hóa đơn chờ -->
            <div v-if="bills.length > 0" class="bills-list">
                <div v-for="(bill, index) in bills" :key="bill.id" 
                    class="bill-tab" 
                    :class="{ active: bill.id === selectedBillId }"
                    @click="$emit('select-bill', bill)">
                    <div class="bill-info">
                        <div class="bill-number">
                            <i class="bi bi-receipt"></i>
                            <span>Hóa đơn {{ index + 1 }}</span>
                        </div>
                        <div class="bill-code">{{ bill.ma || 'Đang tạo...' }}</div>
                        <div class="bill-total">
                            {{ formatCurrency(bill.tongTienSauGiam || bill.tongTien || 0) }}
                        </div>
                        <div class="bill-items-count text-muted small">
                            <i class="bi bi-cart3"></i> {{ getBillItemsCount(bill) }} sản phẩm
                        </div>
                    </div>
                    <button class="btn-close-bill" @click.stop="confirmRemove(bill)" title="Xóa hóa đơn">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>

            <!-- Trống -->
            <div v-else class="empty-bills text-center py-3">
                <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted small mb-0 mt-2">Chưa có hóa đơn nào</p>
            </div>

            <!-- Cảnh báo giới hạn -->
            <div v-if="bills.length >= 10" class="alert alert-warning alert-sm mt-2 mb-0" role="alert">
                <i class="bi bi-exclamation-triangle"></i> Tối đa 10 hóa đơn chờ
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    bills: {
        type: Array,
        default: () => []
    },
    selectedBillId: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['select-bill', 'remove-bill', 'create-new'])

const getBillItemsCount = (bill) => {
    return bill.hoaDonChiTiet?.length || 0
}

const confirmRemove = (bill) => {
    const itemsCount = getBillItemsCount(bill)
    if (itemsCount > 0) {
        if (confirm(`Hóa đơn này có ${itemsCount} sản phẩm. Bạn có chắc muốn xóa?`)) {
            emit('remove-bill', bill.id)
        }
    } else {
        emit('remove-bill', bill.id)
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

.bills-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

/* Responsive */
@media (max-width: 991px) {
    .bills-list {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 0.5rem;
    }

    .bill-tab {
        min-width: 200px;
    }
}
</style>

