<template>
    <div class="kpi-grid">
        <!-- 1. Doanh Thu Thực (Confirmed Revenue) -->
        <div class="kpi-card revenue-card">
            <div class="card-header">
                <div class="icon-wrapper success">
                    <i class="bi bi-currency-dollar"></i>
                </div>
                <div class="card-title">
                    <h3>Doanh Thu Đã Xác Nhận</h3>
                    <small class="subtitle">Tiền chắc chắn đã về túi</small>
                </div>
            </div>
            <div class="card-body">
                <div class="main-value">{{ formatCurrency(stats?.doanhThuThuc) }}</div>
                <div class="breakdown">
                    <div class="breakdown-item">
                        <i class="bi bi-cash"></i> {{ formatCurrency(stats?.tienMatTaiQuay) }}
                    </div>
                    <div class="breakdown-item">
                        <i class="bi bi-qr-code"></i> {{ formatCurrency(stats?.qrDaXacNhan) }}
                    </div>
                    <div class="breakdown-item">
                        <i class="bi bi-truck"></i> {{ formatCurrency(stats?.codDaGiao) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. Đơn Đang Giữ Hàng (Pending Orders) -->
        <div class="kpi-card pending-card">
            <div class="card-header">
                <div class="icon-wrapper warning">
                    <i class="bi bi-hourglass-split"></i>
                </div>
                <div class="card-title">
                    <h3>Đơn Đang Giữ Hàng</h3>
                    <small class="subtitle">Kho đang giữ, tiền chưa về</small>
                </div>
            </div>
            <div class="card-body">
                <div class="main-value">{{ (stats?.soDonQRChoXacNhan || 0) + (stats?.soDonCODDangGiao || 0) }} Đơn</div>
                <div class="breakdown">
                    <div class="breakdown-item text-warning">
                        <span class="label">POS/QR Chờ:</span>
                        <span class="value">{{ stats?.soDonQRChoXacNhan || 0 }}</span>
                    </div>
                    <div class="breakdown-item text-info">
                        <span class="label">COD Đang Giao:</span>
                        <span class="value">{{ stats?.soDonCODDangGiao || 0 }}</span>
                    </div>
                </div>
                <div class="alert-text">
                    ⚠️ COD chưa giao = Hàng tồn kho
                </div>
            </div>
        </div>

        <!-- 3. Tỷ Lệ Đơn Hàng -->
        <div class="kpi-card order-card">
            <div class="card-header">
                <div class="icon-wrapper primary">
                    <i class="bi bi-receipt"></i>
                </div>
                <div class="card-title">
                    <h3>Tình Trạng Đơn</h3>
                    <small class="subtitle">Tổng quan xử lý</small>
                </div>
            </div>
            <div class="card-body">
                <div class="status-grid">
                    <div class="status-item">
                        <span class="label">Thành công</span>
                        <span class="value text-success">{{ stats?.soDonThanhCong || 0 }}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Đang xử lý</span>
                        <span class="value text-warning">{{ stats?.soDonDangXuLy || 0 }}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Hủy</span>
                        <span class="value text-danger">{{ stats?.soDonDaHuy || 0 }}</span>
                    </div>
                </div>
                <div class="cancellation-rate">
                    Tỷ lệ hủy: <span :class="getRateColor(stats?.tyLeHuyDon)">{{ stats?.tyLeHuyDon?.toFixed(1)
                        }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    stats: {
        type: Object,
        required: true,
        default: () => ({})
    }
});

const formatCurrency = (value) => {
    if (!value && value !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const getRateColor = (rate) => {
    if (!rate) return 'text-success';
    if (rate < 5) return 'text-success';
    if (rate < 15) return 'text-warning';
    return 'text-danger';
};
</script>

<style scoped>
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.kpi-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
    border: 1px solid #e5e7eb;
}

.kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.icon-wrapper.success {
    background: #dcfce7;
    color: #16a34a;
}

.icon-wrapper.warning {
    background: #fef9c3;
    color: #ca8a04;
}

.icon-wrapper.primary {
    background: #dbeafe;
    color: #2563eb;
}

.card-title h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
}

.subtitle {
    color: #6b7280;
    font-size: 0.875rem;
}

.main-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1rem;
}

.breakdown {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.breakdown-item {
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    text-align: center;
}

.status-item {
    display: flex;
    flex-direction: column;
}

.status-item .label {
    font-size: 0.75rem;
    color: #6b7280;
}

.status-item .value {
    font-weight: 600;
    font-size: 1.1rem;
}

.alert-text {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: #dc2626;
    font-style: italic;
    background: #fef2f2;
    padding: 0.5rem;
    border-radius: 6px;
}

.text-success {
    color: #16a34a;
}

.text-warning {
    color: #d97706;
}

.text-danger {
    color: #dc2626;
}

.text-info {
    color: #0891b2;
}
</style>
