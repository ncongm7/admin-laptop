import axiosInstance from './axiosInstance'

const API_BASE = '/api/v1/hoa-don'

/**
 * Service quản lý hóa đơn
 */

/**
 * Lấy danh sách hóa đơn (có phân trang, tìm kiếm, lọc)
 * @param {Object} params - {
 *   page: number,
 *   size: number,
 *   keyword: string,
 *   trangThai: number (0-4),
 *   loaiHoaDon: number (0: Tại quầy, 1: Online),
 *   trangThaiThanhToan: number (0: Chưa, 1: Đã),
 *   startDate: string (yyyy-MM-dd),
 *   endDate: string (yyyy-MM-dd)
 * }
 * @returns {Promise}
 */
export const getHoaDons = async (params = {}) => {
    try {
        console.log('📋 [HoaDonService] Lấy danh sách hóa đơn:', params)

        const response = await axiosInstance.get(API_BASE, { params })

        console.log('✅ [HoaDonService] Response:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi lấy danh sách hóa đơn:', error)
        throw error
    }
}

/**
 * Lấy chi tiết một hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const getHoaDonDetail = async (idHoaDon) => {
    try {
        console.log('🔍 [HoaDonService] Lấy chi tiết hóa đơn:', idHoaDon)

        const response = await axiosInstance.get(`${API_BASE}/${idHoaDon}`)

        console.log('✅ [HoaDonService] Chi tiết hóa đơn:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi lấy chi tiết hóa đơn:', error)
        throw error
    }
}

/**
 * Lấy chi tiết hóa đơn theo mã (code)
 * @param {String} code - Mã hóa đơn (VD: HD-20241201-0001)
 * @returns {Promise}
 */
export const getHoaDonDetailByCode = async (code) => {
    try {
        console.log('🔍 [HoaDonService] Lấy chi tiết hóa đơn theo mã:', code)

        const response = await axiosInstance.get(`${API_BASE}/by-code/${code}`)

        console.log('✅ [HoaDonService] Chi tiết hóa đơn:', response.data)
        return response.data
    } catch (error) {
        // Nếu endpoint by-code chưa có, thử tìm trong danh sách
        if (error.response?.status === 404) {
            console.warn('⚠️ [HoaDonService] Endpoint by-code chưa có, thử tìm trong danh sách')
            try {
                const listResponse = await axiosInstance.get(API_BASE, {
                    params: { keyword: code, size: 1 }
                })
                const hoaDons = listResponse.data?.content || listResponse.data?.data || []
                if (hoaDons.length > 0) {
                    const foundInvoice = hoaDons.find(hd => hd.ma === code)
                    if (foundInvoice) {
                        return { data: foundInvoice }
                    }
                }
            } catch (searchError) {
                console.error('❌ [HoaDonService] Lỗi khi tìm kiếm:', searchError)
            }
        }
        console.error('❌ [HoaDonService] Lỗi khi lấy chi tiết hóa đơn theo mã:', error)
        throw error
    }
}

/**
 * Lấy số lượng hóa đơn theo trạng thái
 * @returns {Promise} { total, CHO_THANH_TOAN, DA_THANH_TOAN, DA_HUY, DANG_GIAO, HOAN_THANH }
 */
export const getHoaDonStatusCounts = async () => {
    try {
        console.log('📊 [HoaDonService] Lấy số lượng hóa đơn theo trạng thái')
        
        const response = await axiosInstance.get(`${API_BASE}/status-counts`)
        
        // Extract data từ ResponseObject nếu có
        const data = response.data?.data || response.data
        
        console.log('✅ [HoaDonService] Status counts:', data)
        return data
    } catch (error) {
        // Nếu API chưa có hoặc lỗi, fallback về null để dùng client-side
        if (error.response?.status === 404 || error.response?.status === 500) {
            console.warn('⚠️ [HoaDonService] API status-counts chưa có hoặc lỗi, dùng client-side calculation')
            return null
        }
        console.error('❌ [HoaDonService] Lỗi khi lấy status counts:', error)
        // Vẫn return null để không break UI
        return null
    }
}

/**
 * Lấy thống kê hóa đơn (doanh thu, số đơn, top products, etc.)
 * @param {Object} params - { startDate: string, endDate: string, period: string }
 * @returns {Promise} { stats: {...}, topProducts: [...], hourlyRevenue: [...] }
 */
export const getInvoiceStats = async (params = {}) => {
    try {
        console.log('📊 [HoaDonService] Lấy thống kê hóa đơn:', params)
        
        const response = await axiosInstance.get(`${API_BASE}/stats`, { params })
        
        console.log('✅ [HoaDonService] Stats:', response.data)
        return response.data
    } catch (error) {
        // Nếu API chưa có, fallback về null để component dùng mock data
        if (error.response?.status === 404) {
            console.warn('⚠️ [HoaDonService] API stats chưa có, component sẽ dùng mock data')
            return null
        }
        console.error('❌ [HoaDonService] Lỗi khi lấy stats:', error)
        throw error
    }
}

/**
 * Xác nhận đơn hàng online
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {String} nhanVienId - UUID của nhân viên (optional)
 * @returns {Promise}
 */
export const xacNhanDonHang = async (idHoaDon, nhanVienId = null) => {
    try {
        console.log('✅ [HoaDonService] Xác nhận đơn hàng:', idHoaDon)

        const params = nhanVienId ? { nhanVienId } : {}
        const response = await axiosInstance.put(`${API_BASE}/${idHoaDon}/xac-nhan`, null, { params })

        console.log('✅ [HoaDonService] Xác nhận đơn hàng thành công:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi xác nhận đơn hàng:', error)
        throw error
    }
}

/**
 * Hủy đơn hàng online
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {String} nhanVienId - UUID của nhân viên (optional)
 * @returns {Promise}
 */
export const huyDonHang = async (idHoaDon, nhanVienId = null) => {
    try {
        console.log('🚫 [HoaDonService] Hủy đơn hàng:', idHoaDon)

        const params = nhanVienId ? { nhanVienId } : {}
        const response = await axiosInstance.put(`${API_BASE}/${idHoaDon}/huy`, null, { params })

        console.log('✅ [HoaDonService] Hủy đơn hàng thành công:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi hủy đơn hàng:', error)
        throw error
    }
}

/**
 * Gửi email hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} options - { email: string, subject: string, message: string }
 * @returns {Promise}
 */
export const sendInvoiceEmail = async (idHoaDon, options = {}) => {
    try {
        console.log('📧 [HoaDonService] Gửi email hóa đơn:', idHoaDon, options)

        const response = await axiosInstance.post(`${API_BASE}/${idHoaDon}/send-email`, options)

        console.log('✅ [HoaDonService] Gửi email thành công:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi gửi email hóa đơn:', error)
        throw error
    }
}

/**
 * Sao chép hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const copyInvoice = async (idHoaDon) => {
    try {
        console.log('📋 [HoaDonService] Sao chép hóa đơn:', idHoaDon)

        const response = await axiosInstance.post(`${API_BASE}/${idHoaDon}/copy`)

        console.log('✅ [HoaDonService] Sao chép hóa đơn thành công:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi sao chép hóa đơn:', error)
        throw error
    }
}

/**
 * Cập nhật trạng thái hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Number} trangThai - Trạng thái mới (0-4)
 * @returns {Promise}
 */
export const capNhatTrangThai = async (idHoaDon, trangThai) => {
    try {
        console.log('🔄 [HoaDonService] Cập nhật trạng thái hóa đơn:', idHoaDon, '->', trangThai)

        const response = await axiosInstance.put(`${API_BASE}/${idHoaDon}/status`, null, {
            params: { trangThai }
        })

        console.log('✅ [HoaDonService] Cập nhật trạng thái thành công:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi cập nhật trạng thái:', error)
        throw error
    }
}

/**
 * Cập nhật thông tin hóa đơn (ghi chú, địa chỉ, trạng thái)
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} data - { ghiChu?: string, diaChiGiaoHang?: string, trangThai?: number }
 * @returns {Promise}
 */
export const capNhatHoaDon = async (idHoaDon, data = {}) => {
    try {
        console.log('📝 [HoaDonService] Cập nhật hóa đơn:', idHoaDon, data)

        // Nếu có trạng thái, cập nhật trạng thái trước
        if (data.trangThai !== undefined && data.trangThai !== null) {
            await capNhatTrangThai(idHoaDon, data.trangThai)
        }

        // Cập nhật các thông tin khác (ghi chú, địa chỉ)
        // TODO: Backend cần tạo endpoint PUT /api/v1/hoa-don/{idHoaDon} để cập nhật
        // Tạm thời chỉ cập nhật trạng thái, các field khác sẽ được cập nhật sau
        const updateData = {}
        if (data.ghiChu !== undefined) updateData.ghiChu = data.ghiChu
        if (data.diaChiGiaoHang !== undefined) updateData.diaChi = data.diaChiGiaoHang

        // Nếu có dữ liệu cần cập nhật (ngoài trạng thái)
        if (Object.keys(updateData).length > 0) {
            // Tạm thời dùng endpoint status với body (nếu backend hỗ trợ)
            // Hoặc tạo endpoint riêng
            try {
                const response = await axiosInstance.put(`${API_BASE}/${idHoaDon}`, updateData)
                console.log('✅ [HoaDonService] Cập nhật hóa đơn thành công:', response.data)
                return response.data
            } catch (error) {
                // Nếu endpoint chưa có, chỉ log warning và lấy lại chi tiết
                if (error.response?.status === 404 || error.response?.status === 405) {
                    console.warn('⚠️ [HoaDonService] Endpoint cập nhật hóa đơn chưa có, chỉ cập nhật trạng thái')
                } else {
                    throw error
                }
            }
        }

        // Lấy lại chi tiết hóa đơn sau khi cập nhật
        return await getHoaDonDetail(idHoaDon)
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi cập nhật hóa đơn:', error)
        throw error
    }
}

/**
 * Lấy danh sách đơn hàng online chờ xác nhận
 * @returns {Promise<Array>} Danh sách đơn hàng
 */
export const getPendingOnlineOrders = async () => {
    try {
        console.log('📋 [HoaDonService] Lấy danh sách đơn hàng online chờ xác nhận')
        
        // Ưu tiên dùng endpoint mới
        const response = await axiosInstance.get(`${API_BASE}/pending-online`)
        
        // Extract data từ ResponseObject - xử lý nhiều format
        let data = response.data
        if (data?.data) {
            // Format: { data: [...], message: "..." }
            data = data.data
        } else if (data?.content) {
            // Format: { content: [...], totalElements: ... }
            data = data.content
        } else if (Array.isArray(data)) {
            // Format: [...]
            data = data
        } else {
            // Không có data
            data = []
        }
        
        console.log('✅ [HoaDonService] Pending online orders:', data)
        console.log('📊 [HoaDonService] Số lượng đơn hàng:', Array.isArray(data) ? data.length : 0)
        return data
    } catch (error) {
        // Fallback: Dùng getHoaDons với filter
        if (error.response?.status === 404) {
            console.warn('⚠️ [HoaDonService] API pending-online chưa có, dùng fallback')
            try {
                const fallbackResponse = await axiosInstance.get(API_BASE, {
                    params: {
                        loaiHoaDon: 1, // Online
                        trangThai: 0,  // Chờ xác nhận
                        size: 50,
                        sort: 'ngayTao,desc'
                    }
                })
                // Trả về format giống endpoint mới
                const content = fallbackResponse.data?.content || fallbackResponse.data?.data || []
                const formatted = content.map(hd => ({
                    id: hd.id,
                    ma: hd.ma,
                    tenKhachHang: hd.tenKhachHang || hd.ten_khach_hang,
                    ngayTao: hd.ngayTao || hd.ngay_tao,
                    tongTienSauGiam: hd.tongTienSauGiam || hd.tong_tien_sau_giam
                }))
                console.log('✅ [HoaDonService] Fallback data:', formatted)
                return formatted
            } catch (fallbackError) {
                console.error('❌ [HoaDonService] Lỗi khi dùng fallback:', fallbackError)
                throw fallbackError
            }
        }
        console.error('❌ [HoaDonService] Lỗi khi lấy pending online orders:', error)
        throw error
    }
}

export default {
    getHoaDons,
    getHoaDonDetail,
    getHoaDonDetailByCode,
    getHoaDonStatusCounts,
    getInvoiceStats,
    xacNhanDonHang,
    huyDonHang,
    sendInvoiceEmail,
    copyInvoice,
    getPendingOnlineOrders,
    capNhatTrangThai,
    capNhatHoaDon
}

