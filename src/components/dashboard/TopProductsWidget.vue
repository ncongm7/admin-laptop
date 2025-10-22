<template>
    <div>
        <h3 class="widget-title">Sản Phẩm Bán Chạy</h3>

        <div v-if="loading" class="loading-container">
            <div v-for="i in 3" :key="i" class="product-item--loading">
                <div class="placeholder"></div>
            </div>
        </div>

        <div v-else class="product-list">
            <div v-for="(product, index) in products" :key="product.id" class="product-item">
                <div class="product-rank" :class="`rank-${index + 1}`">
                    {{ index + 1 }}
                </div>
                <div class="product-image">
                    <img :src="product.image" :alt="product.name">
                </div>
                <div class="product-info">
                    <h4 class="product-name">{{ product.name }}</h4>
                    <div class="product-sales">
                        <span class="sales-count">{{ product.sold }} bán</span>
                        <span class="sales-revenue">{{ formatCurrency(product.revenue) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <router-link v-if="!loading" to="/products" class="view-all">
            Xem tất cả sản phẩm <i class="bi bi-chevron-right"></i>
        </router-link>
    </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/helpers'

defineProps({
    products: {
        type: Array,
        default: () => []
    },
    loading: Boolean
})
</script>

<style scoped>
.widget-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
}

.product-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.product-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;
}

.product-item:hover {
    background: #f7fafc;
}

.product-rank {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.75rem;
    color: white;
}

.rank-1 {
    background: #f6ad55;
}

.rank-2 {
    background: #68d391;
}

.rank-3 {
    background: #63b3ed;
}

.product-image {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
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
    font-size: 0.875rem;
    font-weight: 500;
    margin: 0;
    color: #2d3748;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-sales {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #718096;
}

.sales-count {
    color: #4a5568;
}

.sales-revenue {
    font-weight: 600;
    color: #2b6cb0;
}

.view-all {
    display: block;
    text-align: center;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #4299e1;
    text-decoration: none;
}

.view-all:hover {
    text-decoration: underline;
}

.loading-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.product-item--loading .placeholder {
    height: 56px;
    border-radius: 8px;
    background: #e2e8f0;
    animation: pulse 1.5s infinite;
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