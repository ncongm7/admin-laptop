<template>
  <div class="voucher-form-page">
    <div class="form-container">
      <!-- Left Section: Thêm Phiếu Giảm Giá -->
      <div class="voucher-form-section">
        <div class="section-header">
          <i class="header-icon">➕</i>
          <h2 class="section-title">Thêm Phiếu Giảm Giá</h2>
        </div>
        
        <div class="form-content">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mã Phiếu</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="voucherForm.maPhieu"
                placeholder="Mã phiếu tự động"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Tên</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="voucherForm.ten"
                placeholder="Nhập tên phiếu"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Loại</label>
              <select class="form-select" v-model="voucherForm.loai">
                <option value="">Chọn loại</option>
                <option value="percentage">Phần trăm</option>
                <option value="fixed">Tiền mặt</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Hóa đơn tối thiểu</label>
              <div class="input-with-suffix">
                <input 
                  type="number" 
                  class="form-input" 
                  v-model="voucherForm.hoaDonToiThieu"
                  placeholder="0"
                />
                <span class="input-suffix">VND</span>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Số lượng</label>
              <input 
                type="number" 
                class="form-input" 
                v-model="voucherForm.soLuong"
                placeholder="0"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Giá trị giảm</label>
              <div class="input-with-suffix">
                <input 
                  type="number" 
                  class="form-input" 
                  v-model="voucherForm.giaTriGiam"
                  placeholder="0"
                />
                <span class="input-suffix">{{ voucherForm.loai === 'percentage' ? '%' : 'VND' }}</span>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ngày bắt đầu</label>
              <div class="date-input-wrapper">
                <input 
                  type="date" 
                  class="form-input" 
                  v-model="voucherForm.ngayBatDau"
                  placeholder="dd/mm/yyyy"
                />
                <i class="calendar-icon">📅</i>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Ngày kết thúc</label>
              <div class="date-input-wrapper">
                <input 
                  type="date" 
                  class="form-input" 
                  v-model="voucherForm.ngayKetThuc"
                  placeholder="dd/mm/yyyy"
                />
                <i class="calendar-icon">📅</i>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Mô tả</label>
            <textarea 
              class="form-textarea" 
              v-model="voucherForm.moTa"
              placeholder="Nhập mô tả"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="voucherForm.riengTu"
                class="checkbox-input"
              />
              <span class="checkbox-text">Riêng tư</span>
            </label>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" @click="themPhieuGiamGia">
              Thêm
            </button>
            <button class="btn btn-secondary" @click="quayVe">
              Quay Về
            </button>
          </div>
        </div>
      </div>

      <!-- Right Section: Chọn Khách Hàng -->
      <div class="customer-selection-section">
        <div class="section-header">
          <i class="header-icon">👥</i>
          <h2 class="section-title">Chọn Khách Hàng</h2>
        </div>
        
        <div class="customer-content">
          <div class="search-section">
            <label class="form-label">Tìm kiếm khách hàng</label>
            <div class="search-input-wrapper">
              <i class="search-icon">🔍</i>
              <input 
                type="text" 
                class="search-input" 
                v-model="searchCustomer"
                placeholder="Tìm theo mã hoặc tên..."
              />
            </div>
          </div>
          
          <div class="customer-list-section">
            <h3 class="list-title">Danh sách khách hàng</h3>
            <div class="customer-list">
              <div 
                v-for="customer in filteredCustomers" 
                :key="customer.ma"
                class="customer-item"
                @click="selectCustomer(customer)"
              >
                <div class="customer-info">
                  <span class="customer-code">{{ customer.ma }}</span>
                  <span class="customer-name">{{ customer.ten }}</span>
                  <span class="customer-gender">({{ customer.gioiTinh }})</span>
                </div>
                <i class="select-icon" :class="{ selected: isCustomerSelected(customer) }">
                  {{ isCustomerSelected(customer) ? '✓' : '○' }}
                </i>
              </div>
            </div>
          </div>
          
          <div class="selected-customers-section">
            <div class="section-header">
              <i class="header-icon">✓</i>
              <h3 class="section-title">Khách Hàng Đã Chọn</h3>
            </div>
            
            <div class="selected-customers-table">
              <table class="customers-table">
                <thead>
                  <tr>
                    <th>Mã KH</th>
                    <th>Tên Khách Hàng</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="customer in selectedCustomers" :key="customer.ma">
                    <td>{{ customer.ma }}</td>
                    <td>{{ customer.ten }}</td>
                    <td>{{ customer.gioiTinh }}</td>
                    <td>{{ customer.ngaySinh }}</td>
                    <td>
                      <button class="remove-btn" @click="removeCustomer(customer)">
                        ✕
                      </button>
                    </td>
                  </tr>
                  <tr v-if="selectedCustomers.length === 0">
                    <td colspan="5" class="no-data">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Voucher form data
const voucherForm = ref({
  maPhieu: 'PGG_byPrGTCJ',
  ten: '',
  loai: '',
  hoaDonToiThieu: 0,
  soLuong: 0,
  giaTriGiam: 0,
  ngayBatDau: '',
  ngayKetThuc: '',
  moTa: '',
  riengTu: false
})

// Customer selection data
const searchCustomer = ref('')
const selectedCustomers = ref([])

// Mock customer data
const customers = ref([
  { ma: 'KH00002', ten: 'Đinh Thế Mạnh', gioiTinh: 'Nam', ngaySinh: '15/03/1990' },
  { ma: 'KH00003', ten: 'Trịnh Châu Anh', gioiTinh: 'Nữ', ngaySinh: '22/07/1985' },
  { ma: 'KH00004', ten: 'Nguyễn Hoàng Phát', gioiTinh: 'Nam', ngaySinh: '08/12/1992' },
  { ma: 'KH00005', ten: 'Nguyễn Minh Anh', gioiTinh: 'Nữ', ngaySinh: '30/05/1988' },
  { ma: 'KH00006', ten: 'Nguyễn Hải Long', gioiTinh: 'Nam', ngaySinh: '14/09/1995' }
])

// Computed properties
const filteredCustomers = computed(() => {
  if (!searchCustomer.value) return customers.value
  return customers.value.filter(customer => 
    customer.ma.toLowerCase().includes(searchCustomer.value.toLowerCase()) ||
    customer.ten.toLowerCase().includes(searchCustomer.value.toLowerCase())
  )
})

// Methods
function selectCustomer(customer) {
  if (!isCustomerSelected(customer)) {
    selectedCustomers.value.push(customer)
  } else {
    removeCustomer(customer)
  }
}

function isCustomerSelected(customer) {
  return selectedCustomers.value.some(c => c.ma === customer.ma)
}

function removeCustomer(customer) {
  const index = selectedCustomers.value.findIndex(c => c.ma === customer.ma)
  if (index > -1) {
    selectedCustomers.value.splice(index, 1)
  }
}

function themPhieuGiamGia() {
  // TODO: Implement add voucher logic
  console.log('Thêm phiếu giảm giá:', voucherForm.value)
  console.log('Khách hàng đã chọn:', selectedCustomers.value)
}

function quayVe() {
  router.push('/quan-li-phieu-giam-gia')
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

/* Right Section: Customer Selection */
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

.search-section {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}

.search-input:focus {
  outline: none;
  border-color: #4caf50;
}

.customer-list-section {
  margin-bottom: 20px;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.customer-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.customer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.customer-item:hover {
  background: #f8f9fa;
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.customer-code {
  font-weight: 600;
  color: #333;
}

.customer-name {
  color: #555;
}

.customer-gender {
  color: #666;
  font-size: 13px;
}

.select-icon {
  font-size: 16px;
  color: #999;
}

.select-icon.selected {
  color: #4caf50;
}

.selected-customers-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
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

.remove-btn {
  background: #ffebee;
  color: #d32f2f;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.remove-btn:hover {
  background: #ffcdd2;
}

.no-data {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px 12px;
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
</style> 