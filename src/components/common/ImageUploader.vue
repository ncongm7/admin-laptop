<template>
    <div class="image-uploader" :class="{ 'has-image': previewUrl, 'uploading': isUploading, 'error': hasError }">
        <!-- Preview Area -->
        <div class="upload-preview" @click="triggerFileInput">
            <div v-if="isUploading" class="upload-overlay">
                <div class="spinner-container">
                    <div class="spinner"></div>
                    <p class="upload-text">{{ uploadProgress > 0 ? `Đang tải ${uploadProgress}%` : 'Đang tải...' }}</p>
                </div>
            </div>

            <div v-else-if="hasError" class="upload-overlay error-overlay">
                <i class="bi bi-exclamation-triangle-fill error-icon"></i>
                <p class="upload-text error-text">{{ errorMessage || 'Lỗi upload' }}</p>
                <button class="btn-retry" @click.stop="retryUpload">
                    <i class="bi bi-arrow-clockwise"></i> Thử lại
                </button>
            </div>

            <div v-else-if="previewUrl" class="preview-container">
                <img :src="previewUrl" alt="Preview" class="preview-image" @error="handleImageError"
                    @load="handleImageLoad" />
                <div class="preview-overlay">
                    <button class="btn-change" @click.stop="triggerFileInput" title="Đổi ảnh">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-remove" @click.stop="removeImage" title="Xóa ảnh">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>

            <div v-else class="upload-placeholder">
                <i class="bi bi-cloud-upload upload-icon"></i>
                <p class="placeholder-text">{{ placeholder || 'Chọn ảnh để tải lên' }}</p>
                <p class="placeholder-hint">{{ hint || 'JPG, PNG tối đa 5MB' }}</p>
            </div>

            <input ref="fileInput" type="file" :accept="accept" class="file-input" @change="handleFileChange" />
        </div>

        <!-- Success Message -->
        <div v-if="showSuccess" class="success-message">
            <i class="bi bi-check-circle-fill"></i>
            <span>Upload thành công!</span>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: null
    },
    accept: {
        type: String,
        default: 'image/*'
    },
    maxSize: {
        type: Number,
        default: 5 * 1024 * 1024 // 5MB
    },
    placeholder: {
        type: String,
        default: 'Chọn ảnh để tải lên'
    },
    hint: {
        type: String,
        default: 'JPG, PNG tối đa 5MB'
    },
    uploadFunction: {
        type: Function,
        required: true
    },
    aspectRatio: {
        type: String,
        default: '1/1' // '1/1', '16/9', '4/3', etc.
    }
})

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error', 'remove'])

const fileInput = ref(null)
const previewUrl = ref(props.modelValue || null)
const isUploading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const uploadProgress = ref(0)
const showSuccess = ref(false)
const currentFile = ref(null)

// Watch modelValue changes
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        // Nếu là relative URL, convert thành full URL
        if (newValue.startsWith('/uploads/') || newValue.startsWith('uploads/')) {
            const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
            previewUrl.value = newValue.startsWith('/')
                ? `${baseURL}${newValue}`
                : `${baseURL}/${newValue}`
        } else {
            previewUrl.value = newValue
        }
        console.log('👀 [ImageUploader] modelValue changed, preview URL:', previewUrl.value)
    } else {
        previewUrl.value = null
    }
}, { immediate: true })

const triggerFileInput = () => {
    if (isUploading.value) return
    fileInput.value?.click()
}

const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Vui lòng chọn file ảnh hợp lệ')
        resetFileInput()
        return
    }

    // Validate file size
    if (file.size > props.maxSize) {
        const maxSizeMB = (props.maxSize / (1024 * 1024)).toFixed(0)
        showError(`File quá lớn. Vui lòng chọn file nhỏ hơn ${maxSizeMB}MB`)
        resetFileInput()
        return
    }

    // Show preview immediately (local preview)
    const reader = new FileReader()
    reader.onload = (e) => {
        const localPreview = e.target.result
        previewUrl.value = localPreview
        console.log('🖼️ [ImageUploader] Local preview set:', localPreview?.substring(0, 50) + '...')
    }
    reader.readAsDataURL(file)

    currentFile.value = file
    hasError.value = false
    errorMessage.value = ''
    showSuccess.value = false

    // Upload file
    await uploadFile(file)
}

const uploadFile = async (file) => {
    isUploading.value = true
    uploadProgress.value = 0

    try {
        // Simulate progress (nếu API không hỗ trợ progress)
        const progressInterval = setInterval(() => {
            if (uploadProgress.value < 90) {
                uploadProgress.value += 10
            }
        }, 200)

        // Call upload function
        const response = await props.uploadFunction(file)

        clearInterval(progressInterval)
        uploadProgress.value = 100

        console.log('📤 [ImageUploader] Upload response:', response)
        console.log('📤 [ImageUploader] Response type:', typeof response)
        console.log('📤 [ImageUploader] Response.data:', response?.data)

        // Get image URL from response (handle axios response format)
        // API trả về: ResponseEntity.ok().body(imageUrl) -> axios response: { data: "/uploads/avatars/..." }
        let imageUrl = null

        if (typeof response === 'string') {
            // Trường hợp response trực tiếp là string
            imageUrl = response
        } else if (response?.data !== undefined) {
            // Axios response: response.data chứa body từ ResponseEntity
            if (typeof response.data === 'string') {
                // response.data là string URL
                imageUrl = response.data
            } else if (typeof response.data === 'object') {
                // response.data là object, tìm URL trong các field
                imageUrl = response.data?.data || response.data?.url || response.data?.imageUrl || response.data
            }
        } else if (response?.url) {
            imageUrl = response.url
        }

        console.log('🖼️ [ImageUploader] Parsed imageUrl:', imageUrl)

        if (imageUrl) {
            // Nếu URL là relative path, thêm base URL của backend
            let finalImageUrl = imageUrl
            if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
                // Thêm base URL của backend
                const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
                finalImageUrl = imageUrl.startsWith('/')
                    ? `${baseURL}${imageUrl}`
                    : `${baseURL}/${imageUrl}`
                console.log('🔗 [ImageUploader] Converted relative URL to full URL:', finalImageUrl)
            }

            // Update preview với URL từ server
            // Nếu đang có local preview (base64), thay thế bằng URL từ server
            previewUrl.value = finalImageUrl

            emit('update:modelValue', finalImageUrl)
            emit('upload-success', finalImageUrl)

            console.log('✅ [ImageUploader] Final preview URL:', previewUrl.value)

            // Show success message
            showSuccess.value = true
            setTimeout(() => {
                showSuccess.value = false
            }, 3000)
        } else {
            console.error('❌ [ImageUploader] Không parse được URL từ response:', response)
            throw new Error('Không nhận được URL ảnh từ server')
        }
    } catch (error) {
        console.error('Upload error:', error)
        const errorMsg = error?.response?.data?.message || error?.message || 'Upload thất bại. Vui lòng thử lại.'
        showError(errorMsg)
        emit('upload-error', error)

        // Reset preview on error
        previewUrl.value = null
    } finally {
        isUploading.value = false
        uploadProgress.value = 0
        resetFileInput()
    }
}

const showError = (message) => {
    hasError.value = true
    errorMessage.value = message
    setTimeout(() => {
        hasError.value = false
        errorMessage.value = ''
    }, 5000)
}

const retryUpload = () => {
    if (currentFile.value) {
        uploadFile(currentFile.value)
    } else {
        triggerFileInput()
    }
}

const removeImage = () => {
    previewUrl.value = null
    currentFile.value = null
    hasError.value = false
    errorMessage.value = ''
    showSuccess.value = false
    emit('update:modelValue', null)
    emit('remove')
    resetFileInput()
}

const resetFileInput = () => {
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const handleImageError = (event) => {
    console.error('❌ [ImageUploader] Image load error:', event.target.src)
    // Nếu là relative URL, thử thêm base URL
    const src = event.target.src
    if (src && (src.includes('/uploads/') || src.startsWith('/uploads/'))) {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
        const fullUrl = src.startsWith('http') ? src : `${baseURL}${src.startsWith('/') ? '' : '/'}${src}`
        console.log('🔄 [ImageUploader] Retrying with full URL:', fullUrl)
        event.target.src = fullUrl
    }
}

const handleImageLoad = () => {
    console.log('✅ [ImageUploader] Image loaded successfully')
}
</script>

<style scoped>
.image-uploader {
    width: 100%;
}

.upload-preview {
    position: relative;
    width: 100%;
    aspect-ratio: v-bind('aspectRatio');
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background: #f9fafb;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
}

.upload-preview:hover {
    border-color: #2D7458;
    background: #f0fdf4;
}

.image-uploader.has-image .upload-preview {
    border: 2px solid #2D7458;
    background: #fff;
}

.image-uploader.uploading .upload-preview {
    border-color: #3b82f6;
    background: #eff6ff;
}

.image-uploader.error .upload-preview {
    border-color: #dc2626;
    background: #fef2f2;
}

.file-input {
    display: none;
}

/* Upload Placeholder */
.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 24px;
    text-align: center;
}

.upload-icon {
    font-size: 3rem;
    color: #9ca3af;
    margin-bottom: 12px;
    transition: all 0.3s ease;
}

.upload-preview:hover .upload-icon {
    color: #2D7458;
    transform: translateY(-4px);
}

.placeholder-text {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
}

.placeholder-hint {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Preview Container */
.preview-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    background: #f3f4f6;
}

.preview-image[src=""],
.preview-image:not([src]) {
    display: none;
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.preview-container:hover .preview-overlay {
    opacity: 1;
}

.btn-change,
.btn-remove {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1.1rem;
}

.btn-change {
    background: #3b82f6;
    color: #fff;
}

.btn-change:hover {
    background: #2563eb;
    transform: scale(1.1);
}

.btn-remove {
    background: #dc2626;
    color: #fff;
}

.btn-remove:hover {
    background: #b91c1c;
    transform: scale(1.1);
}

/* Upload Overlay (Loading) */
.upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #2D7458;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.upload-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
}

/* Error Overlay */
.error-overlay {
    background: rgba(254, 242, 242, 0.95);
    flex-direction: column;
    gap: 12px;
}

.error-icon {
    font-size: 2.5rem;
    color: #dc2626;
}

.error-text {
    color: #dc2626;
    font-weight: 600;
}

.btn-retry {
    padding: 8px 16px;
    background: #dc2626;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.btn-retry:hover {
    background: #b91c1c;
    transform: translateY(-2px);
}

/* Success Message */
.success-message {
    margin-top: 12px;
    padding: 10px 16px;
    background: #d1fae5;
    border: 1px solid #10b981;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #065f46;
    font-size: 0.875rem;
    font-weight: 500;
    animation: slideDown 0.3s ease;
}

.success-message i {
    font-size: 1.1rem;
    color: #10b981;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .upload-icon {
        font-size: 2.5rem;
    }

    .placeholder-text {
        font-size: 0.9rem;
    }

    .placeholder-hint {
        font-size: 0.8rem;
    }

    .btn-change,
    .btn-remove {
        width: 36px;
        height: 36px;
        font-size: 1rem;
    }
}
</style>
