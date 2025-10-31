/**
 * useSerialValidation.js
 * 
 * Composable để quản lý việc quét và xác thực Serial Number khi thanh toán
 * Theo yêu cầu: Mỗi sản phẩm phải có Serial Number hợp lệ trước khi thanh toán
 */

import { ref, computed } from 'vue'
import { xacThucSerial } from '@/service/banHangService'

export function useSerialValidation(hoaDon) {
    // State
    const isLoading = ref(false)
    const validatedSerials = ref([]) // Danh sách serial đã được xác thực
    const currentSerialInput = ref('') // Serial đang nhập
    const currentProduct = ref(null) // Sản phẩm hiện tại đang quét serial
    const errorMessage = ref('')
    const scanMode = ref(false) // Chế độ quét mã

    /**
     * Tính tổng số lượng sản phẩm cần quét serial
     */
    const tongSoLuongCanQuet = computed(() => {
        if (!hoaDon.value || !hoaDon.value.hoaDonChiTiet) return 0

        return hoaDon.value.hoaDonChiTiet.reduce((total, item) => {
            return total + (item.soLuong || 0)
        }, 0)
    })

    /**
     * Số lượng serial đã quét được
     */
    const soLuongDaQuet = computed(() => validatedSerials.value.length)

    /**
     * Kiểm tra đã quét đủ serial chưa
     */
    const daQuetDu = computed(() => {
        return soLuongDaQuet.value >= tongSoLuongCanQuet.value && tongSoLuongCanQuet.value > 0
    })

    /**
     * Progress quét serial (%)
     */
    const progress = computed(() => {
        if (tongSoLuongCanQuet.value === 0) return 0
        return Math.round((soLuongDaQuet.value / tongSoLuongCanQuet.value) * 100)
    })

    /**
     * Lấy danh sách sản phẩm cần quét serial
     */
    const danhSachSanPhamCanQuet = computed(() => {
        if (!hoaDon.value || !hoaDon.value.hoaDonChiTiet) return []

        return hoaDon.value.hoaDonChiTiet.map(item => {
            // Đếm số serial đã quét cho sản phẩm này
            const daQuet = validatedSerials.value.filter(
                s => s.idHoaDonChiTiet === item.id
            ).length

            return {
                ...item,
                soLuongCanQuet: item.soLuong || 0,
                soLuongDaQuet: daQuet,
                conThieu: (item.soLuong || 0) - daQuet,
                hoanThanh: daQuet >= (item.soLuong || 0)
            }
        })
    })

    /**
     * Xác thực một Serial Number
     */
    const xacThucMotSerial = async (serialNumber, product) => {
        if (!serialNumber || !serialNumber.trim()) {
            errorMessage.value = 'Vui lòng nhập Serial Number'
            return false
        }

        if (!product || !product.id || !product.idChiTietSanPham) {
            errorMessage.value = 'Thông tin sản phẩm không hợp lệ'
            return false
        }

        // Kiểm tra serial đã được quét chưa
        const daTonTai = validatedSerials.value.some(
            s => s.serialNumber === serialNumber.trim()
        )

        if (daTonTai) {
            errorMessage.value = 'Serial này đã được quét rồi'
            return false
        }

        isLoading.value = true
        errorMessage.value = ''

        try {
            console.log('🔍 Xác thực serial:', {
                serialNumber: serialNumber.trim(),
                product: product.tenSanPham,
                idHoaDonChiTiet: product.id
            })

            const response = await xacThucSerial({
                idHoaDon: hoaDon.value.id,
                idChiTietSanPham: product.idChiTietSanPham,
                serialNumber: serialNumber.trim()
            })

            console.log('📦 Response xác thực:', response)

            // Parse response (có thể có cấu trúc data.data hoặc data)
            const result = response.data || response

            if (result.isValid || result.valid) {
                // Serial hợp lệ - thêm vào danh sách
                validatedSerials.value.push({
                    idHoaDonChiTiet: product.id,
                    idChiTietSanPham: product.idChiTietSanPham,
                    serialNumber: serialNumber.trim(),
                    serialId: result.serialId,
                    tenSanPham: result.tenSanPham || product.tenSanPham,
                    maChiTietSanPham: result.maChiTietSanPham || product.maCTSP,
                    validatedAt: new Date().toISOString()
                })

                console.log('✅ Serial hợp lệ, đã thêm vào danh sách')
                return true
            } else {
                errorMessage.value = result.message || 'Serial không hợp lệ'
                console.warn('❌ Serial không hợp lệ:', result.message)
                return false
            }

        } catch (error) {
            console.error('❌ Lỗi xác thực serial:', error)
            errorMessage.value = error.response?.data?.message || 'Lỗi khi xác thực serial'
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Xóa một serial đã quét
     */
    const xoaSerial = (serialNumber) => {
        const index = validatedSerials.value.findIndex(
            s => s.serialNumber === serialNumber
        )

        if (index > -1) {
            validatedSerials.value.splice(index, 1)
            console.log('🗑️ Đã xóa serial:', serialNumber)
        }
    }

    /**
     * Reset toàn bộ serial đã quét
     */
    const resetSerials = () => {
        validatedSerials.value = []
        currentSerialInput.value = ''
        currentProduct.value = null
        errorMessage.value = ''
        scanMode.value = false
        console.log('🔄 Đã reset tất cả serial')
    }

    /**
     * Lấy danh sách serial theo format backend yêu cầu
     */
    const getSerialPayload = () => {
        return validatedSerials.value.map(s => ({
            idHoaDonChiTiet: s.idHoaDonChiTiet,
            idChiTietSanPham: s.idChiTietSanPham,
            serialNumber: s.serialNumber
        }))
    }

    /**
     * Bật/tắt chế độ quét mã
     */
    const toggleScanMode = () => {
        scanMode.value = !scanMode.value
        if (scanMode.value) {
            currentSerialInput.value = ''
            errorMessage.value = ''
        }
    }

    return {
        // State
        isLoading,
        validatedSerials,
        currentSerialInput,
        currentProduct,
        errorMessage,
        scanMode,

        // Computed
        tongSoLuongCanQuet,
        soLuongDaQuet,
        daQuetDu,
        progress,
        danhSachSanPhamCanQuet,

        // Methods
        xacThucMotSerial,
        xoaSerial,
        resetSerials,
        getSerialPayload,
        toggleScanMode
    }
}

