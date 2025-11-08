<template>
    <div class="product-search card">
        <div class="card-header bg-info text-white">
            <h6 class="mb-0">
                <i class="bi bi-search"></i> Tìm kiếm & Quét mã sản phẩm
            </h6>
        </div>

        <div class="card-body">
            <!-- Thanh tìm kiếm và quét mã -->
            <div class="search-bar mb-3">
                <div class="input-group">
                    <input ref="searchInput" type="text" class="form-control form-control-lg" v-model="keyword"
                        @input="handleSearch" @keyup.enter="handleSearch"
                        placeholder="Tìm tên, mã sản phẩm hoặc quét mã..." />
                    <button class="btn btn-primary" @click="handleSearch">
                        <i class="bi bi-search"></i>
                    </button>
                </div>

            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Đang tìm...</span>
                </div>
                <span class="ms-2">Đang tìm kiếm...</span>
            </div>

            <!-- Kết quả tìm kiếm -->
            <div v-if="!isLoading && ketQua.length > 0" class="search-results">
                <div class="results-header mb-2">
                    <span class="text-muted">Tìm thấy <strong>{{ ketQua.length }}</strong> sản phẩm</span>
                </div>

                <div class="product-grid">
                    <div v-for="product in ketQua" :key="product.id" class="product-card"
                        @click="selectProduct(product)">
                        <div class="product-image-wrapper">
                            <img :src="getProductImage(product)" :alt="product.tenSP" class="product-image" />
                            <div class="product-stock-badge" :class="getStockClass(product.soLuongTon)">
                                {{ product.soLuongTon || 0 }}
                            </div>
                        </div>

                        <div class="product-info">
                            <h6 class="product-name">{{ product.tenSP }}</h6>
                            <div class="product-code text-muted small">
                                Mã: {{ product.maCTSP }}
                            </div>
                            <div class="product-specs">
                                <span v-if="product.ram" class="spec-badge">
                                    <i class="bi bi-memory"></i> {{ product.ram.dungLuong }}
                                </span>
                                <span v-if="product.oCung" class="spec-badge">
                                    <i class="bi bi-hdd"></i> {{ product.oCung.tenOCung }}
                                </span>
                            </div>
                            <div class="product-footer">
                                <div class="product-price">
                                    {{ formatCurrency(product.giaBan) }}
                                </div>
                                <button class="btn btn-sm btn-primary">
                                    <i class="bi bi-plus-circle"></i> Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Không có kết quả -->
            <div v-if="!isLoading && ketQua.length === 0 && keyword" class="no-results text-center py-4">
                <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
                <p class="text-muted mt-2">Không tìm thấy sản phẩm nào</p>
            </div>

            <!-- Hướng dẫn -->
            <div v-if="!keyword && !isLoading" class="search-instruction text-center py-4">
                <i class="bi bi-info-circle" style="font-size: 3rem; color: #0dcaf0;"></i>
                <p class="text-muted mt-2 mb-0">
                    Nhập tên hoặc mã sản phẩm để tìm kiếm
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { timKiemSanPham } from '@/service/banHangService'

const emit = defineEmits(['product-selected', 'scan-imei'])

// State
const keyword = ref('')
const ketQua = ref([])
const isLoading = ref(false)
const searchInput = ref(null)

// Debounce timer
let searchTimeout = null

// Methods
const handleSearch = () => {
    clearTimeout(searchTimeout)

    if (!keyword.value || keyword.value.trim().length < 2) {
        ketQua.value = []
        return
    }

    searchTimeout = setTimeout(async () => {
        isLoading.value = true
        console.log('🔍 Tìm kiếm sản phẩm:', keyword.value.trim())

        try {
            const response = await timKiemSanPham({
                keyword: keyword.value.trim(),
                page: 0,
                size: 20
            })

            console.log('📦 Response tìm kiếm:', response)

            // Xử lý response linh hoạt - backend có thể trả về nhiều cấu trúc
            let products = []

            if (response) {
                // Trường hợp 1: response.data.content (pagination)
                if (response.data && response.data.content && Array.isArray(response.data.content)) {
                    products = response.data.content
                }
                // Trường hợp 2: response.data (array trực tiếp)
                else if (response.data && Array.isArray(response.data)) {
                    products = response.data
                }
                // Trường hợp 3: response là array
                else if (Array.isArray(response)) {
                    products = response
                }
                // Trường hợp 4: response.data.data
                else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    products = response.data.data
                }
            }

            ketQua.value = products
            console.log('✅ Tìm thấy', products.length, 'sản phẩm')

        } catch (error) {
            console.error('❌ Lỗi khi tìm kiếm sản phẩm:', error)
            console.error('Error details:', error.response?.data)
            ketQua.value = []
        } finally {
            isLoading.value = false
        }
    }, 300)
}

const selectProduct = (product) => {
    emit('product-selected', product)
    // Không clear keyword để có thể tiếp tục tìm kiếm
}

const getProductImage = (product) => {
    if (product.anhSanPhams && product.anhSanPhams.length > 0) {
        const defaultImage = product.anhSanPhams.find(img => img.is_default)
        return defaultImage ? defaultImage.uri : product.anhSanPhams[0].uri
    }
    return 'https://via.placeholder.com/150x150?text=No+Image'
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

const getStockClass = (stock) => {
    if (stock > 10) return 'stock-high'
    if (stock > 0) return 'stock-medium'
    return 'stock-low'
}
</script>

<style scoped>
.product-search {
    height: calc(100vh - 180px);
    display: flex;
    flex-direction: column;
}

.card-body {
    flex: 1;
    overflow-y: auto;
}

.search-results {
    margin-top: 1rem;
}

.results-header {
    padding: 0.5rem 0;
    border-bottom: 2px solid #dee2e6;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.product-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.product-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #0dcaf0;
}

.product-image-wrapper {
    position: relative;
    margin-bottom: 0.5rem;
}

.product-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 6px;
}

.product-stock-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stock-high {
    color: #28a745;
    border: 1px solid #28a745;
}

.stock-medium {
    color: #ffc107;
    border: 1px solid #ffc107;
}

.stock-low {
    color: #dc3545;
    border: 1px solid #dc3545;
}

.product-info {
    text-align: left;
}

.product-name {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #212529;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.product-code {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
}

.product-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.spec-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    background: #e9ecef;
    border-radius: 4px;
    color: #495057;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
}

.product-price {
    font-size: 1rem;
    font-weight: 700;
    color: #dc3545;
}

.no-results,
.search-instruction {
    padding: 3rem 1rem;
}

/* Responsive */
@media (max-width: 991px) {
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
}
</style>
