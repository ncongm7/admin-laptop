<template>
  <div class="campaign-list-section">
    <div class="table-container">
      <table class="campaign-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã đợt</th>
            <th>Tên đợt</th>
            <th>Giá Trị</th>
            <th>Loại Phiếu</th>
            <th>Trạng Thái</th>
            <th>Ngày Bắt Đầu</th>
            <th>Ngày Kết Thúc</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(campaign, index) in campaigns" :key="campaign.id">
            <td>{{ index + 1 }}</td>
            <td>{{ campaign.code }}</td>
            <td>{{ campaign.name }}</td>
            <td>{{ campaign.value }}{{ campaign.type === 'percentage' ? '%' : '₫' }}</td>
            <td>{{ campaign.voucherType }}</td>
            <td>
              <span :class="getStatusClass(campaign.status)">
                {{ getStatusText(campaign.status) }}
              </span>
            </td>
            <td>{{ formatDate(campaign.startDate) }}</td>
            <td>{{ formatDate(campaign.endDate) }}</td>
            <td>
              <div class="action-buttons">
                <button class="action-btn edit-btn" @click="editCampaign(campaign)">
                  <i class="icon">✏️</i>
                </button>
                <button class="action-btn view-btn" @click="viewCampaign(campaign)">
                  <i class="icon">👁️</i>
                </button>
                <button class="action-btn delete-btn" @click="deleteCampaign(campaign)">
                  <i class="icon">🗑️</i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="campaigns.length === 0">
            <td colspan="9" class="no-data">
              <div class="no-data-content">
                <i class="no-data-icon">📋</i>
                <p>Không có dữ liệu phù hợp</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <div class="pagination-info">
        Hiển thị {{ paginationInfo.start }}-{{ paginationInfo.end }} / {{ paginationInfo.total }} mục
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" @click="goToFirstPage" :disabled="currentPage === 1">
          <i class="icon">⏮️</i>
        </button>
        <button class="pagination-btn" @click="goToPreviousPage" :disabled="currentPage === 1">
          <i class="icon">◀️</i>
        </button>
        <button class="pagination-btn" @click="goToNextPage" :disabled="currentPage === totalPages">
          <i class="icon">▶️</i>
        </button>
        <button class="pagination-btn" @click="goToLastPage" :disabled="currentPage === totalPages">
          <i class="icon">⏭️</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => []
  },
  currentPage: {
    type: Number,
    default: 1
  },
  itemsPerPage: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['edit-campaign', 'view-campaign', 'delete-campaign', 'page-change'])

const totalPages = computed(() => 
  Math.ceil(props.campaigns.length / props.itemsPerPage)
)

const paginationInfo = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage + 1
  const end = Math.min(props.currentPage * props.itemsPerPage, props.campaigns.length)
  return {
    start: props.campaigns.length > 0 ? start : 0,
    end,
    total: props.campaigns.length
  }
})

const editCampaign = (campaign) => {
  emit('edit-campaign', campaign)
}

const viewCampaign = (campaign) => {
  emit('view-campaign', campaign)
}

const deleteCampaign = (campaign) => {
  if (confirm('Bạn có chắc chắn muốn xóa đợt giảm giá này?')) {
    emit('delete-campaign', campaign)
  }
}

const goToFirstPage = () => {
  emit('page-change', 1)
}

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}

const goToNextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('page-change', props.currentPage + 1)
  }
}

const goToLastPage = () => {
  emit('page-change', totalPages.value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const getStatusClass = (status) => {
  const statusClasses = {
    active: 'status-active',
    upcoming: 'status-upcoming',
    ended: 'status-ended'
  }
  return `status-badge ${statusClasses[status] || ''}`
}

const getStatusText = (status) => {
  const statusTexts = {
    active: 'Đang diễn ra',
    upcoming: 'Sắp diễn ra',
    ended: 'Đã kết thúc'
  }
  return statusTexts[status] || status
}
</script>

<style scoped>
/* Campaign List Section */
.campaign-list-section {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.campaign-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.campaign-table th {
  background: #f8f9fa;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
  white-space: nowrap;
}

.campaign-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.campaign-table tbody tr:hover {
  background: #f8f9fa;
}

/* Status Badges */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-upcoming {
  background: #fff3cd;
  color: #856404;
}

.status-ended {
  background: #f8d7da;
  color: #721c24;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.edit-btn {
  background: #ffc107;
  color: #212529;
}

.edit-btn:hover {
  background: #e0a800;
  transform: scale(1.05);
}

.view-btn {
  background: #17a2b8;
  color: #ffffff;
}

.view-btn:hover {
  background: #138496;
  transform: scale(1.05);
}

.delete-btn {
  background: #dc3545;
  color: #ffffff;
}

.delete-btn:hover {
  background: #c82333;
  transform: scale(1.05);
}

/* No Data */
.no-data {
  text-align: center;
  padding: 48px 24px;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #6c757d;
}

.no-data-icon {
  font-size: 48px;
  opacity: 0.5;
}

.no-data-content p {
  margin: 0;
  font-size: 16px;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e9ecef;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  color: #ffffff;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .campaign-table {
    font-size: 12px;
  }

  .campaign-table th,
  .campaign-table td {
    padding: 12px 8px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
}
</style> 