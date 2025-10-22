<template>
    <div class="sales-container">
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Bán hàng tại quầy</h1>
            <div class="page-actions">
                <div class="time-display me-3">{{ currentTime }}</div>
                <button class="btn btn-outline-secondary me-2" @click="fetchPendingBills" title="Xem hóa đơn chờ">
                    <i class="bi bi-receipt"></i> Hóa đơn chờ ({{ salesStore.pendingBillsCount }})
                </button>
                <button class="btn btn-primary" @click="newBill" title="Tạo hóa đơn mới">
                    <i class="bi bi-plus-lg"></i> Tạo HĐ mới
                </button>
            </div>
        </div>

        <!-- PendingBillsBar -->
        <div class="pending-bills-section">
            <PendingBillsBar :bills="salesStore.pendingBills" :selectedBillId="salesStore.currentBill.id"
                @select-bill="loadPendingBill" @remove-bill="removePendingBill" />
        </div>

        <div class="sales-body row g-2 m-0">
            <!-- Sản phẩm -->
            <div class="col-lg-8">
                <!-- Stepper quy trình bán hàng (hàng ngang nhỏ) -->
                <div class="card shadow-sm mb-2 stepper-card">
                    <div class="card-body p-2">
                        <SalesStepper :currentStep="currentStep" />
                    </div>
                </div>
                <div class="card shadow-sm product-list-card">
                    <div class="card-body p-3">
                        <ProductList :products="filteredProducts" @add-to-cart="addToCart"
                            @scan-imei="handleScanImei" />
                    </div>
                </div>
            </div>

            <!-- Thông tin giao dịch -->
            <div class="col-lg-4">
                <TransactionPanel @create-customer="showCreateCustomerModal" @apply-voucher="applyVoucher"
                    @complete-payment="completePayment" @save-pending="savePendingBill" @cancel-bill="cancelBill" />
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
import TransactionPanel from '@/components/sales/TransactionPanel.vue' // Component mới
import ProductList from '@/components/sales/ProductList.vue'
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

const currentTime = ref('')

const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }) + ' - ' + now.toLocaleDateString('vi-VN');
};

let timeInterval;

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

const fetchPendingBills = async () => {
    await salesStore.fetchPendingBills()
}

const loadPendingBill = (bill) => {
    salesStore.loadPendingBill(bill)
}

const removePendingBill = (billId) => {
    salesStore.deletePendingBill(billId)
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

onMounted(async () => {
    authStore.initialize()
    salesStore.initialize()
    await productStore.fetchAllProducts()
    await salesStore.fetchPendingBills()
    updateTime();
    timeInterval = setInterval(updateTime, 1000);
})
</script>

<style scoped>
.sales-container {
    --sales-bg: #f4f6f9;
    --card-bg: #ffffff;
    --primary-color: #0d6efd;
    --text-color: #212529;
    --border-color: #e9ecef;

    min-height: 100vh;
    background: var(--sales-bg);
    padding: 24px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0;
}

.page-actions {
    display: flex;
    align-items: center;
}

.page-actions .btn {
    font-weight: 500;
}

.time-display {
    font-size: 1rem;
    color: #495057;
    font-weight: 500;
    white-space: nowrap;
}

.pending-bills-section {
    margin-bottom: 1rem;
}

.sales-body {
    padding: 0 1.5rem;
    margin-top: 0.75rem !important;
}

.card {
    border-radius: 12px;
    border: none;
    background-color: var(--card-bg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.stepper-card {
    background: #f8fafc;
    border: 1px solid #e3e8ee;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.product-list-card {
    /* Đảm bảo card sản phẩm có chiều cao đủ để cuộn */
    /* Chiều cao viewport trừ đi chiều cao của header, pending bar, stepper và các khoảng trống */
    height: calc(100vh - 320px);
    /* Điều chỉnh lại chiều cao */
    /* Adjusted height */
    /* Điều chỉnh lại chiều cao vì header đã mỏng hơn */
    /* Điều chỉnh giá trị này nếu cần */
}
</style>