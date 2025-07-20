<template>
    <div class="product-filter">
        <div class="filter-header">
            <h3 class="filter-title">Bộ lọc sản phẩm</h3>
            <button class="btn btn-sm btn-link" @click="resetFilters">
                <i class="bi bi-arrow-counterclockwise"></i> Đặt lại
            </button>
        </div>

        <div class="filter-content">
            <div class="row g-3">
                <!-- Keyword Search -->
                <div class="col-md-12">
                    <div class="form-group">
                        <label class="form-label">Tìm kiếm</label>
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Nhập tên sản phẩm..."
                                v-model="localFilters.keyword">
                            <button class="btn btn-outline-secondary" type="button">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Brand Filter -->
                <div class="col-md-3">
                    <div class="form-group">
                        <label class="form-label">Hãng</label>
                        <select class="form-select" v-model="localFilters.brand">
                            <option :value="null">Tất cả hãng</option>
                            <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.tenHang }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- CPU Filter -->
                <div class="col-md-3">
                    <div class="form-group">
                        <label class="form-label">CPU</label>
                        <select class="form-select" v-model="localFilters.cpu">
                            <option :value="null">Tất cả CPU</option>
                            <option v-for="cpu in cpus" :key="cpu.id" :value="cpu.id">{{ cpu.tenCPU }}</option>
                        </select>
                    </div>
                </div>

                <!-- RAM Filter -->
                <div class="col-md-3">
                    <div class="form-group">
                        <label class="form-label">RAM</label>
                        <select class="form-select" v-model="localFilters.ram">
                            <option :value="null">Tất cả RAM</option>
                            <option v-for="ram in rams" :key="ram.id" :value="ram.id">{{ ram.dungLuong }}</option>
                        </select>
                    </div>
                </div>

                <!-- GPU Filter -->
                <div class="col-md-3">
                    <div class="form-group">
                        <label class="form-label">GPU</label>
                        <select class="form-select" v-model="localFilters.gpu">
                            <option :value="null">Tất cả GPU</option>
                            <option v-for="gpu in gpus" :key="gpu.id" :value="gpu.id">{{ gpu.tenGPU }}</option>
                        </select>
                    </div>
                </div>

                <!-- Price Range -->
                <div class="col-md-12">
                    <div class="form-group">
                        <label class="form-label">Khoảng giá</label>
                        <div class="row g-2">
                            <div class="col">
                                <input type="number" class="form-control" placeholder="Từ"
                                    v-model="localFilters.minPrice">
                            </div>
                            <div class="col-auto d-flex align-items-center">
                                <span class="text-muted">-</span>
                            </div>
                            <div class="col">
                                <input type="number" class="form-control" placeholder="Đến"
                                    v-model="localFilters.maxPrice">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="filter-footer">
            <button class="btn btn-primary" @click="applyFilters">
                <i class="bi bi-funnel"></i> Áp dụng bộ lọc
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAttributeStore } from '@/stores/attributeStore'

const emit = defineEmits(['filter', 'reset'])

const attributeStore = useAttributeStore()
// Fetch attributes if not already loaded
if (!attributeStore.getBrands.length) {
    attributeStore.fetchAttributes()
}

const brands = computed(() => attributeStore.getBrands)
const cpus = computed(() => attributeStore.getCpus)
const rams = computed(() => attributeStore.getRams)
const gpus = computed(() => attributeStore.getGpus)

const localFilters = ref({
    brand: null,
    cpu: null,
    ram: null,
    gpu: null,
    minPrice: null,
    maxPrice: null,
    keyword: ''
})

const applyFilters = () => {
    emit('filter', { ...localFilters.value })
}

const resetFilters = () => {
    localFilters.value = {
        brand: null,
        cpu: null,
        ram: null,
        gpu: null,
        minPrice: null,
        maxPrice: null,
        keyword: ''
    }
    emit('reset')
}

onMounted(() => {
    if (
        brands.value.length === 0 ||
        cpus.value.length === 0 ||
        rams.value.length === 0 ||
        gpus.value.length === 0
    ) {
        attributeStore.fetchAttributes()
    }
})
</script>

<style scoped>
.product-filter {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
}

.filter-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #1e293b;
}

.filter-content {
    padding: 16px;
}

.filter-footer {
    padding: 16px;
    border-top: 1px solid #f1f5f9;
    text-align: right;
}

.form-group {
    margin-bottom: 0;
}

.form-label {
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 8px;
    display: block;
}
</style>