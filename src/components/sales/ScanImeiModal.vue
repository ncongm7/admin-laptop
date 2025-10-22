<template>
    <div class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Quét IMEI sản phẩm</h5>
                    <button type="button" class="btn-close btn-close-white" @click="close"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <div class="scan-area p-4 border rounded" @click="startScanner">
                            <i class="bi bi-upc-scan" style="font-size: 3rem;"></i>
                            <p class="mt-2 mb-0">Nhấn để bật camera quét mã</p>
                        </div>

                        <div v-if="isScanning" class="scanner-container mt-3">
                            <video ref="scanner" class="w-100 rounded"></video>
                            <div class="scan-overlay"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Hoặc nhập thủ công IMEI</label>
                        <input type="text" class="form-control" v-model="manualImei" placeholder="Nhập số IMEI">
                    </div>

                    <div v-if="scannedProduct" class="scan-result mt-3 p-3 bg-light rounded">
                        <h6>Thông tin sản phẩm</h6>
                        <div class="d-flex">
                            <img :src="scannedProduct.image" class="me-3" width="80">
                            <div>
                                <p class="mb-1 fw-bold">{{ scannedProduct.name }}</p>
                                <p class="mb-1 text-muted small">IMEI: {{ scannedImei }}</p>
                                <p class="mb-0 text-success fw-bold">{{ formatPrice(scannedProduct.price) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close">Hủy</button>
                    <button type="button" class="btn btn-primary" :disabled="!scannedProduct && !manualImei"
                        @click="confirmScan">
                        <i class="bi bi-check-circle me-2"></i>
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatPrice } from '@/utils/helpers'

const emit = defineEmits(['close', 'scan-complete'])

const isScanning = ref(false)
const manualImei = ref('')
const scannedImei = ref('')
const scannedProduct = ref(null)
const scanner = ref(null)
let scannerInstance = null

const startScanner = () => {
    isScanning.value = true

    // Giả lập quét IMEI - thực tế sẽ tích hợp với thư viện quét mã
    setTimeout(() => {
        stopScanner()
        scannedImei.value = '123456789012345'
        // Giả lập tìm thấy sản phẩm
        scannedProduct.value = {
            id: 101,
            name: 'MacBook Pro M1 2023',
            price: 25000000,
            image: 'https://example.com/macbook-pro.jpg'
        }
    }, 2000)
}

const stopScanner = () => {
    isScanning.value = false
    if (scannerInstance) {
        scannerInstance.stop()
        scannerInstance = null
    }
}

const confirmScan = () => {
    if (scannedProduct.value) {
        emit('scan-complete', {
            imei: scannedImei.value || manualImei.value,
            product: scannedProduct.value
        })
    } else if (manualImei.value) {
        // Trường hợp nhập thủ công
        emit('scan-complete', {
            imei: manualImei.value,
            product: null // Hệ thống sẽ tìm sản phẩm phù hợp
        })
    }
    close()
}

const close = () => {
    stopScanner()
    emit('close')
}
</script>

<style scoped>
.scan-area {
    cursor: pointer;
    transition: all 0.3s;

}

.modal-content {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    z-index: 1050;
    pointer-events: auto;
}

.modal-body {
    overflow-y: auto;
}

.scan-area:hover {
    background-color: #f8f9fa;
}

.scanner-container {
    position: relative;
    height: 200px;
    /* overflow: hidden; */

}

.scan-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid rgba(13, 110, 253, 0.5);
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

.scan-result {
    border-left: 4px solid var(--bs-primary);
}
</style>