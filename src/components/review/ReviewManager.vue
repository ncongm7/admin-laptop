<template>
    <div class="container-fluid review-management">
        <!-- Statistics Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-icon bg-primary">
                        <i class="bi bi-star-fill"></i>
                    </div>
                    <div class="stats-info">
                        <h3>{{ stats.total || 0 }}</h3>
                        <p>Tổng đánh giá</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-icon bg-warning">
                        <i class="bi bi-clock-history"></i>
                    </div>
                    <div class="stats-info">
                        <h3>{{ stats.pending || 0 }}</h3>
                        <p>Chờ duyệt</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-icon bg-success">
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <div class="stats-info">
                        <h3>{{ stats.approved || 0 }}</h3>
                        <p>Đã duyệt</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-icon bg-info">
                        <i class="bi bi-star-half"></i>
                    </div>
                    <div class="stats-info">
                        <h3>{{ stats.averageRating?.toFixed(1) || '0.0' }}</h3>
                        <p>Rating trung bình</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters & Actions -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row align-items-end">
                    <div class="col-md-3">
                        <label class="form-label">Trạng thái</label>
                        <select v-model="filters.status" class="form-select" @change="loadReviews">
                            <option :value="null">Tất cả</option>
                            <option :value="0">Chờ duyệt</option>
                            <option :value="1">Đã duyệt</option>
                            <option :value="2">Từ chối</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Số sao</label>
                        <select v-model="filters.rating" class="form-select" @change="loadReviews">
                            <option :value="null">Tất cả</option>
                            <option :value="5">5 sao</option>
                            <option :value="4">4 sao</option>
                            <option :value="3">3 sao</option>
                            <option :value="2">2 sao</option>
                            <option :value="1">1 sao</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Đã mua hàng</label>
                        <select v-model="filters.verified" class="form-select" @change="loadReviews">
                            <option :value="null">Tất cả</option>
                            <option :value="true">Đã mua</option>
                            <option :value="false">Chưa mua</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <button class="btn btn-primary w-100" @click="loadReviews" :disabled="loading">
                            <i class="bi bi-arrow-clockwise"></i> Làm mới
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reviews Table -->
        <div class="card">
            <div class="card-body">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                </div>

                <div v-else-if="reviews.length === 0" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-3">Không có đánh giá nào</p>
                </div>

                <div v-else>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th width="50">
                                        <input type="checkbox" v-model="selectAll" @change="toggleSelectAll"
                                            class="form-check-input">
                                    </th>
                                    <th>Khách hàng</th>
                                    <th>Sản phẩm</th>
                                    <th>Rating</th>
                                    <th>Nội dung</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày đánh giá</th>
                                    <th width="200">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="review in reviews" :key="review.id">
                                    <td>
                                        <input type="checkbox" :value="review.id" v-model="selectedReviews"
                                            class="form-check-input">
                                    </td>
                                    <td>
                                        {{ review.khachHang?.tenKhachHang || 'N/A' }}
                                        <span v-if="review.isVerifiedPurchase" class="badge bg-success ms-2">
                                            <i class="bi bi-patch-check-fill"></i> Đã mua
                                        </span>
                                    </td>
                                    <td>{{ review.reviewTitle || review.noiDung?.substring(0, 30) + '...' }}</td>
                                    <td>
                                        <div class="rating-stars">
                                            <span v-for="i in 5" :key="i"
                                                :class="i <= review.soSao ? 'text-warning' : 'text-muted'">
                                                ★
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="review-content-preview">{{ review.noiDung?.substring(0, 50) }}...
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge" :class="{
                                            'bg-warning': review.trangThaiDanhGia === 0,
                                            'bg-success': review.trangThaiDanhGia === 1,
                                            'bg-danger': review.trangThaiDanhGia === 2
                                        }">
                                            {{ getStatusText(review.trangThaiDanhGia) }}
                                        </span>
                                    </td>
                                    <td>{{ formatDate(review.ngayDanhGia) }}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-primary" @click="viewReview(review)"
                                                title="Xem chi tiết">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                            <button v-if="review.trangThaiDanhGia === 0" class="btn btn-outline-success"
                                                @click="approveReview(review.id)" title="Duyệt">
                                                <i class="bi bi-check-lg"></i>
                                            </button>
                                            <button v-if="review.trangThaiDanhGia === 0" class="btn btn-outline-danger"
                                                @click="rejectReview(review.id)" title="Từ chối">
                                                <i class="bi bi-x-lg"></i>
                                            </button>
                                            <button class="btn btn-outline-info" @click="openReplyModal(review)"
                                                title="Phản hồi">
                                                <i class="bi bi-reply-fill"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Bulk Actions -->
                    <div v-if="selectedReviews.length > 0" class="mt-3">
                        <div class="alert alert-info d-flex align-items-center justify-content-between">
                            <span>Đã chọn {{ selectedReviews.length }} đánh giá</span>
                            <div class="btn-group">
                                <button class="btn btn-success btn-sm" @click="bulkApprove">
                                    <i class="bi bi-check-lg"></i> Duyệt tất cả
                                </button>
                                <button class="btn btn-danger btn-sm" @click="bulkReject">
                                    <i class="bi bi-x-lg"></i> Từ chối tất cả
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const reviews = ref([])
const stats = ref({})
const selectedReviews = ref([])
const selectAll = ref(false)

const filters = ref({
    status: null,
    rating: null,
    verified: null
})

const loadReviews = async () => {
    loading.value = true
    try {
        const params = new URLSearchParams()
        if (filters.value.status !== null) params.append('status', filters.value.status)
        if (filters.value.rating !== null) params.append('rating', filters.value.rating)
        if (filters.value.verified !== null) params.append('verified', filters.value.verified)

        const response = await axios.get(`http://localhost:8080/api/admin/reviews?${params.toString()}`)
        reviews.value = response.data.data.content || []
    } catch (error) {
        console.error('Error loading reviews:', error)
        alert('Không thể tải đánh giá')
    } finally {
        loading.value = false
    }
}

const loadStats = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/admin/reviews/statistics')
        stats.value = response.data.data || {}
    } catch (error) {
        console.error('Error loading stats:', error)
    }
}

const approveReview = async (reviewId) => {
    try {
        await axios.put(`http://localhost:8080/api/admin/reviews/${reviewId}/approve`)
        alert('Đã duyệt đánh giá thành công!')
        await loadReviews()
        await loadStats()
    } catch (error) {
        console.error('Error approving review:', error)
        alert('Không thể duyệt đánh giá')
    }
}

const rejectReview = async (reviewId) => {
    if (!confirm('Bạn có chắc muốn từ chối đánh giá này?')) return

    try {
        await axios.put(`http://localhost:8080/api/admin/reviews/${reviewId}/reject`)
        alert('Đã từ chối đánh giá!')
        await loadReviews()
        await loadStats()
    } catch (error) {
        console.error('Error rejecting review:', error)
        alert('Không thể từ chối đánh giá')
    }
}

const bulkApprove = async () => {
    if (!confirm(`Duyệt ${selectedReviews.value.length} đánh giá?`)) return

    try {
        await axios.put('http://localhost:8080/api/admin/reviews/bulk-approve', selectedReviews.value)
        alert('Đã duyệt thành công!')
        selectedReviews.value = []
        selectAll.value = false
        await loadReviews()
        await loadStats()
    } catch (error) {
        console.error('Error bulk approving:', error)
        alert('Không thể duyệt hàng loạt')
    }
}

const bulkReject = async () => {
    if (!confirm(`Từ chối ${selectedReviews.value.length} đánh giá?`)) return

    try {
        await axios.put('http://localhost:8080/api/admin/reviews/bulk-reject', selectedReviews.value)
        alert('Đã từ chối thành công!')
        selectedReviews.value = []
        selectAll.value = false
        await loadReviews()
        await loadStats()
    } catch (error) {
        console.error('Error bulk rejecting:', error)
        alert('Không thể từ chối hàng loạt')
    }
}

const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedReviews.value = reviews.value.map(r => r.id)
    } else {
        selectedReviews.value = []
    }
}

const viewReview = (review) => {
    // TODO: Implement review detail modal
    console.log('View review:', review)
}

const openReplyModal = (review) => {
    const reply = prompt('Nhập phản hồi cho đánh giá này:')
    if (!reply) return

    // TODO: Implement reply functionality
    console.log('Reply to review:', review.id, reply)
}

const getStatusText = (status) => {
    const statusMap = {
        0: 'Chờ duyệt',
        1: 'Đã duyệt',
        2: 'Từ chối'
    }
    return statusMap[status] || 'N/A'
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
}

onMounted(() => {
    loadReviews()
    loadStats()
})
</script>

<style scoped>
.review-management {
    padding: 20px;
}

.stats-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
}

.stats-info h3 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
}

.stats-info p {
    margin: 0;
    color: #6c757d;
    font-size: 14px;
}

.rating-stars {
    font-size: 18px;
}

.review-content-preview {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>