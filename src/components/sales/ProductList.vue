<template>
    <div class="product-list">
        <div class="search-bar mb-3">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Tìm kiếm sản phẩm..." v-model="searchQuery">
                <button class="btn btn-outline-secondary" @click="handleScan">
                    <i class="bi bi-upc-scan"></i> Quét IMEI
                </button>
            </div>
        </div>

        <div class="filter-section mb-3">
            <div class="row g-2">
                <div class="col-md-3">
                    <select class="form-select" v-model="filterBrand">
                        <option value="">Tất cả hãng</option>
                        <option v-for="brand in brands" :value="brand.id">{{ brand.name }}</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select class="form-select" v-model="filterCPU">
                        <option value="">Tất cả CPU</option>
                        <option v-for="cpu in cpus" :value="cpu.id">{{ cpu.name }}</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select class="form-select" v-model="filterPrice">
                        <option value="">Mức giá</option>
                        <option value="1">Dưới 10 triệu</option>
                        <option value="2">10-20 triệu</option>
                        <option value="3">Trên 20 triệu</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select class="form-select" v-model="filterRAM">
                        <option value="">Tất cả RAM</option>
                        <option v-for="ram in rams" :value="ram.id">{{ ram.capacity }}</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="product-grid">
            <div v-for="product in filteredProducts" :key="product.id" class="product-card">
                <div class="card h-100">
                    <img :src="product.image" class="card-img-top" :alt="product.name">
                    <div class="card-body">
                        <h5 class="card-title">{{ product.name }}</h5>
                        <div class="specs">
                            <small class="text-muted d-block">
                                <i class="bi bi-cpu"></i> {{ product.cpu }}
                            </small>
                            <small class="text-muted d-block">
                                <i class="bi bi-memory"></i> {{ product.ram }}
                            </small>
                            <small class="text-muted d-block">
                                <i class="bi bi-hdd"></i> {{ product.storage }}
                            </small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="price text-danger fw-bold">
                                {{ formatPrice(product.price) }}
                                <span v-if="product.discount"
                                    class="text-decoration-line-through text-muted small ms-2">
                                    {{ formatPrice(product.originalPrice) }}
                                </span>
                            </span>
                            <button class="btn btn-sm btn-primary" @click="$emit('add-to-cart', product)">
                                <i class="bi bi-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    products: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['add-to-cart', 'scan-imei'])

const searchQuery = ref('')
const filterBrand = ref('')
const filterCPU = ref('')
const filterPrice = ref('')
const filterRAM = ref('')

// Giả lập dữ liệu filter - thực tế sẽ lấy từ API
const brands = ref([
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Dell' },
    { id: 3, name: 'HP' }
])

const cpus = ref([
    { id: 1, name: 'Intel Core i3' },
    { id: 2, name: 'Intel Core i5' },
    { id: 3, name: 'Intel Core i7' }
])

const rams = ref([
    { id: 1, capacity: '8GB' },
    { id: 2, capacity: '16GB' },
    { id: 3, capacity: '32GB' }
])

const filteredProducts = computed(() => {
    return props.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.value.toLowerCase())

        const matchesBrand = !filterBrand.value || product.brandId == filterBrand.value
        const matchesCPU = !filterCPU.value || product.cpuId == filterCPU.value
        const matchesRAM = !filterRAM.value || product.ramId == filterRAM.value

        let matchesPrice = true
        if (filterPrice.value === '1') {
            matchesPrice = product.price < 10000000
        } else if (filterPrice.value === '2') {
            matchesPrice = product.price >= 10000000 && product.price <= 20000000
        } else if (filterPrice.value === '3') {
            matchesPrice = product.price > 20000000
        }

        return matchesSearch && matchesBrand && matchesCPU && matchesRAM && matchesPrice
    })
})

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const handleScan = () => {
    emit('scan-imei')
}
</script>

<style scoped>
.product-list {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.search-bar {
    position: sticky;
    top: 0;
    background: white;
    z-index: 100;
    padding-top: 10px;
}

.filter-section {
    position: sticky;
    top: 60px;
    background: white;
    z-index: 99;
    padding-bottom: 10px;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    overflow-y: auto;
    flex: 1;
}

.product-card .card {
    transition: transform 0.2s;
}

.product-card .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.price {
    font-size: 1.1rem;
}
</style>