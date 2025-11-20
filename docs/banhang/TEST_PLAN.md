# 🧪 TEST PLAN - MODULE BÁN HÀNG

## 📋 TỔNG QUAN

**Mục đích**: Test toàn bộ chức năng module bán hàng tại quầy  
**Phạm vi**: Tất cả các tính năng đã implement  
**Người test**: _______________  
**Ngày test**: _______________  

---

## ✅ TEST CASE 1: IN HÓA ĐƠN

### 1.1. In hóa đơn từ SalesView
- [ ] **Bước 1**: Mở trang bán hàng (`/ban-hang`)
- [ ] **Bước 2**: Tạo hóa đơn mới và thêm sản phẩm
- [ ] **Bước 3**: Click nút "In hóa đơn" ở header
- [ ] **Kết quả mong đợi**: 
  - Mở modal preview hóa đơn
  - Tự động mở dialog in
  - Hóa đơn hiển thị đầy đủ thông tin

### 1.2. In hóa đơn sau thanh toán
- [ ] **Bước 1**: Tạo hóa đơn và thêm sản phẩm
- [ ] **Bước 2**: Thanh toán hóa đơn
- [ ] **Kết quả mong đợi**: 
  - Tự động mở dialog in sau khi thanh toán thành công
  - Hóa đơn hiển thị đúng thông tin thanh toán

### 1.3. In hóa đơn từ QuanLiHoaDon
- [ ] **Bước 1**: Mở trang quản lý hóa đơn (`/quan-li-hoa-don`)
- [ ] **Bước 2**: Click nút in (icon printer) ở cột "Hành động"
- [ ] **Kết quả mong đợi**: 
  - Mở cửa sổ mới với hóa đơn HTML
  - Tự động mở dialog in
  - Nếu popup bị chặn, tải file HTML về máy

### 1.4. In hóa đơn từ RecentTransactions
- [ ] **Bước 1**: Mở component RecentTransactions (nếu có trong SalesView)
- [ ] **Bước 2**: Click nút in ở một giao dịch
- [ ] **Kết quả mong đợi**: 
  - Mở cửa sổ mới với hóa đơn
  - Tự động mở dialog in

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 2: SỬA SỐ LƯỢNG SẢN PHẨM

### 2.1. Sửa số lượng hợp lệ
- [ ] **Bước 1**: Tạo hóa đơn và thêm sản phẩm (ví dụ: 2 cái)
- [ ] **Bước 2**: Click nút "Sửa" (icon pencil) bên cạnh sản phẩm
- [ ] **Bước 3**: Nhập số lượng mới (ví dụ: 5) trong modal
- [ ] **Bước 4**: Click "Xác nhận"
- [ ] **Kết quả mong đợi**: 
  - Modal đóng
  - Số lượng sản phẩm cập nhật thành 5
  - Tổng tiền tự động cập nhật
  - Hiển thị thông báo thành công

### 2.2. Sửa số lượng vượt quá tồn kho
- [ ] **Bước 1**: Click nút "Sửa" sản phẩm có tồn kho = 3
- [ ] **Bước 2**: Nhập số lượng = 10
- [ ] **Kết quả mong đợi**: 
  - Hiển thị lỗi: "Số lượng không được vượt quá tồn kho (3)"
  - Tự động điều chỉnh về 3
  - Nút "Xác nhận" bị disable

### 2.3. Sửa số lượng = 0 hoặc âm
- [ ] **Bước 1**: Click nút "Sửa"
- [ ] **Bước 2**: Nhập số lượng = 0 hoặc -1
- [ ] **Kết quả mong đợi**: 
  - Hiển thị lỗi validation
  - Nút "Xác nhận" bị disable

### 2.4. Keyboard shortcut (E)
- [ ] **Bước 1**: Chọn sản phẩm đầu tiên trong hóa đơn
- [ ] **Bước 2**: Nhấn phím `E`
- [ ] **Kết quả mong đợi**: 
  - Mở modal sửa số lượng cho sản phẩm đầu tiên

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 3: XEM CHI TIẾT SẢN PHẨM

### 3.1. Mở modal chi tiết từ ProductSearch
- [ ] **Bước 1**: Tìm kiếm sản phẩm trong ProductSearch
- [ ] **Bước 2**: Click nút "Chi tiết" (icon info-circle) trên product card
- [ ] **Kết quả mong đợi**: 
  - Mở modal ProductDetailModal
  - Hiển thị ảnh sản phẩm
  - Hiển thị thông số kỹ thuật
  - Hiển thị danh sách biến thể

### 3.2. Chọn biến thể từ modal
- [ ] **Bước 1**: Mở modal chi tiết sản phẩm
- [ ] **Bước 2**: Click nút "Chọn" ở một biến thể có tồn kho > 0
- [ ] **Kết quả mong đợi**: 
  - Modal đóng
  - Mở modal chọn số lượng cho biến thể đó
  - Sau khi chọn số lượng, sản phẩm được thêm vào hóa đơn

### 3.3. Keyboard shortcut (D)
- [ ] **Bước 1**: Chọn một product card trong kết quả tìm kiếm
- [ ] **Bước 2**: Nhấn phím `D`
- [ ] **Kết quả mong đợi**: 
  - Mở modal chi tiết sản phẩm

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 4: QUÉT MÃ VẠCH/QR CODE

### 4.1. Quét bằng camera
- [ ] **Bước 1**: Click nút "Quét mã vạch/QR" (icon upc-scan) trong ProductSearch
- [ ] **Bước 2**: Đưa mã vạch/QR vào khung camera
- [ ] **Kết quả mong đợi**: 
  - Camera bật và quét được mã
  - Tự động tìm sản phẩm theo mã
  - Nếu tìm thấy, tự động thêm vào hóa đơn
  - Hiển thị thông báo thành công

### 4.2. Nhập mã thủ công
- [ ] **Bước 1**: Bật chế độ quét (hoặc không)
- [ ] **Bước 2**: Nhập mã vạch/IMEI vào ô tìm kiếm
- [ ] **Bước 3**: Nhấn Enter hoặc đợi debounce
- [ ] **Kết quả mong đợi**: 
  - Tự động tìm sản phẩm
  - Nếu tìm thấy, thêm vào hóa đơn

### 4.3. Quét liên tục
- [ ] **Bước 1**: Bật camera quét
- [ ] **Bước 2**: Quét nhiều mã liên tiếp
- [ ] **Kết quả mong đợi**: 
  - Mỗi lần quét thành công, sản phẩm được thêm vào hóa đơn
  - Không bị lỗi khi quét nhanh

### 4.4. Quét mã không tồn tại
- [ ] **Bước 1**: Quét/nhập mã không có trong hệ thống
- [ ] **Kết quả mong đợi**: 
  - Hiển thị thông báo: "Không tìm thấy sản phẩm"
  - Không thêm sản phẩm vào hóa đơn

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 5: TÌM KIẾM NÂNG CAO

### 5.1. Mở modal tìm kiếm nâng cao
- [ ] **Bước 1**: Click nút "Tìm kiếm nâng cao" (icon funnel) trong ProductSearch
- [ ] **Kết quả mong đợi**: 
  - Mở modal AdvancedProductSearch
  - Hiển thị các bộ lọc: từ khóa, giá, tồn kho, sắp xếp

### 5.2. Lọc theo khoảng giá
- [ ] **Bước 1**: Mở tìm kiếm nâng cao
- [ ] **Bước 2**: Nhập giá từ: 5,000,000, giá đến: 20,000,000
- [ ] **Bước 3**: Click "Tìm kiếm"
- [ ] **Kết quả mong đợi**: 
  - Chỉ hiển thị sản phẩm có giá trong khoảng 5-20 triệu

### 5.3. Lọc theo tồn kho
- [ ] **Bước 1**: Mở tìm kiếm nâng cao
- [ ] **Bước 2**: Chọn "Còn hàng" trong dropdown "Tình trạng tồn kho"
- [ ] **Bước 3**: Click "Tìm kiếm"
- [ ] **Kết quả mong đợi**: 
  - Chỉ hiển thị sản phẩm còn tồn kho > 0

### 5.4. Sắp xếp
- [ ] **Bước 1**: Mở tìm kiếm nâng cao
- [ ] **Bước 2**: Chọn "Giá (thấp → cao)" trong dropdown "Sắp xếp"
- [ ] **Bước 3**: Click "Tìm kiếm"
- [ ] **Kết quả mong đợi**: 
  - Sản phẩm được sắp xếp theo giá tăng dần

### 5.5. Lưu bộ lọc yêu thích
- [ ] **Bước 1**: Mở tìm kiếm nâng cao
- [ ] **Bước 2**: Thiết lập các bộ lọc
- [ ] **Bước 3**: Click "Lưu" trong phần "Bộ lọc yêu thích"
- [ ] **Bước 4**: Đóng modal và mở lại
- [ ] **Kết quả mong đợi**: 
  - Bộ lọc đã lưu xuất hiện trong dropdown
  - Có thể chọn và áp dụng lại

### 5.6. Keyboard shortcut (Ctrl+F)
- [ ] **Bước 1**: Ở trang bán hàng, nhấn `Ctrl+F`
- [ ] **Kết quả mong đợi**: 
  - Mở modal tìm kiếm nâng cao

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 6: COPY HÓA ĐƠN

### 6.1. Copy hóa đơn có sản phẩm
- [ ] **Bước 1**: Tạo hóa đơn và thêm 3 sản phẩm
- [ ] **Bước 2**: Gán khách hàng cho hóa đơn
- [ ] **Bước 3**: Click nút "Copy" (icon files) trên tab hóa đơn trong TransactionTabs
- [ ] **Kết quả mong đợi**: 
  - Tạo hóa đơn mới
  - Copy tất cả 3 sản phẩm vào hóa đơn mới
  - Copy thông tin khách hàng
  - Hóa đơn mới được chọn làm hóa đơn hiện tại
  - Hiển thị thông báo thành công

### 6.2. Copy hóa đơn không có sản phẩm
- [ ] **Bước 1**: Tạo hóa đơn trống (chưa thêm sản phẩm)
- [ ] **Bước 2**: Click nút "Copy"
- [ ] **Kết quả mong đợi**: 
  - Tạo hóa đơn mới trống
  - Copy thông tin khách hàng (nếu có)

### 6.3. Copy khi đã đạt giới hạn 10 hóa đơn
- [ ] **Bước 1**: Tạo đủ 10 hóa đơn chờ
- [ ] **Bước 2**: Click nút "Copy" trên một hóa đơn
- [ ] **Kết quả mong đợi**: 
  - Hiển thị cảnh báo: "Đã đạt giới hạn tối đa 10 hóa đơn chờ"
  - Không tạo hóa đơn mới

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 7: LƯU DRAFT TỰ ĐỘNG

### 7.1. Auto-save mỗi 30 giây
- [ ] **Bước 1**: Tạo hóa đơn và thêm sản phẩm
- [ ] **Bước 2**: Đợi 30 giây (không làm gì)
- [ ] **Bước 3**: Mở DevTools > Application > Local Storage
- [ ] **Kết quả mong đợi**: 
  - Có key `banhang_draft_bills` trong localStorage
  - Chứa thông tin hóa đơn đã tạo

### 7.2. Khôi phục draft khi reload
- [ ] **Bước 1**: Tạo hóa đơn và thêm sản phẩm
- [ ] **Bước 2**: Reload trang (F5)
- [ ] **Kết quả mong đợi**: 
  - Hóa đơn được khôi phục từ localStorage (nếu backend chưa có)
  - Hoặc load từ backend (nếu backend đã có)
  - Hiển thị badge "Draft" trên hóa đơn chưa thanh toán

### 7.3. Manual save draft
- [ ] **Bước 1**: Tạo hóa đơn
- [ ] **Bước 2**: Click nút "Lưu tạm" trong InvoiceDetails
- [ ] **Kết quả mong đợi**: 
  - Hiển thị thông báo: "Hóa đơn đã được lưu tạm!"
  - Lưu vào localStorage

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 8: SALES QUICK STATS

### 8.1. Hiển thị thống kê
- [ ] **Bước 1**: Mở component SalesQuickStats (nếu có trong SalesView)
- [ ] **Kết quả mong đợi**: 
  - Hiển thị doanh thu hôm nay
  - Hiển thị số đơn đã bán
  - Hiển thị giá trị đơn trung bình
  - Hiển thị biểu đồ doanh thu theo giờ
  - Hiển thị top sản phẩm bán chạy

### 8.2. Refresh stats
- [ ] **Bước 1**: Click nút refresh (icon arrow-clockwise)
- [ ] **Kết quả mong đợi**: 
  - Reload lại dữ liệu thống kê
  - Hiển thị loading indicator

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 9: RECENT TRANSACTIONS

### 9.1. Hiển thị 10 giao dịch gần nhất
- [ ] **Bước 1**: Mở component RecentTransactions
- [ ] **Kết quả mong đợi**: 
  - Hiển thị danh sách 10 giao dịch gần nhất
  - Mỗi item hiển thị: mã hóa đơn, ngày, tổng tiền, trạng thái

### 9.2. Tìm kiếm hóa đơn
- [ ] **Bước 1**: Nhập mã hóa đơn vào ô tìm kiếm
- [ ] **Bước 2**: Nhấn Enter hoặc click nút tìm
- [ ] **Kết quả mong đợi**: 
  - Lọc danh sách theo mã hóa đơn
  - Hiển thị kết quả phù hợp

### 9.3. Xem chi tiết giao dịch
- [ ] **Bước 1**: Click vào một giao dịch trong danh sách
- [ ] **Kết quả mong đợi**: 
  - Mở modal chi tiết hóa đơn
  - Hiển thị đầy đủ thông tin: sản phẩm, khách hàng, thanh toán

### 9.4. In lại hóa đơn
- [ ] **Bước 1**: Click nút in (icon printer) trên một giao dịch
- [ ] **Kết quả mong đợi**: 
  - Mở cửa sổ mới với hóa đơn
  - Tự động mở dialog in

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 10: RESPONSIVE DESIGN

### 10.1. Tablet (768px - 1024px)
- [ ] **Bước 1**: Resize browser về 1024px width
- [ ] **Kết quả mong đợi**: 
  - Layout vẫn hiển thị tốt
  - Các cột không bị chồng lên nhau
  - Buttons vẫn click được

### 10.2. Mobile (< 768px)
- [ ] **Bước 1**: Resize browser về 375px width (iPhone)
- [ ] **Kết quả mong đợi**: 
  - Layout chuyển sang dạng stack (cột dọc)
  - Buttons đủ lớn để touch
  - Text không bị cắt
  - Modal full screen hoặc responsive

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 11: KEYBOARD SHORTCUTS

### 11.1. Ctrl+F: Mở tìm kiếm nâng cao
- [ ] **Bước 1**: Nhấn `Ctrl+F` ở trang bán hàng
- [ ] **Kết quả mong đợi**: 
  - Mở modal AdvancedProductSearch

### 11.2. Esc: Đóng modal
- [ ] **Bước 1**: Mở một modal bất kỳ
- [ ] **Bước 2**: Nhấn `Esc`
- [ ] **Kết quả mong đợi**: 
  - Modal đóng

### 11.3. Enter: Chọn sản phẩm
- [ ] **Bước 1**: Chọn một product card trong kết quả tìm kiếm
- [ ] **Bước 2**: Nhấn `Enter`
- [ ] **Kết quả mong đợi**: 
  - Mở modal chọn biến thể

### 11.4. D: Xem chi tiết sản phẩm
- [ ] **Bước 1**: Chọn một product card
- [ ] **Bước 2**: Nhấn `D`
- [ ] **Kết quả mong đợi**: 
  - Mở modal ProductDetailModal

### 11.5. E: Sửa số lượng
- [ ] **Bước 1**: Chọn sản phẩm đầu tiên trong hóa đơn
- [ ] **Bước 2**: Nhấn `E`
- [ ] **Kết quả mong đợi**: 
  - Mở modal sửa số lượng

### 11.6. Del: Xóa sản phẩm
- [ ] **Bước 1**: Chọn sản phẩm trong hóa đơn
- [ ] **Bước 2**: Nhấn `Delete`
- [ ] **Kết quả mong đợi**: 
  - Hiển thị confirm dialog
  - Sau khi confirm, xóa sản phẩm

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## ✅ TEST CASE 12: MODAL THANH TOÁN

### 12.1. Preview hóa đơn
- [ ] **Bước 1**: Tạo hóa đơn và click "Thanh toán"
- [ ] **Kết quả mong đợi**: 
  - Modal thanh toán mở
  - Hiển thị preview hóa đơn ở trên
  - Hiển thị đầy đủ sản phẩm, tổng tiền

### 12.2. Quét serial và auto-focus
- [ ] **Bước 1**: Mở modal thanh toán
- [ ] **Bước 2**: Quét serial cho sản phẩm đầu tiên
- [ ] **Kết quả mong đợi**: 
  - Phát âm thanh beep khi quét thành công
  - Tự động focus vào input serial của sản phẩm tiếp theo

### 12.3. Thanh toán tiền mặt
- [ ] **Bước 1**: Chọn phương thức "Tiền mặt"
- [ ] **Bước 2**: Nhập số tiền khách đưa
- [ ] **Kết quả mong đợi**: 
  - Tự động tính tiền thừa
  - Hiển thị số tiền trả lại

### 12.4. Thanh toán thành công
- [ ] **Bước 1**: Quét đủ serial cho tất cả sản phẩm
- [ ] **Bước 2**: Chọn phương thức thanh toán và xác nhận
- [ ] **Kết quả mong đợi**: 
  - Thanh toán thành công
  - Tự động in hóa đơn
  - Xóa hóa đơn khỏi danh sách chờ
  - Hiển thị thông báo thành công

**Trạng thái**: ✅ PASS / ❌ FAIL  
**Ghi chú**: ________________________________

---

## 📊 TỔNG KẾT TEST

**Tổng số test cases**: 12  
**Đã test**: ___ / 12  
**Pass**: ___ / 12  
**Fail**: ___ / 12  
**Tỷ lệ pass**: ___%

**Các lỗi phát hiện**:
1. ________________________________
2. ________________________________
3. ________________________________

**Ghi chú tổng thể**:
________________________________
________________________________
________________________________

---

**Người test**: _______________  
**Ngày hoàn thành**: _______________
