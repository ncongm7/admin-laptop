/**
 * Utility functions cho validation và bảo mật
 */

/**
 * Sanitize string input (loại bỏ script tags và các ký tự nguy hiểm)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

/**
 * Validate số điện thoại Việt Nam
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return false
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate email
 */
export const validateEmail = (email) => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate số lượng (phải là số nguyên dương)
 */
export const validateQuantity = (quantity) => {
  if (quantity === null || quantity === undefined) return false
  const num = Number(quantity)
  return Number.isInteger(num) && num > 0 && num <= 9999
}

/**
 * Validate giá tiền (phải là số dương)
 */
export const validatePrice = (price) => {
  if (price === null || price === undefined) return false
  const num = Number(price)
  return !isNaN(num) && num >= 0 && num <= 999999999
}

/**
 * Validate UUID
 */
export const validateUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate mã hóa đơn (format: HD-YYYYMMDD-XXXX)
 */
export const validateInvoiceCode = (code) => {
  if (!code || typeof code !== 'string') return false
  const codeRegex = /^HD-\d{8}-\d{4}$/
  return codeRegex.test(code)
}

/**
 * Validate serial number (alphanumeric, 7-20 ký tự)
 */
export const validateSerialNumber = (serial) => {
  if (!serial || typeof serial !== 'string') return false
  const serialRegex = /^[A-Z0-9]{7,20}$/i
  return serialRegex.test(serial.trim())
}

/**
 * Throttle function để giới hạn số lần gọi
 */
export const throttle = (func, delay) => {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func.apply(this, args)
    }
  }
}

/**
 * Debounce function để trì hoãn gọi function
 */
export const debounce = (func, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * Kiểm tra quyền truy cập
 */
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles) return false
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.some(role => 
      userRole.toUpperCase().includes(role.toUpperCase())
    )
  }
  return userRole.toUpperCase().includes(requiredRoles.toUpperCase())
}

/**
 * Escape HTML để tránh XSS
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return text
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

