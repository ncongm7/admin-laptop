<template>
    <div class="pending-bills-container">
        <div class="pending-bills-bar" :class="{ 'is-empty': bills.length === 0 }">
            <div class="bar-title">
                <i class="bi bi-clock-history"></i>
                <span>Hóa đơn chờ</span>
            </div>
            <div class="bills-wrapper">
                <div v-if="bills.length === 0" class="empty-state">
                    Không có giao dịch nào đang chờ
                </div>
                <div v-else class="bill-chip" v-for="bill in bills" :key="bill.id"
                    :class="{ active: bill.id === selectedBillId }"
                    :title="'Khách: ' + (bill.customer?.tenKhachHang || 'Vãng lai') + ' | Tổng: ' + formatCurrency(bill.total)">
                    <div class="chip-content" @click="selectBill(bill)">
                        <i class="bi bi-receipt-cutoff chip-icon"></i>
                        <span class="chip-label">{{ getBillLabel(bill) }}</span>
                    </div>
                    <button class="chip-close-btn" @click.stop="removeBill(bill.id)" title="Xóa hóa đơn chờ">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    bills: Array,
    selectedBillId: [String, Number]
})
const emit = defineEmits(['select-bill', 'remove-bill'])

function selectBill(bill) {
    emit('select-bill', bill)
}

function removeBill(billId) {
    if (confirm('Bạn có chắc muốn xóa hóa đơn chờ này?')) {
        emit('remove-bill', billId)
    }
}

function getBillLabel(bill) {
    if (bill.customer?.tenKhachHang) {
        return bill.customer.tenKhachHang;
    }
    return `HĐ #${String(bill.id).slice(-4)}`;
}

function formatCurrency(amount = 0) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
</script>

<style scoped>
.pending-bills-container {
    padding: 0 1.5rem;
    margin-top: 0.75rem;
}

.pending-bills-bar {
    background: #e9ecef;
    border-radius: 12px;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 52px;
    transition: background-color 0.3s ease;
}

.pending-bills-bar.is-empty {
    background: #f8f9fa;
}

.bar-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #495057;
    padding: 0 0.5rem;
    white-space: nowrap;
}

.bills-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow-x: auto;
    flex-grow: 1;
    padding-bottom: 2px;
    /* for scrollbar */
}

.empty-state {
    font-style: italic;
    color: #6c757d;
    font-size: 0.9rem;
}

.bill-chip {
    display: flex;
    align-items: center;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 20px;
    padding: 0.25rem 0.25rem 0.25rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.bill-chip:hover {
    border-color: #86b7fe;
    background-color: #f8f9fa;
}

.bill-chip.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    box-shadow: 0 2px 4px rgba(13, 110, 253, 0.2);
}

.bill-chip.active .chip-icon {
    color: white;
}

.chip-content {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.chip-icon {
    color: #6c757d;
}

.chip-close-btn {
    background: #e9ecef;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    margin-left: 0.5rem;
    color: #6c757d;
    transition: all 0.2s ease;
}

.chip-close-btn:hover {
    background: #dc3545;
    color: white;
}

.bill-chip.active .chip-close-btn {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
}

.bill-chip.active .chip-close-btn:hover {
    background-color: rgba(255, 255, 255, 0.4);
}
</style>