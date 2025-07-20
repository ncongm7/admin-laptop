<template>
    <div>
        <div class="chart-header">
            <h3 class="chart-title">Hiệu Suất Bán Hàng</h3>
            <div class="chart-period-selector">
                <button v-for="period in periods" :key="period.value" @click="changePeriod(period.value)"
                    :class="{ active: activePeriod === period.value }">
                    {{ period.label }}
                </button>
            </div>
        </div>
        <div ref="chartEl" class="chart-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/utils/useChart'

const props = defineProps({
    data: Object,
    loading: Boolean
})

const emit = defineEmits(['period-change'])

const periods = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
    { label: 'Quý', value: 'quarter' },
    { label: 'Năm', value: 'year' }
]

const activePeriod = ref('month')
const chartEl = ref(null)
const { initChart, updateChart } = useChart()

const changePeriod = (period) => {
    activePeriod.value = period
    emit('period-change', period)
}

onMounted(() => {
    initChart(chartEl.value, {
        type: 'line',
        data: props.data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    })
})

watch(() => props.data, (newData) => {
    updateChart(newData)
})
</script>

<style scoped>
.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.chart-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
}

.chart-period-selector {
    display: flex;
    gap: 0.5rem;
}

.chart-period-selector button {
    background: none;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    color: #718096;
    cursor: pointer;
    transition: all 0.2s;
}

.chart-period-selector button:hover {
    background: #edf2f7;
}

.chart-period-selector button.active {
    background: #4299e1;
    color: white;
}

.chart-container {
    height: 300px;
    position: relative;
}
</style>