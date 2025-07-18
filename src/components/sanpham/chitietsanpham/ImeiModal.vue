<template>
    <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.2)">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Quản lý IMEI cho SKU</h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>IMEI</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>123456789012345</td>
                                <td><span class="badge bg-success">Còn hàng</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-danger">Xóa</button>
                                </td>
                            </tr>
                            <!-- ... -->
                        </tbody>
                    </table>
                    <button class="btn btn-success">Thêm IMEI</button>
                </div>
            </div>
        </div>
    </div>

</template>
<script>
export default {
    name: 'ImeiModal',
    emits: ['close']
}
</script>

<style scoped>
.modal {
    z-index: 1050;
}

.modal-dialog {
    max-width: 800px;
}

.modal-content {
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom: none;
    border-radius: 12px 12px 0 0;
    padding: 1.5rem;
}

.modal-title {
    font-weight: 600;
    margin: 0;
}

.btn-close {
    filter: invert(1);
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.btn-close:hover {
    opacity: 1;
}

.modal-body {
    padding: 2rem;
    background: #f8f9fa;
}

.table {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
}

.table thead th {
    background: #e9ecef;
    border: none;
    padding: 1rem;
    font-weight: 600;
    color: #495057;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}

.table tbody td {
    padding: 1rem;
    border: none;
    border-bottom: 1px solid #f1f3f4;
    vertical-align: middle;
}

.table tbody tr:hover {
    background: #f8f9fa;
    transform: translateY(-1px);
    transition: all 0.2s ease;
}

.badge {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 500;
    border-radius: 20px;
}

.badge.bg-success {
    background: linear-gradient(45deg, #28a745, #20c997) !important;
}

.btn {
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
}

.btn-outline-danger {
    border-color: #dc3545;
    color: #dc3545;
}

.btn-outline-danger:hover {
    background: #dc3545;
    border-color: #dc3545;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.btn-success {
    background: linear-gradient(45deg, #28a745, #20c997);
    border: none;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.btn-success:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
    background: linear-gradient(45deg, #218838, #1e7e34);
}

/* Responsive design */
@media (max-width: 768px) {
    .modal-dialog {
        margin: 1rem;
        max-width: calc(100% - 2rem);
    }

    .modal-body {
        padding: 1rem;
    }

    .table {
        font-size: 0.9rem;
    }

    .table thead th,
    .table tbody td {
        padding: 0.75rem 0.5rem;
    }

    .btn-sm {
        padding: 0.3rem 0.6rem;
        font-size: 0.8rem;
    }
}

/* Custom scrollbar for modal body */
.modal-body {
    max-height: 70vh;
    overflow-y: auto;
}

.modal-body::-webkit-scrollbar {
    width: 6px;
}

.modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* Animation for table rows */
.table tbody tr {
    animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Loading state for buttons */
.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Focus states */
.btn:focus,
.form-control:focus {
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    border-color: #667eea;
}
</style>
