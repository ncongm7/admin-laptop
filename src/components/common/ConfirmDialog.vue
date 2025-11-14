<template>
    <div v-if="confirmState.show" class="modal fade show d-block" tabindex="-1" role="dialog"
        style="background-color: rgba(0, 0, 0, 0.5); z-index: 100000;" @click.self="handleCancel">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content shadow-lg">
                <div :class="['modal-header', `bg-${getHeaderClass()}`, 'text-white']">
                    <h5 class="modal-title d-flex align-items-center">
                        <i :class="getIcon()" class="me-2"></i>
                        {{ confirmState.title }}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" @click="handleCancel"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-0" style="font-size: 1.05rem; line-height: 1.6;">
                        {{ displayMessage }}
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="handleCancel">
                        {{ confirmState.cancelText }}
                    </button>
                    <button type="button" :class="['btn', `btn-${getButtonClass()}`]" @click="handleConfirm">
                        {{ confirmState.confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConfirm } from '@/composables/useConfirm'

const { confirmState } = useConfirm()

// Computed để đảm bảo message luôn là string
const displayMessage = computed(() => {
    const msg = confirmState.value?.message

    // Nếu null hoặc undefined, trả về chuỗi rỗng
    if (!msg) {
        return ''
    }

    // Nếu là string, trả về trực tiếp
    if (typeof msg === 'string') {
        return msg
    }

    // Nếu là số hoặc boolean, convert sang string
    if (typeof msg === 'number' || typeof msg === 'boolean') {
        return String(msg)
    }

    // Nếu là object, log lỗi và cố gắng extract message
    if (typeof msg === 'object') {
        console.error('⚠️ ConfirmDialog: message is an object instead of string:', msg)
        console.error('⚠️ Full confirmState:', JSON.stringify(confirmState.value, null, 2))

        // Nếu object có thuộc tính 'message', lấy nó
        if (msg.message && typeof msg.message === 'string') {
            return msg.message
        }

        // Nếu không, trả về thông báo lỗi
        return 'Có lỗi xảy ra khi hiển thị thông báo'
    }

    // Fallback: convert sang string
    return String(msg)
})

const getHeaderClass = () => {
    const classes = {
        warning: 'warning',
        danger: 'danger',
        info: 'info'
    }
    return classes[confirmState.value.type] || 'warning'
}

const getButtonClass = () => {
    const classes = {
        warning: 'warning',
        danger: 'danger',
        info: 'primary'
    }
    return classes[confirmState.value.type] || 'warning'
}

const getIcon = () => {
    const icons = {
        warning: 'bi bi-exclamation-triangle-fill',
        danger: 'bi bi-exclamation-circle-fill',
        info: 'bi bi-info-circle-fill'
    }
    return icons[confirmState.value.type] || icons.warning
}


const handleConfirm = () => {
    if (confirmState.value.onConfirm) {
        confirmState.value.onConfirm()
    }
}

const handleCancel = () => {
    if (confirmState.value.onCancel) {
        confirmState.value.onCancel()
    }
}
</script>

<style scoped>
.modal-content {
    border-radius: 0.5rem;
    overflow: hidden;
}

.modal-header {
    border-bottom: none;
    padding: 1.25rem 1.5rem;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    border-top: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
}

.bg-warning {
    background-color: #ffc107 !important;
}

.bg-danger {
    background-color: #dc3545 !important;
}

.bg-info {
    background-color: #17a2b8 !important;
}
</style>
