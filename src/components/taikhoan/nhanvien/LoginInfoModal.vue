<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog" @click.self="$emit('close')"
        @mousedown.self="$emit('close')">
        <div class="modal-dialog modal-dialog-centered" role="document" @click.stop>
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-check-circle-fill text-success"></i>
                        Tạo nhân viên thành công!
                    </h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <div class="success-message">
                        <p class="mb-4">Nhân viên đã được tạo thành công. Thông tin đăng nhập:</p>

                        <div class="login-info-card">
                            <div class="info-item">
                                <label class="info-label">
                                    <i class="bi bi-person-badge"></i>
                                    Tên đăng nhập
                                </label>
                                <div class="input-group">
                                    <input type="text" class="form-control" :value="loginInfo.tenDangNhap" readonly
                                        :id="'login-username'">
                                    <button class="btn btn-outline-secondary btn-sm" type="button"
                                        @click="copyToClipboard(loginInfo.tenDangNhap, 'login-username')"
                                        title="Copy tên đăng nhập">
                                        <i class="bi bi-clipboard"></i>
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div class="info-item">
                                <label class="info-label">
                                    <i class="bi bi-lock"></i>
                                    Mật khẩu
                                </label>
                                <div class="input-group">
                                    <input :type="showPassword ? 'text' : 'password'" class="form-control"
                                        :value="loginInfo.matKhau" readonly :id="'login-password'">
                                    <button class="btn btn-outline-secondary btn-sm" type="button"
                                        @click="togglePassword" :title="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
                                        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                    </button>
                                    <button class="btn btn-outline-primary btn-sm" type="button"
                                        @click="copyToClipboard(loginInfo.matKhau, 'login-password')"
                                        title="Copy mật khẩu">
                                        <i class="bi bi-clipboard"></i>
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="alert alert-warning mt-3">
                            <i class="bi bi-exclamation-triangle"></i>
                            <strong>Lưu ý:</strong> Vui lòng lưu lại thông tin đăng nhập này. Nhân viên có thể sử dụng
                            thông tin này để đăng nhập vào hệ thống.
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="$emit('close')">
                        <i class="bi bi-check-circle"></i>
                        Đã hiểu
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    loginInfo: {
        type: Object,
        required: true,
        default: () => ({
            tenDangNhap: '',
            matKhau: ''
        })
    }
})

const emit = defineEmits(['close'])

const showPassword = ref(false)

function togglePassword() {
    showPassword.value = !showPassword.value
}

async function copyToClipboard(text, inputId) {
    if (!text) {
        alert('Không có dữ liệu để copy')
        return
    }

    try {
        await navigator.clipboard.writeText(text)
        const input = document.getElementById(inputId)
        if (input) {
            input.select()
            input.setSelectionRange(0, 99999)
        }
        alert('Đã copy vào clipboard!')
    } catch (err) {
        console.error('Lỗi copy:', err)
        const input = document.getElementById(inputId)
        if (input) {
            input.select()
            input.setSelectionRange(0, 99999)
            alert('Vui lòng copy thủ công (Ctrl+C)')
        }
    }
}
</script>

<style scoped>
.modal {
    background: rgba(0, 0, 0, 0.5);
    z-index: 1050;
}

.modal-content {
    border-radius: 16px;
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
    background: linear-gradient(135deg, #2D7458 0%, #396E7C 100%);
    color: #fff;
    border-radius: 16px 16px 0 0;
    padding: 20px 24px;
    border-bottom: none;
}

.modal-title {
    font-weight: 700;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.modal-title i {
    font-size: 1.5rem;
}

.modal-body {
    padding: 24px;
}

.success-message {
    text-align: center;
}

.success-message p {
    font-size: 1.1rem;
    color: #374151;
    font-weight: 500;
}

.login-info-card {
    background: #f9fafb;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    border: 2px solid #e5e7eb;
}

.info-item {
    margin-bottom: 20px;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2D7458;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-label i {
    font-size: 1.1rem;
}

.input-group {
    display: flex;
    gap: 8px;
}

.input-group .form-control {
    flex: 1;
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    padding: 10px 14px;
    font-size: 0.95rem;
    background: #fff;
}

.input-group .btn {
    border-radius: 8px;
    padding: 10px 14px;
    font-weight: 600;
    white-space: nowrap;
    font-size: 0.875rem;
}

.alert {
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.alert i {
    font-size: 1.2rem;
}

.modal-footer {
    border-top: 1px solid #e9ecef;
    padding: 16px 24px;
}

.btn {
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 8px;
    font-weight: 600;
    padding: 8px 16px;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #2D7458 0%, #396E7C 100%);
    color: #fff;
    border: none;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #25634d 0%, #2d5a6b 100%);
    transform: translateY(-1px);
}
</style>
