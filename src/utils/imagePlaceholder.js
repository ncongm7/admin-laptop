/**
 * Utility functions for image placeholders
 * Thay thế via.placeholder.com để tránh bị ad blocker chặn
 */

/**
 * Tạo data URI cho placeholder image
 * @param {number} width - Chiều rộng
 * @param {number} height - Chiều cao
 * @param {string} text - Text hiển thị (mặc định: "No Image")
 * @returns {string} Data URI
 */
export function createPlaceholderImage(width = 150, height = 150, text = 'No Image') {
  // Tạo canvas để vẽ placeholder
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // Vẽ nền xám
  ctx.fillStyle = '#e9ecef'
  ctx.fillRect(0, 0, width, height)

  // Vẽ border
  ctx.strokeStyle = '#dee2e6'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, width, height)

  // Vẽ text
  ctx.fillStyle = '#6c757d'
  ctx.font = `${Math.max(12, Math.min(width, height) / 8)}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)

  // Trả về data URI
  return canvas.toDataURL('image/png')
}

/**
 * Lấy placeholder image URL
 * Cache để tránh tạo lại nhiều lần
 */
const placeholderCache = new Map()

export function getPlaceholderImage(width = 150, height = 150, text = 'No Image') {
  const key = `${width}x${height}-${text}`
  
  if (placeholderCache.has(key)) {
    return placeholderCache.get(key)
  }

  const dataUri = createPlaceholderImage(width, height, text)
  placeholderCache.set(key, dataUri)
  return dataUri
}

/**
 * Default placeholder images cho các kích thước thường dùng
 */
export const PLACEHOLDER_IMAGES = {
  small: getPlaceholderImage(60, 60, 'No Image'),
  medium: getPlaceholderImage(150, 150, 'No Image'),
  large: getPlaceholderImage(400, 400, 'No Image'),
  avatar: getPlaceholderImage(80, 80, 'Avatar'),
  thumbnail: getPlaceholderImage(120, 120, 'No Image')
}

/**
 * Handler cho sự kiện error của img tag
 * Tự động thay thế bằng placeholder
 */
export function handleImageError(event, size = 'medium') {
  const target = event.target
  
  // Tránh vòng lặp vô hạn nếu placeholder cũng lỗi
  if (target.dataset.fallbackSet === 'true') {
    return
  }
  
  // Kiểm tra nếu đang dùng via.placeholder.com thì không set lại
  if (target.src && target.src.includes('via.placeholder.com')) {
    return
  }
  
  // Set placeholder
  const placeholder = typeof size === 'string' 
    ? PLACEHOLDER_IMAGES[size] || PLACEHOLDER_IMAGES.medium
    : getPlaceholderImage(size.width || 150, size.height || 150, size.text || 'No Image')
  
  target.src = placeholder
  target.dataset.fallbackSet = 'true'
}

