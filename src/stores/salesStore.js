import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductStore } from './productStore'
import { useCustomerStore } from './customerStore'
import { useDiscountStore } from './discountStore'
import axios from '@/service/axiosInstance'

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

    // === CART MANAGEMENT ===
    const addToCart = (product, quantity = 1, imei = null) => {
        const existingItem = currentBill.value.items.find(item =>
            item.productId === product.id && item.imei === imei
        )

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            currentBill.value.items.push({
                productId: product.id,
                productName: product.tenSanPham,
                price: product.giaBan,
                quantity: quantity,
                imei: imei,
                variant: product.variant || null
            })
        }

        updateBillTotals()
    }

    const updateCartItemQuantity = (itemIndex, newQuantity) => {
        if (newQuantity > 0) {
            currentBill.value.items[itemIndex].quantity = newQuantity
        } else {
            removeFromCart(itemIndex)
        }
        updateBillTotals()
    }

    const removeFromCart = (itemIndex) => {
        currentBill.value.items.splice(itemIndex, 1)
        updateBillTotals()
    }

    const clearCart = () => {
        currentBill.value.items = []
        updateBillTotals()
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
            const response = await axios.post('/api/vouchers/validate', { code: voucherCode })
            const voucher = response.data

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

            const billData = {
                ...currentBill.value,
                payment: paymentData,
                status: 'COMPLETED',
                completedAt: new Date()
            }

            const response = await axios.post('/api/bills', billData)

            // Reset current bill
            createNewBill()

            return { success: true, billId: response.data.id }
        } catch (err) {
            error.value = 'Lỗi khi tạo hóa đơn'
            return { success: false, message: err.message }
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

            const response = await axios.post('/api/bills', billData)

            // Add to pending bills
            pendingBills.value.push(response.data)

            // Reset current bill
            createNewBill()

            return { success: true, billId: response.data.id }
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
            const response = await axios.get('/api/bills?status=PENDING')
            pendingBills.value = response.data
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
            await axios.delete(`/api/bills/${billId}`)
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
            const response = await axios.get(`/api/imei/${imei}/product`)
            return response.data
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