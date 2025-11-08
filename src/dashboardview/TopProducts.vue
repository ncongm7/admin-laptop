<template>
    <div class="products-container">
        <div class="products-header">
            <h3 class="products-title">Sản phẩm bán chạy</h3>
            <router-link to="/products" class="view-all">Xem tất cả</router-link>
        </div>

        <div class="products-list">
            <div v-if="loading" class="loading-item" v-for="i in 5" :key="i">
                <div class="loading-image"></div>
                <div class="loading-content">
                    <div class="loading-line"></div>
                    <div class="loading-line short"></div>
                </div>
            </div>

            <div v-else-if="products && products.length > 0" v-for="(product, index) in products" :key="product.id"
                class="product-item">
                <div class="product-rank">{{ index + 1 }}</div>
                <div class="product-image">
                    <img :src="product.image" :alt="product.name">
                </div>
                <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-sales">
                        <span class="sales-count">{{ product.sold }} bán</span>
                        <span class="sales-amount">{{ formatCurrency(product.revenue) }}</span>
                    </div>
                </div>
            </div>

            <div v-else class="empty-state">
                <i class="bi bi-inbox"></i>
                <p>Chưa có dữ liệu sản phẩm</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/helpers'

defineProps({
    products: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.products-container {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.products-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.products-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.view-all {
    font-size: 13px;
    color: #3b82f6;
    text-decoration: none;
}

.view-all:hover {
    text-decoration: underline;
}

.products-list {
    flex: 1;
    overflow-y: auto;
}

.product-item,
.loading-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
}

.product-item:last-child {
    border-bottom: none;
}

.product-rank {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: #6366f1;
    color: white;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
}

.product-item:nth-child(1) .product-rank {
    background: #f59e0b;
}

.product-item:nth-child(2) .product-rank {
    background: #64748b;
}

.product-item:nth-child(3) .product-rank {
    background: #f97316;
}

.product-image,
.loading-image {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 12px;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info {
    flex: 1;
}

.product-name {
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-sales {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
}

.sales-count {
    color: #64748b;
}

.sales-amount {
    color: #10b981;
    font-weight: 600;
}

.loading-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.loading-line {
    height: 14px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
}

.loading-line.short {
    width: 60%;
}

.loading-image {
    background: #e2e8f0;
    animation: pulse 1.5s infinite;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #94a3b8;
}

.empty-state i {
    font-size: 48px;
    margin-bottom: 12px;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}
</style>