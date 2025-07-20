<template>
    <div class="product-image-gallery">
        <div class="main-image mb-3">
            <img :src="currentImage.uri || 'https://via.placeholder.com/600x400?text=No+Image'" alt="Product image"
                class="img-fluid rounded">
        </div>

        <div v-if="images.length > 1" class="thumbnail-list d-flex flex-wrap gap-2">
            <div v-for="(image, index) in images" :key="index" class="thumbnail-item"
                :class="{ active: currentIndex === index }" @click="setCurrentImage(index)">
                <img :src="image.uri" alt="Thumbnail" class="img-thumbnail">
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    images: {
        type: Array,
        default: () => []
    }
})

const currentIndex = ref(0)

const currentImage = computed(() => {
    if (props.images.length === 0) return { uri: '' }
    return props.images[currentIndex.value]
})

const setCurrentImage = (index) => {
    currentIndex.value = index
}
</script>

<style scoped>
.product-image-gallery {
    max-width: 100%;
}

.main-image {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    text-align: center;
}

.main-image img {
    max-height: 400px;
    width: auto;
    object-fit: contain;
}

.thumbnail-item {
    cursor: pointer;
    width: 70px;
    height: 70px;
}

.thumbnail-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumbnail-item.active img {
    border-color: #0d6efd;
}
</style>