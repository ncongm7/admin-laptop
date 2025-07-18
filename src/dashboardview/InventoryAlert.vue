<template>
    <div class="stat-card alert">
        <div class="stat-header">
            <div class="stat-icon" :class="{ loading: loading }">
                <i v-if="!loading" class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="stat-title">Tồn kho</div>
        </div>

        <div class="stat-content">
            <div v-if="loading" class="stat-loading">
                <div class="loading-bar"></div>
                <div class="loading-bar short"></div>
            </div>
            <template v-else>
                <div class="alert-item critical">
                    <div class="alert-count">{{ critical }}</div>
                    <div class="alert-label">Sản phẩm sắp hết</div>
                </div>
                <div class="alert-item warning">
                    <div class="alert-count">{{ lowStock }}</div>
                    <div class="alert-label">Cần bổ sung</div>
                </div>
            </template>
        </div>

        <div class="stat-footer">
            <router-link to="/inventory" class="alert-link">
                <i class="bi bi-box-arrow-up-right"></i> Quản lý kho
            </router-link>
        </div>
    </div>
</template>

<script setup>
// Nhận props từ cha (DashboardView)
defineProps({
    lowStock: {
        type: Number,
        default: 0
    },
    critical: {
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
.stat-card.alert {
    border-left: 4px solid #f59e0b;
}

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
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
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
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 8px;
}

.alert-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 8px;
}

.alert-item.critical {
    background: #fef2f2;
    border-left: 3px solid #ef4444;
}

.alert-item.warning {
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
}

.alert-count {
    font-size: 18px;
    font-weight: 700;
}

.alert-item.critical .alert-count {
    color: #ef4444;
}

.alert-item.warning .alert-count {
    color: #f59e0b;
}

.alert-label {
    font-size: 13px;
    color: #64748b;
}

.stat-footer {
    margin-top: auto;
}

.alert-link {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #3b82f6;
    text-decoration: none;
}

.alert-link:hover {
    text-decoration: underline;
}

.stat-loading {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.loading-bar {
    height: 56px;
    background: #e2e8f0;
    border-radius: 8px;
    animation: pulse 1.5s infinite;
}

.loading-bar.short {
    height: 48px;
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