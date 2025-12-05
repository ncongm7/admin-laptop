# 📚 Giải thích về Composables và Code hiện tại

## 1. Composables là gì?

**Composables** = **Hàm JavaScript tái sử dụng** trong Vue 3

### Ví dụ đơn giản:

```javascript
// ❌ KHÔNG dùng Composable (code lặp lại)
// Component A
const count = ref(0)
const increment = () => count.value++

// Component B  
const count = ref(0)  // Lặp lại code!
const increment = () => count.value++

// ✅ Dùng Composable (tái sử dụng)
// useCounter.js
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// Component A & B
const { count, increment } = useCounter()  // Dùng chung!
```

---

## 2. Code hiện tại làm gì?

### `useProductManagement.js` quản lý:
- ✅ Thêm sản phẩm vào hóa đơn
- ✅ Xóa sản phẩm khỏi hóa đơn  
- ✅ Quét mã IMEI/Barcode
- ✅ Modal nhập số lượng
- ✅ **Xử lý TEMP ID** (tự động tạo hóa đơn thực)

### Flow đơn giản:

```
1. User chọn sản phẩm
   ↓
2. handleProductSelected() nhận data
   ↓
3. confirmAddProduct() được gọi
   ↓
4. ensureRealHoaDon() kiểm tra:
   - Nếu là TEMP ID → Tạo hóa đơn thực
   - Nếu là UUID thật → Dùng luôn
   ↓
5. Gọi API thêm sản phẩm
   ↓
6. Cập nhật hóa đơn
```

---

## 3. Đoạn code khó hiểu nhất

### `ensureRealHoaDon()` - Tạo hóa đơn thực nếu cần

```javascript
const ensureRealHoaDon = async () => {
  // Bước 1: Kiểm tra ID
  let idHoaDon = hoaDonHienTai.value.id
  const isTempId = idHoaDon.startsWith('TEMP_')
  
  // Bước 2: Nếu đã là UUID thật → trả về luôn
  if (!isTempId) {
    return idHoaDon
  }
  
  // Bước 3: Nếu là TEMP ID → Tạo hóa đơn thực
  const createResponse = await taoHoaDonChoMoi({
    nhanVienId: authStore.getUserId,
    khachHangId: hoaDonHienTai.value.khachHang?.id
  })
  
  // Bước 4: Cập nhật hóa đơn với UUID mới
  const hoaDonUpdated = {
    ...hoaDonHienTai.value,
    id: createResponse.data.id,  // UUID mới
    isLocal: false
  }
  capNhatHoaDon(hoaDonUpdated)
  
  // Bước 5: Trả về UUID thật
  return hoaDonUpdated.id
}
```

**Tại sao cần?**
- Hóa đơn mới tạo có ID tạm: `TEMP_1234567890`
- Backend không chấp nhận TEMP ID
- Phải tạo hóa đơn thực trong DB trước
- Sau đó mới thêm sản phẩm được

---

## 4. Có thể đơn giản hóa không?

### ✅ CÓ - Có 2 cách:

#### Cách 1: Giữ Composable nhưng thêm comment rõ ràng hơn
- Dễ hiểu hơn
- Vẫn tái sử dụng được

#### Cách 2: Viết trực tiếp trong Component
- Đơn giản hơn, dễ hiểu hơn
- Nhưng code sẽ dài và lặp lại

---

## 5. So sánh 2 cách

### Cách A: Dùng Composable (hiện tại)

```javascript
// SalesView.vue
const {
  handleProductSelected,
  confirmAddProduct,
  // ... 10+ functions
} = useProductManagement(hoaDonHienTai, capNhatHoaDon)

// Component gọn, logic tách riêng
```

### Cách B: Viết trực tiếp (đơn giản hơn)

```javascript
// SalesView.vue - Viết hết trong component
const selectedProduct = ref(null)
const soLuongNhap = ref(1)

const confirmAddProduct = async () => {
  // Kiểm tra TEMP ID
  if (hoaDonHienTai.value.id.startsWith('TEMP_')) {
    // Tạo hóa đơn thực
    const response = await taoHoaDonChoMoi({...})
    hoaDonHienTai.value.id = response.data.id
  }
  
  // Thêm sản phẩm
  await themSanPhamVaoHoaDon(hoaDonHienTai.value.id, {...})
}

// Component dài hơn, nhưng dễ hiểu hơn
```

---

## 6. Khuyến nghị

### Nếu bạn mới học Vue:
- ✅ **Nên viết trực tiếp trong component** trước
- ✅ Hiểu rõ logic rồi mới tách ra Composable

### Nếu code đã lớn:
- ✅ **Nên dùng Composable** để tái sử dụng
- ✅ Code gọn hơn, dễ maintain

---

## 7. Tóm tắt

| | Composables | Viết trực tiếp |
|---|---|---|
| **Độ phức tạp** | ⭐⭐⭐ | ⭐ |
| **Tái sử dụng** | ✅ Có | ❌ Không |
| **Dễ hiểu** | ⭐⭐ | ⭐⭐⭐ |
| **Code gọn** | ✅ Có | ❌ Không |

**Kết luận:** 
- Composables **KHÔNG bắt buộc**, nhưng **RẤT HỮU ÍCH** khi code lớn
- Nếu thấy khó hiểu, có thể viết trực tiếp trong component
- Sau này hiểu rồi, tách ra Composable để tái sử dụng

