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
        class="product-list"
      />

      <!-- Product Form Modal -->
      <ProductFormModal
        v-if="showModal"
        :product="selectedProduct"
        :brands="brands"
        :cpus="cpus"
        :rams="rams"
        :gpus="gpus"
        :storages="storages"
        :colors="colors"
        :screens="screens"
        :displays="displays"
        :oses="oses"
        :batteries="batteries"
        :cameras="cameras"
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
const filters = ref({
  ten: '',
  ma: '',
  trangThai: '',
  minPrice: null,
  maxPrice: null,
})

const fetchData = async () => {
  try {
    loading.value = true

    // Test API connection first
    const apiWorking = await productStore.testApiConnection()

    await productStore.fetchAllProducts()
  } catch (err) {
    console.error('ProductsView: Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

const brands = computed(() => productStore.brands)
const cpus = computed(() => productStore.cpus)
const rams = computed(() => productStore.rams)
const gpus = computed(() => productStore.gpus)
const storages = computed(() => productStore.storages)
const colors = computed(() => productStore.colors)
const screens = computed(() => productStore.screens)
const displays = computed(() => productStore.displays)
const oses = computed(() => productStore.oses)
const batteries = computed(() => productStore.batteries)
const cameras = computed(() => productStore.cameras)

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
  filteredData.value = data || []
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

const editProduct = (product) => {
  selectedProduct.value = { ...product }
  showModal.value = true
}

const viewDetail = async (product) => {
  const detail = await productStore.fetchProductByIdSP(product.id)
  selectedProduct.value = { id: product.id, ...product }
  useProductDetailStore1.productDetail = { ...detail }
  router.push(`/products/${product.id}/detail`)
}

const editFromDetail = () => {
  showDetailModal.value = false
  showModal.value = true
}

const confirmDelete = (product) => {
  // Implement delete confirmation
}

const saveProduct = async (productData) => {
  if (productData.id) {
    await productStore.updateProduct(productData)
  } else {
    await productStore.addProduct(productData)
  }
  closeModal()
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
  emit('close-create-modal')
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
