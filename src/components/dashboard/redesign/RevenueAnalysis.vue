<template>
    <div class="analysis-grid">
        <!-- Chart: Doanh Thu Theo Kênh -->
        <div class="chart-card">
            <h3>📈 Phân Tích Kênh Bán Hàng</h3>
            <div class="chart-container">
                <canvas ref="channelChartRef"></canvas>
            </div>
            <div class="chart-legend">
                <div v-for="channel in channelData" :key="channel.tenKenh" class="legend-item">
                    <span class="dot" :class="getChannelColor(channel.tenKenh)"></span>
                    <span>{{ channel.tenKenh }}: {{ formatCurrency(channel.doanhThu) }}</span>
                </div>
            </div>
        </div>

        <!-- Chart: Phương Thức Thanh Toán -->
        <div class="chart-card">
            <h3>💳 Phương Thức Thanh Toán</h3>
            <div class="chart-container">
                <canvas ref="paymentChartRef"></canvas>
            </div>
            <div class="payment-table-wrapper">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>PT</th>
                            <th>Đã Thu</th>
                            <th>Chờ</th>
                            <th>Tỷ Trọng</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="method in paymentData" :key="method.phuongThuc">
                            <td>{{ method.phuongThuc }}</td>
                            <td class="text-success">{{ formatShortCurrency(method.doanhThuDaXacNhan) }}</td>
                            <td class="text-warning">{{ formatShortCurrency(method.doanhThuChuaXacNhan) }}</td>
                            <td>{{ method.tyLeSuDung }}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
    channelData: { type: Array, default: () => [] },
    paymentData: { type: Array, default: () => [] }
});

const channelChartRef = ref(null);
const paymentChartRef = ref(null);
let channelChartIns = null;
let paymentChartIns = null;

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatShortCurrency = (val) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val;
};

const getChannelColor = (name) => name === 'POS' ? 'bg-purple' : 'bg-blue';

// Draw Channel Chart (Bar)
const drawChannelChart = () => {
    if (!channelChartRef.value) return;
    if (channelChartIns) channelChartIns.destroy();

    const labels = props.channelData.map(c => c.tenKenh);
    const data = props.channelData.map(c => c.doanhThu);

    channelChartIns = new Chart(channelChartRef.value, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh Thu',
                data: data,
                backgroundColor: ['#9333ea', '#0ea5e9'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
};

// Draw Payment Chart (Doughnut)
const drawPaymentChart = () => {
    if (!paymentChartRef.value) return;
    if (paymentChartIns) paymentChartIns.destroy();

    const labels = props.paymentData.map(p => p.phuongThuc);
    const data = props.paymentData.map(p => p.doanhThu);

    paymentChartIns = new Chart(paymentChartRef.value, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#22c55e', '#eab308', '#f97316'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: { legend: { display: false } }
        }
    });
};

watch(() => props.channelData, drawChannelChart, { deep: true });
watch(() => props.paymentData, drawPaymentChart, { deep: true });

onMounted(() => {
    drawChannelChart();
    drawPaymentChart();
});
</script>

<style scoped>
.analysis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.chart-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.chart-container {
    height: 250px;
    position: relative;
    margin-bottom: 1rem;
}

h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #374151;
}

.chart-legend {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.bg-purple {
    background: #9333ea;
}

.bg-blue {
    background: #0ea5e9;
}

.payment-table-wrapper {
    margin-top: 1rem;
}

/* Bootstrap-like table simple styles */
.table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.table th {
    text-align: left;
    color: #6b7280;
    font-weight: 500;
    padding: 0.5rem;
}

.table td {
    padding: 0.5rem;
    border-top: 1px solid #f3f4f6;
}

.text-success {
    color: #16a34a;
}

.text-warning {
    color: #ca8a04;
}
</style>
