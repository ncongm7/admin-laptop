<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Chi tiết yêu cầu trả hàng #RT{{ returnRequest.id.toString().padStart(6, '0')
                        }}</h5>
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
                                            <h6 class="section-title">Thông tin đơn hàng</h6>
                                            <div class="mb-3">
                                                <label class="form-label">Mã đơn hàng</label>
                                                <p>
                                                    <router-link :to="`/orders/${returnRequest.hoa_don_id}`">
                                                        #HD{{ returnRequest.hoa_don_id.toString().padStart(6, '0') }}
                                                    </router-link>
                                                </p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Ngày mua</label>
                                                <p>{{ formatDate(returnRequest.hoaDon?.created_at) }}</p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Tổng giá trị</label>
                                                <p>{{ formatCurrency(returnRequest.hoaDon?.tongTienSauGiam) }}</p>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="section-title">Thông tin khách hàng</h6>
                                            <div class="d-flex align-items-center mb-3">
                                                <img :src="returnRequest.customerAvatar || defaultAvatar"
                                                    class="rounded-circle me-3" width="50" height="50">
                                                <div>
                                                    <h5 class="mb-0">{{ returnRequest.customerName }}</h5>
                                                    <p class="text-muted mb-0">{{ returnRequest.customerPhone }}</p>
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Địa chỉ nhận lại hàng</label>
                                                <p>{{ returnRequest.hoaDon?.diaChiGiao || 'Chưa có thông tin' }}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-3">
                                        <h6 class="section-title">Lý do trả hàng</h6>
                                        <div class="reason-box p-3 bg-light rounded">
                                            {{ returnRequest.lyDoTraHang }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Danh sách sản phẩm trả -->
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Sản phẩm trả hàng</h5>
                                    <span class="badge bg-primary">
                                        {{ returnRequest.chiTietTraHang.length }} sản phẩm
                                    </span>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>IMEI/SKU</th>
                                                    <th>Số lượng</th>
                                                    <th>Đơn giá</th>
                                                    <th>Thành tiền</th>
                                                    <th>Tình trạng</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="item in returnRequest.chiTietTraHang" :key="item.id">
                                                    <td>
                                                        <div class="d-flex align-items-center">
                                                            <img :src="item.sanPham?.anh || defaultProductImage"
                                                                class="rounded me-2" width="40" height="40">
                                                            <div>
                                                                <strong>{{ item.sanPham?.ten }}</strong>
                                                                <div class="text-muted small">
                                                                    {{ item.sanPham?.ram }} | {{ item.sanPham?.o_cung }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-secondary">
                                                            {{ item.imei_id || 'N/A' }}
                                                        </span>
                                                    </td>
                                                    <td>{{ item.soLuong }}</td>
                                                    <td>{{ formatCurrency(item.donGia) }}</td>
                                                    <td>{{ formatCurrency(item.soLuong * item.donGia) }}</td>
                                                    <td>
                                                        <span class="badge"
                                                            :class="conditionBadgeClass(item.tinhTrangLucTra)">
                                                            {{ item.tinhTrangLucTra || 'Chưa kiểm tra' }}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="d-flex justify-content-end mt-3">
                                        <div class="total-box p-3 bg-light rounded">
                                            <div class="d-flex justify-content-between">
                                                <strong>Tổng giá trị trả:</strong>
                                                <strong class="text-danger">
                                                    {{formatCurrency(returnRequest.chiTietTraHang.reduce((sum, item) =>
                                                        sum + (item.soLuong * item.donGia), 0))}}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Thông tin xử lý -->
                        <div class="col-md-4">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5 class="mb-0">Trạng thái xử lý</h5>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <label class="form-label">Trạng thái hiện tại</label>
                                        <p>
                                            <span class="badge" :class="statusBadgeClass(returnRequest.trangThai)">
                                                {{ returnStatusText(returnRequest.trangThai) }}
                                            </span>
                                        </p>
                                    </div>

                                    <div class="mb-3" v-if="returnRequest.nguoiXuLy">
                                        <label class="form-label">Người xử lý</label>
                                        <div class="d-flex align-items-center">
                                            <img :src="returnRequest.nguoiXuLy?.anh || defaultAvatar"
                                                class="rounded-circle me-2" width="30" height="30">
                                            <span>{{ returnRequest.nguoiXuLy?.ten }}</span>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Ngày tạo yêu cầu</label>
                                        <p>{{ formatDateTime(returnRequest.ngayTao) }}</p>
                                    </div>

                                    <div class="mb-3" v-if="returnRequest.trangThai !== 'DANG_CHO_DUYET'">
                                        <label class="form-label">Thời gian xử lý</label>
                                        <p>{{ formatDateTime(returnRequest.updated_at) }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Lịch sử xử lý -->
                            <ReturnTimeline :returnId="returnRequest.id" />

                            <!-- Action buttons -->
                            <div class="card mt-4">
                                <div class="card-body">
                                    <h5 class="card-title">Hành động</h5>
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-success"
                                            v-if="returnRequest.trangThai === 'DANG_CHO_DUYET'"
                                            @click="$emit('status-changed', { id: returnRequest.id, action: 'DA_DUYET' })">
                                            <i class="bi bi-check-circle"></i> Duyệt yêu cầu
                                        </button>
                                        <button class="btn btn-danger"
                                            v-if="returnRequest.trangThai === 'DANG_CHO_DUYET'"
                                            @click="$emit('status-changed', { id: returnRequest.id, action: 'TU_CHOI' })">
                                            <i class="bi bi-x-circle"></i> Từ chối
                                        </button>
                                        <button class="btn btn-primary" v-if="returnRequest.trangThai === 'DA_DUYET'"
                                            @click="$emit('status-changed', { id: returnRequest.id, action: 'HOAN_TAT' })">
                                            <i class="bi bi-check-all"></i> Hoàn tất
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
</template>

<script setup>
import { formatDate, formatDateTime } from '@/utils/formatters'
import ReturnTimeline from './ReturnTimeline.vue'

const props = defineProps({
    returnRequest: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'status-changed'])

const returnStatusText = (status) => {
    const statusMap = {
        'DANG_CHO_DUYET': 'Chờ duyệt',
        'DA_DUYET': 'Đã duyệt',
        'TU_CHOI': 'Từ chối',
        'HOAN_TAT': 'Hoàn tất'
    }
    return statusMap[status] || status
}

const statusBadgeClass = (status) => {
    return {
        'bg-warning': status === 'DANG_CHO_DUYET',
        'bg-success': status === 'DA_DUYET',
        'bg-danger': status === 'TU_CHOI',
        'bg-secondary': status === 'HOAN_TAT'
    }
}

const conditionBadgeClass = (condition) => {
    if (!condition) return 'bg-light text-dark'

    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('tốt')) return 'bg-success'
    if (conditionLower.includes('hỏng')) return 'bg-danger'
    if (conditionLower.includes('trầy')) return 'bg-warning'
    return 'bg-info'
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

.reason-box {
    background-color: #f8f9fa;
    border-left: 3px solid #0d6efd;
}

.total-box {
    width: 300px;
}

.badge {
    font-weight: 500;
    padding: 6px 10px;
    font-size: 0.8rem;
}

.table {
    margin-bottom: 0;
}

.table th {
    background-color: #f1f5fd;
    font-weight: 600;
}

.btn {
    padding: 8px 16px;
    font-weight: 500;
}

@media (max-width: 768px) {
    .total-box {
        width: 100%;
    }
}
</style>