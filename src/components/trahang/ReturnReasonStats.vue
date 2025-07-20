<template>
    <div class="return-reason-stats">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">Phân bố theo lý do</h6>
            <span class="badge bg-primary">
                {{ totalReturns }} yêu cầu
            </span>
        </div>

        <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
        </div>

        <div class="reason-list mt-3">
            <div v-for="item in data" :key="item.reason" class="reason-item mb-2">
                <div class="d-flex justify-content-between">
                    <span>{{ item.reason }}</span>
                    <span class="fw-bold">{{ item.percentage }}% ({{ item.count }})</span>
                </div>
                <div class="progress mt-1" style="height: 6px;">
                    <div class="progress-bar"
                        :style="{ width: `${item.percentage}%`, backgroundColor: getColor(item.reason) }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
    data: {
        type: Array,
        default: () => []
    }
})

const chartCanvas = ref(null)
let chartInstance = null

const totalReturns = computed(() => {
    return props.data.reduce((sum, item) => sum + item.count, 0)
})

const getColor = (reason) => {
    const colorMap = {
        'Sản phẩm lỗi': '#dc3545',
        'Không đúng mô tả': '#fd7e14',
        'Giao sai sản phẩm': '#ffc107',
        'Đổi ý': '#20c997',
        'Khác': '#6c757d'
    }
    return colorMap[reason] || '#0d6efd'
}

const initChart = () => {
    if (chartInstance) {
        chartInstance.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: props.data.map(item => item.reason),
            datasets: [{
                data: props.data.map(item => item.count),
                backgroundColor: props.data.map(item => getColor(item.reason)),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || ''
                            const value = context.raw || 0
                            const total = context.dataset.data.reduce((a, b) => a + b, 0)
                            const percentage = Math.round((value / total) * 100)
                            return `${label}: ${value} (${percentage}%)`
                        }
                    }
                }
            },
            cutout: '70%'
        }
    })
}

onMounted(() => {
    initChart()
})

watch(() => props.data, () => {
    initChart()
}, { deep: true })
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 250px;
    margin: 0 auto;
}

.reason-item {
    padding: 8px 12px;
    background-color: #f8f9fa;
    border-radius: 6px;
}

.progress {
    background-color: #e9ecef;
    border-radius: 10px;
}
</style>