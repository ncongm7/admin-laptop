<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Áp dụng giảm giá cho sản phẩm</h5>
                    <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <input v-model="productSearch" type="text" class="form-control"
                                placeholder="Tìm kiếm theo tên, mã SP...">
                        </div>
                        <div class="col-md-3">
                            <select v-model="categoryFilter" class="form-select">
                                <option value="">Tất cả danh mục</option>
                                <option v-for="category in categories" :value="category.id">
                                    {{ category.name }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select v-model="brandFilter" class="form-select">
                                <option value="">Tất cả hãng</option>
                                <option v-for="brand in brands" :value="brand.id">
                                    {{ brand.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">Phần trăm giảm giá</label>
                            <div class="input-group">
                                <input v-model="discountPercentage" type="number" class="form-control" min="1"
                                    max="100">
                                <span class="input-group-text">%</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Giá giảm cố định</label>
                            <input v-model="fixedDiscount" type="number" class="form-control"
                                placeholder="Nhập số tiền">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Loại giảm giá</label>
                            <select v-model="discountType" class="form-select">
                                <option value="percentage">Theo phần trăm</option>
                                <option value="fixed">Giảm giá cố định</option>
                            </select>
                        </div>
                    </div>

                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-hover">
                            <thead class="sticky-top bg-light">
                                <tr>
                                    <th width="50px">
                                        <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                                    </th>
                                    <th>Sản phẩm</th>
                                    <th>Giá hiện tại</th>
                                    <th>Giá sau giảm</th>
                                    <th>Kho hàng</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="product in filteredProducts" :key="product.id">
                                    <td>
                                        <input type="checkbox" v-model="selectedProducts" :value="product.id">
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <img :src="product.image || '/images/default-product.png'"
                                                class="rounded me-2" width="40" height="40">
                                            <div>
                                                <strong>{{ product.name }}</strong>
                                                <div class="text-muted small">
                                                    {{ product.sku }} | {{ product.brand }} | {{ product.category }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{{ formatCurrency(product.price) }}</td>
                                    <td>
                                        <span class="text-success">
                                            {{ formatCurrency(calculateDiscountedPrice(product.price)) }}
                                        </span>
                                        <span v-if="discountType === 'percentage'" class="badge bg-danger ms-2">
                                            {{ discountPercentage }}%
                                        </span>
                                    </td>
                                    <td>{{ product.stock }}</td>
                                </tr>
                                <tr v-if="filteredProducts.length === 0">
                                    <td colspan="5" class="text-center py-4 text-muted">
                                        Không tìm thấy sản phẩm nào
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            <span class="text-muted">
                                Đã chọn {{ selectedProducts.length }} sản phẩm
                            </span>
                        </div>
                        <div>
                            <button type="button" class="btn btn-secondary me-2" @click="$emit('close')">
                                Hủy bỏ
                            </button>
                            <button type="button" class="btn btn-primary"
                                :disabled="selectedProducts.length === 0 || !validDiscount" @click="applyDiscount">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                                Áp dụng giảm giá
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { useDiscountStore } from '@/stores/discountStore'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
    discountId: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['save', 'close'])

const productStore = useProductStore()
const discountStore = useDiscountStore()

// State
const productSearch = ref('')
const categoryFilter = ref('')
const brandFilter = ref('')
const discountPercentage = ref(10)
const fixedDiscount = ref('')
const discountType = ref('percentage')
const selectAll = ref(false)
const selectedProducts = ref([])
const loading = ref(false)

// Data
const products = ref([])
const categories = ref([])
const brands = ref([])

// Computed
const filteredProducts = computed(() => {
    return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(productSearch.value.toLowerCase()) ||
            product.sku.toLowerCase().includes(productSearch.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || product.category_id == categoryFilter.value
        const matchesBrand = !brandFilter.value || product.brand_id == brandFilter.value

        return matchesSearch && matchesCategory && matchesBrand
    })
})

const validDiscount = computed(() => {
    if (discountType.value === 'percentage') {
        return discountPercentage.value > 0 && discountPercentage.value <= 100
    } else {
        return fixedDiscount.value > 0
    }
})

// Methods
const fetchProducts = async () => {
    try {
        loading.value = true
        const [productsData, categoriesData, brandsData] = await Promise.all([
            productStore.fetchAllProducts(),
            productStore.fetchCategories(),
            productStore.fetchBrands()
        ])

        products.value = productsData
        categories.value = categoriesData
        brands.value = brandsData
    } catch (error) {
        console.error('Error fetching data:', error)
    } finally {
        loading.value = false
    }
}

const calculateDiscountedPrice = (originalPrice) => {
    if (discountType.value === 'percentage') {
        return originalPrice * (1 - discountPercentage.value / 100)
    } else {
        return Math.max(0, originalPrice - fixedDiscount.value)
    }
}

const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedProducts.value = filteredProducts.value.map(p => p.id)
    } else {
        selectedProducts.value = []
    }
}

const applyDiscount = async () => {
    try {
        loading.value = true

        const discountData = {
            discount_id: props.discountId,
            product_ids: selectedProducts.value,
            type: discountType.value,
            value: discountType.value === 'percentage' ? discountPercentage.value : fixedDiscount.value
        }

        await discountStore.applyDiscountToProducts(discountData)
        emit('save')
        emit('close')
    } catch (error) {
        console.error('Error applying discount:', error)
    } finally {
        loading.value = false
    }
}

// Watch
watch([categoryFilter, brandFilter], () => {
    selectAll.value = false
})

// Lifecycle
onMounted(() => {
    fetchProducts()
})
</script>

<style scoped>
.modal-content {
    border: none;
    border-radius: 10px;
    overflow: hidden;
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

.table-responsive {
    border: 1px solid #dee2e6;
    border-radius: 8px;
}

.table thead th {
    position: sticky;
    top: 0;
    background-color: #f8f9fa;
    z-index: 10;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
}

.badge {
    font-weight: 500;
    padding: 4px 8px;
    font-size: 0.75rem;
}

.form-label {
    font-weight: 500;
    margin-bottom: 5px;
}

.btn {
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 500;
}

.btn:disabled {
    opacity: 0.65;
}
</style>