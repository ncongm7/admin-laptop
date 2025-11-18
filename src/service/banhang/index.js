/**
 * ========================================
 * BÁN HÀNG SERVICE - INDEX
 * ========================================
 * Export tất cả các service module để sử dụng
 * Duy trì backward compatibility với code cũ
 */

// Export từ Hóa đơn Service
export {
    taoHoaDonChoMoi,
    themSanPhamVaoHoaDon,
    xoaSanPhamKhoiHoaDon,
    layThongTinHoaDon,
    layDanhSachHoaDonCho,
    huyHoaDon,
    xoaHoaDonCho,
    capNhatSoLuongSanPham,
    capNhatKhachHang,
    inHoaDon,
} from './hoaDonService'

// Export từ Sản phẩm Bán hàng Service
export {
    timKiemSanPham,
    layDanhSachSanPham,
    laySanPhamConHang,
    timKiemSanPhamNangCao,
    kiemTraTonKho,
} from './sanPhamBanHangService'

// Export từ Khách hàng Bán hàng Service
export {
    timKiemKhachHang,
    taoKhachHangMoi,
    layDanhSachKhachHang,
} from './khachHangBanHangService'

// Export từ Thanh toán Service
export {
    layDanhSachPhuongThucThanhToan,
    thanhToanHoaDon,
    layDanhSachNhanVien,
} from './thanhToanService'

// Export từ Serial Service
export {
    layDanhSachSerialKhaDung,
    xacThucSerial,
    timSanPhamTheoIMEI,
} from './serialService'

// Export từ Voucher Service
export {
    layGoiYVoucher,
    apDungVoucher,
    xoaVoucher,
    huyVoucher,
    suDungDiemTichLuy,
} from './voucherService'


