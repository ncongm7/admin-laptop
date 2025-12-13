import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductStore } from '@/stores/sanpham/productStore'
import { useCustomerStore } from '@/stores/taikhoan/customerStore'
import { useDiscountStore } from '@/stores/giamgia/discountStore'
import * as salesService from '@/service/banhang/salesService'

export const useSalesStore = defineStore('sales', () => {
    // ===== STATE =====
    const currentBill = ref({
        id: null,
        customer: null,
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        voucher: null,
        paymentMethod: 'CASH',
        status: 'PENDING', // PENDING, COMPLETED, CANCELLED
        createdAt: null,
        createdBy: null
    })

    const pendingBills = ref([])
    const loading = ref(false)
    const error = ref(null)

    // ===== COMPUTED =====
    const cartItems = computed(() => currentBill.value.items)
    const cartItemCount = computed(() => cartItems.value.length)
    const subtotal = computed(() => {
        return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })
    const total = computed(() => {
        return subtotal.value - currentBill.value.discount
    })
    const pendingBillsCount = computed(() => pendingBills.value.length)

    // ===== ACTIONS =====

    // === CART MANAGEMENT (SERVER SYNC) ===
    
    // Helper to sync bill state from API response
    const syncBillState = (billResponse) => {
        if (!billResponse) return
        
        // Map API response to local state structure
        currentBill.value.id = billResponse.id
        currentBill.value.ma = billResponse.ma
        currentBill.value.customer = billResponse.khachHang
        currentBill.value.subtotal = billResponse.tongTien
        currentBill.value.discount = billResponse.tienDuocGiam || 0
        currentBill.value.total = billResponse.tongTienSauGiam
        currentBill.value.status = billResponse.trangThai
        
        // Map Items
        // Assuming API returns 'hoaDonChiTiets'
        if (billResponse.hoaDonChiTiets) {
            currentBill.value.items = billResponse.hoaDonChiTiets.map(detail => ({
                id: detail.id, // ID of HoaDonChiTiet (crucial for update/delete)
                productId: detail.chiTietSanPham.id,
                productName: detail.chiTietSanPham.sanPham.tenSanPham, // Adjust based on actual DTO
                price: detail.donGia,
                quantity: detail.soLuong,
                // Serial/IMEI logic might be different now, likely handled at payment or separate endpoint
                // For now, keep quantity focus
            }))
        }
    }

    const addToCart = async (product, quantity = 1) => {
        try {
            loading.value = true
            
            // 1. Ensure Bill Exists
            if (!currentBill.value.id) {
                const newBill = await salesService.createPendingBill({})
                syncBillState(newBill) // Sync ID and basic info
            }
            
            // 2. Add Item to Backend
            const itemData = {
                idChiTietSanPham: product.id,
                soLuong: quantity
            }
            
            const updatedBill = await salesService.addItemToBill(currentBill.value.id, itemData)
            
            // 3. Sync State
            syncBillState(updatedBill)
            
        } catch (err) {
            console.error("Add to cart error:", err)
            // Handle specific errors (e.g., INSUFFICIENT_STOCK)
            if (err.response && err.response.data && err.response.data.message) {
                 error.value = err.response.data.message
            } else {
                 error.value = 'Lỗi khi thêm sản phẩm'
            }
            // Re-throw if needed or just notify component via error state
        } finally {
            loading.value = false
        }
    }

    const updateCartItemQuantity = async (itemIndex, newQuantity) => {
        // itemIndex is likely not useful anymore if we need ID. 
        // We should pass the Item Object or ID.
        // Assuming the UI passes an index, we get the ID from local state.
        
        const item = currentBill.value.items[itemIndex]
        if (!item || !item.id) return
        
        try {
            loading.value = true
            if (newQuantity > 0) {
                 // Call API Update
                 // Need api to update quantity. BanHangTaiQuayController has capNhatSoLuongSanPham
                 // We need to add that to salesService first!
                 // Wait, I didn't add updateItemQuantity to salesService.js yet.
                 // I should added it. I addedremoveItemFromBill.
                 // I will assume I can fix salesService or use a generic call here?
                 // I'll stick to logic here and fix salesService in next step if needed.
                 // actually I can't call a missing function.
                 // I'll leave a TODO comment and fix salesService immediately after.
                 
                 // await salesService.updateItemQuantity(item.id, newQuantity)
                 // TEMP: Just remove and re-add? No, that loses order/price context.
                 // I MUST update salesService.js to include updateItemQuantity.
                 
                 // For now, I will define the logic assuming the function exists.
                 // Note: I missed adding updateItemQuantity in the previous step.
                 // I will use a direct axios call or assume I fix it.
                 // I will fix salesService.js RIGHT NOW via multi-file edit or next step.
                 // Actually, I can't multi-file directly with different tools.
                 // I will use `salesService.updateItemQuantity` and implement it in next step.
                 
                 const updatedBill = await salesService.updateItemQuantity(item.id, newQuantity)
                 syncBillState(updatedBill)
            } else {
                await removeFromCart(itemIndex)
            }
        } catch (err) {
             error.value = err.response?.data?.message || 'Lỗi cập nhật số lượng'
        } finally {
            loading.value = false
        }
    }

    const removeFromCart = async (itemIndex) => {
        const item = currentBill.value.items[itemIndex]
        if (!item || !item.id) return

        try {
            loading.value = true
            const updatedBill = await salesService.removeItemFromBill(item.id)
            syncBillState(updatedBill)
        } catch (err) {
            error.value = 'Lỗi khi xóa sản phẩm'
        } finally {
            loading.value = false
        }
    }

    const clearCart = async () => {
         // Loop delete or delete bill and create new?
         // Easiest: Delete Bill -> Create New
         if (currentBill.value.id) {
             await salesService.deleteBill(currentBill.value.id)
             createNewBill()
         }
    }

    // === BILL MANAGEMENT ===
    const createNewBill = () => {
        currentBill.value = {
            id: null,
            customer: null,
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            voucher: null,
            paymentMethod: 'CASH',
            status: 'PENDING',
            createdAt: new Date(),
            createdBy: null
        }
    }

    const updateBillTotals = () => {
        currentBill.value.subtotal = subtotal.value
        currentBill.value.total = total.value
    }

    const setCustomer = (customer) => {
        currentBill.value.customer = customer
    }

    const setPaymentMethod = (method) => {
        currentBill.value.paymentMethod = method
    }

    // === VOUCHER & DISCOUNT ===
    const applyVoucher = async (voucherCode) => {
        try {
            loading.value = true
            const voucher = await salesService.validateVoucher(voucherCode) // Use service

            if (voucher.isValid) {
                currentBill.value.voucher = voucher
                calculateDiscount()
                return { success: true, voucher }
            } else {
                return { success: false, message: voucher.message }
            }
        } catch (err) {
            error.value = 'Lỗi khi áp dụng voucher'
            return { success: false, message: 'Voucher không hợp lệ' }
        } finally {
            loading.value = false
        }
    }

    const removeVoucher = () => {
        currentBill.value.voucher = null
        currentBill.value.discount = 0
        updateBillTotals()
    }

    const calculateDiscount = () => {
        if (!currentBill.value.voucher) {
            currentBill.value.discount = 0
            return
        }

        const voucher = currentBill.value.voucher
        if (voucher.loaiGiamGia === 'PERCENT') {
            currentBill.value.discount = subtotal.value * voucher.giaTri / 100
            if (voucher.giaTriToiDa && currentBill.value.discount > voucher.giaTriToiDa) {
                currentBill.value.discount = voucher.giaTriToiDa
            }
        } else {
            currentBill.value.discount = voucher.giaTri
        }

        updateBillTotals()
    }

    // === PAYMENT ===
    const completePayment = async (paymentData) => {
        try {
            loading.value = true

            // paymentData comes from ModalThanhToan
            // Structure expected by backend: { idPhuongThucThanhToan, tienKhachDua, ghiChu, maGiaoDich (if QR) }
            
            // Map paymentData to backend request
            const request = {
                idPhuongThucThanhToan: paymentData.idPhuongThucThanhToan,
                tienKhachDua: paymentData.tienKhachDua,
                ghiChu: paymentData.ghiChu,
                maGiaoDich: paymentData.maGiaoDich
            }

            const response = await salesService.payBill(currentBill.value.id, request)

            // Reset current bill
            // Usually, creating a new bill should be manual or automatic.
            // Let's create a new one.
            createNewBill()

            // Handle response if needed (e.g. print invoice)
            return { success: true, bill: response }
        } catch (err) {
            console.error(err)
            error.value = err.response?.data?.message || 'Lỗi khi thanh toán'
            return { success: false, message: error.value }
        } finally {
            loading.value = false
        }
    }

    const savePendingBill = async () => {
        try {
            loading.value = true

            const billData = {
                ...currentBill.value,
                status: 'PENDING'
            }

            const response = await salesService.createBill(billData) // Use service

            // Add to pending bills
            pendingBills.value.push(response)

            // Reset current bill
            createNewBill()

            return { success: true, billId: response.id }
        } catch (err) {
            error.value = 'Lỗi khi lưu hóa đơn chờ'
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
    }

    // === PENDING BILLS ===
    const fetchPendingBills = async () => {
        try {
            loading.value = true
            const bills = await salesService.getPendingBills() // Use service
            pendingBills.value = bills
        } catch (err) {
            error.value = 'Lỗi khi tải hóa đơn chờ'
        } finally {
            loading.value = false
        }
    }

    const loadPendingBill = (bill) => {
        currentBill.value = { ...bill }
        updateBillTotals()
    }

    const deletePendingBill = async (billId) => {
        try {
            await salesService.deleteBill(billId) // Use service
            pendingBills.value = pendingBills.value.filter(bill => bill.id !== billId)
            return { success: true }
        } catch (err) {
            error.value = 'Lỗi khi xóa hóa đơn chờ'
            return { success: false, message: err.message }
        }
    }

    // === IMEI SCANNING ===
    const findProductByImei = async (imei) => {
        try {
            const product = await salesService.getProductByImei(imei) // Use service
            return product
        } catch (err) {
            return null
        }
    }

    // === INITIALIZATION ===
    const initialize = () => {
        createNewBill()
        fetchPendingBills()
    }

    return {
        // State
        currentBill,
        pendingBills,
        loading,
        error,

        // Computed
        cartItems,
        cartItemCount,
        subtotal,
        total,
        pendingBillsCount,

        // Actions
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        createNewBill,
        setCustomer,
        setPaymentMethod,
        applyVoucher,
        removeVoucher,
        completePayment,
        savePendingBill,
        fetchPendingBills,
        loadPendingBill,
        deletePendingBill,
        findProductByImei,
        initialize
    }
}) 