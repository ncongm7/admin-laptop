<template>
  <div class="search-filters-section">
    <div class="filters-container">
      <!-- Top Row -->
      <div class="filter-row top-row">
        <!-- Search Input -->
        <div class="filter-group search-group">
          <div class="search-input-wrapper">
            <i class="search-icon">🔍</i>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Mã đợt, tên đợt..."
              v-model="filters.search"
              @input="updateFilters"
            />
          </div>
        </div>

        <!-- Date Range -->
        <div class="filter-group date-group">
          <div class="date-range-container">
            <div class="date-input-wrapper">
              <i class="calendar-icon">📅</i>
              <input 
                type="date" 
                class="date-input" 
                v-model="filters.startDate"
                @input="updateFilters"
              />
            </div>
            <span class="date-separator">đến</span>
            <div class="date-input-wrapper">
              <i class="calendar-icon">📅</i>
              <input 
                type="date" 
                class="date-input" 
                v-model="filters.endDate"
                @input="updateFilters"
              />
            </div>
          </div>
        </div>

        <!-- Discount Type -->
        <div class="filter-group type-group">
          <select class="filter-select" v-model="filters.discountType" @change="updateFilters">
            <option value="">loại giảm giá</option>
            <option value="percentage">Giảm theo phần trăm</option>
            <option value="fixed">Giảm theo số tiền</option>
          </select>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="filter-row bottom-row">
        <!-- Status -->
        <div class="filter-group status-group">
          <select class="filter-select" v-model="filters.status" @change="updateFilters">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang diễn ra</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>

        <!-- Discount Value Range -->
        <div class="filter-group range-group">
          <div class="range-slider-container">
            <label class="range-label">Giá trị giảm (%)</label>
            <div class="range-slider">
              <input 
                type="range" 
                class="range-input range-min" 
                min="0" 
                max="100" 
                v-model="filters.discountMin"
                @input="updateDiscountRange"
              />
              <input 
                type="range" 
                class="range-input range-max" 
                min="0" 
                max="100" 
                v-model="filters.discountMax"
                @input="updateDiscountRange"
              />
            </div>
            <div class="range-values">
              <span>{{ filters.discountMin }}%</span>
              <span>{{ filters.discountMax }}%</span>
            </div>
          </div>
        </div>

        <!-- Max Discount Amount -->
        <div class="filter-group range-group">
          <div class="range-slider-container">
            <label class="range-label">Số tiền giảm tối đa (VND)</label>
            <div class="range-slider">
              <input 
                type="range" 
                class="range-input range-min" 
                min="0" 
                max="50000000" 
                v-model="filters.maxAmountMin"
                @input="updateAmountRange"
              />
              <input 
                type="range" 
                class="range-input range-max" 
                min="0" 
                max="50000000" 
                v-model="filters.maxAmountMax"
                @input="updateAmountRange"
              />
            </div>
            <div class="range-values">
              <span>{{ formatCurrency(filters.maxAmountMin) }}</span>
              <span>{{ formatCurrency(filters.maxAmountMax) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="filter-actions">
      <button class="btn btn-secondary" @click="resetFilters">
        Đặt lại bộ lọc
      </button>
      <button class="btn btn-success" @click="exportToExcel">
        Xuất Excel
      </button>
      <button class="btn btn-primary" @click="addNewCampaign">
        Thêm Đợt Giảm Giá
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const emit = defineEmits(['update-filters', 'reset-filters', 'export-excel', 'add-campaign'])

const filters = ref({
  search: '',
  startDate: '',
  endDate: '',
  discountType: '',
  status: '',
  discountMin: 0,
  discountMax: 12,
  maxAmountMin: 0,
  maxAmountMax: 12312312
})

const updateFilters = () => {
  emit('update-filters', filters.value)
}

const updateDiscountRange = () => {
  if (filters.value.discountMin > filters.value.discountMax) {
    filters.value.discountMin = filters.value.discountMax
  }
  updateRangeSliderBackground('discount')
  updateFilters()
}

const updateAmountRange = () => {
  if (filters.value.maxAmountMin > filters.value.maxAmountMax) {
    filters.value.maxAmountMin = filters.value.maxAmountMax
  }
  updateRangeSliderBackground('amount')
  updateFilters()
}

const updateRangeSliderBackground = (type) => {
  nextTick(() => {
    const containers = document.querySelectorAll('.range-slider-container')
    const targetContainer = type === 'discount' ? containers[0] : containers[1]
    
    if (targetContainer) {
      const slider = targetContainer.querySelector('.range-slider')
      if (slider) {
        const min = type === 'discount' ? filters.value.discountMin : filters.value.maxAmountMin
        const max = type === 'discount' ? filters.value.discountMax : filters.value.maxAmountMax
        const maxValue = type === 'discount' ? 100 : 50000000
        
        const minPercent = (min / maxValue) * 100
        const maxPercent = (max / maxValue) * 100
        
        slider.style.background = `linear-gradient(to right, #e0e0e0 0%, #e0e0e0 ${minPercent}%, #007bff ${minPercent}%, #007bff ${maxPercent}%, #e0e0e0 ${maxPercent}%, #e0e0e0 100%)`
      }
    }
  })
}

const resetFilters = () => {
  filters.value = {
    search: '',
    startDate: '',
    endDate: '',
    discountType: '',
    status: '',
    discountMin: 0,
    discountMax: 12,
    maxAmountMin: 0,
    maxAmountMax: 12312312
  }
  
  nextTick(() => {
    updateRangeSliderBackground('discount')
    updateRangeSliderBackground('amount')
  })
  
  emit('reset-filters')
}

const exportToExcel = () => {
  emit('export-excel')
}

const addNewCampaign = () => {
  emit('add-campaign')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' ₫'
}

// Lifecycle
onMounted(() => {
  updateRangeSliderBackground('discount')
  updateRangeSliderBackground('amount')
})
</script>

<style scoped>
/* Search Filters Section */
.search-filters-section {
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 12px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 8px;
  align-items: end;
}

.top-row {
  margin-bottom: 8px;
}

.bottom-row {
  margin-bottom: 8px;
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.date-group {
  flex: 2;
  min-width: 300px;
}

.type-group {
  flex: 0 0 150px;
}

.status-group {
  flex: 0 0 150px;
}

.range-group {
  flex: 1;
  min-width: 200px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

/* Search Input */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: #6c757d;
  font-size: 12px;
}

.search-input {
  width: 100%;
  padding: 6px 6px 6px 28px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  height: 32px;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Date Range */
.date-range-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input-wrapper {
  position: relative;
  flex: 1;
}

.calendar-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 10px;
}

.date-input {
  width: 100%;
  padding: 6px 6px 6px 28px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  height: 32px;
}

.date-input:focus {
  outline: none;
  border-color: #007bff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.date-separator {
  color: #6c757d;
  font-size: 11px;
  white-space: nowrap;
  margin: 0 4px;
}

/* Select Dropdowns */
.filter-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 32px;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Range Sliders */
.range-slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.range-label {
  font-size: 11px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 2px;
}

.range-slider {
  position: relative;
  height: 3px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 4px 0;
  overflow: hidden;
}

.range-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  pointer-events: auto;
  appearance: none;
  z-index: 1;
  margin: 0;
  padding: 0;
}

.range-input.range-max {
  z-index: 2;
}

.range-input::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  border: 1px solid #ffffff;
}

.range-input::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.range-input::-webkit-slider-track {
  background: transparent;
  border: none;
}

.range-input::-moz-range-track {
  background: transparent;
  border: none;
}

.range-input::-webkit-slider-runnable-track {
  background: transparent;
  border: none;
}

.range-values {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #6c757d;
  margin-top: 1px;
}

/* Action Buttons */
.filter-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
  position: relative;
  z-index: 5;
  margin-top: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 10;
  pointer-events: auto;
  user-select: none;
}

.btn-primary {
  background: #007bff;
  color: #ffffff;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: #ffffff;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.btn-success {
  background: #28a745;
  color: #ffffff;
}

.btn-success:hover {
  background: #1e7e34;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 6px;
  }

  .search-group,
  .date-group,
  .type-group,
  .status-group,
  .range-group {
    flex: none;
    width: 100%;
  }

  .filter-actions {
    justify-content: center;
  }
}
</style> 