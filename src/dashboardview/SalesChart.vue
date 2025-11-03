<template>
    <div class="chart-container">
        <div class="chart-header">
            <h3 class="chart-title">Biểu đồ doanh số</h3>
            <div class="chart-actions">
                <button v-for="period in periods" :key="period.value" @click="changePeriod(period.value)"
                    :class="{ active: activePeriod === period.value }">
                    {{ period.label }}
                </button>
            </div>
        </div>

        <div class="chart-wrapper">
            <div v-if="loading" class="chart-loading">
                <div class="loading-placeholder"></div>
            </div>
            <div v-else-if="!data || !data.labels || data.labels.length === 0" class="empty-chart">
                <i class="bi bi-bar-chart"></i>
                <p>Chưa có dữ liệu biểu đồ</p>
            </div>
            <canvas v-else ref="chartCanvas"></canvas>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['period-change'])

const periods = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
    { label: 'Quý', value: 'quarter' },
    { label: 'Năm', value: 'year' }
]

const activePeriod = ref('month')
const chartCanvas = ref(null)
let chartInstance = null

const changePeriod = (period) => {
    activePeriod.value = period
    emit('period-change', period)
}

const initChart = () => {
    // Check nếu không có canvas hoặc không có data thì không render
    if (!chartCanvas.value) {
        console.log('🔄 [SalesChart] Canvas chưa sẵn sàng')
        return
    }

    if (!props.data || !props.data.labels || props.data.labels.length === 0) {
        console.log('🔄 [SalesChart] Đang chờ dữ liệu...')
        return
    }

    console.log('📊 [SalesChart] Render chart với data:', props.data)

    if (chartInstance) {
        chartInstance.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: props.data.labels,
            datasets: [
                {
                    label: 'Doanh số',
                    data: props.data.values,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: '#e2e8f0'
                    },
                    ticks: {
                        color: '#64748b'
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            }
        }
    })
}

onMounted(() => {
    if (!props.loading) {
        initChart()
    }
})

watch(() => props.data, () => {
    if (!props.loading) {
        initChart()
    }
}, { deep: true })
</script>

<style scoped>
.chart-container {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.chart-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.chart-actions {
    display: flex;
    gap: 8px;
}

.chart-actions button {
    background: none;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}

.chart-actions button:hover {
    background: #f1f5f9;
}

.chart-actions button.active {
    background: #6366f1;
    color: white;
}

.chart-wrapper {
    flex: 1;
    position: relative;
}

canvas {
    width: 100% !important;
    height: 100% !important;
}

.chart-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-placeholder {
    width: 100%;
    height: 100%;
    background: #f1f5f9;
    border-radius: 8px;
    animation: pulse 1.5s infinite;
}

.empty-chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #94a3b8;
}

.empty-chart i {
    font-size: 64px;
    margin-bottom: 16px;
}

.empty-chart p {
    margin: 0;
    font-size: 14px;
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