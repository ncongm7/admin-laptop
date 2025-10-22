<template>
    <div class="imei-management">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Quản lý IMEI</h5>
                <div>
                    <button class="btn btn-sm btn-primary me-2" @click="showImportModal">
                        <i class="bi bi-upload me-1"></i> Nhập IMEI
                    </button>
                    <!-- <button class="btn btn-sm btn-success" @click="generateImei">
                        <i class="bi bi-plus-circle me-1"></i> Tạo IMEI
                    </button> -->
                </div>
            </div>

            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>IMEI</th>
                                <th>Trạng thái</th>
                                <th>Ngày nhập kho</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(imei, index) in imeis" :key="imei.id">
                                <td>{{ index + 1 }}</td>
                                <td>
                                    <span class="imei-code">{{ imei.soImei }}</span>
                                    <button class="btn btn-sm btn-link" @click="copyImei(imei.soImei)">
                                        <i class="bi bi-clipboard"></i>
                                    </button>
                                </td>
                                <td>
                                    <span :class="`badge bg-${getStatusClass(imei.trangThai)}`">
                                        {{ formatStatus(imei.trangThai) }}
                                    </span>
                                </td>
                                <td>{{ formatDate(imei.ngayNhapKho) }}</td>
                                <td>
                                    <button v-if="imei.trangThai === 'TRONG_KHO'" class="btn btn-sm btn-outline-danger"
                                        @click="confirmDeleteImei(imei.id)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="imeis.length === 0" class="text-center py-4 text-muted">
                    <i class="bi bi-phone display-4 mb-2"></i>
                    <p class="mt-2">Chưa có IMEI nào cho biến thể này</p>
                    <p class="small">Hãy nhấn <b>Nhập IMEI</b> để thêm mới hoặc import từ Excel.</p>
                </div>
            </div>
        </div>

        <!-- Modal nhập IMEI -->
        <div v-if="showImeiImportModal" class="modal fade show d-block" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <i class="bi bi-upload me-2 fs-4"></i>
                        <h5 class="modal-title flex-grow-1">Nhập danh sách IMEI</h5>
                        <button type="button" class="btn-close btn-close-white" @click="closeImportModal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Nhập IMEI (mỗi dòng 1 IMEI)</label>
                            <textarea v-model="imeiListText" class="form-control mb-2" rows="8"
                                placeholder="Dán IMEI từ Excel hoặc nhập thủ công, mỗi dòng 1 IMEI..."></textarea>
                            <div class="form-text">
                                <i class="bi bi-info-circle me-1"></i>
                                Bạn có thể copy cột IMEI từ file Excel và dán vào đây.<br>
                                <span class="text-muted">(Nếu có thiết bị quét QR/barcode, hãy quét trực tiếp vào ô
                                    này)</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeImportModal">
                            Hủy
                        </button>
                        <button type="button" class="btn btn-primary" @click="importImeis">
                            <i class="bi bi-save me-1"></i> Lưu IMEI
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show" @click="closeImportModal"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { formatDate } from '@/utils/formatters'
import { useImeiStore } from '@/stores/imeiStore'
import { useProductDetailStore } from '@/stores/productDetailStore'

const emit = defineEmits(['open-import-imei'])

const props = defineProps({
    variantId: {
        type: Number,
        required: true
    }
})

const imeiStore = useImeiStore()
const imeis = computed(() => imeiStore.imeis)
const loading = computed(() => imeiStore.loading)
const error = computed(() => imeiStore.error)

const showImeiImportModal = ref(false)
const imeiListText = ref('')

// Lấy danh sách IMEI khi component mounted hoặc variantId thay đổi
onMounted(async () => {
    await imeiStore.fetchImeis(props.variantId)
})

// Hiển thị modal nhập IMEI
const showImportModal = () => {
    emit('open-import-imei')
    showImeiImportModal.value = true
}

// Đóng modal nhập IMEI
const closeImportModal = () => {
    showImeiImportModal.value = false
    imeiListText.value = ''
}

// Nhập IMEI từ textarea
const importImeis = async () => {
    if (!imeiListText.value.trim()) return
    const imeiArray = imeiListText.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
    console.log(imeiArray.length)
    if (imeiArray.length === 0) return
    try {
        console.log('Đang nhập IMEI:', imeiArray)
        console.log('Biến thể ID:', props.variantId)
        await imeiStore.addImeis(props.variantId, imeiArray)
        const productDetailStore = useProductDetailStore()
        await productDetailStore.fetchProductVariants(productDetailStore.productIdGlobal)

        closeImportModal()
    } catch (err) {
        alert('Có lỗi xảy ra khi nhập IMEI. Vui lòng kiểm tra lại.')
    }
}

// Xóa IMEI
const confirmDeleteImei = async (imeiId) => {
    if (confirm('Bạn có chắc muốn xóa IMEI này?')) {
        try {
            await imeiStore.deleteImei(imeiId, props.variantId)
        } catch (err) {
            alert('Có lỗi xảy ra khi xóa IMEI.')
        }
    }
}

// Sao chép IMEI
const copyImei = (imei) => {
    navigator.clipboard.writeText(imei)
    alert('Đã sao chép IMEI vào clipboard!')
}

// Định dạng trạng thái
const formatStatus = (status) => {
    const statusMap = {
        'TRONG_KHO': 'Trong kho',
        'DA_BAN': 'Đã bán',
        'LOI': 'Lỗi',
        'DANG_BAO_HANH': 'Đang bảo hành'
    }
    return statusMap[status] || status
}

// Lớp CSS cho trạng thái
const getStatusClass = (status) => {
    const classMap = {
        'TRONG_KHO': 'success',
        'DA_BAN': 'primary',
        'LOI': 'danger',
        'DANG_BAO_HANH': 'warning'
    }
    return classMap[status] || 'secondary'
}
</script>

<style scoped>
.imei-management {
    margin-top: 20px;
}

.imei-code {
    font-family: monospace;
    font-size: 1.1em;
}

.modal-dialog,
.modal-content {
    z-index: 1060 !important;
    pointer-events: auto;
}

.modal-backdrop {
    z-index: 1050 !important;
    pointer-events: auto;
}

.modal-header.bg-primary {
    background: linear-gradient(90deg, #6366f1 60%, #a5b4fc 100%) !important;
    color: #fff;
    border-radius: 12px 12px 0 0;
    align-items: center;
}

.modal-title {
    font-weight: 600;
    margin: 0;
}

.btn-close-white {
    filter: invert(1);
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.btn-close-white:hover {
    opacity: 1;
}

.form-label.fw-semibold {
    font-weight: 600;
}

.form-text {
    font-size: 0.95em;
    color: #6366f1;
}

.modal-backdrop {
    opacity: 0.5;
}
</style>