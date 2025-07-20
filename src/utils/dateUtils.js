// Định dạng ngày theo dạng 'dd/MM/yyyy'
export function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date)) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

// Kiểm tra xem một ngày có nằm trong khoảng [start, end] không (bao gồm cả hai đầu)
export function dateInRange(dateStr, startStr, endStr) {
    if (!dateStr || !startStr || !endStr) return false
    const date = new Date(dateStr)
    const start = new Date(startStr)
    const end = new Date(endStr)
    if (isNaN(date) || isNaN(start) || isNaN(end)) return false
    // Đặt giờ về 0 để so sánh chỉ theo ngày
    date.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return date >= start && date <= end
}

// Lấy trạng thái chương trình giảm giá: 'active', 'upcoming', 'expired'
export function getDiscountStatus(discount) {
    if (!discount || !discount.thoiGianBatDau || !discount.thoiGianKetThuc) return ''
    const now = new Date()
    const start = new Date(discount.thoiGianBatDau)
    const end = new Date(discount.thoiGianKetThuc)
    now.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    if (now < start) return 'upcoming'
    if (now > end) return 'expired'
    return 'active'
}
// Định dạng đối tượng Date hoặc chuỗi ngày thành chuỗi 'yyyy-MM-ddTHH:mm' để dùng cho input type="datetime-local"
export function formatDateTimeForInput(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d)) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}
// Thêm số tháng vào một ngày, trả về chuỗi 'yyyy-MM-dd'
export function addMonthsToDate(dateStr, months) {
    if (!dateStr || typeof months !== 'number') return ''
    const date = new Date(dateStr)
    if (isNaN(date)) return ''
    const d = date.getDate()
    date.setMonth(date.getMonth() + months)

    // Xử lý trường hợp ngày vượt quá số ngày của tháng mới
    if (date.getDate() < d) {
        date.setDate(0)
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
// Định dạng ngày cho input type="date" (trả về yyyy-MM-dd)
export function formatDateInput(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d)) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
// Tính số ngày còn lại giữa ngày kết thúc và ngày hiện tại (dùng cho bảo hành)
export function calculateRemainingDays(endDate) {
    if (!endDate) return 0
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)
    const diff = end - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
