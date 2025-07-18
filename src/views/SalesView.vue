<template>
    <div class="sales-container">
        <!-- Header -->
        <div class="sales-header bg-primary text-white p-3">
            <h2 class="mb-0">Bán hàng tại quầy</h2>
            <div class="d-flex align-items-center">
                <button class="btn btn-light me-2" @click="fetchPendingBills">
                    <i class="bi bi-receipt"></i> Hóa đơn chờ ({{ salesStore.pendingBillsCount }})
                </button>
                <button class="btn btn-light" @click="newBill">
                    <i class="bi bi-plus-lg"></i> Tạo mới
                </button>
            </div>
        </div>

        <!-- PendingBillsBar -->
        <div class="mb-3">
            <PendingBillsBar :bills="salesStore.pendingBills" :selectedBillId="salesStore.currentBill.id"
                @select-bill="loadPendingBill" />
        </div>

        <div class="row g-3 m-0">
            <!-- Sản phẩm -->
            <div class="col-md-8">
                <!-- Stepper quy trình bán hàng (hàng ngang nhỏ) -->
                <div class="card shadow-sm mb-3 stepper-card">
                    <div class="card-body p-2">
                        <SalesStepper :currentStep="currentStep" />
                    </div>
                </div>
                <div class="card shadow-sm mb-3">
                    <div class="card-body p-3">
                        <ProductList :products="filteredProducts" @add-to-cart="addToCart"
                            @scan-imei="handleScanImei" />
                    </div>
                </div>
            </div>
            <!-- Thông tin giao dịch -->
            <div class="col-md-4">
                <div class="card shadow-sm mb-3">
                    <div class="card-body p-3 d-flex flex-wrap align-items-center justify-content-between">
                        <div>
                            <span class="fw-bold">Tổng: </span>
                            <span class="text-success fw-bold">{{ formatCurrency(salesStore.subtotal) }}</span>
                        </div>
                        <div v-if="salesStore.currentBill.discount > 0">
                            <span class="fw-bold">Giảm: </span>
                            <span class="text-warning">-{{ formatCurrency(salesStore.currentBill.discount) }}</span>
                        </div>
                        <div v-if="salesStore.currentBill.voucher">
                            <span class="fw-bold">Voucher: </span>
                            <span class="badge bg-info text-dark">{{ salesStore.currentBill.voucher.maVoucher }}</span>
                        </div>
                        <div>
                            <span class="fw-bold">Thành tiền: </span>
                            <span class="text-primary fw-bold">{{ formatCurrency(salesStore.total) }}</span>
                        </div>
                    </div>
                </div>
                <div class="card shadow-sm mb-3">
                    <div class="card-body p-3">
                        <CustomerInfo v-model:customer="salesStore.currentBill.customer"
                            @search-customer="searchCustomer" @create-customer="showCreateCustomerModal" />
                    </div>
                </div>
                <div class="card shadow-sm mb-3">
                    <div class="card-body p-3">
                        <CartSidebar :items="salesStore.cartItems" @update-quantity="updateQuantity"
                            @remove-item="removeFromCart" />
                    </div>
                </div>
                <div class="card shadow-sm mb-3">
                    <div class="card-body p-3">
                        <BillInfo :subtotal="salesStore.subtotal" :discount="salesStore.currentBill.discount"
                            :total="salesStore.total" @apply-voucher="applyVoucher" />
                    </div>
                </div>
                <div class="card shadow-sm">
                    <div class="card-body p-3">
                        <PaymentSection :total="salesStore.total" @complete-payment="completePayment" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal tạo khách hàng mới -->
        <CustomerModal v-if="showCustomerModal" @close="showCustomerModal = false" @save="handleSaveCustomer" />
        <!-- Modal quét IMEI -->
        <ScanImeiModal v-if="showScanModal" @close="showScanModal = false" @scan-complete="handleImeiScanned" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ProductList from '@/components/sales/ProductList.vue'
import CustomerInfo from '@/components/sales/CustomerInfo.vue'
import CartSidebar from '@/components/sales/CartSidebar.vue'
import BillInfo from '@/components/sales/BillInfo.vue'
import PaymentSection from '@/components/sales/PaymentSection.vue'
import CustomerModal from '@/components/customers/CustomerModal.vue'
import ScanImeiModal from '@/components/sales/ScanImeiModal.vue'
import PendingBillsBar from '@/components/sales/PendingBillsBar.vue'
import SalesStepper from '@/components/sales/SalesStepper.vue'
import { useAuthStore } from '@/stores/authStore'
import { useSalesStore } from '@/stores/salesStore'
import { useProductStore } from '@/stores/productStore'

const authStore = useAuthStore()
const salesStore = useSalesStore()
const productStore = useProductStore()

const showCustomerModal = ref(false)
const showScanModal = ref(false)

// Quy trình bán hàng: 1-Chọn SP, 2-Khách hàng, 3-Voucher, 4-Thanh toán
const currentStep = ref(1)
watch(
    [() => salesStore.cartItems.length, () => salesStore.currentBill.customer, () => salesStore.currentBill.voucher],
    ([cartLen, customer, voucher]) => {
        if (!cartLen) currentStep.value = 1
        else if (cartLen && !customer) currentStep.value = 2
        else if (cartLen && customer && !voucher) currentStep.value = 3
        else if (cartLen && customer && voucher) currentStep.value = 4
    },
    { immediate: true }
)

const filteredProducts = computed(() => {
    return (productStore.products || []).filter(product => {
        const hasStock = product.variants?.some(variant => (variant.imeiCount || 0) > 0)
        return hasStock
    })
})

const addToCart = (product, quantity = 1) => {
    salesStore.addToCart(product, quantity)
}

const updateQuantity = (itemIndex, newQuantity) => {
    salesStore.updateCartItemQuantity(itemIndex, newQuantity)
}

const removeFromCart = (itemIndex) => {
    salesStore.removeFromCart(itemIndex)
}

const fetchPendingBills = async () => {
    await salesStore.fetchPendingBills()
}

const loadPendingBill = (bill) => {
    salesStore.loadPendingBill(bill)
}

const newBill = () => {
    salesStore.createNewBill()
}

const searchCustomer = async (query) => {
    // Implement customer search logic
    console.log('Searching customer:', query)
}

const showCreateCustomerModal = () => {
    showCustomerModal.value = true
}

const handleSaveCustomer = (customer) => {
    salesStore.setCustomer(customer)
    showCustomerModal.value = false
}

const applyVoucherPrompt = async () => {
    const voucherCode = prompt('Nhập mã voucher:')
    if (voucherCode) {
        const result = await salesStore.applyVoucher(voucherCode)
        if (result.success) {
            alert('Áp dụng voucher thành công!')
        } else {
            alert(result.message || 'Voucher không hợp lệ')
        }
    }
}

const applyVoucher = async (voucherCode) => {
    const result = await salesStore.applyVoucher(voucherCode)
    if (result.success) {
        alert('Áp dụng voucher thành công!')
    } else {
        alert(result.message || 'Voucher không hợp lệ')
    }
}

const handleScanImei = () => {
    showScanModal.value = true
}

const handleImeiScanned = async (imeiData) => {
    const product = await salesStore.findProductByImei(imeiData.imei)
    if (product) {
        salesStore.addToCart(product, 1, imeiData.imei)
        alert('Đã thêm sản phẩm vào giỏ hàng!')
    } else {
        alert('Không tìm thấy sản phẩm với IMEI này')
    }
    showScanModal.value = false
}

const completePayment = async () => {
    // Giả lập dữ liệu thanh toán, bạn có thể truyền paymentData thực tế nếu cần
    const paymentData = {}
    const result = await salesStore.completePayment(paymentData)
    if (result.success) {
        alert('Tạo hóa đơn thành công!')
        newBill()
    } else {
        alert(result.message || 'Có lỗi xảy ra khi tạo hóa đơn')
    }
}

const savePendingBill = async () => {
    if (!salesStore.cartItems.length) {
        alert('Giỏ hàng trống!')
        return
    }
    const result = await salesStore.savePendingBill()
    if (result.success) {
        alert('Đã lưu hóa đơn chờ!')
    } else {
        alert(result.message || 'Lỗi khi lưu hóa đơn')
    }
}

const clearCart = () => {
    if (confirm('Bạn có chắc muốn xóa giỏ hàng?')) {
        salesStore.clearCart()
    }
}

const cancelBill = () => {
    if (confirm('Bạn có chắc muốn hủy hóa đơn này?')) {
        salesStore.createNewBill()
    }
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

onMounted(async () => {
    authStore.initialize()
    salesStore.initialize()
    await productStore.fetchAllProducts()
    await salesStore.fetchPendingBills()
})
</script>

<style scoped>
.sales-container {
    min-height: 100vh;
    background: #f6fafd;
    padding-bottom: 32px;
}

.sales-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e3e8ee;
}

.card {
    border-radius: 12px;
    border: none;
}

.shadow-sm {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}

.status-bar {
    font-size: 1.1em;
    background: #f6fafd;
    border: 1px solid #e3e8ee;
    border-radius: 8px;
}

.stepper-card {
    background: #f8fafc;
    border: 1px solid #e3e8ee;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    margin-bottom: 8px;
}
</style>