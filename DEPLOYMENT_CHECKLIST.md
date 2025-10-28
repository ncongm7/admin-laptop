# ✅ CHECKLIST TRIỂN KHAI GIAO DIỆN POS

## 📋 Danh sách Kiểm tra Trước khi Deploy

### 🔧 1. Cấu hình Backend

- [ ] **API Endpoints đã sẵn sàng**
  - [ ] `POST /api/v1/ban-hang/hoa-don/tao-moi` - Tạo hóa đơn chờ
  - [ ] `POST /api/v1/ban-hang/hoa-don/{id}/them-san-pham` - Thêm sản phẩm
  - [ ] `DELETE /api/v1/ban-hang/hoa-don/xoa-san-pham/{idHoaDonChiTiet}` - Xóa sản phẩm
  - [ ] `POST /api/v1/ban-hang/hoa-don/{id}/thanh-toan` - Thanh toán
  - [ ] `GET /api/chi-tiet-san-pham?keyword={keyword}` - Tìm kiếm sản phẩm
  - [ ] `GET /api/khach-hang/search?keyword={keyword}` - Tìm kiếm khách hàng
  - [ ] `GET /api/phuong-thuc-thanh-toan` - Lấy phương thức thanh toán

- [ ] **Backend Logic đã implement**
  - [ ] Tự động gán Serial (trang_thai=0) khi thanh toán
  - [ ] Cập nhật tồn kho khi thêm/xóa sản phẩm
  - [ ] Xử lý `so_luong_tam_giu` khi tạo hóa đơn chờ
  - [ ] Logic tính toán voucher/giảm giá
  - [ ] Logic sử dụng điểm tích lũy
  - [ ] Tạo lịch sử hóa đơn khi thanh toán

- [ ] **Database đã chuẩn bị**
  - [ ] Bảng `hoa_don` có cột `trang_thai` (0: CHỜ, 1: HỦY, 2: ĐÃ THANH TOÁN)
  - [ ] Bảng `chi_tiet_san_pham` có cột `so_luong_tam_giu`
  - [ ] Bảng `serial` có dữ liệu với `trang_thai = 0` (trong kho)
  - [ ] Bảng `phuong_thuc_thanh_toan` có dữ liệu
  - [ ] Bảng `khach_hang` có thông tin điểm tích lũy
  - [ ] Bảng `phieu_giam_gia` có voucher hoạt động

---

### 🎨 2. Frontend Setup

- [ ] **Environment Variables**
  - [ ] `VITE_API_BASE_URL` đã được cấu hình đúng
  - [ ] API timeout settings phù hợp
  - [ ] CORS được cấu hình đúng

- [ ] **Dependencies**
  - [ ] Đã chạy `npm install`
  - [ ] Tất cả packages đã được cài đặt đúng version
  - [ ] Không có vulnerability cần fix

- [ ] **Build Process**
  - [ ] `npm run dev` chạy không lỗi
  - [ ] `npm run build` thành công
  - [ ] Build output không có warning nghiêm trọng

---

### 🧪 3. Testing Chức năng

#### 3.1. Quản lý Hóa đơn
- [ ] Tạo hóa đơn mới thành công
- [ ] Chuyển đổi giữa các hóa đơn chờ
- [ ] Xóa hóa đơn chờ (confirmation hoạt động)
- [ ] Giới hạn 10 hóa đơn chờ hoạt động đúng
- [ ] Hóa đơn được lưu tạm tự động

#### 3.2. Tìm kiếm Sản phẩm
- [ ] Tìm kiếm theo tên sản phẩm
- [ ] Tìm kiếm theo mã CTSP
- [ ] Debounce search (300ms) hoạt động
- [ ] Hiển thị kết quả đúng định dạng
- [ ] Hiển thị tồn kho chính xác
- [ ] Click vào sản phẩm mở modal nhập số lượng

#### 3.3. Thêm/Xóa Sản phẩm
- [ ] Modal nhập số lượng hiển thị đúng
- [ ] Validation số lượng (không vượt tồn kho)
- [ ] Thêm sản phẩm vào hóa đơn thành công
- [ ] Xóa sản phẩm khỏi hóa đơn (có confirmation)
- [ ] Tồn kho được cập nhật real-time

#### 3.4. Quét Mã (Nếu có máy quét)
- [ ] Nhấn nút "Quét mã" kích hoạt chế độ quét
- [ ] Input focus đúng để nhận dữ liệu từ máy quét
- [ ] Quét mã CTSP tự động thêm vào hóa đơn
- [ ] Quét mã IMEI/Serial tìm được sản phẩm
- [ ] Thoát chế độ quét sau khi quét xong

#### 3.5. Tìm kiếm Khách hàng
- [ ] Tìm kiếm theo số điện thoại
- [ ] Tìm kiếm theo tên khách hàng
- [ ] Hiển thị dropdown kết quả đúng
- [ ] Click chọn khách hàng
- [ ] Hiển thị điểm tích lũy của khách hàng
- [ ] Chế độ khách lẻ hoạt động đúng

#### 3.6. Áp dụng Khuyến mãi
- [ ] Nhập mã voucher
- [ ] API validate voucher hoạt động
- [ ] Giảm giá được tính đúng
- [ ] Hiển thị thông báo voucher đã áp dụng
- [ ] Checkbox "Sử dụng điểm" hoạt động
- [ ] Quy đổi điểm sang tiền đúng

#### 3.7. Thanh Toán
- [ ] Modal thanh toán mở đúng
- [ ] Danh sách phương thức thanh toán load đúng
- [ ] **Tiền mặt:**
  - [ ] Nhập số tiền khách đưa
  - [ ] Tính tiền thừa tự động và chính xác
  - [ ] Validation: tiền khách đưa >= tổng tiền
- [ ] **Chuyển khoản/Thẻ:**
  - [ ] Nhập mã giao dịch
  - [ ] Không yêu cầu tiền khách đưa
- [ ] Nút "Xác nhận thanh toán" hoạt động
- [ ] Loading state hiển thị đúng
- [ ] Thông báo thanh toán thành công
- [ ] Hóa đơn được xóa khỏi danh sách chờ
- [ ] Backend lưu hóa đơn với `trang_thai = 2`

---

### 🔍 4. Kiểm tra UX/UI

#### 4.1. Desktop (>= 992px)
- [ ] Layout 3 cột hiển thị đúng tỷ lệ (25% - 45% - 30%)
- [ ] Tất cả các button/input có kích thước phù hợp
- [ ] Không có overflow hoặc scrollbar không mong muốn
- [ ] Màu sắc và font chữ đúng design
- [ ] Icons hiển thị đúng (Bootstrap Icons)

#### 4.2. Tablet (768px - 991px)
- [ ] Layout responsive chuyển sang 2 cột hoặc xếp chồng
- [ ] Các component vẫn dễ sử dụng
- [ ] Touch targets đủ lớn

#### 4.3. Mobile (< 768px)
- [ ] Layout 1 cột, xếp chồng hợp lý
- [ ] Tất cả chức năng vẫn truy cập được
- [ ] Font size và spacing phù hợp mobile

#### 4.4. Loading & Feedback
- [ ] Loading spinner hiển thị khi gọi API
- [ ] Success messages sau các hành động
- [ ] Error messages rõ ràng, dễ hiểu
- [ ] Confirmation dialogs cho hành động quan trọng

---

### 🚨 5. Error Handling

- [ ] **Không có sản phẩm trong hóa đơn:**
  - [ ] Nút "THANH TOÁN" bị disable
  - [ ] Hiển thị thông báo phù hợp

- [ ] **Sản phẩm hết hàng:**
  - [ ] Badge "Tồn: 0" màu đỏ
  - [ ] Không cho phép thêm vào hóa đơn
  - [ ] Thông báo lỗi rõ ràng

- [ ] **Số lượng vượt tồn kho:**
  - [ ] Validation ở modal nhập số lượng
  - [ ] Hiển thị thông báo lỗi real-time
  - [ ] Nút "Xác nhận" bị disable

- [ ] **API Error (500, 404, etc.):**
  - [ ] Hiển thị thông báo lỗi user-friendly
  - [ ] Log error vào console để debug
  - [ ] Không làm crash ứng dụng

- [ ] **Network Error:**
  - [ ] Thông báo "Mất kết nối"
  - [ ] Hướng dẫn người dùng kiểm tra kết nối

- [ ] **Timeout:**
  - [ ] Thông báo request timeout
  - [ ] Đề xuất thử lại

---

### 🔐 6. Security & Authorization

- [ ] **Authentication:**
  - [ ] User phải login mới truy cập được trang POS
  - [ ] Token được gửi trong header mỗi request
  - [ ] Token expired được xử lý (redirect to login)

- [ ] **Authorization:**
  - [ ] Chỉ nhân viên có quyền mới được bán hàng
  - [ ] Role check ở backend
  - [ ] Thông tin nhân viên được log vào hóa đơn

- [ ] **Data Validation:**
  - [ ] Input validation ở frontend và backend
  - [ ] SQL Injection prevention (backend)
  - [ ] XSS prevention

---

### 📊 7. Performance

- [ ] **Load Time:**
  - [ ] Trang load trong < 3 giây
  - [ ] Initial render không bị lag

- [ ] **Search Performance:**
  - [ ] Debounce hoạt động đúng (300ms)
  - [ ] Không gọi API quá nhiều lần
  - [ ] Pagination nếu kết quả nhiều

- [ ] **Memory:**
  - [ ] Không có memory leak
  - [ ] Component cleanup khi unmount

---

### 📱 8. Hardware Integration

#### 8.1. Máy quét Barcode/IMEI
- [ ] Máy quét được kết nối và nhận dạng
- [ ] Driver/software máy quét đã cài đặt
- [ ] Test quét mã thực tế:
  - [ ] Quét mã vạch sản phẩm
  - [ ] Quét số IMEI
  - [ ] Quét số Serial
- [ ] Dữ liệu quét được gửi đúng vào input
- [ ] Chế độ quét tự động tắt sau khi quét xong

#### 8.2. Máy in hóa đơn (Nếu có)
- [ ] Máy in được kết nối
- [ ] Driver máy in đã cài đặt
- [ ] Template hóa đơn đã sẵn sàng
- [ ] Test in hóa đơn mẫu

---

### 📝 9. Documentation

- [ ] File `SALES_POS_DOCUMENTATION.md` đã được review
- [ ] README.md đã được cập nhật
- [ ] API documentation rõ ràng
- [ ] Comment trong code đầy đủ
- [ ] Hướng dẫn sử dụng cho nhân viên

---

### 🎓 10. Training

- [ ] Nhân viên đã được đào tạo cách sử dụng POS
- [ ] Demo các tình huống thực tế:
  - [ ] Khách hàng mua 1 sản phẩm
  - [ ] Khách hàng mua nhiều sản phẩm
  - [ ] Áp dụng voucher
  - [ ] Sử dụng điểm tích lũy
  - [ ] Xử lý khi sản phẩm hết hàng
  - [ ] Xử lý khi khách hàng thay đổi ý định (xóa sản phẩm)
- [ ] Tài liệu hướng dẫn ngắn gọn cho nhân viên

---

### 🚀 11. Go-Live Checklist

- [ ] **Backup:**
  - [ ] Database đã được backup
  - [ ] Code đã được commit và push

- [ ] **Monitoring:**
  - [ ] Error logging đã được setup
  - [ ] Analytics tracking (nếu cần)

- [ ] **Support:**
  - [ ] Hotline hỗ trợ kỹ thuật
  - [ ] Team standby trong ngày go-live

- [ ] **Rollback Plan:**
  - [ ] Có kế hoạch rollback nếu có vấn đề
  - [ ] Database rollback script sẵn sàng

---

## ✅ HOÀN TẤT

Khi tất cả các mục trên đã được check:
- [ ] **UAT (User Acceptance Testing)** với nhân viên thực tế
- [ ] **Soft Launch** với vài giao dịch thử nghiệm
- [ ] **Official Launch** và theo dõi

---

**📞 Liên hệ hỗ trợ kỹ thuật nếu gặp vấn đề!**

**🎉 Chúc bạn triển khai thành công!**

