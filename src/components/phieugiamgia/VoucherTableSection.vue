<template>
  <div class="voucher-list-section">
    <div class="list-header">
      <div class="list-title-wrapper">
        <i class="list-icon">📋</i>
        <h3 class="list-title">Danh Sách Phiếu Giảm Giá</h3>
      </div>
      <div class="list-summary">{{ vouchers.length }} phiếu giảm giá</div>
    </div>
    <div class="table-container">
      <table class="voucher-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã Phiếu</th>
            <th>Giá Trị</th>
            <th>Loại Phiếu</th>
            <th>Trạng Thái</th>
            <th>Ngày Bắt Đầu</th>
            <th>Ngày Kết Thúc</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(voucher, index) in paginatedVouchers" :key="voucher.id">
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ voucher.code }}</td>
            <td>{{ voucher.value }}</td>
            <td>{{ voucher.type }}</td>
            <td>
              <span class="status-badge" :class="voucher.status">
                {{ voucher.statusText }}
              </span>
            </td>
            <td>{{ voucher.startDate }}</td>
            <td>{{ voucher.endDate }}</td>
            <td>
              <div class="action-buttons">
                <button class="action-btn edit" @click="$emit('edit', voucher)">✏️</button>
                <button class="action-btn view" @click="$emit('view', voucher)">👁️</button>
                <button class="action-btn delete" @click="$emit('delete', voucher)">🗑️</button>
              </div>
            </td>
          </tr>
          <tr v-if="!vouchers.length">
            <td colspan="8" class="no-data">Không có dữ liệu phù hợp</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination-container">
      <div class="pagination-info">
        <span>Hiển thị {{ itemsPerPage }} mục / trang</span>
        <span>Hiển thị {{ startIndex + 1 }} - {{ endIndex }} / {{ vouchers.length }} mục</span>
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" @click="goToFirstPage" :disabled="currentPage === 1">&lt;&lt;</button>
        <button class="pagination-btn" @click="goToPreviousPage" :disabled="currentPage === 1">&lt;</button>
        <button class="pagination-btn" @click="goToNextPage" :disabled="currentPage >= totalPages">&gt;</button>
        <button class="pagination-btn" @click="goToLastPage" :disabled="currentPage >= totalPages">&gt;&gt;</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
const props = defineProps({
  vouchers: { type: Array, default: () => [] },
  itemsPerPage: { type: Number, default: 5 }
})
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(props.vouchers.length / props.itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + props.itemsPerPage, props.vouchers.length))
const paginatedVouchers = computed(() => props.vouchers.slice(startIndex.value, endIndex.value))
function goToFirstPage() { currentPage.value = 1 }
function goToPreviousPage() { if (currentPage.value > 1) currentPage.value-- }
function goToNextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function goToLastPage() { currentPage.value = totalPages.value }
watch(() => props.vouchers, () => { currentPage.value = 1 })
</script>
<style scoped>
@import url('../../views/QuanLiPhieuGiamGia.vue');
</style> 