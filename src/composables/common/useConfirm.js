import { ref } from 'vue'

// Confirm dialog state
const confirmState = ref({
    show: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'warning', // warning, danger, info
    onConfirm: null,
    onCancel: null
})

/**
 * Composable để hiển thị confirm dialog
 * Dialog hiển thị ở giữa màn hình
 */
export function useConfirm() {
    /**
     * Hiển thị confirm dialog
     * @param {Object} options
     * @param {string} options.title - Tiêu đề dialog
     * @param {string} options.message - Nội dung thông báo
     * @param {string} options.confirmText - Text nút xác nhận (mặc định: "Xác nhận")
     * @param {string} options.cancelText - Text nút hủy (mặc định: "Hủy")
     * @param {string} options.type - Loại dialog: 'warning', 'danger', 'info'
     * @returns {Promise<boolean>} - true nếu confirm, false nếu cancel
     */
    const showConfirm = (options) => {
        return new Promise((resolve) => {
            console.log('🔍 [useConfirm] showConfirm được gọi với:', options)
            console.log('🔍 [useConfirm] Type of options:', typeof options)
            
            // Kiểm tra và xử lý options
            if (!options) {
                console.error('❌ [useConfirm] showConfirm được gọi với options null/undefined')
                options = { message: 'Xác nhận hành động này?', title: 'Xác nhận' }
            }
            
            if (typeof options !== 'object' && typeof options !== 'string') {
                console.error('❌ [useConfirm] showConfirm được gọi với options không hợp lệ:', options, typeof options)
                options = { message: 'Xác nhận hành động này?', title: 'Xác nhận' }
            }
            
            // Extract các giá trị từ options object
            let title = 'Xác nhận'
            let message = ''
            let confirmText = 'Xác nhận'
            let cancelText = 'Hủy'
            let type = 'warning'
            
            if (typeof options === 'object') {
                console.log('🔍 [useConfirm] Options object keys:', Object.keys(options))
                console.log('🔍 [useConfirm] options.message:', options.message, 'type:', typeof options.message)
                
                title = (options.title && typeof options.title === 'string') ? options.title : title
                
                // Xử lý message cẩn thận - đảm bảo luôn là string
                if (options.message !== undefined && options.message !== null) {
                    if (typeof options.message === 'string') {
                        message = options.message
                        console.log('✅ [useConfirm] Message là string:', message)
                    } else if (typeof options.message === 'number' || typeof options.message === 'boolean') {
                        message = String(options.message)
                        console.log('✅ [useConfirm] Message là number/boolean, convert:', message)
                    } else if (typeof options.message === 'object') {
                        // Nếu message là object, log lỗi và lấy thuộc tính message nếu có
                        console.error('❌ [useConfirm] options.message là object:', options.message)
                        console.error('❌ [useConfirm] options.message keys:', Object.keys(options.message || {}))
                        message = (options.message.message && typeof options.message.message === 'string') 
                            ? options.message.message 
                            : 'Có lỗi xảy ra khi hiển thị thông báo'
                    } else {
                        message = String(options.message)
                        console.log('✅ [useConfirm] Message convert bằng String():', message)
                    }
                } else {
                    console.warn('⚠️ [useConfirm] options.message là undefined hoặc null')
                }
                
                confirmText = (options.confirmText && typeof options.confirmText === 'string') ? options.confirmText : confirmText
                cancelText = (options.cancelText && typeof options.cancelText === 'string') ? options.cancelText : cancelText
                type = (options.type && typeof options.type === 'string') ? options.type : type
            } else if (typeof options === 'string') {
                message = options
                console.log('✅ [useConfirm] Options là string, dùng làm message:', message)
            }
            
            // Final check: Đảm bảo message luôn là string
            if (typeof message !== 'string') {
                console.error('❌ [useConfirm] message vẫn không phải string sau khi xử lý:', message, typeof message)
                message = message ? String(message) : 'Bạn có chắc chắn muốn thực hiện hành động này?'
            }
            
            // Trim và kiểm tra message không rỗng
            if (!message || message.trim() === '') {
                message = 'Bạn có chắc chắn muốn thực hiện hành động này?'
            }
            
            console.log('✅ [useConfirm] Final values:', { title, message, confirmText, cancelText, type })
            console.log('✅ [useConfirm] Message type:', typeof message, 'Length:', message.length)
            
            confirmState.value = {
                show: true,
                title: title,
                message: message, // Đảm bảo message là string
                confirmText: confirmText,
                cancelText: cancelText,
                type: type,
                onConfirm: () => {
                    confirmState.value.show = false
                    resolve(true)
                },
                onCancel: () => {
                    confirmState.value.show = false
                    resolve(false)
                }
            }
            
            console.log('✅ [useConfirm] confirmState.value được set:', {
                show: confirmState.value.show,
                title: confirmState.value.title,
                message: confirmState.value.message,
                messageType: typeof confirmState.value.message
            })
        })
    }

    /**
     * Hiển thị confirm dialog với format đơn giản
     * @param {string} message - Nội dung thông báo
     * @param {string} title - Tiêu đề (mặc định: "Xác nhận")
     * @returns {Promise<boolean>}
     */
    const confirm = async (message, title = 'Xác nhận') => {
        return await showConfirm({
            title,
            message,
            type: 'warning'
        })
    }

    /**
     * Hiển thị confirm dialog nguy hiểm (màu đỏ)
     * @param {string} message - Nội dung thông báo
     * @param {string} title - Tiêu đề (mặc định: "Cảnh báo")
     * @returns {Promise<boolean>}
     */
    const confirmDanger = async (message, title = 'Cảnh báo') => {
        return await showConfirm({
            title,
            message,
            type: 'danger'
        })
    }

    return {
        confirmState,
        showConfirm,
        confirm,
        confirmDanger
    }
}

