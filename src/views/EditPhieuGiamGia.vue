<template>
  <div class="voucher-form-page">
    <div class="form-container">
      <!-- Left Section: Sửa Phiếu Giảm Giá -->
      <div class="voucher-form-section">
        <div class="section-header">
          <i class="header-icon">✏️</i>
          <h2 class="section-title">Chỉnh sửa Phiếu Giảm Giá</h2>
        </div>
        <div class="form-content">
          <PhieuGiamGiaForm
            v-if="voucher"
            :voucher="voucher"
            :is-edit-mode="true"
            @close="goBack"
            @save="handleSaveEdit"
          />
        </div>
      </div>
      <!-- Right Section: Sản Phẩm Đã Chọn -->
      <div class="selected-products-section" style="margin-left: 24px; flex: 1;">
        <div class="section-header">
          <i class="header-icon">✅</i>
          <h2 class="section-title">Sản Phẩm Đã Chọn</h2>
        </div>
        <div class="table-container">
          <table class="product-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã</th>
                <th>Tên SP</th>
                <th>Hãng</th>
                <th>Số lượng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, idx) in selectedProducts" :key="product.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.brand }}</td>
                <td>{{ product.quantity }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="removeSelectedProduct(product.id)">Xóa</button>
                </td>
              </tr>
              <tr v-if="selectedProducts.length === 0">
                <td colspan="6" class="no-data">
                  <div class="no-data-content">
                    <i class="no-data-icon">📦</i>
                    <p>Chưa có sản phẩm nào được chọn</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Right Section: Khách Hàng Đã Chọn (nếu riêng tư) -->
      <div v-if="voucher && voucher.riengTu" class="customer-selection-section">
        <div class="section-header">
          <i class="header-icon">👥</i>
          <h2 class="section-title">Khách Hàng Đã Chọn</h2>
        </div>
        <div class="customer-content">
          <div class="selected-customers-table">
            <table class="customers-table">
              <thead>
                <tr>
                  <th>Mã KH</th>
                  <th>Tên Khách Hàng</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in voucher.selectedCustomers || []" :key="customer.ma">
                  <td>{{ customer.ma }}</td>
                  <td>{{ customer.ten }}</td>
                  <td>{{ customer.gioiTinh }}</td>
                  <td>{{ customer.ngaySinh }}</td>
                </tr>
                <tr v-if="!(voucher.selectedCustomers && voucher.selectedCustomers.length)">
                  <td colspan="4" class="no-data">
                    Chưa có khách hàng nào được chọn
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PhieuGiamGiaForm from '../components/phieugiamgia/PhieuGiamGiaForm.vue'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

// Dữ liệu mẫu giống QuanLiPhieuGiamGia.vue
const vouchers = [
  {
    id: 1,
    code: 'PGG001',
    value: '10%',
    type: 'percentage',
    status: 'active',
    statusText: 'Đang diễn ra',
    startDate: '2024-06-01',
    endDate: '2024-07-01',
    ten: 'Phiếu giảm giá mùa hè',
    loai: '%',
    gia_tri: 10,
    giam_toi_da: 50000,
    so_luong: 100,
    dieu_kien: 200000,
    kieu: 'toan_bo',
    tu_ngay: '2024-06-01',
    den_ngay: '2024-07-01',
  },
  {
    id: 2,
    code: 'PGG002',
    value: '200000đ',
    type: 'fixed',
    status: 'upcoming',
    statusText: 'Sắp diễn ra',
    startDate: '2024-08-01',
    endDate: '2024-09-01',
    ten: 'Phiếu sinh viên',
    loai: 'VND',
    gia_tri: 200000,
    giam_toi_da: 0,
    so_luong: 50,
    dieu_kien: 500000,
    kieu: 'ca_nhan',
    tu_ngay: '2024-08-01',
    den_ngay: '2024-09-01',
  }
]

const voucher = ref(null)

onMounted(() => {
  voucher.value = vouchers.find(v => v.id === id)
})

function goBack() {
  router.push('/quan-li-phieu-giam-gia')
}

function handleSaveEdit(edited) {
  // Thực tế sẽ gọi API cập nhật, ở đây chỉ chuyển về danh sách
  goBack()
}

const selectedProducts = ref([
  // Giả lập dữ liệu sản phẩm đã chọn, thực tế lấy từ voucher hoặc API
  { id: 1, code: 'SP001', name: 'iPhone 15 Pro Max', brand: 'Apple', quantity: 50 },
  { id: 2, code: 'SP002', name: 'Samsung Galaxy S24', brand: 'Samsung', quantity: 30 }
])

const removeSelectedProduct = (id) => {
  selectedProducts.value = selectedProducts.value.filter(product => product.id !== id)
}
</script>
<style scoped>
.voucher-form-page {
  padding: 24px;
  background: #fafbfc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.form-container {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Left Section: Voucher Form */
.voucher-form-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.header-icon {
  font-size: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.form-content {
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #4caf50;
}

.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 12px;
  color: #666;
  font-size: 14px;
  pointer-events: none;
}

.date-input-wrapper {
  position: relative;
}

.calendar-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
  pointer-events: none;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: #4caf50;
}

.checkbox-group {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #f8f9fa;
  color: #555;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e9ecef;
}

/* Responsive */
@media (max-width: 1200px) {
  .form-container {
    flex-direction: column;
  }
  
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .voucher-form-page {
    padding: 16px;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
.customer-selection-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.customer-content {
  padding: 20px;
}
.selected-customers-table {
  margin-top: 12px;
}
.customers-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.customers-table th {
  background: #f8f9fa;
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}
.customers-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}
.no-data {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px 12px;
}
</style> 