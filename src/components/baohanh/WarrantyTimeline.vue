<template>
    <div class="warranty-timeline">
        <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="!warranty" class="text-center py-3 text-muted">
            <i class="bi bi-clock-history fs-4"></i>
            <p class="mt-2 mb-0">Chưa có thông tin bảo hành</p>
        </div>

        <div v-else>
            <!-- Timeline 7 bước -->
            <div v-for="(step, index) in timelineSteps" :key="index" class="timeline-step" :class="getStepClass(step.status)">
                <div class="step-icon">
                    <i :class="step.icon"></i>
                </div>
                <div class="step-content">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="step-title mb-1">{{ step.title }}</h6>
                            <p class="step-description mb-0">{{ step.description }}</p>
                        </div>
                        <span class="badge" :class="step.badgeClass">{{ step.statusText }}</span>
                    </div>
                    <div v-if="step.date" class="step-meta">
                        <small class="text-muted">
                            <i class="bi bi-calendar3 me-1"></i>
                            {{ formatDate(step.date) }}
                        </small>
                        <small v-if="step.employee" class="text-muted ms-3">
                            <i class="bi bi-person me-1"></i>
                            {{ step.employee }}
                        </small>
                    </div>
                    <div v-if="step.details" class="step-details mt-2">
                        <div v-for="(detail, idx) in step.details" :key="idx" class="detail-item">
                            <strong>{{ detail.label }}:</strong> {{ detail.value }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/dateUtils'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
    warranty: {
        type: Object,
        default: null
    },
    lichSuBaoHanh: {
        type: Array,
        default: () => []
    },
    phieuHenList: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const timelineSteps = computed(() => {
    if (!props.warranty) return []
    
    const steps = [
        {
            title: 'Đăng ký bảo hành',
            description: 'Yêu cầu bảo hành đã được gửi và đang chờ xử lý',
            icon: 'bi bi-file-earmark-text',
            status: props.warranty.trangThai >= 0 ? 'completed' : 'pending',
            statusText: props.warranty.trangThai >= 0 ? 'Hoàn thành' : 'Chờ xử lý',
            badgeClass: props.warranty.trangThai >= 0 ? 'bg-success' : 'bg-secondary',
            date: props.warranty.ngayTao,
            employee: null,
            details: []
        },
        {
            title: 'Xác nhận yêu cầu',
            description: 'Hệ thống đã xác nhận yêu cầu bảo hành',
            icon: 'bi bi-check-circle',
            status: props.warranty.trangThai >= 1 ? 'completed' : 'pending',
            statusText: props.warranty.trangThai >= 1 ? 'Hoàn thành' : 'Chờ xử lý',
            badgeClass: props.warranty.trangThai >= 1 ? 'bg-success' : 'bg-secondary',
            date: props.warranty.trangThai >= 1 ? props.warranty.ngayTao : null,
            employee: null,
            details: []
        },
        {
            title: 'Phiếu hẹn',
            description: props.phieuHenList.length > 0 
                ? `Đã tạo phiếu hẹn ${props.phieuHenList[0].maPhieuHen}`
                : 'Chưa tạo phiếu hẹn',
            icon: 'bi bi-calendar-check',
            status: props.phieuHenList.length > 0 
                ? (props.phieuHenList[0].trangThai === 1 ? 'completed' : 'active')
                : 'pending',
            statusText: props.phieuHenList.length > 0 
                ? (props.phieuHenList[0].trangThai === 1 ? 'Đã xác nhận' : 'Chờ xác nhận')
                : 'Chưa tạo',
            badgeClass: props.phieuHenList.length > 0 
                ? (props.phieuHenList[0].trangThai === 1 ? 'bg-success' : 'bg-warning')
                : 'bg-secondary',
            date: props.phieuHenList.length > 0 ? props.phieuHenList[0].ngayHen : null,
            employee: props.phieuHenList.length > 0 ? props.phieuHenList[0].tenNhanVienTao : null,
            details: props.phieuHenList.length > 0 ? [
                { label: 'Địa điểm', value: props.phieuHenList[0].diaDiem || 'Trung tâm bảo hành' },
                { label: 'Ghi chú', value: props.phieuHenList[0].ghiChu || 'Không có' }
            ] : []
        },
        {
            title: 'Tiếp nhận sản phẩm',
            description: 'Sản phẩm đã được tiếp nhận tại trung tâm bảo hành',
            icon: 'bi bi-box-seam',
            status: props.warranty.trangThai >= 2 ? 'completed' : 'pending',
            statusText: props.warranty.trangThai >= 2 ? 'Hoàn thành' : 'Chờ xử lý',
            badgeClass: props.warranty.trangThai >= 2 ? 'bg-success' : 'bg-secondary',
            date: props.lichSuBaoHanh.length > 0 ? props.lichSuBaoHanh[0].ngayNhanHang : null,
            employee: props.lichSuBaoHanh.length > 0 ? props.lichSuBaoHanh[0].tenNhanVienTiepNhan : null,
            details: []
        },
        {
            title: 'Sửa chữa',
            description: 'Sản phẩm đang được kiểm tra và sửa chữa',
            icon: 'bi bi-tools',
            status: props.warranty.trangThai >= 3 ? 'completed' : (props.warranty.trangThai === 2 ? 'active' : 'pending'),
            statusText: props.warranty.trangThai >= 3 ? 'Hoàn thành' : (props.warranty.trangThai === 2 ? 'Đang xử lý' : 'Chờ xử lý'),
            badgeClass: props.warranty.trangThai >= 3 ? 'bg-success' : (props.warranty.trangThai === 2 ? 'bg-primary' : 'bg-secondary'),
            date: props.lichSuBaoHanh.length > 0 ? props.lichSuBaoHanh[0].ngayTiepNhan : null,
            employee: props.lichSuBaoHanh.length > 0 ? props.lichSuBaoHanh[0].tenNhanVienSuaChua : null,
            details: props.lichSuBaoHanh.length > 0 && props.lichSuBaoHanh[0].moTaLoi ? [
                { label: 'Mô tả', value: props.lichSuBaoHanh[0].moTaLoi }
            ] : []
        },
        {
            title: 'Bàn giao',
            description: 'Sản phẩm đã sửa xong, sẵn sàng bàn giao',
            icon: 'bi bi-box-arrow-right',
            status: props.warranty.trangThai >= 4 ? 'completed' : 'pending',
            statusText: props.warranty.trangThai >= 4 ? 'Hoàn thành' : 'Chờ xử lý',
            badgeClass: props.warranty.trangThai >= 4 ? 'bg-success' : 'bg-secondary',
            date: props.lichSuBaoHanh.length > 0 ? props.lichSuBaoHanh[0].ngayBanGiao : null,
            employee: props.lichSuBaoHanh.length > 0 ? props.lichSuBaoHanh[0].tenNhanVienSuaChua : null,
            details: []
        },
        {
            title: 'Hoàn thành',
            description: 'Bảo hành đã hoàn tất',
            icon: 'bi bi-check-circle-fill',
            status: props.warranty.trangThai >= 4 ? 'completed' : 'pending',
            statusText: props.warranty.trangThai >= 4 ? 'Hoàn thành' : 'Chưa hoàn thành',
            badgeClass: props.warranty.trangThai >= 4 ? 'bg-success' : 'bg-secondary',
            date: props.warranty.trangThai >= 4 && props.lichSuBaoHanh.length > 0 ? props.lichSuBaoHanh[0].ngayHoanThanh : null,
            employee: null,
            details: []
        }
    ]
    
    return steps
})

const getStepClass = (status) => {
    return {
        'step-completed': status === 'completed',
        'step-active': status === 'active',
        'step-pending': status === 'pending',
    }
}
</script>

<style scoped>
.warranty-timeline {
    position: relative;
    padding-left: 40px;
}

.timeline-step {
    position: relative;
    padding-bottom: 32px;
    padding-left: 40px;
}

.timeline-step:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 40px;
    bottom: -32px;
    width: 2px;
    background: #e5e7eb;
}

.timeline-step.step-completed:not(:last-child)::before {
    background: #10b981;
}

.step-icon {
    position: absolute;
    left: 0;
    top: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e5e7eb;
    color: #9ca3af;
    z-index: 1;
    font-size: 16px;
}

.step-completed .step-icon {
    background: #10b981;
    color: #ffffff;
}

.step-active .step-icon {
    background: #2563eb;
    color: #ffffff;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.step-content {
    background: #ffffff;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.step-completed .step-content {
    border-color: #10b981;
    background: #f0fdf4;
}

.step-active .step-content {
    border-color: #2563eb;
    background: #eff6ff;
}

.step-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
}

.step-description {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
}

.step-meta {
    display: flex;
    align-items: center;
    margin-top: 8px;
}

.step-details {
    background: #f8fafc;
    padding: 12px;
    border-radius: 6px;
    margin-top: 8px;
}

.detail-item {
    font-size: 13px;
    color: #475569;
    margin-bottom: 4px;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.badge {
    font-weight: 500;
    padding: 4px 8px;
    font-size: 0.75rem;
}
</style>