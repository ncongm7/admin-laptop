<template v-if="!showForm">
  <div class="d-flex justify-content-between align-items-center flex-wrap mb-3 gap-2">
    <div class="d-flex align-items-center gap-2 flex-grow-1">
      <input
        type="text"
        class="form-control"
        placeholder="Tên, SĐT, Email..."
        v-model="keyword"
        @keyup.enter="handleSearch"
      />
    </div>
    <div class="col-md-2">
      <button class="btn btn-secondary w-100" @click="handleSearch">Tìm kiếm</button>
    </div>
    <div class="col-md-1">
      <button class="btn btn-outline-secondary w-100" @click="resetSearch">Reset</button>
    </div>
    <div class="col-4"></div>
    <div class="d-flex align-items-center gap-2">
      <!-- <label class="form-check-label" for="checkIndeterminateDisabled">
        Nhân viên chăm sóc/Bán hàng
      </label> -->
      <select class="form-select form-select-sm" v-model="status">
        <option value="">Nhân viên chăm sóc/Bán hàng</option>
        <option value="new">Nhân Viên 1</option>
        <option value="contacted">Nhân Viên 2</option>
        <option value="not_contacted">Nhân Viên 3</option>
      </select>
    </div>
  </div>

  <!-- Bên trái: Nhóm radio -->
  <div class="d-flex justify-content-between align-items-center px-3 py-2 flex-wrap">
    <!-- Bên trái: Radio Trạng thái tài khoản -->
    <div class="d-flex align-items-center gap-2 flex-wrap">
      <label class="fw-bold mb-0 me-2">Tài khoản</label>

      <div class="form-check form-check-inline mb-0">
        <input
          class="form-check-input"
          type="radio"
          name="taiKhoan"
          id="tatCaTaiKhoan"
          value="all"
          v-model="taiKhoanFilter"
          @change="handleFilterChange"
        />
        <label class="form-check-label" for="tatCaTaiKhoan">Tất cả</label>
      </div>

      <div class="form-check form-check-inline mb-0">
        <input
          class="form-check-input"
          type="radio"
          name="taiKhoan"
          id="daCoTaiKhoan"
          value="has"
          v-model="taiKhoanFilter"
          @change="handleFilterChange"
        />
        <label class="form-check-label" for="daCoTaiKhoan">Đã có tài khoản</label>
      </div>

      <div class="form-check form-check-inline mb-0">
        <input
          class="form-check-input"
          type="radio"
          name="taiKhoan"
          id="chuaCoTaiKhoan"
          value="no"
          v-model="taiKhoanFilter"
          @change="handleFilterChange"
        />
        <label class="form-check-label" for="chuaCoTaiKhoan">Chưa có tài khoản</label>
      </div>
    </div>

    <!-- / Bên phải: Tổng số khách hàng -->
    <div class="text-end me-aotu" style="margin-right: 40px">
      <h6 class="text-muted">
        Tổng số khách hàng: <strong>{{ totalCustomers }}</strong>
      </h6>
    </div>
  </div>

  <!-- <KhachHangFormDN v-else @close="showForm = false" /> -->
</template>

<script>
import { useToast } from '@/composables/useToast'

export default {
  props: {
    totalCustomers: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      keyword: '',
      status: '',
      taiKhoanFilter: 'all', // 'all', 'has', 'no'
    }
  },
  created() {
    // Khởi tạo toast composable
    const { error: showError } = useToast()
    
    // Lưu vào this để sử dụng trong methods
    this.showError = showError
  },
  methods: {
    async handleSearch() {
      try {
        console.log('Tìm kiếm với keyword:', this.keyword)

        // Emit event để thông báo cho parent component
        this.$emit('search', {
          keyword: this.keyword,
          status: this.status,
          taiKhoanFilter: this.taiKhoanFilter,
        })
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tìm kiếm khách hàng'
        this.showError(errorMessage)
      }
    },
    
    handleFilterChange() {
      // Emit event khi filter thay đổi
      this.$emit('search', {
        keyword: this.keyword,
        status: this.status,
        taiKhoanFilter: this.taiKhoanFilter,
      })
    },

    // Reset tìm kiếm
    resetSearch() {
      this.keyword = ''
      this.status = ''
      this.taiKhoanFilter = 'all'
      this.$emit('search', {
        keyword: '',
        status: '',
        taiKhoanFilter: 'all',
      })
    },
  },
}
</script>
<style scoped>
.form-control {
  font-size: 0.9rem;
}
.form-select {
  font-size: 0.9rem;
}
.btn {
  font-size: 0.9rem;
}
.d-flex {
  font-size: 0.9rem;
}
</style>
