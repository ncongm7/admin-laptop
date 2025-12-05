import { computed, watch } from 'vue'

/**
 * Composable tính toán tự động cho hóa đơn (LOCAL ONLY)
 * Dùng computed để auto re-calculate khi data thay đổi
 *
 * Computed properties:
 * - tongTien: Tổng tiền gốc (sum của tất cả sản phẩm)
 * - tienGiamVoucher: Tiền giảm từ voucher
 * - tienGiamDiem: Tiền giảm từ điểm tích lũy
 * - tongTienSauGiam: Tổng tiền cuối cùng sau khi giảm
 * - voucherValid: Voucher có hợp lệ không (check ngày, điều kiện)
 */
export function useBillCalculation(hoaDonHienTai, capNhatHoaDon) {
  /**
   * Tính tổng tiền gốc từ danh sách sản phẩm
   */
  const tongTien = computed(() => {
    if (!hoaDonHienTai.value || !hoaDonHienTai.value.hoaDonChiTiet) {
      return 0
    }

    return hoaDonHienTai.value.hoaDonChiTiet.reduce((total, item) => {
      const soLuong = item.soLuong || 0
      const donGia = item.donGia || 0
      return total + soLuong * donGia
    }, 0)
  })

  /**
   * Kiểm tra voucher có hợp lệ không
   * Validate: ngày bắt đầu, ngày kết thúc, giá trị đơn hàng tối thiểu
   */
  const voucherValid = computed(() => {
    if (!hoaDonHienTai.value || !hoaDonHienTai.value.phieuGiamGia) {
      return { valid: false, reason: null }
    }

    const voucher = hoaDonHienTai.value.phieuGiamGia
    const now = new Date()

    // Check ngày bắt đầu
    if (voucher.ngayBatDau) {
      const startDate = new Date(voucher.ngayBatDau)
      if (now < startDate) {
        return { valid: false, reason: 'Voucher chưa đến ngày bắt đầu' }
      }
    }

    // Check ngày kết thúc
    if (voucher.ngayKetThuc) {
      const endDate = new Date(voucher.ngayKetThuc)
      if (now > endDate) {
        return { valid: false, reason: 'Voucher đã hết hạn' }
      }
    }

    // Check giá trị đơn hàng tối thiểu
    if (voucher.giaTriDonHangToiThieu && tongTien.value < voucher.giaTriDonHangToiThieu) {
      return {
        valid: false,
        reason: `Đơn hàng tối thiểu ${voucher.giaTriDonHangToiThieu.toLocaleString()}₫`,
      }
    }

    // Check số lượng còn lại
    if (voucher.soLuong !== undefined && voucher.soLuong <= 0) {
      return { valid: false, reason: 'Voucher đã hết số lượng' }
    }

    return { valid: true, reason: null }
  })

  /**
   * Tính tiền giảm từ voucher
   * Kiểm tra voucher hợp lệ + tính theo % hoặc số tiền cố định
   */
  const tienGiamVoucher = computed(() => {
    if (!voucherValid.value.valid) {
      return 0
    }

    const voucher = hoaDonHienTai.value.phieuGiamGia
    let tienGiam = 0

    // Kiểu giảm giá: % hoặc số tiền cố định
    if (voucher.kieuGiamGia === 'PHAN_TRAM') {
      // Giảm theo %
      const phanTram = voucher.giaTriGiam || 0
      tienGiam = Math.floor(tongTien.value * (phanTram / 100))
    } else {
      // Giảm số tiền cố định
      tienGiam = voucher.giaTriGiam || 0
    }

    // Check giảm tối đa
    if (voucher.giaTriGiamToiDa && tienGiam > voucher.giaTriGiamToiDa) {
      tienGiam = voucher.giaTriGiamToiDa
    }

    // Không được giảm quá tổng tiền
    if (tienGiam > tongTien.value) {
      tienGiam = tongTien.value
    }

    return tienGiam
  })

  /**
   * Tính tiền giảm từ điểm tích lũy
   * Quy đổi: 1 điểm = 1000 VNĐ (hoặc theo cấu hình)
   */
  const tienGiamDiem = computed(() => {
    if (!hoaDonHienTai.value || !hoaDonHienTai.value.diemSuDung) {
      return 0
    }

    const diemSuDung = hoaDonHienTai.value.diemSuDung
    const tyLeQuyDoi = 1000 // 1 điểm = 1000 VNĐ

    const tienGiam = diemSuDung * tyLeQuyDoi

    // Không được giảm quá tổng tiền (sau khi đã giảm voucher)
    const tongSauVoucher = tongTien.value - tienGiamVoucher.value
    if (tienGiam > tongSauVoucher) {
      return tongSauVoucher
    }

    return tienGiam
  })

  /**
   * Tổng tiền cuối cùng sau khi giảm voucher + điểm
   */
  const tongTienSauGiam = computed(() => {
    const total = tongTien.value - tienGiamVoucher.value - tienGiamDiem.value
    return total < 0 ? 0 : total
  })

  /**
   * Tổng số tiền được giảm
   */
  const tongTienGiam = computed(() => {
    return tienGiamVoucher.value + tienGiamDiem.value
  })

  /**
   * Watch computed values và tự động cập nhật vào hoaDonHienTai
   * Khi hoaDonChiTiet/voucher/điểm thay đổi → auto re-calculate
   */
  watch(
    [tongTien, tienGiamVoucher, tienGiamDiem, tongTienSauGiam],
    ([newTongTien, newTienGiamVoucher, newTienGiamDiem, newTongTienSauGiam]) => {
      if (!hoaDonHienTai.value) return

      // Cập nhật các field tính toán vào hóa đơn
      hoaDonHienTai.value.tongTien = newTongTien
      hoaDonHienTai.value.tienDuocGiam = newTienGiamVoucher + newTienGiamDiem
      hoaDonHienTai.value.tongTienSauGiam = newTongTienSauGiam

      console.log('💰 [COMPUTED] Tự động tính toán:', {
        tongTien: newTongTien,
        tienGiamVoucher: newTienGiamVoucher,
        tienGiamDiem: newTienGiamDiem,
        tongTienSauGiam: newTongTienSauGiam,
      })
    },
    { immediate: true }, // Run ngay lần đầu
  )

  /**
   * Watch voucher validity và invalidate nếu không hợp lệ
   */
  watch(voucherValid, (newValidation) => {
    if (!newValidation.valid && hoaDonHienTai.value?.phieuGiamGia) {
      console.warn('⚠️ [COMPUTED] Voucher không hợp lệ:', newValidation.reason)

      // Có thể tự động xóa voucher hoặc giữ để hiển thị warning
      // hoaDonHienTai.value.idPhieuGiamGia = null
      // hoaDonHienTai.value.phieuGiamGia = null
    }
  })

  return {
    // Computed values
    tongTien,
    tienGiamVoucher,
    tienGiamDiem,
    tongTienSauGiam,
    tongTienGiam,
    voucherValid,
  }
}
