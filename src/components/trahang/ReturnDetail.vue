<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            Chi tiết yêu cầu trả hàng
            <span class="text-warning ms-1">
              {{
                returnRequest.maYeuCau ||
                (returnRequest.id
                  ? `#${String(returnRequest.id).substring(0, 8).toUpperCase()}`
                  : '')
              }}
            </span>
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body return-modal-body">
          <div class="row">
            <!-- Thông tin chính -->
            <div class="col-md-8">
              <div class="card card-soft mb-4">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h6 class="section-title">Thông tin đơn hàng</h6>
                      <div class="mb-3">
                        <label class="form-label">Mã đơn hàng</label>
                        <p v-if="returnRequest.idHoaDon">
                          <router-link :to="`/orders/${returnRequest.idHoaDon}`">
                            {{ returnRequest.maHoaDon || `#${returnRequest.idHoaDon}` }}
                          </router-link>
                        </p>
                        <p v-else>Không xác định</p>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Ngày mua</label>
                        <p>{{ formatDate(returnRequest.ngayMua) }}</p>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Tổng giá trị</label>
                        <p>{{ formatCurrency(displayTotalValue) }}</p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <h6 class="section-title">Thông tin khách hàng</h6>
                      <div class="d-flex align-items-center mb-3">
                        <img
                          :src="returnRequest.customerAvatar || defaultAvatar"
                          class="rounded-circle me-3"
                          width="50"
                          height="50"
                        />
                        <div>
                          <h5 class="mb-0">{{ returnRequest.customerName }}</h5>
                          <p class="text-muted mb-0">{{ returnRequest.customerPhone || '—' }}</p>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Loại yêu cầu</label>
                        <p>{{ returnRequest.loaiYeuCauDisplay || 'Chưa xác định' }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3">
                    <h6 class="section-title">Lý do trả hàng</h6>
                    <div class="reason-box p-3 bg-light rounded">
                      {{ returnRequest.lyDoTraHang }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Danh sách sản phẩm trả -->
              <div class="card card-soft">
                <div
                  class="card-header card-header-soft d-flex justify-content-between align-items-center"
                >
                  <h5 class="mb-0">Sản phẩm trả hàng</h5>
                  <span class="badge bg-primary"> {{ productItems.length }} sản phẩm </span>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>IMEI/SKU</th>
                          <th>Số lượng</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền</th>
                          <th>Tình trạng</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in productItems" :key="item.id">
                          <td>
                            <div class="d-flex align-items-center">
                              <img
                                :src="defaultProductImage"
                                class="rounded me-2"
                                width="40"
                                height="40"
                              />
                              <div>
                                <strong>{{ item.tenSanPham || 'Chưa rõ tên' }}</strong>
                                <div class="text-muted small">{{ item.maCtsp || 'N/A' }}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="badge bg-secondary">
                              {{ item.idSerialDaBan || 'N/A' }}
                            </span>
                          </td>
                          <td>{{ item.soLuong }}</td>
                          <td>{{ formatCurrency(item.donGia) }}</td>
                          <td>
                            {{ formatCurrency(item.thanhTien || item.soLuong * item.donGia) }}
                          </td>
                          <td>
                            <span class="badge" :class="conditionBadgeClass(item.tinhTrangLucTra)">
                              {{ item.tinhTrangLucTra || 'Chưa kiểm tra' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="d-flex justify-content-end mt-3" v-if="productItems.length">
                    <div class="total-box p-3 bg-light rounded">
                      <div class="d-flex justify-content-between">
                        <strong>Tổng giá trị trả:</strong>
                        <strong class="text-danger">
                          {{ formatCurrency(displayTotalValue) }}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Thông tin xử lý -->
            <div class="col-md-4">
              <div class="card card-soft mb-4">
                <div class="card-header card-header-soft">
                  <h5 class="mb-0">Trạng thái xử lý</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Trạng thái hiện tại</label>
                    <p>
                      <span class="badge" :class="statusBadgeClass(returnRequest.trangThai)">
                        {{ returnStatusText(returnRequest.trangThai) }}
                      </span>
                    </p>
                  </div>

                  <div class="mb-3" v-if="returnRequest.tenNhanVienXuLy">
                    <label class="form-label">Người xử lý</label>
                    <p class="mb-0">{{ returnRequest.tenNhanVienXuLy }}</p>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Ngày tạo yêu cầu</label>
                    <p>{{ formatDateTime(returnRequest.ngayTao) }}</p>
                  </div>

                  <div class="mb-3" v-if="returnRequest.ngayDuyet">
                    <label class="form-label">Ngày duyệt</label>
                    <p>{{ formatDateTime(returnRequest.ngayDuyet) }}</p>
                  </div>

                  <div class="mb-3" v-if="returnRequest.ngayHoanTat">
                    <label class="form-label">Ngày hoàn tất</label>
                    <p>{{ formatDateTime(returnRequest.ngayHoanTat) }}</p>
                  </div>
                </div>
              </div>

              <!-- Lịch sử xử lý -->
              <ReturnTimeline :returnId="returnRequest.id" />

              <!-- Action buttons -->
              <div class="card card-soft mt-4">
                <div class="card-body">
                  <h5 class="card-title">Hành động</h5>
                  <div class="d-grid gap-2">
                    <button
                      class="btn btn-success"
                      v-if="normalizedStatus === 0"
                      @click="$emit('status-changed', { id: returnRequest.id, action: 'DA_DUYET' })"
                    >
                      <i class="bi bi-check-circle"></i> Duyệt yêu cầu
                    </button>
                    <button
                      class="btn btn-danger"
                      v-if="normalizedStatus === 0"
                      @click="$emit('status-changed', { id: returnRequest.id, action: 'TU_CHOI' })"
                    >
                      <i class="bi bi-x-circle"></i> Từ chối
                    </button>
                    <button
                      class="btn btn-primary"
                      v-if="normalizedStatus === 1"
                      @click="$emit('status-changed', { id: returnRequest.id, action: 'HOAN_TAT' })"
                    >
                      <i class="bi bi-check-all"></i> Hoàn tất
                    </button>
                    <button class="btn btn-outline-secondary" @click="$emit('close')">
                      <i class="bi bi-arrow-left"></i> Quay lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters'
import ReturnTimeline from './ReturnTimeline.vue'

const props = defineProps({
  returnRequest: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'status-changed'])

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
const defaultProductImage = 'https://via.placeholder.com/60x60?text=SP'

const productItems = computed(() => props.returnRequest?.chiTietList || [])

const displayTotalValue = computed(() => {
  if (productItems.value.length) {
    return productItems.value.reduce((sum, item) => {
      const quantity = Number(item.soLuong || 0)
      const unit = Number(item.donGia || 0)
      const line = Number(item.thanhTien || quantity * unit)
      return sum + line
    }, 0)
  }
  return Number(props.returnRequest?.soTienHoan || 0)
})

const normalizedStatus = computed(() => {
  const status = props.returnRequest?.trangThai
  if (typeof status === 'string' && !Number.isNaN(Number(status))) {
    return Number(status)
  }
  return status ?? null
})

const normalizeStatusValue = (status) => {
  if (typeof status === 'string') {
    const numeric = Number(status)
    if (!Number.isNaN(numeric)) return numeric
  }
  return status
}

const returnStatusText = (status) => {
  const statusMap = {
    0: 'Chờ duyệt',
    1: 'Đã duyệt',
    2: 'Từ chối',
    3: 'Hoàn tất',
  }
  const normalized = normalizeStatusValue(status)
  if (normalized in statusMap) return statusMap[normalized]
  const stringMap = {
    DANG_CHO_DUYET: 'Chờ duyệt',
    DA_DUYET: 'Đã duyệt',
    TU_CHOI: 'Từ chối',
    HOAN_TAT: 'Hoàn tất',
  }
  return stringMap[status] || 'Không xác định'
}

const statusBadgeClass = (status) => {
  const normalized = normalizeStatusValue(status)
  if (typeof normalized === 'number') {
    return {
      'bg-warning': normalized === 0,
      'bg-success': normalized === 1,
      'bg-danger': normalized === 2,
      'bg-secondary': normalized === 3,
    }
  }
  return {
    'bg-warning': status === 'DANG_CHO_DUYET',
    'bg-success': status === 'DA_DUYET',
    'bg-danger': status === 'TU_CHOI',
    'bg-secondary': status === 'HOAN_TAT',
  }
}

const conditionBadgeClass = (condition) => {
  if (!condition) return 'bg-light text-dark'

  const conditionLower = condition.toLowerCase()
  if (conditionLower.includes('tốt')) return 'bg-success'
  if (conditionLower.includes('hỏng')) return 'bg-danger'
  if (conditionLower.includes('trầy')) return 'bg-warning'
  return 'bg-info'
}
</script>

<style scoped>
.modal-content {
  border: none;
  border-radius: 10px;
}

.modal-header {
  padding: 15px 20px;
}

.modal-title {
  font-weight: 600;
}

.return-modal-body {
  padding: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f7f8fc 60%, #f1f3fa 100%);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #dee2e6;
}

.reason-box {
  background-color: #ffffff;
  border: 1px solid rgba(13, 110, 253, 0.15);
  border-radius: 12px;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.05);
}

.card-soft {
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
  background-color: #ffffff;
}

.card-header-soft {
  background-color: transparent;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.total-box {
  width: 300px;
  border-radius: 12px;
  border: 1px solid rgba(220, 53, 69, 0.15);
}

.badge {
  font-weight: 500;
  padding: 6px 10px;
  font-size: 0.8rem;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f1f5fd;
  font-weight: 600;
}

.btn {
  padding: 8px 16px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .total-box {
    width: 100%;
  }
}
</style>
