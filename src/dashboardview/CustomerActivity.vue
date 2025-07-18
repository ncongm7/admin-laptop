<template>
    <div class="activity-container">
        <div class="activity-header">
            <h3 class="activity-title">Hoạt động khách hàng</h3>
            <router-link to="/customers" class="view-all">Xem tất cả</router-link>
        </div>

        <div class="activity-list">
            <div v-if="loading" class="loading-item" v-for="i in 5" :key="i">
                <div class="loading-avatar"></div>
                <div class="loading-content">
                    <div class="loading-line"></div>
                    <div class="loading-line short"></div>
                </div>
            </div>

            <div v-else v-for="activity in activities" :key="activity.id" class="activity-item">
                <div class="activity-avatar">
                    <i class="bi" :class="activityIcon(activity.type)"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-info">
                        <div class="activity-name">{{ activity.customer }}</div>
                        <div class="activity-description">{{ activity.description }}</div>
                    </div>
                    <div class="activity-time">{{ activity.time }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    activities: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const activityIcon = (type) => {
    const icons = {
        purchase: 'bi-cart',
        login: 'bi-box-arrow-in-right',
        register: 'bi-person-plus',
        review: 'bi-star',
        other: 'bi-activity'
    }
    return icons[type] || icons.other
}
</script>

<style scoped>
.activity-container {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.activity-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.view-all {
    font-size: 13px;
    color: #3b82f6;
    text-decoration: none;
}

.view-all:hover {
    text-decoration: underline;
}

.activity-list {
    flex: 1;
    overflow-y: auto;
}

.activity-item,
.loading-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-avatar,
.loading-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    color: #6366f1;
    font-size: 18px;
}

.activity-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
}

.activity-info {
    flex: 1;
}

.activity-name {
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 2px;
}

.activity-description {
    font-size: 12px;
    color: #64748b;
}

.activity-time {
    font-size: 12px;
    color: #94a3b8;
    white-space: nowrap;
    margin-left: 12px;
}

.loading-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.loading-line {
    height: 14px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
}

.loading-line.short {
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