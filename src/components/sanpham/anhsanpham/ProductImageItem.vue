<template>
    <div class="product-image-item" :class="{ 'is-default': isDefault }">
        <img :src="img.url" alt="Ảnh sản phẩm" />
        <div class="actions">
            <button class="btn btn-sm btn-outline-danger" @click="$emit('remove')">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary" :disabled="isDefault" @click="$emit('setDefault')">
                <i class="bi bi-star-fill" v-if="isDefault"></i>
                <i class="bi bi-star" v-else></i>
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    img: Object,
    isDefault: Boolean
})
</script>

<style scoped>
.product-image-item {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(13, 110, 253, 0.08);
    background: #f8f9fa;
    width: 120px;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
    transition: border 0.2s;
}

.product-image-item.is-default {
    border: 2px solid #ffc107;
}

.product-image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.actions {
    position: absolute;
    bottom: 6px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 8px;
}
</style>
