<template>
  <div class="products-management">
    <!-- Main Content -->
    <div class="products-container">
      <!-- Filter Section -->
      <ProductFilter
        @filter="applyFilter"
        @reset="resetFilter"
        @filtered-data="handleFilteredData"
        @loading="handleFilterLoading"
        class="filter-section"
      />

      <!-- Product List -->
      <ProductList
        :products="displayedProducts"
        :loading="loading || filterLoading"
        @edit="editProduct"
        @view="viewDetail"
        @delete="confirmDelete"
        @bulk-delete="handleBulkDelete"
        @selection-change="handleSelectionChange"
        class="product-list"
      />


      <!-- Product Form Modal -->
      <ProductFormModal
        v-if="showModal"
        :product="selectedProduct"
        @close="closeModal"
        @save="saveProduct"
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
import { useProductStore } from '@/stores/productStore'
import ProductFilter from '@/components/sanpham/quanlisanpham/ProductFilter.vue'
import ProductList from '@/components/sanpham/quanlisanpham/ProductList.vue'
import ProductFormModal from '@/components/sanpham/quanlisanpham/ProductFormModal.vue'
import ProductDetailModal from '@/components/sanpham/quanlisanpham/ProductDetailModal.vue'
import { useProductDetailStore } from '@/stores/productDetailStore'

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
    console.log('Current showModal state:', showModal.value)
    
    // Populate the edit form with product data
    editForm.value = {
      id: product.id,
      tenSanPham: product.tenSanPham || '',
      maSanPham: product.maSanPham || '',
      moTaChiTiet: product.moTaChiTiet || '',
      trangThai: product.trangThai || 1
    }
    
    // Set the selected product and show modal immediately
    selectedProduct.value = { ...product }
    showModal.value = true
    
    console.log('Modal should be showing now. showModal:', showModal.value)
    console.log('editForm:', editForm.value)
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
  showModal.value = true
}

const confirmDelete = async (product) => {
  const confirmMessage = `Bạn có chắc chắn muốn xóa sản phẩm "${product.tenSanPham}"?\n\nHành động này không thể hoàn tác!`
  
  if (confirm(confirmMessage)) {
    try {
      loading.value = true
      await productStore.removeProduct(product.id)
      alert('Xóa sản phẩm thành công!')
      
      // Refresh the product list
      await fetchData()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(`Lỗi khi xóa sản phẩm: ${error.message}`)
    } finally {
      loading.value = false
    }
  }
}

const saveProduct = async (productData) => {
  try {
    console.log('Saving product data:', productData)
    
    // Validate required fields
    if (!productData.tenSanPham?.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    // Show confirmation dialog
    const action = productData.id ? 'cập nhật' : 'tạo mới'
    const confirmMessage = `Bạn có chắc chắn muốn ${action} sản phẩm "${productData.tenSanPham}"?`
    
    if (!confirm(confirmMessage)) {
      return
    }

    loading.value = true

    if (productData.id) {
      console.log('Calling editProduct with ID:', productData.id)
      const result = await productStore.editProduct(productData.id, productData)
      console.log('Edit result:', result)
      alert('Cập nhật sản phẩm thành công!')
    } else {
      console.log('Creating new product')
      const result = await productStore.addProduct(productData)
      console.log('Create result:', result)
      alert('Tạo sản phẩm mới thành công!')
    }
    
    // Refresh the product list
    await fetchData()
    closeModal()
  } catch (error) {
    console.error('Error saving product:', error)
    alert(`Lỗi khi ${productData.id ? 'cập nhật' : 'tạo'} sản phẩm: ${error.message}`)
  } finally {
    loading.value = false
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

const handleSave = async () => {
  try {
    console.log('Saving form data:', editForm.value)
    
    // Validate required fields
    if (!editForm.value.tenSanPham?.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    // Show confirmation dialog
    const action = editForm.value.id ? 'cập nhật' : 'tạo mới'
    const confirmMessage = `Bạn có chắc chắn muốn ${action} sản phẩm "${editForm.value.tenSanPham}"?`
    
    if (!confirm(confirmMessage)) {
      return
    }

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

const handleSelectionChange = (selectedIds) => {
  selectedProductIds.value = selectedIds
}

const handleBulkDelete = async (productIds) => {
  try {
    loading.value = true
    
    // Use the bulk delete method from store
    await productStore.bulkRemoveProducts(productIds)
    
    alert(`Đã xóa thành công ${productIds.length} sản phẩm!`)
    
    // Clear selection and refresh data
    selectedProductIds.value = []
    await fetchData()
  } catch (error) {
    console.error('Error bulk deleting products:', error)
    alert(`Lỗi khi xóa sản phẩm: ${error.message}`)
  } finally {
    loading.value = false
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
  background-color: #f8fafc;
  min-height: 100vh;
}
</style>
