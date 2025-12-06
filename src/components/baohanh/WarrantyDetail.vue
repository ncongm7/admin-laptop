<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="modal-title mb-0">Chi tiết bảo hành #WB{{ warranty.id.toString().padStart(6, '0') }}</h5>
                    <div class="d-flex align-items-center gap-2">
                        <!-- Dropdown menu cho các hành động -->
                        <div class="dropdown" @click.stop>
                            <button class="btn btn-light btn-sm dropdown-toggle" type="button"
                                @click="showActionsDropdown = !showActionsDropdown"
                                :class="{ show: showActionsDropdown }" aria-expanded="false">
                                <i class="bi bi-gear me-1"></i>
                                Thông tin phiếu bảo hành
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showActionsDropdown }"
                                @click.stop>
                                <li>
                                    <a class="dropdown-item" href="#" @click.prevent="handleActionClick('appointment')">
                                        <i class="bi bi-calendar-plus me-2"></i>
                                        {{ phieuHenList.length > 0 ? 'Tạo phiếu hẹn mới' : 'Tạo phiếu hẹn' }}
                                    </a>
                                </li>
                                <li>
                                    <hr class="dropdown-divider">
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" @click.prevent="handleActionClick('receive')">
                                        <i class="bi bi-box-seam me-2"></i>
                                        Tiếp nhận sản phẩm
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" @click.prevent="handleActionClick('addCost')">
                                        <i class="bi bi-cash-coin me-2"></i>
                                        Thêm chi phí phát sinh
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" @click.prevent="handleActionClick('handover')">
                                        <i class="bi bi-box-arrow-right me-2"></i>
                                        Bàn giao sản phẩm
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <!-- Tabs Navigation -->
                    <ul class="nav nav-tabs mb-4" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" :class="{ active: activeTab === 'info' }"
                                @click="activeTab = 'info'" type="button">
                                <i class="bi bi-info-circle me-2"></i>Thông tin
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" :class="{ active: activeTab === 'history' }"
                                @click="activeTab = 'history'" type="button">
                                <i class="bi bi-clock-history me-2"></i>Lịch sử
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" :class="{ active: activeTab === 'cost' }"
                                @click="activeTab = 'cost'" type="button">
                                <i class="bi bi-cash-coin me-2"></i>Chi phí
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" :class="{ active: activeTab === 'documents' }"
                                @click="activeTab = 'documents'" type="button">
                                <i class="bi bi-file-earmark-pdf me-2"></i>Tài liệu
                            </button>
                        </li>
                    </ul>

                    <!-- Tab Content -->
                    <div class="tab-content">
                        <!-- Tab Thông tin -->
                        <div v-show="activeTab === 'info'" class="tab-pane fade show active">
                            <div class="row">
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
                                                            <h5 class="mb-0">{{ warranty.productName ||
                                                                warranty.tenSanPham }}</h5>
                                                            <p class="text-muted mb-0">{{ warranty.productSpecs ||
                                                                warranty.maSanPham }}</p>
                                                        </div>
                                                    </div>
                                                    <div class="mb-3">
                                                        <label class="form-label">Serial/IMEI</label>
                                                        <p class="fw-bold">{{ warranty.imei || warranty.soSerial ||
                                                            'N/A' }}</p>
                                                    </div>
                                                    <div class="mb-3">
                                                        <label class="form-label">Ngày bắt đầu</label>
                                                        <p>{{ formatDate(warranty.ngayBatDau) }}</p>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <h6 class="section-title">Thông tin khách hàng</h6>
                                                    <div class="d-flex align-items-center mb-3">
                                                        <img :src="warranty.customerAvatar || defaultAvatar"
                                                            class="rounded-circle me-3" width="60" height="60">
                                                        <div>
                                                            <h5 class="mb-0">{{ warranty.customerName ||
                                                                warranty.hoTenKhachHang }}</h5>
                                                            <p class="text-muted mb-0">{{ warranty.customerPhone ||
                                                                warranty.soDienThoai }}</p>
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

                                            <div v-if="warranty.hinhAnh && warranty.hinhAnh.length > 0" class="mt-3">
                                                <h6 class="section-title">Ảnh minh chứng</h6>
                                                <div class="d-flex flex-wrap gap-2">
                                                    <img v-for="(img, idx) in warranty.hinhAnh" :key="idx" :src="img"
                                                        class="img-thumbnail"
                                                        style="width: 100px; height: 100px; object-fit: cover; cursor: pointer;"
                                                        @click="openImageModal(img)">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card mb-4">
                                        <div class="card-header">
                                            <h5 class="mb-0">Tình trạng bảo hành</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label">Trạng thái</label>
                                                <p>
                                                    <span class="badge"
                                                        :class="statusBadgeClass(warranty.status || warranty.trangThai)">
                                                        {{ warrantyStatusText(warranty.status || warranty.trangThai) }}
                                                    </span>
                                                </p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Mã phiếu</label>
                                                <p class="fw-bold">{{ warranty.maPhieuBaoHanh || shortId(warranty.id) }}
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
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Thay đổi trạng thái -->
                                    <div class="card mb-4">
                                        <div class="card-header bg-secondary text-white">
                                            <h6 class="mb-0">
                                                <i class="bi bi-gear me-2"></i>
                                                Thay đổi trạng thái
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label">Chọn trạng thái mới:</label>
                                                <select v-model="selectedStatus" class="form-select"
                                                    :disabled="updatingStatus">
                                                    <option :value="null">-- Chọn trạng thái --</option>
                                                    <option :value="0">Chờ xử lý</option>
                                                    <option :value="1">Đã tiếp nhận</option>
                                                    <option :value="2">Đang sửa chữa</option>
                                                    <option :value="3">Chờ bàn giao</option>
                                                    <option :value="4">Hoàn thành</option>
                                                    <option :value="5">Đã hủy</option>
                                                </select>
                                            </div>
                                            <div v-if="selectedStatus === 4" class="alert alert-info mb-3">
                                                <i class="bi bi-info-circle me-2"></i>
                                                Có thể chuyển sang hoàn thành sau khi sửa chữa xong
                                            </div>
                                            <button class="btn btn-primary w-100 mb-3" @click="handleUpdateStatus"
                                                :disabled="!selectedStatus || selectedStatus === (warranty.trangThai || warranty.status) || updatingStatus">
                                                <span v-if="updatingStatus"
                                                    class="spinner-border spinner-border-sm me-2"></span>
                                                <i v-else class="bi bi-check-circle me-2"></i>
                                                Cập nhật trạng thái
                                            </button>

                                            <hr class="my-3">

                                            <h6 class="mb-3">Hành động khác:</h6>
                                            <div class="d-grid gap-2">
                                                <button class="btn btn-primary" @click="openCreateAppointmentModal"
                                                    :disabled="showCreateAppointmentModal">
                                                    <i class="bi bi-calendar-plus me-1"></i>
                                                    {{ phieuHenList.length > 0 ? 'Tạo phiếu hẹn mới' : 'Tạo phiếu hẹn'
                                                    }}
                                                </button>
                                                <button class="btn btn-info" @click="openReceiveModal">
                                                    <i class="bi bi-box-seam me-1"></i>Tiếp nhận sản phẩm
                                                </button>
                                                <button class="btn btn-warning" @click="openAddCostModal">
                                                    <i class="bi bi-cash-coin me-1"></i>Thêm chi phí phát sinh
                                                </button>
                                                <button class="btn btn-success" @click="openHandoverModal">
                                                    <i class="bi bi-box-arrow-right me-1"></i>Bàn giao sản phẩm
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Phiếu hẹn hiện có -->
                                    <div v-if="phieuHenList.length > 0" class="card mb-4">
                                        <div class="card-header bg-info text-white">
                                            <h6 class="mb-0">
                                                <i class="bi bi-calendar-check me-2"></i>
                                                Phiếu hẹn bảo hành
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <div v-for="phieuHen in phieuHenList" :key="phieuHen.id"
                                                class="appointment-card mb-3 p-3 bg-light rounded">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <strong class="text-primary">{{ phieuHen.maPhieuHen }}</strong>
                                                        <span
                                                            :class="['badge ms-2', getPhieuHenStatusBadgeClass(phieuHen.trangThai)]">
                                                            {{ getPhieuHenStatusText(phieuHen.trangThai) }}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="small text-muted">
                                                    <div><i class="bi bi-calendar3 me-1"></i>{{
                                                        formatDate(phieuHen.ngayHen) }}</div>
                                                    <div><i class="bi bi-clock me-1"></i>{{ formatTime(phieuHen.gioHen)
                                                        }}</div>
                                                    <div><i class="bi bi-geo-alt me-1"></i>{{ phieuHen.diaDiem }}</div>
                                                    <div v-if="phieuHen.ghiChu" class="mt-2">
                                                        <i class="bi bi-chat-left-text me-1"></i>{{ phieuHen.ghiChu }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Nút quay lại -->
                                    <div class="card">
                                        <div class="card-body">
                                            <button class="btn btn-outline-secondary w-100" @click="$emit('close')">
                                                <i class="bi bi-arrow-left me-1"></i>Quay lại danh sách
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab Lịch sử -->
                        <div v-show="activeTab === 'history'" class="tab-pane fade">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Lịch sử bảo hành</h5>
                                </div>
                                <div class="card-body">
                                    <WarrantyTimeline :warranty="warranty" :lichSuBaoHanh="lichSuBaoHanh"
                                        :phieuHenList="phieuHenList" :loading="loadingHistory" />
                                </div>
                            </div>
                        </div>

                        <!-- Tab Chi phí -->
                        <div v-show="activeTab === 'cost'" class="tab-pane fade">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Chi phí bảo hành</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Lần</th>
                                                    <th>Ngày</th>
                                                    <th>Lý do</th>
                                                    <th class="text-end">Chi phí phát sinh</th>
                                                    <th class="text-center">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(ls, idx) in lichSuBaoHanh" :key="idx">
                                                    <td>{{ idx + 1 }}</td>
                                                    <td>{{ formatDate(ls.ngayTiepNhan) }}</td>
                                                    <td>{{ ls.moTaLoi || 'N/A' }}</td>
                                                    <td class="text-end">{{ formatCurrency(ls.chiPhiPhatSinh || 0) }}
                                                    </td>
                                                    <td class="text-center">
                                                        <span
                                                            :class="['badge', ls.daThanhToan ? 'bg-success' : 'bg-warning']">
                                                            {{ ls.daThanhToan ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr v-if="lichSuBaoHanh.length === 0">
                                                    <td colspan="5" class="text-center text-muted">Chưa có chi phí phát
                                                        sinh</td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <th colspan="3">Tổng cộng</th>
                                                    <th class="text-end">{{ formatCurrency(totalCost) }}</th>
                                                    <th></th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab Tài liệu -->
                        <div v-show="activeTab === 'documents'" class="tab-pane fade">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Tài liệu bảo hành</h5>
                                </div>
                                <div class="card-body">
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-outline-primary" @click="downloadPhieuBaoHanh">
                                            <i class="bi bi-file-earmark-pdf me-2"></i>Tải phiếu bảo hành (PDF)
                                        </button>
                                        <button v-if="phieuHenList.length > 0" class="btn btn-outline-success"
                                            @click="downloadPhieuHen">
                                            <i class="bi bi-file-earmark-pdf me-2"></i>Tải phiếu hẹn (PDF)
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

    <!-- Admin Modals -->
    <CreateAppointmentModal v-if="showCreateAppointmentModal" :warranty="warranty"
        @close="showCreateAppointmentModal = false" @success="handleModalSuccess" />
    <ReceiveProductModal v-if="showReceiveModal" :warranty="warranty" @close="showReceiveModal = false"
        @success="handleModalSuccess" />
    <AddCostModal v-if="showAddCostModal" :warranty="warranty" :lichSuBaoHanh="lichSuBaoHanh"
        @close="showAddCostModal = false" @success="handleModalSuccess" />
    <HandoverProductModal v-if="showHandoverModal" :warranty="warranty" @close="showHandoverModal = false"
        @success="handleModalSuccess" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useWarrantyStore } from '@/stores/warrantyStore'
import WarrantyTimeline from './WarrantyTimeline.vue'
import CreateAppointmentModal from './CreateAppointmentModal.vue'
import ReceiveProductModal from './ReceiveProductModal.vue'
import AddCostModal from './AddCostModal.vue'
import HandoverProductModal from './HandoverProductModal.vue'
import { formatDate, formatDateInput } from '@/utils/dateUtils'
import { formatCurrency } from '@/utils/formatters'
import { getPhieuBaoHanhById, updateTrangThai } from '@/service/baohanh/PhieuBaoHanhService'
import phieuHenBaoHanhService from '@/service/baohanh/phieuHenBaoHanhService'
import { LayLichSuBaoHanh } from '@/service/baohanh/LichSuBaoHanhService'

const props = defineProps({
    warranty: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'status-changed', 'refresh', 'warranty-updated'])

const warrantyStore = useWarrantyStore()

const activeTab = ref('info')
const lichSuBaoHanh = ref([])
const phieuHenList = ref([])
const loadingHistory = ref(false)
const showCreateAppointmentModal = ref(false)
const showReceiveModal = ref(false)
const showAddCostModal = ref(false)
const showHandoverModal = ref(false)
const defaultProductImage = '/images/default-product.png'
const defaultAvatar = '/images/default-avatar.png'
const selectedStatus = ref(null)
const updatingStatus = ref(false)
const showActionsDropdown = ref(false)

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

const totalCost = computed(() => {
    return lichSuBaoHanh.value.reduce((sum, ls) => sum + (ls.chiPhiPhatSinh || 0), 0)
})

const shortId = (id) => {
    if (!id) return 'N/A'
    return id.toString().substring(0, 8).toUpperCase()
}

const warrantyStatusText = (status) => {
    // Nếu status là số (0-5)
    if (typeof status === 'number') {
        const statusMap = {
            0: 'Chờ xử lý',
            1: 'Đã tiếp nhận',
            2: 'Đang sửa chữa',
            3: 'Chờ bàn giao',
            4: 'Hoàn thành',
            5: 'Đã hủy'
        }
        return statusMap[status] || `Trạng thái ${status}`
    }
    // Nếu status là string (backward compatibility)
    const statusMap = {
        'ACTIVE': 'Đang bảo hành',
        'EXPIRED': 'Hết hạn',
        'CANCELLED': 'Đã hủy',
        'CHO_XU_LY': 'Chờ xử lý',
        'DA_TIEP_NHAN': 'Đã tiếp nhận',
        'DANG_SUA_CHUA': 'Đang sửa chữa',
        'CHO_BAN_GIAO': 'Chờ bàn giao',
        'HOAN_THANH': 'Hoàn thành',
        'DA_HUY': 'Đã hủy'
    }
    return statusMap[status] || status
}

const formatTime = (time) => {
    if (!time) return '—'
    // time có thể là "HH:mm" hoặc LocalTime object
    if (typeof time === 'string') return time
    return time.toString()
}

const getPhieuHenStatusText = (status) => {
    switch (status) {
        case 0:
            return 'Chờ xác nhận'
        case 1:
            return 'Đã xác nhận'
        case 2:
            return 'Đã hủy'
        default:
            return 'Không xác định'
    }
}

const getPhieuHenStatusBadgeClass = (status) => {
    switch (status) {
        case 0:
            return 'bg-warning text-dark'
        case 1:
            return 'bg-success'
        case 2:
            return 'bg-danger'
        default:
            return 'bg-secondary'
    }
}

const statusBadgeClass = (status) => {
    // Nếu status là số (0-5)
    if (typeof status === 'number') {
        const classMap = {
            0: 'bg-warning text-dark', // Chờ xử lý
            1: 'bg-info text-white', // Đã tiếp nhận
            2: 'bg-primary text-white', // Đang sửa chữa
            3: 'bg-warning text-dark', // Chờ bàn giao
            4: 'bg-success text-white', // Hoàn thành
            5: 'bg-danger text-white' // Đã hủy
        }
        return classMap[status] || 'bg-secondary'
    }
    // Nếu status là string (backward compatibility)
    return {
        'bg-success': status === 'ACTIVE' || status === 'HOAN_THANH',
        'bg-secondary': status === 'EXPIRED',
        'bg-danger': status === 'CANCELLED' || status === 'DA_HUY',
        'bg-warning text-dark': status === 'CHO_XU_LY' || status === 'CHO_BAN_GIAO',
        'bg-info text-white': status === 'DA_TIEP_NHAN',
        'bg-primary text-white': status === 'DANG_SUA_CHUA'
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
        // Emit event để parent component update warranty
        emit('warranty-updated', updatedWarranty)
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

const fetchHistory = async () => {
    loadingHistory.value = true
    try {
        // Fetch lịch sử bảo hành
        const lichSu = await LayLichSuBaoHanh(props.warranty.id)
        lichSuBaoHanh.value = Array.isArray(lichSu) ? lichSu : (lichSu?.data || [])

        // Fetch phiếu hẹn
        const phieuHen = await phieuHenBaoHanhService.getPhieuHenByBaoHanh(props.warranty.id)
        phieuHenList.value = Array.isArray(phieuHen) ? phieuHen : []
    } catch (error) {
        console.error('Error fetching history:', error)
    } finally {
        loadingHistory.value = false
    }
}

const openCreateAppointmentModal = () => {
    showCreateAppointmentModal.value = true
}

const openReceiveModal = () => {
    showReceiveModal.value = true
}

const openAddCostModal = () => {
    showAddCostModal.value = true
}

const openHandoverModal = () => {
    showHandoverModal.value = true
}

const handleActionClick = (action) => {
    showActionsDropdown.value = false
    switch (action) {
        case 'appointment':
            openCreateAppointmentModal()
            break
        case 'receive':
            openReceiveModal()
            break
        case 'addCost':
            openAddCostModal()
            break
        case 'handover':
            openHandoverModal()
            break
    }
}

const downloadPhieuBaoHanh = () => {
    // TODO: Implement PDF download
    window.open(`/api/v1/bao-hanh/${props.warranty.id}/pdf`, '_blank')
}

const downloadPhieuHen = () => {
    if (phieuHenList.value.length > 0) {
        // TODO: Implement PDF download
        window.open(`/api/v1/phieu-hen-bao-hanh/${phieuHenList.value[0].id}/pdf`, '_blank')
    }
}

const openImageModal = (imgUrl) => {
    // TODO: Implement image modal
    window.open(imgUrl, '_blank')
}

const handleModalSuccess = (data) => {
    // Nếu là tạo phiếu hẹn thành công, refresh history để hiển thị phiếu hẹn mới
    if (data?.phieuHen) {
        console.log('✅ [WarrantyDetail] Phiếu hẹn đã được tạo:', data.phieuHen)
    }
    fetchHistory()
    emit('refresh')
    // KHÔNG đóng modal CreateAppointmentModal - để admin tiếp tục làm việc
    // showCreateAppointmentModal.value = false // ❌ XÓA DÒNG NÀY
}

const handleUpdateStatus = async () => {
    if (!selectedStatus.value && selectedStatus.value !== 0) {
        alert('Vui lòng chọn trạng thái mới')
        return
    }

    const currentStatus = props.warranty?.trangThai || props.warranty?.status
    if (selectedStatus.value === currentStatus) {
        alert('Trạng thái đã được chọn rồi')
        return
    }

    if (!confirm(`Bạn có chắc muốn chuyển trạng thái từ "${warrantyStatusText(currentStatus)}" sang "${warrantyStatusText(selectedStatus.value)}"?`)) {
        return
    }

    updatingStatus.value = true
    try {
        await updateTrangThai(props.warranty.id, selectedStatus.value)
        alert('Cập nhật trạng thái thành công!')
        selectedStatus.value = null
        emit('refresh') // Refresh để cập nhật dữ liệu mới
        // Refresh warranty data
        const updatedWarranty = await getPhieuBaoHanhById(props.warranty.id)
        // Update props.warranty bằng cách emit event để parent component update
        emit('warranty-updated', updatedWarranty)
    } catch (error) {
        console.error('❌ [WarrantyDetail] Lỗi khi cập nhật trạng thái:', error)
        alert('Có lỗi xảy ra khi cập nhật trạng thái: ' + (error.message || 'Lỗi không xác định'))
    } finally {
        updatingStatus.value = false
    }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
    if (showActionsDropdown.value && !event.target.closest('.dropdown')) {
        showActionsDropdown.value = false
    }
}

onMounted(() => {
    fetchHistory()
    // Set selectedStatus to current status
    selectedStatus.value = props.warranty?.trangThai || props.warranty?.status || null
    // Add click outside listener
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    // Remove click outside listener
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.modal-content {
    border: none;
    border-radius: 10px;
}

.modal-header {
    padding: 15px 20px;
}

.modal-header .dropdown-toggle {
    color: #212529;
    background-color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header .dropdown-toggle:hover {
    background-color: #f8f9fa;
    border-color: rgba(255, 255, 255, 0.5);
}

.modal-header .dropdown-menu {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.15);
}

.modal-header .dropdown-item {
    padding: 0.5rem 1rem;
    transition: background-color 0.15s ease-in-out;
}

.modal-header .dropdown-item:hover {
    background-color: #f8f9fa;
}

.modal-header .dropdown-item i {
    width: 20px;
    text-align: center;
}

.modal-header .dropdown-menu.show {
    display: block;
}

/* Click outside to close dropdown */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header .dropdown-menu.show {
    animation: fadeIn 0.2s ease-out;
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

.appointment-card {
    border-left: 4px solid #0dcaf0;
    transition: all 0.2s;
}

.appointment-card:hover {
    background: #e0f7fa !important;
    transform: translateX(4px);
}
</style>