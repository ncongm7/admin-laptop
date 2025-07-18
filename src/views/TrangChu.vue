<template>
    <div class="dashboard-container">
        <!-- Header -->
        <div class="dashboard-header mb-4">
            <h2 class="page-title">Tổng Quan Hệ Thống</h2>
            <div class="date-picker">
                <i class="bi bi-calendar"></i>
                <span>{{ currentDate }}</span>
            </div>
        </div>

        <!-- Main Stats Row -->
        <div class="row g-4 mb-4">
            <div class="col-xl-3 col-md-6">
                <StatCard title="Tổng Doanh Thu" :value="stats.totalRevenue" icon="bi-currency-dollar" color="primary"
                    :change="stats.revenueChange" :loading="loading" />
            </div>
            <div class="col-xl-3 col-md-6">
                <StatCard title="Đơn Hàng" :value="stats.totalOrders" icon="bi-cart-check" color="success"
                    :change="stats.ordersChange" :loading="loading" />
            </div>
            <div class="col-xl-3 col-md-6">
                <StatCard title="Khách Hàng Mới" :value="stats.newCustomers" icon="bi-people" color="info"
                    :change="stats.customerGrowth" :loading="loading" />
            </div>
            <div class="col-xl-3 col-md-6">
                <StatCard title="Tỷ Lệ Hoàn Thành" :value="stats.completionRate" suffix="%" icon="bi-check-circle"
                    color="warning" :change="stats.completionChange" :loading="loading" />
            </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-4 mb-4">
            <div class="col-xl-8">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <SalesPerformanceChart :data="chartData.salesPerformance" :loading="loading" />
                    </div>
                </div>
            </div>
            <div class="col-xl-4">
                <!-- <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <RevenueSourcesChart :data="chartData.revenueSources" :loading="loading" />
                    </div>
                </div> -->
            </div>
        </div>

        <!-- Bottom Row -->
        <div class="row g-4">
            <div class="col-xl-4">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <TopProductsWidget :products="stats.topProducts" :loading="loading" />
                    </div>
                </div>
            </div>
            <div class="col-xl-4">
                <!-- <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <CustomerActivityWidget :activities="stats.recentActivities" :loading="loading" />
                    </div>
                </div> -->
            </div>
            <div class="col-xl-4">
                <!-- <div class="card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <InventoryStatusWidget :status="stats.inventoryStatus" :loading="loading" />
                    </div>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { format } from 'date-fns'

// Components
import StatCard from '@/components/dashboard/StatCard.vue'
import SalesPerformanceChart from '@/components/dashboard/SalesPerformanceChart.vue'
// import RevenueSourcesChart from '@/components/dashboard/RevenueSourcesChart.vue'
import TopProductsWidget from '@/components/dashboard/TopProductsWidget.vue'
// import CustomerActivityWidget from '@/components/dashboard/CustomerActivityWidget.vue'
// import InventoryStatusWidget from '@/components/dashboard/InventoryStatusWidget.vue'

const dashboardStore = useDashboardStore()
const loading = ref(true)

const stats = ref({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    completionRate: 0,
    revenueChange: 0,
    ordersChange: 0,
    customerGrowth: 0,
    completionChange: 0,
    topProducts: [],
    recentActivities: [],
    inventoryStatus: {}
})

const chartData = ref({
    salesPerformance: {},
    revenueSources: {}
})

const currentDate = computed(() => {
    return format(new Date(), 'EEEE, dd MMMM yyyy')
})

onMounted(async () => {
    try {
        loading.value = true
        await dashboardStore.fetchDashboardData()
        stats.value = dashboardStore.dashboardStats
        chartData.value = dashboardStore.chartData
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.dashboard-container {
    padding: 2rem;
    background-color: #f8fafc;
    min-height: 100vh;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-title {
    font-weight: 700;
    color: #2d3748;
    margin: 0;
}

.date-picker {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #4a5568;
}

.card {
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>