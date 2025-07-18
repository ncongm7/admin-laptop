# Hệ Thống Bán Hàng - Cấu Trúc Và Logic

## 📋 Tổng Quan

Hệ thống bán hàng được thiết kế theo mô hình **Store Pattern** với Vue 3 Composition API và Pinia để quản lý state. Hệ thống được chia thành các module rõ ràng, dễ bảo trì và mở rộng.

## 🏗️ Cấu Trúc Thư Mục

```
src/
├── stores/
│   ├── salesStore.js          # Store chính cho bán hàng
│   ├── productStore.js        # Quản lý sản phẩm
│   ├── customerStore.js       # Quản lý khách hàng
│   └── discountStore.js       # Quản lý giảm giá/voucher
├── components/sales/
│   ├── SalesLogic.vue         # Component hiển thị logic bán hàng
│   ├── ProductList.vue        # Danh sách sản phẩm
│   ├── CartSidebar.vue        # Giỏ hàng
│   ├── CustomerInfo.vue       # Thông tin khách hàng
│   ├── BillInfo.vue           # Thông tin hóa đơn
│   ├── PaymentSection.vue     # Thanh toán
│   └── ScanImeiModal.vue      # Quét IMEI
└── views/
    └── SalesView.vue          # Trang bán hàng chính
```

## 🔄 Quy Trình Bán Hàng

### 1. **Chọn Sản Phẩm** (Step 1)
- Tìm kiếm sản phẩm theo tên, mã, IMEI
- Hiển thị danh sách sản phẩm có tồn kho
- Thêm sản phẩm vào giỏ hàng với số lượng
- Quét IMEI để tìm sản phẩm cụ thể

### 2. **Thông Tin Khách Hàng** (Step 2)
- Tìm kiếm khách hàng theo số điện thoại, tên
- Tạo khách hàng mới nếu chưa có
- Lưu thông tin khách hàng vào hóa đơn

### 3. **Áp Dụng Giảm Giá** (Step 3)
- Nhập mã voucher
- Kiểm tra tính hợp lệ của voucher
- Tính toán giảm giá (phần trăm hoặc số tiền cố định)
- Hiển thị thông tin giảm giá

### 4. **Thanh Toán** (Step 4)
- Chọn phương thức thanh toán
- Nhập thông tin thanh toán
- Hoàn tất giao dịch
- In hóa đơn

## 📊 Sales Store - Trung Tâm Quản Lý

### State Management
```javascript
const currentBill = ref({
  id: null,
  customer: null,
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  voucher: null,
  paymentMethod: 'CASH',
  status: 'PENDING'
})
```

### Computed Properties
- `cartItems`: Danh sách sản phẩm trong giỏ hàng
- `cartItemCount`: Số lượng sản phẩm
- `subtotal`: Tổng tiền hàng
- `total`: Thành tiền sau giảm giá
- `pendingBillsCount`: Số hóa đơn chờ

### Actions Chính

#### 🛒 Cart Management
```javascript
addToCart(product, quantity, imei)
updateCartItemQuantity(itemIndex, newQuantity)
removeFromCart(itemIndex)
clearCart()
```

#### 📋 Bill Management
```javascript
createNewBill()
updateBillTotals()
setCustomer(customer)
setPaymentMethod(method)
```

#### 🏷️ Voucher & Discount
```javascript
applyVoucher(voucherCode)
removeVoucher()
calculateDiscount()
```

#### 💳 Payment
```javascript
completePayment(paymentData)
savePendingBill()
```

#### 📋 Pending Bills
```javascript
fetchPendingBills()
loadPendingBill(bill)
deletePendingBill(billId)
```

## 🎯 SalesLogic Component

Component này hiển thị:
- **Quy trình bán hàng** với 4 bước
- **Thống kê real-time** (số lượng, tiền hàng, giảm giá, thành tiền)
- **Thao tác nhanh** (quét IMEI, tạo KH, áp voucher, lưu chờ, xóa giỏ hàng, hủy hóa đơn)
- **Trạng thái hóa đơn** (thông tin khách hàng, voucher)

## 🔧 Tích Hợp Với Backend

### API Endpoints Cần Thiết

#### Bills API
```
GET    /api/bills?status=PENDING     # Lấy hóa đơn chờ
POST   /api/bills                    # Tạo hóa đơn mới
PUT    /api/bills/{id}               # Cập nhật hóa đơn
DELETE /api/bills/{id}               # Xóa hóa đơn
```

#### Vouchers API
```
POST   /api/vouchers/validate        # Kiểm tra voucher
```

#### IMEI API
```
GET    /api/imei/{imei}/product      # Tìm sản phẩm theo IMEI
```

#### Customers API
```
GET    /api/customers                # Danh sách khách hàng
POST   /api/customers                # Tạo khách hàng mới
GET    /api/customers/search         # Tìm kiếm khách hàng
```

## 🎨 UI/UX Features

### 1. **Visual Flow Indicator**
- Hiển thị 4 bước bán hàng
- Highlight bước hiện tại
- Tự động chuyển bước khi hoàn thành

### 2. **Real-time Statistics**
- Số lượng sản phẩm trong giỏ
- Tổng tiền hàng
- Giảm giá áp dụng
- Thành tiền cuối cùng

### 3. **Quick Actions**
- Nút quét IMEI
- Tạo khách hàng mới
- Áp dụng voucher
- Lưu hóa đơn chờ
- Xóa giỏ hàng
- Hủy hóa đơn

### 4. **Status Cards**
- Thông tin khách hàng
- Thông tin voucher
- Trạng thái thanh toán

## 🚀 Lợi Ích Của Cấu Trúc Này

### 1. **Dễ Quản Lý**
- Tách biệt logic theo chức năng
- Store pattern giúp quản lý state tập trung
- Component tái sử dụng cao

### 2. **Dễ Hiểu**
- Quy trình bán hàng rõ ràng
- Visual feedback cho từng bước
- Thống kê real-time

### 3. **Dễ Mở Rộng**
- Thêm tính năng mới dễ dàng
- Tích hợp với backend linh hoạt
- Hỗ trợ nhiều phương thức thanh toán

### 4. **User Experience**
- Giao diện trực quan
- Thao tác nhanh
- Feedback tức thì
- Xử lý lỗi rõ ràng

## 🔄 Workflow

```
1. Khởi tạo → SalesStore.initialize()
2. Tải sản phẩm → ProductStore.fetchAllProducts()
3. Tải hóa đơn chờ → SalesStore.fetchPendingBills()
4. Người dùng tương tác → Cập nhật state
5. Hoàn tất giao dịch → SalesStore.completePayment()
6. Reset → SalesStore.createNewBill()
```

## 📝 Notes

- Tất cả state được quản lý trong SalesStore
- Component chỉ emit events và hiển thị data
- API calls được xử lý trong store actions
- Error handling tập trung trong store
- Loading states được quản lý global 