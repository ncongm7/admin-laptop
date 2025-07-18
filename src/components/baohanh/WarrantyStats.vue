<template>
    <div class="warranty-stats mb-4">
        <div class="row">
            <div class="col-md-3 mb-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Đang bảo hành</h6>
                                <h3 class="card-title mb-0">{{ stats.active }}</h3>
                                <small class="text-success" v-if="stats.activeChange > 0">
                                    <i class="bi bi-arrow-up"></i> {{ stats.activeChange }}%
                                </small>
                                <small class="text-danger" v-else-if="stats.activeChange < 0">
                                    <i class="bi bi-arrow-down"></i> {{ Math.abs(stats.activeChange) }}%
                                </small>
                            </div>
                            <div class="stat-icon bg-success">
                                <i class="bi bi-shield-check"></i>
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
                                <h6 class="card-subtitle text-muted">Hết hạn</h6>
                                <h3 class="card-title mb-0">{{ stats.expired }}</h3>
                                <small class="text-success" v-if="stats.expiredChange < 0">
                                    <i class="bi bi-arrow-down"></i> {{ Math.abs(stats.expiredChange) }}%
                                </small>
                                <small class="text-danger" v-else-if="stats.expiredChange > 0">
                                    <i class="bi bi-arrow-up"></i> {{ stats.expiredChange }}%
                                </small>
                            </div>
                            <div class="stat-icon bg-secondary">
                                <i class="bi bi-shield-slash"></i>
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
                                <h6 class="card-subtitle text-muted">Đã hủy</h6>
                                <h3 class="card-title mb-0">{{ stats.cancelled }}</h3>
                                <small class="text-success" v-if="stats.cancelledChange < 0">
                                    <i class="bi bi-arrow-down"></i> {{ Math.abs(stats.cancelledChange) }}%
                                </small>
                                <small class="text-danger" v-else-if="stats.cancelledChange > 0">
                                    <i class="bi bi-arrow-up"></i> {{ stats.cancelledChange }}%
                                </small>
                            </div>
                            <div class="stat-icon bg-danger">
                                <i class="bi bi-shield-x"></i>
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
                                <h6 class="card-subtitle text-muted">Tổng sửa chữa</h6>
                                <h3 class="card-title mb-0">{{ stats.repairCount }}</h3>
                                <small class="text-muted">~{{ stats.avgRepairPerWarranty }} lần/BH</small>
                            </div>
                            <div class="stat-icon bg-warning">
                                <i class="bi bi-tools"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    stats: {
        type: Object,
        default: () => ({
            active: 0,
            expired: 0,
            cancelled: 0,
            repairCount: 0,
            activeChange: 0,
            expiredChange: 0,
            cancelledChange: 0,
            avgRepairPerWarranty: 0
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

.bg-secondary {
    background-color: #6c757d !important;
}

.bg-danger {
    background-color: #dc3545 !important;
}

.bg-warning {
    background-color: #ffc107 !important;
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