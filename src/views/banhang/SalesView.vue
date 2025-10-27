<template>
    <div class="sales-view">
        <!-- Header -->
        <div class="sales-header">
            <h2 class="page-title">
                <i class="bi bi-cart3"></i> Bán hàng tại quầy
            </h2>
            <div class="header-actions">
                <button class="btn btn-success" @click="taoHoaDonMoi" :disabled="isLoading">
                    <i class="bi bi-plus-circle"></i> Tạo hóa đơn mới
                </button>
            </div>
        </div>

        <!-- Danh sách hóa đơn chờ -->
        <PendingBillsBar :bills="danhSachHoaDonCho" :selectedBillId="hoaDonHienTai?.id" @select-bill="chonHoaDon"
            @remove-bill="xoaHoaDonCho" />

        <!-- Main Content -->
        <div class="sales-content" v-if="hoaDonHienTai">
            <div class="row g-3">
                <!-- Left Panel: Tìm kiếm & Chi tiết hóa đơn -->
                <div class="col-lg-8">
                    <!-- Tìm kiếm sản phẩm -->
                    <div class="card mb-3">
                        <div class="card-body">
                            <TimKiemSanPham @product-selected="handleProductSelected" />
                        </div>
                    </div>

                    <!-- Chi tiết hóa đơn -->
                    <ChiTietHoaDon :hoaDon="hoaDonHienTai" @delete-item="handleDeleteItem" />
                </div>

                <!-- Right Panel: Thông tin khách hàng & Thanh toán -->
                <div class="col-lg-4">
                    <!-- Thông tin khách hàng -->
                    <CustomerInfo :customer="hoaDonHienTai.khachHang" @update:customer="handleUpdateCustomer"
                        @search-customer="handleSearchCustomer" @create-customer="handleCreateCustomer" />

                    <!-- Thông tin hóa đơn -->
                    <BillInfo :subtotal="hoaDonHienTai.tongTien || 0" :discount="hoaDonHienTai.tienDuocGiam || 0"
                        @apply-voucher="handleApplyVoucher" />

                    <!-- Thanh toán -->
                    <PaymentSection :total="hoaDonHienTai.tongTienSauGiam || hoaDonHienTai.tongTien || 0"
                        @complete-payment="openPaymentModal" />
                </div>
            </div>
        </div>

        <!-- Hiển thị khi chưa có hóa đơn -->
        <div v-else class="empty-state">
            <i class="bi bi-receipt"></i>
            <h4>Chưa có hóa đơn nào</h4>
            <p>Nhấn "Tạo hóa đơn mới" để bắt đầu bán hàng</p>
            <button class="btn btn-primary btn-lg" @click="taoHoaDonMoi">
                <i class="bi bi-plus-circle"></i> Tạo hóa đơn mới
            </button>
        </div>

        <!-- Modal nhập số lượng sản phẩm -->
        <div v-if="showQuantityModal" class="modal fade show d-block" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nhập số lượng</h5>
                        <button type="button" class="btn-close" @click="closeQuantityModal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="selectedProduct" class="product-info-modal mb-3">
                            <h6>{{ selectedProduct.tenSP }}</h6>
                            <p class="text-muted mb-1">Giá: {{ formatCurrency(selectedProduct.giaBan) }}</p>
                            <p class="text-muted mb-0">Tồn kho: {{ selectedProduct.soLuongTon || 0 }}</p>
                        </div>
                        <label class="form-label">Số lượng <span class="text-danger">*</span></label>
                        <input type="number" class="form-control" v-model.number="soLuongNhap"
                            :max="selectedProduct?.soLuongTon || 99" min="1" placeholder="Nhập số lượng"
                            @keyup.enter="confirmAddProduct" ref="quantityInput" />
                        <small class="text-danger" v-if="soLuongNhap > (selectedProduct?.soLuongTon || 0)">
                            Số lượng vượt quá tồn kho!
                        </small>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeQuantityModal">
                            Hủy
                        </button>
                        <button type="button" class="btn btn-primary" @click="confirmAddProduct"
                            :disabled="soLuongNhap < 1 || soLuongNhap > (selectedProduct?.soLuongTon || 0)">
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show"></div>
        </div>

        <!-- Modal thanh toán -->
        <ModalThanhToan v-if="showPaymentModal" :hoaDon="hoaDonHienTai" @close="closePaymentModal"
            @payment-confirmed="handlePaymentConfirmed" />

        <!-- Loading overlay -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PendingBillsBar from '@/components/sales/PendingBillsBar.vue'
import TimKiemSanPham from '@/components/banhang/TimKiemSanPham.vue'
import ChiTietHoaDon from '@/components/banhang/ChiTietHoaDon.vue'
import CustomerInfo from '@/components/sales/CustomerInfo.vue'
import BillInfo from '@/components/sales/BillInfo.vue'
import PaymentSection from '@/components/sales/PaymentSection.vue'
import ModalThanhToan from '@/components/banhang/ModalThanhToan.vue'

import {
    taoHoaDonChoMoi,
    themSanPhamVaoHoaDon,
    xoaSanPhamKhoiHoaDon,
    thanhToanHoaDon
} from '@/service/banHangService'

import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// State
const danhSachHoaDonCho = ref([])
const hoaDonHienTai = ref(null)
const isLoading = ref(false)

// Modal states
const showQuantityModal = ref(false)
const showPaymentModal = ref(false)
const selectedProduct = ref(null)
const soLuongNhap = ref(1)
const quantityInput = ref(null)

// ==================== QUẢN LÝ HÓA ĐƠN ====================

/**
 * Tạo hóa đơn mới
 */
const taoHoaDonMoi = async () => {
    // Lấy ID nhân viên từ authStore
    const nhanVienId = authStore.getUserId

    if (!nhanVienId) {
        alert('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!')
        router.push('/login')
        return
    }

    isLoading.value = true
    try {
        const payload = {
            nhanVienId: nhanVienId,
            khachHangId: null // Khách vãng lai
        }

        console.log('Payload tạo hóa đơn:', payload)
        console.log('Nhân viên:', authStore.getUserName)

        const response = await taoHoaDonChoMoi(payload)

        console.log('Response từ API:', response)

        if (response && response.data) {
            const newBill = response.data

            // Thêm vào danh sách hóa đơn chờ
            danhSachHoaDonCho.value.push(newBill)

            // Tự động chọn hóa đơn mới tạo
            hoaDonHienTai.value = newBill

            // Thông báo thành công
            console.log('Tạo hóa đơn thành công:', newBill)
        }
    } catch (error) {
        console.error('Lỗi khi tạo hóa đơn:', error)
        console.error('Error response:', error.response?.data)

        const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            'Không thể tạo hóa đơn. Vui lòng thử lại!'
        alert(errorMessage)
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
 * Xóa hóa đơn chờ
 */
const xoaHoaDonCho = (billId) => {
    const index = danhSachHoaDonCho.value.findIndex(b => b.id === billId)
    if (index > -1) {
        danhSachHoaDonCho.value.splice(index, 1)

        // Nếu xóa hóa đơn đang được chọn
        if (hoaDonHienTai.value?.id === billId) {
            hoaDonHienTai.value = danhSachHoaDonCho.value[0] || null
        }
    }
}

// ==================== QUẢN LÝ SẢN PHẨM ====================

/**
 * Xử lý khi chọn sản phẩm từ tìm kiếm
 */
const handleProductSelected = (product) => {
    selectedProduct.value = product
    soLuongNhap.value = 1
    showQuantityModal.value = true

    // Focus vào input số lượng
    nextTick(() => {
        if (quantityInput.value) {
            quantityInput.value.focus()
        }
    })
}

/**
 * Xác nhận thêm sản phẩm vào hóa đơn
 */
const confirmAddProduct = async () => {
    if (!selectedProduct.value || !hoaDonHienTai.value) {
        return
    }

    if (soLuongNhap.value < 1 || soLuongNhap.value > (selectedProduct.value.soLuongTon || 0)) {
        alert('Số lượng không hợp lệ!')
        return
    }

    isLoading.value = true
    try {
        const payload = {
            chiTietSanPhamId: selectedProduct.value.id,
            soLuong: soLuongNhap.value
        }

        const response = await themSanPhamVaoHoaDon(hoaDonHienTai.value.id, payload)

        if (response && response.data) {
            // Cập nhật hóa đơn hiện tại với dữ liệu mới
            hoaDonHienTai.value = response.data

            // Cập nhật trong danh sách chờ
            const index = danhSachHoaDonCho.value.findIndex(b => b.id === hoaDonHienTai.value.id)
            if (index > -1) {
                danhSachHoaDonCho.value[index] = response.data
            }

            // Đóng modal
            closeQuantityModal()

            console.log('Thêm sản phẩm thành công')
        }
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error)
        alert(error.response?.data?.message || 'Không thể thêm sản phẩm. Vui lòng thử lại!')
    } finally {
        isLoading.value = false
    }
}

/**
 * Xóa sản phẩm khỏi hóa đơn
 */
const handleDeleteItem = async (idHoaDonChiTiet) => {
    isLoading.value = true
    try {
        const response = await xoaSanPhamKhoiHoaDon(idHoaDonChiTiet)

        if (response && response.data) {
            // Cập nhật hóa đơn hiện tại
            hoaDonHienTai.value = response.data

            // Cập nhật trong danh sách chờ
            const index = danhSachHoaDonCho.value.findIndex(b => b.id === hoaDonHienTai.value.id)
            if (index > -1) {
                danhSachHoaDonCho.value[index] = response.data
            }

            console.log('Xóa sản phẩm thành công')
        }
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error)
        alert('Không thể xóa sản phẩm. Vui lòng thử lại!')
    } finally {
        isLoading.value = false
    }
}

// ==================== QUẢN LÝ KHÁCH HÀNG ====================

const handleUpdateCustomer = (customer) => {
    if (hoaDonHienTai.value) {
        hoaDonHienTai.value.khachHang = customer
    }
}

const handleSearchCustomer = (keyword) => {
    // TODO: Implement search customer logic
    console.log('Tìm kiếm khách hàng:', keyword)
}

const handleCreateCustomer = () => {
    // TODO: Implement create customer modal
    console.log('Tạo khách hàng mới')
}

// ==================== QUẢN LÝ VOUCHER ====================

const handleApplyVoucher = (voucherCode) => {
    // TODO: Implement apply voucher logic
    console.log('Áp dụng voucher:', voucherCode)
}

// ==================== THANH TOÁN ====================

/**
 * Mở modal thanh toán
 */
const openPaymentModal = () => {
    if (!hoaDonHienTai.value || !hoaDonHienTai.value.hoaDonChiTiet || hoaDonHienTai.value.hoaDonChiTiet.length === 0) {
        alert('Vui lòng thêm sản phẩm vào hóa đơn trước khi thanh toán!')
        return
    }
    showPaymentModal.value = true
}

/**
 * Xử lý xác nhận thanh toán
 */
const handlePaymentConfirmed = async (paymentData) => {
    isLoading.value = true
    try {
        const response = await thanhToanHoaDon(hoaDonHienTai.value.id, paymentData)

        if (response && response.data) {
            // Thông báo thành công
            alert('Thanh toán thành công!')

            // Xóa hóa đơn khỏi danh sách chờ
            const index = danhSachHoaDonCho.value.findIndex(b => b.id === hoaDonHienTai.value.id)
            if (index > -1) {
                danhSachHoaDonCho.value.splice(index, 1)
            }

            // Chọn hóa đơn tiếp theo hoặc để trống
            hoaDonHienTai.value = danhSachHoaDonCho.value[0] || null

            // Đóng modal
            closePaymentModal()

            // TODO: In hóa đơn hoặc chuyển sang trang chi tiết hóa đơn
            console.log('Thanh toán thành công:', response.data)
        }
    } catch (error) {
        console.error('Lỗi khi thanh toán:', error)
        alert(error.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại!')
    } finally {
        isLoading.value = false
    }
}

// ==================== MODAL HANDLERS ====================

const closeQuantityModal = () => {
    showQuantityModal.value = false
    selectedProduct.value = null
    soLuongNhap.value = 1
}

const closePaymentModal = () => {
    showPaymentModal.value = false
}

// ==================== UTILITIES ====================

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

// ==================== LIFECYCLE ====================

onMounted(() => {
    console.log('SalesView mounted')
    console.log('User đã đăng nhập:', authStore.getUserName)
    console.log('User ID:', authStore.getUserId)

    // TODO: Load danh sách hóa đơn chờ nếu có
})
</script>

<style scoped>
.sales-view {
    padding: 1.5rem;
    background-color: #f4f6f9;
    min-height: 100vh;
}

.sales-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #dee2e6;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #212529;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.sales-content {
    margin-top: 1.5rem;
}

.empty-state {
    text-align: center;
    padding: 5rem 2rem;
    color: #6c757d;
}

.empty-state i {
    font-size: 6rem;
    margin-bottom: 1rem;
    opacity: 0.3;
}

.empty-state h4 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.empty-state p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.product-info-modal h6 {
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.modal-backdrop {
    opacity: 0.5;
}

/* Responsive */
@media (max-width: 991px) {
    .sales-view {
        padding: 1rem;
    }

    .sales-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}
</style>
