<template>
    <div class="product-list">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th width="50">#</th>
                        <th>Sản phẩm</th>
                        <th>Thông số</th>
                        <th>Biến thể</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th width="120">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Loading State -->
                    <tr v-if="loading">
                        <td colspan="8" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Empty State -->
                    <tr v-else-if="products.length === 0">
                        <td colspan="8" class="text-center py-5 text-muted">
                            <i class="bi bi-box-seam display-5"></i>
                            <p class="mt-3">Không có sản phẩm nào</p>
                        </td>
                    </tr>

                    <!-- Product Rows -->
                    <tr v-for="(product, index) in products" :key="product.id" @click="viewProduct(product)"
                        class="product-row">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="product-thumbnail me-3">
                                    <img :src="product.anhDaiDien || '/placeholder-product.jpg'"
                                        :alt="product.tenSanPham">
                                </div>
                                <div>
                                    <div class="product-name">{{ product.tenSanPham }}</div>
                                    <small class="text-muted">SKU: {{ product.maSanPham }}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="product-specs">
                                <div v-if="product.cpu"><strong>CPU:</strong> {{ product.cpu.tenCPU }}</div>
                                <div v-if="product.ram"><strong>RAM:</strong> {{ product.ram.dungLuong }}</div>
                                <div v-if="product.gpu"><strong>GPU:</strong> {{ product.gpu.tenGPU }}</div>
                            </div>
                        </td>
                        <td>
                            <div class="variants-count">
                                <span class="badge bg-light text-dark">{{ product.variants.length }} biến thể</span>
                            </div>
                        </td>
                        <td>
                            <div class="product-price">
                                <span class="text-primary fw-bold">{{ formatCurrency(getMinPrice(product.variants))
                                }}</span>
                                <span v-if="hasPriceRange(product.variants)" class="text-muted small">~ {{
                                    formatCurrency(getMaxPrice(product.variants)) }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="stock-status">
                                <span :class="stockStatusClass(product.soLuong)">
                                    {{ product.soLuong }} sản phẩm
                                </span>
                            </div>
                        </td>
                        <td>
                            <span :class="statusClass(product.trangThai)" class="badge">
                                {{ product.trangThai === 'ACTIVE' ? 'Hiển thị' : 'Ẩn' }}
                            </span>
                        </td>
                        <td @click.stop>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" @click="$emit('view', product)">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-outline-secondary" @click="$emit('edit', product)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger" @click="$emit('delete', product)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper" v-if="!loading && products.length > 0">
            <nav aria-label="Page navigation">
                <ul class="pagination justify-content-center">
                    <li class="page-item disabled">
                        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Trước</a>
                    </li>
                    <li class="page-item active"><a class="page-link" href="#">1</a></li>
                    <li class="page-item"><a class="page-link" href="#">2</a></li>
                    <li class="page-item"><a class="page-link" href="#">3</a></li>
                    <li class="page-item">
                        <a class="page-link" href="#">Tiếp</a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/helpers'

const props = defineProps({
    products: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['edit', 'view', 'delete'])

const getMinPrice = (variants) => {
    return Math.min(...variants.map(v => v.giaBan))
}

const getMaxPrice = (variants) => {
    return Math.max(...variants.map(v => v.giaBan))
}

const hasPriceRange = (variants) => {
    return variants.length > 1 && getMinPrice(variants) !== getMaxPrice(variants)
}



const stockStatusClass = (stock) => {
    if (stock > 10) return 'text-success'
    if (stock > 0) return 'text-warning'
    return 'text-danger'
}

const statusClass = (status) => {
    return status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'
}

const viewProduct = (product) => {
    // Emit view event to parent component
    emit('view', product)
}
</script>

<style scoped>
.product-list {
    background: white;
    border-radius: 12px;
    overflow: hidden;
}

.product-thumbnail {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    background: #f8fafc;
}

.product-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-name {
    font-weight: 500;
    margin-bottom: 4px;
}

.product-specs div {
    font-size: 13px;
    margin-bottom: 2px;
}

.product-specs strong {
    color: #64748b;
}

.pagination-wrapper {
    padding: 16px;
    border-top: 1px solid #f1f5f9;
}

.product-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.product-row:hover {
    background-color: #f8fafc !important;
}

.product-row td {
    border-bottom: 1px solid #f1f5f9;
}

.table th {
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 0.5px;
}

.table td {
    vertical-align: middle;
}
</style>