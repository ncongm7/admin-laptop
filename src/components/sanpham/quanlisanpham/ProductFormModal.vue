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
            <!-- Header -->
            <div class="d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-plus-circle text-success"></i>
              <span class="fw-semibold text-muted">{{ isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}</span>
            </div>
            
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
                      <!-- Main image slot -->
                      <div class="col">
                        <div class="image-upload-slot main-image" @click="triggerMainImageUpload">
                          <img
                            v-if="form.anhDaiDien"
                            :src="form.anhDaiDien"
                            class="uploaded-image"
                            alt="Ảnh đại diện"
                          />
                          <div v-else class="upload-placeholder">
                            <i class="bi bi-camera"></i>
                            <p class="upload-label">Ảnh đại diện</p>
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
                        <div class="image-upload-slot" @click="triggerGalleryUpload">
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
                      </div>
                      <!-- Hidden gallery input -->
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

                <!-- Combined Add Product & Create Variants Button after Images -->
                <div class="d-flex justify-content-end mb-4">
                  <button type="button" class="btn btn-success" @click="saveAndCreateVariants" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-plus-circle"></i> 
                    {{ loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật & Tạo biến thể' : 'Thêm sản phẩm & Tạo biến thể') }}
                  </button>
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
                      <div class="alert alert-info mb-4">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>Hướng dẫn:</strong> Chọn nhiều giá trị cho mỗi thuộc tính (giữ Ctrl + click). 
                        Hệ thống sẽ tự động tạo tất cả tổ hợp có thể từ các lựa chọn của bạn.
                        <br>
                        <small class="text-muted">
                          Ví dụ: 2 màu × 2 RAM = 4 biến thể
                        </small>
                      </div>

                      <div class="variant-selectors">
                        <!-- First row: Color, CPU, RAM, GPU -->
                        <div class="row g-3 mb-3">
                          <div class="col-md-3">
                            <label class="form-label">Màu sắc <small class="text-muted">(Chọn nhiều)</small></label>
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
                            <label class="form-label">CPU <small class="text-muted">(Chọn nhiều)</small></label>
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
                            <label class="form-label">RAM <small class="text-muted">(Chọn nhiều)</small></label>
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
                            <label class="form-label">GPU <small class="text-muted">(Chọn nhiều)</small></label>
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
                            <label class="form-label">Ổ cứng <small class="text-muted">(Chọn nhiều)</small></label>
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
                            <label class="form-label">Màn hình <small class="text-muted">(Chọn nhiều)</small></label>
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
                            <label class="form-label">Pin <small class="text-muted">(Chọn nhiều)</small></label>
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

                        <!-- Pricing and Configuration -->
                        <div class="row g-3 mb-4">
                          <div class="col-md-6">
                            <label class="form-label">Giá bán mặc định <span class="text-danger">*</span></label>
                            <input
                              type="number"
                              class="form-control"
                              v-model.number="variantConfig.giaBan"
                              placeholder="0"
                              min="0"
                              required
                            />
                            <small class="text-muted">Giá này sẽ áp dụng cho tất cả biến thể được tạo</small>
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Trạng thái</label>
                            <select class="form-select" v-model="variantConfig.trangThai">
                              <option value="1">Hoạt động</option>
                              <option value="0">Ẩn</option>
                            </select>
                            <small class="text-muted">Số lượng tồn sẽ được quản lý qua Serial Numbers</small>
                          </div>
                        </div>

                        <!-- Preview info only -->
                        <div class="variant-actions d-flex align-items-center justify-content-between mb-4">
                          <div class="variant-count-info">
                            <div class="variant-count-badge">
                              <i class="bi bi-grid-3x3-gap me-1"></i>
                              <strong>{{ calculateTotalCombinations }}</strong> biến thể
                            </div>
                            <small class="text-muted">
                              {{ previewVariants.length > 0 ? 'đang xem trước - sẽ được tạo khi lưu sản phẩm' : 
                                  form.variants.length > 0 ? 'đã tạo - có thể quản lý Serial Numbers' : 
                                  'sẽ được tạo từ các thuộc tính đã chọn' }}
                            </small>
                          </div>
                          <div v-if="form.variants.length > 0" class="d-flex gap-2">
                            <button type="button" class="btn btn-outline-success btn-sm" @click="close">
                              <i class="bi bi-check"></i> Hoàn thành
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Display preview or created variants -->
                    <div v-if="displayVariants.length > 0" class="created-variants">
                      <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0">{{ form.variants.length > 0 ? 'Biến thể đã tạo:' : 'Xem trước biến thể:' }}</h6>
                        <div v-if="form.variants.length > 0" class="alert alert-success mt-2 mb-0">
                          <i class="bi bi-check-circle me-2"></i>
                          <strong>Bước tiếp theo:</strong> Click vào nút <strong>"Quản lý Serial"</strong> ở cột "Thao tác" để thêm serial numbers cho từng biến thể.
                        </div>
                        <small v-else class="text-muted">
                          Bấm "Thêm sản phẩm & Tạo biến thể" để lưu vào cơ sở dữ liệu
                        </small>
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
                            <tr v-for="(variant, index) in displayVariants" :key="index">
                              <td>{{ index + 1 }}</td>
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
                              <td>
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
                                <div class="stock-info">
                                  <span class="stock-number">{{ variant.soLuongTon || 0 }}</span>
                                  <small class="text-muted d-block">
                                    từ {{ (variant.serials || []).length }} serial
                                  </small>
                                </div>
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
                                    v-if="variant.id"
                                    type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="removeVariant(index)"
                                    title="Xóa"
                                  >
                                    <i class="bi bi-trash"></i>
                                  </button>
                                  <span v-if="!variant.id" class="badge bg-light text-dark">Preview</span>
                                  <span v-else-if="variant.id && (!variant.serials || variant.serials.length === 0)" class="badge bg-warning text-dark">
                                    <i class="bi bi-exclamation-triangle me-1"></i>Chưa có Serial
                                  </span>
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
          <button type="button" class="btn btn-secondary" @click="close" :disabled="loading">Hủy bỏ</button>
          <button type="button" class="btn btn-primary" @click="goBackToProductList" :disabled="loading">
            <i class="bi bi-arrow-left"></i> 
            Quay lại Quản lý sản phẩm
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
                  <span v-if="!currentVariant?.id" class="badge bg-warning ms-2">Preview</span>
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
import { useProductStore } from '@/stores/productStore'
import { uploadImageToCloudinary } from '@/service/uploadImageToCloud'
import { createSanPham, updateSanPham, taoBienTheSanPham, createSerialsBatch, importSerialsFromExcel, getSerialsByCtspId, createHinhAnhBatch, getHinhAnhByCtspId } from '@/service/sanpham/SanPhamService'
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
})

const emit = defineEmits(['close', 'save'])

const isEditMode = computed(() => !!props.product)

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
  giaBan: 0,
  trangThai: 1
})

const showSerialModal = ref(false)
const currentVariantIndex = ref(-1)
const serialInput = ref('')

const currentVariant = computed(() => {
  if (currentVariantIndex.value >= 0 && displayVariants.value[currentVariantIndex.value]) {
    return displayVariants.value[currentVariantIndex.value]
  }
  return null
})

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
  return form.value.variants.length > 0 ? form.value.variants : previewVariants.value
})

// Generate preview variants when selections or price change
watch(
  () => [
    variantConfig.value.selectedCpuIds,
    variantConfig.value.selectedGpuIds,
    variantConfig.value.selectedRamIds,
    variantConfig.value.selectedOCungIds,
    variantConfig.value.selectedMauSacIds,
    variantConfig.value.selectedLoaiManHinhIds,
    variantConfig.value.selectedPinIds,
    variantConfig.value.giaBan
    ],
    () => {
      generatePreviewVariants()
    },
    { deep: true }
  )

const generatePreviewVariants = () => {
  const config = variantConfig.value
  
  // Only generate preview if we have price and at least one selection
  if (config.giaBan <= 0) {
    previewVariants.value = []
    return
  }
  
  const hasSelectedAttributes = 
    config.selectedCpuIds.length > 0 ||
    config.selectedGpuIds.length > 0 ||
    config.selectedRamIds.length > 0 ||
    config.selectedOCungIds.length > 0 ||
    config.selectedMauSacIds.length > 0 ||
    config.selectedLoaiManHinhIds.length > 0 ||
    config.selectedPinIds.length > 0

  if (!hasSelectedAttributes) {
    previewVariants.value = []
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
                  giaBan: config.giaBan,
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

  previewVariants.value = combinations
}

// Combined save product and create variants function
const saveAndCreateVariants = async () => {
  try {
    loading.value = true
    error.value = null

    if (!form.value.tenSanPham.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }

    // Step 1: Save product first
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

    // Step 2: Create variants if preview variants exist
    if (previewVariants.value.length > 0) {
      const config = variantConfig.value
      
      const variantPayload = {
        idSanPham: form.value.id,
        giaBan: config.giaBan,
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

      const variantResponse = await taoBienTheSanPham(variantPayload)
      const createdVariants = variantResponse.data || []
      
      // Map the response to include necessary fields and attribute names
      form.value.variants = createdVariants.map(variant => ({
        ...variant,
        serials: [],
        soLuongTon: 0,
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
      
      // Clear preview variants since we now have real variants
      previewVariants.value = []
      
      alert(`Đã tạo thành công sản phẩm và ${form.value.variants.length} biến thể! Bây giờ bạn có thể quản lý Serial Numbers cho từng biến thể.`)
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

const createVariants = async () => {
  if (!form.value.id) {
    alert('Vui lòng lưu sản phẩm trước khi tạo biến thể')
    return
  }

  if (previewVariants.value.length === 0) {
    alert('Không có biến thể nào để tạo')
    return
  }

  const config = variantConfig.value

  try {
    loading.value = true
    
    const payload = {
      idSanPham: form.value.id,
      giaBan: config.giaBan,
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

    const response = await taoBienTheSanPham(payload)
    const createdVariants = response.data || []
    
    // Map the response to include necessary fields and attribute names
    form.value.variants = createdVariants.map(variant => ({
      ...variant,
      serials: [],
      soLuongTon: 0,
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
    
    // Clear preview variants since we now have real variants
    previewVariants.value = []
    
    alert(`Đã tạo thành công ${form.value.variants.length} biến thể!`)
    
  } catch (err) {
    console.error('Error creating variants:', err)
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tạo biến thể'
    alert(error.value)
  } finally {
    loading.value = false
  }
}

const openSerialModal = async (index) => {
  currentVariantIndex.value = index
  
  // Get the variant from displayVariants (could be preview or real)
  const variant = displayVariants.value[index]
  
  if (!variant) {
    alert('Không tìm thấy biến thể')
    return
  }
  
  // Initialize serials array if it doesn't exist
  if (!variant.serials) {
    variant.serials = []
  }
  
  // Load existing serials and images from backend if variant has ID (real variant)
  if (variant.id) {
    try {
      // Load serials
      const serialResponse = await getSerialsByCtspId(variant.id)
      const backendSerials = serialResponse.data || []
      
      variant.serials = backendSerials.map(serial => ({
        id: serial.id,
        number: serial.serialNo,
        status: serial.trangThaiText
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
    }
  } else {
    // For preview variants, show info that they need to save first
    console.log('Opening serial modal for preview variant')
  }
  
  showSerialModal.value = true
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
  showSerialModal.value = false
  currentVariantIndex.value = -1
  serialInput.value = ''
}

const addSerialNumbers = async () => {
  if (!serialInput.value.trim()) {
    alert('Vui lòng nhập serial number')
    return
  }

  if (!currentVariant.value?.id) {
    alert('Vui lòng lưu biến thể trước khi thêm serial')
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

  try {
    loading.value = true
    
    // Create serial requests for backend
    const serialRequests = serials.map(serialNo => ({
      ctspId: currentVariant.value.id,
      serialNo: serialNo,
      trangThai: 1 // Chưa bán
    }))
    
    // Call backend API
    const response = await createSerialsBatch(serialRequests)
    const createdSerials = response.data || []
    
    if (createdSerials.length === 0) {
      alert('Không có serial number nào được tạo')
      return
    }
    
    // Update local serials list
    currentVariant.value.serials = currentVariant.value.serials || []
    createdSerials.forEach(serialResponse => {
      currentVariant.value.serials.push({
        id: serialResponse.id,
        number: serialResponse.serialNo,
        status: serialResponse.trangThaiText
      })
    })
    
    // Update stock count
    currentVariant.value.soLuongTon = currentVariant.value.serials.length
    
    alert(`Đã thêm thành công ${createdSerials.length} serial number!`)
    serialInput.value = ''
    
  } catch (error) {
    console.error('Error adding serials:', error)
    const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thêm serial'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const removeVariantSerial = (index) => {
  if (confirm('Bạn có chắc muốn xóa serial number này?')) {
    currentVariant.value.serials.splice(index, 1)
    // Update stock count
    currentVariant.value.soLuongTon = currentVariant.value.serials.length
  }
}

const removeVariant = (index) => {
  if (confirm('Bạn có chắc muốn xóa biến thể này?')) {
    form.value.variants.splice(index, 1)
  }
}

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
  gap: 6px;
  justify-content: center;
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
