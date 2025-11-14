import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { taoHoaDonChoMoi, layDanhSachHoaDonCho, huyHoaDon } from '@/service/banhang/banHangService'

/**
 * Chuẩn hóa dữ liệu hóa đơn từ backend về format frontend
 */
const normalizeHoaDon = (hoaDon) => {
  if (!hoaDon) return null

  return {
    ...hoaDon,
    // Map các field có thể khác tên
    hoaDonChiTiet: hoaDon.chiTietList || hoaDon.hoaDonChiTiet || [],
    khachHang: hoaDon.khachHang || {
      hoTen: hoaDon.tenKhachHang || 'Khách lẻ',
      soDienThoai: hoaDon.sdt || null,
      diaChi: hoaDon.diaChi || null,
    },
  }
}

/**
 * Composable quản lý hóa đơn
 * Xử lý: tạo hóa đơn mới, chọn hóa đơn, xóa hóa đơn, load danh sách
 */
export function useBillManagement() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { success: showSuccess, error: showError, warning: showWarning } = useToast()
  const { showConfirm } = useConfirm()

  // State
  const danhSachHoaDonCho = ref([])
  const hoaDonHienTai = ref(null)
  const isLoading = ref(false)

  /**
   * Số lượng hóa đơn chờ tối đa
   */
  const MAX_HOA_DON_CHO = 10

  /**
   * Kiểm tra đã đạt giới hạn hóa đơn chờ chưa
   */
  const daDatGioiHan = computed(() => {
    return danhSachHoaDonCho.value.length >= MAX_HOA_DON_CHO
  })

  /**
   * Tạo hóa đơn mới
   */
  const taoHoaDonMoi = async () => {
    // Kiểm tra giới hạn
    if (daDatGioiHan.value) {
      showWarning(
        `Đã đạt giới hạn tối đa ${MAX_HOA_DON_CHO} hóa đơn chờ! Vui lòng thanh toán hoặc xóa bớt hóa đơn chờ.`,
      )
      return
    }

    const nhanVienId = authStore.getUserId

    if (!nhanVienId) {
      showError('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!')
      router.push('/login')
      return
    }

    isLoading.value = true
    try {
      const payload = {
        nhanVienId: nhanVienId,
        khachHangId: null, // Khách vãng lai
      }

      console.log('Payload tạo hóa đơn:', payload)
      console.log('Nhân viên:', authStore.getUserName)

      const response = await taoHoaDonChoMoi(payload)

      console.log('Response từ API:', response)

      if (response && response.data) {
        const newBill = normalizeHoaDon(response.data)

        // Thêm vào danh sách hóa đơn chờ
        danhSachHoaDonCho.value.push(newBill)

        // Tự động chọn hóa đơn mới tạo
        hoaDonHienTai.value = newBill

        console.log('Tạo hóa đơn thành công:', newBill)
        showSuccess('Tạo hóa đơn mới thành công!')
      }
    } catch (error) {
      console.error('Lỗi khi tạo hóa đơn:', error)
      console.error('Error response:', error.response?.data)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể tạo hóa đơn. Vui lòng thử lại!'
      showError(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Chọn hóa đơn từ danh sách chờ
   */
  const chonHoaDon = (bill) => {
    hoaDonHienTai.value = bill
  }

  /**
   * Xóa hóa đơn chờ (gọi API backend)
   */
  const xoaHoaDonCho = async (billId) => {
    const confirmed = await showConfirm({
      title: 'Xác nhận xóa hóa đơn',
      message: 'Bạn có chắc chắn muốn xóa hóa đơn này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'warning',
    })

    if (!confirmed) return

    isLoading.value = true
    try {
      // Gọi API backend để xóa
      await huyHoaDon(billId)

      // Xóa khỏi danh sách local
      const index = danhSachHoaDonCho.value.findIndex((b) => b.id === billId)
      if (index > -1) {
        danhSachHoaDonCho.value.splice(index, 1)

        // Nếu xóa hóa đơn đang được chọn
        if (hoaDonHienTai.value?.id === billId) {
          hoaDonHienTai.value = danhSachHoaDonCho.value[0] || null
        }
      }

      console.log('✅ Xóa hóa đơn chờ thành công')
      showSuccess('Đã xóa hóa đơn thành công!')
    } catch (error) {
      console.error('❌ Lỗi khi xóa hóa đơn:', error)
      showError(error.response?.data?.message || 'Không thể xóa hóa đơn. Vui lòng thử lại!')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Hủy hóa đơn
   */
  const handleCancelBill = async () => {
    if (!hoaDonHienTai.value) return

    const confirmed = await showConfirm({
      title: 'Xác nhận hủy hóa đơn',
      message: 'Bạn có chắc chắn muốn hủy hóa đơn này? Hành động này không thể hoàn tác!',
      confirmText: 'Hủy hóa đơn',
      cancelText: 'Không',
      type: 'danger',
    })

    if (!confirmed) return

    isLoading.value = true
    try {
      await huyHoaDon(hoaDonHienTai.value.id)

      // Xóa khỏi danh sách chờ
      const index = danhSachHoaDonCho.value.findIndex((b) => b.id === hoaDonHienTai.value.id)
      if (index > -1) {
        danhSachHoaDonCho.value.splice(index, 1)
        hoaDonHienTai.value = danhSachHoaDonCho.value[0] || null
      }

      showSuccess('Hủy hóa đơn thành công!')
    } catch (error) {
      console.error('Lỗi khi hủy hóa đơn:', error)
      showError(error.response?.data?.message || 'Không thể hủy hóa đơn. Vui lòng thử lại!')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lưu tạm hóa đơn
   */
  const handleSaveDraft = () => {
    console.log('Lưu tạm hóa đơn')
    // Hóa đơn đã tự động lưu tạm khi tạo mới (trang_thai = 0)
    showSuccess('Hóa đơn đã được lưu tạm!')
  }

  /**
   * Load danh sách hóa đơn chờ
   */
  const loadDanhSachHoaDonCho = async () => {
    const nhanVienId = authStore.getUserId

    if (!nhanVienId) {
      console.warn('Không tìm thấy ID nhân viên')
      return
    }

    console.log('🔄 Đang load danh sách hóa đơn chờ cho nhân viên:', nhanVienId)

    try {
      const response = await layDanhSachHoaDonCho(nhanVienId)

      console.log('📦 Response từ API layDanhSachHoaDonCho:', response)
      console.log('📦 Response type:', typeof response)
      console.log('📦 Response.data:', response?.data)

      // Backend trả về: { data: [...] } hoặc ResponseObject { isSuccess, data: [], message }
      // axiosInstance.get() trả về response.data (đã unwrap axios response)
      let danhSach = []

      if (response) {
        // Trường hợp 1: response.data là array (backend trả: { data: [] })
        if (response.data && Array.isArray(response.data)) {
          danhSach = response.data
          console.log('✅ Parse type 1: response.data is array -', danhSach.length, 'items')
        }
        // Trường hợp 2: response là array trực tiếp
        else if (Array.isArray(response)) {
          danhSach = response
          console.log('✅ Parse type 2: response is array -', danhSach.length, 'items')
        }
        // Trường hợp 3: response.data.data (nested)
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          danhSach = response.data.data
          console.log('✅ Parse type 3: response.data.data is array -', danhSach.length, 'items')
        }
        // Trường hợp 4: response.content (pagination)
        else if (response.content && Array.isArray(response.content)) {
          danhSach = response.content
          console.log('✅ Parse type 4: response.content is array -', danhSach.length, 'items')
        } else {
          console.error('❌ Không parse được response!')
          console.error('Response keys:', Object.keys(response))
          console.error('Response.data type:', typeof response.data)
          console.error('Is response.data array?', Array.isArray(response.data))
        }
      }

      console.log('📋 Danh sách hóa đơn sau khi parse:', danhSach)
      console.log('📋 Số lượng hóa đơn:', danhSach?.length || 0)

      // Lọc chỉ lấy các hóa đơn chưa thanh toán
      // Backend trả về trangThai = "CHO_THANH_TOAN" hoặc trangThaiThanhToan = 0
      console.log('🔍 Bắt đầu filter hóa đơn chờ...')
      const hoaDonCho = danhSach.filter((hd, index) => {
        const trangThai = hd.trangThai ?? hd.trang_thai ?? hd.status
        const trangThaiThanhToan = hd.trangThaiThanhToan ?? hd.trang_thai_thanh_toan

        if (index === 0) {
          console.log('🔍 Sample hóa đơn đầu tiên:')
          console.log('   - trangThai:', trangThai, typeof trangThai)
          console.log('   - trangThaiThanhToan:', trangThaiThanhToan, typeof trangThaiThanhToan)
        }

        // Kiểm tra nhiều điều kiện có thể:
        // 1. trangThai là "CHO_THANH_TOAN" (string)
        // 2. trangThaiThanhToan = 0 (chưa thanh toán)
        // 3. trangThai = 0 hoặc '0' (format cũ nếu có)
        const isMatch =
          trangThai === 'CHO_THANH_TOAN' ||
          trangThaiThanhToan === 0 ||
          trangThaiThanhToan === '0' ||
          trangThai === 0 ||
          trangThai === '0'

        if (index === 0) {
          console.log('   - isMatch:', isMatch)
        }

        return isMatch
      })
      console.log('🔍 Sau khi filter:', hoaDonCho.length, 'hóa đơn')

      // Chuẩn hóa dữ liệu và gán vào state
      danhSachHoaDonCho.value = hoaDonCho.map(normalizeHoaDon)

      // Tự động chọn hóa đơn đầu tiên nếu có
      if (danhSachHoaDonCho.value.length > 0) {
        hoaDonHienTai.value = danhSachHoaDonCho.value[0]
        console.log('🎯 Hóa đơn được chọn:', {
          id: hoaDonHienTai.value.id,
          ma: hoaDonHienTai.value.ma,
          soSanPham: hoaDonHienTai.value.hoaDonChiTiet?.length || 0,
        })
      }

      console.log('✅ Đã load', danhSachHoaDonCho.value.length, 'hóa đơn chờ')
      console.log('🎯 Hóa đơn hiện tại:', hoaDonHienTai.value)
    } catch (error) {
      console.error('❌ Lỗi khi load danh sách hóa đơn chờ:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error message:', error.message)
      // Không hiển thị alert để không làm phiền user khi vào trang
    }
  }

  /**
   * Cập nhật hóa đơn hiện tại và danh sách chờ
   */
  const capNhatHoaDon = (updatedBill) => {
    // Chuẩn hóa dữ liệu trước khi cập nhật
    const normalizedBill = normalizeHoaDon(updatedBill)

    // Cập nhật hóa đơn hiện tại
    hoaDonHienTai.value = normalizedBill

    // Cập nhật trong danh sách chờ
    const index = danhSachHoaDonCho.value.findIndex((b) => b.id === normalizedBill.id)
    if (index > -1) {
      danhSachHoaDonCho.value[index] = normalizedBill
    }
  }

  /**
   * Xóa hóa đơn sau khi thanh toán thành công
   */
  const xoaHoaDonSauThanhToan = () => {
    if (!hoaDonHienTai.value) return

    const index = danhSachHoaDonCho.value.findIndex((b) => b.id === hoaDonHienTai.value.id)
    if (index > -1) {
      danhSachHoaDonCho.value.splice(index, 1)
    }

    // Chọn hóa đơn tiếp theo hoặc để trống
    hoaDonHienTai.value = danhSachHoaDonCho.value[0] || null
  }

  return {
    // State
    danhSachHoaDonCho,
    hoaDonHienTai,
    isLoading,
    daDatGioiHan, // Computed: kiểm tra đã đạt giới hạn 10 hóa đơn chưa

    // Methods
    taoHoaDonMoi,
    chonHoaDon,
    xoaHoaDonCho,
    handleCancelBill,
    handleSaveDraft,
    loadDanhSachHoaDonCho,
    capNhatHoaDon,
    xoaHoaDonSauThanhToan,
  }
}
