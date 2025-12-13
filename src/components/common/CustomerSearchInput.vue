<template>
  <div class="search-customer-input">
    <label class="form-label small fw-semibold">Tìm khách hàng</label>
    <div class="input-group input-group-sm">
      <input
        type="text"
        class="form-control"
        :class="{ 'is-invalid': searchError }"
        v-model="searchKeyword"
        @input="handleSearchInput"
        placeholder="Nhập SĐT hoặc tên..."
        @keyup.enter="searchCustomer"
        maxlength="100"
      />
      <div v-if="searchError" class="invalid-feedback d-block small">
        {{ searchError }}
      </div>
      <button class="btn btn-outline-secondary" @click="searchCustomer" :disabled="isSearching">
        <i class="bi" :class="isSearching ? 'bi-arrow-clockwise spin' : 'bi-search'"></i>
      </button>
    </div>

    <!-- Kết quả tìm kiếm -->
    <div v-if="showSearchResults && searchResults.length > 0" class="search-results-dropdown">
      <div
        v-for="result in searchResults"
        :key="result.userId"
        class="search-result-item"
        @click="selectCustomer(result)"
      >
        <div class="customer-name">{{ result.hoTen }}</div>
        <div class="customer-phone text-muted small">
          <i class="bi bi-telephone"></i> {{ result.soDienThoai }}
        </div>
        <div class="customer-points text-success small">
          <i class="bi bi-star"></i> {{ result.diemTichLuy || 0 }} điểm
        </div>
      </div>
    </div>

    <!-- Không tìm thấy -->
    <div
      v-if="showSearchResults && searchResults.length === 0 && searchKeyword && !isSearching"
      class="no-results-message"
    >
      <small class="text-muted">Không tìm thấy khách hàng</small>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { timKiemKhachHang } from '@/service/banhang/banHangService'
import { sanitizeInput } from '@/utils/validation'

const emit = defineEmits(['customer-selected'])

// State
const searchKeyword = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const isSearching = ref(false)
const searchError = ref('')

// Debounce timer
let searchTimeout = null

const handleSearchInput = () => {
  searchKeyword.value = sanitizeInput(searchKeyword.value)
  searchError.value = ''

  if (searchKeyword.value.length > 100) {
    searchError.value = 'Từ khóa tìm kiếm không được vượt quá 100 ký tự'
    return
  }

  clearTimeout(searchTimeout)

  if (!searchKeyword.value || searchKeyword.value.trim().length < 2) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  searchTimeout = setTimeout(() => {
    searchCustomer()
  }, 300)
}

const searchCustomer = async () => {
  if (!searchKeyword.value || searchKeyword.value.trim().length < 1) {
    return
  }

  isSearching.value = true
  showSearchResults.value = true

  try {
    const response = await timKiemKhachHang({ keyword: searchKeyword.value.trim() })
    let results = []
    if (response) {
      if (Array.isArray(response)) {
        results = response
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          results = response.data
        } else if (response.data.content) {
          results = response.data.content
        }
      }
    }
    searchResults.value = results
  } catch (error) {
    console.error('❌ [CustomerSearchInput] Lỗi khi tìm kiếm khách hàng:', error)
    searchResults.value = []
    searchError.value = 'Không thể tải danh sách khách hàng.'
  } finally {
    isSearching.value = false
  }
}

const selectCustomer = (customer) => {
  emit('customer-selected', customer)
  showSearchResults.value = false
  searchKeyword.value = ''
  searchResults.value = []
}
</script>

<style scoped>
.search-customer-input {
  position: relative;
  margin-bottom: 1rem;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.25rem;
}

.search-result-item {
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.no-results-message {
  padding: 0.75rem;
  text-align: center;
  background: white;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Scrollbar styling */
.search-results-dropdown::-webkit-scrollbar {
  width: 6px;
}

.search-results-dropdown::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.search-results-dropdown::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
