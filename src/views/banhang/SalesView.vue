<template>
  <div class="sales-view">
    <!-- Header -->
    <div class="sales-header">
      <h2 class="page-title"><i class="bi bi-shop"></i> Bán hàng tại quầy</h2>
      <div class="header-actions">
        <!-- Nút in hóa đơn (chỉ hiện khi có hóa đơn) -->
        <InvoicePrint
          v-if="hoaDonHienTai"
          :hoaDon="hoaDonHienTai"
          :allowDraft="true"
          @printed="handleInvoicePrinted"
          class="me-2"
        />
        <button
          class="btn btn-success btn-lg"
          @click="taoHoaDonMoi"
          :disabled="isLoading || daDatGioiHan"
          :title="daDatGioiHan ? 'Đã đạt giới hạn tối đa 10 hóa đơn chờ' : 'Tạo hóa đơn mới'"
        >
          <i class="bi bi-plus-circle"></i> Tạo Đơn Mới
          <span v-if="daDatGioiHan" class="badge bg-danger ms-2">Đã đầy</span>
        </button>
      </div>
    </div>

    <!-- Main Content - Layout 3 Cột -->
    <div class="sales-content" v-if="hoaDonHienTai">
      <div class="row g-3">
        <!-- CỘT 1: Danh sách Hóa đơn chờ & Thông tin Khách hàng -->
        <div class="col-lg-3">
          <!-- Danh sách Hóa đơn chờ -->
          <TransactionTabs
            :bills="danhSachHoaDonCho"
            :selectedBillId="hoaDonHienTai?.id"
            :isCopying="isCopyingBill"
            :copyingBillId="copyingBillId"
            @select-bill="chonHoaDon"
            @remove-bill="xoaHoaDonCho"
            @create-new="taoHoaDonMoi"
            @copy-bill="handleCopyBill"
          />

          <!-- Thông tin Khách hàng -->
          <CustomerInfo
            :customer="hoaDonHienTai.khachHang"
            @update:customer="handleUpdateCustomer"
            @search-customer="handleSearchCustomer"
            @create-customer="handleCreateCustomer"
          />
        </div>

        <!-- CỘT 2: Danh mục & Tìm kiếm Sản phẩm -->
        <div class="col-lg-5">
          <ProductSearch @product-selected="handleProductSelected" @scan-imei="handleScanImei" />
        </div>

        <!-- CỘT 3: Chi tiết Hóa đơn hiện tại -->
        <div class="col-lg-4">
          <InvoiceDetails
            :hoaDon="hoaDonHienTai"
            @delete-item="handleDeleteItem"
            @apply-voucher="handleApplyVoucher"
            @use-points="handleUsePoints"
            @open-voucher-modal="openVoucherModal"
            @remove-voucher="handleRemoveVoucher"
            @complete-payment="openPaymentModal"
            @save-draft="handleSaveDraft"
            @cancel-bill="handleCancelBill"
            @update-item="handleUpdateItem"
          />
        </div>
      </div>
    </div>

    <!-- Thống kê & Lịch sử giao dịch -->
    <div class="row g-3 mt-3">
      <div class="col-lg-6">
        <SalesQuickStats />
      </div>
      <div class="col-lg-6">
        <RecentTransactions />
      </div>
    </div>

    <!-- Hiển thị khi chưa có hóa đơn -->
    <div v-else class="empty-state">
      <i class="bi bi-receipt"></i>
      <h4>Chưa có hóa đơn nào</h4>
      <p>Nhấn "Tạo Đơn Mới" để bắt đầu bán hàng</p>
      <button
        class="btn btn-primary btn-lg"
        @click="taoHoaDonMoi"
        :disabled="daDatGioiHan"
        :title="daDatGioiHan ? 'Đã đạt giới hạn tối đa 10 hóa đơn chờ' : 'Tạo hóa đơn mới'"
      >
        <i class="bi bi-plus-circle"></i> Tạo Đơn Mới
        <span v-if="daDatGioiHan" class="badge bg-danger ms-2">Đã đầy</span>
      </button>
    </div>

    <!-- Modal nhập số lượng sản phẩm -->
    <template v-if="showQuantityModal">
      <!-- Backdrop -->
      <div class="modal-backdrop fade show"></div>

      <!-- Modal -->
      <div class="modal fade show d-block" tabindex="-1" style="z-index: 9999">
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
              <input
                type="number"
                class="form-control"
                v-model.number="soLuongNhap"
                :max="selectedProduct?.soLuongTon || 99"
                min="1"
                placeholder="Nhập số lượng"
                @keyup.enter="confirmAddProduct"
                ref="quantityInput"
              />
              <small class="text-danger" v-if="soLuongNhap > (selectedProduct?.soLuongTon || 0)">
                Số lượng vượt quá tồn kho!
              </small>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeQuantityModal">
                Hủy
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="confirmAddProduct"
                :disabled="soLuongNhap < 1 || soLuongNhap > (selectedProduct?.soLuongTon || 0)"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal thanh toán -->
    <ModalThanhToan
      v-if="showPaymentModal"
      :hoaDon="hoaDonHienTai"
      @close="closePaymentModal"
      @payment-confirmed="handlePaymentConfirmed"
    />

    <!-- Modal gợi ý voucher -->
    <VoucherSuggestionModal
      :visible="showVoucherModal"
      :idHoaDon="hoaDonHienTai?.id"
      @close="closeVoucherModal"
      @voucher-selected="handleVoucherSelected"
    />

    <!-- Modal tạo khách hàng mới -->
    <template v-if="showCustomerFormModal">
      <!-- Backdrop -->
      <div class="modal-backdrop fade show"></div>

      <!-- Modal -->
      <div class="modal fade show d-block" tabindex="-1" style="z-index: 9999">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Tạo khách hàng mới</h5>
              <button type="button" class="btn-close" @click="closeCustomerFormModal"></button>
            </div>
            <div class="modal-body">
              <KhachHangFormDN
                @close="closeCustomerFormModal"
                @success="handleCustomerFormSuccess"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import TransactionTabs from '@/components/banhang/TransactionTabs.vue'
import ProductSearch from '@/components/banhang/ProductSearch.vue'
import InvoiceDetails from '@/components/banhang/InvoiceDetails.vue'
import CustomerInfo from '@/components/banhang/CustomerInfo.vue'
import ModalThanhToan from '@/components/banhang/ModalThanhToan.vue'
import VoucherSuggestionModal from '@/components/banhang/VoucherSuggestionModal.vue'
import InvoicePrint from '@/components/banhang/InvoicePrint.vue'
import SalesQuickStats from '@/components/banhang/SalesQuickStats.vue'
import RecentTransactions from '@/components/banhang/RecentTransactions.vue'
import KhachHangFormDN from '@/components/taikhoan/khachhang/KhachHangFormDN.vue'
import './SalesView.css'

// Import composables
import { useBillManagement } from '@/composables/useBillManagement'
import { useProductManagement } from '@/composables/useProductManagement'
import { useCustomerManagement } from '@/composables/useCustomerManagement'
import { usePayment } from '@/composables/usePayment'
import { useVoucherPoints } from '@/composables/useVoucherPoints'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

const authStore = useAuthStore()

// ==================== TOAST & CONFIRM ====================
const { error: showError, success: showSuccess } = useToast()
const { showConfirm } = useConfirm()

// ==================== QUẢN LÝ HÓA ĐƠN ====================
const {
  danhSachHoaDonCho,
  hoaDonHienTai,
  isLoading: billLoading,
  daDatGioiHan, // Kiểm tra đã đạt giới hạn 10 hóa đơn chưa
  taoHoaDonMoi,
  chonHoaDon,
  xoaHoaDonCho,
  handleCancelBill,
  handleSaveDraft,
  loadDanhSachHoaDonCho,
  capNhatHoaDon,
  xoaHoaDonSauThanhToan,
  copyBill,
  startAutoSave,
  stopAutoSave,
} = useBillManagement()

// ==================== QUẢN LÝ SẢN PHẨM ====================
const {
  isLoading: productLoading,
  showQuantityModal,
  selectedProduct,
  soLuongNhap,
  quantityInput,
  handleProductSelected,
  confirmAddProduct,
  handleDeleteItem,
  handleScanImei,
  closeQuantityModal,
} = useProductManagement(hoaDonHienTai, capNhatHoaDon)

// ==================== QUẢN LÝ KHÁCH HÀNG ====================
const {
  isLoading: customerLoading,
  handleUpdateCustomer,
  handleSearchCustomer,
} = useCustomerManagement(hoaDonHienTai, capNhatHoaDon)

// Override handleCreateCustomer để mở modal thay vì dùng prompt
const handleCreateCustomer = () => {
  showCustomerFormModal.value = true
}

// Đóng modal form khách hàng
const closeCustomerFormModal = () => {
  showCustomerFormModal.value = false
}

// Xử lý khi form khách hàng submit thành công
const handleCustomerFormSuccess = async (newCustomer) => {
  if (newCustomer) {
    // Đảm bảo có id hoặc userId để gán vào hóa đơn
    // Chuẩn hóa dữ liệu để đảm bảo format đúng
    const customerData = {
      ...newCustomer,
      // Đảm bảo có id hoặc userId
      id: newCustomer.id || newCustomer.userId,
      userId: newCustomer.userId || newCustomer.id,
      // Đảm bảo có hoTen và soDienThoai (tên và số điện thoại)
      hoTen: newCustomer.hoTen || newCustomer.name || '',
      soDienThoai: newCustomer.soDienThoai || newCustomer.phone || '',
      email: newCustomer.email || null,
      diemTichLuy: newCustomer.diemTichLuy || 0,
      maKhachHang: newCustomer.maKhachHang || newCustomer.ma || null,
    }

    console.log('🆕 [SalesView] Thông tin khách hàng mới:', customerData)

    // Gán khách hàng mới cho hóa đơn hiện tại
    await handleUpdateCustomer(customerData)

    // Cập nhật trực tiếp thông tin khách hàng vào hoaDonHienTai sau khi cập nhật hóa đơn
    // để đảm bảo hiển thị đầy đủ thông tin (bao gồm email, diemTichLuy, etc.)
    if (hoaDonHienTai.value) {
      // Tạo object khách hàng đầy đủ để hiển thị trong CustomerInfo
      const displayCustomer = {
        // Đảm bảo các field cần thiết cho CustomerInfo
        hoTen: customerData.hoTen,
        soDienThoai: customerData.soDienThoai,
        email: customerData.email,
        diemTichLuy: customerData.diemTichLuy || 0,
        maKhachHang: customerData.maKhachHang,
        userId: customerData.userId || customerData.id,
        id: customerData.id || customerData.userId,
        // Flag để hiển thị badge "Khách hàng mới"
        isNew: true,
      }

      // Cập nhật hoaDonHienTai.khachHang để CustomerInfo hiển thị
      hoaDonHienTai.value.khachHang = displayCustomer

      console.log('✅ [SalesView] Đã cập nhật khách hàng vào hoaDonHienTai:', displayCustomer)
    }

    showSuccess(`Đã tạo và gán khách hàng "${customerData.hoTen}" vào hóa đơn!`)
  }
  closeCustomerFormModal()
}

// ==================== QUẢN LÝ THANH TOÁN ====================
const {
  isLoading: paymentLoading,
  showPaymentModal,
  openPaymentModal,
  handlePaymentConfirmed,
  closePaymentModal,
} = usePayment(hoaDonHienTai, xoaHoaDonSauThanhToan)

// ==================== QUẢN LÝ VOUCHER & ĐIỂM TÍCH LŨY ====================
const {
  isLoading: voucherLoading,
  handleApplyVoucher,
  handleUsePoints,
} = useVoucherPoints(hoaDonHienTai, capNhatHoaDon)

// State cho modal voucher
const showVoucherModal = ref(false)

// State cho modal form khách hàng
const showCustomerFormModal = ref(false)

// Handlers cho voucher modal
const openVoucherModal = () => {
  if (!hoaDonHienTai.value) {
    showError('Vui lòng tạo hóa đơn trước!')
    return
  }
  showVoucherModal.value = true
}

const closeVoucherModal = () => {
  showVoucherModal.value = false
}

const handleVoucherSelected = async (voucher) => {
  try {
    // Gọi API áp dụng voucher với ID
    await handleApplyVoucher(voucher.id)
    // Đóng modal sau khi áp dụng thành công
    closeVoucherModal()
  } catch (error) {
    console.error('Lỗi khi áp dụng voucher:', error)
    // Modal sẽ không đóng nếu có lỗi, để người dùng chọn voucher khác
  }
}

const handleRemoveVoucher = async () => {
  if (!hoaDonHienTai.value) return

  // Hiển thị confirm dialog trước khi xóa
  const confirmed = await showConfirm({
    title: 'Xác nhận xóa khuyến mãi',
    message: 'Bạn có chắc chắn muốn xóa khuyến mãi này khỏi hóa đơn?',
    confirmText: 'Xóa',
    cancelText: 'Hủy',
    type: 'warning',
  })

  if (!confirmed) return

  try {
    const { xoaVoucher } = await import('@/service/banhang/banHangService')
    const response = await xoaVoucher(hoaDonHienTai.value.id)

    if (response && response.data) {
      capNhatHoaDon(response.data)
      showSuccess('Đã xóa khuyến mãi!')
    }
  } catch (error) {
    console.error('Lỗi khi xóa voucher:', error)
    showError(error.response?.data?.message || 'Không thể xóa khuyến mãi. Vui lòng thử lại!')
  }
}

// Xử lý cập nhật sản phẩm (sửa số lượng)
const handleUpdateItem = (updatedHoaDon) => {
  if (updatedHoaDon) {
    capNhatHoaDon(updatedHoaDon)
  }
}

// State cho copy hóa đơn
const isCopyingBill = ref(false)
const copyingBillId = ref(null)

// Xử lý copy hóa đơn
const handleCopyBill = async (sourceBill) => {
  if (!sourceBill || !sourceBill.id) {
    return
  }
  
  isCopyingBill.value = true
  copyingBillId.value = sourceBill.id
  
  try {
    await copyBill(sourceBill)
  } finally {
    isCopyingBill.value = false
    copyingBillId.value = null
  }
}

// Xử lý sau khi in hóa đơn
const handleInvoicePrinted = () => {
  // Có thể thêm logic sau khi in hóa đơn (ví dụ: log, thông báo, etc.)
  console.log('✅ Đã in hóa đơn:', hoaDonHienTai.value?.ma || hoaDonHienTai.value?.id)
}

// ==================== COMPUTED - TRẠNG THÁI LOADING TỔNG HỢP ====================
const isLoading = computed(() => {
  return (
    billLoading.value ||
    productLoading.value ||
    customerLoading.value ||
    paymentLoading.value ||
    voucherLoading.value
  )
})

// ==================== UTILITIES ====================
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0)
}

// ==================== LIFECYCLE ====================
onMounted(async () => {
  console.log('SalesView mounted')
  console.log('User đã đăng nhập:', authStore.getUserName)
  console.log('User ID:', authStore.getUserId)

  // Load danh sách hóa đơn chờ
  await loadDanhSachHoaDonCho()

  // Bật auto-save draft
  startAutoSave()
})

// Cleanup khi unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopAutoSave()
})
</script>
