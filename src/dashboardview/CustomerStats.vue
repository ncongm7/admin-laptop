<template>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon" :class="{ loading: loading }">
                <i v-if="!loading" class="bi bi-people"></i>
            </div>
            <div class="stat-title">Khách hàng</div>
        </div>

        <div class="stat-content">
            <div v-if="loading" class="stat-loading">
                <div class="loading-bar"></div>
                <div class="loading-bar short"></div>
            </div>
            <template v-else>
                <div class="stat-value">{{ count.toLocaleString() }}</div>
                <div class="stat-growth" :class="growthClass">
                    <i :class="growthIcon"></i>
                    {{ Math.abs(growth) }}%
                </div>
            </template>
        </div>

        <div class="stat-footer" v-if="!loading">
            <div class="customer-stats">
                <div class="stat-item">
                    <div class="stat-number">{{ moiThangNay.toLocaleString() }}</div>
                    <div class="stat-label">Mới tháng này</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ hoatDong.toLocaleString() }}</div>
                    <div class="stat-label">Hoạt động</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    count: {
        type: Number,
        default: 0
    },
    growth: {
        type: Number,
        default: 0
    },
    moiThangNay: {
        type: Number,
        default: 0
    },
    hoatDong: {
        type: Number,
        default: 0
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const growthClass = computed(() => {
    return props.growth >= 0 ? 'positive' : 'negative'
})

const growthIcon = computed(() => {
    return props.growth >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'
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
    background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
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
    margin-bottom: 4px;
}

.stat-growth {
    display: flex;
    align-items: center;
    font-size: 14px;
    gap: 4px;
}

.stat-growth.positive {
    color: #10b981;
}

.stat-growth.negative {
    color: #ef4444;
}

.stat-footer {
    margin-top: auto;
}

.customer-stats {
    display: flex;
    justify-content: space-between;
    background: #f8fafc;
    padding: 12px;
    border-radius: 8px;
    margin-top: 12px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
}

.stat-label {
    font-size: 12px;
    color: #64748b;
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
    width: 60%;
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