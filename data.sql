/*
--------------------------------------------------------------------------------
-- SCRIPT TẠO DATABASE QUẢN LÝ BÁN HÀNG LAPTOP
-- PHIÊN BẢN: HOÀN THIỆN
-- CÁC QUY ƯỚC:
--  - Sử dụng INT IDENTITY(1,1) cho các khóa chính tự tăng (PK).
--  - Sử dụng NVARCHAR cho các chuỗi để hỗ trợ Unicode (Tiếng Việt).
--  - Áp dụng các trường audit (created_at, created_by, updated_at, updated_by, deleted)
--    cho các bảng dữ liệu quan trọng.
--  - Các mối quan hệ đã được tối ưu hóa theo thảo luận.
--------------------------------------------------------------------------------
*/

--==============================================================
-- KHỞI TẠO CÁC BẢNG DỮ LIỆU CHÍNH VÀ CẤU HÌNH
--==============================================================

-- 1. Bảng Vai Trò & Tài Khoản (Đã gộp lại)
CREATE TABLE TaiKhoan (
    id INT IDENTITY(1,1) PRIMARY KEY,
    taiKhoan NVARCHAR(100) NOT NULL UNIQUE,
    matKhau NVARCHAR(MAX) NOT NULL, -- Sẵn sàng để lưu mật khẩu đã được hash
    role NVARCHAR(50) NOT NULL, -- Ví dụ: 'ADMIN', 'NHAN_VIEN', 'KHACH_HANG'
    trangThai BIT DEFAULT 1, -- 1: Hoạt động, 0: Bị khóa
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2,
    deleted BIT DEFAULT 0
);
GO

-- 2. Bảng Nhân Viên
CREATE TABLE NhanVien (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tai_khoan_id INT UNIQUE, -- Quan hệ 1-1 với TaiKhoan
    ten NVARCHAR(255) NOT NULL,
    soDienThoai VARCHAR(15),
    email VARCHAR(255) UNIQUE,
    diaChi NVARCHAR(MAX),
    ngaySinh DATE,
    gioiTinh BIT, -- 1: Nam, 0: Nữ
    anh NVARCHAR(MAX),
    chucVu NVARCHAR(100),
    trangThai BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    deleted BIT DEFAULT 0,
    FOREIGN KEY (tai_khoan_id) REFERENCES TaiKhoan(id),
    FOREIGN KEY (created_by) REFERENCES TaiKhoan(id),
    FOREIGN KEY (updated_by) REFERENCES TaiKhoan(id)
);
GO

-- 3. Bảng Khách Hàng
CREATE TABLE KhachHang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tai_khoan_id INT UNIQUE, -- Quan hệ 1-1 với TaiKhoan, có thể NULL cho khách vãng lai
    ten NVARCHAR(255) NOT NULL,
    soDienThoai VARCHAR(15),
    email VARCHAR(255),
    gioiTinh BIT,
    trangThai BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    deleted BIT DEFAULT 0,
    FOREIGN KEY (tai_khoan_id) REFERENCES TaiKhoan(id),
    FOREIGN KEY (created_by) REFERENCES TaiKhoan(id),
    FOREIGN KEY (updated_by) REFERENCES TaiKhoan(id)
);
GO

CREATE TABLE DiaChi_KH (
	id INT IDENTITY(1,1) PRIMARY KEY,
	khach_hang_id INT NOT NULL,
	soNha NVARCHAR(100),
	quanHuyen NVARCHAR(100),
	xaPhuong NVARCHAR(100),
	tinhThanh NVARCHAR(100),
	is_default BIT DEFAULT 0, -- Địa chỉ mặc định
	FOREIGN KEY (khach_hang_id) REFERENCES KhachHang(id)
);
GO

--==============================================================
-- KHỞI TẠO CÁC BẢNG THUỘC TÍNH SẢN PHẨM
--==============================================================

CREATE TABLE Hang ( id INT IDENTITY(1,1) PRIMARY KEY, maHang VARCHAR(50) UNIQUE, tenHang NVARCHAR(100));
CREATE TABLE CPU ( id INT IDENTITY(1,1) PRIMARY KEY, maCPU VARCHAR(50) UNIQUE, tenCPU NVARCHAR(100));
CREATE TABLE GPU ( id INT IDENTITY(1,1) PRIMARY KEY, maGPU VARCHAR(50) UNIQUE, tenGPU NVARCHAR(100));
CREATE TABLE Ram ( id INT IDENTITY(1,1) PRIMARY KEY, maRam VARCHAR(50) UNIQUE, dungLuong NVARCHAR(50));
CREATE TABLE OCung ( id INT IDENTITY(1,1) PRIMARY KEY, maOCung VARCHAR(50) UNIQUE, tenOCung NVARCHAR(100), loaiOCung NVARCHAR(50));
CREATE TABLE MauSac ( id INT IDENTITY(1,1) PRIMARY KEY, maMauSac VARCHAR(50) UNIQUE, tenMau NVARCHAR(100));
CREATE TABLE KichThuocManHinh ( id INT IDENTITY(1,1) PRIMARY KEY, giaTri NVARCHAR(50) UNIQUE);
CREATE TABLE LoaiManHinh ( id INT IDENTITY(1,1) PRIMARY KEY, congNghe NVARCHAR(100) UNIQUE);
CREATE TABLE HeDieuHanh ( id INT IDENTITY(1,1) PRIMARY KEY, tenHĐH NVARCHAR(100) UNIQUE);
CREATE TABLE DungLuongPin ( id INT IDENTITY(1,1) PRIMARY KEY, dungLuongWh INT);
CREATE TABLE Camera ( id INT IDENTITY(1,1) PRIMARY KEY, doPhanGiai NVARCHAR(100) UNIQUE);
CREATE TABLE PhuongThucThanhToan(id INT IDENTITY(1,1) PRIMARY KEY, tenPhuongThuc NVARCHAR(100), moTa NVARCHAR(255));
GO


--==============================================================
-- KHỞI TẠO CÁC BẢNG QUẢN LÝ SẢN PHẨM & KHO
--==============================================================

-- 4. Bảng Sản Phẩm Gốc (Template)
CREATE TABLE SanPham (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tenSanPham NVARCHAR(255) NOT NULL,
    hang_id INT,
    cpu_id INT,
    gpu_id INT,
    kichThuocManHinh_id INT,
    loaiManHinh_id INT,
    heDieuHanh_id INT,
    dungLuongPin_id INT,
    camera_id INT,
	moTa NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    deleted BIT DEFAULT 0,
    FOREIGN KEY (hang_id) REFERENCES Hang(id),
    FOREIGN KEY (cpu_id) REFERENCES CPU(id),
    FOREIGN KEY (gpu_id) REFERENCES GPU(id),
    FOREIGN KEY (kichThuocManHinh_id) REFERENCES KichThuocManHinh(id),
    FOREIGN KEY (loaiManHinh_id) REFERENCES LoaiManHinh(id),
    FOREIGN KEY (heDieuHanh_id) REFERENCES HeDieuHanh(id),
    FOREIGN KEY (dungLuongPin_id) REFERENCES DungLuongPin(id),
    FOREIGN KEY (camera_id) REFERENCES Camera(id),
	FOREIGN KEY (created_by) REFERENCES TaiKhoan(id),
    FOREIGN KEY (updated_by) REFERENCES TaiKhoan(id)
);
GO

-- 5. Bảng Chi Tiết Sản Phẩm (SKU - Stock Keeping Unit)
CREATE TABLE CTSP (
    id INT IDENTITY(1,1) PRIMARY KEY,
    san_pham_id INT NOT NULL,
    ram_id INT,
    o_cung_id INT,
    mau_sac_id INT,
    giaBan DECIMAL(18, 2) NOT NULL,
    tenSP NVARCHAR(255), -- Có thể tạo tự động từ SP và các thuộc tính
    thoiGianBaoHanh INT, -- Tính theo tháng
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    deleted BIT DEFAULT 0,
    FOREIGN KEY (san_pham_id) REFERENCES SanPham(id),
    FOREIGN KEY (ram_id) REFERENCES Ram(id),
    FOREIGN KEY (o_cung_id) REFERENCES OCung(id),
    FOREIGN KEY (mau_sac_id) REFERENCES MauSac(id),
	FOREIGN KEY (created_by) REFERENCES TaiKhoan(id),
    FOREIGN KEY (updated_by) REFERENCES TaiKhoan(id)
);
GO

-- 6. Bảng Kho IMEI (Cực kỳ quan trọng)
CREATE TABLE Imei (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ctsp_id INT NOT NULL, -- Biết IMEI này thuộc phiên bản sản phẩm nào
    soImei VARCHAR(100) NOT NULL UNIQUE,
    trangThai NVARCHAR(50) DEFAULT 'TRONG_KHO', -- TRONG_KHO, DA_BAN, LOI, DANG_BAO_HANH
    ngayNhapKho DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ctsp_id) REFERENCES CTSP(id)
);
GO

-- 7. Bảng Ảnh Sản Phẩm (1 CTSP có nhiều ảnh)
CREATE TABLE AnhSanPham (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ctsp_id INT NOT NULL,
    uri NVARCHAR(MAX) NOT NULL,
    is_default BIT DEFAULT 0, -- Ảnh đại diện
    FOREIGN KEY (ctsp_id) REFERENCES CTSP(id)
);
GO

--==============================================================
-- KHỞI TẠO CÁC BẢNG KHUYẾN MÃI
--==============================================================

-- 8. Bảng Voucher
CREATE TABLE Voucher (
    id INT IDENTITY(1,1) PRIMARY KEY,
    maVoucher VARCHAR(50) NOT NULL UNIQUE,
	tenVoucher NVARCHAR(255),
    loaiGiamGia NVARCHAR(50), -- PHAN_TRAM, SO_TIEN
    giaTriGiam DECIMAL(18, 2) NOT NULL,
    giamToiDa DECIMAL(18, 2), -- Dùng cho loại giảm theo %
    donHangToiThieu DECIMAL(18, 2),
    soLuong INT,
    ngayBatDau DATETIME2,
    ngayKetThuc DATETIME2,
	created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
	deleted BIT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES TaiKhoan(id)
);
GO

-- 9. Bảng Đợt Giảm Giá (Campaign)
CREATE TABLE GiamGia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tenDotGiamGia NVARCHAR(255) NOT NULL,
    moTa NVARCHAR(MAX),
    thoiGianBatDau DATETIME2,
    thoiGianKetThuc DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    deleted BIT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES TaiKhoan(id),
    FOREIGN KEY (updated_by) REFERENCES TaiKhoan(id)
);
GO

-- 10. Bảng Chi Tiết Áp Dụng Giảm Giá
CREATE TABLE ChiTietGiamGia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    giam_gia_id INT NOT NULL,
    ctsp_id INT NOT NULL,
    phanTramGiam DECIMAL(5, 2),
    giaSauGiam DECIMAL(18, 2),
    FOREIGN KEY (giam_gia_id) REFERENCES GiamGia(id),
    FOREIGN KEY (ctsp_id) REFERENCES CTSP(id)
);
GO


--==============================================================
-- KHỞI TẠO CÁC BẢNG BÁN HÀNG VÀ HÓA ĐƠN
--==============================================================

-- 11. Bảng Hóa Đơn
CREATE TABLE HoaDon (
    id INT IDENTITY(1,1) PRIMARY KEY,
    maHoaDon VARCHAR(50) NOT NULL UNIQUE,
    khach_hang_id INT, -- Có thể NULL cho khách vãng lai
    nhan_vien_id INT, -- Nhân viên tạo đơn
	voucher_id INT,
	loaiDon NVARCHAR(50), -- TAI_QUAY, ONLINE
	-- Lưu lại thông tin tại thời điểm mua hàng để đảm bảo tính toàn vẹn
	tenKhachHang NVARCHAR(255),
	soDienThoai VARCHAR(15),
	diaChiGiao NVARCHAR(MAX),
	phiShip DECIMAL(18, 2) DEFAULT 0,
	tongTienTruocGiam DECIMAL(18, 2),
	tongTienSauGiam DECIMAL(18, 2),
	ghiChu NVARCHAR(MAX),
    trangThai NVARCHAR(50), -- CHO_XAC_NHAN, DANG_GIAO, HOAN_THANH, HUY
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    deleted BIT DEFAULT 0,
    FOREIGN KEY (khach_hang_id) REFERENCES KhachHang(id),
    FOREIGN KEY (nhan_vien_id) REFERENCES NhanVien(id),
	FOREIGN KEY (voucher_id) REFERENCES Voucher(id),
	FOREIGN KEY (created_by) REFERENCES TaiKhoan(id),
    FOREIGN KEY (updated_by) REFERENCES TaiKhoan(id)
);
GO

-- 12. Bảng Chi Tiết Hóa Đơn
CREATE TABLE HoaDonChiTiet (
    id INT IDENTITY(1,1) PRIMARY KEY,
    hoa_don_id INT NOT NULL,
    ctsp_id INT NOT NULL,
    imei_id INT, -- Liên kết đến máy cụ thể đã bán
    soLuong INT NOT NULL DEFAULT 1,
    donGia DECIMAL(18, 2) NOT NULL, -- Giá tại thời điểm bán
    thanhTien DECIMAL(18, 2) NOT NULL,
    FOREIGN KEY (hoa_don_id) REFERENCES HoaDon(id),
    FOREIGN KEY (ctsp_id) REFERENCES CTSP(id),
    FOREIGN KEY (imei_id) REFERENCES Imei(id)
);
GO

-- 13. Bảng Thanh Toán Của Hóa Đơn (M-M)
CREATE TABLE HoaDon_ThanhToan(
	id INT IDENTITY(1,1) PRIMARY KEY,
	hoa_don_id INT NOT NULL,
	pttt_id INT NOT NULL,
	soTien DECIMAL(18,2) NOT NULL,
	maGiaoDich NVARCHAR(100),
	thoiGianThanhToan DATETIME2 DEFAULT GETDATE(),
	FOREIGN KEY (hoa_don_id) REFERENCES HoaDon(id),
    FOREIGN KEY (pttt_id) REFERENCES PhuongThucThanhToan(id)
);
GO

-- 14. Bảng Log Lịch Sử Hóa Đơn
CREATE TABLE LichSuHoaDon (
    id INT IDENTITY(1,1) PRIMARY KEY,
    hoa_don_id INT NOT NULL,
    hanh_dong_boi_id INT, -- FK đến TaiKhoan
    hanhDong NVARCHAR(255),
    moTa NVARCHAR(MAX),
    thoiGian DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (hoa_don_id) REFERENCES HoaDon(id),
    FOREIGN KEY (hanh_dong_boi_id) REFERENCES TaiKhoan(id)
);
GO


--==============================================================
-- KHỞI TẠO CÁC BẢNG TƯƠNG TÁC NGƯỜI DÙNG
--==============================================================

-- 15. Bảng Thông báo (Polymorphic)
CREATE TABLE ThongBao (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_TaiKhoan INT NOT NULL, -- Người nhận thông báo
    id_NguoiGui INT, -- Người gửi, có thể NULL nếu là hệ thống
    noiDung NVARCHAR(MAX),
    link_dieuHuong NVARCHAR(MAX),
    loaiThongBao NVARCHAR(100), -- VD: 'DON_HANG', 'KHUYEN_MAI'
    trangThaiDoc BIT DEFAULT 0,
    -- Cặp đôi Polymorphic để liên kết đến bất kỳ đối tượng nào
    doi_tuong_lien_quan_id INT,
    doi_tuong_lien_quan_type NVARCHAR(100), -- VD: 'HoaDon', 'CTSP', 'BaoHanh'
    thoiGianTao DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (id_TaiKhoan) REFERENCES TaiKhoan(id),
    FOREIGN KEY (id_NguoiGui) REFERENCES TaiKhoan(id)
);
GO

-- 16. Bảng Cuộc Hội Thoại (Phòng Chat)
CREATE TABLE CuocHoiThoai (
    id INT IDENTITY(1,1) PRIMARY KEY,
    khach_hang_id INT NOT NULL,
    nhan_vien_id INT, -- Có thể NULL lúc đầu
    tieuDe NVARCHAR(255),
    trangThai NVARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2, -- Thời gian của tin nhắn cuối
	FOREIGN KEY (khach_hang_id) REFERENCES KhachHang(id),
	FOREIGN KEY (nhan_vien_id) REFERENCES NhanVien(id)
);
GO

-- 17. Bảng Message (Tin nhắn)
CREATE TABLE Message (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cuoc_hoi_thoai_id INT NOT NULL,
    nguoi_gui_id INT NOT NULL, -- Trỏ đến TaiKhoan
    noiDung NVARCHAR(MAX),
    loaiNoiDung NVARCHAR(50) DEFAULT 'TEXT', -- TEXT, IMAGE
    thoiGianGui DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (cuoc_hoi_thoai_id) REFERENCES CuocHoiThoai(id),
    FOREIGN KEY (nguoi_gui_id) REFERENCES TaiKhoan(id)
);
GO

-- 18. Bảng Đánh giá sản phẩm
CREATE TABLE DanhGia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ctsp_id INT NOT NULL,
    tai_khoan_id INT NOT NULL, -- Người đánh giá
    hoa_don_chi_tiet_id INT, -- Để đảm bảo khách đã mua hàng mới được đánh giá
    sao INT CHECK (sao BETWEEN 1 AND 5),
    noiDung NVARCHAR(MAX),
    thoiGianTao DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ctsp_id) REFERENCES CTSP(id),
    FOREIGN KEY (tai_khoan_id) REFERENCES TaiKhoan(id),
    FOREIGN KEY (hoa_don_chi_tiet_id) REFERENCES HoaDonChiTiet(id)
);
GO


--==============================================================
-- KHỞI TẠO CÁC BẢNG BẢO HÀNH VÀ TRẢ HÀNG
--==============================================================

-- 19. Bảng Bảo Hành
CREATE TABLE BaoHanh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    imei_id INT NOT NULL, -- Bảo hành cho máy cụ thể nào
    ngayBatDau DATE,
    ngayKetThuc DATE,
    moTa NVARCHAR(MAX),
    trangThai NVARCHAR(50),
    FOREIGN KEY (imei_id) REFERENCES Imei(id)
);
GO

-- 20. Bảng Chi Tiết Bảo Hành (Lịch sử các lần sửa)
CREATE TABLE CTBaoHanh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bao_hanh_id INT NOT NULL,
    ngaySuaChua DATE,
    chiPhi DECIMAL(18, 2),
    phuongThucSuaChua NVARCHAR(MAX),
    ghiChuNhanVien NVARCHAR(MAX),
    FOREIGN KEY (bao_hanh_id) REFERENCES BaoHanh(id)
);
GO

-- 21. Bảng Trả Hàng
CREATE TABLE TraHang (
	id INT IDENTITY(1,1) PRIMARY KEY,
	hoa_don_id INT NOT NULL,
	lyDoTraHang NVARCHAR(MAX),
	trangThai NVARCHAR(50), -- DANG_CHO_DUYET, DA_DUYET, TU_CHOI
	ngayTao DATETIME2 DEFAULT GETDATE(),
	nguoiXuLy_id INT, -- NhanVien
	FOREIGN KEY (hoa_don_id) REFERENCES HoaDon(id),
	FOREIGN KEY (nguoiXuLy_id) REFERENCES NhanVien(id)
);
GO

-- 22. Bảng Chi Tiết Trả Hàng
CREATE TABLE TraHangChiTiet (
	id INT IDENTITY(1,1) PRIMARY KEY,
	tra_hang_id INT NOT NULL,
	ctsp_id INT NOT NULL,
	imei_id INT, -- Máy cụ thể bị trả
	soLuong INT,
	tinhTrangLucTra NVARCHAR(MAX),
	FOREIGN KEY (tra_hang_id) REFERENCES TraHang(id),
	FOREIGN KEY (ctsp_id) REFERENCES CTSP(id),
	FOREIGN KEY (imei_id) REFERENCES Imei(id)
);
GO
--updatw 9-7
ALTER TABLE SanPham ADD maSanPham VARCHAR(20) NULL;


UPDATE SanPham
SET maSanPham = 'SP' + CAST(id AS VARCHAR(10))ALTER TABLE CTSP  ADD maCTSP VARCHAR(50) NULL;; -- ví dụ đơn giản

-- 3. Đổi sang NOT NULL nếu cần
ALTER TABLE SanPham
ALTER COLUMN maSanPham VARCHAR(20) NOT NULL;



--trigger tạo tên sp cho san pham chi tiet
CREATE TRIGGER trg_AutoSetTenSP
ON CTSP
AFTER INSERT
AS
BEGIN
    UPDATE c
    SET tenSP = 
        sp.tenSanPham + N' - ' +
        r.dungLuong + N'/' +
        o.tenOCung + N'/' +
        m.tenMau
    FROM CTSP c
    INNER JOIN inserted i ON c.id = i.id
    LEFT JOIN SanPham sp ON c.san_pham_id = sp.id
    LEFT JOIN Ram r ON c.ram_id = r.id
    LEFT JOIN OCung o ON c.o_cung_id = o.id
    LEFT JOIN MauSac m ON c.mau_sac_id = m.id
END
---trigger tự động update created_at

CREATE TRIGGER trg_SetNgayNhapKhoOnInsert
ON Imei
AFTER INSERT
AS
BEGIN
    UPDATE I
    SET ngayNhapKho = GETDATE()
    FROM Imei I
    INNER JOIN inserted ins ON I.id = ins.id
    WHERE ins.ngayNhapKho IS NULL
END

ALTER TABLE SanPham ADD anhDaiDien NVARCHAR(MAX) NULL;