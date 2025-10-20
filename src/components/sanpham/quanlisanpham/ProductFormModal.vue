<template>
  <div class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">{{ isEditMode ? 'Chỉnh sửa' : 'Thêm mới' }} sản phẩm</h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="save">
            <div class="row g-4">
              <!-- Full Width Column -->
              <div class="col-md-12">
                <!-- Basic Info -->
                <div class="card mb-4">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Thông tin cơ bản</h6>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-12">
                        <label class="form-label"
                          >Tên sản phẩm <span class="text-danger">*</span></label
                        >
                        <input
                          type="text"
                          class="form-control"
                          v-model="form.tenSanPham"
                          required
                        />
                      </div>

                      <div class="col-md-12">
                        <label class="form-label">Mã sản phẩm</label>
                        <input type="text" class="form-control" v-model="form.maSanPham" />
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Trạng thái</label>
                        <select class="form-select" v-model="form.trangThai">
                          <option :value="1">Hoạt động</option>
                          <option :value="0">Ẩn</option>
                        </select>
                      </div>

                      <div class="col-md-12">
                        <label class="form-label">Mô tả chi tiết</label>
                        <textarea
                          class="form-control"
                          rows="5"
                          v-model="form.moTaChiTiet"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Product Images -->
                <div class="card mb-4">
                  <div class="card-header bg-light">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-images text-success"></i>
                      <h6 class="mb-0">Hình ảnh sản phẩm</h6>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="row g-3 mb-3">
                      <!-- Image slot 1 (Main image) -->
                      <div class="col">
                        <div class="image-upload-slot" @click="$refs.imageInput.click()">
                          <img
                            v-if="form.anhDaiDien"
                            :src="form.anhDaiDien"
                            class="uploaded-image"
                            alt="Image 1"
                          />
                          <div v-else class="upload-placeholder">
                            <i class="bi bi-plus-lg"></i>
                          </div>
                        </div>
                        <p class="upload-label">Thêm ảnh</p>
                        <input
                          type="file"
                          class="d-none"
                          accept="image/*"
                          @change="handleImageUpload"
                          ref="imageInput"
                        />
                      </div>

                      <!-- Image slots 2-5 (Gallery) -->
                      <div class="col" v-for="index in 4" :key="index">
                        <div class="image-upload-slot" @click="$refs.galleryInput.click()">
                          <img
                            v-if="form.images[index - 1]"
                            :src="form.images[index - 1]"
                            class="uploaded-image"
                            :alt="'Image ' + (index + 1)"
                          />
                          <div v-else class="upload-placeholder">
                            <i class="bi bi-plus-lg"></i>
                          </div>
                          <button
                            v-if="form.images[index - 1]"
                            type="button"
                            class="btn-remove-image-slot"
                            @click.stop="removeImage(index - 1)"
                          >
                            <i class="bi bi-x"></i>
                          </button>
                        </div>
                        <p class="upload-label">Thêm ảnh</p>
                      </div>
                      <input
                        type="file"
                        class="d-none"
                        accept="image/*"
                        multiple
                        @change="handleGalleryUpload"
                        ref="galleryInput"
                      />
                    </div>

                    <!-- Upload guidelines -->
                    <div class="upload-guidelines">
                      <p class="guidelines-title">Hướng dẫn tải ảnh:</p>
                      <ul class="guidelines-list">
                        <li>Tối đa 5 hình ảnh</li>
                        <li>Kích thước tối đa 5MB mỗi ảnh</li>
                        <li>Định dạng: JPG, PNG, WebP</li>
                        <li>Khuyến nghị: Ảnh vuông 800x800px trở lên</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Variants Section with Specifications Merged -->
                <div class="card mb-4">
                  <div class="card-header bg-light">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-grid-3x3-gap text-success"></i>
                      <h6 class="mb-0">Biến thể sản phẩm</h6>
                      <i class="bi bi-info-circle text-success" title="Tạo biến thể tự động"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <!-- Loading indicator -->
                    <div v-if="attributeLoading" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                      </div>
                      <p class="mt-2">Đang tải dữ liệu thuộc tính...</p>
                    </div>

                    <!-- Error message -->
                    <div v-else-if="attributeError" class="alert alert-danger" role="alert">
                      {{ attributeError }}
                      <button type="button" class="btn btn-sm btn-danger ms-2" @click="loadAttributes">
                        Thử lại
                      </button>
                    </div>

                    <!-- Variant creation form -->
                    <div v-else class="variant-creation-section">
                      <h6 class="variant-subtitle mb-3">Tạo biến thể tự động</h6>

                      <div class="variant-selectors">
                        <!-- First row: Color, CPU, RAM, GPU -->
                        <div class="row g-3 mb-3">
                          <div class="col-md-3">
                            <label class="form-label">Màu sắc</label>
                            <select class="form-select" v-model="variantConfig.mauSac">
                              <option value="">Chọn màu sắc</option>
                              <option v-for="color in colors" :key="color.id" :value="color.id">
                                {{ color.tenMau }}
                              </option>
                            </select>
                          </div>
                          <div class="col-md-3">
                            <label class="form-label">CPU</label>
                            <select class="form-select" v-model="form.cpu_id">
                              <option value="">Chọn CPU</option>
                              <option v-for="cpu in cpus" :key="cpu.id" :value="cpu.id">
                                {{ cpu.tenCPU }}
                              </option>
                            </select>
                          </div>
                          <div class="col-md-3">
                            <label class="form-label">RAM</label>
                            <select class="form-select" v-model="variantConfig.ram">
                              <option value="">Chọn RAM</option>
                              <option v-for="ram in rams" :key="ram.id" :value="ram.id">
                                {{ ram.dungLuong }}
                              </option>
                            </select>
                          </div>
                          <div class="col-md-3">
                            <label class="form-label">GPU</label>
                            <select class="form-select" v-model="form.gpu_id">
                              <option value="">Chọn GPU</option>
                              <option v-for="gpu in gpus" :key="gpu.id" :value="gpu.id">
                                {{ gpu.tenGPU }}
                              </option>
                            </select>
                          </div>
                        </div>

                        <!-- Second row: Storage, Screen, Battery -->
                        <div class="row g-3 mb-4">
                          <div class="col-md-4">
                            <label class="form-label">Ổ cứng</label>
                            <select class="form-select" v-model="variantConfig.oCung">
                              <option value="">Chọn ổ cứng</option>
                              <option
                                v-for="storage in storages"
                                :key="storage.id"
                                :value="storage.id"
                              >
                                {{ storage.tenOCung }}
                              </option>
                            </select>
                          </div>
                          <div class="col-md-4">
                            <label class="form-label">Màn hình</label>
                            <select class="form-select" v-model="form.loaiManHinh_id">
                              <option value="">Chọn màn hình</option>
                              <option
                                v-for="display in displays"
                                :key="display.id"
                                :value="display.id"
                              >
                                {{ display.congNghe }}
                              </option>
                            </select>
                          </div>
                          <div class="col-md-4">
                            <label class="form-label">Pin</label>
                            <select class="form-select" v-model="form.dungLuongPin_id">
                              <option value="">Chọn pin</option>
                              <option
                                v-for="battery in batteries"
                                :key="battery.id"
                                :value="battery.id"
                              >
                                {{ battery.dungLuong }}
                              </option>
                            </select>
                          </div>
                        </div>

                        <!-- Create variants button -->
                        <div class="variant-actions d-flex align-items-center gap-3 mb-4">
                          <button type="button" class="btn btn-success" @click="createVariants">
                            <i class="bi bi-grid"></i> Tạo biến thể
                          </button>
                          <small class="text-muted"
                            >Gợi ý sử dụng chức năng tự động tạo biến thể cho từng sản phẩm</small
                          >
                        </div>
                      </div>
                    </div>

                    <!-- Display created variants -->
                    <div v-if="form.variants.length > 0" class="created-variants">
                      <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0">Biến thể đã tạo:</h6>
                        <i class="bi bi-question-circle text-primary" style="cursor: pointer"></i>
                      </div>

                      <div class="variants-table-container">
                        <table class="table variants-table">
                          <thead>
                            <tr>
                              <th style="width: 50px">STT</th>
                              <th style="width: 200px">Cấu hình</th>
                              <th style="width: 120px">Ảnh biến thể</th>
                              <th style="width: 150px">Giá bán</th>
                              <th style="width: 120px">Tồn kho</th>
                              <th style="width: 100px">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(variant, index) in form.variants" :key="index">
                              <td>{{ index + 1 }}</td>
                              <td>
                                <div class="variant-specs">
                                  <div class="spec-item">
                                    <i
                                      class="bi bi-circle-fill"
                                      :style="{
                                        color: getColorById(variant.mau_sac_id)?.maMau || '#000',
                                      }"
                                    ></i>
                                    <span>{{
                                      getColorById(variant.mau_sac_id)?.tenMau || 'N/A'
                                    }}</span>
                                  </div>
                                  <div class="spec-item">
                                    <i class="bi bi-cpu"></i>
                                    <span>{{ getCpuName() }}</span>
                                  </div>
                                  <div class="spec-item">
                                    <i class="bi bi-memory"></i>
                                    <span>{{
                                      getRamById(variant.ram_id)?.dungLuong || 'N/A'
                                    }}</span>
                                  </div>
                                  <div class="spec-item">
                                    <i class="bi bi-device-hdd"></i>
                                    <span>{{
                                      getStorageById(variant.o_cung_id)?.tenOCung || 'N/A'
                                    }}</span>
                                  </div>
                                  <div class="spec-item">
                                    <i class="bi bi-display"></i>
                                    <span>{{ getDisplayName() }}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div class="variant-image-cell">
                                  <div
                                    class="variant-image-upload"
                                    @click="selectVariantImage(index)"
                                  >
                                    <i class="bi bi-image"></i>
                                    <span>Tải lên</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  v-model="variant.giaBan"
                                  placeholder="0 đ"
                                />
                                <!-- <small class="text-muted d-block mt-1">0 cô sản</small> -->
                              </td>
                              <td>
                                <input
                                  type="number"
                                  class="form-control form-control-sm"
                                  v-model.number="variant.soLuong"
                                  min="0"
                                  placeholder="0"
                                />
                                <!-- <small class="text-muted d-block mt-1">0 cô sản</small> -->
                              </td>
                              <td>
                                <div class="action-buttons">
                                  <button
                                    type="button"
                                    class="btn btn-sm btn-outline-secondary"
                                    @click="openSerialModal(index)"
                                    title="Quản lý Serial"
                                  >
                                    <i class="bi bi-list-ul"></i>
                                  </button>
                                  <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="removeVariant(index)"
                                    title="Xóa"
                                  >
                                    <i class="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Hủy bỏ</button>
          <button type="button" class="btn btn-primary" @click="save">
            <i class="bi bi-save"></i> Lưu sản phẩm
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>

    <!-- Serial Management Modal - Floating on top -->
    <teleport to="body">
      <div v-if="showSerialModal" class="serial-modal-overlay">
        <div class="serial-modal-wrapper">
          <div class="serial-modal-dialog">
            <div class="serial-modal-content">
              <div class="serial-modal-header">
                <h5 class="serial-modal-title">Quản lý Serial Numbers</h5>
                <button type="button" class="btn-close" @click="closeSerialModal"></button>
              </div>
              <div class="serial-modal-body">
                <!-- Variant Info -->
                <div class="mb-3">
                  <h6 class="section-title">Thông tin biến thể:</h6>
                  <div class="variant-info-grid">
                    <div class="info-item">
                      <span class="info-label">SKU:</span>
                      <span class="info-value">Tự động tạo</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Cấu hình:</span>
                      <span
                        class="info-value text-truncate"
                        :title="getVariantConfig(currentVariantIndex)"
                        >{{ getVariantConfig(currentVariantIndex) }}</span
                      >
                    </div>
                    <div class="info-item">
                      <span class="info-label">Giá bán:</span>
                      <span class="info-value">{{ formatPrice(currentVariant?.giaBan) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Add Serial Number -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Thêm Serial Number:</label>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      v-model="serialInput"
                      placeholder="Nhập serial (VD: 123456, 789012)"
                    />
                    <button type="button" class="btn btn-success" @click="addSerialNumbers">
                      <i class="bi bi-plus-lg"></i> Thêm
                    </button>
                  </div>
                  <small class="text-muted"
                    >Có thể nhập nhiều, cách nhau bằng dấu phẩy (,) hoặc chấm phẩy (;)</small
                  >
                </div>

                <!-- Import from Excel -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Import từ Excel:</label>
                  <div class="d-flex gap-2">
                    <input
                      type="file"
                      ref="excelFileInput"
                      accept=".xlsx,.xls,.csv"
                      class="d-none"
                      @change="importFromExcel"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary btn-sm"
                      @click="$refs.excelFileInput.click()"
                    >
                      <i class="bi bi-file-earmark-arrow-up"></i> Chọn file
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-info btn-sm"
                      @click="downloadExcelTemplate"
                    >
                      <i class="bi bi-download"></i> Tải mẫu
                    </button>
                  </div>
                  <small class="text-muted">Hỗ trợ file .xlsx, .csv</small>
                </div>

                <!-- Serial Numbers List -->
                <div class="serial-list-section">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="section-title mb-0">Danh sách Serial Numbers:</h6>
                    <i
                      class="bi bi-question-circle-fill text-info"
                      style="cursor: pointer"
                      title="Danh sách serial"
                    ></i>
                  </div>

                  <div
                    v-if="currentVariant?.serials?.length > 0"
                    class="table-responsive"
                    style="max-height: 250px"
                  >
                    <table class="table table-hover serial-table">
                      <thead>
                        <tr>
                          <th style="width: 15%">STT</th>
                          <th style="width: 50%">Serial Number</th>
                          <th style="width: 20%">Trạng thái</th>
                          <th style="width: 15%">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(serial, idx) in currentVariant.serials" :key="idx">
                          <td>{{ idx + 1 }}</td>
                          <td class="fw-medium">{{ serial.number }}</td>
                          <td>
                            <span class="badge bg-secondary">{{
                              serial.status || 'Chưa bán'
                            }}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-danger"
                              @click="removeVariantSerial(idx)"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>Chưa có serial number nào</p>
                  </div>
                </div>
              </div>
              <div class="serial-modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeSerialModal">
                  <i class="bi bi-x-lg"></i> Hủy
                </button>
                <button type="button" class="btn btn-success" @click="saveSerials">
                  <i class="bi bi-check-lg"></i> Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAttributeStore } from '@/stores/attributeStore'
import { uploadImageToCloudinary } from '@/service/uploadImageToCloud'

const attributeStore = useAttributeStore()

// const brands = computed(() => attributeStore.getBrands)
const cpus = computed(() => attributeStore.getCpus)
const rams = computed(() => attributeStore.getRams)
const gpus = computed(() => attributeStore.getGpus)
const storages = computed(() => attributeStore.getStorages)
const colors = computed(() => attributeStore.getColors)
// const screens = computed(() => attributeStore.getScreens)
const displays = computed(() => attributeStore.getDisplays)
// const oses = computed(() => attributeStore.getOses)
const batteries = computed(() => attributeStore.getBatteries)
// const cameras = computed(() => attributeStore.getCameras)

const attributeLoading = ref(false)
const attributeError = ref(null)

const loadAttributes = async () => {
  try {
    attributeLoading.value = true
    attributeError.value = null
    await attributeStore.fetchAttributes()
  } catch (error) {
    attributeError.value = 'Không thể tải dữ liệu thuộc tính'
    console.error('Error loading attributes:', error)
  } finally {
    attributeLoading.value = false
  }
}

onMounted(async () => {
  // Always fetch attributes when component is mounted to ensure data is loaded
  await loadAttributes()
})

const props = defineProps({
  product: Object,
})

const emit = defineEmits(['close', 'save'])

const isEditMode = computed(() => {
  console.log('ProductFormModal: isEditMode check, product:', props.product)
  return !!props.product
})

// Debug when component is mounted
onMounted(() => {
  console.log('ProductFormModal mounted with product:', props.product)
  console.log('Edit mode:', isEditMode.value)
})

const form = ref({
  id: null,
  tenSanPham: '',
  maSanPham: '',
  moTaNgan: '',
  moTaChiTiet: '',
  cpu_id: '',
  gpu_id: '',
  loaiManHinh_id: '',
  dungLuongPin_id: '',
  trangThai: 'ACTIVE',
  anhDaiDien: null,
  images: [],
  serials: [],
  variants: [],
})

// Variant configuration for auto-generation
const variantConfig = ref({
  mauSac: '',
  ram: '',
  oCung: '',
})

// Serial modal state
const showSerialModal = ref(false)
const currentVariantIndex = ref(-1)
const serialInput = ref('')
const currentVariant = computed(() => {
  if (currentVariantIndex.value >= 0 && form.value.variants[currentVariantIndex.value]) {
    return form.value.variants[currentVariantIndex.value]
  }
  return null
})

// Initialize form with product data if in edit mode
const initializeForm = () => {
  if (props.product) {
    form.value = {
      id: props.product.id,
      tenSanPham: props.product.tenSanPham || '',
      maSanPham: props.product.maSanPham || '',
      moTaNgan: props.product.moTaNgan || '',
      moTaChiTiet: props.product.moTaChiTiet || '',
      cpu_id: props.product.cpu_id || '',
      gpu_id: props.product.gpu_id || '',
      loaiManHinh_id: props.product.loaiManHinh_id || '',
      dungLuongPin_id: props.product.dungLuongPin_id || '',
      trangThai: props.product.trangThai || 1,
      anhDaiDien: props.product.anhDaiDien || null,
      images: props.product.images || [],
      serials: props.product.serials || [],
      variants: props.product.variants || [],
    }
  } else {
    // Reset form for create mode
    form.value = {
      id: null,
      tenSanPham: '',
      maSanPham: '',
      moTaNgan: '',
      moTaChiTiet: '',
      cpu_id: '',
      gpu_id: '',
      loaiManHinh_id: '',
      dungLuongPin_id: '',
      trangThai: 1,
      anhDaiDien: null,
      images: [],
      serials: [],
      variants: [],
    }
  }
}

// Initialize form when component is created
initializeForm()

// Watch for product prop changes to reinitialize form
watch(() => props.product, () => {
  initializeForm()
}, { deep: true })

const createVariants = () => {
  const { mauSac, ram, oCung } = variantConfig.value

  // Create variant with hardcoded data for testing UI
  const variant = {
    mau_sac_id: mauSac || 1, // Default to first color if not selected
    ram_id: ram || 1, // Default to first RAM
    o_cung_id: oCung || 1, // Default to first storage
    giaBan: 0,
    soLuong: 0,
  }
  form.value.variants.push(variant)

  // Set some default values for CPU and Display if not set
  if (!form.value.cpu_id) {
    form.value.cpu_id = 1
  }
  if (!form.value.loaiManHinh_id) {
    form.value.loaiManHinh_id = 1
  }
}

const addVariant = () => {
  form.value.variants.push({
    ram_id: '',
    o_cung_id: '',
    mau_sac_id: '',
    giaBan: 0,
    soLuong: 0,
  })
}

const removeVariant = (index) => {
  form.value.variants.splice(index, 1)
}

// Helper methods to get attribute names
const getColorById = (id) => {
  return colors.value.find((c) => c.id === id)
}

const getRamById = (id) => {
  return rams.value.find((r) => r.id === id)
}

const getStorageById = (id) => {
  return storages.value.find((s) => s.id === id)
}

const getCpuName = () => {
  const cpu = cpus.value.find((c) => c.id === form.value.cpu_id)
  return cpu ? cpu.tenCPU : 'N/A'
}

const getDisplayName = () => {
  const display = displays.value.find((d) => d.id === form.value.loaiManHinh_id)
  return display ? display.congNghe : 'N/A'
}

const selectVariantImage = (index) => {
  // TODO: Implement variant image upload
  console.log('Upload image for variant', index)
}

// Serial modal functions
const openSerialModal = (index) => {
  currentVariantIndex.value = index
  // Initialize serials array if it doesn't exist
  if (!form.value.variants[index].serials) {
    form.value.variants[index].serials = []
  }
  showSerialModal.value = true
}

const closeSerialModal = () => {
  showSerialModal.value = false
  currentVariantIndex.value = -1
  serialInput.value = ''
}

const addSerialNumbers = () => {
  if (!serialInput.value.trim()) {
    alert('Vui lòng nhập serial number')
    return
  }

  // Split by comma or semicolon
  const serials = serialInput.value
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (serials.length === 0) {
    alert('Không có serial number hợp lệ')
    return
  }

  // Add serials to current variant
  serials.forEach((serial) => {
    currentVariant.value.serials.push({
      number: serial,
      status: 'Chưa bán',
    })
  })

  serialInput.value = ''
}

const removeVariantSerial = (index) => {
  if (confirm('Bạn có chắc muốn xóa serial number này?')) {
    currentVariant.value.serials.splice(index, 1)
  }
}

const importFromExcel = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // TODO: Implement Excel import
  alert('Chức năng import Excel sẽ được cập nhật sau')
  event.target.value = ''
}

const downloadExcelTemplate = () => {
  const csv = 'serial_number\n123456\n789012\n345678'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'serial_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const saveSerials = () => {
  closeSerialModal()
}

const getVariantConfig = (index) => {
  if (index < 0 || !form.value.variants[index]) return 'N/A'
  const variant = form.value.variants[index]
  const color = getColorById(variant.mau_sac_id)?.tenMau || 'N/A'
  const cpu = getCpuName()
  const ram = getRamById(variant.ram_id)?.dungLuong || 'N/A'
  const storage = getStorageById(variant.o_cung_id)?.tenOCung || 'N/A'
  const display = getDisplayName()
  return `${color} - ${cpu} - ${ram} - ${storage} - ${display}`
}

const formatPrice = (price) => {
  if (!price) return '0 đ'
  return `${Number(price).toLocaleString('vi-VN')} đ`
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      const url = await uploadImageToCloudinary(file)
      form.value.anhDaiDien = url
    } catch (e) {
      alert('Lỗi upload ảnh đại diện!')
    }
  }
}

const handleGalleryUpload = async (event) => {
  const files = event.target.files
  if (files) {
    for (const file of files) {
      try {
        const url = await uploadImageToCloudinary(file)
        form.value.images.push(url)
      } catch (e) {
        alert('Lỗi upload ảnh gallery!')
      }
    }
  }
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

// Serials handling
const serialText = ref('')
const applySerialText = () => {
  const lines = serialText.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const unique = Array.from(new Set([...form.value.serials, ...lines]))
  form.value.serials = unique
}

const clearSerials = () => {
  form.value.serials = []
  serialText.value = ''
}

const removeSerial = (index) => {
  form.value.serials.splice(index, 1)
}

const importSerialsFromCSV = async (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  try {
    const text = await file.text()
    // Take first column per line, ignore header-like lines optionally
    const lines = text
      .split(/\r?\n/)
      .map((row) => row.split(',')[0]?.trim())
      .filter((s) => s && s.length > 0 && s.toLowerCase() !== 'serial')
    const unique = Array.from(new Set([...form.value.serials, ...lines]))
    form.value.serials = unique
  } catch (e) {
    alert('Không đọc được file CSV. Vui lòng lưu Excel thành CSV UTF-8 rồi thử lại.')
  } finally {
    event.target.value = ''
  }
}

const downloadSerialTemplate = () => {
  const header = 'serial\n'
  const sample = ['SNR001', 'SNR002', 'SNR003'].join('\n')
  const csv = header + sample
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'serial_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const save = () => {
  // Validate required fields
  if (!form.value.tenSanPham?.trim()) {
    alert('Vui lòng nhập tên sản phẩm')
    return
  }

  // Validate variants if any exist
  if (form.value.variants && form.value.variants.length > 0) {
    for (let i = 0; i < form.value.variants.length; i++) {
      const variant = form.value.variants[i]
      if (!variant.giaBan || variant.giaBan <= 0) {
        alert(`Vui lòng nhập giá bán hợp lệ cho biến thể ${i + 1}`)
        return
      }
      if (variant.soLuong < 0) {
        alert(`Số lượng tồn kho không được âm cho biến thể ${i + 1}`)
        return
      }
    }
  }

  // Prepare form data for submission
  const formData = {
    ...form.value,
    trangThai: Number(form.value.trangThai), // Ensure status is a number
  }

  console.log('Saving product data:', formData)
  emit('save', formData)
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-content {
  max-height: none;
  display: flex;
  flex-direction: column;
  z-index: 1310;
  pointer-events: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.12);
  padding: 0;
  border: none;
  height: 100vh;
  border-radius: 12px 0 0 12px;
}

.modal-header {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 20px 24px;
  background: #fff; /* remove blue background */
  color: #0f172a;
  border-bottom: 1px solid #e5e7eb;
}

/* Force override Bootstrap utility classes on header without changing template */
.modal-header.bg-primary {
  background: #fff !important;
}
.modal-header.text-white,
.modal-title.text-white {
  color: #0f172a !important;
}
.modal-header .btn-close-white {
  filter: none;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.modal-body {
  padding: 16px;
  background: #f8fafc;
  overflow-y: auto;
  flex: 1;
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  background: #fff;
}

.card-header {
  padding: 12px 18px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff; /* match management form */
  font-weight: 500;
  font-size: 16px;
}

.card-body {
  padding: 14px;
}

.form-label {
  font-weight: 500;
  color: #334155;
  margin-bottom: 4px;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #e5e7eb; /* subtle border */
  font-size: 15px;
  padding: 8px 10px;
  background: #fff; /* white like management form */
  min-height: 42px;
  height: 42px;
}

/* Multi-select dropdowns - same height as single-select */
.variant-selectors .form-select[multiple] {
  height: 38px !important;
  min-height: 38px;
  max-height: 38px;
  overflow-y: auto;
}

/* Ensure all single-select dropdowns have same height */
.variant-selectors .form-select:not([multiple]) {
  height: 38px !important;
  min-height: 38px;
}

textarea.form-control {
  height: auto;
  min-height: 80px;
}

/* Variant card styling */
.variants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.variant-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: none;
}

.variant-card:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: none;
}

/* Variants table styling */
.variants-table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.variants-table {
  margin: 0;
  font-size: 14px;
  background: #fff;
}

.variants-table thead {
  background: #f9fafb;
}

.variants-table th {
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
  padding: 12px 10px;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.variants-table td {
  padding: 12px 10px;
  vertical-align: middle;
  border-bottom: 1px solid #f3f4f6;
}

.variants-table tbody tr:last-child td {
  border-bottom: none;
}

.variant-specs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #374151;
}

.spec-item i {
  font-size: 12px;
  color: #6b7280;
}

.variant-image-cell {
  display: flex;
  justify-content: center;
}

.variant-image-upload {
  width: 80px;
  height: 80px;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f9fafb;
  transition: all 0.2s;
}

.variant-image-upload:hover {
  border-color: #16a34a;
  background: #f0fdf4;
}

.variant-image-upload i {
  font-size: 24px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.variant-image-upload span {
  font-size: 11px;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-buttons .btn {
  padding: 4px 8px;
  font-size: 14px;
}

/* Serial modal styling - Floating on top */
.serial-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.serial-modal-wrapper {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.serial-modal-dialog {
  position: relative;
}

.serial-modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.serial-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.serial-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.serial-modal-body {
  padding: 24px;
  background: #f9fafb;
}

.serial-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.variant-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

.serial-list-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.serial-table {
  font-size: 13px;
  margin-bottom: 0;
}

.serial-table thead {
  background: #f9fafb;
}

.serial-table th {
  font-weight: 600;
  color: #6b7280;
  font-size: 12px;
  padding: 10px 12px;
  border-bottom: 2px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.serial-table td {
  padding: 10px 12px;
  vertical-align: middle;
  color: #374151;
  font-size: 13px;
}

.serial-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

.serial-table tbody tr:last-child {
  border-bottom: none;
}

.serial-table tbody tr:hover {
  background: #f9fafb;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.form-control:focus,
.form-select:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
  outline: none;
}

.btn {
  border-radius: 6px;
  font-size: 15px;
  padding: 8px 18px;
}

.btn-primary {
  background: #fff;
  color: #16a34a; /* green text */
  border: 1px solid #16a34a; /* green border */
}

.btn-primary:hover,
.btn-primary:focus {
  background: #16a34a; /* green background */
  color: #fff; /* white text */
  border-color: #16a34a;
}

.btn-secondary {
  background: #fff;
  color: #16a34a;
  border: 1px solid #16a34a;
}

.btn-secondary:hover,
.btn-secondary:focus {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}

/* ensure outline buttons match the green theme */
.btn-outline-primary {
  color: #16a34a;
  border-color: #16a34a;
  background: #fff;
}
.btn-outline-primary:hover,
.btn-outline-primary:focus {
  color: #fff;
  background: #16a34a;
  border-color: #16a34a;
}

.modal-footer {
  padding: 16px 24px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  background: #fff; /* match management form footer */
  border-top: 1px solid #e5e7eb;
}

.avatar-upload {
  text-align: center;
}

.avatar-preview {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.avatar-preview-small {
  width: 100%;
  max-width: 120px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 8px;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gallery-item {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item.add-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  cursor: pointer;
}

/* New image upload slot styles */
.image-upload-slot {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
}

.image-upload-slot:hover {
  border-color: #16a34a;
  background: #f0fdf4;
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #9ca3af;
  font-size: 32px;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image-slot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
}

.btn-remove-image-slot:hover {
  background: rgba(220, 38, 38, 1);
}

.upload-label {
  text-align: center;
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 13px;
  color: #6b7280;
}

.upload-guidelines {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
}

.guidelines-title {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
}

.guidelines-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #6b7280;
}

.guidelines-list li {
  margin-bottom: 4px;
}

.btn-remove-image {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 0;
  font-size: 10px;
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variant-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}

.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.variant-content {
  background: #f8fafc;
  border-radius: 6px;
  padding: 6px;
}

.serials-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.serial-pill {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

/* Compact default Bootstrap spacings to reduce empty space */
.card.mb-4 {
  margin-bottom: 12px !important;
}
.row.g-4 {
  --bs-gutter-y: 0.75rem; /* reduce vertical gap */
  --bs-gutter-x: 1rem; /* reduce horizontal gap slightly */
}

.modal {
  position: fixed !important;
  top: 0;
  left: 240px; /* align to the right of sidebar */
  width: calc(100% - 240px);
  height: 100%;
  overflow: hidden;
  z-index: 1300;
  pointer-events: auto;
}

/* .modal {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    z-index: 1050;
}
.modal-backdrop {
    position: fixed !important;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
} */
/*
body.modal-open {
    overflow: hidden;
} */
.modal {
  position: fixed;
  z-index: 1300;
  pointer-events: auto;
}

.modal-backdrop {
  position: fixed;
  left: 240px; /* keep sidebar visible */
  width: calc(100% - 240px);
  z-index: 1290;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

/* Make the dialog take full height on the right side */
.modal-dialog {
  margin: 0 0 0 auto;
  max-width: 100%;
  height: 100%;
}

/* Responsive offsets to match sidebar widths */
@media (max-width: 991px) {
  .modal {
    left: 180px;
    width: calc(100% - 180px);
  }
  .modal-backdrop {
    left: 180px;
    width: calc(100% - 180px);
  }
}

@media (max-width: 767px) {
  .modal {
    left: 0;
    width: 100%;
  }
  .modal-backdrop {
    left: 0;
    width: 100%;
  }
}
</style>
