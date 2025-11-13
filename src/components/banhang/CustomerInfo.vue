<template>
    <div class="customer-info card">
        <div class="card-header bg-success text-white">
            <h6 class="mb-0">
                <i class="bi bi-person-circle"></i> Thông tin khách hàng
            </h6>
        </div>

        <div class="card-body">
            <!-- Tìm kiếm khách hàng -->
            <div class="search-customer mb-3">
                <label class="form-label small fw-semibold">Tìm khách hàng</label>
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control" v-model="searchKeyword" @input="handleSearch"
                        placeholder="Nhập SĐT hoặc tên..." @keyup.enter="searchCustomer" />
                    <button class="btn btn-outline-secondary" @click="searchCustomer">
                        <i class="bi bi-search"></i>
                    </button>
                </div>

                <!-- Kết quả tìm kiếm -->
                <div v-if="showSearchResults && searchResults.length > 0" class="search-results-dropdown">
                    <div v-for="result in searchResults" :key="result.userId" class="search-result-item"
                        @click="selectCustomer(result)">
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
                <div v-if="showSearchResults && searchResults.length === 0 && searchKeyword" class="no-results-message">
                    <small class="text-muted">Không tìm thấy khách hàng</small>
                </div>
            </div>

            <!-- Thông tin khách hàng đã chọn -->
            <div v-if="selectedCustomer" class="customer-details">
                <div class="customer-card">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="customer-name mb-1">{{ selectedCustomer.hoTen }}</h6>
                            <div class="customer-phone text-muted small">
                                <i class="bi bi-telephone-fill"></i> {{ selectedCustomer.soDienThoai }}
                            </div>
                            <div v-if="selectedCustomer.email" class="customer-email text-muted small">
                                <i class="bi bi-envelope-fill"></i> {{ selectedCustomer.email }}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" @click="clearCustomer" title="Xóa khách hàng">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>

                    <!-- Điểm tích lũy -->
                    <div class="customer-points-badge">
                        <i class="bi bi-star-fill text-warning"></i>
                        <span class="fw-bold">{{ selectedCustomer.diemTichLuy || 0 }}</span> điểm
                    </div>
                </div>
            </div>

            <!-- Khách lẻ -->
            <div v-else class="guest-customer">
                <div class="alert alert-info alert-sm mb-2" role="alert">
                    <i class="bi bi-person"></i> Khách lẻ (Khách vãng lai)
                </div>
            </div>

            <!-- Nút thêm khách hàng mới -->
            <div class="customer-actions">
                <button class="btn btn-sm btn-outline-primary w-100" @click="$emit('create-customer')">
                    <i class="bi bi-person-plus"></i> Thêm khách hàng mới
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { timKiemKhachHang } from '@/service/banhang/banHangService'

const props = defineProps({
    customer: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:customer', 'search-customer', 'create-customer'])

// State
const searchKeyword = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const isSearching = ref(false)
const selectedCustomer = ref(null)

// Debounce timer
let searchTimeout = null

// Watch customer prop
watch(() => props.customer, (newVal) => {
    selectedCustomer.value = newVal
}, { immediate: true })

// Methods
const handleSearch = () => {
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
        const response = await timKiemKhachHang({
            keyword: searchKeyword.value.trim()
        })

        console.log('🔍 [CustomerInfo] Response:', response)

        // Parse response: Backend trả về { data: [...] } hoặc trực tiếp [...]
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

        console.log('✅ [CustomerInfo] Parsed results:', results)
        searchResults.value = results

    } catch (error) {
        console.error('❌ [CustomerInfo] Lỗi khi tìm kiếm khách hàng:', error)
        searchResults.value = []
    } finally {
        isSearching.value = false
    }

    emit('search-customer', searchKeyword.value)
}

const selectCustomer = (customer) => {
    console.log('✅ [CustomerInfo] Chọn khách hàng:', customer)
    selectedCustomer.value = customer
    emit('update:customer', customer)

    // Đóng dropdown và clear search
    showSearchResults.value = false
    searchKeyword.value = ''
    searchResults.value = []
}

const clearCustomer = () => {
    console.log('🗑️ [CustomerInfo] Xóa khách hàng → Chuyển về Khách lẻ')
    selectedCustomer.value = null
    // Emit null để backend biết đây là khách vãng lai
    emit('update:customer', null)
}

// Click outside to close dropdown
const closeDropdown = () => {
    showSearchResults.value = false
}
</script>

<style scoped>
.customer-info {
    margin-bottom: 1rem;
}

.search-customer {
    position: relative;
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
    padding: 0.5rem;
    text-align: center;
}

.customer-details {
    margin-top: 1rem;
}

.customer-card {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid #28a745;
}

.customer-name {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
}

.customer-phone,
.customer-email {
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.customer-points-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.9rem;
    border: 1px solid #ffc107;
}

.guest-customer {
    margin-top: 1rem;
}

.alert-sm {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
}

.customer-actions {
    margin-top: 1rem;
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
