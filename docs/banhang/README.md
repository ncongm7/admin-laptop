# Module Bán Hàng Tại Quầy

## Tổng quan

Module bán hàng tại quầy là hệ thống POS (Point of Sale) cho phép nhân viên bán hàng tạo hóa đơn, quản lý sản phẩm, khách hàng, voucher và thực hiện thanh toán tại quầy.

## Kiến trúc

### Tech Stack

- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **UI Library**: Bootstrap 5 + Tailwind CSS
- **HTTP Client**: Axios
- **Router**: Vue Router 4
- **Thư viện hỗ trợ**:
  - `vue3-barcode-qrcode-reader`: Quét mã vạch/QR
  - `chart.js`: Vẽ biểu đồ thống kê
  - `date-fns`: Xử lý ngày tháng

### Cấu trúc thư mục

```
src/
├── views/banhang/
│   ├── SalesView.vue          # Màn hình chính bán hàng
│   └── SalesView.css           # Styles cho SalesView
│
├── components/banhang/
│   ├── ProductSearch.vue       # Tìm kiếm & chọn sản phẩm
│   ├── ProductDetailModal.vue  # Chi tiết sản phẩm
│   ├── AdvancedProductSearch.vue # Tìm kiếm nâng cao
│   ├── InvoiceDetails.vue      # Chi tiết hóa đơn
│   ├── InvoicePrint.vue        # In hóa đơn
│   ├── TransactionTabs.vue     # Danh sách hóa đơn chờ
│   ├── CustomerInfo.vue        # Thông tin khách hàng
│   ├── ModalThanhToan.vue      # Modal thanh toán
│   ├── VoucherSuggestionModal.vue # Gợi ý voucher
│   ├── SalesQuickStats.vue     # Thống kê nhanh
│   ├── RecentTransactions.vue  # Lịch sử giao dịch
│   └── PriceOverrideModal.vue # Giảm giá đặc biệt
│
├── composables/
│   ├── useBillManagement.js   # Quản lý hóa đơn
│   ├── useProductManagement.js # Quản lý sản phẩm
│   ├── useCustomerManagement.js # Quản lý khách hàng
│   ├── usePayment.js           # Xử lý thanh toán
│   ├── useSerialValidation.js  # Xác thực serial/IMEI
│   └── useVoucherPoints.js     # Voucher & điểm tích lũy
│
└── service/banhang/
    ├── banHangService.js       # API bán hàng chính
    ├── hoaDonService.js       # API hóa đơn
    ├── sanPhamBanHangService.js # API sản phẩm
    ├── khachHangBanHangService.js # API khách hàng
    ├── thanhToanService.js     # API thanh toán
    ├── serialService.js        # API serial/IMEI
    └── voucherService.js       # API voucher
```

## Luồng hoạt động chính

### 1. Tạo hóa đơn mới

1. Nhân viên click "Tạo Đơn Mới"
2. `useBillManagement.taoHoaDonMoi()` gọi API `POST /api/v1/ban-hang/hoa-don/tao-moi`
3. Hóa đơn mới được thêm vào danh sách chờ (tối đa 10 hóa đơn)
4. Tự động chọn hóa đơn vừa tạo

### 2. Thêm sản phẩm vào hóa đơn

1. Tìm kiếm sản phẩm trong `ProductSearch.vue`
2. Chọn biến thể sản phẩm
3. Nhập số lượng (validate tồn kho)
4. `useProductManagement.confirmAddProduct()` gọi API `POST /api/v1/ban-hang/hoa-don/{id}/them-san-pham`
5. Cập nhật hóa đơn hiện tại

### 3. Quản lý khách hàng

1. Tìm kiếm khách hàng theo SĐT/tên
2. Chọn khách hàng hoặc tạo mới
3. `useCustomerManagement.handleUpdateCustomer()` gọi API `PUT /api/v1/ban-hang/hoa-don/{id}/khach-hang`
4. Hiển thị điểm tích lũy

### 4. Áp dụng voucher & điểm

1. Mở modal gợi ý voucher
2. Chọn voucher hoặc sử dụng điểm tích lũy
3. `useVoucherPoints.handleApplyVoucher()` gọi API áp dụng voucher
4. Cập nhật tổng tiền sau giảm giá

### 5. Thanh toán

1. Click "Thanh toán" → Mở `ModalThanhToan`
2. Chọn phương thức thanh toán
3. **Quét Serial/IMEI bắt buộc** cho tất cả sản phẩm
4. `usePayment.handlePaymentConfirmed()` gọi API `POST /api/v1/ban-hang/hoa-don/{id}/thanh-toan`
5. Xóa hóa đơn khỏi danh sách chờ sau khi thanh toán thành công

## Component chính

### SalesView.vue

Màn hình chính, layout 3 cột:
- **Cột 1**: Danh sách hóa đơn chờ + Thông tin khách hàng
- **Cột 2**: Tìm kiếm sản phẩm
- **Cột 3**: Chi tiết hóa đơn hiện tại

### ProductSearch.vue

- Tìm kiếm sản phẩm theo tên/mã
- Quét mã vạch/QR tự động
- Pagination
- Lazy load ảnh
- Badges (Mới, Hot, Giảm giá)
- Keyboard shortcuts

### InvoiceDetails.vue

- Hiển thị danh sách sản phẩm trong hóa đơn
- Ảnh sản phẩm, serial đã quét
- Sửa số lượng
- Xóa sản phẩm
- Áp dụng voucher, sử dụng điểm
- In hóa đơn

### ModalThanhToan.vue

- Chọn phương thức thanh toán
- Quét Serial/IMEI (bắt buộc)
- Preview hóa đơn
- Tính tiền thừa/thiếu
- Xác thực serial trước khi thanh toán

## Composable chính

### useBillManagement.js

Quản lý hóa đơn:
- `taoHoaDonMoi()`: Tạo hóa đơn mới
- `chonHoaDon()`: Chọn hóa đơn từ danh sách
- `xoaHoaDonCho()`: Xóa hóa đơn chờ
- `copyBill()`: Copy hóa đơn
- `loadDanhSachHoaDonCho()`: Load danh sách hóa đơn chờ
- `handleSaveDraft()`: Lưu draft (auto-save mỗi 30s)

### useProductManagement.js

Quản lý sản phẩm:
- `handleProductSelected()`: Xử lý khi chọn sản phẩm
- `confirmAddProduct()`: Thêm sản phẩm vào hóa đơn
- `handleDeleteItem()`: Xóa sản phẩm khỏi hóa đơn
- `handleScanImei()`: Quét IMEI/Serial và tự động thêm sản phẩm

### useSerialValidation.js

Xác thực Serial/IMEI:
- `xacThucMotSerial()`: Xác thực một serial
- `getSerialPayload()`: Lấy danh sách serial để gửi lên backend
- `daQuetDu`: Computed - kiểm tra đã quét đủ serial chưa

## Service chính

### banHangService.js

- `taoHoaDonChoMoi()`: Tạo hóa đơn chờ
- `themSanPhamVaoHoaDon()`: Thêm sản phẩm
- `xoaSanPhamKhoiHoaDon()`: Xóa sản phẩm
- `capNhatSoLuongSanPham()`: Cập nhật số lượng
- `capNhatKhachHang()`: Cập nhật khách hàng
- `huyHoaDon()`: Hủy hóa đơn
- `inHoaDon()`: In hóa đơn (trả về blob)

### thanhToanService.js

- `layDanhSachPhuongThucThanhToan()`: Lấy danh sách phương thức thanh toán
- `thanhToanHoaDon()`: Thanh toán hóa đơn (kèm serial numbers)

### sanPhamBanHangService.js

- `timKiemSanPham()`: Tìm kiếm sản phẩm
- `laySanPhamConHang()`: Lấy sản phẩm còn hàng
- `timKiemSanPhamNangCao()`: Tìm kiếm nâng cao với filters

## Tính năng đặc biệt

### Auto-save Draft

- Tự động lưu hóa đơn chờ vào localStorage mỗi 30 giây
- Khôi phục khi reload trang (nếu backend không có)
- Hiển thị badge "Draft" trên hóa đơn chưa thanh toán

### Quét mã vạch/QR

- Tích hợp `vue3-barcode-qrcode-reader`
- Tự động nhận diện khi quét
- Tự động tìm sản phẩm và thêm vào hóa đơn

### Keyboard Shortcuts

- `Ctrl+F`: Mở tìm kiếm nâng cao
- `Esc`: Đóng modal
- `Enter`: Chọn sản phẩm đầu tiên
- `D`: Xem chi tiết sản phẩm đầu tiên
- `E`: Sửa số lượng sản phẩm đầu tiên
- `Delete`: Xóa sản phẩm đầu tiên

## Giới hạn

- Tối đa 10 hóa đơn chờ cùng lúc
- Serial/IMEI bắt buộc khi thanh toán
- Giảm giá đặc biệt chỉ dành cho quản lý

## Dependencies

- Vue 3.5.17
- Pinia 3.0.3
- Bootstrap 5.3.7
- Chart.js 4.5.1
- vue3-barcode-qrcode-reader 1.0.16
- date-fns 4.1.0

