<template>
  <div>
    <template v-if="!showForm">
      <div class="d-flex justify-content-between align-items-center mb-3">

        <div>
          <button class="btn btn-outline-primary me-2">Xuất Excel</button>
           <button class="btn btn-primary" @click="$emit('themMoi')">Thêm khách hàng</button>
        </div>
      </div>
      <!-- Các nội dung khác nếu có -->
    </template>
    <KhachHangFormDN v-else @close="showForm = false" />
  </div>
</template>

<script>
import KhachHangFormDN from './KhachHangFormDN.vue'

export default {
  components: { KhachHangFormDN },
  data() {
    return {
      showForm: false
    }
  }
}
</script>
