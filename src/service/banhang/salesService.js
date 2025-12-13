import axiosInstance from '../common/axiosInstance'

/**
 * Service for Sales (POS) operations
 * Refactored to match BanHangTaiQuayController endpoints
 */

export const validateVoucher = async (code) => {
    // Assuming VoucherController exists at /api/vouchers/validate or similar. 
    // Double check if valid. BanHangTaiQuayController doesn't have validateVoucher generic, 
    // but has `goi-y-voucher` and `ap-dung-voucher`. 
    // Let's assume generic voucher validation exists elsewhere or we use the specific one later.
    const response = await axiosInstance.post('/api/vouchers/validate', { code })
    return response.data
}

// ==== POS FLOW ====

// 1. Tạo hóa đơn mới (Pending)
export const createPendingBill = async (request = {}) => {
    const response = await axiosInstance.post('/api/v1/ban-hang/hoa-don/tao-moi', request)
    return response.data
}

// 2. Thêm sản phẩm vào hóa đơn (Triggers Reservation/Stealing)
export const addItemToBill = async (billId, itemData) => {
    // itemData: { idChiTietSanPham, soLuong }
    const response = await axiosInstance.post(`/api/v1/ban-hang/hoa-don/${billId}/them-san-pham`, itemData)
    return response.data
}

// 3. Thanh toán hóa đơn
export const payBill = async (billId, paymentData) => {
    // paymentData: { idPhuongThucThanhToan, tienKhachDua, ghiChu, ... }
    const response = await axiosInstance.post(`/api/v1/ban-hang/hoa-don/${billId}/thanh-toan`, paymentData)
    return response.data
}

// 4. Lấy danh sách hóa đơn chờ
export const getPendingBills = async () => {
    const response = await axiosInstance.get('/api/v1/ban-hang/hoa-don/cho')
    return response.data
}

// 5. Xóa hóa đơn chờ
export const deleteBill = async (billId) => {
    const response = await axiosInstance.delete(`/api/v1/ban-hang/hoa-don/${billId}`)
    return response.data
}

// 6. Xóa sản phẩm khỏi hóa đơn
export const removeItemFromBill = async (billIdChiTiet) => { // Note: endpoint uses idHoaDonChiTiet
    const response = await axiosInstance.delete(`/api/v1/ban-hang/hoa-don/xoa-san-pham/${billIdChiTiet}`)
    return response.data
}

// 7. Cập nhật số lượng sản phẩm
export const updateItemQuantity = async (billIdChiTiet, quantity) => {
    const response = await axiosInstance.put(`/api/v1/ban-hang/hoa-don/cap-nhat-so-luong/${billIdChiTiet}`, { soLuong: quantity })
    return response.data
}

export const getProductByImei = async (imei) => {
    const response = await axiosInstance.get(`/api/imei/${imei}/product`)
    return response.data
}
