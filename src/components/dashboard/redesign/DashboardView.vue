<template>
    <div class="dashboard-container">
        <!-- Header -->
        <div class="dashboard-header">
            <div>
                <h1>Thống Kê Doanh Thu</h1>
                <p class="text-sm text-gray">Cập nhật lúc: {{ currentTime }}</p>
            </div>

            <!-- Date Filter -->
            <div class="date-filter">
                <!-- Bộ lọc nhanh Pancake Style -->
                <div class="quick-filter-wrapper">
                    <button class="btn btn-outline" @click="toggleQuickFilter">
                        <i class="bi bi-calendar3"></i>
                        {{ currentFilterLabel }}
                        <i class="bi bi-chevron-down"></i>
                    </button>

                    <div v-if="showQuickFilter" class="quick-filter-menu">
                        <div v-for="(option, index) in filterOptions" :key="index" class="filter-option"
                            @click="selectFilter(option)">
                            {{ option.label }}
                        </div>
                    </div>
                </div>

                <div class="date-inputs">
                    <input type="date" v-model="dateRange.startDate" class="form-input" />
                    <span class="separator">-</span>
                    <input type="date" v-model="dateRange.endDate" class="form-input" />
                </div>

                <button @click="loadAllStats" class="btn btn-primary" :disabled="loading">
                    <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
                    {{ loading ? 'Đang tải...' : 'Làm mới' }}
                </button>
            </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <!-- Main Content -->
        <div v-else class="dashboard-content">
            <!-- 1. KPIs Overview -->
            <DashboardKPIs :stats="revenueStats || {}" />

            <!-- 2. Analysis Charts -->
            <RevenueAnalysis :channelData="channelStats" :paymentData="paymentStats" />

            <!-- 3. Bottom Row: CashFlow & Logs -->
            <div class="bottom-grid">
                <CashFlowWidget :data="cashFlowStats || {}" />

                <!-- Placeholder for Activity Log if we had one -->
                <div class="log-placeholder" hidden="">
                    <h3>📜 Nhật Ký Hoạt Động</h3>
                    <!-- <p class="text-muted">Đang phát triển...</p> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useDashboardStats } from '@/composables/useDashboardStats';
import DashboardKPIs from './DashboardKPIs.vue';
import RevenueAnalysis from './RevenueAnalysis.vue';
import CashFlowWidget from './CashFlowWidget.vue';
import dayjs from 'dayjs';

const {
    loading,
    error,
    dateRange,
    revenueStats,
    channelStats,
    paymentStats,
    cashFlowStats,
    loadAllStats
} = useDashboardStats();

const currentTime = ref(dayjs().format('HH:mm DD/MM/YYYY'));
const showQuickFilter = ref(false);
const currentFilterLabel = ref('Hôm nay');

const filterOptions = [
    { label: 'Hôm nay', type: 'today' },
    { label: 'Hôm qua', type: 'yesterday' },
    { label: '7 ngày qua', type: 'last7days' },
    { label: '30 ngày qua', type: 'last30days' },
    { label: 'Tháng này', type: 'thisMonth' },
    { label: 'Tháng trước', type: 'lastMonth' },
];

const toggleQuickFilter = () => {
    showQuickFilter.value = !showQuickFilter.value;
};

const selectFilter = (option) => {
    const today = dayjs();
    let start, end;

    switch (option.type) {
        case 'today':
            start = end = today;
            break;
        case 'yesterday':
            start = end = today.subtract(1, 'day');
            break;
        case 'last7days':
            start = today.subtract(6, 'day');
            end = today;
            break;
        case 'last30days':
            start = today.subtract(29, 'day');
            end = today;
            break;
        case 'thisMonth':
            start = today.startOf('month');
            end = today.endOf('month');
            break;
        case 'lastMonth':
            start = today.subtract(1, 'month').startOf('month');
            end = today.subtract(1, 'month').endOf('month');
            break;
    }

    dateRange.value.startDate = start.format('YYYY-MM-DD');
    dateRange.value.endDate = end.format('YYYY-MM-DD');
    currentFilterLabel.value = option.label;
    showQuickFilter.value = false;

    // Auto reload
    loadAllStats();
};

onMounted(() => {
    loadAllStats();

    // Click outside directive simulation (simple version)
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.quick-filter-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            showQuickFilter.value = false;
        }
    });
});
</script>

<style scoped>
.dashboard-container {
    padding: 1.5rem;
    background-color: #f3f4f6;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.text-gray {
    color: #6b7280;
}

.date-filter {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.date-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.25rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
}

.date-inputs .form-input {
    border: none;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
    outline: none;
}

.quick-filter-wrapper {
    position: relative;
    z-index: 10;
}

.btn-outline {
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.btn-outline:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.quick-filter-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    padding: 0.5rem;
}

.filter-option {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
    color: #4b5563;
    font-size: 0.9rem;
    transition: background 0.1s;
}

.filter-option:hover {
    background: #f3f4f6;
    color: #2563eb;
}

.form-input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
}

.btn-primary {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-primary:hover {
    background: #1d4ed8;
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}

.alert-danger {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.bottom-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
}

.log-placeholder {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
}

@media (max-width: 1024px) {
    .bottom-grid {
        grid-template-columns: 1fr;
    }
}
</style>
