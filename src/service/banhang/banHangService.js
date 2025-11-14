import axiosInstance from '../axiosInstance'
import {
  searchSanPhamChiTiet,
  getAllSanPhamChiTiet,
  searchByMaOrTen,
} from '../sanpham/SanPhamService'

const API_BASE = '/api/v1/ban-hang'

/**
 * Service quản lý API bán hàng tại quầy
 */

/**
 * Tạo hóa đơn chờ mới
 * @param {Object} payload - { nhanVienId: UUID, khachHangId: UUID (optional) }
 * @returns {Promise}
 */
export const taoHoaDonChoMoi = async (payload) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/hoa-don/tao-moi`, payload)
    return response.data
  } catch (error) {
    console.error('Lỗi khi tạo hóa đơn:', error)
    throw error
  }
}

/**
 * Thêm sản phẩm vào hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { chiTietSanPhamId: UUID, soLuong: Number }
 * @returns {Promise}
 */
export const themSanPhamVaoHoaDon = async (idHoaDon, payload) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE}/hoa-don/${idHoaDon}/them-san-pham`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error)
    throw error
  }
}

/**
 * Xóa sản phẩm khỏi hóa đơn
 * @param {String} idHoaDonChiTiet - UUID của hóa đơn chi tiết
 * @returns {Promise}
 */
export const xoaSanPhamKhoiHoaDon = async (idHoaDonChiTiet) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE}/hoa-don/xoa-san-pham/${idHoaDonChiTiet}`,
    )
    return response.data
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error)
    throw error
  }
}

/**
 * Lấy danh sách Serial khả dụng theo Chi tiết sản phẩm
 * @param {String} ctspId - UUID của chi tiết sản phẩm
 * @returns {Promise}
 */
export const layDanhSachSerialKhaDung = async (ctspId) => {
  try {
    console.log('📦 Lấy danh sách serial khả dụng cho CTSP:', ctspId)
    const response = await axiosInstance.get(`/api/serial/ctsp/${ctspId}`)
    console.log('✅ Đã lấy', response.data?.length || 0, 'serial')
    return response.data
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách serial:', error)
    throw error
  }
}

/**
 * Xác thực Serial Number trước khi thanh toán
 * @param {Object} serialData - { idHoaDon, idChiTietSanPham, serialNumber }
 * @returns {Promise}
 */
export const xacThucSerial = async (serialData) => {
  try {
    console.log('  Kiểm tra serial:', serialData)
    const response = await axiosInstance.post(`${API_BASE}/hoa-don/xac-thuc-serial`, serialData)
    console.log('Đã xác thực serial:', response.data)
    return response.data
  } catch (error) {
    console.error('Lỗi xác thực serial:', error)
    throw error
  }
}

/**
 * Thanh toán hóa đơn (với Serial Numbers)
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - {
 *   idPhuongThucThanhToan: UUID,
 *   soTienThanhToan: Number,
 *   ghiChu: String,
 *   maGiaoDich: String,
 *   serialNumbers: [{ idHoaDonChiTiet, idChiTietSanPham, serialNumber }]
 * }
 * @returns {Promise}
 */
export const thanhToanHoaDon = async (idHoaDon, payload) => {
  try {
    console.log('Thanh toán hóa đơn:', {
      idHoaDon,
      serialCount: payload.serialNumbers?.length || 0,
    })
    const response = await axiosInstance.post(`${API_BASE}/hoa-don/${idHoaDon}/thanh-toan`, payload)
    console.log('Thanh toán thành công')
    return response.data
  } catch (error) {
    console.error(' Lỗi khi thanh toán:', error)
    throw error
  }
}

/**
 * Tìm kiếm sản phẩm (Chi tiết sản phẩm - để bán hàng)
 * Tái sử dụng API từ SanPhamService
 * @param {Object} params - { keyword: String, page: Number, size: Number }
 * @returns {Promise}
 */
export const timKiemSanPham = async (params = {}) => {
  try {
    console.log(' Tìm kiếm sản phẩm với params:', params)

    // Ưu tiên sử dụng searchSanPhamChiTiet (tìm kiếm chi tiết sản phẩm)
    // Vì bán hàng cần: giá bán, tồn kho, thông tin chi tiết
    const response = await searchSanPhamChiTiet(params)

    console.log(' Kết quả tìm kiếm:', {
      hasData: !!response?.data,
      isArray: Array.isArray(response?.data),
      count: Array.isArray(response?.data) ? response.data.length : 0,
    })

    return response
  } catch (error) {
    console.error(' Lỗi khi tìm kiếm sản phẩm:', error)

    // Fallback: Nếu search chi tiết không hoạt động, thử tìm theo mã/tên
    if (params.keyword) {
      console.log(' Thử tìm kiếm theo mã/tên...')
      try {
        const fallbackResponse = await searchByMaOrTen(params.keyword)
        console.log('Fallback thành công')
        return fallbackResponse
      } catch (fallbackError) {
        console.error(' Fallback cũng thất bại:', fallbackError)
      }
    }

    throw error
  }
}

/**
 * Lấy tất cả sản phẩm còn hàng (có sẵn để bán)
 * Tái sử dụng API từ SanPhamService
 * @returns {Promise}
 */
export const layDanhSachSanPham = async () => {
  try {
    console.log('📦 Lấy danh sách tất cả sản phẩm...')
    const response = await getAllSanPhamChiTiet()
    console.log('✅ Đã lấy danh sách sản phẩm')
    return response
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách sản phẩm:', error)
    throw error
  }
}

/**
 * Lấy danh sách sản phẩm còn hàng (trangThai = 1 và tồn kho > 0)
 * @param {Object} params - { page: Number, size: Number }
 * @returns {Promise}
 */
export const laySanPhamConHang = async (params = {}) => {
  try {
    console.log('📦 Lấy danh sách sản phẩm còn hàng...')
    const { page = 0, size = 20 } = params

    // Sử dụng API search ChiTietSanPham thay vì SanPham
    // Vì ChiTietSanPham mới có thông tin giá, tồn kho, serial
    const response = await axiosInstance.get('/api/chi-tiet-san-pham/page', {
      params: {
        page,
        size,
        sort: 'ngayTao,desc', // Sắp xếp theo ngày tạo mới nhất
      },
    })

    // Lọc ra các CTSP còn hàng (trangThai = 1 và soLuongTon > 0)
    if (response.data && response.data.content) {
      const conHang = response.data.content.filter(
        (ctsp) => ctsp.trangThai === 1 && (ctsp.soLuongTon > 0 || ctsp.soLuongTon === undefined),
      )
      response.data.content = conHang
      response.data.totalElements = conHang.length
    }

    console.log('✅ Đã lấy', response.data?.content?.length || 0, 'sản phẩm còn hàng')
    return response
  } catch (error) {
    console.error('❌ Lỗi khi lấy sản phẩm còn hàng:', error)
    throw error
  }
}

/**
 * Tìm kiếm sản phẩm với filter nâng cao
 * @param {Object} filters - { keyword, minPrice, maxPrice, coSanTon, page, size }
 * @returns {Promise}
 */
export const timKiemSanPhamNangCao = async (filters = {}) => {
  try {
    console.log(' Tìm kiếm nâng cao với filters:', filters)

    // Build params object
    const params = {}

    if (filters.keyword) params.keyword = filters.keyword
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.coSanTon) params.coSanTon = filters.coSanTon
    if (filters.page !== undefined) params.page = filters.page
    if (filters.size) params.size = filters.size

    const response = await searchSanPhamChiTiet(params)
    console.log('✅ [BanHangService] Tìm kiếm nâng cao thành công')
    return response
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi tìm kiếm nâng cao:', error)
    throw error
  }
}

/**
 * Tìm kiếm khách hàng (dùng cho bán hàng)
 * @param {Object} params - { keyword: String, page: Number, size: Number }
 * @returns {Promise}
 */
export const timKiemKhachHang = async (params = {}) => {
  try {
    console.log('🔍 [BanHangService] Tìm kiếm khách hàng:', params)

    // Tìm theo tên hoặc SĐT
    const response = await axiosInstance.get('/api/khach-hang/tim-kiem', {
      params: {
        ten: params.keyword || null,
        sdt: params.keyword || null,
      },
    })

    console.log('✅ [BanHangService] Kết quả tìm kiếm:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi khi tìm kiếm khách hàng:', error)
    throw error
  }
}

/**
 * Lấy danh sách phương thức thanh toán
 * @returns {Promise}
 */
export const layDanhSachPhuongThucThanhToan = async () => {
  try {
    console.log('📋 [BanHangService] Lấy danh sách phương thức thanh toán...')
    const response = await axiosInstance.get('/api/phuong-thuc-thanh-toan')
    console.log('✅ [BanHangService] Response:', response.data)

    // Parse response: có thể là { data: [...] } hoặc trực tiếp [...]
    const danhSach = response.data?.data || response.data || []
    console.log('✅ [BanHangService] Danh sách phương thức thanh toán:', danhSach)

    return danhSach
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi khi lấy danh sách phương thức thanh toán:', error)
    console.error('⚠️ [BanHangService] Vui lòng tạo dữ liệu phương thức thanh toán trong database!')

    // Trả về mảng rỗng thay vì fake data
    return []
  }
}

/**
 * Lấy danh sách nhân viên (để lấy UUID nhân viên đầu tiên)
 * @returns {Promise}
 */
export const layDanhSachNhanVien = async () => {
  try {
    const response = await axiosInstance.get('/api/nhan-vien/hien-thi-nv')
    return response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error)
    throw error
  }
}

/**
 * Lấy thông tin hóa đơn theo ID
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const layThongTinHoaDon = async (idHoaDon) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/hoa-don/${idHoaDon}`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi lấy thông tin hóa đơn:', error)
    throw error
  }
}

/**
 * Lấy danh sách hóa đơn chờ của nhân viên
 * @param {String} nhanVienId - UUID của nhân viên
 * @returns {Promise}
 */
export const layDanhSachHoaDonCho = async (nhanVienId) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/hoa-don/cho`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hóa đơn chờ:', error)
    throw error
  }
}

/**
 * Hủy/Xóa hóa đơn chờ
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const huyHoaDon = async (idHoaDon) => {
  try {
    console.log('🗑️ [BanHangService] Xóa hóa đơn chờ:', idHoaDon)
    const response = await axiosInstance.delete(`${API_BASE}/hoa-don/${idHoaDon}`)
    console.log('✅ [BanHangService] Xóa hóa đơn thành công')
    return response.data
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi khi xóa hóa đơn:', error)
    throw error
  }
}

// Alias cho rõ ràng hơn
export const xoaHoaDonCho = huyHoaDon

/**
 * Cập nhật số lượng sản phẩm trong hóa đơn
 * @param {String} idHoaDonChiTiet - UUID của hóa đơn chi tiết
 * @param {Object} payload - { soLuong: Number }
 * @returns {Promise}
 */
export const capNhatSoLuongSanPham = async (idHoaDonChiTiet, payload) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE}/hoa-don/cap-nhat-so-luong/${idHoaDonChiTiet}`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng:', error)
    throw error
  }
}

/**
 * Tạo khách hàng mới (dùng cho bán hàng)
 * @param {Object} payload - { hoTen: String, soDienThoai: String, email: String, diaChi: String }
 * @returns {Promise}
 */
export const taoKhachHangMoi = async (payload) => {
  try {
    console.log('➕ [BanHangService] Tạo khách hàng mới:', payload)

    const response = await axiosInstance.post('/api/khach-hang/add-khach-hang', payload)

    console.log('✅ [BanHangService] Tạo khách hàng thành công:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi khi tạo khách hàng:', error)
    throw error
  }
}

/**
 * Lấy danh sách tất cả khách hàng
 * @returns {Promise}
 */
export const layDanhSachKhachHang = async () => {
  try {
    console.log('📋 [BanHangService] Lấy danh sách khách hàng...')
    const response = await axiosInstance.get('/api/khach-hang/hien-thi')
    console.log('✅ [BanHangService] Danh sách khách hàng:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi khi lấy danh sách khách hàng:', error)
    throw error
  }
}

/**
 * Cập nhật khách hàng cho hóa đơn- Thêm ID Khách Hàng
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { khachHangId: UUID }
 * @returns {Promise}
 */
export const capNhatKhachHang = async (idHoaDon, payload) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/hoa-don/${idHoaDon}/khach-hang`, payload)
    return response.data
  } catch (error) {
    console.error('Lỗi khi cập nhật khách hàng:', error)
    throw error
  }
}

/**
 * Lấy danh sách gợi ý voucher cho hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const layGoiYVoucher = async (idHoaDon) => {
  try {
    console.log('🎟️ [BanHangService] Lấy gợi ý voucher cho hóa đơn:', idHoaDon)
    const response = await axiosInstance.get(`${API_BASE}/hoa-don/${idHoaDon}/goi-y-voucher`)
    console.log('✅ [BanHangService] Danh sách voucher gợi ý:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi khi lấy gợi ý voucher:', error)
    throw error
  }
}

/**
 * Áp dụng voucher/phiếu giảm giá vào hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { idPhieuGiamGia: UUID }
 * @returns {Promise}
 */
export const apDungVoucher = async (idHoaDon, payload) => {
  try {
    console.log('🎟️ [BanHangService] Áp dụng voucher:', { idHoaDon, payload })
    const response = await axiosInstance.post(
      `${API_BASE}/hoa-don/${idHoaDon}/ap-dung-voucher`,
      payload,
    )
    console.log('✅ [BanHangService] Áp dụng voucher thành công')
    return response.data
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi khi áp dụng voucher:', error)
    throw error
  }
}

/**
 * Xóa voucher khỏi hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const xoaVoucher = async (idHoaDon) => {
  try {
    console.log('🗑️ [BanHangService] Xóa voucher khỏi hóa đơn:', idHoaDon)
    const response = await axiosInstance.delete(`${API_BASE}/hoa-don/${idHoaDon}/voucher`)
    console.log('✅ [BanHangService] Xóa voucher thành công')
    return response.data
  } catch (error) {
    console.error('❌ [BanHangService] Lỗi khi xóa voucher:', error)
    throw error
  }
}

/**
 * Hủy voucher đã áp dụng
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const huyVoucher = async (idHoaDon) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE}/hoa-don/${idHoaDon}/huy-voucher`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi hủy voucher:', error)
    throw error
  }
}

/**
 * Sử dụng điểm tích lũy
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { diemSuDung: Number }
 * @returns {Promise}
 */
export const suDungDiemTichLuy = async (idHoaDon, payload) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE}/hoa-don/${idHoaDon}/su-dung-diem`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('Lỗi khi sử dụng điểm tích lũy:', error)
    throw error
  }
}

/**
 * Tìm sản phẩm theo IMEI/Serial
 * @param {String} imei - Mã IMEI hoặc Serial
 * @returns {Promise}
 */
export const timSanPhamTheoIMEI = async (imei) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/san-pham/imei/${imei}`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi tìm sản phẩm theo IMEI:', error)
    throw error
  }
}

/**
 * Kiểm tra tồn kho sản phẩm
 * @param {String} chiTietSanPhamId - UUID của chi tiết sản phẩm
 * @returns {Promise}
 */
export const kiemTraTonKho = async (chiTietSanPhamId) => {
  try {
    const response = await axiosInstance.get(`/api/chi-tiet-san-pham/${chiTietSanPhamId}/ton-kho`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi kiểm tra tồn kho:', error)
    throw error
  }
}

/**
 * In hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const inHoaDon = async (idHoaDon) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/hoa-don/${idHoaDon}/in`, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('Lỗi khi in hóa đơn:', error)
    throw error
  }
}
