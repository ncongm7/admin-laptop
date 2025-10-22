<template>
    <div class="product-attributes">
        <div class="attributes-header">
            <h4 class="attributes-title">Thuộc tính sản phẩm</h4>
        </div>

        <div class="attributes-content">
            <div class="row g-4">
                <!-- CPU -->
                <div class="col-md-6">
                    <div class="attribute-card">
                        <div class="attribute-header">
                            <h5 class="attribute-name">
                                <i class="bi bi-cpu"></i> CPU
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" @click="showAttributeModal('cpu')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="attribute-value">
                            {{ product.cpu?.tenCPU || 'Chưa chọn' }}
                        </div>
                    </div>
                </div>

                <!-- GPU -->
                <div class="col-md-6">
                    <div class="attribute-card">
                        <div class="attribute-header">
                            <h5 class="attribute-name">
                                <i class="bi bi-gpu-card"></i> GPU
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" @click="showAttributeModal('gpu')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="attribute-value">
                            {{ product.gpu?.tenGPU || 'Chưa chọn' }}
                        </div>
                    </div>
                </div>

                <!-- RAM -->
                <div class="col-md-6">
                    <div class="attribute-card">
                        <div class="attribute-header">
                            <h5 class="attribute-name">
                                <i class="bi bi-memory"></i> RAM
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" @click="showAttributeModal('ram')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="attribute-value">
                            {{ product.ram?.dungLuong || 'Chưa chọn' }}
                        </div>
                    </div>
                </div>

                <!-- Storage -->
                <div class="col-md-6">
                    <div class="attribute-card">
                        <div class="attribute-header">
                            <h5 class="attribute-name">
                                <i class="bi bi-hdd"></i> Ổ cứng
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" @click="showAttributeModal('storage')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="attribute-value">
                            {{ product.oCung?.tenOCung || 'Chưa chọn' }}
                        </div>
                    </div>
                </div>

                <!-- Screen -->
                <div class="col-md-6">
                    <div class="attribute-card">
                        <div class="attribute-header">
                            <h5 class="attribute-name">
                                <i class="bi bi-display"></i> Màn hình
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" @click="showAttributeModal('screen')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="attribute-value">
                            <div v-if="product.kichThuocManHinh">
                                {{ product.kichThuocManHinh.giaTri }} ({{ product.loaiManHinh?.congNghe || '' }})
                            </div>
                            <div v-else>Chưa chọn</div>
                        </div>
                    </div>
                </div>

                <!-- OS -->
                <div class="col-md-6">
                    <div class="attribute-card">
                        <div class="attribute-header">
                            <h5 class="attribute-name">
                                <i class="bi bi-windows"></i> Hệ điều hành
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" @click="showAttributeModal('os')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="attribute-value">
                            {{ product.heDieuHanh?.tenHĐH || 'Chưa chọn' }}
                        </div>
                    </div>
                </div>

                <!-- Battery -->
                <div class="col-md-6">
                    <div class="attribute-card">
                        <div class="attribute-header">
                            <h5 class="attribute-name">
                                <i class="bi bi-battery-full"></i> Pin
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" @click="showAttributeModal('battery')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="attribute-value">
                            {{ product.dungLuongPin?.dungLuongWh ? `${product.dungLuongPin.dungLuongWh} Wh` : 'Chưa chọn' }}
                        </div>
                    </div>
                </div>

                <!-- Camera -->
                <div class="col-md-6">
                    <div class="attribute-card">
                        <div class="attribute-header">
                            <h5 class="attribute-name">
                                <i class="bi bi-camera"></i> Camera
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" @click="showAttributeModal('camera')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="attribute-value">
                            {{ product.camera?.doPhanGiai || 'Chưa chọn' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Attribute Modal -->
        <div v-if="showModal" class="attribute-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Chọn {{ modalTitle }}</h5>
                    <button class="btn-close" @click="hideModal"></button>
                </div>
                <div class="modal-body">
                    <div class="attribute-options">
                        <div v-for="option in currentOptions" :key="option.id" class="option-item"
                            :class="{ active: isSelected(option) }" @click="selectOption(option)">
                            <div class="option-name">{{ option.name }}</div>
                            <div v-if="isSelected(option)" class="option-check">
                                <i class="bi bi-check"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="hideModal">Hủy</button>
                    <button class="btn btn-primary" @click="saveSelection">Lưu</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    product: {
        type: Object,
        required: true
    },
    cpus: {
        type: Array,
        default: () => []
    },
    gpus: {
        type: Array,
        default: () => []
    },
    rams: {
        type: Array,
        default: () => []
    },
    storages: {
        type: Array,
        default: () => []
    },
    screens: {
        type: Array,
        default: () => []
    },
    displays: {
        type: Array,
        default: () => []
    },
    oses: {
        type: Array,
        default: () => []
    },
    batteries: {
        type: Array,
        default: () => []
    },
    cameras: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:product'])

const showModal = ref(false)
const currentAttribute = ref('')
const selectedOption = ref(null)

const modalTitle = computed(() => {
    const titles = {
        cpu: 'CPU',
        gpu: 'GPU',
        ram: 'RAM',
        storage: 'Ổ cứng',
        screen: 'Màn hình',
        os: 'Hệ điều hành',
        battery: 'Pin',
        camera: 'Camera'
    }
    return titles[currentAttribute.value] || ''
})

const currentOptions = computed(() => {
    switch (currentAttribute.value) {
        case 'cpu':
            return props.cpus.map(cpu => ({ id: cpu.id, name: cpu.tenCPU }))
        case 'gpu':
            return props.gpus.map(gpu => ({ id: gpu.id, name: gpu.tenGPU }))
        case 'ram':
            return props.rams.map(ram => ({ id: ram.id, name: ram.dungLuong }))
        case 'storage':
            return props.storages.map(storage => ({ id: storage.id, name: storage.tenOCung }))
        case 'screen':
            return props.screens.map(screen => ({ id: screen.id, name: screen.giaTri }))
        case 'os':
            return props.oses.map(os => ({ id: os.id, name: os.tenHĐH }))
        case 'battery':
            return props.batteries.map(battery => ({ id: battery.id, name: `${battery.dungLuongWh} Wh` }))
        case 'camera':
            return props.cameras.map(camera => ({ id: camera.id, name: camera.doPhanGiai }))
        default:
            return []
    }
})

const showAttributeModal = (attribute) => {
    currentAttribute.value = attribute
    selectedOption.value = getCurrentSelected(attribute)
    showModal.value = true
}

const hideModal = () => {
    showModal.value = false
}

const getCurrentSelected = (attribute) => {
    switch (attribute) {
        case 'cpu': return props.product.cpu_id
        case 'gpu': return props.product.gpu_id
        case 'ram': return props.product.ram_id
        case 'storage': return props.product.o_cung_id
        case 'screen': return props.product.kichThuocManHinh_id
        case 'os': return props.product.heDieuHanh_id
        case 'battery': return props.product.dungLuongPin_id
        case 'camera': return props.product.camera_id
        default: return null
    }
}

const isSelected = (option) => {
    return selectedOption.value === option.id
}

const selectOption = (option) => {
    selectedOption.value = option.id
}

const saveSelection = () => {
    const updatedProduct = { ...props.product }

    switch (currentAttribute.value) {
        case 'cpu':
            updatedProduct.cpu_id = selectedOption.value
            break
        case 'gpu':
            updatedProduct.gpu_id = selectedOption.value
            break
        case 'ram':
            updatedProduct.ram_id = selectedOption.value
            break
        case 'storage':
            updatedProduct.o_cung_id = selectedOption.value
            break
        case 'screen':
            updatedProduct.kichThuocManHinh_id = selectedOption.value
            break
        case 'os':
            updatedProduct.heDieuHanh_id = selectedOption.value
            break
        case 'battery':
            updatedProduct.dungLuongPin_id = selectedOption.value
            break
        case 'camera':
            updatedProduct.camera_id = selectedOption.value
            break
    }

    emit('update:product', updatedProduct)
    hideModal()
}
</script>

<style scoped>
.product-attributes {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.attributes-header {
    margin-bottom: 20px;
}

.attributes-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.attribute-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    height: 100%;
}

.attribute-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.attribute-name {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.attribute-value {
    font-size: 14px;
    color: #1e293b;
}

.attribute-modal {
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

.modal-content {
    background: white;
    border-radius: 12px;
    width: 500px;
    max-width: 90%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.modal-footer {
    padding: 16px;
    border-top: 1px solid #e2e8f0;
    text-align: right;
}

.attribute-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.option-item {
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;
}

.option-item:hover {
    background: #f1f5f9;
}

.option-item.active {
    border-color: #3b82f6;
    background: #eff6ff;
}

.option-check {
    color: #3b82f6;
}
</style>