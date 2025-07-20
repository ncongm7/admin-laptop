<template>
  <div>
    <h3>Ảnh sản phẩm</h3>
    <ProductImageUpload @uploaded="addImage" />
    <div class="image-grid">
      <ProductImageItem v-for="img in images" :key="img.id" :img="img" :isDefault="img.is_default"
        @remove="removeImage(img.id)" @setDefault="setDefault(img.id)" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductImageUpload from '../../components/sanpham/anhsanpham/ProductImageUpload.vue'
import ProductImageItem from '../../components/sanpham/anhsanpham/ProductImageItem.vue'

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
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 1rem;
}
</style>