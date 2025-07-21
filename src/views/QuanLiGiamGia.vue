<template>
  <div class="discount-management-container">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">Quản Lý Đợt Giảm Giá</h1>
    </div>

    <!-- Search Filters Section -->
    <DiscountFilter 
      @update-filters="updateFilters"
      @reset-filters="resetFilters"
      @export-excel="exportToExcel"
      @add-campaign="addNewCampaign"
    />

    <!-- Campaign List Section -->
    <DiscountTable 
      :campaigns="filteredCampaigns"
      :current-page="currentPage"
      :items-per-page="itemsPerPage"
      @edit-campaign="editCampaign"
      @view-campaign="viewCampaign"
      @delete-campaign="deleteCampaign"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DiscountFilter from '@/components/giamgia/DiscountFilter.vue'
import DiscountTable from '@/components/giamgia/DiscountTable.vue'

const router = useRouter()

// Reactive data
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

const currentPage = ref(1)
const itemsPerPage = ref(5)

// Mock data - replace with API calls
const campaigns = ref([
  {
    id: 1,
    code: 'DGG001',
    name: 'Khuyến mãi mùa hè',
    value: 15,
    type: 'percentage',
    voucherType: 'Giảm giá',
    status: 'active',
    startDate: '2024-06-01',
    endDate: '2024-08-31'
  },
  {
    id: 2,
    code: 'DGG002',
    name: 'Giảm giá sinh viên',
    value: 200000,
    type: 'fixed',
    voucherType: 'Phiếu giảm giá',
    status: 'upcoming',
    startDate: '2024-09-01',
    endDate: '2024-12-31'
  }
])

// Computed properties
const filteredCampaigns = computed(() => {
  let filtered = campaigns.value

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(campaign => 
      campaign.code.toLowerCase().includes(searchTerm) ||
      campaign.name.toLowerCase().includes(searchTerm)
    )
  }

  // Date range filter
  if (filters.value.startDate) {
    filtered = filtered.filter(campaign => 
      campaign.startDate >= filters.value.startDate
    )
  }

  if (filters.value.endDate) {
    filtered = filtered.filter(campaign => 
      campaign.endDate <= filters.value.endDate
    )
  }

  // Discount type filter
  if (filters.value.discountType) {
    filtered = filtered.filter(campaign => 
      campaign.type === filters.value.discountType
    )
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(campaign => 
      campaign.status === filters.value.status
    )
  }

  // Discount value range filter
  filtered = filtered.filter(campaign => {
    if (campaign.type === 'percentage') {
      return campaign.value >= filters.value.discountMin && 
             campaign.value <= filters.value.discountMax
    }
    return true
  })

  // Max amount range filter
  filtered = filtered.filter(campaign => {
    if (campaign.type === 'fixed') {
      return campaign.value >= filters.value.maxAmountMin && 
             campaign.value <= filters.value.maxAmountMax
    }
    return true
  })

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredCampaigns.value.length / itemsPerPage.value)
)

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, filteredCampaigns.value.length)
  return {
    start: filteredCampaigns.value.length > 0 ? start : 0,
    end,
    total: filteredCampaigns.value.length
  }
})

// Methods
const updateFilters = (newFilters) => {
  filters.value = { ...newFilters }
}

const resetFilters = () => {
  // This will be handled by the DiscountFilter component
  console.log('Filters reset')
}

const exportToExcel = () => {
  // Implement Excel export functionality
  console.log('Exporting to Excel...')
}

const addNewCampaign = () => {
  // Navigate to add campaign page
  console.log('Navigating to add campaign page...')
  router.push('/quan-li-giam-gia/add')
}

const editCampaign = (campaign) => {
  router.push(`/quan-li-giam-gia/edit/${campaign.id}`)
}

const viewCampaign = (campaign) => {
  // Navigate to view campaign details
  console.log('Viewing campaign:', campaign)
}

const deleteCampaign = (campaign) => {
  // Show confirmation dialog and delete
  console.log('Deleting campaign:', campaign)
}

const handlePageChange = (page) => {
  currentPage.value = page
}

// Lifecycle
onMounted(() => {
  // Initialize component
  console.log('Discount Management component mounted')
})
</script>

<style scoped>
.discount-management-container {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .discount-management-container {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 24px;
  }
}
</style>
