<template>
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 11000;">
        <TransitionGroup name="toast" tag="div">
            <div
                v-for="toast in toasts"
                :key="toast.id"
                v-show="toast.show"
                :class="[
                    'toast show',
                    `toast-${toast.type}`,
                    'mb-2'
                ]"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                style="min-width: 300px; max-width: 400px;"
            >
                <div class="toast-header" :class="`bg-${getToastClass(toast.type)}`">
                    <i :class="getIcon(toast.type)" class="me-2"></i>
                    <strong class="me-auto">{{ getTitle(toast.type) }}</strong>
                    <button
                        type="button"
                        class="btn-close btn-close-white"
                        @click="removeToast(toast.id)"
                        aria-label="Close"
                    ></button>
                </div>
                <div class="toast-body">
                    {{ toast.message }}
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const getToastClass = (type) => {
    const classes = {
        success: 'success',
        error: 'danger',
        warning: 'warning',
        info: 'info'
    }
    return classes[type] || 'info'
}

const getIcon = (type) => {
    const icons = {
        success: 'bi bi-check-circle-fill',
        error: 'bi bi-x-circle-fill',
        warning: 'bi bi-exclamation-triangle-fill',
        info: 'bi bi-info-circle-fill'
    }
    return icons[type] || 'bi bi-info-circle-fill'
}

const getTitle = (type) => {
    const titles = {
        success: 'Thành công',
        error: 'Lỗi',
        warning: 'Cảnh báo',
        info: 'Thông tin'
    }
    return titles[type] || 'Thông báo'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.toast-move {
    transition: transform 0.3s ease;
}

.toast {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border: none;
}

.toast-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-body {
    padding: 0.75rem;
    background: white;
}

.bg-success {
    background-color: #28a745 !important;
    color: white;
}

.bg-danger {
    background-color: #dc3545 !important;
    color: white;
}

.bg-warning {
    background-color: #ffc107 !important;
    color: #212529;
}

.bg-info {
    background-color: #17a2b8 !important;
    color: white;
}
</style>
