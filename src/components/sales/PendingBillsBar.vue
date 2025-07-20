<template>
    <div class="pending-bills-bar d-flex align-items-center gap-2 mb-3">
        <div class="pending-title me-2">
            <i class="bi bi-cart3"></i> Hóa đơn chờ
        </div>
        <div class="pending-bill-card" v-for="bill in bills" :key="bill.id"
            :class="{ active: bill.id === selectedBillId }" @click="selectBill(bill)"
            :title="'Khách: ' + (bill.customer?.tenKhachHang || '---') + ' | Tổng: ' + formatCurrency(bill.total)">
            <i class="bi bi-cart3"></i>
            <span class="badge bg-primary bill-badge">{{ bill.items.length }}</span>
        </div>
        <div v-if="bills.length === 0" class="text-muted ms-2">Không có hóa đơn chờ</div>

        <!-- Popup chi tiết hóa đơn chờ -->
        <div v-if="showPopup && popupBill" class="pending-popup shadow rounded">
            <div class="popup-header d-flex justify-content-between align-items-center">
                <span><i class="bi bi-cart3"></i> Hóa đơn #{{ popupBill.id }}</span>
                <button class="btn btn-sm btn-outline-secondary" @click="showPopup = false"><i
                        class="bi bi-x"></i></button>
            </div>
            <div class="popup-body">
                <div><b>Khách:</b> {{ popupBill.customer?.tenKhachHang || '---' }}</div>
                <div><b>Tổng tiền:</b> {{ formatCurrency(popupBill.total) }}</div>
                <div><b>Số sản phẩm:</b> {{ popupBill.items.length }}</div>
                <ul class="list-unstyled mt-2">
                    <li v-for="item in popupBill.items" :key="item.productId">
                        {{ item.productName }} x{{ item.quantity }}
                    </li>
                </ul>
            </div>
            <div class="popup-footer text-end">
                <button class="btn btn-primary btn-sm" @click="selectBill(popupBill, true)"><i
                        class="bi bi-arrow-bar-right"></i> Chọn hóa đơn này</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    bills: Array,
    selectedBillId: [String, Number]
})
const emit = defineEmits(['select-bill'])

const showPopup = ref(false)
const popupBill = ref(null)

function selectBill(bill, fromPopup = false) {
    emit('select-bill', bill)
    if (!fromPopup) {
        popupBill.value = bill
        showPopup.value = true
    } else {
        showPopup.value = false
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}
</script>

<style scoped>
.pending-bills-bar {
    background: #f4f8fb;
    border-radius: 12px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    min-height: 48px;
    position: relative;
}

.pending-title {
    font-weight: 600;
    color: #1976d2;
    font-size: 1.1em;
}

.pending-bill-card {
    background: #fff;
    border: 2px solid #e3e8ee;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    padding: 6px 14px 6px 10px;
    cursor: pointer;
    position: relative;
    transition: border 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.pending-bill-card.active {
    border: 2px solid #1976d2;
    background: #e3f0fa;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}

.bill-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 0.85em;
}

.pending-popup {
    position: absolute;
    top: 56px;
    left: 0;
    min-width: 260px;
    background: #fff;
    z-index: 100;
    border: 1px solid #e3e8ee;
    border-radius: 10px;
    padding: 0;
    animation: fadeIn 0.2s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.popup-header {
    padding: 8px 12px;
    border-bottom: 1px solid #e3e8ee;
    background: #f4f8fb;
    border-radius: 10px 10px 0 0;
}

.popup-body {
    padding: 12px;
}

.popup-footer {
    padding: 8px 12px;
    border-top: 1px solid #e3e8ee;
    background: #f4f8fb;
    border-radius: 0 0 10px 10px;
}
</style>