<template>
    <div class="cashflow-card">
        <div class="header">
            <h3>💸 Dòng Tiền (Cash Flow)</h3>
            <div class="badge">Live Status</div>
        </div>

        <div class="flow-container">
            <!-- Input: Sources -->
            <div class="flow-column" hidden="">
                <div class="node cash">
                    <span class="label">Tiền Mặt</span>
                    <span class="amount">{{ formatCurrency(data?.tienMatVe) }}</span>
                </div>
                <div class="node qr">
                    <span class="label">QR Bank</span>
                    <span class="amount">{{ formatCurrency(data?.qrDaVe) }}</span>
                </div>
                <div class="node cod">
                    <span class="label">COD Thu Hộ</span>
                    <span class="amount">{{ formatCurrency(data?.codDaThu) }}</span>
                </div>
            </div>

            <!-- Process: Funnel -->
            <div class="flow-connect" hidden="">
                <div class="arrow">⬇</div>
            </div>

            <!-- Output: Total Received -->
            <div class="flow-total received" hidden="">
                <div class="icon">✅</div>
                <div class="details">
                    <div class="title">Thực Nhận</div>
                    <div class="value">{{ formatCurrency(data?.tongTienDaVe) }}</div>
                </div>
            </div>

            <!-- Separate: Pending -->
            <div class="flow-pending">
                <div class="pending-item">
                    <span class="label">⏳ Đang Giao Hàng (COD)</span>
                    <span class="value">{{ formatCurrency(data?.codDangGiao) }}</span>
                </div>
                <div class="pending-item">
                    <span class="label">⏳ Chờ Đối Soát (QR)</span>
                    <span class="value">{{ formatCurrency(data?.qrDangCho) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    }
});

const formatCurrency = (val) => {
    if (!val && val !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};
</script>

<style scoped>
.cashflow-card {
    background: linear-gradient(to bottom right, #ffffff, #f9fafb);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #374151;
}

.badge {
    background: #dcfce7;
    color: #16a34a;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.flow-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.flow-column {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
}

.node {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    text-align: center;
    display: flex;
    flex-direction: column;
}

.node.cash {
    border-left: 4px solid #22c55e;
}

.node.qr {
    border-left: 4px solid #3b82f6;
}

.node.cod {
    border-left: 4px solid #f97316;
}

.node .label {
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.node .amount {
    font-weight: 600;
    color: #111827;
}

.flow-connect {
    text-align: center;
    color: #9ca3af;
}

.flow-total.received {
    background: #ecfdf5;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border: 1px solid #6ee7b7;
}

.flow-total .icon {
    font-size: 2rem;
}

.flow-total .title {
    font-size: 0.9rem;
    color: #047857;
}

.flow-total .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #064e3b;
}

.flow-pending {
    margin-top: 1rem;
    background: #fffbeb;
    padding: 1rem;
    border-radius: 8px;
    border: 1px dashed #f59e0b;
}

.pending-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.pending-item:last-child {
    border-bottom: none;
}

.pending-item .label {
    color: #92400e;
    font-size: 0.9rem;
}

.pending-item .value {
    font-weight: 600;
    color: #b45309;
}
</style>
