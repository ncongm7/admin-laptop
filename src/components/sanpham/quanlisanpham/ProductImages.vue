<template>
    <div class="product-images">
        <div class="images-header">
            <h4 class="images-title">Quản lý hình ảnh</h4>
            <div class="images-actions">
                <button class="btn btn-sm btn-primary" @click="openFileInput">
                    <i class="bi bi-upload"></i> Tải lên
                </button>
                <input type="file" ref="fileInput" class="d-none" accept="image/*" multiple @change="handleFileUpload">
            </div>
        </div>

        <div class="images-content">
            <!-- Main Image -->
            <div class="main-image-section mb-4">
                <label class="form-label">Ảnh đại diện</label>
                <div class="main-image-wrapper">
                    <img :src="mainImage || '/placeholder-image.jpg'" class="main-image-preview"
                        alt="Main Product Image">
                    <div class="main-image-actions">
                        <button class="btn btn-sm btn-outline-primary" @click="openMainImageInput">
                            <i class="bi bi-arrow-repeat"></i> Thay đổi
                        </button>
                        <input type="file" ref="mainImageInput" class="d-none" accept="image/*"
                            @change="handleMainImageUpload">
                    </div>
                </div>
            </div>

            <!-- Image Gallery -->
            <div class="gallery-section">
                <label class="form-label">Thư viện ảnh</label>
                <div class="gallery-grid">
                    <div v-for="(image, index) in galleryImages" :key="image.id || index" class="gallery-item">
                        <img :src="image.url" class="gallery-image">
                        <div class="gallery-actions">
                            <button class="btn btn-sm btn-outline-primary" @click="setAsMain(image)"
                                v-if="image.url !== mainImage">
                                <i class="bi bi-star"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" @click="removeImage(index)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="gallery-item add-image" @click="openFileInput">
                        <i class="bi bi-plus-lg"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    mainImage: String,
    galleryImages: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits([
    'update:mainImage',
    'update:galleryImages'
])

const fileInput = ref(null)
const mainImageInput = ref(null)

const openFileInput = () => {
    fileInput.value.click()
}

const openMainImageInput = () => {
    mainImageInput.value.click()
}

const handleFileUpload = (event) => {
    const files = event.target.files
    if (files.length > 0) {
        const newImages = []
        Array.from(files).forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => {
                newImages.push({
                    id: null,
                    url: e.target.result,
                    isNew: true
                })
            }
            reader.readAsDataURL(file)
        })

        // Add slight delay to ensure all images are processed
        setTimeout(() => {
            emit('update:galleryImages', [...props.galleryImages, ...newImages])
        }, 100)
    }
}

const handleMainImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            emit('update:mainImage', e.target.result)
        }
        reader.readAsDataURL(file)
    }
}

const setAsMain = (image) => {
    emit('update:mainImage', image.url)
}

const removeImage = (index) => {
    const newGallery = [...props.galleryImages]
    newGallery.splice(index, 1)
    emit('update:galleryImages', newGallery)

    // If deleted image was main image, set first image as main
    if (props.mainImage === props.galleryImages[index].url) {
        emit('update:mainImage', newGallery.length > 0 ? newGallery[0].url : '')
    }
}
</script>

<style scoped>
.product-images {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.images-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.images-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.main-image-wrapper {
    position: relative;
    width: 100%;
    max-width: 300px;
    border-radius: 12px;
    overflow: hidden;
    background: #f8fafc;
}

.main-image-preview {
    width: 100%;
    height: auto;
    display: block;
}

.main-image-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: rgba(0, 0, 0, 0.5);
    text-align: center;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}

.gallery-item {
    position: relative;
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 8px;
    overflow: hidden;
    background: #f8fafc;
}

.gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gallery-item.add-image {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #64748b;
    border: 2px dashed #cbd5e1;
    cursor: pointer;
}

.gallery-item.add-image:hover {
    background: #f1f5f9;
}

.gallery-actions {
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
}

.gallery-item:hover .gallery-actions {
    opacity: 1;
}
</style>