<template>
    <div class="tim-kiem-san-pham">
        <div class="search-box">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Tìm kiếm sản phẩm theo tên, mã..."
                    v-model="keyword" @input="handleSearch" @keyup.enter="handleSearch" />
                <button class="btn btn-primary" @click="handleSearch">
                    <i class="bi bi-search"></i> Tìm kiếm
                </button>
            </div>
        </div>

        <!-- Kết quả tìm kiếm -->
        <div v-if="showResults && ketQua.length > 0" class="search-results">
            <div class="results-header">
                <span>Tìm thấy {{ ketQua.length }} sản phẩm</span>
                <button class="btn btn-sm btn-link" @click="closeResults">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            <div class="results-list">
                <div v-for="product in ketQua" :key="product.id" class="product-item" @click="selectProduct(product)">
                    <img :src="getProductImage(product)" :alt="product.tenSP" class="product-image" />
                    <div class="product-info">
                        <h6 class="product-name">{{ product.tenSP }}</h6>
                        <div class="product-specs">
                            <small class="text-muted">
                                <i class="bi bi-memory"></i> {{ product.ram?.dungLuong || 'N/A' }}
                            </small>
                            <small class="text-muted">
                                <i class="bi bi-hdd"></i> {{ product.oCung?.tenOCung || 'N/A' }}
                            </small>
                            <small class="text-muted">
                                <i class="bi bi-palette"></i> {{ product.mauSac?.tenMau || 'N/A' }}
                            </small>
                        </div>
                        <div class="product-price-stock">
                            <div class="price-container">
                                <span v-if="product.coGiamGia && product.giaGiam" class="price price-discounted">
                                    {{ formatCurrency(product.giaGiam) }}
                                </span>
                                <span v-else class="price">
                                    {{ formatCurrency(product.giaBan) }}
                                </span>
                                <span v-if="product.coGiamGia && product.giaGoc" class="price-original">
                                    <del>{{ formatCurrency(product.giaGoc) }}</del>
                                </span>
                                <span v-if="product.coGiamGia && product.phanTramGiam" class="discount-badge">
                                    <span class="badge bg-danger">-{{ product.phanTramGiam }}%</span>
                                </span>
                            </div>
                            <span class="stock" :class="getStockClass(product.soLuongTon)">
                                <i class="bi bi-box"></i> Tồn: {{ product.soLuongTon || 0 }}
                            </span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Trạng thái loading -->
        <div v-if="isLoading" class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Đang tìm...</span>
            </div>
            <span class="ms-2">Đang tìm kiếm...</span>
        </div>

        <!-- Không có kết quả -->
        <div v-if="showResults && ketQua.length === 0 && !isLoading && keyword" class="no-results">
            <i class="bi bi-search"></i>
            <p>Không tìm thấy sản phẩm nào</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { timKiemSanPham } from '@/service/banhang/banHangService'

const emit = defineEmits(['product-selected'])

const keyword = ref('')
const ketQua = ref([])
const isLoading = ref(false)
const showResults = ref(false)

// Debounce timer
let searchTimeout = null

const handleSearch = () => {
    clearTimeout(searchTimeout)

    if (!keyword.value || keyword.value.trim().length < 2) {
        ketQua.value = []
        showResults.value = false
        return
    }

    searchTimeout = setTimeout(async () => {
        isLoading.value = true
        showResults.value = true

        try {
            const response = await timKiemSanPham({
                keyword: keyword.value.trim(),
                page: 0,
                size: 20
            })

            // Xử lý response từ backend
            if (response && response.data) {
                ketQua.value = response.data.content || response.data || []
            } else {
                ketQua.value = []
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error)
            ketQua.value = []
        } finally {
            isLoading.value = false
        }
    }, 300)
}

const selectProduct = (product) => {
    emit('product-selected', product)
    closeResults()
}

const closeResults = () => {
    showResults.value = false
    keyword.value = ''
    ketQua.value = []
}

const getProductImage = (product) => {
    if (product.anhSanPhams && product.anhSanPhams.length > 0) {
        const defaultImage = product.anhSanPhams.find(img => img.is_default)
        return defaultImage ? defaultImage.uri : product.anhSanPhams[0].uri
    }
    return 'https://via.placeholder.com/60x60?text=No+Image'
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

const getStockClass = (stock) => {
    if (stock > 10) return 'text-success'
    if (stock > 0) return 'text-warning'
    return 'text-danger'
}
</script>

<style scoped>
.tim-kiem-san-pham {
    position: relative;
}

.search-box {
    margin-bottom: 1rem;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 500px;
    overflow-y: auto;
}

.results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #dee2e6;
    background: #f8f9fa;
    font-weight: 600;
}

.results-list {
    padding: 0.5rem;
}

.product-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.product-item:hover {
    background-color: #f8f9fa;
}

.product-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #dee2e6;
}

.product-info {
    flex: 1;
}

.product-name {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #212529;
}

.product-specs {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.25rem;
}

.product-specs small {
    font-size: 0.8rem;
}

.product-price-stock {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
}

.price {
    font-size: 1rem;
    font-weight: 700;
    color: #dc3545;
}

.price-discounted {
    color: #dc3545;
}

.price-original {
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 400;
}

.discount-badge {
    margin-top: 0.1rem;
}

.stock {
    font-size: 0.85rem;
    font-weight: 500;
}

.no-results {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
}

.no-results i {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    display: block;
}
</style>
