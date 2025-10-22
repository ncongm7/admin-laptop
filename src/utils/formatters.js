// Định dạng số thành chuỗi tiền tệ Việt Nam (VND)
export function formatCurrency(value) {
    if (value == null || isNaN(value)) return '0 ₫'
    // Đảm bảo value là số
    const number = Number(value)
    // Sử dụng Intl.NumberFormat để định dạng tiền tệ Việt Nam
    return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
// Định dạng đối tượng Date hoặc chuỗi ngày thành chuỗi 'dd/MM/yyyy HH:mm'
export function formatDateTime(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d)) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
}
// Định dạng đối tượng Date hoặc chuỗi ngày thành chuỗi 'dd/MM/yyyy'
export function formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d)) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}
