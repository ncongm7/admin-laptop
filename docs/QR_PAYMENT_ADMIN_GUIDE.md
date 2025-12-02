# QR Payment - Hướng Dẫn Sử Dụng (Admin Frontend)

## 📋 Tổng Quan

Hệ thống thanh toán QR đã được tích hợp vào Admin Frontend với các tính năng:

- ✅ Thanh toán QR tại quầy (POS)
- ✅ Quản lý đơn hàng với badge QR payment
- ✅ WebSocket real-time payment notification
- ✅ Refund service (hủy đơn có hoàn tiền)

---

## 🎯 Các File Đã Tạo/Cập Nhật

### **Files Mới Tạo:**

1. **`src/service/banhang/paymentService.js`**

   - Service xử lý API thanh toán QR
   - Methods: `generateQRPayment()`, `checkPaymentStatus()`, `cancelOrderWithRefund()`, `getRefundHistory()`

2. **`src/service/banhang/refundService.js`**

   - Service xử lý hoàn tiền
   - Methods: `cancelOrderWithRefund()`, `getRefundHistory()`, `canRefund()`

3. **`src/composables/useQRPaymentPOS.js`**

   - Composable xử lý logic QR payment cho POS
   - Tính năng:
     - Generate QR code
     - WebSocket listener để nhận payment notification
     - Auto-fill mã giao dịch khi thanh toán thành công
   - State: `qrCodeData`, `loading`, `error`, `status`, `showQRModal`, `transactionId`
   - Methods: `generateQR()`, `closeQRModal()`, `handleExpired()`, `reset()`

4. **`src/components/banhang/QRPaymentModal.vue`**
   - Modal hiển thị QR code cho khách hàng quét
   - Tính năng:
     - Hiển thị QR code image từ VietQR API
     - Countdown timer (15 phút)
     - Bank info với copy-to-clipboard
     - Status indicators (pending/checking/confirmed/expired)
     - Auto-close khi payment confirmed
   - Props: `show`, `qrData`, `loading`, `error`, `status`, `transactionId`
   - Emits: `close`, `retry`, `expired`

### **Files Đã Cập Nhật:**

5. **`src/components/banhang/ModalThanhToan.vue`**

   - Thêm import: `useQRPaymentPOS`, `QRPaymentModal`
   - Thêm computed: `isQRPayment` (kiểm tra phương thức thanh toán QR)
   - Tích hợp `useQRPaymentPOS` composable với callback `onPaymentConfirmed`
   - Template:
     - Thêm nút "Hiện QR" trong phần Mã giao dịch
     - Hiển thị alert thành công khi payment confirmed
     - Thêm `<QRPaymentModal>` component
   - Auto-fill `maGiaoDich` khi nhận payment notification

6. **`src/views/QuanLiHoaDon.vue`**
   - Thêm function: `isQRPayment(hoaDon)` helper
   - Template: Thêm 2 badges QR payment:
     - ✅ Badge "QR" màu xanh lá khi `trangThaiThanhToan === 1`
     - ⏳ Badge "Chờ QR" màu vàng khi `trangThaiThanhToan === 0`
   - Badge hiển thị khi phương thức thanh toán chứa "QR"

---

## 🔧 Cấu Hình Backend (Đã Có Sẵn)

Backend đã được config với VietQR API trong `application.properties`:

```properties
# VietQR Configuration
vietqr.bank.bin=970415
vietqr.bank.accountNo=0866668888
vietqr.bank.accountName=CONG TY TNHH VIETLAPTOP
vietqr.bank.template=compact2
vietqr.api.url=https://img.vietqr.io/image
vietqr.payment.timeout=900
```

**WebSocket Endpoint:** `ws://localhost:8080/ws`

**Payment Topics:**

- `/topic/payment-confirmed` - Global payment notifications
- `/topic/payment-confirmed/{orderId}` - Order-specific notifications

---

## 🚀 Sử Dụng Tại Quầy (POS)

### **Luồng Thanh Toán QR:**

1. **Tạo hóa đơn bình thường** tại màn hình bán hàng
2. **Quét đủ serial** cho các sản phẩm
3. **Mở modal thanh toán** (nút "Thanh toán")
4. **Chọn phương thức:** "Chuyển khoản QR"
5. **Nhấn nút "Hiện QR":**
   - Modal QR payment hiển thị với QR code
   - Timer đếm ngược 15 phút
   - Bank info: VietinBank - 0866668888
6. **Khách hàng quét QR** bằng app ngân hàng
7. **Hệ thống tự động nhận thanh toán:**
   - WebSocket gửi notification
   - Mã giao dịch tự động điền vào field
   - Toast thông báo "✅ Đã nhận thanh toán QR!"
   - Modal QR tự động đóng sau 2 giây
8. **Nhấn "Xác nhận thanh toán"** để hoàn tất

### **Các Trạng Thái QR Payment:**

| Status      | Màu        | Ý nghĩa                   |
| ----------- | ---------- | ------------------------- |
| `pending`   | -          | Chưa tạo QR               |
| `checking`  | Xanh dương | Đang chờ khách thanh toán |
| `confirmed` | Xanh lá    | Đã nhận thanh toán        |
| `expired`   | Đỏ         | QR đã hết hạn (15 phút)   |

### **Xử Lý Lỗi:**

- **QR hết hạn:** Nhấn "Tạo lại QR Code"
- **Mất kết nối WebSocket:** QR vẫn hoạt động, hệ thống tự reconnect
- **Không tạo được QR:** Kiểm tra backend đang chạy, log error trong console

---

## 📊 Quản Lý Đơn Hàng

### **Badge Hiển Thị:**

Tại màn hình **Quản lý đơn hàng** (`/quan-li-hoa-don`):

1. **Badge "QR" (xanh lá):**

   - Hiển thị khi: `phuongThucThanhToan` chứa "QR" VÀ `trangThaiThanhToan === 1`
   - Tooltip: "Đã thanh toán bằng QR Code"

2. **Badge "Chờ QR" (vàng):**
   - Hiển thị khi: `phuongThucThanhToan` chứa "QR" VÀ `trangThaiThanhToan === 0`
   - Tooltip: "Chờ khách thanh toán QR"

### **Chi Tiết Đơn Hàng:**

Khi mở modal chi tiết hóa đơn:

- Hiển thị mã giao dịch QR (nếu có)
- Hiển thị trạng thái thanh toán
- Nút "Hủy & Hoàn tiền" (chỉ hiện khi đơn đã thanh toán QR)

---

## 💰 Hoàn Tiền (Refund)

### **Service: `refundService.js`**

```javascript
import refundService from '@/service/banhang/refundService'

// Hủy đơn và hoàn tiền
await refundService.cancelOrderWithRefund(hoaDonId, {
  lyDoHuy: 'Khách yêu cầu hủy',
  soTienHoan: 15000000,
})

// Kiểm tra đơn có thể hoàn tiền không
const canRefund = refundService.canRefund(hoaDon)
```

### **Điều Kiện Hoàn Tiền:**

Đơn hàng **CÓ THỂ** hoàn tiền khi:

1. ✅ Đã thanh toán QR (`trangThaiThanhToan === 1`)
2. ✅ Phương thức thanh toán chứa "QR"
3. ✅ Trạng thái đơn: `CHO_THANH_TOAN` (0) hoặc `DANG_GIAO` (3)

Đơn hàng **KHÔNG THỂ** hoàn tiền khi:

- ❌ Đã hoàn thành (`HOAN_THANH`)
- ❌ Đã hủy (`DA_HUY`)
- ❌ Chưa thanh toán (`trangThaiThanhToan === 0`)
- ❌ Thanh toán bằng tiền mặt/chuyển khoản thường

### **Backend Logic (Đã Implement):**

Khi hủy đơn có hoàn tiền:

1. Kiểm tra trạng thái hợp lệ
2. Cập nhật `trangThai = DA_HUY`
3. Thêm note hoàn tiền vào `ghiChu`
4. Hoàn lại tồn kho (nếu `DANG_GIAO`)
5. Gửi WebSocket notification

---

## 🧪 Testing

### **Test Case 1: Thanh Toán QR Tại Quầy**

1. Tạo hóa đơn mới
2. Thêm sản phẩm vào giỏ
3. Quét đủ serial
4. Chọn "Chuyển khoản QR"
5. Nhấn "Hiện QR"
6. **Kiểm tra:**
   - ✅ Modal QR hiển thị
   - ✅ QR code load thành công
   - ✅ Timer đếm ngược
   - ✅ Bank info hiển thị đúng

### **Test Case 2: WebSocket Payment Notification**

1. Mở modal QR payment
2. Sử dụng `test-vietqr-payment.http` để gửi webhook mock
3. **Kiểm tra:**
   - ✅ Toast "Đã nhận thanh toán QR!" hiển thị
   - ✅ Mã giao dịch tự động điền
   - ✅ Modal QR tự động đóng
   - ✅ Console log WebSocket message

### **Test Case 3: QR Expired**

1. Mở modal QR payment
2. Đợi 15 phút (hoặc modify timeout trong backend)
3. **Kiểm tra:**
   - ✅ Timer về 0:00
   - ✅ Alert "Mã QR đã hết hạn"
   - ✅ Nút "Tạo lại QR Code" hiển thị

### **Test Case 4: Badge Hiển Thị**

1. Tạo đơn hàng với QR payment
2. Thanh toán thành công
3. Vào màn hình Quản lý đơn hàng
4. **Kiểm tra:**
   - ✅ Badge "QR" màu xanh lá hiển thị
   - ✅ Tooltip đúng

### **Test Case 5: Refund**

1. Tạo đơn QR payment đã thanh toán
2. Hủy đơn với lý do
3. **Kiểm tra:**
   - ✅ Trạng thái = DA_HUY
   - ✅ Ghi chú hoàn tiền trong `ghiChu`
   - ✅ Tồn kho được hoàn lại (nếu DANG_GIAO)

---

## 🐛 Troubleshooting

### **Vấn đề 1: Không hiển thị nút "Hiện QR"**

**Nguyên nhân:**

- Phương thức thanh toán không chứa từ khóa "QR"
- Database chưa có phương thức "Chuyển khoản QR"

**Giải pháp:**

```sql
-- Chạy trong database
INSERT INTO phuong_thuc_thanh_toan (ten_phuong_thuc, mo_ta)
VALUES ('Chuyển khoản QR', 'QR Payment');
```

### **Vấn đề 2: WebSocket không kết nối**

**Nguyên nhân:**

- Backend không chạy
- CORS/WebSocket config sai

**Giải pháp:**

- Kiểm tra backend running: `http://localhost:8080/ws`
- Check console log: `[WebSocket] Connected`
- Verify WebSocketConfig trong backend

### **Vấn đề 3: QR code không hiển thị**

**Nguyên nhân:**

- VietQR API không trả về image
- Network blocked

**Giải pháp:**

- Kiểm tra URL trong console
- Test URL trực tiếp: `https://img.vietqr.io/image/970415-0866668888-compact2.png`
- Kiểm tra `qrCodeData.qrCodeUrl` có giá trị

### **Vấn đề 4: Mã giao dịch không tự động điền**

**Nguyên nhân:**

- WebSocket callback không chạy
- `formData.maGiaoDich` không được bind

**Giải pháp:**

- Check console log: `✅ [ModalThanhToan] QR Payment confirmed`
- Verify `onPaymentConfirmed` callback trong `useQRPaymentPOS`
- Kiểm tra v-model trong template

---

## 📚 API Reference

### **Payment Service**

```javascript
import {
  generateQRPayment,
  checkPaymentStatus,
  cancelOrderWithRefund,
} from '@/service/banhang/paymentService'

// Generate QR
const response = await generateQRPayment({
  hoaDonId: 'uuid',
  amount: 15000000,
  orderCode: 'HD001',
  description: 'Thanh toan hoa don HD001',
})

// Check status
const status = await checkPaymentStatus('uuid')

// Cancel with refund
await cancelOrderWithRefund('uuid', {
  lyDoHuy: 'Khách yêu cầu',
  soTienHoan: 15000000,
})
```

### **Refund Service**

```javascript
import refundService from '@/service/banhang/refundService'

// Check if can refund
if (refundService.canRefund(hoaDon)) {
  // Show refund button
}

// Get refund history
const history = await refundService.getRefundHistory('uuid')
```

### **useQRPaymentPOS Composable**

```javascript
import { useQRPaymentPOS } from '@/composables/useQRPaymentPOS'

const hoaDon = ref({ id: 'uuid', tongTien: 15000000 })

const {
  qrCodeData,
  loading,
  error,
  status,
  showQRModal,
  transactionId,
  generateQR,
  closeQRModal,
  handleExpired,
} = useQRPaymentPOS({
  hoaDon,
  onPaymentConfirmed: (paymentData) => {
    console.log('Payment confirmed:', paymentData)
  },
})

// Trigger generate QR
await generateQR()
```

---

## 🎨 UI Components

### **QRPaymentModal Props**

| Prop            | Type    | Default     | Description           |
| --------------- | ------- | ----------- | --------------------- |
| `show`          | Boolean | `false`     | Hiển thị/ẩn modal     |
| `qrData`        | Object  | `null`      | Dữ liệu QR từ API     |
| `loading`       | Boolean | `false`     | Trạng thái loading    |
| `error`         | String  | `''`        | Thông báo lỗi         |
| `status`        | String  | `'pending'` | Trạng thái thanh toán |
| `transactionId` | String  | `''`        | Mã giao dịch          |

### **QRPaymentModal Events**

| Event     | Payload | Description        |
| --------- | ------- | ------------------ |
| `close`   | -       | Khi đóng modal     |
| `retry`   | -       | Khi nhấn "Thử lại" |
| `expired` | -       | Khi QR hết hạn     |

---

## ✅ Checklist Hoàn Thành

- [x] Tạo `paymentService.js` với đầy đủ API calls
- [x] Tạo `refundService.js` với logic hoàn tiền
- [x] Tạo `useQRPaymentPOS.js` composable
- [x] Tạo `QRPaymentModal.vue` component
- [x] Update `ModalThanhToan.vue` với QR integration
- [x] Update `QuanLiHoaDon.vue` với QR badges
- [x] WebSocket integration với auto-fill mã GD
- [x] Timer countdown 15 phút
- [x] Error handling và retry logic
- [x] Responsive UI cho mobile

---

## 🔜 Tính Năng Mở Rộng (Tùy Chọn)

1. **Auto-refresh danh sách đơn hàng** khi nhận WebSocket
2. **Lịch sử hoàn tiền** trong modal chi tiết
3. **Export QR code** ra file PNG/PDF
4. **Multi-QR support** (nhiều ngân hàng)
5. **QR payment statistics** dashboard
6. **Email notification** khi thanh toán thành công
7. **SMS notification** cho khách hàng

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:

1. Backend logs: Check `PaymentController`, `VietQRService`
2. Frontend console: Check WebSocket connection, API calls
3. Network tab: Check VietQR API response
4. Database: Verify phương thức thanh toán exists

**Test Files:**

- Backend: `test-vietqr-payment.http`
- Database: `data-real.sql` (line 706)
