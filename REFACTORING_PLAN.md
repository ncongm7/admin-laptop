# Kế hoạch Refactoring ModalThanhToan.vue

## Mục tiêu
Tách file `ModalThanhToan.vue` (2592 dòng) thành các phần nhỏ hơn để dễ đọc và bảo trì.

## Cấu trúc mới

### 1. Composables (Logic)
- ✅ `composables/banhang/usePaymentForm.js` - Logic form thanh toán
- ⏳ `composables/banhang/useDeliveryForm.js` - Logic form giao hàng  
- ⏳ `composables/banhang/useSerialSelection.js` - Logic chọn serial (tách từ useSerialValidation)

### 2. Components (UI)
- ✅ `components/banhang/InvoicePreview.vue` - UI preview hóa đơn
- ⏳ `components/banhang/PaymentForm.vue` - UI form thanh toán
- ⏳ `components/banhang/DeliveryForm.vue` - UI form giao hàng
- ⏳ `components/banhang/SerialScanningSection.vue` - UI phần quét serial

### 3. File chính
- ⏳ `components/banhang/ModalThanhToan.vue` - Chỉ orchestration, import các component/composable

## Cách sử dụng

### usePaymentForm.js
```javascript
import { usePaymentForm } from '@/composables/banhang/usePaymentForm'

const {
  paymentMethods,
  tienKhachDua,
  isProcessing,
  tongTien,
  isTienMat,
  isQRPayment,
  loadPaymentMethods,
  handlePayment
} = usePaymentForm(hoaDon, formData, emit)
```

### InvoicePreview.vue
```vue
<InvoicePreview :hoaDon="hoaDon" />
```

## Bước tiếp theo

1. Tạo `useDeliveryForm.js` - Tách logic giao hàng (dòng 576-1882)
2. Tạo `PaymentForm.vue` - Tách UI form thanh toán (dòng 108-210)
3. Tạo `DeliveryForm.vue` - Tách UI form giao hàng (dòng 214-289)
4. Tạo `SerialScanningSection.vue` - Tách UI quét serial (dòng 292-483)
5. Refactor `ModalThanhToan.vue` - Chỉ giữ orchestration

## Lợi ích

- ✅ Dễ đọc: Mỗi file < 500 dòng
- ✅ Dễ test: Logic tách riêng, dễ unit test
- ✅ Dễ maintain: Sửa một phần không ảnh hưởng phần khác
- ✅ Tái sử dụng: Component có thể dùng ở nơi khác

