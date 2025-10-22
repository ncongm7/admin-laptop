<template>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon" :class="{ loading: loading }">
                <i v-if="!loading" class="bi bi-currency-dollar"></i>
            </div>
            <div class="stat-title">Doanh thu</div>
        </div>

        <div class="stat-content">
            <div v-if="loading" class="stat-loading">
                <div class="loading-bar"></div>
                <div class="loading-bar short"></div>
            </div>
            <template v-else>
                <div class="stat-value">{{ formatCurrency(revenue) }}</div>
                <div class="profit-value">
                    <span class="label">Lợi nhuận:</span>
                    <span class="value">{{ formatCurrency(profit) }}</span>
                </div>
            </template>
        </div>

        <div class="stat-footer">
            <router-link to="/reports">Xem báo cáo chi tiết</router-link>
        </div>
    </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/helpers'

defineProps({
    revenue: {
        type: Number,
        default: 0
    },
    profit: {
        type: Number,
        default: 0
    },
    loading: {
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.stat-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    height: 100%;
    display: flex;
    flex-direction: column;
}

.stat-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    margin-right: 12px;
}

.stat-icon.loading {
    background: #e2e8f0;
}

.stat-title {
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
}

.stat-content {
    flex: 1;
    margin-bottom: 8px;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
}

.profit-value {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    padding: 8px 12px;
    border-radius: 8px;
}

.profit-value .label {
    font-size: 13px;
    color: #64748b;
}

.profit-value .value {
    font-size: 15px;
    font-weight: 600;
    color: #10b981;
}

.stat-footer {
    font-size: 12px;
}

.stat-footer a {
    color: #3b82f6;
    text-decoration: none;
}

.stat-footer a:hover {
    text-decoration: underline;
}

.stat-loading {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.loading-bar {
    height: 24px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
}

.loading-bar.short {
    width: 80%;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}
</style>