import axiosInstance from '../common/axiosInstance'
import {
    searchSanPhamChiTiet,
    getAllSanPhamChiTiet,
    searchByMaOrTen,
} from '../sanpham/SanPhamService'

/**
 * ========================================
 * SERVICE QUẢN LÝ SẢN PHẨM BÁN HÀNG
 * ========================================
 */

/**
 * Tìm kiếm sản phẩm (KÈM THEO danh sách biến thể - để bán hàng)
 * 
 * Response structure:
 * {
 *   content: [
 *     {
 *       id: UUID,
 *       maSanPham: String,
 *       tenSanPham: String,
 *       trangThai: 1,
 *       chiTietSanPhams: [ // ← Danh sách biến thể
 *         { id, maCtsp, tenSanPham, tenCpu, tenRam, giaBan, soLuongTon, ... }
 *       ]
 *     }
 *   ]
 * }
 * 
 * @param {Object} params - { keyword: String, page: Number, size: Number }
 * @returns {Promise}
 */
export const timKiemSanPham = async (params = {}) => {
    try {
        console.log('🔍 [SanPhamBanHangService] Tìm kiếm sản phẩm với params:', params)
        const { keyword = '', page = 0, size = 20 } = params

        // Sử dụng API mới: /api/san-pham/ban-hang/tim-kiem
        // API này trả về SẢN PHẨM CHA kèm danh sách CHI TIẾT BIẾN THỂ
        const response = await axiosInstance.get('/api/san-pham/ban-hang/tim-kiem', {
            params: {
                keyword: keyword || null,
                page,
                size,
                sort: 'ngayTao,desc',
            },
        })

        console.log('✅ [SanPhamBanHangService] Tìm thấy', response.data?.content?.length || 0, 'sản phẩm')
        console.log('📊 [SanPhamBanHangService] Sample result:', response.data?.content?.[0])

        return response
    } catch (error) {
        console.error('❌ [SanPhamBanHangService] Lỗi khi tìm kiếm sản phẩm:', error)

        // Fallback: Sử dụng API cũ nếu API mới chưa hoạt động
        if (params.keyword) {
            console.log('⚠️ [SanPhamBanHangService] Thử fallback với API cũ...')
            try {
                const fallbackResponse = await searchSanPhamChiTiet(params)
                console.log('✅ [SanPhamBanHangService] Fallback thành công')
                return fallbackResponse
            } catch (fallbackError) {
                console.error('❌ [SanPhamBanHangService] Fallback thất bại:', fallbackError)
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
 * KÈM THEO danh sách chi tiết biến thể
 * 
 * Response structure:
 * {
 *   content: [
 *     {
 *       id: UUID,
 *       maSanPham: String,
 *       tenSanPham: String,
 *       trangThai: 1,
 *       chiTietSanPhams: [ // ← Danh sách biến thể
 *         { id, maCtsp, tenCpu, tenRam, giaBan, soLuongTon, ... },
 *         { id, maCtsp, tenCpu, tenRam, giaBan, soLuongTon, ... }
 *       ]
 *     }
 *   ],
 *   totalElements: Number,
 *   totalPages: Number
 * }
 * 
 * @param {Object} params - { page: Number, size: Number }
 * @returns {Promise}
 */
export const laySanPhamConHang = async (params = {}) => {
    try {
        console.log('📦 [SanPhamBanHangService] Lấy danh sách sản phẩm còn hàng (kèm biến thể)...')
        const { page = 0, size = 20 } = params

        // Sử dụng API mới: /api/san-pham/ban-hang/con-hang
        // API này trả về SẢN PHẨM CHA kèm danh sách CHI TIẾT BIẾN THỂ
        const response = await axiosInstance.get('/api/san-pham/ban-hang/con-hang', {
            params: {
                page,
                size,
                sort: 'ngayTao,desc',
            },
        })

        console.log('✅ [SanPhamBanHangService] Đã lấy', response.data?.content?.length || 0, 'sản phẩm còn hàng')
        console.log('📊 [SanPhamBanHangService] Sample product:', response.data?.content?.[0])

        return response
    } catch (error) {
        console.error('❌ [SanPhamBanHangService] Lỗi khi lấy sản phẩm còn hàng:', error)
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
        console.log('🔍 Tìm kiếm nâng cao với filters:', filters)

        // Build params object
        const params = {}

        if (filters.keyword) params.keyword = filters.keyword
        if (filters.minPrice) params.minPrice = filters.minPrice
        if (filters.maxPrice) params.maxPrice = filters.maxPrice
        if (filters.coSanTon) params.coSanTon = filters.coSanTon
        if (filters.page !== undefined) params.page = filters.page
        if (filters.size) params.size = filters.size

        const response = await searchSanPhamChiTiet(params)
        console.log('✅ Tìm kiếm nâng cao thành công')
        return response
    } catch (error) {
        console.error('❌ Lỗi tìm kiếm nâng cao:', error)
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

