<template>
    <div class="imei-management">
        <div class="imei-header">
            <h4 class="imei-title">Quản lý IMEI</h4>
            <div class="imei-actions">
                <button class="btn btn-sm btn-primary me-2" @click="showScanner">
                    <i class="bi bi-upc-scan"></i> Quét IMEI
                </button>
                <button class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-download"></i> Xuất Excel
                </button>
            </div>
        </div>

        <div class="imei-content">
            <!-- Scanner Modal -->
            <div v-if="showScanModal" class="scanner-modal">
                <div class="scanner-content">
                    <div class="scanner-header">
                        <h5>Quét IMEI</h5>
                        <button class="btn-close" @click="hideScanner"></button>
                    </div>
                    <div class="scanner-body">
                        <div class="scanner-preview">
                            <video ref="scannerVideo" class="w-100"></video>
                            <div class="scan-overlay"></div>
                        </div>
                        <div class="scanner-input mt-3">
                            <label class="form-label">Hoặc nhập thủ công</label>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Nhập số IMEI" v-model="manualImei">
                                <button class="btn btn-primary" @click="addManualImei">
                                    <i class="bi bi-plus-lg"></i> Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- IMEI List -->
            <div class="imei-list">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th width="50">#</th>
                                <th>Số IMEI</th>
                                <th>Trạng thái</th>
                                <th>Ngày nhập</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(imei, index) in imeis" :key="imei.id">
                                <td>{{ index + 1 }}</td>
                                <td>
                                    <code>{{ imei.soImei }}</code>
                                </td>
                                <td>
                                    <span class="badge" :class="statusClass(imei.trangThai)">
                                        {{ statusLabel(imei.trangThai) }}
                                    </span>
                                </td>
                                <td>
                                    {{ formatDate(imei.ngayNhapKho) }}
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-danger" @click="removeImei(imei.id)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { formatDate } from '@/utils/helpers'

const props = defineProps({
    imeis: {
        type: Array,
        default: () => []
    },
    variantId: {
        type: Number,
        default: null
    }
})

const emit = defineEmits(['add-imei', 'remove-imei'])

const showScanModal = ref(false)
const manualImei = ref('')
const scannerVideo = ref(null)
let scanner = null

const statusLabel = (status) => {
    const labels = {
        'TRONG_KHO': 'Trong kho',
        'DA_BAN': 'Đã bán',
        'LOI': 'Lỗi',
        'DANG_BAO_HANH': 'Bảo hành'
    }
    return labels[status] || status
}

const statusClass = (status) => {
    const classes = {
        'TRONG_KHO': 'bg-success',
        'DA_BAN': 'bg-primary',
        'LOI': 'bg-danger',
        'DANG_BAO_HANH': 'bg-warning text-dark'
    }
    return classes[status] || 'bg-secondary'
}

const showScanner = () => {
    showScanModal.value = true
    // Initialize scanner here
}

const hideScanner = () => {
    showScanModal.value = false
    // Stop scanner here
}

const addManualImei = () => {
    if (manualImei.value.trim()) {
        emit('add-imei', {
            soImei: manualImei.value.trim(),
            trangThai: 'TRONG_KHO',
            variantId: props.variantId
        })
        manualImei.value = ''
    }
}

const removeImei = (imeiId) => {
    emit('remove-imei', imeiId)
}

onMounted(() => {
    // Initialize scanner if needed
})

onUnmounted(() => {
    // Clean up scanner
})
</script>

<style scoped>
.imei-management {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.imei-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.imei-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.scanner-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
}

.scanner-content {
    background: white;
    border-radius: 12px;
    width: 500px;
    max-width: 90%;
    max-height: 90vh;
    overflow: hidden;
}

.scanner-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
}

.scanner-body {
    padding: 16px;
}

.scanner-preview {
    position: relative;
    width: 100%;
    height: 300px;
    background: black;
    border-radius: 8px;
    overflow: hidden;
}

.scan-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid rgba(255, 255, 255, 0.5);
    animation: scan-animation 2s infinite;
}

@keyframes scan-animation {
    0% {
        top: 0;
    }

    100% {
        top: 100%;
    }
}

.imei-list {
    margin-top: 20px;
}

.table {
    margin-bottom: 0;
}

.table th {
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 0.5px;
}
</style>