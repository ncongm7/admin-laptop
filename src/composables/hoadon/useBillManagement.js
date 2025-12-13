import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/taikhoan/authStore'
import { useToast } from '@/composables/common/useToast'
import { useConfirm } from '@/composables/common/useConfirm'
import {
  taoHoaDonChoMoi,
  layDanhSachHoaDonCho,
  huyHoaDon,
  themSanPhamVaoHoaDon,
  capNhatKhachHang,
} from '@/service/banhang/banHangService'
import { layThongTinHoaDon } from '@/service/banhang/hoaDonService'

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

  // Auto-save draft
  let autoSaveInterval = null
  const AUTO_SAVE_INTERVAL = 30000 // 30 giây
  const DRAFT_STORAGE_KEY = 'banhang_draft_bills'

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
   * Tạo hóa đơn mới (LOCAL - không lưu DB)
   * Chỉ tạo object trong frontend, lưu localStorage
   * Chỉ insert DB khi thanh toán thành công
   */
  const taoHoaDonMoi = () => {
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

    try {
      // Tạo ID tạm thời cho hóa đơn local (prefix "TEMP_")
      const tempId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Sinh mã hóa đơn tạm (sẽ được backend generate khi insert thật)
      const tempMa = `HD${Date.now().toString().slice(-8)}`

      const newBill = {
        id: tempId, // ID tạm
        ma: tempMa, // Mã tạm
        nhanVienId: nhanVienId,
        nhanVien: {
          id: nhanVienId,
          hoTen: authStore.getUserName || 'Nhân viên',
        },
        khachHang: null, // Khách vãng lai
        hoaDonChiTiet: [], // Danh sách sản phẩm
        tongTien: 0,
        tongTienSauGiam: 0,
        tienDuocGiam: 0,
        idPhieuGiamGia: null,
        phieuGiamGia: null,
        diemSuDung: 0,
        tienGiamDiem: 0,
        trangThai: 'CHO', // Trạng thái chờ
        loaiHoaDon: 'TAI_QUAY', // Loại hóa đơn
        createdAt: new Date().toISOString(),
        isLocal: true, // Flag đánh dấu hóa đơn local (chưa lưu DB)
      }

      // Thêm vào danh sách hóa đơn chờ
      danhSachHoaDonCho.value.push(newBill)

      // Tự động chọn hóa đơn mới tạo
      hoaDonHienTai.value = newBill

      // Lưu vào localStorage
      saveDraftToLocalStorage()

      console.log('✅ [LOCAL] Tạo hóa đơn local thành công:', newBill)
      showSuccess('Tạo hóa đơn mới thành công!')
    } catch (error) {
      console.error('❌ Lỗi khi tạo hóa đơn local:', error)
      showError('Không thể tạo hóa đơn. Vui lòng thử lại!')
    }
  }

  /**
   * Chọn hóa đơn từ danh sách chờ
   */
  const chonHoaDon = (bill) => {
    hoaDonHienTai.value = bill
  }

  /**
   * Xóa hóa đơn chờ (LOCAL - chỉ xóa khỏi localStorage)
   * Nếu là hóa đơn đã lưu DB thì gọi API hủy
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

    try {
      const bill = danhSachHoaDonCho.value.find((b) => b.id === billId)

      // Nếu là hóa đơn đã lưu DB (không có flag isLocal), gọi API hủy
      if (bill && !bill.isLocal) {
        isLoading.value = true
        await huyHoaDon(billId)
      }

      // Xóa khỏi danh sách local
      const index = danhSachHoaDonCho.value.findIndex((b) => b.id === billId)
      if (index > -1) {
        danhSachHoaDonCho.value.splice(index, 1)

        // Nếu xóa hóa đơn đang được chọn
        if (hoaDonHienTai.value?.id === billId) {
          hoaDonHienTai.value = danhSachHoaDonCho.value[0] || null
        }
      }

      // Lưu lại localStorage
      saveDraftToLocalStorage()

      console.log('✅ Xóa hóa đơn thành công')
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
   * Lưu tạm hóa đơn vào localStorage
   * Bao gồm cả hóa đơn local (chưa insert DB) và hóa đơn đã lưu DB
   */
  const saveDraftToLocalStorage = () => {
    try {
      const drafts = danhSachHoaDonCho.value.map((bill) => ({
        id: bill.id,
        ma: bill.ma,
        nhanVienId: bill.nhanVienId,
        nhanVien: bill.nhanVien,
        khachHang: bill.khachHang,
        hoaDonChiTiet: bill.hoaDonChiTiet || [],
        tongTien: bill.tongTien || 0,
        tongTienSauGiam: bill.tongTienSauGiam || bill.tongTien || 0,
        idPhieuGiamGia: bill.idPhieuGiamGia || null,
        phieuGiamGia: bill.phieuGiamGia || null,
        tienDuocGiam: bill.tienDuocGiam || 0,
        diemSuDung: bill.diemSuDung || 0,
        tienGiamDiem: bill.tienGiamDiem || 0,
        trangThai: bill.trangThai || 'CHO',
        loaiHoaDon: bill.loaiHoaDon || 'TAI_QUAY',
        isLocal: bill.isLocal || false, // Flag đánh dấu hóa đơn local
        createdAt: bill.createdAt,
        savedAt: new Date().toISOString(),
      }))

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts))
      console.log('💾 [Draft] Đã lưu', drafts.length, 'hóa đơn tạm vào localStorage')
    } catch (error) {
      console.error('❌ [Draft] Lỗi khi lưu draft:', error)
    }
  }

  /**
   * Khôi phục hóa đơn tạm từ localStorage
   * Chỉ load hóa đơn local (chưa insert DB)
   * Bỏ qua việc gọi API loadDanhSachHoaDonCho vì giờ hóa đơn chỉ tồn tại local
   */
  const restoreDraftsFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!saved) {
        console.log('💾 [Draft] Không có draft nào được lưu')
        return
      }

      const drafts = JSON.parse(saved)
      if (!Array.isArray(drafts) || drafts.length === 0) {
        console.log('💾 [Draft] Danh sách draft trống')
        return
      }

      console.log('💾 [Draft] Đang khôi phục', drafts.length, 'hóa đơn local...')

      // Khôi phục tất cả hóa đơn local
      danhSachHoaDonCho.value = drafts

      // Chọn hóa đơn đầu tiên nếu có
      if (drafts.length > 0) {
        hoaDonHienTai.value = drafts[0]
      }

      console.log('✅ [Draft] Đã khôi phục', drafts.length, 'hóa đơn local')
    } catch (error) {
      console.error('❌ [Draft] Lỗi khi khôi phục draft:', error)
      // Xóa draft lỗi
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
  }

  /**
   * Lưu tạm hóa đơn (manual)
   */
  const handleSaveDraft = () => {
    if (!hoaDonHienTai.value) {
      showWarning('Chưa có hóa đơn để lưu!')
      return
    }

    saveDraftToLocalStorage()
    showSuccess('Hóa đơn đã được lưu tạm!')
  }

  /**
   * Bật auto-save draft
   */
  const startAutoSave = () => {
    // Dừng interval cũ nếu có
    stopAutoSave()

    // Tạo interval mới
    autoSaveInterval = setInterval(() => {
      if (danhSachHoaDonCho.value.length > 0) {
        saveDraftToLocalStorage()
      }
    }, AUTO_SAVE_INTERVAL)

    console.log('⏰ [Draft] Đã bật auto-save (mỗi', AUTO_SAVE_INTERVAL / 1000, 'giây)')
  }

  /**
   * Dừng auto-save draft
   */
  const stopAutoSave = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
      console.log('⏰ [Draft] Đã tắt auto-save')
    }
  }

  /**
   * Load danh sách hóa đơn chờ
   * KHÔNG CẦN GỌI API NỮA - chỉ khôi phục từ localStorage
   * Hóa đơn chỉ tồn tại local cho đến khi thanh toán
   */
  const loadDanhSachHoaDonCho = () => {
    console.log('🔄 [LOCAL] Khôi phục danh sách hóa đơn từ localStorage...')

    try {
      restoreDraftsFromLocalStorage()
      console.log('✅ [LOCAL] Đã load', danhSachHoaDonCho.value.length, 'hóa đơn local')
    } catch (error) {
      console.error('❌ [LOCAL] Lỗi khi load hóa đơn local:', error)
    }
  }

  /**
   * Cập nhật hóa đơn hiện tại và danh sách chờ (LOCAL ONLY)
   * Không gọi API - chỉ update reactive state và localStorage
   */
  const capNhatHoaDon = (updatedBill) => {
    if (!updatedBill) {
      console.warn('⚠️ [BillManagement] Không có dữ liệu để cập nhật hóa đơn!')
      return
    }

    const rawHoaDon = updatedBill?.data || updatedBill
    const normalizedHoaDon = normalizeHoaDon(rawHoaDon)

    if (!normalizedHoaDon) {
      console.warn('⚠️ [BillManagement] Dữ liệu hóa đơn không hợp lệ:', updatedBill)
      return
    }

    const mergedBill = {
      ...hoaDonHienTai.value,
      ...normalizedHoaDon,
    }

    // Giữ nguyên trạng thái local nếu backend không trả về flag
    mergedBill.isLocal = normalizedHoaDon?.isLocal ?? hoaDonHienTai.value?.isLocal ?? false

    // Cập nhật ref hiện tại
    hoaDonHienTai.value = mergedBill

    // Đồng bộ vào danh sách hóa đơn chờ
    const index = danhSachHoaDonCho.value.findIndex((b) => b.id === mergedBill.id)
    if (index > -1) {
      danhSachHoaDonCho.value[index] = mergedBill
    } else if (mergedBill.id) {
      danhSachHoaDonCho.value.push(mergedBill)
    }

    saveDraftToLocalStorage()

    console.log('✅ [BillManagement] Đã cập nhật hóa đơn vào state + localStorage:', mergedBill.id)
  }

  /**
   * Đảm bảo hóa đơn local được tạo trên backend trước khi gọi các API yêu cầu UUID thật
   */
  const ensureHoaDonTonTai = async () => {
    if (!hoaDonHienTai.value) {
      const message = 'Không tìm thấy hóa đơn hiện tại. Vui lòng tạo hóa đơn mới!'
      showError(message)
      throw new Error(message)
    }

    if (!hoaDonHienTai.value.isLocal) {
      return hoaDonHienTai.value
    }

    const nhanVienId = hoaDonHienTai.value.nhanVienId || authStore.getUserId
    if (!nhanVienId) {
      const message = 'Không xác định được nhân viên cho hóa đơn. Vui lòng đăng nhập lại!'
      showError(message)
      router.push('/login')
      throw new Error(message)
    }

    const khachHang = hoaDonHienTai.value.khachHang || null
    const payload = {
      nhanVienId,
      khachHangId: khachHang?.userId || khachHang?.id || hoaDonHienTai.value.khachHangId || null,
    }

    const previousLoading = isLoading.value
    if (!previousLoading) {
      isLoading.value = true
    }

    try {
      console.log('🔄 [BillManagement] Đồng bộ hóa đơn local lên backend...', {
        tempId: hoaDonHienTai.value.id,
        payload,
      })

      const response = await taoHoaDonChoMoi(payload)
      const backendHoaDon = normalizeHoaDon(response?.data || response)

      if (!backendHoaDon || !backendHoaDon.id) {
        throw new Error('Response tạo hóa đơn không hợp lệ')
      }

      const tempId = hoaDonHienTai.value.id
      const syncedBill = {
        ...hoaDonHienTai.value,
        ...backendHoaDon,
        id: backendHoaDon.id,
        ma: backendHoaDon.ma || hoaDonHienTai.value.ma,
        isLocal: false,
      }

      const index = danhSachHoaDonCho.value.findIndex((b) => b.id === tempId)
      if (index > -1) {
        danhSachHoaDonCho.value.splice(index, 1, syncedBill)
      } else {
        danhSachHoaDonCho.value.push(syncedBill)
      }

      hoaDonHienTai.value = syncedBill

      saveDraftToLocalStorage()

      console.log('✅ [BillManagement] Đã sync hóa đơn local -> backend:', {
        tempId,
        newId: syncedBill.id,
      })

      return syncedBill
    } catch (error) {
      console.error('❌ [BillManagement] Lỗi khi sync hóa đơn local:', error)
      const message =
        error.response?.data?.message ||
        error.message ||
        'Không thể tạo hóa đơn trên hệ thống. Vui lòng thử lại!'
      showError(message)
      throw error
    } finally {
      if (!previousLoading) {
        isLoading.value = false
      }
    }
  }

  /**
   * Xóa hóa đơn sau khi thanh toán thành công (LOCAL)
   * Xóa khỏi danh sách local và localStorage
   */
  const xoaHoaDonSauThanhToan = () => {
    if (!hoaDonHienTai.value) return

    console.log('🗑️ [LOCAL] Xóa hóa đơn sau thanh toán:', hoaDonHienTai.value.id)

    const index = danhSachHoaDonCho.value.findIndex((b) => b.id === hoaDonHienTai.value.id)
    if (index > -1) {
      danhSachHoaDonCho.value.splice(index, 1)
    }

    // Chọn hóa đơn tiếp theo hoặc để trống
    hoaDonHienTai.value = danhSachHoaDonCho.value[0] || null

    // Lưu lại localStorage
    saveDraftToLocalStorage()

    console.log('✅ [LOCAL] Đã xóa hóa đơn khỏi local state')
  }

  /**
   * Copy hóa đơn chờ thành hóa đơn mới
   * Giữ nguyên sản phẩm và khách hàng, reset trạng thái thanh toán
   */
  const copyBill = async (sourceBill) => {
    if (!sourceBill) {
      showError('Không có hóa đơn để copy!')
      return
    }

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
      // 1. Tạo hóa đơn mới
      const payload = {
        nhanVienId: nhanVienId,
        khachHangId: sourceBill.khachHang?.id || sourceBill.khachHangId || null,
      }

      console.log('📋 [copyBill] Tạo hóa đơn mới từ hóa đơn:', sourceBill.id)
      const response = await taoHoaDonChoMoi(payload)

      if (!response || !response.data) {
        throw new Error('Không thể tạo hóa đơn mới!')
      }

      let newBill = normalizeHoaDon(response.data)
      console.log('✅ [copyBill] Đã tạo hóa đơn mới:', newBill.id)

      // 2. Copy sản phẩm từ hóa đơn cũ
      const chiTietList = sourceBill.hoaDonChiTiet || sourceBill.chiTietList || []

      // Khai báo biến đếm bên ngoài để có thể sử dụng sau này
      let successCount = 0
      let failCount = 0

      if (chiTietList.length > 0) {
        console.log(`📦 [copyBill] Đang copy ${chiTietList.length} sản phẩm...`)

        for (const item of chiTietList) {
          try {
            // Lấy idChiTietSanPham từ nhiều nguồn có thể
            const idChiTietSanPham =
              item.idChiTietSanPham ||
              item.chiTietSanPham?.id ||
              item.idCtsp ||
              item.chiTietSanPhamId

            if (!idChiTietSanPham) {
              console.warn(`⚠️ [copyBill] Sản phẩm ${item.id} không có idChiTietSanPham, bỏ qua`)
              failCount++
              continue
            }

            const addProductPayload = {
              chiTietSanPhamId: idChiTietSanPham,
              soLuong: item.soLuong || 1,
            }

            const addResponse = await themSanPhamVaoHoaDon(newBill.id, addProductPayload)

            if (addResponse && addResponse.data) {
              successCount++
              // Cập nhật newBill với dữ liệu mới nhất
              newBill = normalizeHoaDon(addResponse.data)
            } else {
              failCount++
            }
          } catch (error) {
            console.error(`❌ [copyBill] Lỗi khi copy sản phẩm ${item.id}:`, error)
            failCount++
            // Tiếp tục copy các sản phẩm khác
          }
        }

        console.log(
          `📦 [copyBill] Đã copy ${successCount}/${chiTietList.length} sản phẩm thành công`,
        )

        if (failCount > 0) {
          showWarning(`Đã copy ${successCount} sản phẩm, ${failCount} sản phẩm không thể copy`)
        }
      }

      // 3. Copy khách hàng (nếu có)
      if (sourceBill.khachHang?.id || sourceBill.khachHangId) {
        try {
          await capNhatKhachHang(newBill.id, {
            khachHangId: sourceBill.khachHang?.id || sourceBill.khachHangId,
          })
          console.log('✅ [copyBill] Đã copy thông tin khách hàng')
        } catch (error) {
          console.error('❌ [copyBill] Lỗi khi copy khách hàng:', error)
          // Không throw, vì khách hàng không bắt buộc
        }
      }

      // 4. Reload lại hóa đơn mới để có đầy đủ thông tin (sau khi đã copy sản phẩm)
      // Chỉ reload nếu đã copy được ít nhất 1 sản phẩm thành công
      if (successCount > 0) {
        try {
          const reloadResponse = await layThongTinHoaDon(newBill.id)
          if (reloadResponse && reloadResponse.data) {
            const reloadedBill = normalizeHoaDon(reloadResponse.data)
            // Đảm bảo reset trạng thái thanh toán
            reloadedBill.trangThaiThanhToan = 0
            reloadedBill.trangThai = 'CHO_THANH_TOAN'
            reloadedBill.isDraft = true

            // Cập nhật newBill với dữ liệu đầy đủ
            newBill = reloadedBill
            console.log('✅ [copyBill] Đã reload hóa đơn với đầy đủ thông tin')
          }
        } catch (error) {
          console.warn('⚠️ [copyBill] Không thể reload hóa đơn, sử dụng dữ liệu hiện có:', error)
          // Vẫn tiếp tục với newBill hiện tại
          newBill.trangThaiThanhToan = 0
          newBill.trangThai = 'CHO_THANH_TOAN'
          newBill.isDraft = true
        }
      } else {
        // Nếu không copy được sản phẩm nào, vẫn đảm bảo reset trạng thái
        newBill.trangThaiThanhToan = 0
        newBill.trangThai = 'CHO_THANH_TOAN'
        newBill.isDraft = true
      }

      // 5. Thêm vào danh sách và chọn hóa đơn mới
      danhSachHoaDonCho.value.push(newBill)
      hoaDonHienTai.value = newBill

      // 6. Lưu draft
      saveDraftToLocalStorage()

      console.log('✅ [copyBill] Copy hóa đơn thành công!')
      showSuccess(
        `Đã copy hóa đơn thành công! (${chiTietList.length} sản phẩm, ${newBill.khachHang ? 'có khách hàng' : 'không có khách hàng'})`,
      )
    } catch (error) {
      console.error('❌ [copyBill] Lỗi khi copy hóa đơn:', error)
      showError(error.response?.data?.message || 'Không thể copy hóa đơn. Vui lòng thử lại!')
    } finally {
      isLoading.value = false
    }
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
    ensureHoaDonTonTai,
    xoaHoaDonSauThanhToan,
    copyBill,
    handleSaveDraft,
    startAutoSave,
    stopAutoSave,
  }
}
