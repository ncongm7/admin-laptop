
<template>
  <div class="product-list">
    <!-- Bulk Actions Bar -->
    <div v-if="selectedIds.length > 0" class="bulk-actions-bar">
      <div class="d-flex align-items-center justify-content-between">
        <div class="selected-info">
          <i class="bi bi-check-circle-fill text-success me-2"></i>
          <span>Đã chọn {{ selectedIds.length }} sản phẩm</span>
        </div>
        <div class="bulk-actions">
          <button 
            class="btn btn-outline-danger btn-sm me-2" 
            @click="handleBulkDelete"
            :disabled="loading"
          >
            <i class="bi bi-trash"></i>
            Xóa đã chọn
          </button>
          <button 
            class="btn btn-outline-secondary btn-sm" 
            @click="clearSelection"
          >
            <i class="bi bi-x"></i>
            Bỏ chọn
          </button>
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th width="40" class="text-center">
              <input type="checkbox" :checked="allSelected" @change="toggleSelectAll($event)" />
            </th>
            <th width="60">STT</th>
            <th>Mã sản phẩm</th>
            <th>Tên sản phẩm</th>
            <th>Giá thấp nhất</th>
            <th>Giá cao nhất</th>
            <th>Số Lượng Biến Thể</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th width="140">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="loading">
            <td colspan="11" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="products.length === 0">
            <td colspan="11" class="text-center py-5 text-muted">
              <i class="bi bi-box-seam display-5"></i>
              <p class="mt-3">Không có sản phẩm nào</p>
            </td>
          </tr>

          <!-- Product Rows -->
          <tr
            v-for="(product, index) in paginatedProducts"
            :key="product.id"
            @click="viewProduct(product)"
            class="product-row"
          >
            <td class="text-center" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(product.id)"
                @change="toggleOne(product.id, $event)"
              />
            </td>
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>
              <span class="text-muted">{{ product.maSanPham }}</span>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <div class="product-thumbnail me-3">
                  <img
                    :src="getProductThumbnail(product)"
                    :alt="product.tenSanPham"
                  />
                </div>
                <div class="product-name">{{ product.tenSanPham }}</div>
              </div>
            </td>
            <td>
              <div class="product-price">
                <span
                  class="text-dark"
                  v-if="product.variants && product.variants.length > 0"
                >
                  {{ formatCurrency(getMinPrice(product.variants)) }}
                </span>
                <span class="text-muted" v-else>Chưa có giá</span>
              </div>
            </td>
            <td>
              <div class="product-price">
                <span
                  class="text-dark"
                  v-if="product.variants && product.variants.length > 0"
                >
                  {{ formatCurrency(getMaxPrice(product.variants)) }}
                </span>
                <span class="text-muted" v-else>Chưa có giá</span>
              </div>
            </td>
            <td>
              <div class="variant-count">
                <span class="text-dark">
                  {{ getVariantCount(product) }}
                </span>
              </div>
            </td>
            <td>
              <span :class="statusClass(product.trangThai)" class="badge">
                {{ product.trangThai == 1 ? 'Hoạt động' : 'Ẩn' }}
              </span>
            </td>
            <td>{{ formatDateSafe(product) }}</td>
            <td>{{ formatUpdateDateSafe(product) }}</td>
            <td @click.stop>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-primary"
                  @click="handleView(product)"
                  title="Xem chi tiết"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-outline-warning" @click="handleEdit(product)" title="Sửa">
                  <i class="bi bi-pencil"></i>
                </button>
                <button 
                  class="btn btn-outline-success" 
                  @click="handleAddVariant(product)" 
                  title="Thêm biến thể"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-wrapper" v-if="!loading && products.length > 0">
      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted">
          Hiển thị {{ startItem }} - {{ endItem }} của {{ products.length }} sản phẩm
        </div>
        <nav aria-label="Page navigation">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)"> Trước </a>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)"> Tiếp </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>

  <!-- Add Variant Modal (using ProductFormModal component) -->
  <ProductFormModal
    v-if="showVariantModal"
    :product="selectedProduct"
    mode="add-variants-only"
    @close="handleVariantModalClose"
    @save="handleVariantModalSave"
  />

  <!-- Old Add Variant Modal (deprecated, can be removed later) -->
  <div class="modal fade" id="addVariantModal" tabindex="-1" aria-labelledby="addVariantModalLabel" aria-hidden="true" data-bs-backdrop="false" style="z-index: 1050;">
    <div class="modal-dialog modal-xl" style="margin-left: 250px; margin-right: 20px;">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addVariantModalLabel">
            <i class="bi bi-plus-circle text-success me-2"></i>
            Thêm biến thể cho sản phẩm: {{ selectedProduct?.tenSanPham }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
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
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown">
                          <span v-if="variantConfig.selectedMauSacIds.length === 0" class="text-muted">Chọn màu sắc...</span>
                          <span v-else class="selected-items">
                            {{ getSelectedColorNames(variantConfig.selectedMauSacIds).slice(0, 2).join(', ') }}
                            <span v-if="variantConfig.selectedMauSacIds.length > 2" class="badge bg-primary ms-1">
                              +{{ variantConfig.selectedMauSacIds.length - 2 }}
                            </span>
                          </span>
                        </button>
                        <ul class="dropdown-menu w-100 multi-select-dropdown">
                          <li v-for="color in colors" :key="color.id" class="dropdown-item-checkbox">
                            <label class="dropdown-item mb-0">
                              <input 
                                type="checkbox" 
                                :value="color.id" 
                                v-model="variantConfig.selectedMauSacIds"
                                class="form-check-input me-2"
                              >
                              <span class="color-indicator" :style="{ backgroundColor: color.hexCode || '#ccc' }"></span>
                              {{ color.tenMau }}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">CPU</label>
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown">
                          <span v-if="variantConfig.selectedCpuIds.length === 0" class="text-muted">Chọn CPU...</span>
                          <span v-else class="selected-items">
                            {{ getSelectedCpuNames(variantConfig.selectedCpuIds).slice(0, 1).join(', ') }}
                            <span v-if="variantConfig.selectedCpuIds.length > 1" class="badge bg-primary ms-1">
                              +{{ variantConfig.selectedCpuIds.length - 1 }}
                            </span>
                          </span>
                        </button>
                        <ul class="dropdown-menu w-100 multi-select-dropdown">
                          <li v-for="cpu in cpus" :key="cpu.id" class="dropdown-item-checkbox">
                            <label class="dropdown-item mb-0">
                              <input 
                                type="checkbox" 
                                :value="cpu.id" 
                                v-model="variantConfig.selectedCpuIds"
                                class="form-check-input me-2"
                              >
                              <i class="bi bi-cpu me-2 text-primary"></i>
                              {{ cpu.tenCpu }}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">RAM</label>
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown">
                          <span v-if="variantConfig.selectedRamIds.length === 0" class="text-muted">Chọn RAM...</span>
                          <span v-else class="selected-items">
                            {{ getSelectedRamNames(variantConfig.selectedRamIds).slice(0, 1).join(', ') }}
                            <span v-if="variantConfig.selectedRamIds.length > 1" class="badge bg-primary ms-1">
                              +{{ variantConfig.selectedRamIds.length - 1 }}
                            </span>
                          </span>
                        </button>
                        <ul class="dropdown-menu w-100 multi-select-dropdown">
                          <li v-for="ram in rams" :key="ram.id" class="dropdown-item-checkbox">
                            <label class="dropdown-item mb-0">
                              <input 
                                type="checkbox" 
                                :value="ram.id" 
                                v-model="variantConfig.selectedRamIds"
                                class="form-check-input me-2"
                              >
                              <i class="bi bi-memory me-2 text-success"></i>
                              {{ ram.tenRam }}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">GPU</label>
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown">
                          <span v-if="variantConfig.selectedGpuIds.length === 0" class="text-muted">Chọn GPU...</span>
                          <span v-else class="selected-items">
                            {{ getSelectedGpuNames(variantConfig.selectedGpuIds).slice(0, 1).join(', ') }}
                            <span v-if="variantConfig.selectedGpuIds.length > 1" class="badge bg-primary ms-1">
                              +{{ variantConfig.selectedGpuIds.length - 1 }}
                            </span>
                          </span>
                        </button>
                        <ul class="dropdown-menu w-100 multi-select-dropdown">
                          <li v-for="gpu in gpus" :key="gpu.id" class="dropdown-item-checkbox">
                            <label class="dropdown-item mb-0">
                              <input 
                                type="checkbox" 
                                :value="gpu.id" 
                                v-model="variantConfig.selectedGpuIds"
                                class="form-check-input me-2"
                              >
                              <i class="bi bi-gpu-card me-2 text-warning"></i>
                              {{ gpu.tenGpu }}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Second row: Storage, Screen, Battery -->
                  <div class="row g-3 mb-4">
                    <div class="col-md-4">
                      <label class="form-label">Ổ cứng</label>
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown">
                          <span v-if="variantConfig.selectedOCungIds.length === 0" class="text-muted">Chọn ổ cứng...</span>
                          <span v-else class="selected-items">
                            {{ getSelectedStorageNames(variantConfig.selectedOCungIds).slice(0, 1).join(', ') }}
                            <span v-if="variantConfig.selectedOCungIds.length > 1" class="badge bg-primary ms-1">
                              +{{ variantConfig.selectedOCungIds.length - 1 }}
                            </span>
                          </span>
                        </button>
                        <ul class="dropdown-menu w-100 multi-select-dropdown">
                          <li v-for="storage in storages" :key="storage.id" class="dropdown-item-checkbox">
                            <label class="dropdown-item mb-0">
                              <input 
                                type="checkbox" 
                                :value="storage.id" 
                                v-model="variantConfig.selectedOCungIds"
                                class="form-check-input me-2"
                              >
                              <i class="bi bi-hdd me-2 text-info"></i>
                              {{ storage.dungLuong }}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Màn hình</label>
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown">
                          <span v-if="variantConfig.selectedLoaiManHinhIds.length === 0" class="text-muted">Chọn màn hình...</span>
                          <span v-else class="selected-items">
                            {{ getSelectedDisplayNames(variantConfig.selectedLoaiManHinhIds).slice(0, 1).join(', ') }}
                            <span v-if="variantConfig.selectedLoaiManHinhIds.length > 1" class="badge bg-primary ms-1">
                              +{{ variantConfig.selectedLoaiManHinhIds.length - 1 }}
                            </span>
                          </span>
                        </button>
                        <ul class="dropdown-menu w-100 multi-select-dropdown">
                          <li v-for="display in displays" :key="display.id" class="dropdown-item-checkbox">
                            <label class="dropdown-item mb-0">
                              <input 
                                type="checkbox" 
                                :value="display.id" 
                                v-model="variantConfig.selectedLoaiManHinhIds"
                                class="form-check-input me-2"
                              >
                              <i class="bi bi-display me-2 text-secondary"></i>
                              {{ display.kichThuoc }}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Pin</label>
                      <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown">
                          <span v-if="variantConfig.selectedPinIds.length === 0" class="text-muted">Chọn pin...</span>
                          <span v-else class="selected-items">
                            {{ getSelectedBatteryNames(variantConfig.selectedPinIds).slice(0, 1).join(', ') }}
                            <span v-if="variantConfig.selectedPinIds.length > 1" class="badge bg-primary ms-1">
                              +{{ variantConfig.selectedPinIds.length - 1 }}
                            </span>
                          </span>
                        </button>
                        <ul class="dropdown-menu w-100 multi-select-dropdown">
                          <li v-for="battery in batteries" :key="battery.id" class="dropdown-item-checkbox">
                            <label class="dropdown-item mb-0">
                              <input 
                                type="checkbox" 
                                :value="battery.id" 
                                v-model="variantConfig.selectedPinIds"
                                class="form-check-input me-2"
                              >
                              <i class="bi bi-battery me-2 text-danger"></i>
                              {{ battery.dungLuongPin }}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Auto preview info -->
                  <div class="d-flex justify-content-start mb-4">
                    <div class="alert alert-success d-flex align-items-center" v-if="calculateTotalCombinations > 0">
                      <i class="bi bi-check-circle me-2"></i>
                      <span><strong>Sẽ tạo {{ calculateTotalCombinations }} biến thể</strong> từ các thuộc tính đã chọn.</span>
                    </div>
                    <div class="alert alert-secondary d-flex align-items-center" v-else>
                      <i class="bi bi-lightbulb me-2"></i>
                      <span>Chọn các thuộc tính để tạo biến thể tự động</span>
                    </div>
                  </div>


                </div>

                <!-- Display preview variants (for testing serial functionality) -->
                <div v-if="displayVariants.length > 0" class="created-variants">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                    <div class="d-flex align-items-center gap-2">
                      <h6 class="mb-0">Xem trước biến thể:</h6>
                      <i class="bi bi-info-circle text-info" title="Xem trước biến thể sẽ được tạo"></i>
                    </div>
                  </div>

                  <div class="variants-table-container">
                    <table class="table table-bordered variants-table">
                      <thead class="table-light">
                        <tr>
                          <th style="width: 60px" class="text-center">STT</th>
                          <th style="width: 300px">Cấu hình</th>
                          <th style="width: 150px" class="text-center">Giá bán</th>
                          <th style="width: 100px" class="text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(variant, index) in displayVariants" :key="index">
                          <td class="text-center align-middle">{{ index + 1 }}</td>
                          <td>
                            <div class="variant-config-vertical">
                              <div class="spec-item" v-if="variant.tenMauSac">
                                <i class="bi bi-palette text-primary"></i>
                                <span>{{ variant.tenMauSac }}</span>
                              </div>
                              <div class="spec-item" v-if="variant.tenCpu">
                                <i class="bi bi-cpu text-info"></i>
                                <span>{{ variant.tenCpu }}</span>
                              </div>
                              <div class="spec-item" v-if="variant.tenRam">
                                <i class="bi bi-memory text-success"></i>
                                <span>{{ variant.tenRam }}</span>
                              </div>
                              <div class="spec-item" v-if="variant.tenGpu">
                                <i class="bi bi-gpu-card text-warning"></i>
                                <span>{{ variant.tenGpu }}</span>
                              </div>
                              <div class="spec-item" v-if="variant.dungLuongOCung">
                                <i class="bi bi-hdd text-secondary"></i>
                                <span>{{ variant.dungLuongOCung }}</span>
                              </div>
                              <div class="spec-item" v-if="variant.kichThuocManHinh">
                                <i class="bi bi-display text-dark"></i>
                                <span>{{ variant.kichThuocManHinh }}</span>
                              </div>
                              <div class="spec-item" v-if="variant.dungLuongPin">
                                <i class="bi bi-battery text-danger"></i>
                                <span>{{ variant.dungLuongPin }}</span>
                              </div>
                            </div>
                          </td>
                          <td class="text-center align-middle">
                            <input
                              type="number"
                              class="form-control form-control-sm text-center"
                              v-model="variant.giaBan"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td class="text-center align-middle">
                            <div class="d-flex gap-1 justify-content-center">
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-secondary"
                                @click="openSerialModal(index)"
                                title="Quản lý serial"
                              >
                                <i class="bi bi-list-ul"></i>
                              </button>
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                @click="removeVariantFromPreview(index)"
                                title="Xóa biến thể"
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
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="closeModal">
            <i class="bi bi-x-lg me-2"></i>Hủy bỏ
          </button>
          <button 
            type="button" 
            class="btn btn-success" 
            @click="handleCreateVariants"
            :disabled="variantLoading || calculateTotalCombinations === 0"
          >
            <span v-if="variantLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-plus-circle me-2"></i>
            {{ variantLoading ? 'Đang tạo...' : 'Thêm biến thể' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Serial Management Modal - Floating on top -->
  <teleport to="body">
    <div v-if="showSerialModal" class="serial-modal-overlay">
      <div class="serial-modal-wrapper">
        <div class="serial-modal-dialog">
          <div class="serial-modal-content">
            <div class="serial-modal-header">
              <h5 class="serial-modal-title">
                Quản lý Serial Numbers
              </h5>
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
                    ref="serialInputField"
                    type="text"
                    class="form-control"
                    v-model="serialInput"
                    placeholder="Nhập serial (VD: ABC123, DEF456789)"
                    maxlength="100"
                    autocomplete="off"
                    @focus="console.log('Serial input focused')"
                    @blur="console.log('Serial input blurred')"
                    @input="console.log('Serial input changed:', $event.target.value)"
                  />
                  <button type="button" class="btn btn-success" @click="addSerialNumbers">
                    <i class="bi bi-plus-lg"></i> Thêm
                  </button>
                </div>
                <div v-if="serialValidationError" class="text-warning small mt-1">
                  <i class="bi bi-exclamation-triangle"></i> {{ serialValidationError }}
                </div>
                <small class="text-muted"
                  >Có thể nhập nhiều, cách nhau bằng dấu phẩy (,) hoặc chấm phẩy (;). Mỗi serial phải có 7 ký tự gồm cả chữ và số.</small
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
                        <th style="width: 40%">Serial Number</th>
                        <th style="width: 20%">Trạng thái</th>
                        <th style="width: 25%">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(serial, idx) in currentVariant.serials" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td class="fw-medium">
                          {{ serial.soSerial }}
                          <i 
                            v-if="!serial.id" 
                            class="bi bi-circle-fill text-warning ms-1" 
                            title="Chưa lưu vào database"
                            style="font-size: 6px;"
                          ></i>
                          <i 
                            v-else 
                            class="bi bi-check-circle-fill text-success ms-1" 
                            title="Đã lưu vào database"
                            style="font-size: 10px;"
                          ></i>
                        </td>
                        <td>
                          <span 
                            class="badge" 
                            :class="serial.trangThai === 1 ? 'bg-success' : 'bg-secondary'"
                          >
                            {{ serial.trangThai === 1 ? 'Có sẵn' : 'Ẩn' }}
                          </span>
                        </td>
                        <td>
                          <div class="d-flex gap-1">
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-primary"
                              @click="toggleSerialStatus(idx)"
                              :title="serial.trangThai === 1 ? 'Chuyển sang Ẩn' : 'Chuyển sang Có sẵn'"
                            >
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-danger"
                              @click="removeSerial(idx)"
                              title="Xóa serial"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
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
              <div class="d-flex align-items-center me-auto" v-if="currentVariant?.serials?.length > 0">
                <small class="text-muted">
                  <i class="bi bi-info-circle"></i>
                  Tổng: {{ currentVariant.serials.length }} serial
                  <span v-if="getUnsavedSerialsCount() > 0" class="text-warning ms-2">
                    ({{ getUnsavedSerialsCount() }} chưa lưu)
                  </span>
                </small>
              </div>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-secondary" @click="closeSerialModal">
                  <i class="bi bi-x-lg"></i> Hủy
                </button>
                <button 
                  type="button" 
                  class="btn btn-success" 
                  @click="saveSerials"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check-lg"></i> 
                  {{ loading ? 'Lưu...' : 'Lưu' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { formatCurrency } from '@/utils/helpers'
import { formatDate } from '@/utils/dateUtils'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { taoBienTheSanPham, getCPUList, getGPUList, getRamList, getOCungList, getMauSacList, getLoaiManHinhList, getPinList } from '@/service/sanpham/SanPhamService'
import { Modal } from 'bootstrap'
import ProductFormModal from '@/components/sanpham/quanlisanpham/ProductFormModal.vue'



const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'view', 'bulk-delete', 'selection-change', 'variant-added'])

// Variant creation state
const selectedProduct = ref(null)
const showVariantModal = ref(false)
const variantLoading = ref(false)
const attributeLoading = ref(false)
const attributeError = ref('')
const displayVariants = ref([])

// Serial modal state
const showSerialModal = ref(false)
const currentVariantIndex = ref(-1)
const serialInput = ref('')
const serialValidationError = ref('')
const serialValidationSuccess = ref(false)
const excelFileInput = ref(null)
const loading = ref(false)

// Variant configuration - simplified to single selections like in the image
const variantConfig = ref({
  selectedCpuIds: [],
  selectedGpuIds: [],
  selectedRamIds: [],
  selectedOCungIds: [],
  selectedMauSacIds: [],
  selectedLoaiManHinhIds: [],
  selectedPinIds: [],
  trangThai: 1
})

// Attributes data
const colors = ref([])
const cpus = ref([])
const rams = ref([])
const gpus = ref([])
const storages = ref([])
const displays = ref([])
const batteries = ref([])

// Pagination state
const itemsPerPage = 5 // Fixed to 5 products per page
const currentPage = ref(1)

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(props.products.length / itemsPerPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return props.products.slice(start, end)
})

const startItem = computed(() => {
  if (props.products.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage + 1
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage
  return end > props.products.length ? props.products.length : end
})

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// Selection state
const selectedIds = ref([])
const allSelected = computed(
  () =>
    paginatedProducts.value.length > 0 &&
    paginatedProducts.value.every((p) => selectedIds.value.includes(p.id)),
)
const isSelected = (id) => selectedIds.value.includes(id)
const toggleOne = (id, evt) => {
  const checked = evt.target.checked
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
  emit('selection-change', selectedIds.value)
}
const toggleSelectAll = (evt) => {
  const checked = evt.target.checked
  if (checked) {
    // Add all products on current page to selection
    const pageIds = paginatedProducts.value.map((p) => p.id)
    selectedIds.value = [...new Set([...selectedIds.value, ...pageIds])]
  } else {
    // Remove all products on current page from selection
    const pageIds = paginatedProducts.value.map((p) => p.id)
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
  }
  emit('selection-change', selectedIds.value)
}

const getMinPrice = (variants) => {
  if (!variants || variants.length === 0) return 0
  return Math.min(...variants.map((v) => v.giaBan || v.gia || 0))
}

const getMaxPrice = (variants) => {
  if (!variants || variants.length === 0) return 0
  return Math.max(...variants.map((v) => v.giaBan || v.gia || 0))
}

const hasPriceRange = (variants) => {
  if (!variants || variants.length <= 1) return false
  return getMinPrice(variants) !== getMaxPrice(variants)
}

const getVariantCount = (product) => {
  if (!product.variants || !Array.isArray(product.variants)) {
    return 0
  }
  return product.variants.length
}

const stockStatusClass = (stock) => {
  if (stock > 10) return 'text-success'
  if (stock > 0) return 'text-warning'
  return 'text-danger'
}

const statusClass = (status) => {
  return status === 1 ? 'bg-success' : 'bg-secondary'
}

const getProductThumbnail = (product) => {
  // Return product thumbnail if exists
  if (product.anhDaiDien) {
    return product.anhDaiDien
  }
  
  // Otherwise try to get from first variant with images
  if (product.variants && product.variants.length > 0) {
    for (const variant of product.variants) {
      if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
        const firstImage = variant.images[0]
        // Handle both object with url property and direct string url
        if (typeof firstImage === 'string') {
          return firstImage
        }
        if (firstImage && firstImage.url) {
          return firstImage.url
        }
        // Try other possible properties
        if (firstImage && firstImage.uri) {
          return firstImage.uri
        }
      }
    }
  }
  
  // Fallback to placeholder
  return '/placeholder-product.jpg'
}

const viewProduct = (product) => {
  emit('view', product)
}

const handleView = (product) => {
  emit('view', product)
}

const handleEdit = (product) => {
  // Directly emit edit without confirmation dialog
  emit('edit', product)
}

// handleDelete function removed as delete functionality is no longer needed

const handleBulkDelete = () => {
  console.log('ProductList handleBulkDelete called with selectedIds:', selectedIds.value)
  
  if (selectedIds.value.length === 0) {
    alert('Vui lòng chọn ít nhất một sản phẩm để xóa')
    return
  }
  
  const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedIds.value.length} sản phẩm đã chọn?\n\nHành động này không thể hoàn tác!`
  
  if (confirm(confirmMessage)) {
    console.log('ProductList emitting bulk-delete event with:', selectedIds.value)
    emit('bulk-delete', selectedIds.value)
  }
}

const clearSelection = () => {
  selectedIds.value = []
  emit('selection-change', selectedIds.value)
}

const formatDateSafe = (product) => {
  return formatDate(product.ngayTao || product.createdAt)
}

const formatUpdateDateSafe = (product) => {
  return formatDate(product.ngaySua || product.updatedAt)
}

// ===== VARIANT CREATION FUNCTIONALITY =====

// Computed properties for variant creation
const calculateTotalCombinations = computed(() => {
  const selectedCounts = [
    variantConfig.value.selectedMauSacIds.filter(id => id !== "").length,
    variantConfig.value.selectedCpuIds.filter(id => id !== "").length,
    variantConfig.value.selectedRamIds.filter(id => id !== "").length,
    variantConfig.value.selectedGpuIds.filter(id => id !== "").length,
    variantConfig.value.selectedOCungIds.filter(id => id !== "").length,
    variantConfig.value.selectedLoaiManHinhIds.filter(id => id !== "").length,
    variantConfig.value.selectedPinIds.filter(id => id !== "").length
  ].filter(count => count > 0)
  
  return selectedCounts.length > 0 ? selectedCounts.reduce((a, b) => a * b, 1) : 0
})

// Current variant for serial management
const currentVariant = computed(() => {
  return currentVariantIndex.value >= 0 ? displayVariants.value[currentVariantIndex.value] : null
})

// Auto-generate variants when attributes change
watch(
  () => [
    variantConfig.value.selectedMauSacIds,
    variantConfig.value.selectedCpuIds,
    variantConfig.value.selectedRamIds,
    variantConfig.value.selectedGpuIds,
    variantConfig.value.selectedOCungIds,
    variantConfig.value.selectedLoaiManHinhIds,
    variantConfig.value.selectedPinIds
  ],
  () => {
    // Add a small delay to prevent too many rapid updates
    setTimeout(() => {
      generateVariantsAutomatically()
    }, 100)
  },
  { deep: true, immediate: true }
)

// Helper functions for attribute names
const getSelectedColorNames = (ids) => {
  return ids.map(id => colors.value.find(c => c.id === id)?.tenMau).filter(Boolean)
}

const getSelectedCpuNames = (ids) => {
  return ids.map(id => cpus.value.find(c => c.id === id)?.tenCpu).filter(Boolean)
}

const getSelectedRamNames = (ids) => {
  return ids.map(id => rams.value.find(r => r.id === id)?.tenRam).filter(Boolean)
}

const getSelectedGpuNames = (ids) => {
  return ids.map(id => gpus.value.find(g => g.id === id)?.tenGpu).filter(Boolean)
}

const getSelectedStorageNames = (ids) => {
  return ids.map(id => storages.value.find(s => s.id === id)?.dungLuong).filter(Boolean)
}

const getSelectedDisplayNames = (ids) => {
  return ids.map(id => displays.value.find(d => d.id === id)?.kichThuoc).filter(Boolean)
}

const getSelectedBatteryNames = (ids) => {
  return ids.map(id => batteries.value.find(b => b.id === id)?.dungLuongPin).filter(Boolean)
}

// Load attributes data
const loadAttributes = async () => {
  try {
    attributeLoading.value = true
    attributeError.value = ''
    
    // Load all attributes in parallel
    const [colorsRes, cpusRes, ramsRes, gpusRes, storagesRes, displaysRes, batteriesRes] = await Promise.all([
      getMauSacList(),
      getCPUList(),
      getRamList(),
      getGPUList(),
      getOCungList(),
      getLoaiManHinhList(),
      getPinList()
    ])
    
    colors.value = colorsRes.data || []
    cpus.value = cpusRes.data || []
    rams.value = ramsRes.data || []
    gpus.value = gpusRes.data || []
    storages.value = storagesRes.data || []
    displays.value = displaysRes.data || []
    batteries.value = batteriesRes.data || []
    
    console.log('Loaded attributes:', {
      colors: colors.value.length,
      cpus: cpus.value.length,
      rams: rams.value.length,
      gpus: gpus.value.length,
      storages: storages.value.length,
      displays: displays.value.length,
      batteries: batteries.value.length
    })
    
  } catch (error) {
    console.error('Error loading attributes:', error)
    attributeError.value = 'Lỗi khi tải dữ liệu thuộc tính: ' + error.message
  } finally {
    attributeLoading.value = false
  }
}

// Handle add variant button click
const handleAddVariant = (product) => {
  selectedProduct.value = product
  showVariantModal.value = true
}

// Handle variant modal close
const handleVariantModalClose = () => {
  showVariantModal.value = false
  selectedProduct.value = null
}

// Handle variant modal save
const handleVariantModalSave = () => {
  showVariantModal.value = false
  emit('variant-added')
  // Optionally reload product list or show success message
  alert('Đã thêm biến thể thành công!')
}

// Reset variant configuration
const resetVariantConfig = () => {
  variantConfig.value = {
    selectedCpuIds: [],
    selectedGpuIds: [],
    selectedRamIds: [],
    selectedOCungIds: [],
    selectedMauSacIds: [],
    selectedLoaiManHinhIds: [],
    selectedPinIds: [],
    trangThai: 1
  }
  displayVariants.value = []
}

// Automatic variant generation function
const generateVariantsAutomatically = () => {
  console.log('Auto-generating variants...')
  
  // Check if we have loaded attributes
  if (!colors.value.length && !cpus.value.length && !rams.value.length && 
      !gpus.value.length && !storages.value.length && !displays.value.length && 
      !batteries.value.length) {
    console.log('Attributes not loaded yet, skipping variant generation')
    return
  }
  
  // Don't require selectedProduct for automatic generation
  if (calculateTotalCombinations.value === 0) {
    console.log('No attributes selected, clearing variants')
    displayVariants.value = []
    return
  }
  
  console.log('Auto-generating variants with combinations:', calculateTotalCombinations.value)
  
  // Generate combinations for preview
  const combinations = []
  const selectedColors = variantConfig.value.selectedMauSacIds.filter(id => id !== "")
  const selectedCpus = variantConfig.value.selectedCpuIds.filter(id => id !== "")
  const selectedRams = variantConfig.value.selectedRamIds.filter(id => id !== "")
  const selectedGpus = variantConfig.value.selectedGpuIds.filter(id => id !== "")
  const selectedStorages = variantConfig.value.selectedOCungIds.filter(id => id !== "")
  const selectedDisplays = variantConfig.value.selectedLoaiManHinhIds.filter(id => id !== "")
  const selectedBatteries = variantConfig.value.selectedPinIds.filter(id => id !== "")
  
  // Generate all combinations
  const generateCombinations = (arrays) => {
    if (arrays.length === 0) return [[]]
    const [first, ...rest] = arrays
    const restCombinations = generateCombinations(rest)
    return first.flatMap(item => restCombinations.map(combo => [item, ...combo]))
  }
  
  const attributeArrays = [
    selectedColors.length > 0 ? selectedColors : [null],
    selectedCpus.length > 0 ? selectedCpus : [null],
    selectedRams.length > 0 ? selectedRams : [null],
    selectedGpus.length > 0 ? selectedGpus : [null],
    selectedStorages.length > 0 ? selectedStorages : [null],
    selectedDisplays.length > 0 ? selectedDisplays : [null],
    selectedBatteries.length > 0 ? selectedBatteries : [null]
  ]
  
  const allCombinations = generateCombinations(attributeArrays)
  
  allCombinations.forEach(combo => {
    const [colorId, cpuId, ramId, gpuId, storageId, displayId, batteryId] = combo
    
    const color = colors.value.find(c => c.id === colorId)
    const cpu = cpus.value.find(c => c.id === cpuId)
    const ram = rams.value.find(r => r.id === ramId)
    const gpu = gpus.value.find(g => g.id === gpuId)
    const storage = storages.value.find(s => s.id === storageId)
    const display = displays.value.find(d => d.id === displayId)
    const battery = batteries.value.find(b => b.id === batteryId)
    
    combinations.push({
      id: null, // Preview variant, no ID yet
      idMauSac: colorId || null,
      idCpu: cpuId || null,
      idRam: ramId || null,
      idGpu: gpuId || null,
      idOCung: storageId || null,
      idLoaiManHinh: displayId || null,
      idPin: batteryId || null,
      giaBan: 0,
      soLuongTon: 0,
      trangThai: variantConfig.value.trangThai,
      tenMauSac: color?.tenMau || '',
      tenCpu: cpu?.tenCpu || '',
      tenRam: ram?.tenRam || '',
      tenGpu: gpu?.tenGpu || '',
      dungLuongOCung: storage?.dungLuong || '',
      kichThuocManHinh: display?.kichThuoc || '',
      dungLuongPin: battery?.dungLuongPin || '',
      serials: []
    })
  })
  
  console.log(`Generated ${combinations.length} variant combinations`)
  displayVariants.value = combinations
}

// Generate variant combinations for preview (kept for testing button)
const generateVariants = () => {
  // Just call the automatic generation function
  generateVariantsAutomatically()
}

// Save variants to database
const saveVariants = async () => {
  if (!selectedProduct.value?.id) {
    alert('Không tìm thấy thông tin sản phẩm')
    return
  }
  
  if (displayVariants.value.length === 0) {
    alert('Không có biến thể nào để lưu')
    return
  }
  
  try {
    variantLoading.value = true
    
    const variantData = {
      idSanPham: selectedProduct.value.id,
      variants: displayVariants.value.map(variant => ({
        idMauSac: variant.idMauSac,
        idCpu: variant.idCpu,
        idRam: variant.idRam,
        idGpu: variant.idGpu,
        idOCung: variant.idOCung,
        idLoaiManHinh: variant.idLoaiManHinh,
        idPin: variant.idPin,
        giaBan: variant.giaBan || 0,
        soLuongTon: variant.soLuongTon || 0,
        trangThai: variant.trangThai
      }))
    }
    
    console.log('Creating variants:', variantData)
    
    const result = await taoBienTheSanPham(variantData)
    
    console.log('Variant creation result:', result)
    alert(`Đã tạo thành công ${displayVariants.value.length} biến thể cho sản phẩm "${selectedProduct.value.tenSanPham}"!`)
    
    // Close modal
    const modal = Modal.getInstance(document.getElementById('addVariantModal'))
    if (modal) {
      modal.hide()
    }
    
    // Reset state
    resetVariantConfig()
    const productToRefresh = selectedProduct.value
    selectedProduct.value = null
    
    // Emit event to refresh product list
    emit('variant-added', productToRefresh)
    
  } catch (error) {
    console.error('Error creating variants:', error)
    alert('Lỗi khi tạo biến thể: ' + (error.response?.data?.message || error.message))
  } finally {
    variantLoading.value = false
  }
}

// Create variants directly without preview
const createVariantsDirectly = async () => {
  if (!selectedProduct.value?.id) {
    alert('Không tìm thấy thông tin sản phẩm')
    return
  }
  
  if (calculateTotalCombinations.value === 0) {
    alert('Vui lòng chọn ít nhất một thuộc tính để tạo biến thể')
    return
  }
  
  try {
    variantLoading.value = true
    
    // Generate combinations
    const combinations = []
    const selectedColors = variantConfig.value.selectedMauSacIds.filter(id => id !== "")
    const selectedCpus = variantConfig.value.selectedCpuIds.filter(id => id !== "")
    const selectedRams = variantConfig.value.selectedRamIds.filter(id => id !== "")
    const selectedGpus = variantConfig.value.selectedGpuIds.filter(id => id !== "")
    const selectedStorages = variantConfig.value.selectedOCungIds.filter(id => id !== "")
    const selectedDisplays = variantConfig.value.selectedLoaiManHinhIds.filter(id => id !== "")
    const selectedBatteries = variantConfig.value.selectedPinIds.filter(id => id !== "")
    
    // Generate all combinations
    const generateCombinations = (arrays) => {
      if (arrays.length === 0) return [[]]
      const [first, ...rest] = arrays
      const restCombinations = generateCombinations(rest)
      return first.flatMap(item => restCombinations.map(combo => [item, ...combo]))
    }
    
    const attributeArrays = [
      selectedColors.length > 0 ? selectedColors : [null],
      selectedCpus.length > 0 ? selectedCpus : [null],
      selectedRams.length > 0 ? selectedRams : [null],
      selectedGpus.length > 0 ? selectedGpus : [null],
      selectedStorages.length > 0 ? selectedStorages : [null],
      selectedDisplays.length > 0 ? selectedDisplays : [null],
      selectedBatteries.length > 0 ? selectedBatteries : [null]
    ]
    
    const allCombinations = generateCombinations(attributeArrays)
    
    allCombinations.forEach(combo => {
      const [colorId, cpuId, ramId, gpuId, storageId, displayId, batteryId] = combo
      
      combinations.push({
        idMauSac: colorId || null,
        idCpu: cpuId || null,
        idRam: ramId || null,
        idGpu: gpuId || null,
        idOCung: storageId || null,
        idLoaiManHinh: displayId || null,
        idPin: batteryId || null,
        giaBan: 0,
        soLuongTon: 0,
        trangThai: variantConfig.value.trangThai
      })
    })
    
    const variantData = {
      idSanPham: selectedProduct.value.id,
      variants: combinations
    }
    
    console.log('Creating variants:', variantData)
    
    const result = await taoBienTheSanPham(variantData)
    
    console.log('Direct variant creation result:', result)
    alert(`Đã tạo thành công ${combinations.length} biến thể cho sản phẩm "${selectedProduct.value.tenSanPham}"!`)
    
    // Close modal
    const modal = Modal.getInstance(document.getElementById('addVariantModal'))
    if (modal) {
      modal.hide()
    }
    
    // Reset state
    resetVariantConfig()
    const productToRefresh = selectedProduct.value
    selectedProduct.value = null
    
    // Emit event to refresh product list
    emit('variant-added', productToRefresh)
    
  } catch (error) {
    console.error('Error creating variants:', error)
    alert('Lỗi khi tạo biến thể: ' + (error.response?.data?.message || error.message))
  } finally {
    variantLoading.value = false
  }
}

// Variant management functions
const updateStockFromSerials = () => {
  // Update stock based on serials for each variant
  displayVariants.value.forEach(variant => {
    variant.soLuongTon = (variant.serials || []).filter(s => s.trangThai === 1).length
  })
}

const updateVariantPrice = (index, price) => {
  if (displayVariants.value[index]) {
    displayVariants.value[index].giaBan = price || 0
  }
}

const selectVariantImage = (index) => {
  // Image upload functionality would go here
  console.log('Select image for variant:', index)
}

const removeVariantImage = (index) => {
  if (displayVariants.value[index]) {
    displayVariants.value[index].anhDaiDien = null
  }
}

// Serial Management Functions
const openSerialModal = (index) => {
  console.log('Opening serial modal for variant index:', index)
  console.log('Display variants:', displayVariants.value)
  console.log('Variant at index:', displayVariants.value[index])
  
  if (!displayVariants.value[index]) {
    alert('Không tìm thấy biến thể')
    return
  }
  
  currentVariantIndex.value = index
  
  // Initialize serials array if it doesn't exist
  if (!displayVariants.value[index].serials) {
    displayVariants.value[index].serials = []
    console.log('Initialized serials array for variant')
  }
  
  // Reset serial input state
  serialInput.value = ''
  serialValidationError.value = ''
  serialValidationSuccess.value = false
  
  console.log('Current variant after opening modal:', currentVariant.value)
  console.log('Current variant serials:', currentVariant.value?.serials)
  
  showSerialModal.value = true
  
  // Force Vue to update the DOM and focus input
  nextTick(() => {
    console.log('Modal should be visible now')
    console.log('serialInput reactive value:', serialInput.value)
    
    // Try to focus the serial input field using ref
    const serialInputElement = document.querySelector('.serial-modal-overlay input[type="text"]')
    if (serialInputElement) {
      serialInputElement.focus()
      console.log('Focused serial input field via querySelector')
      
      // Test if we can set value directly
      serialInputElement.value = ''
      console.log('Reset input field value')
    } else {
      console.log('Could not find serial input field')
    }
  })
}

const closeSerialModal = () => {
  showSerialModal.value = false
  currentVariantIndex.value = -1
  serialInput.value = ''
  serialValidationError.value = ''
  serialValidationSuccess.value = false
}

const getVariantConfig = (index) => {
  if (index < 0 || !displayVariants.value[index]) return ''
  
  const variant = displayVariants.value[index]
  const specs = []
  
  if (variant.tenMauSac) specs.push(variant.tenMauSac)
  if (variant.tenCpu) specs.push(variant.tenCpu)
  if (variant.tenRam) specs.push(variant.tenRam)
  if (variant.tenGpu) specs.push(variant.tenGpu)
  if (variant.dungLuongOCung) specs.push(variant.dungLuongOCung)
  if (variant.kichThuocManHinh) specs.push(variant.kichThuocManHinh)
  if (variant.dungLuongPin) specs.push(variant.dungLuongPin)
  
  return specs.join(' | ')
}

const formatPrice = (price) => {
  return price ? formatCurrency(price) : '0 ₫'
}

// Handle serial input with debugging
const onSerialInput = (event) => {
  console.log('Serial input event:', event)
  console.log('Input value:', event.target.value)
  console.log('serialInput.value:', serialInput.value)
  
  // Call validation
  validateSerialInput()
}

const validateSerialInput = () => {
  const input = serialInput.value.trim()
  console.log('Validating serial input:', input)
  
  serialValidationError.value = ''
  serialValidationSuccess.value = false
  
  if (!input) {
    console.log('No input to validate')
    return
  }
  
  const serials = input.split(/[,;]/).map(s => s.trim()).filter(s => s)
  console.log('Parsed serials for validation:', serials)
  
  for (const serial of serials) {
    if (serial.length < 3 || serial.length > 20) {
      serialValidationError.value = 'Mỗi serial phải có từ 3-20 ký tự'
      console.log('Validation failed: length check')
      return
    }
    
    if (!/^[A-Za-z0-9]+$/.test(serial)) {
      serialValidationError.value = 'Serial chỉ được chứa chữ cái và số'
      console.log('Validation failed: format check')
      return
    }
    
    // Check for duplicates in current variant
    if (currentVariant.value?.serials?.some(s => s.soSerial === serial)) {
      serialValidationError.value = `Serial "${serial}" đã tồn tại`
      console.log('Validation failed: duplicate check')
      return
    }
  }
  
  serialValidationSuccess.value = true
  console.log('Validation passed')
}


const addSerialNumbers = () => {
  console.log('=== ADD SERIAL NUMBERS ===')
  console.log('serialInput.value:', serialInput.value)
  console.log('currentVariant.value:', currentVariant.value)
  console.log('currentVariantIndex.value:', currentVariantIndex.value)
  
  const input = serialInput.value.trim()
  if (!input) {
    alert('Vui lòng nhập serial number')
    return
  }
  
  if (!currentVariant.value) {
    alert('Không tìm thấy biến thể hiện tại. Vui lòng thử lại.')
    console.error('currentVariant.value is null or undefined')
    return
  }
  
  // Simple validation - just check if not empty and reasonable length
  const serials = input.split(/[,;]/).map(s => s.trim()).filter(s => s)
  console.log('Parsed serials:', serials)
  
  if (serials.length === 0) {
    alert('Không có serial hợp lệ')
    return
  }
  
  // Initialize serials array if it doesn't exist
  if (!currentVariant.value.serials) {
    currentVariant.value.serials = []
    console.log('Initialized serials array')
  }
  
  let addedCount = 0
  let invalidCount = 0
  let duplicateCount = 0
  
  serials.forEach(serialNumber => {
    // Validate serial format: exactly 7 characters, alphanumeric, contains both letters and numbers
    if (serialNumber.length === 7 && /^[A-Za-z0-9]+$/.test(serialNumber)) {
      const hasLetter = /[A-Za-z]/.test(serialNumber)
      const hasNumber = /[0-9]/.test(serialNumber)
      
      if (hasLetter && hasNumber) {
        // Check for duplicates
        if (!currentVariant.value.serials.some(s => s.soSerial === serialNumber)) {
          currentVariant.value.serials.push({
            soSerial: serialNumber,
            trangThai: 1,
            id: null // Mark as unsaved
          })
          addedCount++
          console.log(`Added serial: ${serialNumber}`)
        } else {
          duplicateCount++
          console.log(`Duplicate serial skipped: ${serialNumber}`)
        }
      } else {
        invalidCount++
        console.log(`Invalid serial format (must contain both letters and numbers): ${serialNumber}`)
      }
    } else {
      invalidCount++
      console.log(`Invalid serial length or format: ${serialNumber}`)
    }
  })
  
  console.log(`Total serials after adding: ${currentVariant.value.serials.length}`)
  
  // Show detailed feedback
  let message = ''
  if (addedCount > 0) {
    message += `✅ Đã thêm ${addedCount} serial thành công!`
  }
  if (duplicateCount > 0) {
    message += `\n⚠️ ${duplicateCount} serial bị trùng lặp`
  }
  if (invalidCount > 0) {
    message += `\n❌ ${invalidCount} serial không hợp lệ (phải có đúng 7 ký tự gồm cả chữ và số)`
  }
  
  if (addedCount > 0) {
    alert(message)
    // Clear input after successful addition
    serialInput.value = ''
  }
}

const toggleSerialStatus = (index) => {
  if (currentVariant.value?.serials?.[index]) {
    currentVariant.value.serials[index].trangThai = 
      currentVariant.value.serials[index].trangThai === 1 ? 0 : 1
  }
}

const removeSerial = (index) => {
  if (currentVariant.value?.serials?.[index]) {
    const serialToRemove = currentVariant.value.serials[index]
    if (confirm(`Bạn có chắc muốn xóa serial "${serialToRemove.soSerial}"?`)) {
      currentVariant.value.serials.splice(index, 1)
      console.log(`Removed serial: ${serialToRemove.soSerial}`)
    }
  }
}

const getUnsavedSerialsCount = () => {
  return currentVariant.value?.serials?.filter(s => !s.id).length || 0
}

const importFromExcel = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  console.log('Importing from Excel file:', file.name)
  
  try {
    const text = await readFileAsText(file)
    let serials = []
    
    if (file.name.endsWith('.csv')) {
      // Parse CSV - skip header row
      const lines = text.split('\n').filter(line => line.trim())
      serials = lines.slice(1).map(line => line.split(',')[0]?.trim()).filter(s => s)
    } else {
      // For other formats, treat as simple text
      serials = text.split(/[\n,;]/).map(s => s.trim()).filter(s => s)
    }
    
    console.log('Parsed serials from file:', serials)
    
    if (serials.length === 0) {
      alert('Không tìm thấy serial nào trong file')
      return
    }
    
    // Add serials using the same validation logic
    if (!currentVariant.value.serials) {
      currentVariant.value.serials = []
    }
    
    let addedCount = 0
    let invalidCount = 0
    let duplicateCount = 0
    
    serials.forEach(serialNumber => {
      // Validate serial format: exactly 7 characters, alphanumeric, contains both letters and numbers
      if (serialNumber.length === 7 && /^[A-Za-z0-9]+$/.test(serialNumber)) {
        const hasLetter = /[A-Za-z]/.test(serialNumber)
        const hasNumber = /[0-9]/.test(serialNumber)
        
        if (hasLetter && hasNumber) {
          if (!currentVariant.value.serials.some(s => s.soSerial === serialNumber)) {
            currentVariant.value.serials.push({
              soSerial: serialNumber,
              trangThai: 1,
              id: null
            })
            addedCount++
          } else {
            duplicateCount++
          }
        } else {
          invalidCount++
        }
      } else {
        invalidCount++
      }
    })
    
    let message = `📁 Import từ file "${file.name}":\n`
    if (addedCount > 0) message += `✅ Đã thêm ${addedCount} serial\n`
    if (duplicateCount > 0) message += `⚠️ ${duplicateCount} serial bị trùng lặp\n`
    if (invalidCount > 0) message += `❌ ${invalidCount} serial không hợp lệ (phải có đúng 7 ký tự gồm cả chữ và số)`
    
    alert(message)
    
  } catch (error) {
    console.error('Error importing from Excel:', error)
    alert('Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.')
  }
  
  // Reset file input
  event.target.value = ''
}

// Helper function to read file as text
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

const downloadExcelTemplate = () => {
  const sampleSerials = [
    'ABC1234',
    'DEF5678',
    'GHI9012',
    'JKL3456',
    'MNO7890',
    'PQR1357',
    'STU2468',
    'VWX9753',
    'YZA1029',
    'BCD3847'
  ]
  
  const csvContent = 'Serial Number\n' + sampleSerials.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'serial_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('Downloaded serial template')
    alert('✅ Đã tải xuống file mẫu serial_template.csv')
  }
}

const saveSerials = async () => {
  if (!currentVariant.value || !selectedProduct.value) {
    alert('Không tìm thấy thông tin biến thể hoặc sản phẩm')
    return
  }
  
  const unsavedSerials = currentVariant.value.serials?.filter(s => !s.id) || []
  if (unsavedSerials.length === 0) {
    alert('Không có serial nào cần lưu')
    return
  }
  
  try {
    loading.value = true
    console.log('Saving serials to database:', unsavedSerials)
    
    // TODO: Replace with actual API call
    // const result = await saveVariantSerials(selectedProduct.value.id, currentVariant.value.id, unsavedSerials)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mark serials as saved (simulate getting IDs from server)
    unsavedSerials.forEach((serial, index) => {
      serial.id = Date.now() + index // Simulate server-generated ID
    })
    
    // Update stock count based on serials
    currentVariant.value.soLuongTon = currentVariant.value.serials.length
    
    alert(`✅ Đã lưu ${unsavedSerials.length} serial thành công!`)
    console.log('Serials saved successfully')
    
    // Don't close modal automatically - let user continue adding serials if needed
    
  } catch (error) {
    console.error('Error saving serials:', error)
    alert('❌ Lỗi khi lưu serial. Vui lòng thử lại.')
  } finally {
    loading.value = false
  }
}

const removeVariantFromPreview = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa biến thể này khỏi danh sách xem trước?')) {
    displayVariants.value.splice(index, 1)
  }
}

// Close modal and reset state
const closeModal = () => {
  const modal = Modal.getInstance(document.getElementById('addVariantModal'))
  if (modal) {
    modal.hide()
  }
  
  // Reset state
  resetVariantConfig()
  selectedProduct.value = null
}

// Handle create variants - automatically create variants
const handleCreateVariants = async () => {
  if (!selectedProduct.value?.id) {
    alert('Không tìm thấy thông tin sản phẩm')
    return
  }
  
  if (calculateTotalCombinations.value === 0) {
    alert('Vui lòng chọn ít nhất một thuộc tính để tạo biến thể')
    return
  }

  // Always create variants directly without preview step
  await createVariantsDirectly()
}

// Initialize attributes on component mount
onMounted(() => {
  loadAttributes()
})
</script>

<style scoped>
.product-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}
input[type='checkbox'] {
  cursor: pointer;
}

.product-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-specs div {
  font-size: 13px;
  margin-bottom: 2px;
}

.product-specs strong {
  color: #64748b;
}

.pagination-wrapper {
  padding: 16px;
  border-top: 1px solid #f1f5f9;
}

.product-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.product-row:hover {
  background-color: #f8fafc !important;
}

.product-row td {
  border-bottom: 1px solid #f1f5f9;
}

.table th {
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.table td {
  vertical-align: middle;
}

.bulk-actions-bar {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  animation: slideDown 0.3s ease-out;
}

.selected-info {
  font-weight: 500;
  color: #059669;
}

.bulk-actions .btn {
  font-size: 13px;
  padding: 6px 12px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.variant-count {
  text-align: center;
}

.variant-count span {
  font-size: 14px;
  font-weight: normal;
}

/* ===== VARIANT CREATION MODAL STYLES ===== */
.variant-creation-section {
  padding: 1rem 0;
}

.variant-subtitle {
  color: #495057;
  font-weight: 600;
}

.variant-selectors .form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.multi-select-dropdown {
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item-checkbox {
  padding: 0;
}

.dropdown-item-checkbox .dropdown-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.dropdown-item-checkbox .dropdown-item:hover {
  background-color: #f8f9fa;
}

.color-indicator {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid #dee2e6;
}

.selected-items {
  color: #495057;
}

.badge {
  font-size: 0.75em;
}

.variant-config-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.spec-item i {
  width: 16px;
  text-align: center;
}

.spec-item span {
  color: #495057;
}

/* Serial Modal Styles */
.serial-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.serial-modal-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.serial-modal-dialog {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.serial-modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.serial-modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: between;
  background-color: #f8f9fa;
}

.serial-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
  flex: 1;
}

.serial-modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.serial-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.variant-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
}

.info-value {
  font-size: 0.875rem;
  color: #495057;
  font-weight: 500;
}

.serial-table {
  font-size: 0.875rem;
}

.serial-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.variants-table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.variants-table {
  margin-bottom: 0;
}

/* Modal positioning fixes */
#addVariantModal {
  z-index: 1050 !important;
}

#addVariantModal .modal-dialog {
  margin-left: 250px !important;
  margin-right: 20px !important;
  max-width: calc(100vw - 270px) !important;
  height: 100vh !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

#addVariantModal .modal-content {
  height: 100% !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}

#addVariantModal .modal-body {
  flex: 1 !important;
  overflow-y: auto !important;
}

.variants-table th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.variant-config-vertical {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.spec-item i {
  width: 16px;
  flex-shrink: 0;
}

.variant-image-cell {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.variant-image-upload {
  width: 100%;
  height: 100%;
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6c757d;
}

.variant-image-upload:hover {
  border-color: #0d6efd;
  color: #0d6efd;
}

.variant-image-upload i {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.variant-image-upload span {
  font-size: 0.75rem;
}

.variant-image-preview {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 0.375rem;
  overflow: hidden;
}

.variant-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.variant-image-preview:hover .image-overlay {
  opacity: 1;
}

.stock-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stock-number {
  font-weight: 600;
  font-size: 1.1rem;
  color: #495057;
}

.action-buttons {
  gap: 0.25rem;
}

.created-variants {
  margin-top: 1.5rem;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.alert-info {
  background-color: #e7f3ff;
  color: #0c5460;
}

.alert-secondary {
  background-color: #f8f9fa;
  color: #495057;
}
</style>
