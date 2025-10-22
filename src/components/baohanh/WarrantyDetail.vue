<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Chi tiết bảo hành #WB{{ warranty.id.toString().padStart(6, '0') }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <!-- Thông tin chính -->
                        <div class="col-md-8">
                            <div class="card mb-4">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6 class="section-title">Thông tin sản phẩm</h6>
                                            <div class="d-flex align-items-center mb-3">
                                                <img :src="warranty.productImage || defaultProductImage"
                                                    class="rounded me-3" width="60" height="60">
                                                <div>
                                                    <h5 class="mb-0">{{ warranty.productName }}</h5>
                                                    <p class="text-muted mb-0">{{ warranty.productSpecs }}</p>
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Số IMEI</label>
                                                <p class="fw-bold">{{ warranty.imei }}</p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Ngày mua</label>
                                                <p>{{ formatDate(warranty.ngayBatDau) }}</p>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="section-title">Thông tin khách hàng</h6>
                                            <div class="d-flex align-items-center mb-3">
                                                <img :src="warranty.customerAvatar || defaultAvatar"
                                                    class="rounded-circle me-3" width="60" height="60">
                                                <div>
                                                    <h5 class="mb-0">{{ warranty.customerName }}</h5>
                                                    <p class="text-muted mb-0">{{ warranty.customerPhone }}</p>
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Địa chỉ</label>
                                                <p>{{ warranty.customerAddress || 'N/A' }}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-3">
                                        <h6 class="section-title">Mô tả bảo hành</h6>
                                        <div class="p-3 bg-light rounded">
                                            {{ warranty.moTa || 'Không có mô tả' }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Lịch sử sửa chữa -->
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Lịch sử sửa chữa</h5>
                                    <button class="btn btn-sm btn-primary" @click="openRepairModal"
                                        v-if="warranty.status === 'ACTIVE'">
                                        <i class="bi bi-plus"></i> Thêm sửa chữa
                                    </button>
                                </div>
                                <div class="card-body">
                                    <WarrantyTimeline :repairs="warranty.lichSuSuaChua || []"
                                        @repair-added="fetchWarrantyDetail" />
                                </div>
                            </div>
                        </div>

                        <!-- Thông tin bảo hành -->
                        <div class="col-md-4">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5 class="mb-0">Tình trạng bảo hành</h5>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <label class="form-label">Trạng thái</label>
                                        <p>
                                            <span class="badge" :class="statusBadgeClass(warranty.status)">
                                                {{ warrantyStatusText(warranty.status) }}
                                            </span>
                                        </p>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Thời hạn bảo hành</label>
                                        <div class="d-flex justify-content-between">
                                            <span>{{ formatDate(warranty.ngayBatDau) }}</span>
                                            <span>→</span>
                                            <span>{{ formatDate(warranty.ngayKetThuc) }}</span>
                                        </div>
                                        <div class="progress mt-2" style="height: 10px;">
                                            <div class="progress-bar"
                                                :class="warranty.remainingDays > 0 ? 'bg-success' : 'bg-secondary'"
                                                :style="warrantyProgress"></div>
                                        </div>
                                        <div class="text-center mt-1"
                                            :class="getRemainingDaysClass(warranty.remainingDays)">
                                            {{ getRemainingDaysText(warranty.remainingDays) }}
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Số lần sửa chữa</label>
                                        <p>{{ warranty.lichSuSuaChua?.length || 0 }} lần</p>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Tổng chi phí sửa chữa</label>
                                        <p>{{ formatCurrency(totalRepairCost) }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Hành động -->
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Hành động</h5>
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-outline-warning" @click="extendWarranty"
                                            v-if="warranty.status === 'ACTIVE'">
                                            <i class="bi bi-calendar-plus"></i> Gia hạn
                                        </button>
                                        <button class="btn btn-outline-danger" @click="confirmCancel"
                                            v-if="warranty.status === 'ACTIVE'">
                                            <i class="bi bi-x-circle"></i> Hủy bảo hành
                                        </button>
                                        <button class="btn btn-outline-secondary" @click="$emit('close')">
                                            <i class="bi bi-arrow-left"></i> Quay lại
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Repair Modal -->
    <div class="modal fade" :class="{ show: showRepairModal }" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Thêm sửa chữa bảo hành</h5>
                    <button type="button" class="btn-close btn-close-white" @click="showRepairModal = false"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="addRepair">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Ngày sửa chữa <span class="text-danger">*</span></label>
                                <input v-model="repairForm.ngaySuaChua" type="date" class="form-control" required
                                    :max="formatDateInput(new Date())">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Chi phí (VND)</label>
                                <input v-model="repairForm.chiPhi" type="number" class="form-control" min="0">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Phương thức sửa chữa <span class="text-danger">*</span></label>
                            <select v-model="repairForm.phuongThucSuaChua" class="form-select" required>
                                <option value="">Chọn phương thức</option>
                                <option value="Sửa chữa tại trung tâm">Sửa chữa tại trung tâm</option>
                                <option value="Thay thế linh kiện">Thay thế linh kiện</option>
                                <option value="Đổi máy mới">Đổi máy mới</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Ghi chú của kỹ thuật viên</label>
                            <textarea v-model="repairForm.ghiChuNhanVien" class="form-control" rows="3"></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Tình trạng sản phẩm</label>
                            <textarea v-model="repairForm.tinhTrang" class="form-control" rows="3"></textarea>
                        </div>

                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-secondary me-2" @click="showRepairModal = false">
                                Hủy bỏ
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="addingRepair">
                                <span v-if="addingRepair" class="spinner-border spinner-border-sm me-1"></span>
                                Lưu thông tin
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWarrantyStore } from '@/stores/warrantyStore'
import WarrantyTimeline from './WarrantyTimeline.vue'
import { formatDate, formatDateInput } from '@/utils/dateUtils'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
    warranty: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'status-changed'])

const warrantyStore = useWarrantyStore()

// Repair modal
const showRepairModal = ref(false)
const addingRepair = ref(false)
const repairForm = ref({
    ngaySuaChua: formatDateInput(new Date()),
    chiPhi: 0,
    phuongThucSuaChua: '',
    ghiChuNhanVien: '',
    tinhTrang: ''
})

// Computed
const warrantyProgress = computed(() => {
    const totalDays = Math.ceil((new Date(props.warranty.ngayKetThuc) - new Date(props.warranty.ngayBatDau)) / (1000 * 60 * 60 * 24))
    const passedDays = Math.ceil((new Date() - new Date(props.warranty.ngayBatDau)) / (1000 * 60 * 60 * 24))
    const percentage = Math.min(100, Math.max(0, (passedDays / totalDays) * 100))
    return { width: `${percentage}%` }
})

const totalRepairCost = computed(() => {
    return props.warranty.lichSuSuaChua?.reduce((sum, repair) => sum + (repair.chiPhi || 0), 0) || 0
})

const warrantyStatusText = (status) => {
    const statusMap = {
        'ACTIVE': 'Đang bảo hành',
        'EXPIRED': 'Hết hạn',
        'CANCELLED': 'Đã hủy'
    }
    return statusMap[status] || status
}

const statusBadgeClass = (status) => {
    return {
        'bg-success': status === 'ACTIVE',
        'bg-secondary': status === 'EXPIRED',
        'bg-danger': status === 'CANCELLED'
    }
}

const getRemainingDaysText = (days) => {
    if (days === 0) return 'Hết hạn hôm nay'
    if (days > 0) return `Còn ${days} ngày`
    return `Quá hạn ${Math.abs(days)} ngày`
}

const getRemainingDaysClass = (days) => {
    if (days === 0) return 'text-warning fw-bold'
    if (days > 0) {
        if (days <= 30) return 'text-warning'
        return 'text-success'
    }
    return 'text-danger'
}

// Methods
const openRepairModal = () => {
    showRepairModal.value = true
}

const addRepair = async () => {
    try {
        addingRepair.value = true

        const repairData = {
            ...repairForm.value,
            chiPhi: Number(repairForm.value.chiPhi) || 0
        }

        await warrantyStore.addRepair(props.warranty.id, repairData)
        await fetchWarrantyDetail()
        showRepairModal.value = false
        resetRepairForm()
    } catch (error) {
        console.error('Error adding repair:', error)
    } finally {
        addingRepair.value = false
    }
}

const resetRepairForm = () => {
    repairForm.value = {
        ngaySuaChua: formatDateInput(new Date()),
        chiPhi: 0,
        phuongThucSuaChua: '',
        ghiChuNhanVien: '',
        tinhTrang: ''
    }
}

const fetchWarrantyDetail = async () => {
    try {
        const updatedWarranty = await warrantyStore.getWarrantyById(props.warranty.id)
        Object.assign(props.warranty, updatedWarranty)
    } catch (error) {
        console.error('Error fetching warranty detail:', error)
    }
}

const extendWarranty = async () => {
    const newEndDate = prompt('Nhập ngày kết thúc mới (YYYY-MM-DD):', props.warranty.ngayKetThuc)
    if (newEndDate && newEndDate !== props.warranty.ngayKetThuc) {
        try {
            await warrantyStore.updateWarranty(props.warranty.id, {
                ...props.warranty,
                ngayKetThuc: newEndDate
            })
            emit('status-changed')
        } catch (error) {
            console.error('Error extending warranty:', error)
            alert('Có lỗi xảy ra khi gia hạn bảo hành')
        }
    }
}

const confirmCancel = () => {
    if (confirm('Bạn chắc chắn muốn hủy bảo hành này?')) {
        cancelWarranty()
    }
}

const cancelWarranty = async () => {
    try {
        await warrantyStore.updateWarranty(props.warranty.id, {
            ...props.warranty,
            trangThai: 'CANCELLED'
        })
        emit('status-changed')
    } catch (error) {
        console.error('Error cancelling warranty:', error)
    }
}
</script>

<style scoped>
.modal-content {
    border: none;
    border-radius: 10px;
}

.modal-header {
    padding: 15px 20px;
}

.modal-title {
    font-weight: 600;
}

.modal-body {
    padding: 20px;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #dee2e6;
}

.badge {
    font-weight: 500;
    padding: 6px 10px;
    font-size: 0.8rem;
}

.progress {
    background-color: #e9ecef;
    border-radius: 10px;
}

.btn {
    padding: 8px 16px;
    font-weight: 500;
}

.modal {
    background-color: rgba(0, 0, 0, 0.5);
}
</style>