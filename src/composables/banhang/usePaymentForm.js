import { ref, computed } from 'vue'
import { useToast } from '@/composables/common/useToast'
import { layDanhSachPhuongThucThanhToan, kiemTraTruocThanhToan } from '@/service/banhang/banHangService'
import { sanitizeInput, validatePrice } from '@/utils/validation'
import { useQRPaymentPOS } from '@/composables/banhang/useQRPaymentPOS'

/**
 * Composable quản lý logic form thanh toán
 */
export function usePaymentForm(hoaDon, formData, emit) {
    const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()

    const paymentMethods = ref([])
    const tienKhachDua = ref(0)
    const paymentMethodCash = ref('counter') // 'counter' hoặc 'cod'
    const isProcessing = ref(false)
    const thongBaoThayDoi = ref(null)
    const pendingQRPayment = ref(null)

    // Computed
    const tongTien = computed(() => {
        return hoaDon.value?.tongTienSauGiam || hoaDon.value?.tongTien || 0
    })

    const selectedMethodName = computed(() => {
        const method = paymentMethods.value.find(m => m.id === formData.value.idPhuongThucThanhToan)
        return method?.tenPhuongThuc || ''
    })

    const isTienMat = computed(() => {
        const methodName = selectedMethodName.value.toLowerCase()
        return methodName.includes('tien') && methodName.includes('mat') ||
            methodName.includes('tiền') && methodName.includes('mặt') ||
            methodName.toLowerCase() === 'cash'
    })

    const isQRPayment = computed(() => {
        const methodName = selectedMethodName.value.toLowerCase()
        return methodName.includes('qr') || methodName.includes('chuyển khoản qr') || methodName.includes('chuyen khoan qr')
    })

    const isCOD = computed(() => {
        return isTienMat.value && formData.value.canGiaoHang && paymentMethodCash.value === 'cod'
    })

    const tienThua = computed(() => {
        if (isTienMat.value) {
            return tienKhachDua.value - tongTien.value
        }
        return 0
    })

    const filteredPaymentMethods = computed(() => {
        return paymentMethods.value.filter(method => {
            const name = (method.tenPhuongThuc || '').toLowerCase()
            const type = (method.loaiPhuongThuc || '').toLowerCase()
            if (type === 'cash' || type === 'qr payment') return true
            return (name.includes('tiền mặt') || name.includes('tien mat')) ||
                (name.includes('qr') || name.includes('chuyển khoản qr') || name.includes('chuyen khoan qr'))
        })
    })

    // QR Payment setup
    const hoaDonForQR = computed(() => hoaDon.value)

    async function finalizeQRPayment(paymentData = {}, buildPaymentPayloadFn) {
        const sanitizedTransactionId = paymentData?.transactionId
            ? sanitizeInput(paymentData.transactionId)
            : null

        if (sanitizedTransactionId) {
            formData.value.maGiaoDich = sanitizedTransactionId
        }

        const payload = pendingQRPayment.value
            ? { ...pendingQRPayment.value }
            : buildPaymentPayloadFn()

        if (sanitizedTransactionId) {
            payload.maGiaoDich = sanitizedTransactionId
        }

        pendingQRPayment.value = null
        isProcessing.value = true
        try {
            emit('payment-confirmed', payload)
        } finally {
            isProcessing.value = false
        }
    }

    const {
        qrCodeData,
        loading: qrLoading,
        error: qrError,
        status: qrStatus,
        showQRModal,
        transactionId: qrTransactionId,
        generateQR,
        closeQRModal,
        handleExpired: handleQRExpired
    } = useQRPaymentPOS({
        hoaDon: hoaDonForQR,
        onPaymentConfirmed: async (paymentData) => {
            formData.value.maGiaoDich = paymentData.transactionId
            showSuccess(`Đã nhận thanh toán QR! Mã GD: ${paymentData.transactionId}`)
            await new Promise(resolve => setTimeout(resolve, 500))
            try {
                await finalizeQRPayment({ transactionId: paymentData.transactionId }, buildPaymentPayload)
            } catch (error) {
                console.error('❌ Lỗi khi hoàn tất thanh toán QR:', error)
                showError('Có lỗi xảy ra khi hoàn tất thanh toán. Vui lòng thử lại!')
            }
        }
    })

    // Methods
    const loadPaymentMethods = async () => {
        try {
            const response = await layDanhSachPhuongThucThanhToan()
            paymentMethods.value = Array.isArray(response) ? response : []
            if (paymentMethods.value.length === 0) {
                console.warn('⚠️ Không có phương thức thanh toán nào.')
            }
        } catch (error) {
            console.error('❌ Lỗi khi tải phương thức thanh toán:', error)
            paymentMethods.value = []
        }
    }

    const validateTienKhachDua = () => {
        if (isTienMat.value && !isCOD.value && tienKhachDua.value) {
            if (!validatePrice(tienKhachDua.value)) {
                showError('Số tiền không hợp lệ!')
                tienKhachDua.value = tongTien.value
                return
            }
            if (tienKhachDua.value < tongTien.value) {
                showWarning('Số tiền khách đưa chưa đủ!')
            }
            if (tienKhachDua.value > tongTien.value * 10) {
                showWarning('Số tiền quá lớn, vui lòng kiểm tra lại!')
                tienKhachDua.value = tongTien.value
            }
        }
    }

    const buildPaymentPayload = (getSerialPayloadFn, diaChiFormRef) => {
        const payloadData = {
            ...formData.value,
            soTienThanhToan: tongTien.value,
            serialNumbers: getSerialPayloadFn ? getSerialPayloadFn() : []
        }

        if (payloadData.ghiChu) {
            payloadData.ghiChu = sanitizeInput(payloadData.ghiChu)
        }

        if (payloadData.maGiaoDich) {
            payloadData.maGiaoDich = sanitizeInput(payloadData.maGiaoDich)
        }

        const selectedMethod = filteredPaymentMethods.value.find(
            (method) => method.id === payloadData.idPhuongThucThanhToan
        )

        if (selectedMethod) {
            payloadData.tenPhuongThucThanhToan = selectedMethod.tenPhuongThuc
            if (selectedMethod.maPhuongThuc) {
                payloadData.maPhuongThucThanhToan = selectedMethod.maPhuongThuc
            }
        }

        // Xử lý giao hàng
        if (formData.value.canGiaoHang) {
            if (!formData.value.tenNguoiNhan || formData.value.tenNguoiNhan.trim().length === 0) {
                payloadData.tenNguoiNhan = hoaDon.value?.khachHang?.hoTen || hoaDon.value?.tenKhachHang || null
            } else {
                payloadData.tenNguoiNhan = formData.value.tenNguoiNhan
            }

            if (!formData.value.sdtNguoiNhan || formData.value.sdtNguoiNhan.trim().length === 0) {
                payloadData.sdtNguoiNhan = hoaDon.value?.khachHang?.soDienThoai || hoaDon.value?.sdt || null
            } else {
                payloadData.sdtNguoiNhan = formData.value.sdtNguoiNhan
            }

            if (diaChiFormRef?.value) {
                const diaChiForm = diaChiFormRef.value.form
                const parts = []
                if (diaChiForm.diaChi) parts.push(diaChiForm.diaChi)
                if (diaChiForm.xa) parts.push(diaChiForm.xa)
                if (diaChiForm.tinh) parts.push(diaChiForm.tinh)
                payloadData.diaChiGiaoHang = parts.join(', ') || null
                payloadData.diaChiChiTiet = diaChiForm.diaChi || null
                payloadData.tinh = diaChiForm.tinh || null
                payloadData.xa = diaChiForm.xa || null
            } else {
                payloadData.diaChiGiaoHang = null
                payloadData.diaChiChiTiet = null
                payloadData.tinh = null
                payloadData.xa = null
            }

            payloadData.ghiChuGiaoHang = formData.value.ghiChuGiaoHang || null
        } else {
            payloadData.canGiaoHang = false
            payloadData.tenNguoiNhan = null
            payloadData.sdtNguoiNhan = null
            payloadData.diaChiGiaoHang = null
            payloadData.diaChiChiTiet = null
            payloadData.tinh = null
            payloadData.xa = null
            payloadData.ghiChuGiaoHang = null
        }

        // Xử lý tiền mặt
        if (isTienMat.value) {
            if (isCOD.value) {
                payloadData.isCOD = true
                payloadData.tienKhachDua = null
                payloadData.tienTraLai = null
            } else {
                payloadData.isCOD = false
                payloadData.tienKhachDua = tienKhachDua.value
                payloadData.tienTraLai = tienThua.value
            }
        } else {
            payloadData.isCOD = false
        }

        return payloadData
    }

    const handlePayment = async (canPayFn, daQuetDu, getSerialPayloadFn, diaChiFormRef) => {
        if (!canPayFn()) {
            if (!formData.value.idPhuongThucThanhToan) {
                showWarning('Vui lòng chọn phương thức thanh toán!')
                return
            }
            if (!daQuetDu.value) {
                showWarning('Vui lòng quét đủ serial cho tất cả sản phẩm!')
                return
            }
            if (isTienMat.value && !isCOD.value && tienKhachDua.value < tongTien.value) {
                showError('Số tiền khách đưa chưa đủ!')
                return
            }
            if (formData.value.canGiaoHang) {
                if (!diaChiFormRef?.value) {
                    showError('Vui lòng nhập địa chỉ giao hàng!')
                    return
                }
                const diaChiForm = diaChiFormRef.value.form
                if (!diaChiForm.diaChi || diaChiForm.diaChi.trim().length === 0) {
                    showError('Vui lòng nhập địa chỉ giao hàng!')
                    return
                }
                if (!diaChiForm.tinhCode || !diaChiForm.tinh) {
                    showError('Vui lòng chọn tỉnh/thành phố!')
                    return
                }
            }
            showWarning('Vui lòng kiểm tra lại thông tin thanh toán!')
            return
        }

        if (isTienMat.value) {
            if (!validatePrice(tienKhachDua.value) || tienKhachDua.value < tongTien.value) {
                showError('Số tiền khách đưa không hợp lệ hoặc chưa đủ!')
                return
            }
        }

        isProcessing.value = true

        try {
            const kiemTraResponse = await kiemTraTruocThanhToan(hoaDon.value.id)
            const kiemTraData = kiemTraResponse?.data || kiemTraResponse

            if (kiemTraData?.coThayDoi) {
                let thongBaoHTML = ''
                if (kiemTraData.thayDoiGia && kiemTraData.thayDoiGia.coThayDoi) {
                    thongBaoHTML += `<div class="mb-2"><strong>📦 Giá sản phẩm:</strong><ul class="mb-0 mt-1">`
                    kiemTraData.thayDoiGia.danhSachThayDoi.forEach(item => {
                        thongBaoHTML += `<li>${item.tenSanPham}: <span class="text-decoration-line-through text-muted">${formatCurrency(item.giaCu)}</span> → <strong class="text-danger">${formatCurrency(item.giaMoi)}</strong></li>`
                    })
                    thongBaoHTML += `</ul></div>`
                }
                // Logic cho voucher và điểm (có thể thêm sau)

                thongBaoThayDoi.value = thongBaoHTML
                if (kiemTraData.hoaDonMoi) {
                    emit('hoa-don-updated', kiemTraData.hoaDonMoi)
                }
                isProcessing.value = false
                return
            } else {
                thongBaoThayDoi.value = null
            }

            const payloadData = buildPaymentPayload(getSerialPayloadFn, diaChiFormRef)

            if (isQRPayment.value) {
                pendingQRPayment.value = payloadData
                if (qrStatus.value === 'confirmed' && qrTransactionId.value) {
                    await finalizeQRPayment({ transactionId: qrTransactionId.value }, buildPaymentPayload)
                    return
                }
                try {
                    if (showQRModal.value && qrStatus.value === 'checking') {
                        showInfo('Đang chờ khách hàng quét mã QR...')
                    } else {
                        await generateQR()
                        if (!showQRModal.value) {
                            pendingQRPayment.value = null
                            showError(qrError.value || 'Không thể tạo mã QR. Vui lòng thử lại!')
                        } else {
                            showInfo('Đã hiển thị mã QR. Vui lòng chờ khách hàng thanh toán.')
                        }
                    }
                } catch (qrException) {
                    console.error('❌ Lỗi khi tạo mã QR:', qrException)
                    pendingQRPayment.value = null
                    showError('Không thể tạo mã QR. Vui lòng thử lại!')
                }
                return
            }

            emit('payment-confirmed', payloadData)
        } catch (error) {
            console.error('Lỗi trong quá trình thanh toán:', error)
            showError('Có lỗi xảy ra. Vui lòng thử lại!')
        } finally {
            isProcessing.value = false
        }
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value || 0)
    }

    return {
        // State
        paymentMethods,
        tienKhachDua,
        paymentMethodCash,
        isProcessing,
        thongBaoThayDoi,
        pendingQRPayment,
        // Computed
        tongTien,
        selectedMethodName,
        isTienMat,
        isQRPayment,
        isCOD,
        tienThua,
        filteredPaymentMethods,
        // QR Payment
        qrCodeData,
        qrLoading,
        qrError,
        qrStatus,
        showQRModal,
        qrTransactionId,
        generateQR,
        closeQRModal,
        handleQRExpired,
        // Methods
        loadPaymentMethods,
        validateTienKhachDua,
        buildPaymentPayload,
        handlePayment,
        formatCurrency
    }
}

