# Composables - Tái sử dụng Logic trong Vue 3

Thư mục này chứa các **Vue Composables** (hay còn gọi là Custom Hooks) để tách logic nghiệp vụ ra khỏi component, giúp code dễ đọc, dễ bảo trì và tái sử dụng.

## 📁 Cấu trúc Composables

### 1. `useBillManagement.js` - Quản lý Hóa đơn
Xử lý tất cả logic liên quan đến hóa đơn:
- ✅ Tạo hóa đơn mới
- ✅ Chọn hóa đơn từ danh sách chờ
- ✅ Xóa hóa đơn chờ
- ✅ Hủy hóa đơn
- ✅ Lưu tạm hóa đơn
- ✅ Load danh sách hóa đơn chờ
- ✅ Cập nhật hóa đơn hiện tại
- ✅ Xóa hóa đơn sau thanh toán

**Exported State:**
- `danhSachHoaDonCho` - Danh sách hóa đơn chờ
- `hoaDonHienTai` - Hóa đơn đang được chọn
- `isLoading` - Trạng thái loading

**Exported Methods:**
- `taoHoaDonMoi()` - Tạo hóa đơn mới
- `chonHoaDon(bill)` - Chọn hóa đơn
- `xoaHoaDonCho(billId)` - Xóa hóa đơn
- `handleCancelBill()` - Hủy hóa đơn
- `handleSaveDraft()` - Lưu tạm
- `loadDanhSachHoaDonCho()` - Load danh sách
- `capNhatHoaDon(updatedBill)` - Cập nhật hóa đơn
- `xoaHoaDonSauThanhToan()` - Xóa sau khi thanh toán

---

### 2. `useProductManagement.js` - Quản lý Sản phẩm
Xử lý logic thêm, xóa sản phẩm và quét mã IMEI:
- ✅ Hiển thị modal nhập số lượng
- ✅ Thêm sản phẩm vào hóa đơn
- ✅ Xóa sản phẩm khỏi hóa đơn
- ✅ Quét mã IMEI/Serial

**Exported State:**
- `isLoading` - Trạng thái loading
- `showQuantityModal` - Hiển thị modal số lượng
- `selectedProduct` - Sản phẩm đang chọn
- `soLuongNhap` - Số lượng nhập
- `quantityInput` - Ref của input số lượng

**Exported Methods:**
- `handleProductSelected(product)` - Xử lý khi chọn sản phẩm
- `confirmAddProduct()` - Xác nhận thêm sản phẩm
- `handleDeleteItem(idHoaDonChiTiet)` - Xóa sản phẩm
- `handleScanImei(imeiCode)` - Quét IMEI
- `closeQuantityModal()` - Đóng modal

**Parameters:**
- `hoaDonHienTai` - Ref của hóa đơn hiện tại
- `capNhatHoaDon` - Function callback để cập nhật hóa đơn

---

### 3. `useCustomerManagement.js` - Quản lý Khách hàng
Xử lý logic tìm kiếm, tạo mới và cập nhật khách hàng:
- ✅ Tìm kiếm khách hàng
- ✅ Tạo khách hàng mới
- ✅ Cập nhật khách hàng cho hóa đơn

**Exported State:**
- `isLoading` - Trạng thái loading

**Exported Methods:**
- `handleUpdateCustomer(customer)` - Cập nhật khách hàng
- `handleSearchCustomer(keyword)` - Tìm kiếm khách hàng
- `handleCreateCustomer()` - Tạo khách hàng mới

**Parameters:**
- `hoaDonHienTai` - Ref của hóa đơn hiện tại
- `capNhatHoaDon` - Function callback để cập nhật hóa đơn

---

### 4. `usePayment.js` - Quản lý Thanh toán
Xử lý logic thanh toán và modal thanh toán:
- ✅ Mở modal thanh toán
- ✅ Xác nhận thanh toán
- ✅ Đóng modal thanh toán

**Exported State:**
- `isLoading` - Trạng thái loading
- `showPaymentModal` - Hiển thị modal thanh toán

**Exported Methods:**
- `openPaymentModal()` - Mở modal thanh toán
- `handlePaymentConfirmed(paymentData)` - Xử lý thanh toán
- `closePaymentModal()` - Đóng modal

**Parameters:**
- `hoaDonHienTai` - Ref của hóa đơn hiện tại
- `xoaHoaDonSauThanhToan` - Function callback để xóa hóa đơn sau thanh toán

---

### 5. `useVoucherPoints.js` - Quản lý Voucher & Điểm tích lũy
Xử lý logic áp dụng voucher và sử dụng điểm tích lũy:
- ✅ Áp dụng voucher/phiếu giảm giá
- ✅ Sử dụng điểm tích lũy

**Exported State:**
- `isLoading` - Trạng thái loading

**Exported Methods:**
- `handleApplyVoucher(voucherCode)` - Áp dụng voucher
- `handleUsePoints(points)` - Sử dụng điểm tích lũy

**Parameters:**
- `hoaDonHienTai` - Ref của hóa đơn hiện tại
- `capNhatHoaDon` - Function callback để cập nhật hóa đơn

---

## 🚀 Cách sử dụng Composables

### Ví dụ trong `SalesView.vue`:

```vue
<script setup>
import { useBillManagement } from '@/composables/useBillManagement'
import { useProductManagement } from '@/composables/useProductManagement'

// 1. Sử dụng Bill Management
const {
    danhSachHoaDonCho,
    hoaDonHienTai,
    taoHoaDonMoi,
    capNhatHoaDon
} = useBillManagement()

// 2. Sử dụng Product Management (cần truyền params)
const {
    handleProductSelected,
    confirmAddProduct,
    handleDeleteItem
} = useProductManagement(hoaDonHienTai, capNhatHoaDon)
</script>
```

---

## 📊 So sánh: Trước và Sau khi Refactor

### ❌ Trước khi refactor (SalesView.vue - 703 dòng):
- 😰 Logic phức tạp, khó đọc
- 😵 Tất cả code nằm chung trong 1 file
- 😞 Khó bảo trì khi có thay đổi
- 😓 Không tái sử dụng được logic

### ✅ Sau khi refactor:
- ✨ `SalesView.vue`: **~230 dòng** (chỉ chứa UI và kết nối composables)
- 📦 Logic tách thành 5 composables, dễ đọc và bảo trì
- 🔄 Có thể tái sử dụng composables ở component khác
- 🎯 Mỗi composable đảm nhận 1 nhiệm vụ cụ thể (Single Responsibility Principle)
- 🧪 Dễ dàng test từng composable riêng lẻ

---

## 🎓 Lợi ích của Composables

1. **Tái sử dụng logic** - Logic có thể dùng ở nhiều component
2. **Dễ đọc & bảo trì** - Code ngắn gọn, rõ ràng
3. **Dễ test** - Test từng composable riêng lẻ
4. **Phân tách trách nhiệm** - Mỗi composable lo 1 việc
5. **Type-safe** - Kết hợp TypeScript dễ dàng hơn

---

## 📚 Tài liệu tham khảo

- [Vue 3 Composables Official Docs](https://vuejs.org/guide/reusability/composables.html)
- [VueUse - Collection of Composables](https://vueuse.org/)

---

## 🔧 Lưu ý khi tạo Composable mới

1. **Đặt tên theo quy ước**: `use + TênChứcNăng` (ví dụ: `useAuth`, `useCart`)
2. **Export reactive state và methods** để component sử dụng
3. **Truyền dependencies qua parameters** thay vì import trực tiếp
4. **Tránh side effects** không cần thiết
5. **Document đầy đủ** để người khác dễ hiểu

---

**Tác giả:** Admin Laptop Team  
**Ngày cập nhật:** 29/10/2025

