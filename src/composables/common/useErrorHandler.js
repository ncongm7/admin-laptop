/**
 * Composable xử lý lỗi với retry mechanism
 */
import { ref } from 'vue'
import { useToast } from './useToast'

export function useErrorHandler() {
  const { error: showError } = useToast()
  const retryCount = ref(0)
  const maxRetries = 3

  /**
   * Xử lý lỗi với retry mechanism
   * @param {Error} error - Lỗi từ API
   * @param {Function} retryFn - Function để retry
   * @param {String} errorMessage - Message hiển thị cho user
   * @param {Object} options - Options: { showRetry: boolean, maxRetries: number }
   */
  const handleError = async (error, retryFn = null, errorMessage = null, options = {}) => {
    const { showRetry = true, maxRetries: customMaxRetries = maxRetries } = options

    // Log lỗi chi tiết
    console.error('❌ [ErrorHandler] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    })

    // Xác định message
    let message = errorMessage
    if (!message) {
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.message) {
        message = error.message
      } else {
        message = 'Đã xảy ra lỗi. Vui lòng thử lại!'
      }
    }

    // Nếu có retry function và chưa vượt quá max retries
    if (retryFn && showRetry && retryCount.value < customMaxRetries) {
      // Hiển thị error với nút retry
      const shouldRetry = await showErrorWithRetry(message, retryCount.value, customMaxRetries)
      
      if (shouldRetry) {
        retryCount.value++
        try {
          await retryFn()
          retryCount.value = 0 // Reset sau khi retry thành công
        } catch (retryError) {
          if (retryCount.value >= customMaxRetries) {
            showError(`Đã thử lại ${customMaxRetries} lần nhưng vẫn lỗi. Vui lòng liên hệ hỗ trợ!`)
            retryCount.value = 0
          } else {
            // Recursive retry
            await handleError(retryError, retryFn, errorMessage, options)
          }
        }
        return
      } else {
        retryCount.value = 0
      }
    }

    // Hiển thị error thông thường
    showError(message)
  }

  /**
   * Hiển thị error với nút retry
   */
  const showErrorWithRetry = (message, currentRetry, maxRetries) => {
    return new Promise((resolve) => {
      // Sử dụng confirm dialog để hỏi có muốn retry không
      const userChoice = window.confirm(
        `${message}\n\nBạn có muốn thử lại? (${currentRetry + 1}/${maxRetries})`
      )
      resolve(userChoice)
    })
  }

  /**
   * Reset retry count
   */
  const resetRetryCount = () => {
    retryCount.value = 0
  }

  return {
    handleError,
    resetRetryCount,
    retryCount
  }
}

