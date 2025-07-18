<template>
    <div class="products-management">
        <!-- Main Content -->
        <div class="products-container">
            <!-- Filter Section -->
            <ProductFilter @filter="applyFilter" @reset="resetFilter" class="filter-section" />

            <!-- Product List -->
            <ProductList :products="filteredProducts" :loading="loading" @edit="editProduct" @view="viewDetail"
                @delete="confirmDelete" class="product-list" />

            <!-- Product Form Modal -->
            <ProductFormModal v-if="showModal" :product="selectedProduct" :brands="brands" :cpus="cpus" :rams="rams"
                :gpus="gpus" :storages="storages" :colors="colors" :screens="screens" :displays="displays" :oses="oses"
                :batteries="batteries" :cameras="cameras" @close="closeModal" @save="saveProduct" />

            <!-- Product Detail Modal -->
            <ProductDetailModal v-if="showDetailModal" :product="selectedProduct" @close="closeDetailModal"
                @edit="editFromDetail" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import ProductFilter from '@/components/sanpham/quanlisanpham/ProductFilter.vue'
import ProductList from '@/components/sanpham/quanlisanpham/ProductList.vue'
import ProductFormModal from '@/components/sanpham/quanlisanpham/ProductFormModal.vue'
import ProductDetailModal from '@/components/sanpham/quanlisanpham/ProductDetailModal.vue'
import { useProductDetailStore } from '@/stores/productDetailStore'

const props = defineProps({
    showCreateModal: Boolean
})

const router = useRouter()
const productStore = useProductStore()
const useProductDetailStore1 = useProductDetailStore()

const loading = ref(true)
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedProduct = ref(null)
const filters = ref({
    brand: null,
    cpu: null,
    ram: null,
    gpu: null,
    minPrice: null,
    maxPrice: null,
    keyword: ''
})

const fetchData = async () => {
    try {
        loading.value = true
        await productStore.fetchAllProducts()
    } finally {
        loading.value = false
    }
}

const brands = computed(() => productStore.brands)
const cpus = computed(() => productStore.cpus)
const rams = computed(() => productStore.rams)
const gpus = computed(() => productStore.gpus)
const storages = computed(() => productStore.storages)
const colors = computed(() => productStore.colors)
const screens = computed(() => productStore.screens)
const displays = computed(() => productStore.displays)
const oses = computed(() => productStore.oses)
const batteries = computed(() => productStore.batteries)
const cameras = computed(() => productStore.cameras)

const filteredProducts = computed(() => {
    return productStore.products.filter(product => {
        const matchesBrand = !filters.value.brand || product.brand?.id === filters.value.brand
        const matchesCPU = !filters.value.cpu || product.cpu?.id === filters.value.cpu
        const matchesRAM = !filters.value.ram || product.ram?.id === filters.value.ram
        const matchesGPU = !filters.value.gpu || product.gpu?.id === filters.value.gpu
        const matchesKeyword = !filters.value.keyword ||
            product.tenSanPham.toLowerCase().includes(filters.value.keyword.toLowerCase())
        const minPrice = filters.value.minPrice ? Number(filters.value.minPrice) : 0
        const maxPrice = filters.value.maxPrice ? Number(filters.value.maxPrice) : Infinity
        const matchesPrice = product.variants.some(variant =>
            variant.giaBan >= minPrice && variant.giaBan <= maxPrice)
        return matchesCPU && matchesRAM && matchesGPU &&
            matchesKeyword && matchesPrice
    })
})

const editProduct = (product) => {
    selectedProduct.value = { ...product }
    showModal.value = true
}

const viewDetail = async (product) => {
    const detail = await productStore.fetchProductByIdSP(product.id)
    selectedProduct.value = { id: product.id, ...product }
    useProductDetailStore1.productDetail = { ...detail }
    router.push(`/products/${product.id}/detail`)
}

const editFromDetail = () => {
    showDetailModal.value = false
    showModal.value = true
}

const confirmDelete = (product) => {
    // Implement delete confirmation
}

const saveProduct = async (productData) => {
    if (productData.id) {
        await productStore.updateProduct(productData)
    } else {
        await productStore.addProduct(productData)
    }
    closeModal()
}

const closeModal = () => {
    showModal.value = false
}

const closeDetailModal = () => {
    showDetailModal.value = false
}

const applyFilter = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
}

const resetFilter = () => {
    filters.value = {
        brand: null,
        cpu: null,
        ram: null,
        gpu: null,
        minPrice: null,
        maxPrice: null,
        keyword: ''
    }
}

onMounted(() => {
    fetchData()
})

watch(() => props.showCreateModal, (val) => {
    if (val) {
        selectedProduct.value = null
        showModal.value = true
    }
})
</script>

<style scoped>
.products-management {
    padding: 24px;
    background-color: #f8fafc;
    min-height: 100vh;
}
</style>