<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Chi tiết người dùng</h5>
                    <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <!-- Thông tin cơ bản -->
                        <div class="col-md-4 text-center">
                            <img :src="user.avatar || '/images/default-avatar.jpg'" class="rounded-circle mb-3"
                                width="150" height="150">
                            <h4>{{ user.name }}</h4>
                            <p class="text-muted">{{ formatRole(user.role) }}</p>

                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary" @click="$emit('edit-user', user)">
                                    <i class="bi bi-pencil"></i> Chỉnh sửa
                                </button>
                                <button class="btn btn-outline-danger" @click="confirmToggleStatus">
                                    <i class="bi" :class="user.status ? 'bi-lock' : 'bi-unlock'"></i>
                                    {{ user.status ? 'Khóa tài khoản' : 'Mở khóa tài khoản' }}
                                </button>
                            </div>
                        </div>

                        <!-- Chi tiết -->
                        <div class="col-md-8">
                            <ul class="nav nav-tabs mb-4">
                                <li class="nav-item">
                                    <a class="nav-link active" data-bs-toggle="tab" href="#info">Thông tin</a>
                                </li>
                                <li class="nav-item" v-if="user.isStaff">
                                    <a class="nav-link" data-bs-toggle="tab" href="#staff-info">Nhân viên</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-bs-toggle="tab" href="#activity">Hoạt động</a>
                                </li>
                            </ul>

                            <div class="tab-content">
                                <!-- Tab Thông tin cơ bản -->
                                <div class="tab-pane fade show active" id="info">
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label text-muted">Email</label>
                                            <p>{{ user.email || 'N/A' }}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label text-muted">Số điện thoại</label>
                                            <p>{{ user.phone || 'N/A' }}</p>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label text-muted">Trạng thái</label>
                                            <p>
                                                <span class="badge" :class="user.status ? 'bg-success' : 'bg-danger'">
                                                    {{ user.status ? 'Hoạt động' : 'Bị khóa' }}
                                                </span>
                                            </p>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label text-muted">Ngày tạo</label>
                                            <p>{{ formatDate(user.created_at) }}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tab Thông tin nhân viên (nếu có) -->
                                <div class="tab-pane fade" id="staff-info" v-if="user.isStaff">
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label text-muted">Chức vụ</label>
                                            <p>{{ user.position || 'N/A' }}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label text-muted">Ngày sinh</label>
                                            <p>{{ user.birthday || 'N/A' }}</p>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-md-12">
                                            <label class="form-label text-muted">Địa chỉ</label>
                                            <p>{{ user.address || 'N/A' }}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tab Hoạt động -->
                                <div class="tab-pane fade" id="activity">
                                    <div class="row">
                                        <div class="col-md-6 mb-4">
                                            <div class="card">
                                                <div class="card-body">
                                                    <h5 class="card-title">Đơn hàng</h5>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <h2 class="mb-0">{{ user.orderCount || 0 }}</h2>
                                                        <i class="bi bi-cart3 fs-1 text-primary"></i>
                                                    </div>
                                                    <router-link to="#" class="small">Xem tất cả</router-link>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-6 mb-4">
                                            <div class="card">
                                                <div class="card-body">
                                                    <h5 class="card-title">Tổng chi tiêu</h5>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <h2 class="mb-0">{{ formatCurrency(user.totalSpent || 0) }}</h2>
                                                        <i class="bi bi-currency-dollar fs-1 text-success"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h5 class="mb-3">Đánh giá gần đây</h5>
                                    <div class="list-group">
                                        <div v-for="review in user.recentReviews" :key="review.id"
                                            class="list-group-item">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">{{ review.productName }}</h6>
                                                <small>{{ formatDate(review.created_at) }}</small>
                                            </div>
                                            <div class="mb-1">
                                                <i v-for="i in 5" :key="i" class="bi bi-star-fill"
                                                    :class="i <= review.rating ? 'text-warning' : 'text-muted'"></i>
                                            </div>
                                            <p class="mb-1">{{ review.comment }}</p>
                                        </div>
                                        <div v-if="!user.recentReviews || user.recentReviews.length === 0"
                                            class="text-center py-3 text-muted">
                                            Không có đánh giá nào
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// Fake user data for demo
const user = ref({
    avatar: '',
    name: 'Nguyễn Văn A',
    role: 'admin',
    status: true,
    email: 'nguyenvana@gmail.com',
    phone: '0987654321',
    created_at: '2024-01-15',
    isStaff: true,
    position: 'Quản lý',
    birthday: '1990-05-20',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    orderCount: 12,
    totalSpent: 15000000,
    recentReviews: [
        {
            id: 1,
            productName: 'iPhone 15 Pro Max',
            created_at: '2024-06-01',
            rating: 5,
            comment: 'Sản phẩm rất tốt!'
        },
        {
            id: 2,
            productName: 'Samsung Galaxy S24',
            created_at: '2024-05-20',
            rating: 4,
            comment: 'Khá hài lòng.'
        }
    ]
})

function formatRole(role) {
    switch (role) {
        case 'admin': return 'Quản trị viên';
        case 'staff': return 'Nhân viên';
        case 'customer': return 'Khách hàng';
        default: return role;
    }
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
}

function formatCurrency(val) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

function confirmToggleStatus() {
    // Fake confirm
    user.value.status = !user.value.status;
}
</script>