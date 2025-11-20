# API Documentation - Module Bán Hàng

## Base URL

Tất cả API sử dụng base URL: `/api/v1/ban-hang`

## Authentication

Tất cả API yêu cầu authentication token trong header:
```
Authorization: Bearer {token}
```

---

## 1. Quản lý Hóa đơn

### 1.1. Tạo hóa đơn chờ mới

**Endpoint**: `POST /api/v1/ban-hang/hoa-don/tao-moi`

**Request Body**:
```json
{
  "nhanVienId": "uuid",
  "khachHangId": "uuid | null"
}
```

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "ma": "HD-20241201-0001",
    "ngayTao": "2024-12-01T10:00:00",
    "tongTien": 0,
    "trangThaiThanhToan": 0,
    "hoaDonChiTiet": [],
    "khachHang": null
  }
}
```

**Service**: `banHangService.taoHoaDonChoMoi()`

---

### 1.2. Thêm sản phẩm vào hóa đơn

**Endpoint**: `POST /api/v1/ban-hang/hoa-don/{idHoaDon}/them-san-pham`

**Request Body**:
```json
{
  "chiTietSanPhamId": "uuid",
  "soLuong": 2,
  "imei": "optional - mã IMEI nếu quét"
}
```

**Response**: Hóa đơn đã cập nhật (cùng format như 1.1)

**Service**: `banHangService.themSanPhamVaoHoaDon()`

---

### 1.3. Xóa sản phẩm khỏi hóa đơn

**Endpoint**: `DELETE /api/v1/ban-hang/hoa-don/xoa-san-pham/{idHoaDonChiTiet}`

**Response**: Hóa đơn đã cập nhật

**Service**: `banHangService.xoaSanPhamKhoiHoaDon()`

---

### 1.4. Cập nhật số lượng sản phẩm

**Endpoint**: `PUT /api/v1/ban-hang/hoa-don/cap-nhat-so-luong/{idHoaDonChiTiet}`

**Request Body**:
```json
{
  "soLuong": 3
}
```

**Response**: Hóa đơn đã cập nhật

**Service**: `banHangService.capNhatSoLuongSanPham()`

---

### 1.5. Cập nhật khách hàng

**Endpoint**: `PUT /api/v1/ban-hang/hoa-don/{idHoaDon}/khach-hang`

**Request Body**:
```json
{
  "khachHangId": "uuid"
}
```

**Response**: Hóa đơn đã cập nhật

**Service**: `banHangService.capNhatKhachHang()`

---

### 1.6. Lấy danh sách hóa đơn chờ

**Endpoint**: `GET /api/v1/ban-hang/hoa-don/cho`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "ma": "HD-20241201-0001",
      "tongTien": 5000000,
      "trangThaiThanhToan": 0,
      "hoaDonChiTiet": [...]
    }
  ]
}
```

**Service**: `banHangService.layDanhSachHoaDonCho()`

---

### 1.7. Hủy/Xóa hóa đơn

**Endpoint**: `DELETE /api/v1/ban-hang/hoa-don/{idHoaDon}`

**Response**: Success message

**Service**: `banHangService.huyHoaDon()`

---

### 1.8. In hóa đơn

**Endpoint**: `GET /api/v1/ban-hang/hoa-don/{idHoaDon}/in`

**Response**: Blob (PDF hoặc HTML)

**Service**: `banHangService.inHoaDon()`

---

## 2. Quản lý Sản phẩm

### 2.1. Tìm kiếm sản phẩm

**Endpoint**: `GET /api/san-pham/ban-hang/tim-kiem`

**Query Parameters**:
- `keyword`: string (tên/mã sản phẩm)
- `page`: number (default: 0)
- `size`: number (default: 20)
- `sort`: string (default: 'ngayTao,desc')

**Response**:
```json
{
  "data": {
    "content": [
      {
        "id": "uuid",
        "tenSanPham": "Laptop Dell",
        "maSanPham": "SP001",
        "chiTietSanPhams": [
          {
            "id": "uuid",
            "maCtsp": "CTSP001",
            "giaBan": 15000000,
            "soLuongTon": 10
          }
        ]
      }
    ],
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**Service**: `sanPhamBanHangService.timKiemSanPham()`

---

### 2.2. Lấy sản phẩm còn hàng

**Endpoint**: `GET /api/san-pham/ban-hang/con-hang`

**Query Parameters**: `page`, `size`, `sort`

**Response**: Tương tự 2.1

**Service**: `sanPhamBanHangService.laySanPhamConHang()`

---

### 2.3. Tìm kiếm nâng cao

**Endpoint**: `GET /api/chi-tiet-san-pham/search`

**Query Parameters**:
- `keyword`: string
- `minPrice`: number
- `maxPrice`: number
- `coSanTon`: boolean
- `page`: number
- `size`: number

**Response**: Tương tự 2.1

**Service**: `sanPhamBanHangService.timKiemSanPhamNangCao()`

---

### 2.4. Tìm sản phẩm theo IMEI/Serial

**Endpoint**: `GET /api/v1/ban-hang/san-pham/imei/{imei}`

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "tenSanPham": "Laptop Dell",
    "giaBan": 15000000,
    "soLuongTon": 5
  }
}
```

**Service**: `serialService.timSanPhamTheoIMEI()`

---

## 3. Quản lý Khách hàng

### 3.1. Tìm kiếm khách hàng

**Endpoint**: `GET /api/v1/ban-hang/khach-hang/tim-kiem`

**Query Parameters**:
- `keyword`: string (SĐT hoặc tên)

**Response**:
```json
{
  "data": [
    {
      "userId": "uuid",
      "hoTen": "Nguyễn Văn A",
      "soDienThoai": "0912345678",
      "diemTichLuy": 500
    }
  ]
}
```

**Service**: `khachHangBanHangService.timKiemKhachHang()`

---

## 4. Thanh toán

### 4.1. Lấy danh sách phương thức thanh toán

**Endpoint**: `GET /api/phuong-thuc-thanh-toan`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "tenPhuongThuc": "Tiền mặt"
    }
  ]
}
```

**Service**: `thanhToanService.layDanhSachPhuongThucThanhToan()`

---

### 4.2. Thanh toán hóa đơn

**Endpoint**: `POST /api/v1/ban-hang/hoa-don/{idHoaDon}/thanh-toan`

**Request Body**:
```json
{
  "idPhuongThucThanhToan": "uuid",
  "soTienThanhToan": 5000000,
  "ghiChu": "string",
  "maGiaoDich": "string",
  "serialNumbers": [
    {
      "idHoaDonChiTiet": "uuid",
      "idChiTietSanPham": "uuid",
      "serialNumber": "ABC123456"
    }
  ],
  "tienKhachDua": 6000000,  // Nếu là tiền mặt
  "tienThua": 1000000       // Nếu là tiền mặt
}
```

**Response**: Hóa đơn đã thanh toán

**Service**: `thanhToanService.thanhToanHoaDon()`

---

## 5. Serial/IMEI

### 5.1. Lấy danh sách serial khả dụng

**Endpoint**: `GET /api/serial/ctsp/{ctspId}`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "serialNo": "ABC123456",
      "trangThai": 0  // 0: Mới, 1: Đang dùng, 2: Đã bán
    }
  ]
}
```

**Service**: `serialService.layDanhSachSerialKhaDung()`

---

### 5.2. Xác thực Serial

**Endpoint**: `POST /api/v1/ban-hang/hoa-don/xac-thuc-serial`

**Request Body**:
```json
{
  "idHoaDon": "uuid",
  "idChiTietSanPham": "uuid",
  "serialNumber": "ABC123456"
}
```

**Response**: Serial đã được xác thực

**Service**: `serialService.xacThucSerial()`

---

## 6. Voucher

### 6.1. Lấy danh sách voucher gợi ý

**Endpoint**: `GET /api/v1/ban-hang/voucher/goi-y`

**Query Parameters**:
- `idHoaDon`: uuid
- `tongTien`: number

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "tenPhieuGiamGia": "Giảm 10%",
      "phanTramGiam": 10,
      "giaTriGiam": 500000
    }
  ]
}
```

**Service**: `voucherService.layDanhSachVoucherGoiY()`

---

### 6.2. Áp dụng voucher

**Endpoint**: `POST /api/v1/ban-hang/hoa-don/{idHoaDon}/ap-dung-voucher`

**Request Body**:
```json
{
  "idPhieuGiamGia": "uuid"
}
```

**Response**: Hóa đơn đã cập nhật

**Service**: `voucherService.apDungVoucher()`

---

### 6.3. Xóa voucher

**Endpoint**: `DELETE /api/v1/ban-hang/hoa-don/{idHoaDon}/voucher`

**Response**: Hóa đơn đã cập nhật

**Service**: `banHangService.xoaVoucher()`

---

## 7. Thống kê

### 7.1. Thống kê tổng quan

**Endpoint**: `GET /api/v1/thongke/tong-quan`

**Query Parameters**:
- `startDate`: string (yyyy-MM-dd)
- `endDate`: string (yyyy-MM-dd)

**Response**:
```json
{
  "data": {
    "tongDoanhThu": 50000000,
    "tongDonHang": 50
  }
}
```

**Service**: `thongKeService.fetchThongKeTongQuan()`

---

### 7.2. Biểu đồ doanh số

**Endpoint**: `GET /api/v1/thongke/bieu-do-doanh-so`

**Query Parameters**:
- `startDate`: string
- `endDate`: string
- `groupBy`: string ('day' | 'month' | 'year' | 'hour')

**Response**:
```json
{
  "data": [
    {
      "thoiGian": "2024-12-01T10:00:00",
      "doanhThu": 5000000
    }
  ]
}
```

**Service**: `thongKeService.fetchBieuDoData()`

---

### 7.3. Top sản phẩm bán chạy

**Endpoint**: `GET /api/v1/thongke/san-pham-ban-chay`

**Query Parameters**:
- `startDate`: string
- `endDate`: string
- `limit`: number (default: 5)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "tenSanPham": "Laptop Dell",
      "soLuongDaBan": 50,
      "doanhThu": 750000000
    }
  ]
}
```

**Service**: `thongKeService.fetchSanPhamBanChay()`

---

## 8. Lịch sử giao dịch

### 8.1. Lấy danh sách hóa đơn

**Endpoint**: `GET /api/v1/hoa-don`

**Query Parameters**:
- `page`: number
- `size`: number
- `keyword`: string
- `trangThaiThanhToan`: number (0: Chưa, 1: Đã)
- `loaiHoaDon`: number (0: Tại quầy, 1: Online)
- `startDate`: string
- `endDate`: string
- `sort`: string

**Response**:
```json
{
  "data": {
    "content": [
      {
        "id": "uuid",
        "ma": "HD-20241201-0001",
        "tongTien": 5000000,
        "trangThaiThanhToan": 1,
        "hoaDonChiTiet": [...],
        "khachHang": {...}
      }
    ],
    "totalElements": 100,
    "totalPages": 10
  }
}
```

**Service**: `hoaDonService.getHoaDons()`

---

## Error Response Format

```json
{
  "message": "Error message",
  "error": "Error code",
  "status": 400
}
```

## Notes

- Tất cả ID đều là UUID
- Tất cả giá tiền đều tính bằng VND
- Serial/IMEI bắt buộc khi thanh toán
- Tối đa 10 hóa đơn chờ cùng lúc

---

## 8. Quản lý giá đặc biệt (Price Override)

### 8.1. Cập nhật giá đặc biệt cho sản phẩm

**Endpoint**: `PUT /api/v1/ban-hang/hoa-don/cap-nhat-gia-dac-biet/{idHoaDonChiTiet}`

**Request Body**:
```json
{
  "giaMoi": 15000000,
  "lyDo": "Khách hàng VIP, giảm giá 10%",
  "loaiGiamGia": "percent",
  "giaTriGiam": 10
}
```

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "donGia": 15000000,
    "giamGiaDacBiet": {
      "soTienGiam": 1666666.67,
      "lyDo": "Khách hàng VIP, giảm giá 10%",
      "ngayTao": "2024-12-01T10:00:00",
      "nhanVienId": "uuid"
    }
  }
}
```

**Lưu ý**:
- Chỉ ADMIN, QUANLY, TRUONGCA mới có quyền giảm giá
- Bắt buộc phải có lý do giảm giá (tối thiểu 10 ký tự, tối đa 500 ký tự)
- Giảm giá > 50% cần xác nhận từ quản lý
- Tất cả thay đổi giá đều được ghi log

**Service**: `TODO: Tạo service capNhatGiaDacBiet() trong hoaDonService.js`

**Component**: `PriceOverrideModal.vue`

---

## ⚠️ TODO - Backend cần bổ sung/đảm bảo

### 1. Điểm tích lũy (Points)
- **Vấn đề**: FE dùng `khachHang.diemTichLuy` nhưng DB không có cột này trong `khach_hang`
- **Giải pháp**: Backend cần map `tich_diem.tong_diem` vào `khachHang.diemTichLuy` khi trả về thông tin khách hàng
- **File liên quan**: `CustomerInfo.vue`, `InvoiceDetails.vue`, `useVoucherPoints.js`

### 2. thanhTien trong hoa_don_chi_tiet
- **Vấn đề**: DB không có cột `thanh_tien` trong `hoa_don_chi_tiet`
- **Giải pháp**: Backend nên tính và trả về `thanhTien = donGia * soLuong` trong response
- **File liên quan**: `InvoiceDetails.vue`, `ModalThanhToan.vue`, `RecentTransactions.vue`

### 3. Serial đã quét
- **Vấn đề**: FE cần hiển thị serial đã quét từ bảng `serial_da_ban` khi xem lại hóa đơn đã thanh toán
- **Giải pháp**: Backend cần trả về `serialNumbers` array trong `hoaDonChiTiet` khi load hóa đơn đã thanh toán
- **File liên quan**: `InvoiceDetails.vue`, `RecentTransactions.vue`

### 4. soDiemSuDung và soTienQuyDoi
- **Vấn đề**: FE chưa hiển thị các field này từ `hoa_don` khi sử dụng điểm tích lũy
- **Giải pháp**: Backend cần trả về `soDiemSuDung` và `soTienQuyDoi` trong response hóa đơn
- **File liên quan**: `InvoiceDetails.vue`, `useVoucherPoints.js`

### 5. Serial Status Filter
- **Vấn đề**: Code FE đang lọc `trangThai === 0 || trangThai === 1` (bao gồm cả "Đã bán")
- **Giải pháp**: Đã fix - chỉ lọc `trangThai === 0` (Trong kho)
- **File đã fix**: `ModalThanhToan.vue`

