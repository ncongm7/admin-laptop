<template>
    <div class="product-detail-table bg-white p-3 rounded shadow-sm">
        <h5 class="mb-3"><i class="bi bi-list-ul"></i> Danh Sách Phiên Bản Cấu Hình (SKU)</h5>
        <table class="table table-hover align-middle">
            <thead>
                <tr>
                    <th>RAM</th>
                    <th>Ổ cứng</th>
                    <th>Màu sắc</th>
                    <th>Giá bán</th>
                    <th>Số lượng</th>
                    <th>Bảo hành</th>
                    <th>Trạng thái</th>
                    <th>IMEI</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>8GB</td>
                    <td>256GB SSD</td>
                    <td>Đen</td>
                    <td>15.000.000 đ</td>
                    <td>10</td>
                    <td>12</td>
                    <td><span class="badge bg-success">Còn hàng</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary">Xem IMEI</button>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
                <!-- ... -->
            </tbody>
        </table>
    </div>
</template>
<style scoped>
.product-detail-table {
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
}

.product-detail-table:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.table {
    margin-bottom: 0;
}

.table th {
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
    font-weight: 600;
    color: #495057;
    padding: 12px 8px;
    font-size: 0.9rem;
}

.table td {
    padding: 12px 8px;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
}

.table tbody tr {
    transition: background-color 0.2s ease;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
}

.badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
}

.btn-outline-primary {
    color: #0d6efd;
    border-color: #0d6efd;
    transition: all 0.2s ease;
}

.btn-outline-primary:hover {
    background-color: #0d6efd;
    border-color: #0d6efd;
    transform: translateY(-1px);
}

.btn-outline-secondary {
    color: #6c757d;
    border-color: #6c757d;
    transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
    background-color: #6c757d;
    border-color: #6c757d;
    transform: translateY(-1px);
}

.btn-outline-danger {
    color: #dc3545;
    border-color: #dc3545;
    transition: all 0.2s ease;
}

.btn-outline-danger:hover {
    background-color: #dc3545;
    border-color: #dc3545;
    transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .table {
        font-size: 0.875rem;
    }
    
    .table th,
    .table td {
        padding: 8px 4px;
    }
    
    .btn-sm {
        padding: 0.2rem 0.4rem;
        font-size: 0.8rem;
    }
    
    .badge {
        font-size: 0.7rem;
        padding: 0.25rem 0.5rem;
    }
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

/* Custom scrollbar for table container */
.product-detail-table {
    overflow-x: auto;
}

.product-detail-table::-webkit-scrollbar {
    height: 6px;
}

.product-detail-table::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.product-detail-table::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.product-detail-table::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
