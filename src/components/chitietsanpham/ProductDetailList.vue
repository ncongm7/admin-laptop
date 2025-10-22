<template>
    <div class="product-variant-list">
        <div v-if="variants.length === 0" class="empty-state text-center py-5">
            <i class="bi bi-box-seam display-4 text-muted"></i>
            <h5 class="mt-3">Chưa có biến thể nào</h5>
            <p class="text-muted">Thêm biến thể để bắt đầu quản lý</p>
        </div>

        <div v-else class="row g-4">
            <div v-for="variant in variants" :key="variant.id" class="col-md-6 col-lg-4">
                <ProductVariantCard :variant="variant" @edit="$emit('edit', variant)" @view="$emit('view', variant)"
                    @delete="$emit('delete', variant.id)" />
                    
            </div>
        </div>
    </div>
</template>

<script setup>
import ProductVariantCard from './ProductVariantCard.vue'

defineProps({
    variants: {
        type: Array,
        required: true,
        default: () => []
    }
})

defineEmits(['edit', 'view', 'delete'])
</script>

<style scoped>
.empty-state {
    background-color: #f8f9fa;
    border-radius: 8px;
}
</style>