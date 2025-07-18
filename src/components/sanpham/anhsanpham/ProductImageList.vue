<template>
    <div class="product-image-list">
        <h5 class="mb-3">Ảnh sản phẩm</h5>
        <ProductImageUpload @uploaded="addImage" />
        <div class="image-grid">
            <ProductImageItem v-for="img in images" :key="img.id" :img="img" :isDefault="img.is_default"
                @remove="removeImage(img.id)" @setDefault="setDefault(img.id)" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductImageUpload from './ProductImageUpload.vue'
import ProductImageItem from './ProductImageItem.vue'

// Demo data, bạn sẽ thay bằng API thực tế
const images = ref([
    { id: 1, url: 'https://via.placeholder.com/120x120?text=Ảnh+1', is_default: true },
    { id: 2, url: 'https://via.placeholder.com/120x120?text=Ảnh+2', is_default: false },
])

function addImage(img) {
    images.value.push({ ...img, id: Date.now(), is_default: false })
}
function removeImage(id) {
    images.value = images.value.filter(i => i.id !== id)
}
function setDefault(id) {
    images.value.forEach(i => (i.is_default = i.id === id))
}
</script>

<style scoped>
.product-image-list {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(13, 110, 253, 0.07);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin-top: 1rem;
}
</style>
