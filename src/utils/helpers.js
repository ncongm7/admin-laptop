export function formatPrice(value) {
    if (typeof value !== 'number') {
        value = Number(value)
        if (isNaN(value)) return ''
    }
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
export function formatDateTime(date) {
    if (!date) return ''
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    // Format: dd/MM/yyyy HH:mm
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
}
export function formatCurrency(value) {
    if (typeof value !== 'number') {
        value = Number(value)
        if (isNaN(value)) return ''
    }
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
