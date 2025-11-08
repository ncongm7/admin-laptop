# 📊 BÁO CÁO PHÂN TÍCH - QUẢN LÝ HÓA ĐƠN

**Ngày phân tích:** 2025-10-29  
**Người thực hiện:** AI Technical Leader

---

## I. PHÂN TÍCH UI HIỆN TẠI (`QuanLiHoaDon.vue`)

### ✅ **Điểm mạnh:**

1. **Giao diện đẹp, hiện đại:**
   - Layout rõ ràng với header, filter, status tabs, table
   - Sử dụng Bootstrap 5 tốt
   - Responsive design
   - Icon trực quan (bi-eye, bi-printer)

2. **Tính năng filter đầy đủ:**
   - Tìm kiếm theo mã HĐ, tên KH, SĐT
   - Lọc theo loại hóa đơn (Tại quầy/Online)
   - Lọc theo khoảng thời gian (dateFrom, dateTo)
   - Status tabs để lọc nhanh theo trạng thái

3. **Bảng hiển thị tốt:**
   - Các cột quan trọng: Mã, Khách hàng, Loại, Người tạo, Ngày tạo, Trạng thái, Số tiền
   - Action buttons: Xem chi tiết, In hóa đơn

### ❌ **Vấn đề cần sửa:**

#### **1. Dùng FAKE DATA từ Pinia Store**
```javascript
// invoiceStore.js - Dữ liệu cứng!
const invoices = ref([
  { id: 1, code: 'HD0582', customer: { name: 'Lý Tiến Duy...' }, ... },
  { id: 2, code: 'HD1760', customer: { name: 'Khách vãng lai...' }, ... },
  ...
])
```
→ **PHẢI THAY THẾ** bằng data thật từ API backend!

#### **2. Thiếu các trường quan trọng từ DB:**

**So sánh UI vs DB (`hoa_don` table):**

| Field trong DB | Có trong UI? | Ghi chú |
|---|---|---|
| `id` | ✅ (invoice.id) | OK |
| `ma` | ✅ (invoice.code) | OK |
| `id_khach_hang` | ❌ | Chỉ có tên + SĐT |
| `id_nhan_vien` | ❌ | Chỉ có staffCode (fake) |
| `ten_khach_hang` | ✅ | OK |
| `sdt` | ✅ | OK |
| `dia_chi` | ❌ | Không hiển thị |
| `tong_tien` | ✅ (invoice.total) | OK |
| `tien_duoc_giam` | ❌ | Không hiển thị |
| `tong_tien_sau_giam` | ❌ | Không hiển thị |
| `loai_hoa_don` | ✅ | OK (0: Tại quầy, 1: Online) |
| `ghi_chu` | ❌ | Không hiển thị |
| `ngay_tao` | ✅ | OK |
| `ngay_thanh_toan` | ❌ | Không hiển thị |
| `trang_thai_thanh_toan` | ❌ | **QUAN TRỌNG!** |
| `trang_thai` | ⚠️ | Có nhưng mapping sai |

**Mapping trạng thái SAI:**
```javascript
// UI hiện tại
status: 'delivered', 'processing', 'confirmed', 'shipping', 'done'

// DB thực tế (theo data.sql)
trang_thai INT: 
  0: Chờ xác nhận
  1: Đã xác nhận
  2: Đang giao
  3: Hoàn thành
  4: Đã hủy
```

#### **3. Thiếu thông tin chi tiết:**
- Không hiển thị **tên nhân viên** (chỉ có mã NV fake)
- Không hiển thị **trạng thái thanh toán** (Chưa/Đã thanh toán)
- Không hiển thị **phương thức thanh toán**
- Không hiển thị **danh sách sản phẩm** trong hóa đơn

#### **4. Chưa có phân trang:**
- Hiện tại load tất cả invoices vào 1 mảng
- Không có pagination component
- Sẽ chậm khi có hàng nghìn hóa đơn

#### **5. Modal chi tiết chưa có:**
```javascript
const openDetail = (invoice) => {
  router.push(`/quan-li-hoa-don/chi-tiet/${invoice.code}`)
}
```
→ Chuyển trang thay vì mở Modal!

---

## II. SO SÁNH VỚI CẤU TRÚC DATABASE

### **Bảng `hoa_don`**

```sql
CREATE TABLE hoa_don (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    ma VARCHAR(50) UNIQUE,
    id_khach_hang UNIQUEIDENTIFIER,          -- FK → khach_hang
    id_nhan_vien UNIQUEIDENTIFIER,           -- FK → nhan_vien
    id_phieu_giam_gia UNIQUEIDENTIFIER,      -- FK → phieu_giam_gia
    ma_don_hang VARCHAR(50),
    ten_khach_hang NVARCHAR(255),
    sdt VARCHAR(20),
    dia_chi NVARCHAR(500),
    tong_tien DECIMAL(18, 2),
    tien_duoc_giam DECIMAL(18, 2),
    tong_tien_sau_giam DECIMAL(18, 2),
    loai_hoa_don INT,                        -- 0: Tại quầy, 1: Online
    ghi_chu NVARCHAR(MAX),
    ngay_tao DATETIME2,
    ngay_thanh_toan DATETIME2,
    trang_thai_thanh_toan INT,               -- 0: Chưa, 1: Đã
    trang_thai INT,                          -- 0-4: Các trạng thái xử lý
    so_diem_su_dung INT,
    so_tien_quy_doi DECIMAL(18, 2)
);
```

### **Bảng `hoa_don_chi_tiet`**

```sql
CREATE TABLE hoa_don_chi_tiet (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    id_don_hang UNIQUEIDENTIFIER,            -- FK → hoa_don
    id_ctsp UNIQUEIDENTIFIER,                -- FK → chi_tiet_san_pham
    so_luong INT,
    don_gia DECIMAL(18, 2)
);
```

### **Bảng `chi_tiet_thanh_toan`**

```sql
CREATE TABLE chi_tiet_thanh_toan (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    id_hoa_don UNIQUEIDENTIFIER,             -- FK → hoa_don
    phuong_thuc_thanh_toan_id UNIQUEIDENTIFIER, -- FK → phuong_thuc_thanh_toan
    so_tien_thanh_toan DECIMAL(18, 2),
    ma_giao_dich VARCHAR(100),
    ghi_chu NVARCHAR(MAX)
);
```

### **⚠️ Các JOIN cần thiết:**

Để hiển thị đầy đủ thông tin, cần JOIN:
1. `hoa_don` ⟷ `khach_hang` → Lấy thông tin khách hàng
2. `hoa_don` ⟷ `nhan_vien` → Lấy tên nhân viên
3. `hoa_don` ⟷ `hoa_don_chi_tiet` → Lấy danh sách sản phẩm
4. `hoa_don_chi_tiet` ⟷ `chi_tiet_san_pham` → Lấy thông tin sản phẩm
5. `chi_tiet_san_pham` ⟷ `san_pham` → Lấy tên sản phẩm
6. `hoa_don` ⟷ `chi_tiet_thanh_toan` → Lấy thông tin thanh toán

---

## III. KIỂM TRA LUỒNG BÁN HÀNG

### ✅ **Backend ĐÃ XỬ LÝ TỐN KHO:**

File: `BanHangTaiQuayService.java` - Method: `thanhToanHoaDon()`

```java
// Dòng 289-291: Trừ tồn kho khi thanh toán
ctsp.setSoLuongTon(soLuongTon - 1);
ctsp.setSoLuongTamGiu(Math.max(0, soLuongTamGiu - 1));
chiTietSanPhamRepository.save(ctsp);
```

**Luồng bán hàng hoàn chỉnh:**
1. ✅ **Tạo hóa đơn chờ** → `taoHoaDonMoi()`
2. ✅ **Thêm sản phẩm** → `themSanPhamVaoHoaDon()` (tăng `soLuongTamGiu`)
3. ✅ **Thanh toán** → `thanhToanHoaDon()` (trừ `soLuongTon`, giảm `soLuongTamGiu`)
4. ✅ **Lưu serial đã bán** → Tạo bản ghi `serial_da_ban`
5. ✅ **Cập nhật trạng thái Serial** → `trangThai = 2` (Đã bán)

**✅ Kết luận:** Luồng bán hàng HOẠT ĐỘNG TỐT, tồn kho được cập nhật chính xác!

---

## IV. DANH SÁCH API CẦN TẠO

### **API 1: Lấy danh sách hóa đơn (có phân trang + lọc)**

```
GET /api/v1/hoa-don
```

**Query Params:**
- `page` (int, default: 0)
- `size` (int, default: 10)
- `keyword` (string, optional) - Tìm theo mã HĐ, tên KH, SĐT
- `trangThai` (int, optional) - Lọc theo trạng thái (0-4)
- `loaiHoaDon` (int, optional) - Lọc theo loại (0: Tại quầy, 1: Online)
- `startDate` (date, optional) - Từ ngày
- `endDate` (date, optional) - Đến ngày
- `trangThaiThanhToan` (int, optional) - Lọc theo TT thanh toán (0: Chưa, 1: Đã)

**Response:**
```json
{
  "data": {
    "content": [
      {
        "id": "uuid",
        "ma": "HD001",
        "tenKhachHang": "Nguyễn Văn A",
        "sdt": "0901234567",
        "tenNhanVien": "Trần Thị B",      // JOIN từ nhan_vien
        "ngayTao": "2025-10-29T10:00:00",
        "ngayThanhToan": "2025-10-29T10:30:00",
        "tongTien": 25990000,
        "tienDuocGiam": 2599000,
        "tongTienSauGiam": 23391000,
        "loaiHoaDon": 0,                   // 0: Tại quầy, 1: Online
        "trangThai": 3,                    // 0-4
        "trangThaiThanhToan": 1,           // 0: Chưa, 1: Đã
        "ghiChu": "..."
      }
    ],
    "totalElements": 150,
    "totalPages": 15,
    "currentPage": 0,
    "pageSize": 10
  },
  "message": "Lấy danh sách hóa đơn thành công"
}
```

### **API 2: Lấy chi tiết một hóa đơn**

```
GET /api/v1/hoa-don/{idHoaDon}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "ma": "HD001",
    // Thông tin khách hàng
    "khachHang": {
      "id": "uuid",
      "hoTen": "Nguyễn Văn A",
      "soDienThoai": "0901234567",
      "email": "an.nguyen@email.com",
      "diaChi": "123 ABC"
    },
    // Thông tin nhân viên
    "nhanVien": {
      "id": "uuid",
      "hoTen": "Trần Văn Giang",
      "maNhanVien": "NV002"
    },
    // Thông tin hóa đơn
    "ngayTao": "2025-10-29T10:00:00",
    "ngayThanhToan": "2025-10-29T10:30:00",
    "tongTien": 25990000,
    "tienDuocGiam": 2599000,
    "tongTienSauGiam": 23391000,
    "loaiHoaDon": 0,
    "trangThai": 3,
    "trangThaiThanhToan": 1,
    "ghiChu": "Đơn hàng laptop gaming",
    // Danh sách sản phẩm
    "chiTietList": [
      {
        "id": "uuid",
        "tenSanPham": "Laptop Gaming ASUS ROG Strix G15",
        "maCtsp": "CTSP001",
        "soLuong": 1,
        "donGia": 25990000,
        "thanhTien": 25990000
      }
    ],
    // Thông tin thanh toán
    "thanhToanList": [
      {
        "id": "uuid",
        "tenPhuongThuc": "Chuyển khoản ngân hàng",
        "soTienThanhToan": 23391000,
        "maGiaoDich": "TXN001234567890",
        "ghiChu": "Thanh toán chuyển khoản"
      }
    ]
  },
  "message": "Lấy chi tiết hóa đơn thành công"
}
```

---

## V. ĐÁNH GIÁ & KHUYẾN NGHỊ

### **✅ Điểm Tốt:**
1. UI hiện đại, trực quan
2. Luồng bán hàng backend hoạt động tốt
3. Có đầy đủ filter UI (chỉ thiếu logic backend)

### **❌ Điểm Cần Cải Thiện:**
1. **CRITICAL:** Thay thế fake data bằng API thật
2. **IMPORTANT:** Thêm phân trang
3. **IMPORTANT:** Sửa mapping trạng thái cho đúng DB
4. **IMPORTANT:** Hiển thị tên nhân viên, TT thanh toán
5. **MEDIUM:** Tạo Modal chi tiết thay vì chuyển trang
6. **NICE TO HAVE:** Thêm export Excel, quét QR thực sự

---

## VI. KẾ HOẠCH THỰC HIỆN

### **PHASE 1: Backend (Ưu tiên cao)**
1. ✅ Tạo `HoaDonController.java`
2. ✅ Tạo `HoaDonService.java` 
3. ✅ Tạo DTOs: `HoaDonSearchRequest`, `HoaDonDetailResponse`
4. ✅ Viết API GET danh sách (với JPA Specifications)
5. ✅ Viết API GET chi tiết

### **PHASE 2: Frontend Service**
1. ✅ Tạo `hoaDonService.js`
2. ✅ Viết functions: `getHoaDons()`, `getHoaDonDetail()`

### **PHASE 3: Frontend UI**
1. ✅ Refactor `QuanLiHoaDon.vue`:
   - Thay invoiceStore bằng API calls
   - Sửa mapping trạng thái
   - Thêm pagination component
2. ✅ Tạo `ChiTietHoaDonModal.vue`
3. ✅ Tích hợp Modal vào trang quản lý

### **PHASE 4: Testing & Polish**
1. ✅ Test API với Postman
2. ✅ Test UI với data thật
3. ✅ Fix bugs
4. ✅ Optimize performance

---

**BẮT ĐẦU NGAY:** Tạo Backend APIs trước! 🚀

