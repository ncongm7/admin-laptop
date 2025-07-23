<template>
    <div class="container py-4">
        <h2 class="mb-4">Thêm Sản Phẩm Mới</h2>
        <form @submit.prevent="handleSubmit">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Mã sản phẩm *</label>
                    <input v-model="form.ma_san_pham" class="form-control" required />
                </div>
                <div class="col-md-6">
                    <label class="form-label">Tên sản phẩm *</label>
                    <input v-model="form.ten_san_pham" class="form-control" required />
                </div>
                <div class="col-md-6">
                    <label class="form-label">Hãng</label>
                    <select v-model="form.hang_id" class="form-select">
                        <option value="">-- Chọn hãng --</option>
                        <option v-for="h in brands" :key="h.id" :value="h.id">{{ h.ten }}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">CPU</label>
                    <select v-model="form.cpu_id" class="form-select">
                        <option value="">-- Chọn CPU --</option>
                        <option v-for="cpu in cpus" :key="cpu.id" :value="cpu.id">{{ cpu.ten_cpu }}</option>
                    </select>
                </div>
                <div class="col-md-12">
                    <label class="form-label">Mô tả</label>
                    <textarea v-model="form.mo_ta" class="form-control" rows="2"></textarea>
                </div>
                <div class="col-md-12 d-flex align-items-center">
                    <label class="form-label me-2 mb-0">Trạng thái</label>
                    <input type="checkbox" v-model="form.trang_thai" class="form-check-input me-2" /> Hoạt động
                </div>
            </div>
            <hr />
            <h5 class="mt-4">Chi tiết sản phẩm</h5>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Mã chi tiết *</label>
                    <input v-model="form.ma_ctsp" class="form-control" required />
                </div>
                <div class="col-md-6">
                    <label class="form-label">RAM</label>
                    <select v-model="form.ram_id" class="form-select">
                        <option value="">-- Chọn RAM --</option>
                        <option v-for="ram in rams" :key="ram.id" :value="ram.id">{{ ram.ten_ram }}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Ổ cứng</label>
                    <select v-model="form.o_cung_id" class="form-select">
                        <option value="">-- Chọn ổ cứng --</option>
                        <option v-for="oc in oCungs" :key="oc.id" :value="oc.id">{{ oc.dung_luong }}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">GPU</label>
                    <select v-model="form.gpu_id" class="form-select">
                        <option value="">-- Chọn GPU --</option>
                        <option v-for="gpu in gpus" :key="gpu.id" :value="gpu.id">{{ gpu.ten_gpu }}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Loại màn hình</label>
                    <select v-model="form.loai_man_hinh_id" class="form-select">
                        <option value="">-- Chọn loại màn hình --</option>
                        <option v-for="mh in manHinhs" :key="mh.id" :value="mh.id">{{ mh.kich_thuoc }}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Pin</label>
                    <select v-model="form.pin_id" class="form-select">
                        <option value="">-- Chọn pin --</option>
                        <option v-for="pin in pins" :key="pin.id" :value="pin.id">{{ pin.dung_luong_pin }}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Màu sắc</label>
                    <select v-model="form.mau_sac_id" class="form-select">
                        <option value="">-- Chọn màu --</option>
                        <option v-for="mau in mauSacs" :key="mau.id" :value="mau.id">{{ mau.ten_mau }}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Giá bán</label>
                    <input v-model="form.gia_ban" type="number" class="form-control" />
                </div>
                <div class="col-md-12">
                    <label class="form-label">Ghi chú</label>
                    <textarea v-model="form.ghi_chu" class="form-control" rows="2"></textarea>
                </div>
                <div class="col-md-12 d-flex align-items-center">
                    <label class="form-label me-2 mb-0">Trạng thái</label>
                    <input type="checkbox" v-model="form.ctsp_trang_thai" class="form-check-input me-2" /> Hoạt động
                </div>
            </div>
            <hr />
            <h5 class="mt-4">Thêm Ảnh Sản Phẩm</h5>
            <div class="row g-3 mb-3">
                <div class="col-12">
                    <ProductImageUpload @uploaded="handleImageUpload" />
                </div>
            </div>
            <div class="row g-3">
                <div v-for="(img, idx) in form.images" :key="img.id || idx" class="col-md-3 col-6 mb-3">
                    <ProductImageItem :img="img" :isDefault="img.is_default" @remove="removeImage(idx)"
                        @setDefault="setDefault(idx)" />
                </div>
            </div>
            <button class="btn btn-success mt-4 me-2" type="submit">Lưu sản phẩm</button>
            <button class="btn btn-success mt-4" type="button" @click="goBack">Quay lại</button>
        </form>
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProductImageUpload from '@/components/sanpham/anhsanpham/ProductImageUpload.vue'
import ProductImageItem from '@/components/sanpham/anhsanpham/ProductImageItem.vue'
// Giả lập API lấy danh sách, bạn thay bằng API thực tế
const brands = ref([])
const cpus = ref([])
const rams = ref([])
const oCungs = ref([])
const gpus = ref([])
const manHinhs = ref([])
const pins = ref([])
const mauSacs = ref([])
const errorMessage = ref('')
const router = useRouter()

const form = ref({
    ma_san_pham: '',
    ten_san_pham: '',
    hang_id: '',
    cpu_id: '',
    mo_ta: '',
    trang_thai: true,
    ma_ctsp: '',
    ram_id: '',
    o_cung_id: '',
    gpu_id: '',
    loai_man_hinh_id: '',
    pin_id: '',
    mau_sac_id: '',
    gia_ban: '',
    ghi_chu: '',
    ctsp_trang_thai: true,
    images: [], // Thêm mảng ảnh
})

onMounted(async () => {
    // TODO: Gọi API thực tế lấy danh sách các thuộc tính
    // Ví dụ:
    // brands.value = await api.getBrands()
    // cpus.value = await api.getCpus()
    // ...
})

function goBack() {
    router.push('/quan-li-san-pham')
}

async function handleSubmit() {
    errorMessage.value = ''
    try {
        // TODO: Gọi API/store để lưu sản phẩm và chi tiết sản phẩm
        // await api.createProduct(form.value)
        // await api.createProductDetail(form.value)
        // Sau khi lưu thành công:
        goBack()
    } catch (err) {
        errorMessage.value = 'Có lỗi xảy ra khi lưu sản phẩm!'
    }
}

form.value.images = form.value.images || []

function handleImageUpload(img) {
    form.value.images.push({ ...img, id: Date.now() + Math.random(), is_default: form.value.images.length === 0 })
}
function removeImage(idx) {
    const wasDefault = form.value.images[idx].is_default
    form.value.images.splice(idx, 1)
    if (wasDefault && form.value.images.length > 0) {
        form.value.images[0].is_default = true
    }
}
function setDefault(idx) {
    form.value.images.forEach((img, i) => (img.is_default = i === idx))
}
</script>

<style scoped>
.container {
    max-width: 900px;
}

.form-label,
.form-control,
.form-select,
.btn {
    font-size: 0.95rem;
}

.btn-success,
.btn-secondary {
    background-color: #28a745 !important;
    border-color: #28a745 !important;
    color: #fff !important;
}

.btn-success:hover,
.btn-secondary:hover {
    background-color: #218838 !important;
    border-color: #1e7e34 !important;
}

h2,
h5 {
    font-size: 1.15rem;
}
</style>