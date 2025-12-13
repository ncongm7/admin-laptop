import { ref } from 'vue'

// Toast state
const toasts = ref([])
let toastIdCounter = 0

/**
 * Composable để hiển thị toast notifications
 * Toast hiển thị ở góc phải trên màn hình
 */
export function useToast() {
    /**
     * Hiển thị toast
     * @param {string} message - Nội dung thông báo
     * @param {string} type - Loại toast: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Thời gian hiển thị (ms), mặc định 3000
     */
    const showToast = (message, type = 'info', duration = 3000) => {
        const toastId = ++toastIdCounter
        const toast = {
            id: toastId,
            message,
            type, // success, error, warning, info
            duration,
            show: true
        }

        toasts.value.push(toast)

        // Tự động xóa sau duration
        setTimeout(() => {
            removeToast(toastId)
        }, duration)

        return toastId
    }

    /**
     * Xóa toast theo ID
     */
    const removeToast = (toastId) => {
        const index = toasts.value.findIndex(t => t.id === toastId)
        if (index > -1) {
            toasts.value[index].show = false
            // Xóa khỏi array sau khi animation kết thúc
            setTimeout(() => {
                toasts.value.splice(index, 1)
            }, 300)
        }
    }

    /**
     * Xóa tất cả toast
     */
    const clearAllToasts = () => {
        toasts.value.forEach(toast => {
            toast.show = false
        })
        setTimeout(() => {
            toasts.value = []
        }, 300)
    }

    // Helper methods cho các loại toast
    const success = (message, duration) => showToast(message, 'success', duration)
    const error = (message, duration) => showToast(message, 'error', duration)
    const warning = (message, duration) => showToast(message, 'warning', duration)
    const info = (message, duration) => showToast(message, 'info', duration)

    return {
        toasts,
        showToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info
    }
}

