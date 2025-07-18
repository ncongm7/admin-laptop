<template>
    <div class="warranty-timeline">
        <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="repairs.length === 0" class="text-center py-3 text-muted">
            <i class="bi bi-clock-history fs-4"></i>
            <p class="mt-2 mb-0">Chưa có lịch sử sửa chữa</p>
        </div>

        <div v-else>
            <div v-for="(repair, index) in repairs" :key="index" class="timeline-item">
                <div class="timeline-marker" :class="getRepairStatusClass(repair)"></div>
                <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h6 class="mb-0">{{ formatRepairType(repair.phuongThucSuaChua) }}</h6>
                        <small class="text-muted">{{ formatDate(repair.ngaySuaChua) }}</small>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge" :class="repair.chiPhi > 0 ? 'bg-danger' : 'bg-success'">
                            {{ repair.chiPhi > 0 ? formatCurrency(repair.chiPhi) : 'Miễn phí' }}
                        </span>
                        <small class="text-muted">Bởi: {{ repair.nhanVien?.ten || 'Hệ thống' }}</small>
                    </div>

                    <div class="repair-details">
                        <p class="mb-1" v-if="repair.tinhTrang">
                            <strong>Tình trạng:</strong> {{ repair.tinhTrang }}
                        </p>
                        <p class="mb-1" v-if="repair.ghiChuNhanVien">
                            <strong>Ghi chú:</strong> {{ repair.ghiChuNhanVien }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatDate } from '@/utils/dateUtils'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
    repairs: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const formatRepairType = (type) => {
    const typeMap = {
        'Sửa chữa tại trung tâm': 'Sửa chữa',
        'Thay thế linh kiện': 'Thay linh kiện',
        'Đổi máy mới': 'Đổi máy mới',
        'Khác': 'Sửa chữa khác'
    }
    return typeMap[type] || type
}

const getRepairStatusClass = (repair) => {
    if (repair.phuongThucSuaChua.includes('Đổi')) return 'bg-success'
    if (repair.phuongThucSuaChua.includes('Thay')) return 'bg-warning'
    return 'bg-primary'
}
</script>

<style scoped>
.warranty-timeline {
    position: relative;
    padding-left: 1.5rem;
}

.timeline-item {
    position: relative;
    padding-bottom: 1.5rem;
    padding-left: 1.5rem;
    border-left: 2px solid #e9ecef;
}

.timeline-item:last-child {
    padding-bottom: 0;
    border-left-color: transparent;
}

.timeline-marker {
    position: absolute;
    left: -8px;
    top: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid white;
}

.timeline-content {
    padding: 0.5rem 0;
}

.repair-details {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 0.5rem;
    font-size: 0.9rem;
}

.badge {
    font-weight: 500;
    padding: 4px 8px;
    font-size: 0.75rem;
}

.bg-primary {
    background-color: #0d6efd;
}

.bg-success {
    background-color: #198754;
}

.bg-warning {
    background-color: #ffc107;
}
</style>