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
                            <!-- Left Column -->
                            <div class="col-md-8">
                                <!-- Basic Info -->
                                <div class="card mb-4">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Thông tin cơ bản</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row g-3">
                                            <div class="col-md-12">
                                                <label class="form-label">Tên sản phẩm <span
                                                        class="text-danger">*</span></label>
                                                <input type="text" class="form-control" v-model="form.tenSanPham"
                                                    required>
                                            </div>

                                            <div class="col-md-6">
                                                <label class="form-label">Mã sản phẩm</label>
                                                <input type="text" class="form-control" v-model="form.maSanPham">
                                            </div>

                                            <div class="col-md-6">
                                                <label class="form-label">Hãng sản xuất <span
                                                        class="text-danger">*</span></label>
                                                <select class="form-select" v-model="form.hang_id" required>
                                                    <option value="">Chọn hãng</option>
                                                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{
                                                        brand.tenHang }}</option>
                                                </select>
                                            </div>

                                            <div class="col-md-12">
                                                <label class="form-label">Mô tả ngắn</label>
                                                <textarea class="form-control" rows="3"
                                                    v-model="form.moTaNgan"></textarea>
                                            </div>

                                            <div class="col-md-12">
                                                <label class="form-label">Mô tả chi tiết</label>
                                                <textarea class="form-control" rows="5"
                                                    v-model="form.moTaChiTiet"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Specifications -->
                                <div class="card mb-4">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Thông số kỹ thuật</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label">CPU</label>
                                                <select class="form-select" v-model="form.cpu_id">
                                                    <option value="">Chọn CPU</option>
                                                    <option v-for="cpu in cpus" :key="cpu.id" :value="cpu.id">{{
                                                        cpu.tenCPU }}
                                                    </option>
                                                </select>
                                            </div>

                                            <div class="col-md-6">
                                                <label class="form-label">GPU</label>
                                                <select class="form-select" v-model="form.gpu_id">
                                                    <option value="">Chọn GPU</option>
                                                    <option v-for="gpu in gpus" :key="gpu.id" :value="gpu.id">{{
                                                        gpu.tenGPU }}
                                                    </option>
                                                </select>
                                            </div>

                                            <div class="col-md-4">
                                                <label class="form-label">Kích thước màn hình</label>
                                                <select class="form-select" v-model="form.kichThuocManHinh_id">
                                                    <option value="">Chọn kích thước</option>
                                                    <option v-for="screen in screens" :key="screen.id"
                                                        :value="screen.id">{{
                                                            screen.giaTri }}</option>
                                                </select>
                                            </div>

                                            <div class="col-md-4">
                                                <label class="form-label">Loại màn hình</label>
                                                <select class="form-select" v-model="form.loaiManHinh_id">
                                                    <option value="">Chọn loại màn hình</option>
                                                    <option v-for="display in displays" :key="display.id"
                                                        :value="display.id">{{
                                                            display.congNghe }}</option>
                                                </select>
                                            </div>

                                            <div class="col-md-4">
                                                <label class="form-label">Hệ điều hành</label>
                                                <select class="form-select" v-model="form.heDieuHanh_id">
                                                    <option value="">Chọn hệ điều hành</option>
                                                    <option v-for="os in oses" :key="os.id" :value="os.id">{{ os.tenHĐH
                                                        }}</option>
                                                </select>
                                            </div>

                                            <div class="col-md-4">
                                                <label class="form-label">Dung lượng pin</label>
                                                <select class="form-select" v-model="form.dungLuongPin_id">
                                                    <option value="">Chọn dung lượng pin</option>
                                                    <option v-for="battery in batteries" :key="battery.id"
                                                        :value="battery.id">{{
                                                            battery.dungLuongWh }} Wh</option>
                                                </select>
                                            </div>

                                            <div class="col-md-4">
                                                <label class="form-label">Camera</label>
                                                <select class="form-select" v-model="form.camera_id">
                                                    <option value="">Chọn camera</option>
                                                    <option v-for="camera in cameras" :key="camera.id"
                                                        :value="camera.id">{{
                                                            camera.doPhanGiai }}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column -->
                            <div class="col-md-4">
                                <!-- Status & Images -->
                                <div class="card mb-4">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Trạng thái & Hình ảnh</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label class="form-label">Trạng thái</label>
                                            <select class="form-select" v-model="form.trangThai">
                                                <option value="ACTIVE">Hiển thị</option>
                                                <option value="INACTIVE">Ẩn</option>
                                                <option value="DRAFT">Bản nháp</option>
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">Ảnh đại diện</label>
                                            <div class="avatar-upload">
                                                <img :src="form.anhDaiDien || '/placeholder-image.jpg'"
                                                    class="avatar-preview" alt="Preview">
                                                <input type="file" class="d-none" accept="image/*"
                                                    @change="handleImageUpload" ref="imageInput">
                                                <button type="button" class="btn btn-sm btn-outline-primary mt-2"
                                                    @click="$refs.imageInput.click()">
                                                    <i class="bi bi-upload"></i> Tải lên
                                                </button>
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">Thư viện ảnh</label>
                                            <div class="image-gallery">
                                                <div v-for="(image, index) in form.images" :key="index"
                                                    class="gallery-item">
                                                    <img :src="image" class="img-thumbnail">
                                                    <button type="button" class="btn-remove-image"
                                                        @click="removeImage(index)">
                                                        <i class="bi bi-x"></i>
                                                    </button>
                                                </div>
                                                <div class="gallery-item add-image" @click="$refs.galleryInput.click()">
                                                    <i class="bi bi-plus-lg"></i>
                                                    <input type="file" class="d-none" accept="image/*" multiple
                                                        @change="handleGalleryUpload" ref="galleryInput">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Variants -->
                                <div class="card mb-4">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Biến thể sản phẩm</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="variants-list">
                                            <div v-for="(variant, index) in form.variants" :key="index"
                                                class="variant-item">
                                                <div class="variant-header">
                                                    <span>Biến thể #{{ index + 1 }}</span>
                                                    <button type="button" class="btn btn-sm btn-link text-danger"
                                                        @click="removeVariant(index)" v-if="form.variants.length > 1">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                                <div class="variant-content">
                                                    <div class="mb-2">
                                                        <label class="form-label small">RAM</label>
                                                        <select class="form-select form-select-sm"
                                                            v-model="variant.ram_id">
                                                            <option value="" disabled selected>Chọn RAM</option>
                                                            <option v-for="ram in rams" :key="ram.id" :value="ram.id">{{
                                                                ram.dungLuong
                                                                }}</option>
                                                        </select>
                                                    </div>
                                                    <div class="mb-2">
                                                        <label class="form-label small">Ổ cứng</label>
                                                        <select class="form-select form-select-sm"
                                                            v-model="variant.o_cung_id">
                                                            <option value="" disabled selected>Chọn ổ cứng</option>
                                                            <option v-for="storage in storages" :key="storage.id"
                                                                :value="storage.id">{{
                                                                    storage.tenOCung }}</option>
                                                        </select>
                                                    </div>
                                                    <div class="mb-2">
                                                        <label class="form-label small">Màu sắc</label>
                                                        <select class="form-select form-select-sm"
                                                            v-model="variant.mau_sac_id">
                                                            <option value="" disabled selected>Chọn màu</option>
                                                            <option v-for="color in colors" :key="color.id"
                                                                :value="color.id">{{
                                                                    color.tenMau }}</option>
                                                        </select>
                                                    </div>
                                                    <div class="mb-2">
                                                        <label class="form-label small">Giá bán</label>
                                                        <input type="number" class="form-control form-control-sm"
                                                            v-model.number="variant.giaBan" min="0">
                                                    </div>
                                                    <div class="mb-2">
                                                        <label class="form-label small">Số lượng</label>
                                                        <input type="number" class="form-control form-control-sm"
                                                            v-model.number="variant.soLuong" min="0">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" class="btn btn-sm btn-outline-primary w-100 mt-2"
                                            @click="addVariant">
                                            <i class="bi bi-plus"></i> Thêm biến thể
                                        </button>
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
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAttributeStore } from '@/stores/attributeStore'
import { uploadImageToCloudinary } from '@/service/uploadImageToCloud'

const attributeStore = useAttributeStore()

const brands = computed(() => attributeStore.getBrands)
const cpus = computed(() => attributeStore.getCpus)
const rams = computed(() => attributeStore.getRams)
const gpus = computed(() => attributeStore.getGpus)
const storages = computed(() => attributeStore.getStorages)
const colors = computed(() => attributeStore.getColors)
const screens = computed(() => attributeStore.getScreens)
const displays = computed(() => attributeStore.getDisplays)
const oses = computed(() => attributeStore.getOses)
const batteries = computed(() => attributeStore.getBatteries)
const cameras = computed(() => attributeStore.getCameras)

onMounted(() => {
    if (
        brands.value.length === 0 ||
        cpus.value.length === 0 ||
        rams.value.length === 0 ||
        gpus.value.length === 0 ||
        storages.value.length === 0 ||
        colors.value.length === 0 ||
        screens.value.length === 0 ||
        displays.value.length === 0 ||
        oses.value.length === 0 ||
        batteries.value.length === 0 ||
        cameras.value.length === 0
    ) {
        attributeStore.fetchAttributes()
    }
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
    moTaNgan: '',
    moTaChiTiet: '',
    hang_id: '', // <-- để là '' thay vì null
    cpu_id: '',
    gpu_id: '',
    kichThuocManHinh_id: '',
    loaiManHinh_id: '',
    heDieuHanh_id: '',
    dungLuongPin_id: '',
    camera_id: '',
    trangThai: 'ACTIVE',
    anhDaiDien: null,
    images: [],
    variants: [
        {
            ram_id: '',
            o_cung_id: '',
            mau_sac_id: '',
            giaBan: 0,
            soLuong: 0
        }
    ]
})

// Initialize form with product data if in edit mode
if (props.product) {
    form.value = { ...props.product }
}

const addVariant = () => {
    form.value.variants.push({
        ram_id: '',
        o_cung_id: '',
        mau_sac_id: '',
        giaBan: 0,
        soLuong: 0
    })
}

const removeVariant = (index) => {
    form.value.variants.splice(index, 1)
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

const save = () => {
    emit('save', form.value)
}

const close = () => {
    emit('close')
}
</script>

<style scoped>
.modal-content {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    z-index: 1050;
    pointer-events: auto;
}

.modal-body {
    overflow-y: auto;
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
    gap: 12px;
}

.variant-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
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
    padding: 8px;
}

.modal {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    z-index: 1000;
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
    z-index: 1050;
    pointer-events: auto;
}

.modal-backdrop {
    position: fixed;
    z-index: 1040;
    background-color: rgba(0, 0, 0, 0.5);
    pointer-events: auto;
}
</style>