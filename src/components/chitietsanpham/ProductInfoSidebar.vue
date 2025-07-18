<template>
    <div class="product-info-sidebar card">
        <div class="card-body">
            <div class="text-center mb-4">
                <img :src="productImage" alt="Product image" class="img-fluid rounded"
                    style="max-height: 200px; width: auto;">
            </div>

            <h4 class="card-title text-center">{{ product.tenSanPham || 'Tên sản phẩm' }}</h4>

            <div class="product-meta mt-4">
                <div class="meta-item mb-3">
                    <label class="d-block text-muted small">Hãng sản xuất</label>
                    <span class="fw-bold">{{ getBrandName(product.hangId) || 'N/A' }}</span>
                </div>

                <div class="meta-item mb-3">
                    <label class="d-block text-muted small">CPU</label>
                    <span class="fw-bold">{{ getCpuName(product.cpuId) || 'N/A' }}</span>
                </div>

                <div class="meta-item mb-3">
                    <label class="d-block text-muted small">GPU</label>
                    <span class="fw-bold">{{ getGpuName(product.gpuId) || 'N/A' }}</span>
                </div>

                <div class="meta-item mb-3">
                    <label class="d-block text-muted small">Màn hình</label>
                    <span class="fw-bold">
                        {{ getScreenSizeName(product.kichThuocManHinhId) || 'N/A' }} -
                        {{ getDisplayTypeName(product.loaiManHinhId) || 'N/A' }}
                    </span>
                </div>

                <div class="meta-item mb-3">
                    <label class="d-block text-muted small">Ngày tạo</label>
                    <span class="fw-bold">{{ formatDate(product.createdAt) }}</span>
                </div>
            </div>

            <div class="d-grid mt-4">
                <button class="btn btn-outline-secondary" @click="$emit('back')">
                    <i class="bi bi-arrow-left me-2"></i>Quay lại
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { formatDate } from '@/utils/formatters'
import { useAttributeStore } from '@/stores/attributeStore'

const props = defineProps({
    product: {
        type: Object,
        required: true,
        default: () => ({})
    }
})

defineEmits(['back'])

// Sử dụng attribute store
const attributeStore = useAttributeStore()

// Load attributes khi component được mount
onMounted(async () => {
    if (attributeStore.attributes.brands.length === 0) {
        await attributeStore.fetchAttributes()
        console.log(props.product)
    }
})

// Helper functions để lấy tên từ ID
const getBrandName = (brandId) => {
    if (!brandId) return null
    const brand = attributeStore.getAttributeById('brands', brandId)
    return brand?.tenHang || null
}

const getCpuName = (cpuId) => {
    if (!cpuId) return null
    const cpu = attributeStore.getAttributeById('cpus', cpuId)
    return cpu?.tenCPU || null
}

const getGpuName = (gpuId) => {
    if (!gpuId) return null
    const gpu = attributeStore.getAttributeById('gpus', gpuId)
    return gpu?.tenGPU || null
}

const getScreenSizeName = (screenSizeId) => {
    if (!screenSizeId) return null
    const screenSize = attributeStore.getAttributeById('screens', screenSizeId)
    return screenSize?.giaTri || null
}

const getDisplayTypeName = (displayTypeId) => {
    if (!displayTypeId) return null
    const displayType = attributeStore.getAttributeById('displays', displayTypeId)
    return displayType?.congNghe || null
}

// Lấy ảnh đại diện của sản phẩm
const productImage = computed(() => {
    // Giả sử sản phẩm có danh sách ảnh
    if (props.product.anhSanPhams && props.product.anhSanPhams.length > 0) {
        const defaultImage = props.product.anhSanPhams.find(img => img.is_default)
        return defaultImage ? defaultImage.uri : props.product.anhSanPhams[0].uri
    }
    return 'https://via.placeholder.com/300x200?text=No+Image'
})
</script>

<style scoped>
.product-info-sidebar {
    position: sticky;
    top: 20px;
    height: fit-content;
}

.meta-item {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
}

.meta-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.card-title {
    font-size: 1.25rem;
    color: #333;
    word-break: break-word;
}
</style>