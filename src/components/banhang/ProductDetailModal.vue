<template>
  <div v-if="visible" class="modal fade show d-block" style="z-index: 9999; pointer-events: auto;" @click.self="close">
    <div class="modal-dialog modal-xl modal-dialog-scrollable" style="pointer-events: auto;">
      <div class="modal-content" style="pointer-events: auto;">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-info-circle"></i> Chi tiết sản phẩm
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close" :disabled="isLoading"></button>
        </div>

        <div class="modal-body">
          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2 text-muted">Đang tải thông tin sản phẩm...</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> {{ error }}
          </div>

          <!-- Product Details -->
          <div v-else-if="productDetail" class="product-detail-content">
            <!-- Header: Tên sản phẩm & Ảnh -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="product-image-section">
                  <img
                    :src="getProductMainImage()"
                    :alt="productDetail.tenSanPham"
                    class="product-main-image"
                    @error="handleImageError"
                  />
                  <div v-if="productDetail.anhSanPhams && productDetail.anhSanPhams.length > 1" class="product-thumbnails mt-2">
                    <img
                      v-for="(img, index) in productDetail.anhSanPhams.slice(0, 4)"
                      :key="index"
                      :src="img.uri"
                      :alt="`Ảnh ${index + 1}`"
                      class="thumbnail"
                      :class="{ active: selectedImageIndex === index }"
                      @click="selectedImageIndex = index"
                      @error="handleImageError"
                    />
                  </div>
                </div>
              </div>
              <div class="col-md-8">
                <h4 class="product-name mb-2">{{ productDetail.tenSanPham }}</h4>
                <div class="product-meta mb-3">
                  <span class="badge bg-secondary me-2">Mã: {{ productDetail.maSanPham || 'N/A' }}</span>
                  <span
                    v-if="productDetail.trangThai === 1"
                    class="badge bg-success me-2"
                  >
                    <i class="bi bi-check-circle"></i> Đang bán
                  </span>
                  <span v-else class="badge bg-danger me-2">
                    <i class="bi bi-pause-circle"></i> Ngừng bán
                  </span>
                </div>
                <p v-if="productDetail.moTa" class="text-muted">{{ productDetail.moTa }}</p>
              </div>
            </div>

            <hr />

            <!-- Thông số kỹ thuật -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="section-title mb-3">
                  <i class="bi bi-gear"></i> Thông số kỹ thuật
                </h6>
                <div class="specs-grid">
                  <div v-if="productDetail.thuongHieu" class="spec-item">
                    <span class="spec-label">Thương hiệu:</span>
                    <span class="spec-value">{{ productDetail.thuongHieu }}</span>
                  </div>
                  <div v-if="productDetail.danhMuc" class="spec-item">
                    <span class="spec-label">Danh mục:</span>
                    <span class="spec-value">{{ productDetail.danhMuc }}</span>
                  </div>
                  <div v-if="productDetail.kichThuocManHinh" class="spec-item">
                    <span class="spec-label">Kích thước màn hình:</span>
                    <span class="spec-value">{{ productDetail.kichThuocManHinh }}"</span>
                  </div>
                  <div v-if="productDetail.doPhanGiai" class="spec-item">
                    <span class="spec-label">Độ phân giải:</span>
                    <span class="spec-value">{{ productDetail.doPhanGiai }}</span>
                  </div>
                  <div v-if="productDetail.congKetNoi" class="spec-item">
                    <span class="spec-label">Cổng kết nối:</span>
                    <span class="spec-value">{{ productDetail.congKetNoi }}</span>
                  </div>
                  <!-- Thêm các thông số từ variants nếu có -->
                  <div v-if="getFirstVariantSpec('tenCpu')" class="spec-item">
                    <span class="spec-label">CPU:</span>
                    <span class="spec-value">{{ getFirstVariantSpec('tenCpu') }}</span>
                  </div>
                  <div v-if="getFirstVariantSpec('tenRam')" class="spec-item">
                    <span class="spec-label">RAM:</span>
                    <span class="spec-value">{{ getFirstVariantSpec('tenRam') }}</span>
                  </div>
                  <div v-if="getFirstVariantSpec('dungLuongOCung')" class="spec-item">
                    <span class="spec-label">Ổ cứng:</span>
                    <span class="spec-value">{{ getFirstVariantSpec('dungLuongOCung') }}</span>
                  </div>
                  <div v-if="getFirstVariantSpec('tenCardDoHoa')" class="spec-item">
                    <span class="spec-label">Card đồ họa:</span>
                    <span class="spec-value">{{ getFirstVariantSpec('tenCardDoHoa') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <!-- Giá và tồn kho tổng quan -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="section-title mb-3">
                  <i class="bi bi-currency-dollar"></i> Giá và tồn kho
                </h6>
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="price-summary-card">
                      <div class="price-label">Giá thấp nhất</div>
                      <div class="price-value text-success">
                        {{ formatCurrency(getMinPrice()) }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="price-summary-card">
                      <div class="price-label">Giá cao nhất</div>
                      <div class="price-value text-danger">
                        {{ formatCurrency(getMaxPrice()) }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="price-summary-card">
                      <div class="price-label">Tổng tồn kho</div>
                      <div class="price-value text-primary">
                        <i class="bi bi-box"></i> {{ getTotalStock() }} sản phẩm
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <!-- Lịch sử giá (nếu có) -->
            <div v-if="priceHistory.length > 0" class="row mb-4">
              <div class="col-12">
                <h6 class="section-title mb-3">
                  <i class="bi bi-clock-history"></i> Lịch sử giá
                </h6>
                <div class="price-history-container">
                  <table class="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Ngày thay đổi</th>
                        <th>Giá cũ</th>
                        <th>Giá mới</th>
                        <th>Thay đổi</th>
                        <th>Lý do</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(history, index) in priceHistory" :key="index">
                        <td>{{ formatDate(history.ngayThayDoi) }}</td>
                        <td>
                          <span class="text-muted">
                            {{ formatCurrency(history.giaCu) }}
                          </span>
                        </td>
                        <td>
                          <span class="fw-bold">
                            {{ formatCurrency(history.giaMoi) }}
                          </span>
                        </td>
                        <td>
                          <span :class="getPriceChangeClass(history.giaCu, history.giaMoi)">
                            {{ getPriceChangeText(history.giaCu, history.giaMoi) }}
                          </span>
                        </td>
                        <td>
                          <small class="text-muted">{{ history.lyDo || 'N/A' }}</small>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Thông báo nếu không có lịch sử giá -->
            <div v-else class="row mb-4">
              <div class="col-12">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle"></i> Chưa có lịch sử thay đổi giá cho sản phẩm này.
                </div>
              </div>
            </div>

            <hr />

            <!-- Danh sách biến thể -->
            <div class="row">
              <div class="col-12">
                <h6 class="section-title mb-3">
                  <i class="bi bi-list-ul"></i> Các biến thể sản phẩm
                  <span class="badge bg-info ms-2">{{ variants.length }} biến thể</span>
                </h6>

                <div v-if="variants.length === 0" class="alert alert-info">
                  <i class="bi bi-info-circle"></i> Sản phẩm chưa có biến thể nào
                </div>

                <div v-else class="variants-table-container">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Mã CTSP</th>
                        <th>Thông số</th>
                        <th>Màu sắc</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="variant in variants"
                        :key="variant.id"
                        :class="{
                          'table-success': variant.soLuongTon > 10,
                          'table-warning': variant.soLuongTon > 0 && variant.soLuongTon <= 10,
                          'table-danger': variant.soLuongTon === 0
                        }"
                      >
                        <td>
                          <code>{{ variant.maCtsp || variant.maCTSP || 'N/A' }}</code>
                        </td>
                        <td>
                          <div class="variant-specs">
                            <div v-if="variant.tenCpu">
                              <strong>CPU:</strong> {{ variant.tenCpu }}
                            </div>
                            <div v-if="variant.tenRam">
                              <strong>RAM:</strong> {{ variant.tenRam }}
                            </div>
                            <div v-if="variant.dungLuongOCung">
                              <strong>Ổ cứng:</strong> {{ variant.dungLuongOCung }}
                            </div>
                            <div v-if="variant.kichThuocManHinh">
                              <strong>Màn hình:</strong> {{ variant.kichThuocManHinh }}"
                            </div>
                          </div>
                        </td>
                        <td>
                          <span v-if="variant.tenMauSac" class="badge bg-secondary">
                            {{ variant.tenMauSac }}
                          </span>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td>
                          <div class="price-cell">
                            <span
                              v-if="variant.coGiamGia && variant.giaGiam"
                              class="price-discounted"
                            >
                              {{ formatCurrency(variant.giaGiam) }}
                            </span>
                            <span v-else class="price-normal">
                              {{ formatCurrency(variant.giaBan) }}
                            </span>
                            <span
                              v-if="variant.coGiamGia && variant.giaGoc"
                              class="price-original"
                            >
                              <del>{{ formatCurrency(variant.giaGoc) }}</del>
                            </span>
                            <div v-if="variant.coGiamGia && variant.phanTramGiam" class="discount-badge">
                              <span class="badge bg-danger">-{{ variant.phanTramGiam }}%</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span :class="getStockClass(variant.soLuongTon)">
                            <i class="bi bi-box"></i> {{ variant.soLuongTon }}
                          </span>
                        </td>
                        <td>
                          <span
                            v-if="variant.soLuongTon > 0"
                            class="badge bg-success"
                          >
                            <i class="bi bi-check-circle"></i> Còn hàng
                          </span>
                          <span v-else class="badge bg-danger">
                            <i class="bi bi-x-circle"></i> Hết hàng
                          </span>
                        </td>
                        <td>
                          <button
                            v-if="variant.soLuongTon > 0"
                            class="btn btn-sm btn-primary"
                            @click="selectVariant(variant)"
                            :disabled="!canSelectVariant"
                          >
                            <i class="bi bi-cart-plus"></i> Chọn
                          </button>
                          <span v-else class="text-muted">-</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isLoading">
            <i class="bi bi-x-circle"></i> Đóng
          </button>
        </div>
      </div>
    </div>
    <!-- Backdrop được quản lý bởi component cha (ProductSearch) -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getSanPhamById } from '@/service/sanpham/SanPhamService'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'select-variant'])

const { error: showError } = useToast()

const isLoading = ref(false)
const error = ref('')
const productDetail = ref(null)
const selectedImageIndex = ref(0)
const priceHistory = ref([]) // Lịch sử giá (nếu có từ API)

const variants = computed(() => {
  if (!productDetail.value) return []
  
  // Nếu có chiTietSanPhams từ product ban đầu, dùng luôn
  if (props.product?.chiTietSanPhams && props.product.chiTietSanPhams.length > 0) {
    return props.product.chiTietSanPhams
  }
  
  // Nếu productDetail có chiTietSanPhams
  if (productDetail.value.chiTietSanPhams && productDetail.value.chiTietSanPhams.length > 0) {
    return productDetail.value.chiTietSanPhams
  }
  
  return []
})

const canSelectVariant = computed(() => {
  return true // Có thể chọn biến thể
})

/**
 * Lấy ảnh chính của sản phẩm
 */
const getProductMainImage = () => {
  if (!productDetail.value) return 'https://via.placeholder.com/400x400?text=No+Image'
  
  const images = productDetail.value.anhSanPhams || []
  if (images.length === 0) return 'https://via.placeholder.com/400x400?text=No+Image'
  
  // Lấy ảnh đã chọn hoặc ảnh mặc định
  const selectedImage = images[selectedImageIndex.value] || images.find(img => img.is_default) || images[0]
  return selectedImage.uri || 'https://via.placeholder.com/400x400?text=No+Image'
}

/**
 * Xử lý lỗi ảnh
 */
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
}

/**
 * Load chi tiết sản phẩm từ API
 */
const loadProductDetail = async () => {
  if (!props.product || !props.product.id) {
    error.value = 'Không có thông tin sản phẩm!'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // Nếu product đã có đầy đủ thông tin (từ kết quả tìm kiếm), dùng luôn
    if (props.product.chiTietSanPhams && props.product.chiTietSanPhams.length > 0) {
      productDetail.value = props.product
      console.log('✅ Sử dụng dữ liệu sản phẩm từ props:', productDetail.value)
    } else {
      // Gọi API để lấy chi tiết đầy đủ
      const response = await getSanPhamById(props.product.id)
      
      if (response && response.data) {
        productDetail.value = response.data
        console.log('✅ Đã load chi tiết sản phẩm từ API:', productDetail.value)
        
        // TODO: Load lịch sử giá nếu API có
        // Nếu API trả về priceHistory, dùng luôn
        if (response.data.priceHistory && Array.isArray(response.data.priceHistory)) {
          priceHistory.value = response.data.priceHistory
        } else {
          // Nếu không có, thử gọi API riêng (nếu có)
          // await loadPriceHistory(props.product.id)
          priceHistory.value = []
        }
      } else {
        error.value = 'Không tìm thấy thông tin sản phẩm!'
      }
    }
  } catch (err) {
    console.error('❌ Lỗi khi load chi tiết sản phẩm:', err)
    error.value = err.response?.data?.message || 'Không thể tải thông tin sản phẩm. Vui lòng thử lại!'
  } finally {
    isLoading.value = false
  }
}

/**
 * Chọn biến thể và emit event
 */
const selectVariant = (variant) => {
  if (variant.soLuongTon <= 0) {
    showError('Sản phẩm này đã hết hàng!')
    return
  }

  emit('select-variant', {
    variant: variant,
    product: productDetail.value || props.product
  })
}

/**
 * Đóng modal
 */
const close = () => {
  emit('close')
}

/**
 * Format currency
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0)
}

/**
 * Get stock class
 */
const getStockClass = (stock) => {
  if (stock > 10) return 'text-success fw-bold'
  if (stock > 0) return 'text-warning fw-bold'
  return 'text-danger fw-bold'
}

/**
 * Lấy giá thấp nhất từ các biến thể
 */
const getMinPrice = () => {
  if (!variants.value || variants.value.length === 0) return 0
  const prices = variants.value
    .map(v => v.giaGiam || v.giaBan || 0)
    .filter(p => p > 0)
  return prices.length > 0 ? Math.min(...prices) : 0
}

/**
 * Lấy giá cao nhất từ các biến thể
 */
const getMaxPrice = () => {
  if (!variants.value || variants.value.length === 0) return 0
  const prices = variants.value
    .map(v => v.giaGiam || v.giaBan || 0)
    .filter(p => p > 0)
  return prices.length > 0 ? Math.max(...prices) : 0
}

/**
 * Tính tổng tồn kho
 */
const getTotalStock = () => {
  if (!variants.value || variants.value.length === 0) return 0
  return variants.value.reduce((sum, v) => sum + (v.soLuongTon || 0), 0)
}

/**
 * Format date
 */
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

/**
 * Tính phần trăm thay đổi giá
 */
const getPriceChangeText = (giaCu, giaMoi) => {
  if (!giaCu || !giaMoi) return 'N/A'
  const change = ((giaMoi - giaCu) / giaCu) * 100
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

/**
 * Lấy class cho thay đổi giá
 */
const getPriceChangeClass = (giaCu, giaMoi) => {
  if (!giaCu || !giaMoi) return 'text-muted'
  if (giaMoi > giaCu) return 'text-danger fw-bold'
  if (giaMoi < giaCu) return 'text-success fw-bold'
  return 'text-muted'
}

/**
 * Lấy thông số từ biến thể đầu tiên (để hiển thị trong phần thông số kỹ thuật)
 */
const getFirstVariantSpec = (field) => {
  if (!variants.value || variants.value.length === 0) return null
  const firstVariant = variants.value[0]
  return firstVariant[field] || null
}

// Watch visible để load dữ liệu khi mở modal
watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedImageIndex.value = 0
    loadProductDetail()
  } else {
    productDetail.value = null
    error.value = ''
    priceHistory.value = []
  }
})

// Watch product để reload khi product thay đổi
watch(() => props.product, () => {
  if (props.visible) {
    loadProductDetail()
  }
}, { deep: true })
</script>

<style scoped>
/* Backdrop được quản lý bởi component cha, không cần style ở đây */
.modal {
  z-index: 9999;
  pointer-events: auto;
}

.modal-dialog {
  pointer-events: auto;
}

.modal-content {
  pointer-events: auto;
}

.product-detail-content {
  padding: 0.5rem 0;
}

.product-image-section {
  text-align: center;
}

.product-main-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.product-thumbnails {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.thumbnail:hover {
  border-color: #0dcaf0;
  transform: scale(1.1);
}

.thumbnail.active {
  border-color: #0dcaf0;
  box-shadow: 0 0 8px rgba(13, 202, 240, 0.5);
}

.product-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dee2e6;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.spec-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.spec-value {
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
}

.variants-table-container {
  max-height: 400px;
  overflow-y: auto;
}

.variant-specs {
  font-size: 0.85rem;
}

.variant-specs div {
  margin-bottom: 0.25rem;
}

.price-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-normal,
.price-discounted {
  font-size: 1rem;
  font-weight: 700;
  color: #dc3545;
}

.price-original {
  font-size: 0.85rem;
  color: #6c757d;
}

.discount-badge {
  margin-top: 0.25rem;
}

.price-summary-card {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #dee2e6;
}

.price-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.price-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.price-history-container {
  max-height: 300px;
  overflow-y: auto;
}

/* Scrollbar */
.variants-table-container::-webkit-scrollbar {
  width: 6px;
}

.variants-table-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.variants-table-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .specs-grid {
    grid-template-columns: 1fr;
  }

  .product-main-image {
    max-width: 100%;
  }
}
</style>

