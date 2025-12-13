<template>
  <div class="products-management">
    <!-- Stats Dashboard -->
    <div class="stats-dashboard mb-4">
      <div class="row g-3">
        <div class="col-md-3 col-sm-6">
          <div class="stat-card total-products">
            <div class="stat-icon">
              <i class="bi bi-box-seam"></i>
            </div>
            <div class="stat-details">
              <h3>{{ totalProducts }}</h3>
              <p>Tổng sản phẩm</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card active-products">
            <div class="stat-icon">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stat-details">
              <h3>{{ activeProducts }}</h3>
              <p>Đang hoạt động</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card inactive-products">
             <div class="stat-icon">
              <i class="bi bi-slash-circle"></i>
            </div>
            <div class="stat-details">
              <h3>{{ inactiveProducts }}</h3>
              <p>Ngừng kinh doanh</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
           <div class="stat-card total-variants">
            <div class="stat-icon">
              <i class="bi bi-grid-3x3"></i>
            </div>
             <div class="stat-details">
              <h3>{{ totalVariants }}</h3>
              <p>Tổng biến thể</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="products-container">
      <!-- Filter Section -->
      <ProductFilter
        @filter="applyFilter"
        @reset="resetFilter"
        @filtered-data="handleFilteredData"
        @loading="handleFilterLoading"
        class="filter-section mb-4"
      />

      <!-- Product List -->
      <ProductList
        :products="displayedProducts"
        :loading="loading || filterLoading"
        @edit="editProduct"
        @view="viewDetail"
        @bulk-delete="handleBulkDelete"
        @selection-change="handleSelectionChange"
        @variant-added="handleVariantAdded"
        class="product-list"
      />


      <!-- Product Form Modal (for creating new products) -->
      <ProductFormModal
        v-if="showModal"
        :product="selectedProduct"
        @close="closeModal"
        @save="saveProduct"
      />

      <!-- Product Edit Modal (for editing existing products) -->
      <ProductEditModal
        v-if="showEditModal"
        :product="selectedProduct"
        @close="closeEditModal"
        @save="saveEditedProduct"
      />

      <!-- Product Detail Modal -->
      <ProductDetailModal
        v-if="showDetailModal"
        :product="selectedProduct"
        @close="closeDetailModal"
        @edit="editFromDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/sanpham/productStore'
import ProductFilter from '@/components/sanpham/quanlisanpham/ProductFilter.vue'
import ProductList from '@/components/sanpham/quanlisanpham/ProductList.vue'
import ProductFormModal from '@/components/sanpham/quanlisanpham/ProductFormModal.vue'
import ProductEditModal from '@/components/sanpham/quanlisanpham/ProductEditModal.vue'
import ProductDetailModal from '@/components/sanpham/quanlisanpham/ProductDetailModal.vue'
import { useProductDetailStore } from '@/stores/sanpham/productDetailStore'

const props = defineProps({
  showCreateModal: Boolean,
})

const emit = defineEmits(['close-create-modal'])

const router = useRouter()
const productStore = useProductStore()
const useProductDetailStore1 = useProductDetailStore()

const loading = ref(true)
const filterLoading = ref(false)
const showModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const selectedProduct = ref(null)
const filteredData = ref([])
const isFilterApplied = ref(false)
const selectedProductIds = ref([])
const editForm = ref({
  id: null,
  tenSanPham: '',
  maSanPham: '',
  moTaChiTiet: '',
  trangThai: 1
})
const filters = ref({
  ten: '',
  ma: '',
  trangThai: '',
  minPrice: null,
  maxPrice: null,
})

const isEditMode = computed(() => !!editForm.value.id)

// Computed Stats
const totalProducts = computed(() => productStore.products.length)
const activeProducts = computed(() => productStore.products.filter(p => p.trangThai === 1).length)
const inactiveProducts = computed(() => productStore.products.filter(p => p.trangThai !== 1).length)
const totalVariants = computed(() => {
  return productStore.products.reduce((sum, p) => sum + (p.variants ? p.variants.length : 0), 0)
})

const fetchData = async () => {
  try {
    loading.value = true

    await productStore.fetchAllProducts()
  } catch (err) {
    console.error('ProductsView: Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

// ProductFormModal handles its own attributes loading

// Handle filtered data from ProductFilter
const displayedProducts = computed(() => {
  // If filter was applied, always use filteredData (even if empty - means no results)
  if (isFilterApplied.value) {
    return filteredData.value
  }
  // If no filter applied, show all products from store
  return productStore.products || []
})

const handleFilteredData = (data) => {
  // Map variants to filtered products to ensure price calculation works
  const productsWithVariants = (data || []).map(product => {
    const productVariants = productStore.variants.filter(variant => 
      variant.idSanPham === product.id || variant.sanPhamId === product.id
    )
    return {
      ...product,
      variants: productVariants
    }
  })
  
  filteredData.value = productsWithVariants
  isFilterApplied.value = true // Mark that a filter has been applied
}

const handleFilterLoading = (isLoading) => {
  filterLoading.value = isLoading
}

const filteredProducts = computed(() => {
  const nameQuery = (filters.value.ten || '').trim().toLowerCase()
  const codeQuery = (filters.value.ma || '').trim().toLowerCase()
  const statusQuery = (filters.value.trangThai || '').trim()
  const minPrice = filters.value.minPrice != null ? Number(filters.value.minPrice) : 0
  const maxPrice = filters.value.maxPrice != null ? Number(filters.value.maxPrice) : Infinity

  const filtered = productStore.products.filter((product) => {
    const matchesName =
      !nameQuery || (product.tenSanPham || product.ten || '').toLowerCase().includes(nameQuery)
    const matchesCode =
      !codeQuery || (product.maSanPham || product.ma || '').toLowerCase().includes(codeQuery)
    const matchesStatus = !statusQuery || (product.trangThai || 'ACTIVE') === statusQuery

    // For price filtering, if no variants exist or no price filters applied, show all
    const matchesPrice =
      (!filters.value.minPrice && !filters.value.maxPrice) ||
      (Array.isArray(product.variants) &&
        product.variants.some((variant) => {
          const price = Number(variant.giaBan || variant.gia || 0)
          return !Number.isNaN(price) && price >= minPrice && price <= maxPrice
        }))

    return matchesName && matchesCode && matchesStatus && matchesPrice
  })

  return filtered
})

const editProduct = async (product) => {
  try {
    console.log('Edit button clicked! Product:', product)
    
    // Set the selected product and show edit modal
    selectedProduct.value = { ...product }
    showEditModal.value = true
    
    console.log('Edit modal should be showing now. showEditModal:', showEditModal.value)
    console.log('selectedProduct:', selectedProduct.value)
    
  } catch (error) {
    console.error('Error in editProduct:', error)
    alert('Không thể mở form chỉnh sửa sản phẩm')
  }
}

const viewDetail = async (product) => {
  try {
    // Fetch detailed product information
    const detail = await productStore.fetchProductByIdSP(product.id)
    // Set the selected product with both list data and detailed data
    selectedProduct.value = {
      ...product,
      ...detail,
    }
    // Update the product detail store
    useProductDetailStore1.productDetail = { ...detail }
    // Navigate to the product detail page
    router.push(`/products/${product.id}/detail`)
  } catch (error) {
    console.error('Error fetching product details:', error)
    // Still navigate to the page even if detail fetch fails
    selectedProduct.value = { ...product }
    useProductDetailStore1.productDetail = { ...product }
    router.push(`/products/${product.id}/detail`)
  }
}

const editFromDetail = () => {
  showDetailModal.value = false
  showEditModal.value = true
}

// confirmDelete function removed as delete functionality is no longer needed

const saveProduct = async (productData) => {
  try {
    console.log('Product saved from modal:', productData)
    
    // Product is already created/updated by ProductFormModal
    // Just refresh the list and close modal
    await fetchData()
    closeModal()
  } catch (error) {
    console.error('Error refreshing product list:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
  editForm.value = {
    id: null,
    tenSanPham: '',
    maSanPham: '',
    moTaChiTiet: '',
    trangThai: 1
  }
  emit('close-create-modal')
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedProduct.value = null
}

const handleSave = async () => {
  try {
    console.log('Saving form data:', editForm.value)
    
    // Validate required fields
    if (!editForm.value.tenSanPham?.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    // No confirmation needed for product creation/update

    loading.value = true

    if (editForm.value.id) {
      console.log('Calling editProduct with ID:', editForm.value.id)
      const result = await productStore.editProduct(editForm.value.id, editForm.value)
      console.log('Edit result:', result)
      alert('Cập nhật sản phẩm thành công!')
    } else {
      console.log('Creating new product')
      const result = await productStore.addProduct(editForm.value)
      console.log('Create result:', result)
      alert('Tạo sản phẩm mới thành công!')
    }
    
    // Refresh the product list
    await fetchData()
    closeModal()
  } catch (error) {
    console.error('Error saving product:', error)
    alert(`Lỗi khi ${editForm.value.id ? 'cập nhật' : 'tạo'} sản phẩm: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
}

const saveEditedProduct = async (productData) => {
  try {
    console.log('Product edited from modal:', productData)
    
    // Validate required fields
    if (!productData.tenSanPham?.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    loading.value = true

    // Call the store's editProduct method to update the product
    await productStore.editProduct(productData.id, productData)
    
    console.log('Product updated successfully')
    alert('Cập nhật sản phẩm thành công!')
    
    // Refresh the product list and close modal
    await fetchData()
    closeEditModal()
  } catch (error) {
    console.error('Error updating product:', error)
    
    // Show detailed error message
    let errorMessage = 'Lỗi khi cập nhật sản phẩm'
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.response?.data?.message) {
      errorMessage = `Lỗi server: ${error.response.data.message}`
    } else if (error.response?.data?.error) {
      errorMessage = `Lỗi server: ${error.response.data.error}`
    } else if (error.response?.status) {
      errorMessage = `Lỗi HTTP ${error.response.status}: ${error.response.statusText || 'Không xác định'}`
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const applyFilter = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
}

const resetFilter = () => {
  filters.value = {
    ten: '',
    ma: '',
    trangThai: '',
    minPrice: null,
    maxPrice: null,
  }
  filteredData.value = [] // Clear filtered data to show all products
  isFilterApplied.value = false // Mark that filter has been reset
}

const handleBulkDelete = async (selectedIds) => {
  console.log('handleBulkDelete called with selectedIds:', selectedIds)
  
  if (!selectedIds || selectedIds.length === 0) {
    alert('Vui lòng chọn ít nhất một sản phẩm để xóa')
    return
  }

  const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?\n\nHành động này không thể hoàn tác!`
  
  if (confirm(confirmMessage)) {
    try {
      loading.value = true
      console.log('Bulk deleting products with IDs:', selectedIds)
      
      await productStore.bulkRemoveProducts(selectedIds)
      
      console.log('Products deleted successfully')
      alert(`Xóa ${selectedIds.length} sản phẩm thành công!`)
      
      // Refresh the product list
      await fetchData()
    } catch (error) {
      console.error('Error bulk deleting products:', error)
      console.error('Full error object:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      })
      
      // Show more detailed error message
      let errorMessage = 'Lỗi khi xóa sản phẩm'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = `Lỗi server: ${error.response.data.message}`
      } else if (error.response?.data?.error) {
        errorMessage = `Lỗi server: ${error.response.data.error}`
      } else if (error.response?.status) {
        errorMessage = `Lỗi HTTP ${error.response.status}: ${error.response.statusText || 'Không xác định'}`
      }
      
      alert(errorMessage)
    } finally {
      loading.value = false
    }
  }
}

const handleSelectionChange = (selectedIds) => {
  selectedProductIds.value = selectedIds
}

const handleVariantAdded = async () => {
  try {
    // Reload products and variants from store so variant counts are up to date
    await fetchData()
    
    // If a filter is currently applied, remap variants for filtered products as well
    if (isFilterApplied.value) {
      filteredData.value = (filteredData.value || []).map((product) => {
        const productVariants = productStore.variants.filter(
          (variant) => variant.idSanPham === product.id || variant.sanPhamId === product.id,
        )
        return {
          ...product,
          variants: productVariants,
        }
      })
    }
  } catch (err) {
    console.error('Error refreshing products after variant added:', err)
  }
}

onMounted(() => {
  fetchData()
})

watch(
  () => props.showCreateModal,
  (val) => {
    if (val) {
      selectedProduct.value = null
      showModal.value = true
    } else {
      showModal.value = false
    }
  },
)
</script>

<style scoped>
.products-management {
  padding: 24px;
  background-color: #f1f5f9; /* Softer background */
  min-height: 100vh;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.total-products .stat-icon { background: #e0f2fe; color: #0284c7; }
.active-products .stat-icon { background: #dcfce7; color: #16a34a; }
.inactive-products .stat-icon { background: #fee2e2; color: #dc2626; }
.total-variants .stat-icon { background: #f3e8ff; color: #9333ea; }

.stat-details h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-details p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Ensure modal style consistency */
:deep(.modal-content) {
  border-radius: 16px;
  border: none;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
