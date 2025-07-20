<template>
  <div class="filter-section">
    <div class="filter-header">
      <i class="filter-icon">🔍</i>
      <h3 class="filter-title">Bộ Lọc Tìm Kiếm</h3>
    </div>
    <div class="filter-content">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Tìm kiếm phiếu</label>
          <div class="search-input-wrapper">
            <i class="search-icon">🔍</i>
            <input type="text" class="search-input" placeholder="Mã phiếu, tên phiếu..." v-model="local.searchQuery" @input="emitFilter" />
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-label">Loại phiếu</label>
          <select class="filter-select" v-model="local.selectedType" @change="emitFilter">
            <option value="">Tất cả loại phiếu</option>
            <option value="percentage">Phần trăm</option>
            <option value="fixed">Tiền mặt</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Trạng thái</label>
          <select class="filter-select" v-model="local.selectedStatus" @change="emitFilter">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang diễn ra</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="expired">Đã kết thúc</option>
          </select>
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Khoảng thời gian</label>
          <div class="date-range">
            <div class="date-input-wrapper">
              <input type="date" class="date-input" v-model="local.startDate" @change="emitFilter" />
              <i class="calendar-icon">📅</i>
            </div>
            <span class="date-separator">đến</span>
            <div class="date-input-wrapper">
              <input type="date" class="date-input" v-model="local.endDate" @change="emitFilter" />
              <i class="calendar-icon">📅</i>
            </div>
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-label">Giá trị phiếu</label>
          <div class="value-slider-container">
            <div class="value-slider">
              <div class="slider-track">
                <div class="slider-fill" :style="{ width: local.sliderValue + '%' }"></div>
                <div class="slider-thumb" :style="{ left: local.sliderValue + '%' }" @mousedown="startDrag"></div>
              </div>
              <div class="slider-labels">
                <span>0 ₫</span>
                <span>5.000.000 ₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary" type="button" @click="resetFilters">Đặt lại bộ lọc</button>
        <button class="btn btn-primary" type="button" @click="$emit('export-excel')">Xuất Excel</button>
        <button class="btn btn-primary" type="button" @click="$emit('add-voucher')">Thêm Phiếu Giảm Giá</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, toRefs, watch, onMounted } from 'vue'
const emit = defineEmits(['update:filters', 'export-excel', 'add-voucher'])
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})
const local = reactive({
  searchQuery: '',
  selectedType: '',
  selectedStatus: '',
  startDate: '',
  endDate: '',
  sliderValue: 100
})
watch(() => props.filters, (val) => {
  Object.assign(local, val)
}, { immediate: true })
function emitFilter() {
  emit('update:filters', { ...local })
}
function resetFilters() {
  local.searchQuery = ''
  local.selectedType = ''
  local.selectedStatus = ''
  local.startDate = ''
  local.endDate = ''
  local.sliderValue = 100
  emitFilter()
}
// Slider drag logic (simple, for demo)
function startDrag(e) {
  const slider = e.target.parentElement
  const onMove = (ev) => {
    const rect = slider.getBoundingClientRect()
    let percent = ((ev.clientX - rect.left) / rect.width) * 100
    percent = Math.max(0, Math.min(100, percent))
    local.sliderValue = Math.round(percent)
    emitFilter()
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
</script>
<style scoped>
/* Copy style từ QuanLiPhieuGiamGia.vue phần filter-section */
@import url('../../views/QuanLiPhieuGiamGia.vue');
</style> 