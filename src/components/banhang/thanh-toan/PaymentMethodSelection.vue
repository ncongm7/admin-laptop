<template>
  <div class="payment-method-section">
    <!-- Chọn phương thức thanh toán -->
    <div class="mb-3">
      <label class="form-label fw-semibold">
        Phương thức thanh toán <span class="text-danger">*</span>
      </label>

      <!-- Cảnh báo khi không có phương thức thanh toán -->
      <div v-if="filteredPaymentMethods.length === 0" class="alert alert-warning mb-2">
        <i class="bi bi-exclamation-triangle"></i>
        <strong>Chưa có phương thức thanh toán!</strong>
      </div>

      <select class="form-select" v-model="localFormData.idPhuongThucThanhToan"
        :disabled="isProcessing || filteredPaymentMethods.length === 0">
        <option value="">-- Chọn phương thức --</option>
        <option v-for="method in filteredPaymentMethods" :key="method.id" :value="method.id">
          {{ method.tenPhuongThuc }}
        </option>
      </select>
    </div>

    <!-- Số tiền khách đưa (chỉ hiện với tiền mặt) -->
    <div v-if="isTienMat" class="mb-3">
      <!-- Option COD (chỉ hiện khi có giao hàng) -->
      <div v-if="localFormData.canGiaoHang" class="mb-3 p-3 bg-light rounded border">
        <label class="form-label fw-semibold mb-2">
          <i class="bi bi-truck text-primary"></i> Phương thức thanh toán:
        </label>
        <div class="form-check mb-2">
          <input class="form-check-input" type="radio" name="paymentMethodCash" id="paymentAtCounter" value="counter"
            v-model="paymentMethodCashComputed" :disabled="isProcessing" />
          <label class="form-check-label" for="paymentAtCounter">
            <strong>Khách thanh toán tại quầy</strong>
          </label>
        </div>
        <!-- <div class="form-check">
          <input class="form-check-input" type="radio" name="paymentMethodCash" id="paymentCOD" value="cod"
            v-model="paymentMethodCashComputed" :disabled="isProcessing" />
          <label class="form-check-label" for="paymentCOD">
            <strong>Người nhận thanh toán khi nhận hàng (COD)</strong>
          </label>
        </div> -->
      </div>

      <!-- Input tiền khách đưa (chỉ hiện khi thanh toán tại quầy) -->
      <div v-if="!isCOD">
        <label class="form-label fw-semibold">
          Số tiền khách đưa
        </label>
        <input type="number" class="form-control" v-model.number="localTienKhachDua" :min="tongTien"
          :max="tongTien * 10" :step="1000" placeholder="Nhập số tiền khách đưa" :disabled="isProcessing"
          @blur="$emit('validate-cash')" />
        <div v-if="tienThua > 0" class="mt-2">
          <span class="text-success fw-bold">
            Tiền thừa trả khách: {{ formatCurrency(tienThua) }}
          </span>
        </div>
        <div v-if="localTienKhachDua > 0 && tienThua < 0" class="mt-2">
          <span class="text-danger">
            Số tiền chưa đủ: {{ formatCurrency(Math.abs(tienThua)) }}
          </span>
        </div>
      </div>

      <!-- Thông báo COD -->
      <div v-if="isCOD" class="alert alert-info mt-2">
        <i class="bi bi-info-circle me-2"></i>
        <strong>Hóa đơn sẽ được thanh toán khi giao hàng.</strong>
        <br>
        <small>Người nhận sẽ thanh toán bằng tiền mặt khi nhận hàng.</small>
      </div>
    </div>

    <!-- Mã giao dịch (cho chuyển khoản/thẻ) -->
    <div v-if="!isTienMat && localFormData.idPhuongThucThanhToan" class="mb-3">
      <label class="form-label fw-semibold">Mã giao dịch</label>
      <div class="input-group">
        <input type="text" class="form-control" v-model="localFormData.maGiaoDich"
          :placeholder="isQRPayment ? 'Mã giao dịch sẽ tự động cập nhật sau khi quét QR' : 'Nhập mã giao dịch (nếu có)'"
          :disabled="isProcessing || (isQRPayment && qrStatus !== 'confirmed')"
          :readonly="isQRPayment && qrStatus !== 'confirmed'" />
      </div>
      <small v-if="isQRPayment && !qrTransactionId" class="text-muted">
        <i class="bi bi-info-circle me-1"></i>
        Nhấn "Xác nhận thanh toán" để hiển thị mã QR và chờ khách hàng quét
      </small>
      <div v-if="qrTransactionId" class="alert alert-success alert-sm mt-2 mb-0">
        <i class="bi bi-check-circle-fill me-2"></i>
        Đã nhận thanh toán QR! Mã GD: <code>{{ qrTransactionId }}</code>
      </div>
    </div>

    <!-- Ghi chú -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Ghi chú</label>
      <textarea class="form-control" rows="2" v-model="localFormData.ghiChu" placeholder="Ghi chú thanh toán (nếu có)"
        :disabled="isProcessing"></textarea>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'


const props = defineProps({
  modelValue: { // formData
    type: Object,
    required: true
  },
  paymentMethods: {
    type: Array,
    default: () => []
  },
  filteredPaymentMethods: {
    type: Array,
    default: () => []
  },
  tongTien: {
    type: Number,
    default: 0
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  isTienMat: {
    type: Boolean,
    default: false
  },
  isCOD: {
    type: Boolean,
    default: false
  },
  isQRPayment: {
    type: Boolean,
    default: false
  },
  tienThua: {
    type: Number,
    default: 0
  },
  tienKhachDua: { // v-model:tienKhachDua
    type: Number,
    default: 0
  },
  paymentMethodCash: { // v-model:paymentMethodCash
    type: String,
    default: 'counter'
  },
  qrStatus: String,
  qrTransactionId: String,
  formatCurrencyFn: Function // Optional: pass formatCurrency function
})

const emit = defineEmits(['update:modelValue', 'update:tienKhachDua', 'update:paymentMethodCash', 'validate-cash'])

const localFormData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const localTienKhachDua = computed({
  get: () => props.tienKhachDua,
  set: (val) => emit('update:tienKhachDua', val)
})

const paymentMethodCashComputed = computed({
  get: () => props.paymentMethodCash,
  set: (val) => emit('update:paymentMethodCash', val)
})

const formatCurrency = (value) => {
    if (props.formatCurrencyFn) return props.formatCurrencyFn(value)
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

</script>

<style scoped>
.payment-method-section {
    width: 100%;
}
</style>
