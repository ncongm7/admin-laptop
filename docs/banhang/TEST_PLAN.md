# Kế Hoạch Kiểm Thử - Module Bán Hàng

## Tổng quan

Dự án hiện tại **chưa có test framework** được cấu hình. Tài liệu này cung cấp:
1. Đề xuất test framework phù hợp
2. Danh sách test case nên tạo (nếu có framework)
3. Kịch bản kiểm thử thủ công (end-to-end)

---

## 1. Đề xuất Test Framework

### Option 1: Vitest (Khuyến nghị)

**Lý do**:
- Tương thích tốt với Vite
- Hỗ trợ Vue 3 Composition API
- Fast và dễ cấu hình
- Có thể test component, composable, service

**Cài đặt**:
```bash
npm install -D vitest @vue/test-utils @vitest/ui jsdom
```

**Cấu hình** (`vitest.config.js`):
```js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8'
    }
  }
})
```

### Option 2: Jest + Vue Test Utils

**Lý do**:
- Phổ biến, nhiều tài liệu
- Hỗ trợ tốt Vue 3

**Cài đặt**:
```bash
npm install -D jest @vue/test-utils @babel/preset-env
```

### Option 3: Cypress (E2E)

**Lý do**:
- Test end-to-end tốt
- Có thể test flow thực tế

**Cài đặt**:
```bash
npm install -D cypress
```

---

## 2. Danh sách Test Case (Nếu có Framework)

### 2.1. Unit Tests - Composables

#### `useBillManagement.test.js`

```javascript
describe('useBillManagement', () => {
  test('taoHoaDonMoi - tạo hóa đơn mới thành công', async () => {
    // Test case
  })
  
  test('taoHoaDonMoi - giới hạn 10 hóa đơn', async () => {
    // Test case
  })
  
  test('chonHoaDon - chọn hóa đơn từ danh sách', async () => {
    // Test case
  })
  
  test('xoaHoaDonCho - xóa hóa đơn chờ', async () => {
    // Test case
  })
  
  test('copyBill - copy hóa đơn', async () => {
    // Test case
  })
})
```

#### `useProductManagement.test.js`

```javascript
describe('useProductManagement', () => {
  test('confirmAddProduct - thêm sản phẩm thành công', async () => {
    // Test case
  })
  
  test('confirmAddProduct - số lượng vượt tồn kho', async () => {
    // Test case
  })
  
  test('handleDeleteItem - xóa sản phẩm', async () => {
    // Test case
  })
})
```

#### `useSerialValidation.test.js`

```javascript
describe('useSerialValidation', () => {
  test('xacThucMotSerial - serial hợp lệ', async () => {
    // Test case
  })
  
  test('xacThucMotSerial - serial không hợp lệ', async () => {
    // Test case
  })
  
  test('daQuetDu - kiểm tra đã quét đủ serial', () => {
    // Test case
  })
})
```

### 2.2. Component Tests

#### `ProductSearch.test.js`

```javascript
describe('ProductSearch', () => {
  test('tìm kiếm sản phẩm', async () => {
    // Test case
  })
  
  test('pagination hoạt động đúng', async () => {
    // Test case
  })
  
  test('quét mã vạch tự động thêm sản phẩm', async () => {
    // Test case
  })
  
  test('keyboard shortcuts hoạt động', async () => {
    // Test case
  })
})
```

#### `InvoiceDetails.test.js`

```javascript
describe('InvoiceDetails', () => {
  test('hiển thị danh sách sản phẩm', () => {
    // Test case
  })
  
  test('sửa số lượng sản phẩm', async () => {
    // Test case
  })
  
  test('xóa sản phẩm', async () => {
    // Test case
  })
  
  test('hiển thị serial đã quét', () => {
    // Test case
  })
})
```

#### `ModalThanhToan.test.js`

```javascript
describe('ModalThanhToan', () => {
  test('quét serial thành công', async () => {
    // Test case
  })
  
  test('không thể thanh toán nếu chưa quét đủ serial', async () => {
    // Test case
  })
  
  test('tính tiền thừa/thiếu đúng', () => {
    // Test case
  })
})
```

### 2.3. Integration Tests

#### `SalesFlow.test.js`

```javascript
describe('Sales Flow Integration', () => {
  test('Flow hoàn chỉnh: Tạo đơn → Thêm SP → Thanh toán', async () => {
    // Test case
  })
  
  test('Flow với voucher: Tạo đơn → Áp voucher → Thanh toán', async () => {
    // Test case
  })
})
```

### 2.4. Utility Tests

#### `validation.test.js`

```javascript
describe('validation utilities', () => {
  test('sanitizeInput - loại bỏ script tags', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('')
  })
  
  test('validatePhoneNumber - số điện thoại hợp lệ', () => {
    expect(validatePhoneNumber('0912345678')).toBe(true)
  })
  
  test('validateQuantity - số lượng hợp lệ', () => {
    expect(validateQuantity(5)).toBe(true)
    expect(validateQuantity(0)).toBe(false)
  })
})
```

---

## 3. Kịch Bản Kiểm Thử Thủ Công (E2E)

### Kịch bản 1: Tạo hóa đơn và thanh toán cơ bản

**Mục tiêu**: Kiểm tra flow bán hàng cơ bản

**Bước thực hiện**:

1. ✅ **Đăng nhập vào hệ thống**
   - **Pass**: Hiển thị màn hình bán hàng
   - **Fail**: Không đăng nhập được

2. ✅ **Tạo hóa đơn mới**
   - Click "Tạo Đơn Mới"
   - **Pass**: Hóa đơn mới xuất hiện trong danh sách chờ, tổng tiền = 0
   - **Fail**: Không tạo được hóa đơn

3. ✅ **Tìm kiếm sản phẩm**
   - Nhập tên sản phẩm vào ô tìm kiếm
   - **Pass**: Hiển thị danh sách sản phẩm phù hợp
   - **Fail**: Không có kết quả hoặc lỗi

4. ✅ **Thêm sản phẩm vào hóa đơn**
   - Chọn sản phẩm, chọn biến thể, nhập số lượng = 1
   - Click "Xác nhận"
   - **Pass**: Sản phẩm xuất hiện trong chi tiết hóa đơn, tổng tiền cập nhật
   - **Fail**: Không thêm được hoặc lỗi

5. ✅ **Thêm khách hàng**
   - Nhập SĐT khách hàng
   - Chọn khách hàng từ kết quả
   - **Pass**: Thông tin khách hàng hiển thị, điểm tích lũy hiển thị
   - **Fail**: Không tìm thấy hoặc không gán được

6. ✅ **Thanh toán**
   - Click "THANH TOÁN"
   - Chọn phương thức thanh toán "Tiền mặt"
   - **Quét Serial** cho sản phẩm (bắt buộc)
   - Nhập số tiền khách đưa
   - Click "Xác nhận thanh toán"
   - **Pass**: Thanh toán thành công, hóa đơn biến mất khỏi danh sách chờ
   - **Fail**: Lỗi thanh toán hoặc không quét được serial

7. ✅ **In hóa đơn**
   - Trong "Lịch sử giao dịch", tìm hóa đơn vừa thanh toán
   - Click "In lại hóa đơn"
   - **Pass**: Mở hộp thoại in hoặc tải PDF
   - **Fail**: Không in được

**Kết quả mong đợi**: ✅ Tất cả bước pass

---

### Kịch bản 2: Quét mã vạch tự động

**Mục tiêu**: Kiểm tra tính năng quét mã vạch/QR

**Bước thực hiện**:

1. ✅ **Bật quét mã vạch**
   - Click nút quét mã (biểu tượng camera)
   - **Pass**: Camera mở, hiển thị khung quét
   - **Fail**: Không mở được camera

2. ✅ **Quét mã vạch sản phẩm**
   - Đưa mã vạch vào khung camera
   - **Pass**: Tự động tìm sản phẩm và thêm vào hóa đơn, phát âm thanh
   - **Fail**: Không nhận diện được hoặc không tìm thấy sản phẩm

3. ✅ **Quét nhiều sản phẩm liên tiếp**
   - Quét 3 sản phẩm khác nhau
   - **Pass**: Tất cả 3 sản phẩm được thêm vào hóa đơn
   - **Fail**: Thiếu sản phẩm hoặc lỗi

**Kết quả mong đợi**: ✅ Tất cả bước pass

---

### Kịch bản 3: Áp dụng voucher và điểm tích lũy

**Mục tiêu**: Kiểm tra tính năng voucher và điểm

**Bước thực hiện**:

1. ✅ **Tạo hóa đơn với sản phẩm**
   - Tạo đơn, thêm sản phẩm có tổng tiền >= 1,000,000 VND
   - **Pass**: Tổng tiền hiển thị đúng

2. ✅ **Áp dụng voucher**
   - Click "Chọn Khuyến Mãi"
   - Chọn voucher giảm 10%
   - **Pass**: Voucher được áp dụng, tổng tiền giảm đúng
   - **Fail**: Không áp dụng được hoặc tính sai

3. ✅ **Sử dụng điểm tích lũy**
   - Tích checkbox "Dùng điểm tích lũy"
   - **Pass**: Điểm được quy đổi thành tiền, tổng tiền giảm
   - **Fail**: Không sử dụng được điểm

4. ✅ **Xóa voucher**
   - Click nút "X" bên cạnh voucher
   - **Pass**: Voucher bị xóa, tổng tiền tăng lại
   - **Fail**: Không xóa được

**Kết quả mong đợi**: ✅ Tất cả bước pass

---

### Kịch bản 4: Sửa số lượng và xóa sản phẩm

**Mục tiêu**: Kiểm tra tính năng chỉnh sửa hóa đơn

**Bước thực hiện**:

1. ✅ **Thêm sản phẩm vào hóa đơn**
   - Thêm sản phẩm với số lượng = 1

2. ✅ **Sửa số lượng**
   - Click nút "Sửa" (bút chì)
   - Nhập số lượng mới = 3
   - Click "Lưu thay đổi"
   - **Pass**: Số lượng cập nhật, thành tiền cập nhật đúng
   - **Fail**: Không sửa được hoặc tính sai

3. ✅ **Sửa số lượng vượt tồn kho**
   - Sửa số lượng = 999 (vượt tồn kho)
   - **Pass**: Hiển thị lỗi, không cho sửa
   - **Fail**: Cho phép sửa

4. ✅ **Xóa sản phẩm**
   - Click nút "Xóa" (thùng rác)
   - Xác nhận xóa
   - **Pass**: Sản phẩm biến mất, tổng tiền cập nhật
   - **Fail**: Không xóa được

**Kết quả mong đợi**: ✅ Tất cả bước pass

---

### Kịch bản 5: Giới hạn 10 hóa đơn chờ

**Mục tiêu**: Kiểm tra giới hạn số lượng hóa đơn

**Bước thực hiện**:

1. ✅ **Tạo 10 hóa đơn chờ**
   - Tạo liên tiếp 10 hóa đơn mới
   - **Pass**: Tất cả 10 hóa đơn xuất hiện trong danh sách

2. ✅ **Thử tạo hóa đơn thứ 11**
   - Click "Tạo Đơn Mới"
   - **Pass**: Hiển thị thông báo "Đã đạt giới hạn", nút bị disable
   - **Fail**: Cho phép tạo thêm

3. ✅ **Thanh toán 1 hóa đơn**
   - Thanh toán 1 trong 10 hóa đơn
   - **Pass**: Hóa đơn biến mất, còn 9 hóa đơn

4. ✅ **Tạo hóa đơn mới sau khi thanh toán**
   - Click "Tạo Đơn Mới"
   - **Pass**: Tạo được hóa đơn mới (tổng = 10 hóa đơn)
   - **Fail**: Vẫn không cho tạo

**Kết quả mong đợi**: ✅ Tất cả bước pass

---

### Kịch bản 6: Responsive Design

**Mục tiêu**: Kiểm tra giao diện trên các thiết bị khác nhau

**Bước thực hiện**:

1. ✅ **Desktop (1920x1080)**
   - Mở màn hình bán hàng
   - **Pass**: Layout 3 cột hiển thị đầy đủ, không bị cắt

2. ✅ **Tablet (768x1024)**
   - Resize browser về tablet size
   - **Pass**: Layout chuyển sang 1 cột, các nút đủ lớn để chạm

3. ✅ **Mobile (375x667)**
   - Resize browser về mobile size
   - **Pass**: Layout responsive, input fields đủ lớn (44px), không bị zoom khi focus

**Kết quả mong đợi**: ✅ Tất cả bước pass

---

### Kịch bản 7: Validation và Bảo mật

**Mục tiêu**: Kiểm tra validation input và bảo mật

**Bước thực hiện**:

1. ✅ **Nhập script tag vào tìm kiếm**
   - Nhập `<script>alert(1)</script>` vào ô tìm kiếm
   - **Pass**: Script tag bị loại bỏ, không thực thi
   - **Fail**: Script thực thi

2. ✅ **Nhập số lượng không hợp lệ**
   - Nhập số lượng = -1 hoặc 0
   - **Pass**: Hiển thị lỗi, không cho thêm
   - **Fail**: Cho phép thêm

3. ✅ **Nhập serial không hợp lệ**
   - Nhập serial = "ABC" (quá ngắn)
   - **Pass**: Hiển thị lỗi "Serial không hợp lệ"
   - **Fail**: Chấp nhận serial không hợp lệ

4. ✅ **Spam API (debounce)**
   - Gõ liên tục vào ô tìm kiếm (10 lần/giây)
   - **Pass**: API chỉ được gọi sau khi dừng gõ 300ms
   - **Fail**: API được gọi mỗi lần gõ

**Kết quả mong đợi**: ✅ Tất cả bước pass

---

### Kịch bản 8: Giảm giá đặc biệt (Quản lý)

**Mục tiêu**: Kiểm tra tính năng giảm giá đặc biệt

**Bước thực hiện**:

1. ✅ **Đăng nhập với quyền quản lý**
   - Đăng nhập với role MANAGER/ADMIN
   - **Pass**: Có thể thấy nút "Giảm giá đặc biệt"

2. ✅ **Đăng nhập với quyền nhân viên**
   - Đăng nhập với role NHAN_VIEN
   - **Pass**: Không thấy nút hoặc bị disable

3. ✅ **Áp dụng giảm giá theo sản phẩm**
   - Chọn sản phẩm, nhập giá trị giảm = 100,000 VND
   - Nhập lý do: "Khách hàng VIP"
   - Click "Xác nhận giảm giá"
   - **Pass**: Giá sản phẩm giảm, tổng tiền cập nhật
   - **Fail**: Không áp dụng được

4. ✅ **Áp dụng giảm giá vượt giới hạn**
   - Nhập giá trị giảm = 1,000,000 VND (vượt 50% giá sản phẩm)
   - **Pass**: Hiển thị lỗi, không cho áp dụng
   - **Fail**: Cho phép áp dụng

**Kết quả mong đợi**: ✅ Tất cả bước pass

---

## 4. Checklist Kiểm Thử

### Functional Testing

- [ ] Tạo hóa đơn mới
- [ ] Thêm sản phẩm vào hóa đơn
- [ ] Sửa số lượng sản phẩm
- [ ] Xóa sản phẩm
- [ ] Tìm kiếm sản phẩm
- [ ] Quét mã vạch/QR
- [ ] Tìm kiếm nâng cao
- [ ] Quản lý khách hàng
- [ ] Áp dụng voucher
- [ ] Sử dụng điểm tích lũy
- [ ] Thanh toán
- [ ] Quét Serial/IMEI
- [ ] In hóa đơn
- [ ] Copy hóa đơn
- [ ] Lưu draft
- [ ] Giảm giá đặc biệt

### UI/UX Testing

- [ ] Pagination hoạt động
- [ ] Lazy load ảnh
- [ ] Badges hiển thị đúng
- [ ] Keyboard shortcuts
- [ ] Tooltip hiển thị
- [ ] Animation mượt mà
- [ ] Responsive design (Desktop/Tablet/Mobile)

### Security Testing

- [ ] Input sanitization
- [ ] XSS protection
- [ ] Permission check
- [ ] API spam prevention

### Performance Testing

- [ ] Debounce search
- [ ] Pagination giới hạn số bản ghi
- [ ] Lazy load ảnh
- [ ] Auto-save draft không lag

---

## 5. Kết luận

### Nếu có test framework:

- **Unit tests**: ~30 test cases
- **Component tests**: ~20 test cases
- **Integration tests**: ~10 test cases
- **Coverage target**: 80%+

### Nếu không có test framework:

- **Manual testing**: 8 kịch bản E2E
- **Checklist**: 30+ mục cần kiểm tra
- **Thời gian ước tính**: 4-6 giờ cho 1 lần test đầy đủ

---

**Cập nhật lần cuối**: 2024-12-01

