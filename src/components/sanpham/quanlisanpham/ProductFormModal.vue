<template>
  <div class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <span v-if="isAddVariantsMode">
              <i class="bi bi-plus-circle me-2"></i>Thêm biến thể cho: {{ form.tenSanPham }}
            </span>
            <span v-else>{{ isEditMode ? 'Chỉnh sửa' : 'Thêm mới' }} sản phẩm</span>
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="save">
            <!-- Header -->
            <div v-if="!isAddVariantsMode" class="d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-plus-circle text-success"></i>
              <span class="fw-semibold text-muted">{{ isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}</span>
            </div>
            
            <!-- Product Info for add-variants-only mode -->
            <div v-if="isAddVariantsMode" class="alert alert-info mb-3">
              <div class="d-flex align-items-center">
                <i class="bi bi-info-circle me-2"></i>
                <div>
                  <strong>Sản phẩm:</strong> {{ form.tenSanPham }}
                  <span v-if="form.maSanPham" class="ms-2">(Mã: {{ form.maSanPham }})</span>
                </div>
              </div>
            </div>
            
            <div class="row g-4">
              <!-- Full Width Column -->
              <div class="col-md-12">
                <!-- Basic Info - Hidden in add-variants-only mode -->
                <div v-if="!isAddVariantsMode" class="card mb-4">
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
                        <input type="text" class="form-control" v-model="form.maSanPham"/>
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
                                      @change="updateStockFromSerials"
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
                                      @change="updateStockFromSerials"
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
                                      @change="updateStockFromSerials"
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
                                      @change="updateStockFromSerials"
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
                                      @change="updateStockFromSerials"
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
                                      @change="updateStockFromSerials"
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
                                      @change="updateStockFromSerials"
                                    >
                                    <i class="bi bi-battery me-2 text-danger"></i>
                                    {{ battery.dungLuongPin }}
                                  </label>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <!-- Configuration -->
                        <div class="row g-3 mb-4">
                          <div class="col-md-6">
                            <label class="form-label">Trạng thái</label>
                            <select class="form-select" v-model="variantConfig.trangThai">
                              <option value="1">Hoạt động</option>
                              <option value="0">Ẩn</option>
                            </select>
                          </div>
                        </div>

                        <!-- Auto preview info -->
                        <div class="d-flex justify-content-start mb-4">
                          <div class="alert alert-info d-flex align-items-center" v-if="calculateTotalCombinations > 0">
                            <i class="bi bi-info-circle me-2"></i>
                            <span>Sẽ tạo {{ calculateTotalCombinations }} biến thể từ các thuộc tính đã chọn</span>
                          </div>
                          <div class="alert alert-secondary d-flex align-items-center" v-else>
                            <i class="bi bi-lightbulb me-2"></i>
                            <span>Chọn các thuộc tính để xem trước biến thể sẽ được tạo</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Display preview or created variants -->
                    <div v-if="displayVariants.length > 0" class="created-variants">
                      <div class="d-flex align-items-center justify-content-between mb-3">
                        <div class="d-flex align-items-center gap-2">
                          <h6 class="mb-0">{{ displayVariants.some(v => v.id) ? 'Biến thể đã tạo:' : 'Xem trước biến thể:' }}</h6>
                          <i class="bi bi-info-circle text-info" :title="displayVariants.some(v => v.id) ? 'Danh sách biến thể đã lưu' : 'Xem trước biến thể sẽ được tạo'"></i>
                        </div>
                      </div>

                      <div class="variants-table-container">
                        <table class="table table-bordered variants-table">
                          <thead class="table-light">
                            <tr>
                              <th style="width: 60px" class="text-center">STT</th>
                              <th style="width: 250px">Cấu hình</th>
                              <th style="width: 120px" class="text-center">Ảnh biến thể</th>
                              <th style="width: 150px" class="text-center">Giá bán</th>
                              <th style="width: 120px" class="text-center">Tồn kho</th>
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
                                <div class="variant-image-cell">
                                  <div
                                    class="variant-image-upload"
                                    @click="selectVariantImage(index)"
                                    v-if="!variant.anhDaiDien"
                                  >
                                    <i class="bi bi-image"></i>
                                    <span>Tải lên</span>
                                  </div>
                                  <div v-else class="variant-image-preview">
                                    <img :src="variant.anhDaiDien" alt="Variant image" />
                                    <div class="image-overlay">
                                      <button 
                                        type="button" 
                                        class="btn btn-sm btn-outline-light"
                                        @click="selectVariantImage(index)"
                                      >
                                        <i class="bi bi-pencil"></i>
                                      </button>
                                      <button 
                                        type="button" 
                                        class="btn btn-sm btn-outline-light"
                                        @click="removeVariantImage(index)"
                                      >
                                        <i class="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td class="text-center align-middle">
                                <input
                                  type="number"
                                  class="form-control form-control-sm text-center"
                                  v-model="variant.giaBan"
                                  placeholder="0"
                                  @blur="updateVariantPrice(index, variant.giaBan)"
                                  min="0"
                                />
                              </td>
                              <td class="text-center align-middle">
                                <div class="stock-info text-center">
                                  <span class="stock-number">{{ variant.soLuongTon || 0 }}</span>
                                  <small class="text-muted d-block">
                                    từ {{ (variant.serials || []).length }} serial
                                  </small>
                                </div>
                              </td>
                              <td class="text-center align-middle">
                                <div class="action-buttons d-flex justify-content-center gap-2">
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
          </form>
        </div>

        <div class="modal-footer d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="loading">
            <i class="bi bi-x-lg me-1"></i>
            Hủy bỏ
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="isAddVariantsMode ? saveAndCreateVariants() : saveProduct()" 
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-lg me-1"></i>
            <span v-if="isAddVariantsMode">Tạo biến thể</span>
            <span v-else>{{ form.variants && form.variants.length > 0 ? 'Tạo sản phẩm & biến thể' : 'Tạo sản phẩm' }}</span>
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
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': serialValidationError, 'is-valid': serialValidationSuccess }"
                      v-model="serialInput"
                      @input="validateSerialInput"
                      placeholder="Nhập serial (VD: ABC1234, 9B2KX13)"
                      maxlength="50"
                    />
                    <button type="button" class="btn btn-success" @click="addSerialNumbers">
                      <i class="bi bi-plus-lg"></i> Thêm
                    </button>
                  </div>
                  <div v-if="serialValidationError" class="text-warning small mt-1">
                    <i class="bi bi-exclamation-triangle"></i> {{ serialValidationError }}
                  </div>
                  <small class="text-muted"
                    >Có thể nhập nhiều, cách nhau bằng dấu phẩy (,) hoặc chấm phẩy (;). Mỗi serial phải có đúng 7 ký tự gồm cả chữ và số.</small
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { uploadImageToCloudinary } from '@/service/uploadImageToCloud'
import { createSanPham, updateSanPham, taoBienTheSanPham, createSerialsBatch, importSerialsFromExcel, getSerialsByCtspId, createHinhAnhBatch, getHinhAnhByCtspId, deleteCTSP, createProductWithVariantsAndSerials, updateChiTietSanPham, getCTSPBySanPham } from '@/service/sanpham/SanPhamService'
import { useRouter } from 'vue-router'

const productStore = useProductStore()
const router = useRouter()

const cpus = computed(() => productStore.cpus)
const rams = computed(() => productStore.rams)
const gpus = computed(() => productStore.gpus)
const storages = computed(() => productStore.storages)
const colors = computed(() => productStore.colors)
const displays = computed(() => productStore.screens)
const batteries = computed(() => productStore.batteries)

const attributeLoading = ref(false)
const attributeError = ref(null)
const loading = ref(false)
const error = ref(null)



const loadAttributes = async () => {
  try {
    attributeLoading.value = true
    attributeError.value = null
    await productStore.loadAttributes()
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
  mode: {
    type: String,
    default: 'create', // 'create', 'edit', 'add-variants-only'
    validator: (value) => ['create', 'edit', 'add-variants-only'].includes(value)
  }
})

const emit = defineEmits(['close', 'save'])

const isEditMode = computed(() => !!props.product && props.mode === 'edit')
const isAddVariantsMode = computed(() => props.mode === 'add-variants-only')

const form = ref({
  id: null,
  tenSanPham: '',
  maSanPham: '',
  moTaChiTiet: '',
  trangThai: '1',
  anhDaiDien: null,
  images: [],
  variants: []
})

const previewVariants = ref([])

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

const showSerialModal = ref(false)
const currentVariantIndex = ref(-1)
const serialInput = ref('')
const serialValidationError = ref('')
const serialValidationSuccess = ref('')

const currentVariant = computed(() => {
  if (currentVariantIndex.value >= 0 && displayVariants.value[currentVariantIndex.value]) {
    return displayVariants.value[currentVariantIndex.value]
  }
  return null
})

// Watch product prop to load data when mode is 'add-variants-only'
watch(() => props.product, (newProduct) => {
  if (newProduct && isAddVariantsMode.value) {
    console.log('Loading product data for add-variants-only mode:', newProduct)
    form.value.id = newProduct.id
    form.value.tenSanPham = newProduct.tenSanPham
    form.value.maSanPham = newProduct.maSanPham || ''
    form.value.moTaChiTiet = newProduct.moTaChiTiet || ''
    form.value.trangThai = newProduct.trangThai?.toString() || '1'
    form.value.anhDaiDien = newProduct.anhDaiDien || null
    form.value.variants = []
    
    // Reset variant config
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
  }
}, { immediate: true })

const calculateTotalCombinations = computed(() => {
    const config = variantConfig.value
    let total = 1
    
    if (config.selectedCpuIds.length > 0) total *= config.selectedCpuIds.length
    if (config.selectedGpuIds.length > 0) total *= config.selectedGpuIds.length
    if (config.selectedRamIds.length > 0) total *= config.selectedRamIds.length
    if (config.selectedOCungIds.length > 0) total *= config.selectedOCungIds.length
    if (config.selectedMauSacIds.length > 0) total *= config.selectedMauSacIds.length
    if (config.selectedLoaiManHinhIds.length > 0) total *= config.selectedLoaiManHinhIds.length
    if (config.selectedPinIds.length > 0) total *= config.selectedPinIds.length
    
    // If no attributes selected, return 0
    const hasSelectedAttributes = 
      config.selectedCpuIds.length > 0 ||
      config.selectedGpuIds.length > 0 ||
      config.selectedRamIds.length > 0 ||
      config.selectedOCungIds.length > 0 ||
      config.selectedMauSacIds.length > 0 ||
      config.selectedLoaiManHinhIds.length > 0 ||
      config.selectedPinIds.length > 0
    
    return hasSelectedAttributes ? total : 0
})

const displayVariants = computed(() => {
  // Show preview variants first, then actual created variants
  // This ensures serials imported during preview are preserved
  if (previewVariants.value && previewVariants.value.length > 0) {
    return previewVariants.value
  }
  return form.value.variants || []
})

// Generate preview variants when selections change - AUTO PREVIEW ENABLED
watch(
  () => [
    variantConfig.value.selectedCpuIds,
    variantConfig.value.selectedGpuIds,
    variantConfig.value.selectedRamIds,
    variantConfig.value.selectedOCungIds,
    variantConfig.value.selectedMauSacIds,
    variantConfig.value.selectedLoaiManHinhIds,
    variantConfig.value.selectedPinIds
    ],
    () => {
      generatePreviewVariants()
    },
    { deep: true }
  )

const generatePreviewVariants = () => {
  const config = variantConfig.value
  
  // Generate preview if we have at least one selection (no price requirement)
  
  const hasSelectedAttributes = 
    config.selectedCpuIds.length > 0 ||
    config.selectedGpuIds.length > 0 ||
    config.selectedRamIds.length > 0 ||
    config.selectedOCungIds.length > 0 ||
    config.selectedMauSacIds.length > 0 ||
    config.selectedLoaiManHinhIds.length > 0 ||
    config.selectedPinIds.length > 0

  if (!hasSelectedAttributes) {
    form.value.variants = []
    return
  }

  // Generate all combinations
  const combinations = []
  const selectedCpus = config.selectedCpuIds.length > 0 ? config.selectedCpuIds : [null]
  const selectedGpus = config.selectedGpuIds.length > 0 ? config.selectedGpuIds : [null]
  const selectedRams = config.selectedRamIds.length > 0 ? config.selectedRamIds : [null]
  const selectedStorages = config.selectedOCungIds.length > 0 ? config.selectedOCungIds : [null]
  const selectedColors = config.selectedMauSacIds.length > 0 ? config.selectedMauSacIds : [null]
  const selectedDisplays = config.selectedLoaiManHinhIds.length > 0 ? config.selectedLoaiManHinhIds : [null]
  const selectedBatteries = config.selectedPinIds.length > 0 ? config.selectedPinIds : [null]

  selectedCpus.forEach(cpuId => {
    selectedGpus.forEach(gpuId => {
      selectedRams.forEach(ramId => {
        selectedStorages.forEach(storageId => {
          selectedColors.forEach(colorId => {
            selectedDisplays.forEach(displayId => {
              selectedBatteries.forEach(batteryId => {
                const variant = {
                  id: null, // Preview variant, no ID
                  giaBan: 0, // Price will be set individually for each variant
                  soLuongTon: 0,
                  serials: [],
                  anhDaiDien: null,
                  // Attribute IDs
                  idCpu: cpuId,
                  idGpu: gpuId,
                  idRam: ramId,
                  idOCung: storageId,
                  idMauSac: colorId,
                  idLoaiManHinh: displayId,
                  idPin: batteryId,
                  // Attribute names for display
                  tenCpu: cpuId ? cpus.value.find(c => c.id === cpuId)?.tenCpu : null,
                  tenGpu: gpuId ? gpus.value.find(g => g.id === gpuId)?.tenGpu : null,
                  tenRam: ramId ? rams.value.find(r => r.id === ramId)?.tenRam : null,
                  dungLuongOCung: storageId ? storages.value.find(s => s.id === storageId)?.dungLuong : null,
                  tenMauSac: colorId ? colors.value.find(c => c.id === colorId)?.tenMau : null,
                  kichThuocManHinh: displayId ? displays.value.find(d => d.id === displayId)?.kichThuoc : null,
                  dungLuongPin: batteryId ? batteries.value.find(b => b.id === batteryId)?.dungLuongPin : null
                }
                combinations.push(variant)
              })
            })
          })
        })
      })
    })
  })

  form.value.variants = combinations
}

// Comprehensive save function - creates product, variants, and serials simultaneously
const saveProduct = async () => {
  try {
    loading.value = true
    error.value = null

    if (!form.value.tenSanPham.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    // Calculate price range from variants
    let giaThapNhat = 0
    let giaCaoNhat = 0
    
    if (form.value.variants && form.value.variants.length > 0) {
      const variantPrices = form.value.variants
        .map(v => parseFloat(v.giaBan) || 0)
        .filter(price => price > 0)
      
      if (variantPrices.length > 0) {
        giaThapNhat = Math.min(...variantPrices)
        giaCaoNhat = Math.max(...variantPrices)
      }
    }

    // Get anhDaiDien from form or first variant preview
    let anhDaiDien = form.value.anhDaiDien
    if (!anhDaiDien && form.value.variants && form.value.variants.length > 0) {
      const firstVariant = form.value.variants[0]
      // Check anhDaiDien from variant preview
      if (firstVariant.anhDaiDien) {
        anhDaiDien = firstVariant.anhDaiDien
      } else if (firstVariant.images && firstVariant.images.length > 0) {
        anhDaiDien = firstVariant.images[0].url || firstVariant.images[0]
      }
    }
    
    const productPayload = {
      tenSanPham: form.value.tenSanPham || '',
      maSanPham: form.value.maSanPham || '',
      moTaChiTiet: form.value.moTaChiTiet || '',
      trangThai: parseInt(form.value.trangThai) || 1,
      anhDaiDien: anhDaiDien,
      images: [],
      giaThapNhat: giaThapNhat,
      giaCaoNhat: giaCaoNhat
    }

    // For add-variants-only mode, skip product creation if product ID exists
    if (isAddVariantsMode.value && form.value.id) {
      console.log('Skipping product creation - using existing product ID:', form.value.id)
    } else {
      console.log('Creating product with payload:', productPayload)
    }

    // For new products, check if we have variants to create
    const hasVariantsToCreate = form.value.variants && form.value.variants.length > 0 && 
      (variantConfig.value.selectedCpuIds.length > 0 ||
       variantConfig.value.selectedGpuIds.length > 0 ||
       variantConfig.value.selectedRamIds.length > 0 ||
       variantConfig.value.selectedOCungIds.length > 0 ||
       variantConfig.value.selectedMauSacIds.length > 0 ||
       variantConfig.value.selectedLoaiManHinhIds.length > 0 ||
       variantConfig.value.selectedPinIds.length > 0)

    if (hasVariantsToCreate) {
      // Calculate correct price range from preview variants
      const variantPrices = form.value.variants
        .map(v => parseFloat(v.giaBan) || 0)
        .filter(price => price > 0)
      
      // Update product payload with correct price range
      if (variantPrices.length > 0) {
        productPayload.giaThapNhat = Math.min(...variantPrices)
        productPayload.giaCaoNhat = Math.max(...variantPrices)
      }
      
      const defaultPrice = variantPrices.length > 0 ? variantPrices[0] : 1000000 // Use first variant price or default 1M VND

      // Use comprehensive creation function
      const variantConfigs = [{
        giaBan: defaultPrice, // Use calculated price
        ghiChu: '',
        soLuongTon: 0,
        soLuongTamGiu: 0,
        trangThai: variantConfig.value.trangThai,
        selectedCpuIds: variantConfig.value.selectedCpuIds,
        selectedGpuIds: variantConfig.value.selectedGpuIds,
        selectedRamIds: variantConfig.value.selectedRamIds,
        selectedOCungIds: variantConfig.value.selectedOCungIds,
        selectedMauSacIds: variantConfig.value.selectedMauSacIds,
        selectedLoaiManHinhIds: variantConfig.value.selectedLoaiManHinhIds,
        selectedPinIds: variantConfig.value.selectedPinIds,
        serials: [] // Collect serials from variants
      }]

      // Collect all serials from variants
      const allSerials = []
      form.value.variants.forEach(variant => {
        if (variant.serials && variant.serials.length > 0) {
          allSerials.push(...variant.serials)
        }
      })
      variantConfigs[0].serials = allSerials

      console.log('Creating product with variants and serials:', variantConfigs)
      console.log('Preview variants data:', form.value.variants)

      // If add-variants-only mode with existing product ID, pass it directly
      if (isAddVariantsMode.value && form.value.id) {
        // Create a fake product response to use existing ID
        productPayload.id = form.value.id
      }

      const result = await createProductWithVariantsAndSerials(productPayload, variantConfigs, form.value.variants)
      
      // Update form with created data
      form.value.id = result.product.id
      form.value.anhDaiDien = anhDaiDien // Keep the image URL
      
      // Save product image to all created variants
      if (anhDaiDien && result.variants && result.variants.length > 0) {
        try {
          const imageRequests = result.variants.map(variant => ({
            idSpct: variant.id,
            url: anhDaiDien,
            anhChinhDaiDien: true
          }))
          await createHinhAnhBatch(imageRequests)
          console.log('✅ Product main image saved to all variants')
        } catch (error) {
          console.error('❌ Error saving images to variants:', error)
        }
      }
      
      // Map created variants with attribute names for display and load images
      form.value.variants = await Promise.all(result.variants.map(async (variant) => {
        let images = []
        let variantAnhDaiDien = null
        
        // Load images from database
        try {
          const imagesResponse = await getHinhAnhByCtspId(variant.id)
          images = imagesResponse.data || []
          if (images.length > 0) {
            variantAnhDaiDien = images[0].url || images[0]
          }
        } catch (err) {
          console.warn(`Failed to load images for variant ${variant.id}`)
        }
        
        return {
          ...variant,
          tenCpu: variant.idCpu ? cpus.value.find(c => c.id === variant.idCpu)?.tenCpu : null,
          tenGpu: variant.idGpu ? gpus.value.find(g => g.id === variant.idGpu)?.tenGpu : null,
          tenRam: variant.idRam ? rams.value.find(r => r.id === variant.idRam)?.tenRam : null,
          dungLuongOCung: variant.idOCung ? storages.value.find(s => s.id === variant.idOCung)?.dungLuong : null,
          tenMauSac: variant.idMauSac ? colors.value.find(c => c.id === variant.idMauSac)?.tenMau : null,
          kichThuocManHinh: variant.idLoaiManHinh ? displays.value.find(d => d.id === variant.idLoaiManHinh)?.kichThuoc : null,
          dungLuongPin: variant.idPin ? batteries.value.find(b => b.id === variant.idPin)?.dungLuongPin : null,
          images: images,
          anhDaiDien: variantAnhDaiDien,
          serials: result.serials.filter(serial => serial.ctspId === variant.id).map(serial => ({
            id: serial.id,
            soSerial: serial.serialNo,
            trangThai: serial.trangThai
          }))
        }
      }))


      alert(`Tạo thành công sản phẩm với ${result.variants.length} biến thể và ${result.serials.length} serial!`)
    } else {
      // Create product only
      const response = await createSanPham(productPayload)
      form.value.id = response.data.id
      alert('Tạo sản phẩm thành công!')
    }

    emit('save', form.value)
  } catch (err) {
    console.error('Error saving product:', err)
    error.value = err.response?.data?.message || err.message || 'Lỗi khi lưu sản phẩm'
    alert('Lỗi: ' + error.value)
  } finally {
    loading.value = false
  }
}

// Note: generateVariantPreview function removed - now using automatic preview via watch

// Generate variants function
const generateVariants = async () => {
  console.log('generateVariants function called')
  console.log('form.value.id:', form.value.id)
  
  if (!form.value.id) {
    alert('Vui lòng lưu sản phẩm trước khi tạo biến thể')
    return
  }

  const config = variantConfig.value
  console.log('variantConfig:', config)
  
  const hasSelectedAttributes = 
    config.selectedCpuIds.length > 0 ||
    config.selectedGpuIds.length > 0 ||
    config.selectedRamIds.length > 0 ||
    config.selectedOCungIds.length > 0 ||
    config.selectedMauSacIds.length > 0 ||
    config.selectedLoaiManHinhIds.length > 0 ||
    config.selectedPinIds.length > 0

  console.log('hasSelectedAttributes:', hasSelectedAttributes)

  if (!hasSelectedAttributes) {
    alert('Vui lòng chọn ít nhất một thuộc tính để tạo biến thể')
    return
  }

  try {
    loading.value = true
    error.value = null

    const variantPayload = {
      idSanPham: form.value.id,
      ghiChu: '',
      soLuongTon: 0,
      soLuongTamGiu: 0,
      trangThai: config.trangThai,
      selectedCpuIds: config.selectedCpuIds,
      selectedGpuIds: config.selectedGpuIds,
      selectedRamIds: config.selectedRamIds,
      selectedOCungIds: config.selectedOCungIds,
      selectedMauSacIds: config.selectedMauSacIds,
      selectedLoaiManHinhIds: config.selectedLoaiManHinhIds,
      selectedPinIds: config.selectedPinIds
    }

    console.log('Creating variants with payload:', variantPayload)

    const response = await taoBienTheSanPham(variantPayload)
    console.log('Variants created successfully:', response)

    // Refresh variants display and add attribute names for display
    if (response.data && Array.isArray(response.data)) {
      form.value.variants = response.data.map(variant => ({
        ...variant,
        // Add attribute names for display
        tenCpu: variant.idCpu ? cpus.value.find(c => c.id === variant.idCpu)?.tenCpu : null,
        tenGpu: variant.idGpu ? gpus.value.find(g => g.id === variant.idGpu)?.tenGpu : null,
        tenRam: variant.idRam ? rams.value.find(r => r.id === variant.idRam)?.tenRam : null,
        dungLuongOCung: variant.idOCung ? storages.value.find(s => s.id === variant.idOCung)?.dungLuong : null,
        tenMauSac: variant.idMauSac ? colors.value.find(c => c.id === variant.idMauSac)?.tenMau : null,
        kichThuocManHinh: variant.idLoaiManHinh ? displays.value.find(d => d.id === variant.idLoaiManHinh)?.kichThuoc : null,
        dungLuongPin: variant.idPin ? batteries.value.find(b => b.id === variant.idPin)?.dungLuongPin : null,
        // Initialize empty values for editing
        giaBan: variant.giaBan || 0,
        soLuongTon: variant.soLuongTon || 0,
        serials: variant.serials || []
      }))
      
      // Auto-save product's main image to all new variants
      if (form.value.anhDaiDien && response.data.length > 0) {
        try {
          const imageRequests = response.data.map(variant => ({
            idSpct: variant.id,
            url: form.value.anhDaiDien,
            anhChinhDaiDien: true
          }))
          await createHinhAnhBatch(imageRequests)
          console.log('Product main image saved to all variants')
          
          // Reload variants with images
          const variantsWithImages = await Promise.all(
            form.value.variants.map(async (variant) => {
              try {
                const imagesResponse = await getHinhAnhByCtspId(variant.id)
                const images = imagesResponse.data || []
                return {
                  ...variant,
                  images,
                  anhDaiDien: images.length > 0 ? (images[0].url || images[0]) : null
                }
              } catch (err) {
                return variant
              }
            })
          )
          form.value.variants = variantsWithImages
        } catch (error) {
          console.error('Error saving images to variants:', error)
        }
      }
    }

    alert(`Tạo thành công ${calculateTotalCombinations.value} biến thể!`)
    
    // Clear selections after successful creation
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
    
  } catch (err) {
    console.error('Error creating variants:', err)
    error.value = err.response?.data?.message || err.message || 'Lỗi khi tạo biến thể'
    alert('Lỗi: ' + error.value)
  } finally {
    loading.value = false
  }
}

// Helper function to match variants by their attribute IDs
const matchVariantsByAttributes = (previewVariant, createdVariant) => {
  return (
    (previewVariant.idCpu === createdVariant.idCpu || (!previewVariant.idCpu && !createdVariant.idCpu)) &&
    (previewVariant.idGpu === createdVariant.idGpu || (!previewVariant.idGpu && !createdVariant.idGpu)) &&
    (previewVariant.idRam === createdVariant.idRam || (!previewVariant.idRam && !createdVariant.idRam)) &&
    (previewVariant.idOCung === createdVariant.idOCung || (!previewVariant.idOCung && !createdVariant.idOCung)) &&
    (previewVariant.idMauSac === createdVariant.idMauSac || (!previewVariant.idMauSac && !createdVariant.idMauSac)) &&
    (previewVariant.idLoaiManHinh === createdVariant.idLoaiManHinh || (!previewVariant.idLoaiManHinh && !createdVariant.idLoaiManHinh)) &&
    (previewVariant.idPin === createdVariant.idPin || (!previewVariant.idPin && !createdVariant.idPin))
  )
}

// Helper function to check if variant with same attributes already exists in product
const checkVariantAttributesMatch = (variant1, variant2) => {
  // Compare all attribute IDs - null/undefined are considered equal
  const attr1 = {
    idCpu: variant1.idCpu || null,
    idGpu: variant1.idGpu || null,
    idRam: variant1.idRam || null,
    idOCung: variant1.idOCung || null,
    idMauSac: variant1.idMauSac || null,
    idLoaiManHinh: variant1.idLoaiManHinh || null,
    idPin: variant1.idPin || null
  }
  
  const attr2 = {
    idCpu: variant2.idCpu || null,
    idGpu: variant2.idGpu || null,
    idRam: variant2.idRam || null,
    idOCung: variant2.idOCung || null,
    idMauSac: variant2.idMauSac || null,
    idLoaiManHinh: variant2.idLoaiManHinh || null,
    idPin: variant2.idPin || null
  }
  
  return JSON.stringify(attr1) === JSON.stringify(attr2)
}

// Combined save product and create variants function (kept for compatibility)
const saveAndCreateVariants = async () => {
  try {
    loading.value = true
    error.value = null

    if (!form.value.tenSanPham.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    // Prepare payload (always needed for emit)
    const payload = {
      tenSanPham: form.value.tenSanPham,
      maSanPham: form.value.maSanPham || '',
      moTaChiTiet: form.value.moTaChiTiet || '',
      trangThai: parseInt(form.value.trangThai) || 1,
      anhDaiDien: form.value.anhDaiDien || null,
      images: form.value.images || []
    }

    // Step 1: Save product first (skip if add-variants-only mode and product ID already exists)
    if (!isAddVariantsMode.value || !form.value.id) {
      console.log('Creating/updating product with payload:', payload)

      if (isEditMode.value) {
        // Update existing product
        const response = await updateSanPham(form.value.id, payload)
        form.value.id = response.data.id
      } else {
        // Create new product
        const response = await createSanPham(payload)
        form.value.id = response.data.id
      }
    } else {
      console.log('Skipping product creation - using existing product ID:', form.value.id)
    }

      // Step 2: Create variants if preview variants exist
      const variantsToCreate = form.value.variants || previewVariants.value || []
      console.log('Variants to create:', variantsToCreate.length, variantsToCreate)
      console.log('Serials in each variant:', variantsToCreate.map(v => ({
        id: v.id,
        serials: v.serials?.length || 0,
        serialDetails: v.serials
      })))
    
    if (variantsToCreate.length > 0) {
      const config = variantConfig.value
      
      const variantPayload = {
        idSanPham: form.value.id,
        giaBan: config.giaBan || (variantsToCreate[0]?.giaBan || 0),
        ghiChu: '',
        soLuongTon: 0,
        soLuongTamGiu: 0,
        trangThai: config.trangThai || 1,
        selectedCpuIds: config.selectedCpuIds,
        selectedGpuIds: config.selectedGpuIds,
        selectedRamIds: config.selectedRamIds,
        selectedOCungIds: config.selectedOCungIds,
        selectedMauSacIds: config.selectedMauSacIds,
        selectedLoaiManHinhIds: config.selectedLoaiManHinhIds,
        selectedPinIds: config.selectedPinIds
      }

      // Step 2.1: Load existing variants to check for duplicates
      let existingVariants = []
      try {
        const existingResponse = await getCTSPBySanPham(form.value.id)
        existingVariants = existingResponse.data || []
        console.log('Existing variants loaded:', existingVariants.length)
      } catch (err) {
        console.warn('Could not load existing variants:', err)
      }
      
      // Step 2.2: Separate variants to create vs existing variants to update
      const variantsToAggregate = [] // Variants that match existing ones and have serials to add
      const newVariantsToCreate = [] // New variants that don't match existing ones
      const previewVariantsList = form.value.variants || [] // Get preview variants from form
      
      for (const previewVariant of previewVariantsList) {
        // Find matching existing variant
        const matchingExisting = existingVariants.find(existing => 
          checkVariantAttributesMatch(previewVariant, existing)
        )
        
        if (matchingExisting && previewVariant.serials && previewVariant.serials.length > 0) {
          // Duplicate found with new serials - aggregate instead of creating
          console.log('🔄 Found duplicate variant, will aggregate serials:', matchingExisting.maCtsp)
          variantsToAggregate.push({
            existingVariant: matchingExisting,
            previewVariant: previewVariant,
            newSerials: previewVariant.serials
          })
        } else if (!matchingExisting) {
          // No match found - create new variant
          newVariantsToCreate.push(previewVariant)
        } else {
          // Match found but no new serials - skip
          console.log('⚠️ Variant already exists, no new serials to add:', matchingExisting.maCtsp)
        }
      }
      
      console.log('Variants to aggregate:', variantsToAggregate.length)
      console.log('New variants to create:', newVariantsToCreate.length)
      
      // Step 2.3: Create only new variants that don't exist
      let createdVariants = []
      if (newVariantsToCreate.length > 0) {
        // Need to create a new payload that only includes attribute IDs for new variants
        // Extract unique attribute IDs from newVariantsToCreate
        const newCpuIds = [...new Set(newVariantsToCreate.map(v => v.idCpu).filter(Boolean))]
        const newGpuIds = [...new Set(newVariantsToCreate.map(v => v.idGpu).filter(Boolean))]
        const newRamIds = [...new Set(newVariantsToCreate.map(v => v.idRam).filter(Boolean))]
        const newOCungIds = [...new Set(newVariantsToCreate.map(v => v.idOCung).filter(Boolean))]
        const newMauSacIds = [...new Set(newVariantsToCreate.map(v => v.idMauSac).filter(Boolean))]
        const newLoaiManHinhIds = [...new Set(newVariantsToCreate.map(v => v.idLoaiManHinh).filter(Boolean))]
        const newPinIds = [...new Set(newVariantsToCreate.map(v => v.idPin).filter(Boolean))]
        
        const newVariantPayload = {
          idSanPham: form.value.id,
          giaBan: config.giaBan || (newVariantsToCreate[0]?.giaBan || 0),
          ghiChu: '',
          soLuongTon: 0,
          soLuongTamGiu: 0,
          trangThai: config.trangThai || 1,
          selectedCpuIds: newCpuIds,
          selectedGpuIds: newGpuIds,
          selectedRamIds: newRamIds,
          selectedOCungIds: newOCungIds,
          selectedMauSacIds: newMauSacIds,
          selectedLoaiManHinhIds: newLoaiManHinhIds,
          selectedPinIds: newPinIds
        }
        
        console.log('Creating new variants with payload:', newVariantPayload)
        const variantResponse = await taoBienTheSanPham(newVariantPayload)
        createdVariants = variantResponse.data || []
        console.log('Created new variants:', createdVariants.length)
      }
      
      // Step 2.4: Handle variants that need serial aggregation
      for (const aggregateInfo of variantsToAggregate) {
        const { existingVariant, previewVariant, newSerials } = aggregateInfo
        
        try {
          console.log(`📦 Aggregating ${newSerials.length} serials to existing variant ${existingVariant.id}`)
          
          // Add serials to existing variant
          if (newSerials.length > 0) {
            const serialRequests = newSerials.map(serial => ({
              ctspId: existingVariant.id,
              serialNo: serial.soSerial || serial,
              trangThai: serial.trangThai || 1
            }))
            
            await createSerialsBatch(serialRequests)
            console.log(`✅ Added ${serialRequests.length} serials to variant ${existingVariant.maCtsp}`)
            
            // Update stock count
            const activeSerialCount = serialRequests.filter(s => s.trangThai === 1).length
            const newStockCount = (existingVariant.soLuongTon || 0) + activeSerialCount
            
            // Update variant with new stock count
            const updatePayload = {
              idSanPham: form.value.id,
              maCtsp: existingVariant.maCtsp,
              giaBan: previewVariant.giaBan || existingVariant.giaBan,
              ghiChu: existingVariant.ghiChu || '',
              soLuongTon: newStockCount,
              soLuongTamGiu: existingVariant.soLuongTamGiu || 0,
              trangThai: existingVariant.trangThai,
              idCpu: existingVariant.idCpu,
              idGpu: existingVariant.idGpu,
              idRam: existingVariant.idRam,
              idOCung: existingVariant.idOCung,
              idMauSac: existingVariant.idMauSac,
              idLoaiManHinh: existingVariant.idLoaiManHinh,
              idPin: existingVariant.idPin
            }
            
            await updateChiTietSanPham(existingVariant.id, updatePayload)
            console.log(`✅ Updated stock count to ${newStockCount} for variant ${existingVariant.maCtsp}`)
            
            // Add to createdVariants array for display (treat as "created" for UI purposes)
            createdVariants.push({
              ...existingVariant,
              soLuongTon: newStockCount,
              giaBan: previewVariant.giaBan || existingVariant.giaBan
            })
          }
        } catch (aggregateErr) {
          console.error(`❌ Failed to aggregate serials for variant ${existingVariant.id}:`, aggregateErr)
          alert(`Lỗi khi thêm serial vào biến thể ${existingVariant.maCtsp}: ${aggregateErr.message}`)
        }
      }
      
      console.log('Final variants (created + aggregated):', createdVariants.length)
      
      // Update prices, save images and serials for each variant based on preview data
      if (newVariantsToCreate.length > 0 && createdVariants.length > 0) {
        console.log('Updating prices and saving images/serials for newly created variants...')
        
        for (const createdVariant of createdVariants) {
          // Find matching preview variant by attribute IDs instead of array index
          const previewVariant = newVariantsToCreate.find(pv => matchVariantsByAttributes(pv, createdVariant))
          
          if (!previewVariant) {
            console.warn(`No matching preview variant found for created variant ${createdVariant.id}`)
            continue
          }
          
          // Update price if different
          const targetPrice = parseFloat(previewVariant.giaBan) || 0
          const currentPrice = parseFloat(createdVariant.giaBan) || 0
          
          if (targetPrice !== currentPrice && targetPrice > 0) {
            try {
              const updatePayload = {
                idSanPham: form.value.id,
                maCtsp: createdVariant.maCtsp,
                giaBan: targetPrice,
                ghiChu: createdVariant.ghiChu || '',
                soLuongTon: createdVariant.soLuongTon || 0,
                soLuongTamGiu: createdVariant.soLuongTamGiu || 0,
                trangThai: createdVariant.trangThai,
                idCpu: createdVariant.idCpu,
                idGpu: createdVariant.idGpu,
                idRam: createdVariant.idRam,
                idOCung: createdVariant.idOCung,
                idMauSac: createdVariant.idMauSac,
                idLoaiManHinh: createdVariant.idLoaiManHinh,
                idPin: createdVariant.idPin
              }
              console.log(`Updating variant ${createdVariant.id} price from ${currentPrice} to ${targetPrice}`)
              const updatedVariant = await updateChiTietSanPham(createdVariant.id, updatePayload)
              // Update the createdVariant reference with new data
              Object.assign(createdVariant, updatedVariant.data)
              console.log(`✅ Updated variant ${createdVariant.id} price to ${targetPrice}`)
            } catch (priceErr) {
              console.warn(`❌ Failed to update price for variant ${createdVariant.id}:`, priceErr)
              createdVariant.giaBan = targetPrice // Update locally even if API fails
            }
          }
          
          // Save image if exists
          if (previewVariant.anhDaiDien) {
            try {
              const imageRequest = {
                idSpct: createdVariant.id,
                url: previewVariant.anhDaiDien,
                anhChinhDaiDien: true
              }
              await createHinhAnhBatch([imageRequest])
              console.log(`✅ Saved image for variant ${createdVariant.id}`)
            } catch (imgErr) {
              console.warn(`❌ Failed to save image for variant ${createdVariant.id}:`, imgErr)
            }
          }
          
          // Save serials if exists
          if (previewVariant.serials && previewVariant.serials.length > 0) {
            try {
              const serialRequests = previewVariant.serials.map(serial => ({
                ctspId: createdVariant.id,
                serialNo: serial.soSerial || serial,
                trangThai: serial.trangThai || 1
              }))
              await createSerialsBatch(serialRequests)
              console.log(`✅ Saved ${serialRequests.length} serials for variant ${createdVariant.id}`)
              
              // Update soLuongTon based on number of serials
              try {
                const updateStockPayload = {
                  idSanPham: form.value.id,
                  maCtsp: createdVariant.maCtsp,
                  giaBan: createdVariant.giaBan,
                  ghiChu: createdVariant.ghiChu || '',
                  soLuongTon: serialRequests.length, // ✅ Update stock from serials
                  soLuongTamGiu: createdVariant.soLuongTamGiu || 0,
                  trangThai: createdVariant.trangThai,
                  idCpu: createdVariant.idCpu,
                  idGpu: createdVariant.idGpu,
                  idRam: createdVariant.idRam,
                  idOCung: createdVariant.idOCung,
                  idMauSac: createdVariant.idMauSac,
                  idLoaiManHinh: createdVariant.idLoaiManHinh,
                  idPin: createdVariant.idPin
                }
                await updateChiTietSanPham(createdVariant.id, updateStockPayload)
                createdVariant.soLuongTon = serialRequests.length
                console.log(`✅ Updated soLuongTon to ${serialRequests.length} for variant ${createdVariant.id}`)
              } catch (stockErr) {
                console.warn(`❌ Failed to update stock for variant ${createdVariant.id}:`, stockErr)
                // Update locally even if API fails
                createdVariant.soLuongTon = serialRequests.length
              }
            } catch (serialErr) {
              console.warn(`❌ Failed to save serials for variant ${createdVariant.id}:`, serialErr)
            }
          }
        }
      }
      
      // Map the response to include necessary fields and attribute names
      form.value.variants = createdVariants.map(variant => ({
        ...variant,
        serials: [],
        // Keep soLuongTon from updated variant (don't override to 0)
        anhDaiDien: null,
        // Add attribute names for display
        tenCpu: variant.idCpu ? cpus.value.find(c => c.id === variant.idCpu)?.tenCpu : null,
        tenGpu: variant.idGpu ? gpus.value.find(g => g.id === variant.idGpu)?.tenGpu : null,
        tenRam: variant.idRam ? rams.value.find(r => r.id === variant.idRam)?.tenRam : null,
        dungLuongOCung: variant.idOCung ? storages.value.find(s => s.id === variant.idOCung)?.dungLuong : null,
        tenMauSac: variant.idMauSac ? colors.value.find(c => c.id === variant.idMauSac)?.tenMau : null,
        kichThuocManHinh: variant.idLoaiManHinh ? displays.value.find(d => d.id === variant.idLoaiManHinh)?.kichThuoc : null,
        dungLuongPin: variant.idPin ? batteries.value.find(b => b.id === variant.idPin)?.dungLuongPin : null
      }))
      
      // Add a summary message for aggregated variants
      if (variantsToAggregate.length > 0) {
        const aggregatedDetails = variantsToAggregate.map(agg => 
          `${agg.existingVariant.maCtsp}: +${agg.newSerials.length} serial`
        ).join(', ')
        console.log('✅ Serial aggregation summary:', aggregatedDetails)
      }
      
      // Clear preview variants since we now have real variants
      previewVariants.value = []
      
      // For add-variants-only mode, emit save and close modal
      if (isAddVariantsMode.value) {
        const totalMessage = []
        if (newVariantsToCreate.length > 0) {
          totalMessage.push(`${newVariantsToCreate.length} biến thể mới`)
        }
        if (variantsToAggregate.length > 0) {
          const totalSerials = variantsToAggregate.reduce((sum, agg) => sum + agg.newSerials.length, 0)
          totalMessage.push(`${totalSerials} serial được thêm vào ${variantsToAggregate.length} biến thể đã tồn tại`)
        }
        
        if (totalMessage.length > 0) {
          alert(`Đã hoàn thành: ${totalMessage.join(' và ')}!`)
        } else {
          alert('Không có thay đổi nào được thực hiện')
        }
        emit('save')
        return
      }
      
      const totalCreated = newVariantsToCreate.length + variantsToAggregate.length
      alert(`Đã tạo thành công sản phẩm và ${totalCreated} biến thể! Bây giờ bạn có thể quản lý Serial Numbers cho từng biến thể.`)
      // Don't emit save event - keep modal open for serial management
      return
    } else {
      alert(`${isEditMode.value ? 'Cập nhật' : 'Thêm'} sản phẩm thành công!`)
    }
    
    // Emit save event to parent component (only if no variants were created)
    emit('save', {
      id: form.value.id,
      ...payload
    })
    
  } catch (err) {
    console.error('Error saving product:', err)
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm'
    alert(error.value)
  } finally {
    loading.value = false
  }
}

// Save product function (kept for compatibility)
const save = async () => {
  try {
    loading.value = true
    error.value = null

    // For add-variants-only mode, skip product creation and go straight to variant creation
    if (isAddVariantsMode.value) {
      await saveAndCreateVariants()
      return
    }

    if (!form.value.tenSanPham.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    // Prepare JSON payload for product creation
    const payload = {
      tenSanPham: form.value.tenSanPham,
      maSanPham: form.value.maSanPham || '',
      moTaChiTiet: form.value.moTaChiTiet || '',
      trangThai: parseInt(form.value.trangThai) || 1,
      anhDaiDien: form.value.anhDaiDien || null,
      images: form.value.images || []
    }

    console.log('Creating product with payload:', payload)

    if (isEditMode.value) {
      // Update existing product
      const response = await updateSanPham(form.value.id, payload)
      form.value.id = response.data.id
    } else {
      // Create new product
      const response = await createSanPham(payload)
      form.value.id = response.data.id
    }

    alert(`${isEditMode.value ? 'Cập nhật' : 'Thêm'} sản phẩm thành công!`)
    
    // Emit save event to parent component
    emit('save', {
      id: form.value.id,
      ...payload
    })
    
  } catch (err) {
    console.error('Error saving product:', err)
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm'
    alert(error.value)
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}

const goBackToProductList = () => {
  router.push('/quan-li-san-pham')
  emit('close')
}

// Note: createVariants functionality is handled by generateVariants function above

const openSerialModal = async (index) => {
  console.log('=== OPENING SERIAL MODAL ===')
  console.log('Variant index:', index)
  console.log('Current showSerialModal value:', showSerialModal.value)
  
  currentVariantIndex.value = index
  
  // Get the variant from displayVariants (could be preview or real)
  const variant = displayVariants.value[index]
  
  if (!variant) {
    console.error('Variant not found at index:', index)
    alert('Không tìm thấy biến thể')
    return
  }
  
  console.log('Variant data:', variant)
  console.log('Variant has ID:', !!variant.id)
  
  // Initialize serials array if it doesn't exist
  if (!variant.serials) {
    variant.serials = []
    console.log('Initialized empty serials array')
  }
  
  // Load existing serials and images from backend if variant has ID (real variant)
  if (variant.id) {
    try {
      console.log('Loading data for real variant with ID:', variant.id)
      // Load serials
      const serialResponse = await getSerialsByCtspId(variant.id)
      const backendSerials = serialResponse.data || []
      console.log('Loaded serials from backend:', backendSerials)
      
      variant.serials = backendSerials.map(serial => ({
        id: serial.id,
        soSerial: serial.serialNo,
        trangThai: serial.trangThai || 1
      }))
      
      // Update stock count
      variant.soLuongTon = variant.serials.length
      
      // Load images
      const imageResponse = await getHinhAnhByCtspId(variant.id)
      const backendImages = imageResponse.data || []
      
      // Set main image
      const mainImage = backendImages.find(img => img.anhChinhDaiDien)
      if (mainImage) {
        variant.anhDaiDien = mainImage.url
      }
      
    } catch (error) {
      console.error('Error loading variant data:', error)
      // Continue to show modal even if loading fails
    }
  } else {
    // For preview variants, show info that they need to save first
    console.log('Opening serial modal for preview variant')
  }
  
  console.log('Setting showSerialModal to true...')
  showSerialModal.value = true
  
  // Force Vue to update the DOM
  await nextTick()
  console.log('After nextTick - showSerialModal:', showSerialModal.value)
  console.log('currentVariant:', currentVariant.value)
  console.log('=== MODAL SHOULD BE VISIBLE NOW ===')
}

const updateStockFromSerials = () => {
  // Update stock for all variants based on their serial numbers
  form.value.variants.forEach(variant => {
    variant.soLuongTon = (variant.serials || []).length
  })
}

// Image upload functions
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      loading.value = true
      const imageUrl = await uploadImageToCloudinary(file)
      form.value.anhDaiDien = imageUrl
      alert('Tải ảnh đại diện thành công!')
    } catch (error) {
      console.error('Error uploading main image:', error)
      alert('Có lỗi xảy ra khi tải ảnh')
    } finally {
      loading.value = false
    }
  }
}

const handleGalleryUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    try {
      loading.value = true
      const uploadPromises = files.map(file => uploadImageToCloudinary(file))
      const imageUrls = await Promise.all(uploadPromises)
      
      form.value.images = [...(form.value.images || []), ...imageUrls]
      alert(`Tải thành công ${imageUrls.length} ảnh!`)
    } catch (error) {
      console.error('Error uploading gallery images:', error)
      alert('Có lỗi xảy ra khi tải ảnh')
    } finally {
      loading.value = false
    }
  }
}

const removeImage = (index) => {
  if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
    form.value.images.splice(index, 1)
  }
}

const selectVariantImage = async (index) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        loading.value = true
        
        // Upload to Cloudinary
        const imageUrl = await uploadImageToCloudinary(file)
        
        // Update local variant
        if (form.value.variants[index]) {
          form.value.variants[index].anhDaiDien = imageUrl
          
          // Save to backend if variant has ID
          if (form.value.variants[index].id) {
            const imageRequest = {
              idSpct: form.value.variants[index].id,
              url: imageUrl,
              anhChinhDaiDien: true
            }
            await createHinhAnhBatch([imageRequest])
          }
        }
        
        alert('Tải ảnh thành công!')
      } catch (error) {
        console.error('Error uploading variant image:', error)
        alert('Có lỗi xảy ra khi tải ảnh')
      } finally {
        loading.value = false
      }
    }
  }
  
  input.click()
}

const removeVariantImage = (index) => {
  if (form.value.variants[index]) {
    form.value.variants[index].anhDaiDien = null
  }
}

// Serial modal functions
const closeSerialModal = () => {
  console.log('Closing serial modal')
  
  // Ask for confirmation if there are unsaved changes
  const variant = currentVariant.value
  if (variant?.serials?.length > 0) {
    const hasUnsavedSerials = variant.serials.some(serial => !serial.id)
    if (hasUnsavedSerials && variant.id) {
      if (!confirm('Bạn có serial chưa lưu. Bạn có chắc chắn muốn đóng mà không lưu?')) {
        return // Don't close if user wants to save
      }
    }
  }
  
  showSerialModal.value = false
  currentVariantIndex.value = -1
  serialInput.value = ''
  serialValidationError.value = ''
  serialValidationSuccess.value = ''
}

// Real-time validation for serial input
const validateSerialInput = () => {
  const input = serialInput.value.trim()
  
  if (!input) {
    serialValidationError.value = ''
    serialValidationSuccess.value = ''
    return
  }
  
  // Split by comma or semicolon
  const serials = input
    .split(/[,;]/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0)
  
  if (serials.length === 0) {
    serialValidationError.value = ''
    serialValidationSuccess.value = ''
    return
  }
  
  // Validate each serial
  const invalidSerials = []
  for (const serial of serials) {
    const validation = validateSerial(serial)
    if (!validation.valid) {
      invalidSerials.push(validation.message)
    }
  }
  
  if (invalidSerials.length > 0) {
    serialValidationError.value = invalidSerials[0] // Show first error
    serialValidationSuccess.value = ''
    return
  }
  
  // Check for duplicates in current input
  const duplicates = serials.filter((serial, index) => serials.indexOf(serial) !== index)
  if (duplicates.length > 0) {
    serialValidationError.value = `Có serial trùng lặp: ${duplicates[0]}`
    serialValidationSuccess.value = ''
    return
  }
  
  // Check for duplicates with existing serials
  if (currentVariant.value?.serials) {
    const existingSerials = currentVariant.value.serials.map(s => s.soSerial)
    const existingDuplicates = serials.filter(serial => existingSerials.includes(serial))
    if (existingDuplicates.length > 0) {
      serialValidationError.value = `Serial đã tồn tại: ${existingDuplicates[0]}`
      serialValidationSuccess.value = ''
      return
    }
  }
  
  // All validations passed
  serialValidationError.value = ''
  if (serials.length === 1) {
    serialValidationSuccess.value = `Serial hợp lệ: ${serials[0]}`
  } else {
    serialValidationSuccess.value = `${serials.length} serial hợp lệ`
  }
}

// Validate serial number format
const validateSerial = (serial) => {
  // Check if exactly 7 characters
  if (serial.length !== 7) {
    return { valid: false, message: `Serial "${serial}" phải có đúng 7 ký tự` }
  }
  
  // Check if contains both letters and numbers
  const hasLetter = /[a-zA-Z]/.test(serial)
  const hasNumber = /[0-9]/.test(serial)
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: `Serial "${serial}" phải chứa cả chữ và số` }
  }
  
  // Check if contains only alphanumeric characters
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(serial)
  if (!isAlphanumeric) {
    return { valid: false, message: `Serial "${serial}" chỉ được chứa chữ và số` }
  }
  
  return { valid: true }
}

const addSerialNumbers = () => {
  if (!serialInput.value.trim()) {
    alert('Vui lòng nhập serial number')
    return
  }

  // Split by comma or semicolon
  const serials = serialInput.value
    .split(/[,;]/)
    .map((s) => s.trim().toUpperCase()) // Convert to uppercase for consistency
    .filter((s) => s.length > 0)

  if (serials.length === 0) {
    alert('Không có serial number hợp lệ')
    return
  }
  
  // Initialize serials array if it doesn't exist
  if (!currentVariant.value) {
    alert('Không tìm thấy biến thể')
    return
  }
  
  if (!currentVariant.value.serials) {
    currentVariant.value.serials = []
  }
  
  // Check for duplicates with existing serials
  const existingSerials = currentVariant.value.serials.map(s => s.soSerial)
  const validSerials = []
  const duplicateSerials = []
  
  serials.forEach(serial => {
    if (existingSerials.includes(serial)) {
      duplicateSerials.push(serial)
    } else {
      validSerials.push(serial)
    }
  })
  
  if (duplicateSerials.length > 0) {
    alert(`Các serial sau đã tồn tại và sẽ bị bỏ qua: ${duplicateSerials.join(', ')}`)
  }
  
  if (validSerials.length === 0) {
    return
  }
  
  // Add serials to local list
  validSerials.forEach(serial => {
    currentVariant.value.serials.push({
      id: null, // Local serial, no ID yet
      soSerial: serial,
      trangThai: 1 // Mặc định là 'Có sẵn'
    })
  })
  
  // Update stock count
  currentVariant.value.soLuongTon = currentVariant.value.serials.length
  
  // Clear input
  serialInput.value = ''
  
  // Clear validation messages
  serialValidationError.value = ''
  serialValidationSuccess.value = ''
  
  console.log(`Đã thêm ${validSerials.length} serial vào danh sách local`)
}

// Note: removeVariantSerial functionality is handled by removeSerial function above

// Note: removeVariant functionality is handled by the async removeVariant function above

// Trigger functions for file inputs
const triggerMainImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = handleImageUpload
  input.click()
}

const triggerGalleryUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = handleGalleryUpload
  input.click()
}

// Helper functions to get selected attribute names
const getSelectedCpuNames = (selectedIds) => {
  return selectedIds.map(id => {
    const cpu = cpus.value.find(c => c.id === id)
    return cpu ? cpu.tenCpu : ''
  }).filter(name => name)
}

const getSelectedRamNames = (selectedIds) => {
  return selectedIds.map(id => {
    const ram = rams.value.find(r => r.id === id)
    return ram ? ram.tenRam : ''
  }).filter(name => name)
}

const getSelectedGpuNames = (selectedIds) => {
  return selectedIds.map(id => {
    const gpu = gpus.value.find(g => g.id === id)
    return gpu ? gpu.tenGpu : ''
  }).filter(name => name)
}

const getSelectedStorageNames = (selectedIds) => {
  return selectedIds.map(id => {
    const storage = storages.value.find(s => s.id === id)
    return storage ? storage.dungLuong : ''
  }).filter(name => name)
}

const getSelectedColorNames = (selectedIds) => {
  return selectedIds.map(id => {
    const color = colors.value.find(c => c.id === id)
    return color ? color.tenMau : ''
  }).filter(name => name)
}

const getSelectedDisplayNames = (selectedIds) => {
  return selectedIds.map(id => {
    const display = displays.value.find(d => d.id === id)
    return display ? display.kichThuoc : ''
  }).filter(name => name)
}

const getSelectedBatteryNames = (selectedIds) => {
  return selectedIds.map(id => {
    const battery = batteries.value.find(b => b.id === id)
    return battery ? battery.dungLuongPin : ''
  }).filter(name => name)
}

// Update product price range based on variants
const updateProductPriceRange = () => {
  if (!form.value.variants || form.value.variants.length === 0) {
    form.value.giaThapNhat = 0
    form.value.giaCaoNhat = 0
    return
  }

  const variantPrices = form.value.variants
    .map(v => parseFloat(v.giaBan) || 0)
    .filter(price => price > 0)
  
  if (variantPrices.length > 0) {
    form.value.giaThapNhat = Math.min(...variantPrices)
    form.value.giaCaoNhat = Math.max(...variantPrices)
  } else {
    form.value.giaThapNhat = 0
    form.value.giaCaoNhat = 0
  }
  
  console.log(`Updated product price range: ${form.value.giaThapNhat} - ${form.value.giaCaoNhat}`)
}

// Update variant price function
const updateVariantPrice = async (index, newPrice) => {
  const variant = form.value.variants[index]
  if (!variant) {
    return
  }

  try {
    // Update local data
    variant.giaBan = newPrice
    
    // Update product price range
    updateProductPriceRange()
    
    // Only call API if variant has ID (saved variant)
    if (variant.id) {
      const updatePayload = {
        giaBan: newPrice
      }
      
      await updateSanPham(variant.id, updatePayload)
      console.log(`Updated variant ${variant.id} price to ${newPrice}`)
    } else {
      console.log(`Updated preview variant price to ${newPrice}`)
    }
    
  } catch (error) {
    console.error('Error updating variant price:', error)
    alert('Lỗi khi cập nhật giá: ' + (error.message || 'Unknown error'))
  }
}

// Remove variant from preview
const removeVariantFromPreview = (index) => {
  const variant = displayVariants.value[index]
  
  if (!variant) {
    alert('Không tìm thấy biến thể')
    return
  }
  
  // Remove from local state
  form.value.variants.splice(index, 1)
  console.log(`Removed variant at index ${index}`)
  
  // Update product price range
  updateProductPriceRange()
}

// Note: openSerialModal is already defined above with more complete functionality

// Remove variant function
const removeVariant = async (index) => {
  const variant = displayVariants.value[index]
  
  if (!variant || !variant.id) {
    alert('Không thể xóa biến thể này')
    return
  }

  const confirmMessage = `Bạn có chắc chắn muốn xóa biến thể này?\n\nHành động này không thể hoàn tác!`
  
  if (confirm(confirmMessage)) {
    try {
      loading.value = true
      
      // Call API to delete variant
      await deleteCTSP(variant.id)
      
      // Remove from local state
      if (form.value.variants && form.value.variants.length > 0) {
        form.value.variants = form.value.variants.filter(v => v.id !== variant.id)
      }
      
      alert('Xóa biến thể thành công!')
      
    } catch (err) {
      console.error('Error deleting variant:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi xóa biến thể'
      alert('Lỗi: ' + errorMessage)
    } finally {
      loading.value = false
    }
  }
}

// Note: addSerial functionality is handled by addSerialNumbers function above

// Toggle serial status between 'Có sẵn' (1) and 'Ẩn' (0)
const toggleSerialStatus = (serialIndex) => {
  const variant = currentVariant.value
  if (!variant || !variant.serials || !variant.serials[serialIndex]) return
  
  const serial = variant.serials[serialIndex]
  const newStatus = serial.trangThai === 1 ? 0 : 1
  const statusText = newStatus === 1 ? 'Có sẵn' : 'Ẩn'
  
  if (confirm(`Bạn có chắc chắn muốn chuyển trạng thái serial "${serial.soSerial}" thành "${statusText}"?`)) {
    serial.trangThai = newStatus
    
    // Update stock count (only count available serials - trangThai = 1)
    const availableSerials = variant.serials.filter(s => s.trangThai === 1)
    variant.soLuongTon = availableSerials.length
    
    console.log(`Đã chuyển trạng thái serial ${serial.soSerial} thành ${statusText}. Stock count: ${variant.soLuongTon}`)
  }
}

// Remove serial from variant
const removeSerial = (serialIndex) => {
  const variant = currentVariant.value
  if (!variant || !variant.serials) return
  
  const serial = variant.serials[serialIndex]
  if (confirm(`Bạn có chắc chắn muốn xóa serial "${serial.soSerial}"?`)) {
    variant.serials.splice(serialIndex, 1)
    
    // Update stock count (only count available serials - trangThai = 1)
    const availableSerials = variant.serials.filter(s => s.trangThai === 1)
    variant.soLuongTon = availableSerials.length
    
    console.log(`Đã xóa serial ${serial.soSerial}. Stock count: ${variant.soLuongTon}`)
  }
}

// Note: closeSerialModal is already defined above

// Note: updateStockFromSerials is already defined above with proper logic

// Note: removeVariantSerial functionality is handled by removeSerial function above

// Save serials (for serial modal)
const saveSerials = async () => {
  const variant = currentVariant.value
  if (!variant) {
    alert('Không tìm thấy biến thể')
    return
  }

  try {
    loading.value = true
    
    // Update stock based on serial count
    variant.soLuongTon = (variant.serials || []).length
    
    if (variant.id) {
      // Real variant - save to database
      console.log('Saving serials to database for variant:', variant.id)
      
      // Filter serials that need to be saved (no ID = new serials)
      const newSerials = (variant.serials || []).filter(serial => !serial.id)
      
      if (newSerials.length > 0) {
        // Create serial requests for backend
        const serialRequests = newSerials.map(serial => ({
          ctspId: variant.id,
          serialNo: serial.soSerial,
          trangThai: serial.trangThai || 1
        }))
        
        try {
          // Call backend API to create serials
          const response = await createSerialsBatch(serialRequests)
          const createdSerials = response.data || []
          
          // Update local serials with IDs from backend
          createdSerials.forEach((createdSerial, index) => {
            const localSerial = newSerials[index]
            if (localSerial) {
              localSerial.id = createdSerial.id
            }
          })
          
          console.log(`Đã lưu ${createdSerials.length} serial mới vào database`)
        } catch (apiError) {
          console.error('Error saving serials to database:', apiError)
          // Continue with local save even if API fails
        }
      }
      
      alert('Lưu serial thành công!')
    } else {
      // Preview variant - just save locally
      console.log('Saving serials locally for preview variant')
      alert('Serial đã được lưu tạm thời. Vui lòng lưu biến thể để lưu vào database.')
    }
    
    // Update stock for all variants
    updateStockFromSerials()
    
    closeSerialModal()
    
  } catch (err) {
    console.error('Error saving serials:', err)
    alert('Lỗi khi lưu serial: ' + (err.message || 'Unknown error'))
  } finally {
    loading.value = false
  }
}

// Helper function to get variant configuration string
const getVariantConfig = (index) => {
  const variant = displayVariants.value[index]
  if (!variant) return ''
  
  const specs = []
  if (variant.tenMauSac) specs.push(variant.tenMauSac)
  if (variant.tenCpu) specs.push(variant.tenCpu)
  if (variant.tenRam) specs.push(variant.tenRam)
  if (variant.tenGpu) specs.push(variant.tenGpu)
  if (variant.dungLuongOCung) specs.push(variant.dungLuongOCung)
  if (variant.kichThuocManHinh) specs.push(variant.kichThuocManHinh)
  if (variant.dungLuongPin) specs.push(variant.dungLuongPin)
  
  return specs.join(' - ')
}

// Helper function to format price
const formatPrice = (price) => {
  if (!price || price === 0) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

// Import from Excel function
const importFromExcel = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    loading.value = true
    
    // Check if variant has ID (saved to DB) or is preview
    if (!currentVariant.value?.id) {
      // Preview mode - parse file locally without calling API
      console.log('Preview mode: Parsing Excel/CSV file locally...')
      
      const serials = await parseExcelFileLocally(file)
      
      if (serials.length === 0) {
        alert('Không có serial number nào được tìm thấy trong file')
        event.target.value = ''
        return
      }
      
      // Add to local serials list
      currentVariant.value.serials = currentVariant.value.serials || []
      serials.forEach(serial => {
        if (!currentVariant.value.serials.find(s => s.soSerial === serial)) {
          currentVariant.value.serials.push({
            id: null,
            soSerial: serial,
            trangThai: 1
          })
        }
      })
      
      // Update stock count (only count available serials - trangThai = 1)
      const availableSerials = currentVariant.value.serials.filter(s => s.trangThai === 1)
      currentVariant.value.soLuongTon = availableSerials.length
      console.log(`Updated soLuongTon to ${currentVariant.value.soLuongTon} for preview variant (${availableSerials.length} available out of ${currentVariant.value.serials.length} total)`)
      
      alert(`Đã import thành công ${serials.length} serial number! Vui lòng lưu biến thể để lưu vào database.`)
      event.target.value = ''
      
    } else {
      // Saved variant - call API
      console.log('Saved variant: Calling API to import serials...')
      
      const response = await importSerialsFromExcel(currentVariant.value.id, file)
      const importedSerials = response.data || []
      
      if (importedSerials.length === 0) {
        alert('Không có serial number nào được import')
        event.target.value = ''
        return
      }
      
      // Update local serials list
      currentVariant.value.serials = currentVariant.value.serials || []
      importedSerials.forEach(serialResponse => {
        currentVariant.value.serials.push({
          id: serialResponse.id,
          soSerial: serialResponse.serialNo,
          trangThai: serialResponse.trangThai || 1
        })
      })
      
      // Update stock count (only count available serials - trangThai = 1)
      const availableSerials = currentVariant.value.serials.filter(s => s.trangThai === 1)
      currentVariant.value.soLuongTon = availableSerials.length
      console.log(`Updated soLuongTon to ${currentVariant.value.soLuongTon} for saved variant (${availableSerials.length} available out of ${currentVariant.value.serials.length} total)`)
      
      alert(`Đã import thành công ${importedSerials.length} serial number!`)
      event.target.value = ''
    }
    
  } catch (error) {
    console.error('Error importing serials:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import serial'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

// Helper function to parse Excel/CSV file locally
const parseExcelFileLocally = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const serials = []
        
        // Split by lines
        const lines = text.split(/\r?\n/).filter(line => line.trim())
        
        // Skip header row if exists
        const startIndex = lines[0].toLowerCase().includes('serial') ? 1 : 0
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          // Split by comma, tab, or semicolon
          const parts = line.split(/[,;\t]/).map(p => p.trim()).filter(p => p)
          
          if (parts.length > 0) {
            const serial = parts[0]
            
            // Validate serial: 7 characters, alphanumeric
            if (serial.length === 7 && /^[A-Za-z0-9]+$/.test(serial)) {
              serials.push(serial)
            }
          }
        }
        
        resolve(serials)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Không thể đọc file'))
    }
    
    // Read as text for CSV/Excel saved as CSV
    reader.readAsText(file)
  })
}

// Download Excel template function
const downloadExcelTemplate = () => {
  // Create a simple CSV template
  const csvContent = 'Serial Number\n123456\n789012\n'
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
  }
}

// Test function to manually show modal (for debugging)
const testShowModal = () => {
  console.log('=== TEST SHOW MODAL ===')
  showSerialModal.value = true
  currentVariantIndex.value = 0
  console.log('showSerialModal set to:', showSerialModal.value)
}

// Make test function available globally for debugging
if (typeof window !== 'undefined') {
  window.testShowModal = testShowModal
}

// Helper function to count unsaved serials
const getUnsavedSerialsCount = () => {
  const variant = currentVariant.value
  if (!variant?.serials) return 0
  return variant.serials.filter(serial => !serial.id).length
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

/* Multi-select dropdown styling */
.multi-select-dropdown {
  max-height: 200px;
  overflow-y: auto;
  padding: 0;
}

.dropdown-item-checkbox {
  padding: 0;
}

.dropdown-item-checkbox .dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item-checkbox .dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item-checkbox .form-check-input {
  margin-right: 8px;
  margin-top: 0;
}

.selected-items {
  color: #495057;
  font-weight: 500;
}

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  border: 1px solid #dee2e6;
}

/* Dropdown button styling */
.dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
}

.dropdown-toggle::after {
  margin-left: auto;
}

/* Variant configuration vertical layout */
.variant-config-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 120px;
}

.variant-config-vertical .spec-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  font-size: 13px;
}

.variant-config-vertical .spec-item i {
  width: 16px;
  font-size: 14px;
  flex-shrink: 0;
}

.variant-config-vertical .spec-item span {
  color: #374151;
  font-weight: 500;
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

.variant-image-upload.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.variant-image-upload.disabled:hover {
  border-color: #e5e7eb;
  background: transparent;
}

.variant-image-preview {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}

.variant-image-preview:hover .image-overlay {
  opacity: 1;
}

.image-overlay .btn {
  padding: 4px 8px;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-buttons .btn-sm {
  font-size: 11px;
  padding: 4px 8px;
  min-width: 60px;
}

.action-buttons .btn {
  padding: 4px 8px;
  font-size: 14px;
}

.stock-info {
  text-align: center;
}

.stock-number {
  font-size: 18px;
  font-weight: 600;
  color: #16a34a;
  display: block;
}

/* Serial modal styling - Floating on top */
.serial-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: rgba(0, 0, 0, 0.6) !important;
  z-index: 99999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px !important;
  backdrop-filter: blur(2px);
}

.serial-modal-wrapper {
  width: 100% !important;
  max-width: 700px !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.serial-modal-dialog {
  position: relative !important;
}

.serial-modal-content {
  background: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
  overflow: hidden !important;
  border: 1px solid #e5e7eb;
}

.serial-modal-header {
  padding: 20px 24px !important;
  border-bottom: 1px solid #e5e7eb !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  background: #fff !important;
  position: relative;
}

.serial-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.serial-modal-body {
  padding: 24px !important;
  background: #f9fafb !important;
  max-height: 60vh;
  overflow-y: auto;
}

.serial-modal-footer {
  padding: 16px 24px !important;
  border-top: 1px solid #e5e7eb !important;
  background: #fff !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  position: sticky;
  bottom: 0;
  min-height: 60px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.variant-subtitle {
  color: #374151;
  font-weight: 600;
  margin-bottom: 16px;
}

/* Multiple select styling */
.form-select[multiple] {
  min-height: 100px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.form-select[multiple]:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.form-select[multiple]:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-select[multiple] option {
  padding: 10px 16px;
  border-radius: 8px;
  margin: 3px;
  font-weight: 500;
  transition: all 0.2s ease;
  background: transparent;
}

.form-select[multiple] option:hover {
  background-color: #f0fdf4;
  color: #16a34a;
}

.form-select[multiple] option:checked {
  background: linear-gradient(135deg, #16a34a, #10b981);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3);
}

.form-select[multiple] option:checked:hover {
  background: linear-gradient(135deg, #15803d, #059669);
}

/* Custom label styling */
.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label small {
  background: linear-gradient(135deg, #16a34a, #10b981);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

/* Variant count badge */
.variant-count-badge {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
  }
}

.variant-count-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* Multi-select dropdown styling */
.multi-select-dropdown {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-item-checkbox {
  padding: 0;
}

.dropdown-item-checkbox .dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.dropdown-item-checkbox .dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item-checkbox .dropdown-item:active {
  background-color: #e9ecef;
}

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.selected-items {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.dropdown-toggle {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Serial input validation styling */
.form-control.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.form-control.is-valid {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.valid-feedback {
  color: #28a745;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
