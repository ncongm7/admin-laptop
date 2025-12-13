<template>
    <div class="chat-analytics-dashboard">
        <div class="dashboard-header">
            <h4 class="mb-0">
                <i class="bi bi-bar-chart-fill"></i> Thống kê Chatbot AI
            </h4>
            <button class="btn btn-sm btn-outline-primary" @click="refreshStats">
                <i class="bi bi-arrow-clockwise"></i> Làm mới
            </button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon bg-primary">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.botHandledPercentage || 0 }}%</div>
                    <div class="stat-label">Bot tự động xử lý</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon bg-warning">
                    <i class="bi bi-people"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.humanHandled || 0 }}</div>
                    <div class="stat-label">Chuyển nhân viên</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon bg-success">
                    <i class="bi bi-speedometer2"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.avgResponseTime || 0 }}ms</div>
                    <div class="stat-label">Thời gian phản hồi TB</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon bg-info">
                    <i class="bi bi-emoji-smile"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.satisfactionRate || 0 }}%</div>
                    <div class="stat-label">Độ hài lòng</div>
                </div>
            </div>
        </div>

        <!-- Intent Breakdown -->
        <div class="card mt-4">
            <div class="card-header">
                <h6 class="mb-0"><i class="bi bi-pie-chart"></i> Top Intent được hỏi</h6>
            </div>
            <div class="card-body">
                <div v-if="topIntents.length === 0" class="text-center text-muted py-3">
                    Chưa có dữ liệu
                </div>
                <div v-else class="intent-list">
                    <div v-for="intent in topIntents" :key="intent.code" class="intent-bar">
                        <div class="intent-info">
                            <span class="intent-name">{{ intent.name }}</span>
                            <span class="intent-count">{{ intent.count }} lượt</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar" :style="{ width: intent.percentage + '%' }"
                                :class="getProgressBarClass(intent.percentage)"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="card mt-4">
            <div class="card-header">
                <h6 class="mb-0"><i class="bi bi-clock-history"></i> Hoạt động gần đây</h6>
            </div>
            <div class="card-body">
                <div v-if="recentActivity.length === 0" class="text-center text-muted py-3">
                    Chưa có hoạt động
                </div>
                <div v-else class="activity-list">
                    <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                        <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                            <i :class="getActivityIcon(activity.type)"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-title">{{ activity.title }}</div>
                            <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'

// State
const stats = ref({
    botHandledPercentage: 78,
    humanHandled: 12,
    avgResponseTime: 450,
    satisfactionRate: 85
})

const topIntents = ref([
    { code: 'PRODUCT_PRICE', name: 'Hỏi giá sản phẩm', count: 45, percentage: 100 },
    { code: 'WARRANTY_CHECK', name: 'Kiểm tra bảo hành', count: 32, percentage: 71 },
    { code: 'ORDER_STATUS', name: 'Tra cứu đơn hàng', count: 28, percentage: 62 },
    { code: 'PRODUCT_SPECS', name: 'Hỏi cấu hình', count: 21, percentage: 47 },
    { code: 'STORE_LOCATION', name: 'Địa chỉ cửa hàng', count: 15, percentage: 33 }
])

const recentActivity = ref([
    {
        id: 1,
        type: 'escalate',
        title: 'Conversation #1234 được chuyển nhân viên',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
        id: 2,
        type: 'bot_reply',
        title: 'Bot trả lời câu hỏi về giá sản phẩm',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
        id: 3,
        type: 'takeover',
        title: 'Nhân viên Nguyễn Văn A tiếp quản conversation #1233',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
    }
])

// Methods
const refreshStats = async () => {
    console.log('🔄 Refreshing chatbot stats...')
    // TODO: Call API to fetch real stats
    // const response = await chatService.getAnalytics()
    // stats.value = response.data
}

const getProgressBarClass = (percentage) => {
    if (percentage >= 70) return 'bg-success'
    if (percentage >= 40) return 'bg-info'
    return 'bg-warning'
}

const getActivityIconClass = (type) => {
    switch (type) {
        case 'escalate':
            return 'bg-warning'
        case 'bot_reply':
            return 'bg-primary'
        case 'takeover':
            return 'bg-success'
        default:
            return 'bg-secondary'
    }
}

const getActivityIcon = (type) => {
    switch (type) {
        case 'escalate':
            return 'bi bi-arrow-up-right-circle'
        case 'bot_reply':
            return 'bi bi-robot'
        case 'takeover':
            return 'bi bi-person-check'
        default:
            return 'bi bi-circle'
    }
}

const formatTime = (date) => {
    try {
        const now = new Date()
        const diff = now - date
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return 'Vừa xong'
        if (minutes < 60) return `${minutes} phút trước`

        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours} giờ trước`

        return format(date, 'dd/MM/yyyy HH:mm')
    } catch {
        return ''
    }
}

onMounted(() => {
    refreshStats()
})
</script>

<style scoped>
.chat-analytics-dashboard {
    padding: 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 13px;
    color: #7f8c8d;
    font-weight: 500;
}

.intent-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.intent-bar {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.intent-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.intent-name {
    font-weight: 600;
    color: #2c3e50;
}

.intent-count {
    font-size: 13px;
    color: #7f8c8d;
    background: #ecf0f1;
    padding: 4px 12px;
    border-radius: 12px;
}

.progress {
    height: 8px;
    border-radius: 4px;
    background: #ecf0f1;
}

.progress-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
}

.activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
}

.activity-content {
    flex: 1;
}

.activity-title {
    font-weight: 500;
    color: #2c3e50;
    font-size: 14px;
}

.activity-time {
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 2px;
}
</style>
