# 📚 TÀI LIỆU GIAO DIỆN BÁN HÀNG TẠI QUẦY (POS)

## 🎯 Tổng quan

Giao diện bán hàng tại quầy (Point of Sale) được thiết kế theo mô hình **3 cột** tối ưu cho nghiệp vụ bán lẻ laptop, giúp nhân viên bán hàng thao tác nhanh chóng và hiệu quả.

---

## 🏗️ Cấu trúc Layout (3 Cột)

### **Cột 1: Quản lý Giao dịch (25%)**
- **TransactionTabs.vue**: Quản lý hóa đơn chờ
  - Hiển thị danh sách các hóa đơn đang chờ (tối đa 10 hóa đơn)
  - Chuyển đổi nhanh giữa các hóa đơn
  - Nút tạo đơn mới nhanh
  - Hiển thị tổng tiền và số lượng sản phẩm của mỗi hóa đơn

- **CustomerInfo.vue**: Thông tin khách hàng
  - Tìm kiếm khách hàng theo SĐT hoặc tên
  - Hiển thị điểm tích lũy của khách hàng
  - Chế độ khách lẻ (khách vãng lai)
  - Nút thêm khách hàng mới

### **Cột 2: Tìm kiếm Sản phẩm (45%)**
- **ProductSearch.vue**: Tìm kiếm và quét mã
  - Tìm kiếm sản phẩm theo tên hoặc mã CTSP
  - Chế độ quét mã vạch/IMEI
  - Hiển thị sản phẩm dạng lưới (grid)
  - Hiển thị thông tin: Ảnh, tên, giá, tồn kho, cấu hình
  - Click vào sản phẩm để thêm vào hóa đơn

### **Cột 3: Chi tiết Hóa đơn (30%)**
- **InvoiceDetails.vue**: Trung tâm giao dịch
  - Danh sách sản phẩm đã thêm (có thể xóa)
  - Khu vực áp dụng voucher/mã giảm giá
  - Sử dụng điểm tích lũy (nếu có)
  - Tổng kết: Tổng tiền hàng, Giảm giá, Khách cần trả
  - Các nút hành động:
    - **THANH TOÁN** (màu xanh lá, nổi bật)
    - Lưu tạm
    - Hủy đơn

---

## 🔄 Luồng Nghiệp vụ Chuẩn

### 1. Tạo Hóa đơn Mới
```
Nhân viên click "Tạo Đơn Mới"
→ Hệ thống tạo hóa đơn chờ (trang_thai = 0)
→ Hóa đơn được thêm vào danh sách chờ ở Cột 1
```

### 2. Tìm kiếm và Thêm Sản phẩm
```
Cách 1: Tìm kiếm thủ công
- Nhập tên/mã sản phẩm ở Cột 2
- Click vào sản phẩm muốn thêm
- Nhập số lượng trong modal
- Sản phẩm được thêm vào hóa đơn (Cột 3)

Cách 2: Quét mã vạch/IMEI
- Click nút "Quét mã" ở Cột 2
- Quét mã vạch trên hộp sản phẩm hoặc IMEI
- Sản phẩm tự động được thêm vào hóa đơn với số lượng 1
```

### 3. Chọn Khách hàng (Tùy chọn)
```
- Tìm kiếm khách hàng ở Cột 1
- Hệ thống hiển thị điểm tích lũy
- Nếu không tìm thấy: "Thêm khách hàng mới"
- Nếu khách lẻ: Bỏ qua bước này
```

### 4. Áp dụng Khuyến mãi (Tùy chọn)
```
ở Cột 3:
- Nhập mã voucher → Click "Áp dụng"
- Hoặc tick chọn "Sử dụng điểm tích lũy"
- Hệ thống tự động tính toán giảm giá
```

### 5. Thanh Toán
```
- Click nút "THANH TOÁN" ở Cột 3
- Modal thanh toán hiện ra:
  + Chọn phương thức: Tiền mặt, Chuyển khoản, Thẻ...
  + Nhập số tiền khách đưa (nếu tiền mặt)
  + Hệ thống tự động tính tiền thừa
  + Nhập mã giao dịch (nếu chuyển khoản/thẻ)
- Click "Xác nhận thanh toán"
- Hóa đơn được lưu (trang_thai = 2: ĐÃ THANH TOÁN)
- Backend tự động gán Serial (trang_thai = 0) cho sản phẩm
```

### 6. Quản lý Nhiều Hóa đơn
```
- Nhân viên có thể tạo tối đa 10 hóa đơn chờ
- Chuyển đổi giữa các hóa đơn bằng cách click vào tab ở Cột 1
- Mỗi hóa đơn lưu trữ độc lập
- Xóa hóa đơn chờ bằng nút X trên mỗi tab
```

---

## 🛠️ Các Component Chính

### 1. SalesView.vue
**Đường dẫn**: `/src/views/banhang/SalesView.vue`

**Chức năng**:
- Container chính của giao diện POS
- Quản lý state của các hóa đơn chờ
- Điều phối các component con
- Xử lý các sự kiện từ component con

**Props**: Không có

**Emits**: Không có

**State chính**:
- `danhSachHoaDonCho`: Mảng các hóa đơn chờ
- `hoaDonHienTai`: Hóa đơn đang được chọn
- `isLoading`: Trạng thái loading

---

### 2. TransactionTabs.vue
**Đường dẫn**: `/src/components/banhang/TransactionTabs.vue`

**Props**:
- `bills`: Array - Danh sách hóa đơn chờ
- `selectedBillId`: String - ID của hóa đơn đang được chọn

**Emits**:
- `select-bill`: Khi chọn một hóa đơn
- `remove-bill`: Khi xóa một hóa đơn
- `create-new`: Khi tạo hóa đơn mới

---

### 3. CustomerInfo.vue
**Đường dẫn**: `/src/components/banhang/CustomerInfo.vue`

**Props**:
- `customer`: Object - Thông tin khách hàng hiện tại

**Emits**:
- `update:customer`: Khi cập nhật khách hàng
- `search-customer`: Khi tìm kiếm khách hàng
- `create-customer`: Khi tạo khách hàng mới

**API sử dụng**:
- `timKiemKhachHang(params)`: Tìm kiếm khách hàng theo keyword

---

### 4. ProductSearch.vue
**Đường dẫn**: `/src/components/banhang/ProductSearch.vue`

**Props**: Không có

**Emits**:
- `product-selected`: Khi chọn một sản phẩm
- `scan-imei`: Khi quét mã IMEI/Barcode

**API sử dụng**:
- `timKiemSanPham(params)`: Tìm kiếm sản phẩm theo keyword

**Tính năng đặc biệt**:
- Chế độ quét mã vạch/IMEI
- Debounce search (300ms)
- Hiển thị tồn kho real-time

---

### 5. InvoiceDetails.vue
**Đường dẫn**: `/src/components/banhang/InvoiceDetails.vue`

**Props**:
- `hoaDon`: Object - Thông tin hóa đơn hiện tại

**Emits**:
- `delete-item`: Xóa sản phẩm khỏi hóa đơn
- `apply-voucher`: Áp dụng mã giảm giá
- `use-points`: Sử dụng điểm tích lũy
- `complete-payment`: Hoàn tất thanh toán
- `save-draft`: Lưu tạm hóa đơn
- `cancel-bill`: Hủy hóa đơn

**Computed**:
- `canPayment`: Kiểm tra có thể thanh toán hay không (có sản phẩm trong hóa đơn)

---

### 6. ModalThanhToan.vue
**Đường dẫn**: `/src/components/banhang/ModalThanhToan.vue`

**Props**:
- `hoaDon`: Object - Thông tin hóa đơn cần thanh toán

**Emits**:
- `close`: Đóng modal
- `payment-confirmed`: Xác nhận thanh toán với payload

**API sử dụng**:
- `layDanhSachPhuongThucThanhToan()`: Lấy danh sách phương thức thanh toán

**Payload thanh toán**:
```javascript
{
  idPhuongThucThanhToan: String,
  soTienThanhToan: Number,
  ghiChu: String,
  maGiaoDich: String,
  tienKhachDua: Number (chỉ với tiền mặt),
  tienThua: Number (chỉ với tiền mặt)
}
```

---

## 🔌 API Endpoints

### Bán hàng
- `POST /api/v1/ban-hang/hoa-don/tao-moi`: Tạo hóa đơn chờ mới
- `POST /api/v1/ban-hang/hoa-don/{id}/them-san-pham`: Thêm sản phẩm vào hóa đơn
- `DELETE /api/v1/ban-hang/hoa-don/xoa-san-pham/{idHoaDonChiTiet}`: Xóa sản phẩm
- `POST /api/v1/ban-hang/hoa-don/{id}/thanh-toan`: Thanh toán hóa đơn

### Tìm kiếm
- `GET /api/chi-tiet-san-pham?keyword={keyword}`: Tìm kiếm sản phẩm
- `GET /api/khach-hang/search?keyword={keyword}`: Tìm kiếm khách hàng

### Khác
- `GET /api/phuong-thuc-thanh-toan`: Lấy danh sách phương thức thanh toán

---

## 🎨 Màu sắc & Thiết kế

### Màu chủ đạo
- **Primary**: #0dcaf0 (Cyan) - Tìm kiếm, thông tin
- **Success**: #28a745 (Green) - Thanh toán, xác nhận
- **Danger**: #dc3545 (Red) - Xóa, hủy, giá tiền
- **Warning**: #ffc107 (Yellow) - Cảnh báo, điểm tích lũy
- **Info**: #0dcaf0 (Cyan) - Thông tin bổ sung

### Typography
- Font chính: System UI, -apple-system, Segoe UI
- Font số tiền: Monospace
- Kích thước chuẩn: 0.9rem - 1rem
- Tiêu đề: 1.1rem - 1.5rem

### Spacing
- Gap giữa các cột: 1rem (16px)
- Padding card: 0.75rem - 1rem
- Border radius: 6px - 8px

---

## 📱 Responsive Design

### Desktop (≥ 992px)
- Layout 3 cột: 25% - 45% - 30%
- Hiển thị đầy đủ tính năng

### Tablet (768px - 991px)
- Layout 2 cột: 40% - 60%
- Cột 1 và 2 ở hàng đầu
- Cột 3 ở hàng thứ 2

### Mobile (< 768px)
- Layout 1 cột
- Các component xếp chồng lên nhau
- Ưu tiên hiển thị: Tìm kiếm → Chi tiết hóa đơn → Khách hàng

---

## ⚙️ Cấu hình & Customization

### Giới hạn nghiệp vụ
```javascript
// Số lượng hóa đơn chờ tối đa
MAX_PENDING_BILLS = 10

// Debounce time cho search
SEARCH_DEBOUNCE_TIME = 300ms

// Quy đổi điểm sang tiền
POINTS_TO_MONEY_RATE = 100 (100 điểm = 10,000 VND)
```

### Trạng thái hóa đơn
```javascript
TRANG_THAI = {
  CHO_THANH_TOAN: 0,
  DA_HUY: 1,
  DA_THANH_TOAN: 2
}
```

### Trạng thái Serial
```javascript
TRANG_THAI_SERIAL = {
  TRONG_KHO: 0,
  DA_BAN: 1
}
```

---

## 🐛 Xử lý Lỗi & Edge Cases

### 1. Không có sản phẩm trong hóa đơn
- Nút "THANH TOÁN" bị disable
- Hiển thị thông báo: "Chưa có sản phẩm"

### 2. Hết tồn kho
- Hiển thị badge màu đỏ
- Không cho phép thêm vào hóa đơn
- Thông báo: "Sản phẩm hết hàng"

### 3. Số lượng vượt tồn kho
- Validation ở modal nhập số lượng
- Thông báo lỗi real-time

### 4. Đạt giới hạn hóa đơn chờ (10 hóa đơn)
- Nút "Tạo Đơn Mới" bị disable
- Hiển thị cảnh báo: "Tối đa 10 hóa đơn chờ"

### 5. Mất kết nối API
- Hiển thị thông báo lỗi
- Retry mechanism (tùy chọn)

---

## 🚀 Hướng dẫn Triển khai

### 1. Cài đặt Dependencies
```bash
# Đã có sẵn trong package.json
npm install
```

### 2. Cấu hình API Base URL
```javascript
// src/service/axiosInstance.js
const API_BASE_URL = 'http://localhost:8080' // Thay đổi theo môi trường
```

### 3. Chạy Development Server
```bash
npm run dev
```

### 4. Build Production
```bash
npm run build
```

---

## 📝 Checklist Triển khai

- [x] Layout 3 cột responsive
- [x] Component TransactionTabs.vue
- [x] Component CustomerInfo.vue
- [x] Component ProductSearch.vue
- [x] Component InvoiceDetails.vue
- [x] Modal thanh toán
- [x] Tích hợp API bán hàng
- [x] Tích hợp API tìm kiếm
- [ ] Test chức năng quét mã IMEI (cần máy quét)
- [ ] Test thanh toán thực tế
- [ ] Test với dữ liệu production
- [ ] Tối ưu performance
- [ ] Thêm unit tests
- [ ] Thêm E2E tests

---

## 🔮 Tính năng Tương lai

1. **In hóa đơn**: Tự động in hóa đơn sau thanh toán
2. **Báo cáo real-time**: Doanh thu, sản phẩm bán chạy
3. **Quét QR Code**: Thanh toán qua QR Code
4. **Đồng bộ offline**: Hoạt động khi mất kết nối
5. **Phím tắt**: Keyboard shortcuts cho các thao tác
6. **Voice command**: Tìm kiếm bằng giọng nói
7. **Multi-currency**: Hỗ trợ nhiều loại tiền tệ

---

## 👥 Liên hệ & Hỗ trợ

- **Developer**: AI Expert
- **Ngày tạo**: 2025-10-27
- **Version**: 1.0.0

---

**Chúc bạn thành công với hệ thống POS! 🎉**

