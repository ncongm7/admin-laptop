<template>
    <div class="image-uploader">
        <!-- Hiển thị danh sách ảnh hiện có -->
        <div v-if="images.length > 0" class="image-preview-container mb-3">
            <div class="row g-2">
                <div v-for="(image, index) in images" :key="image.id || index" class="col-6 col-sm-4 col-md-3 col-lg-2">
                    <div class="image-preview-card" :class="{ 'default-image': image.is_default }">
                        <img :src="image.uri" class="img-thumbnail" :alt="`Preview ${index + 1}`">
                        <div class="image-actions">
                            <button v-if="!image.is_default" class="btn btn-sm btn-outline-primary"
                                @click="setAsDefault(index)" title="Đặt làm ảnh mặc định">
                                <i class="bi bi-star"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" @click="removeImage(index)" title="Xóa ảnh">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <div v-if="image.is_default" class="default-badge">
                            <span class="badge bg-primary">Mặc định</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dropzone để upload ảnh mới -->
        <div class="dropzone" :class="{ 'is-dragover': isDragging }" @dragover.prevent="onDragOver"
            @dragleave="onDragLeave" @drop.prevent="onDrop" @click="triggerFileInput">
            <div class="dropzone-content">
                <div v-if="uploading" class="uploading-indicator">
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden">Đang upload...</span>
                    </div>
                    <span>Đang upload ảnh...</span>
                </div>
                <div v-else>
                    <i class="bi bi-cloud-arrow-up display-5 text-muted"></i>
                    <p class="mt-2 mb-1">Kéo thả ảnh vào đây hoặc click để chọn</p>
                    <small class="text-muted">Hỗ trợ JPG, PNG (tối đa 5MB)</small>
                </div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" multiple style="display: none;" @change="onFileSelected"
                :disabled="uploading">
        </div>

        <!-- Thông báo lỗi -->
        <div v-if="error" class="alert alert-danger mt-3">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { uploadImageToCloudinary } from '@/service/uploadImageToCloud'

const props = defineProps({
    initialImages: {
        type: Array,
        default: () => []
    },
    maxFiles: {
        type: Number,
        default: 10
    },
    maxSize: {
        type: Number,
        default: 5 // MB
    }
})

const emit = defineEmits(['update'])

const images = ref([...props.initialImages])
const isDragging = ref(false)
const error = ref(null)
const fileInput = ref(null)
const uploading = ref(false)

// Kích hoạt file input khi click vào dropzone
const triggerFileInput = () => {
    if (!uploading.value) {
        fileInput.value.click()
    }
}

// Xử lý khi file được chọn
const onFileSelected = (event) => {
    const files = Array.from(event.target.files)
    handleFiles(files)
    event.target.value = '' // Reset input để có thể chọn lại file giống nhau
}

// Xử lý kéo thả
const onDragOver = () => {
    isDragging.value = true
}

const onDragLeave = () => {
    isDragging.value = false
}

const onDrop = (event) => {
    isDragging.value = false
    const files = Array.from(event.dataTransfer.files)
    handleFiles(files)
}

// Xử lý files được chọn
const handleFiles = async (files) => {
    error.value = null
    uploading.value = true

    try {
        // Kiểm tra số lượng file
        if (images.value.length + files.length > props.maxFiles) {
            error.value = `Bạn chỉ có thể upload tối đa ${props.maxFiles} ảnh`
            return
        }

        // Kiểm tra từng file
        for (const file of files) {
            if (!file.type.match('image.*')) {
                error.value = 'Chỉ chấp nhận file ảnh (JPG, PNG)'
                continue
            }

            if (file.size > props.maxSize * 1024 * 1024) {
                error.value = `File ${file.name} vượt quá kích thước tối đa ${props.maxSize}MB`
                continue
            }

            try {
                // Upload ảnh lên Cloudinary
                const imageUrl = await uploadImageToCloudinary(file)

                // Thêm ảnh mới vào danh sách
                images.value.push({
                    uri: imageUrl,
                    is_default: images.value.length === 0 // Tự động đặt làm mặc định nếu là ảnh đầu tiên
                })

                // Cập nhật lên component cha
                emit('update', images.value)
            } catch (err) {
                console.error('Lỗi khi upload ảnh:', err)
                error.value = `Lỗi khi upload ảnh ${file.name}: ${err.message}`
            }
        }
    } finally {
        uploading.value = false
    }
}

// Xóa ảnh
const removeImage = (index) => {
    const wasDefault = images.value[index].is_default
    images.value.splice(index, 1)

    // Nếu xóa ảnh mặc định và còn ảnh khác, đặt ảnh đầu tiên làm mặc định
    if (wasDefault && images.value.length > 0) {
        images.value[0].is_default = true
    }

    emit('update', images.value)
}

// Đặt làm ảnh mặc định
const setAsDefault = (index) => {
    images.value.forEach((img, i) => {
        img.is_default = i === index
    })
    emit('update', images.value)
}
</script>

<style scoped>
.image-uploader {
    border: 1px dashed #ddd;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
}

.dropzone {
    border: 2px dashed #ccc;
    border-radius: 6px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
}

.dropzone.is-dragover {
    border-color: #0d6efd;
    background-color: rgba(13, 110, 253, 0.05);
}

.dropzone:hover {
    border-color: #999;
}

.dropzone-content {
    pointer-events: none;
    /* Cho phép click xuyên thấu đến input file */
}

.uploading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0d6efd;
}

.image-preview-container {
    margin-top: 15px;
}

.image-preview-card {
    position: relative;
    margin-bottom: 10px;
}

.image-preview-card.default-image {
    border: 2px solid #0d6efd;
}

.image-preview-card img {
    width: 100%;
    height: 100px;
    object-fit: cover;
}

.image-actions {
    position: absolute;
    top: 5px;
    right: 5px;
    opacity: 0;
    transition: opacity 0.3s;
}

.image-preview-card:hover .image-actions {
    opacity: 1;
}

.image-actions button {
    padding: 0.2rem 0.3rem;
    margin-left: 3px;
}

.default-badge {
    position: absolute;
    bottom: 5px;
    left: 5px;
}
</style>