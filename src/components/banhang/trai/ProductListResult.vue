<template>
    <div class="product-list-result p-3 border-bottom">
        <h6 class="mb-3">Kết quả tìm kiếm</h6>
        <div v-if="products.length === 0" class="text-muted">Không có sản phẩm nào.</div>
        <ul class="list-group">
            <li v-for="product in products" :key="product.id"
                class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">{{ product.name }}</div>
                    <small class="text-muted">{{ product.code }}</small>
                </div>
                <button class="btn btn-sm btn-success" @click="$emit('add-to-cart', product)">Thêm</button>
            </li>
        </ul>
    </div>
</template>

<script setup>
const props = defineProps({
    products: {
        type: Array,
        default: () => [
            { id: 1, name: 'MacBook Pro 14', code: 'MBP14' },
            { id: 2, name: 'Dell XPS 13', code: 'XPS13' }
        ]
    }
})
// Emits: add-to-cart
</script>

<style scoped>
.product-list-result {
    background: #fff;
}
</style>