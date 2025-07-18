<template>
    <div class="discount-stats mb-4">
        <div class="row">
            <div class="col-md-3 mb-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Đang hoạt động</h6>
                                <h3 class="card-title mb-0">{{ stats.active || 0 }}</h3>
                            </div>
                            <div class="stat-icon bg-success">
                                <i class="bi bi-arrow-up-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Sắp diễn ra</h6>
                                <h3 class="card-title mb-0">{{ stats.upcoming || 0 }}</h3>
                            </div>
                            <div class="stat-icon bg-warning">
                                <i class="bi bi-clock"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Đã kết thúc</h6>
                                <h3 class="card-title mb-0">{{ stats.expired || 0 }}</h3>
                            </div>
                            <div class="stat-icon bg-secondary">
                                <i class="bi bi-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Tổng doanh thu</h6>
                                <h3 class="card-title mb-0">{{ formatCurrency(stats.totalRevenue) }}</h3>
                            </div>
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-currency-dollar"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters.js'
// Dòng này import hàm formatCurrency từ file utils/formatters.js để dùng cho việc định dạng số tiền (doanh thu) thành chuỗi tiền tệ hiển thị đẹp mắt trong giao diện.

const props = defineProps({
    stats: {
        type: Object,
        default: () => ({
            active: 0,
            upcoming: 0,
            expired: 0,
            totalRevenue: 0
        })
    }
})
</script>

<style scoped>
.stat-card {
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-body {
    padding: 1.25rem;
}

.card-subtitle {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.card-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3e50;
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.bg-success {
    background-color: #28a745 !important;
}

.bg-warning {
    background-color: #ffc107 !important;
}

.bg-secondary {
    background-color: #6c757d !important;
}

.bg-primary {
    background-color: #007bff !important;
}

@media (max-width: 768px) {
    .card-title {
        font-size: 1.5rem;
    }

    .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
    }
}
</style>