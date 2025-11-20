# Database Mapping & Field Verification

## Tổng quan

Tài liệu này đối chiếu giữa Database Schema (data-real.sql) và Frontend Code để đảm bảo mapping đúng.

---

## 1. Bảng hoa_don

### DB Schema:
```sql
CREATE TABLE hoa_don (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    ma VARCHAR(50) UNIQUE,
    id_khach_hang UNIQUEIDENTIFIER,
    id_nhan_vien UNIQUEIDENTIFIER,
    id_phieu_giam_gia UNIQUEIDENTIFIER,
    tong_tien DECIMAL(18, 2),
    tien_duoc_giam DECIMAL(18, 2),
    tong_tien_sau_giam DECIMAL(18, 2),
    trang_thai_thanh_toan INT, -- 0: Chưa, 1: Đã
    trang_thai INT, -- 0: Chờ xác nhận, 1: Đã xác nhận, 2: Đang giao, 3: Hoàn thành, 4: Đã hủy
    so_diem_su_dung INT,
    so_tien_quy_doi DECIMAL(18, 2)
)
```

### FE Mapping:
- ✅ `id` → `hoaDon.id`
- ✅ `ma` → `hoaDon.ma`
- ✅ `id_khach_hang` → `hoaDon.idKhachHang` hoặc `hoaDon.khachHang.id`
- ✅ `id_phieu_giam_gia` → `hoaDon.idPhieuGiamGia`
- ✅ `tong_tien` → `hoaDon.tongTien`
- ✅ `tien_duoc_giam` → `hoaDon.tienDuocGiam`
- ✅ `tong_tien_sau_giam` → `hoaDon.tongTienSauGiam`
- ✅ `trang_thai_thanh_toan` → `hoaDon.trangThaiThanhToan` (0: Chưa, 1: Đã)
- ⚠️ `so_diem_su_dung` → **TODO**: FE chưa sử dụng field này, cần kiểm tra backend có trả về không
- ⚠️ `so_tien_quy_doi` → **TODO**: FE chưa sử dụng field này, cần kiểm tra backend có trả về không

### Ghi chú:
- Backend cần đảm bảo trả về `soDiemSuDung` và `soTienQuyDoi` trong response khi sử dụng điểm tích lũy.

---

## 2. Bảng hoa_don_chi_tiet

### DB Schema:
```sql
CREATE TABLE hoa_don_chi_tiet (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    id_don_hang UNIQUEIDENTIFIER, -- FK đến hoa_don
    id_ctsp UNIQUEIDENTIFIER, -- FK đến chi_tiet_san_pham
    so_luong INT,
    don_gia DECIMAL(18, 2)
    -- KHÔNG có cột thanh_tien
)
```

### FE Mapping:
- ✅ `id` → `item.id`
- ✅ `id_don_hang` → `item.idDonHang` (thường không cần dùng trực tiếp)
- ✅ `id_ctsp` → `item.idChiTietSanPham` hoặc `item.idCtsp`
- ✅ `so_luong` → `item.soLuong`
- ✅ `don_gia` → `item.donGia`
- ⚠️ `thanhTien` → **FE tính = `donGia * soLuong`** (DB không có cột này)

### Ghi chú:
- FE đang dùng `item.thanhTien` - cần đảm bảo:
  1. Backend tính và trả về trong response, HOẶC
  2. FE tự tính = `donGia * soLuong`
- Hiện tại FE đang tính trong một số nơi: `formatCurrency(item.donGia * item.soLuong)`
- **Khuyến nghị**: Backend nên tính và trả về `thanhTien` để đảm bảo tính nhất quán.

---

## 3. Bảng khach_hang

### DB Schema:
```sql
CREATE TABLE khach_hang (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    ma_khach_hang VARCHAR(50) UNIQUE,
    ho_ten NVARCHAR(255),
    so_dien_thoai VARCHAR(20),
    email VARCHAR(100),
    trang_thai INT
    -- KHÔNG có cột diem_tich_luy
)
```

### FE Mapping:
- ✅ `user_id` → `customer.userId` hoặc `customer.id`
- ✅ `ma_khach_hang` → `customer.maKhachHang`
- ✅ `ho_ten` → `customer.hoTen`
- ✅ `so_dien_thoai` → `customer.soDienThoai`
- ✅ `email` → `customer.email`
- ⚠️ `diemTichLuy` → **FE dùng `customer.diemTichLuy`** nhưng DB không có cột này

### Điểm tích lũy:
Điểm tích lũy được lưu trong bảng `tich_diem`:
```sql
CREATE TABLE tich_diem (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id UNIQUEIDENTIFIER, -- FK đến khach_hang
    diem_da_dung INT,
    diem_da_cong INT,
    tong_diem INT  -- Tổng điểm hiện tại
)
```

### Ghi chú:
- **Backend cần map `tich_diem.tong_diem` vào `khachHang.diemTichLuy`** khi trả về thông tin khách hàng.
- FE đang dùng `customer.diemTichLuy` ở nhiều nơi:
  - `CustomerInfo.vue`: Hiển thị điểm tích lũy
  - `InvoiceDetails.vue`: Checkbox sử dụng điểm
  - `useVoucherPoints.js`: Validate điểm trước khi sử dụng

---

## 4. Bảng serial

### DB Schema:
```sql
CREATE TABLE serial (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    ctsp_id UNIQUEIDENTIFIER, -- FK đến chi_tiet_san_pham
    serial_no VARCHAR(100) UNIQUE,
    trang_thai INT, -- 0: Trong kho, 1: Đã bán, 2: Đang bảo hành, 3: Lỗi
    ngay_nhap DATETIME2
)
```

### FE Mapping:
- ✅ `id` → `serial.id`
- ✅ `ctsp_id` → `serial.ctspId` hoặc `serial.idChiTietSanPham`
- ✅ `serial_no` → `serial.serialNo` hoặc `serial.serialNumber`
- ✅ `trang_thai` → `serial.trangThai`

### Trạng thái Serial:
- `0`: Trong kho (khả dụng) ✅
- `1`: Đã bán ❌
- `2`: Đang bảo hành ❌
- `3`: Lỗi ❌

### FE Code:
```javascript
// ModalThanhToan.vue - Lọc serial khả dụng
const khaDung = serials.filter(s => s.trangThai === 0 || s.trangThai === 1)
```
⚠️ **LỖI**: Code đang lọc `trangThai === 1` (Đã bán) - không đúng!
- **Sửa**: Chỉ lọc `trangThai === 0` (Trong kho)

---

## 5. Bảng serial_da_ban

### DB Schema:
```sql
CREATE TABLE serial_da_ban (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    id_hoa_don_chi_tiet UNIQUEIDENTIFIER NOT NULL, -- FK đến hoa_don_chi_tiet
    id_serial UNIQUEIDENTIFIER NOT NULL, -- FK đến serial
    ngay_tao DATETIME2 DEFAULT GETDATE()
)
```

### FE Mapping:
- ⚠️ **FE chưa có logic hiển thị serial đã quét từ bảng này**
- FE đang dùng `validatedSerials` trong `useSerialValidation.js` (client-side)
- Khi thanh toán, FE gửi `serialNumbers` array lên backend
- Backend sẽ tạo records trong `serial_da_ban`

### Ghi chú:
- **TODO**: FE cần hiển thị serial đã quét từ `serial_da_ban` khi xem lại hóa đơn đã thanh toán.
- Hiện tại `InvoiceDetails.vue` có code hiển thị serial nhưng chưa rõ nguồn dữ liệu:
  ```javascript
  const getSerialsForItem = (item) => {
    if (item.serialNumbers && Array.isArray(item.serialNumbers)) {
      return item.serialNumbers.map(s => s.serialNumber || s.serialNo || s)
    }
    // ...
  }
  ```
- **Khuyến nghị**: Backend cần trả về `serialNumbers` trong `hoaDonChiTiet` khi load hóa đơn đã thanh toán.

---

## 6. Bảng phieu_giam_gia

### DB Schema:
```sql
CREATE TABLE phieu_giam_gia (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    ma VARCHAR(50) UNIQUE,
    ten_phieu_giam_gia NVARCHAR(255),
    loai_phieu_giam_gia INT, -- 1: Giảm theo %, 2: Giảm theo số tiền
    gia_tri_giam_gia DECIMAL(18, 2),
    so_tien_giam_toi_da DECIMAL(18, 2),
    hoa_don_toi_thieu DECIMAL(18, 2),
    so_luong_dung INT,
    ngay_bat_dau DATETIME2,
    ngay_ket_thuc DATETIME2,
    rieng_tu BIT,
    mo_ta NVARCHAR(MAX),
    trang_thai INT
)
```

### FE Mapping:
- ✅ `id` → `voucher.id`
- ✅ `ma` → `voucher.ma`
- ✅ `ten_phieu_giam_gia` → `voucher.tenPhieuGiamGia`
- ✅ `loai_phieu_giam_gia` → `voucher.loaiPhieuGiamGia` (1: %, 2: Số tiền)
- ✅ `gia_tri_giam_gia` → `voucher.giaTriGiamGia`
- ✅ `so_tien_giam_toi_da` → `voucher.soTienGiamToiDa`
- ✅ `hoa_don_toi_thieu` → `voucher.hoaDonToiThieu`
- ✅ `ngay_bat_dau` → `voucher.ngayBatDau`
- ✅ `ngay_ket_thuc` → `voucher.ngayKetThuc`
- ✅ `mo_ta` → `voucher.moTa`

### Ghi chú:
- FE đang map đúng các field.

---

## 7. Bảng chi_tiet_san_pham

### DB Schema:
```sql
CREATE TABLE chi_tiet_san_pham (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    sp_id UNIQUEIDENTIFIER, -- FK đến san_pham
    ma_ctsp VARCHAR(50) UNIQUE,
    gia_ban DECIMAL(18, 2),
    so_luong_ton INT DEFAULT 0,
    so_luong_tam_giu INT DEFAULT 0,
    trang_thai INT
)
```

### FE Mapping:
- ✅ `id` → `variant.id` hoặc `variant.idChiTietSanPham`
- ✅ `ma_ctsp` → `variant.maCtsp` hoặc `variant.maChiTietSanPham`
- ✅ `gia_ban` → `variant.giaBan` hoặc `variant.donGia`
- ✅ `so_luong_ton` → `variant.soLuongTon`
- ✅ `trang_thai` → `variant.trangThai`

### Ghi chú:
- FE đang map đúng các field.

---

## 8. Tổng hợp các vấn đề cần fix

### ⚠️ Vấn đề 1: Serial Status Filter
**File**: `src/components/banhang/ModalThanhToan.vue`
**Dòng**: ~487
**Vấn đề**: Đang lọc `trangThai === 0 || trangThai === 1` (bao gồm cả "Đã bán")
**Fix**: Chỉ lọc `trangThai === 0` (Trong kho)

### ⚠️ Vấn đề 2: Điểm tích lũy
**File**: Nhiều file sử dụng `customer.diemTichLuy`
**Vấn đề**: DB không có cột này trong `khach_hang`, cần lấy từ `tich_diem.tong_diem`
**Fix**: Backend cần map field này khi trả về thông tin khách hàng

### ⚠️ Vấn đề 3: thanhTien trong hoa_don_chi_tiet
**File**: Nhiều file sử dụng `item.thanhTien`
**Vấn đề**: DB không có cột này
**Fix**: Backend nên tính và trả về, hoặc FE tự tính = `donGia * soLuong`

### ⚠️ Vấn đề 4: Serial đã quét
**File**: `src/components/banhang/InvoiceDetails.vue`
**Vấn đề**: FE chưa có logic rõ ràng để lấy serial từ `serial_da_ban`
**Fix**: Backend cần trả về `serialNumbers` trong `hoaDonChiTiet` khi load hóa đơn đã thanh toán

### ⚠️ Vấn đề 5: soDiemSuDung và soTienQuyDoi
**File**: `src/composables/useVoucherPoints.js`, `src/components/banhang/ModalThanhToan.vue`
**Vấn đề**: FE chưa sử dụng các field này từ `hoa_don`
**Fix**: Backend cần trả về và FE cần hiển thị khi sử dụng điểm tích lũy

---

## 9. Checklist Backend cần đảm bảo

- [ ] Map `tich_diem.tong_diem` → `khachHang.diemTichLuy` trong response
- [ ] Tính và trả về `thanhTien` trong `hoaDonChiTiet` (hoặc FE tự tính)
- [ ] Trả về `soDiemSuDung` và `soTienQuyDoi` trong `hoaDon` khi sử dụng điểm
- [ ] Trả về `serialNumbers` trong `hoaDonChiTiet` khi load hóa đơn đã thanh toán
- [ ] Lọc serial khả dụng chỉ với `trangThai === 0` (Trong kho)

---

## 10. Checklist Frontend cần fix

- [ ] Fix filter serial trong `ModalThanhToan.vue` (chỉ lọc `trangThai === 0`)
- [ ] Đảm bảo tính `thanhTien` đúng nếu backend không trả về
- [ ] Hiển thị `soDiemSuDung` và `soTienQuyDoi` khi sử dụng điểm tích lũy
- [ ] Xử lý trường hợp `diemTichLuy` null/undefined (fallback = 0)

---

**Cập nhật lần cuối**: 2024-12-01

