<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Tạo Phiếu Bảo Hành (Offline)</h3>
        <button @click="close" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <!-- STEP 1: Search -->
        <div v-if="!selectedSerial" class="search-section">
          <div class="search-box">
            <input
              v-model="keyword"
              placeholder="Nhập số Serial hoặc SĐT khách hàng..."
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="btn-search" :disabled="loading">
              {{ loading ? 'Đang tìm...' : 'Tìm kiếm' }}
            </button>
          </div>

          <div v-if="searchResults.length > 0" class="results-table">
            <table>
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Sản phẩm</th>
                  <th>Khách hàng</th>
                  <th>Ngày bán</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in searchResults" :key="item.idSerial">
                  <td>{{ item.serialNo }}</td>
                  <td>{{ item.tenSanPham }}</td>
                  <td>
                    <div>{{ item.tenKhachHang }}</div>
                    <small>{{ item.sdtKhachHang }}</small>
                  </td>
                  <td>{{ formatDate(item.ngayBan) }}</td>
                  <td>
                    <button @click="selectSerial(item)" class="btn-select">Chọn</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="searched && !loading" class="no-results">
            Không tìm thấy kết quả nào.
          </div>
        </div>

        <!-- STEP 2: Create Form -->
        <div v-else class="create-form">
          <div class="selected-info">
            <div class="info-row">
              <strong>Sản phẩm:</strong> {{ selectedSerial.tenSanPham }} ({{ selectedSerial.serialNo }})
            </div>
            <div class="info-row">
              <strong>Khách hàng:</strong> {{ selectedSerial.tenKhachHang }} - {{ selectedSerial.sdtKhachHang }}
            </div>
            <button @click="resetSelection" class="btn-change">Chọn lại</button>
          </div>

          <div class="form-group">
            <label>Lý do bảo hành <span class="required">*</span></label>
            <textarea v-model="formData.lyDoTraHang" rows="2" placeholder="Nhập lý do..."></textarea>
          </div>

          <div class="form-group">
            <label>Tình trạng lúc nhận <span class="required">*</span></label>
            <input v-model="formData.tinhTrangLucTra" placeholder="Ví dụ: Trầy xước nhẹ, không lên nguồn..." />
          </div>

           <div class="form-group">
            <label>Mô tả chi tiết</label>
            <textarea v-model="formData.moTaTinhTrang" rows="2"></textarea>
          </div>

          <div class="form-group">
             <label>Hình ảnh (Tùy chọn)</label>
             <input type="file" multiple @change="handleFileUpload" accept="image/*" />
             <div class="preview-images" v-if="previewImages.length">
                <img v-for="(img, idx) in previewImages" :key="idx" :src="img" class="img-thumb" />
             </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn-cancel">Hủy</button>
        <button
          v-if="selectedSerial"
          @click="handleSubmit"
          class="btn-submit"
          :disabled="submitting || !isValidForm"
        >
          {{ submitting ? 'Đang xử lý...' : 'Tạo phiếu bảo hành' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import OfflineWarrantyService from '@/service/baohanh/OfflineWarrantyService';
import baohanhService from '@/service/baohanh/baohanhService';
import { useToast } from '@/composables/common/useToast';

export default {
  props: ['visible'],
  emits: ['close', 'created'],
  data() {
    return {
      keyword: '',
      loading: false,
      searchResults: [],
      searched: false,
      selectedSerial: null,

      // Form data
      formData: {
        lyDoTraHang: '',
        tinhTrangLucTra: '',
        moTaTinhTrang: '',
        files: []
      },
      previewImages: [],
      submitting: false
    };
  },
  computed: {
    isValidForm() {
      return this.formData.lyDoTraHang && this.formData.tinhTrangLucTra;
    }
  },
  methods: {
    async handleSearch() {
      if (!this.keyword.trim()) return;

      this.loading = true;
      this.searched = true;
      try {
        const response = await OfflineWarrantyService.searchSoldSerials(this.keyword);
        this.searchResults = response.data;
      } catch (error) {
        console.error(error);
        const toast = useToast();
        toast.error('Lỗi khi tìm kiếm serial');
      } finally {
        this.loading = false;
      }
    },
    selectSerial(item) {
      this.selectedSerial = item;
    },
    resetSelection() {
      this.selectedSerial = null;
      this.formData = {
        lyDoTraHang: '',
        tinhTrangLucTra: '',
        moTaTinhTrang: '',
        files: []
      };
      this.previewImages = [];
    },
    handleFileUpload(event) {
      const files = Array.from(event.target.files);
      this.formData.files = files;

      // Preview
      this.previewImages = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    },
    async handleSubmit() {
      if (!this.isValidForm) return;

      this.submitting = true;
      const toast = useToast();

      try {
        const payload = {
            idHoaDon: this.selectedSerial.idHoaDon,
            idKhachHang: this.selectedSerial.idKhachHang,
            idHoaDonChiTiet: this.selectedSerial.idHoaDonChiTiet,
            idSerialDaBan: this.selectedSerial.idSerialDaBan,
            lyDoTraHang: this.formData.lyDoTraHang,
            tinhTrangLucTra: this.formData.tinhTrangLucTra,
            moTaTinhTrang: this.formData.moTaTinhTrang,
            soLuong: 1, // Warranty by serial is always 1
            hinhAnh: this.formData.files
        };

        await baohanhService.taoYeuCau(payload);
        toast.success('Tạo phiếu bảo hành thành công!');
        this.$emit('created');
        this.close();
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi tạo phiếu bảo hành: ' + (error.response?.data?.message || error.message));
      } finally {
        this.submitting = false;
      }
    },
    close() {
      this.keyword = '';
      this.searchResults = [];
      this.searched = false;
      this.resetSelection();
      this.$emit('close');
    },
    formatDate(dateStr) {
        if(!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  width: 800px;
  max-width: 95%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-box input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.results-table table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th, .results-table td {
  padding: 8px;
  border: 1px solid #eee;
  text-align: left;
}

.selected-info {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preview-images {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.img-thumb {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-search, .btn-submit, .btn-select {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-search:disabled, .btn-submit:disabled {
    background: #ccc;
}

.btn-cancel, .btn-change {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
}

.required { color: red; }
</style>
