<template>
    <form class="row g-3 align-items-end mb-4">
        <div class="col-md-2">
            <label class="form-label">RAM</label>
            <select class="form-select">
                <option>8GB</option>
                <option>16GB</option>
                <option>+ Thêm RAM mới</option>
            </select>
        </div>
        <div class="col-md-2">
            <label class="form-label">Ổ cứng</label>
            <select class="form-select">
                <option>256GB SSD</option>
                <option>512GB SSD</option>
                <option>+ Thêm ổ cứng mới</option>
            </select>
        </div>
        <div class="col-md-2">
            <label class="form-label">Màu sắc</label>
            <select class="form-select">
                <option>Đen</option>
                <option>Bạc</option>
                <option>+ Thêm màu mới</option>
            </select>
        </div>
        <div class="col-md-2">
            <label class="form-label">Giá bán</label>
            <input class="form-control" type="number" placeholder="Giá bán" />
        </div>
        <div class="col-md-1">
            <label class="form-label">Số lượng</label>
            <input class="form-control" type="number" placeholder="Số lượng" />
        </div>
        <div class="col-md-1">
            <label class="form-label">Bảo hành (tháng)</label>
            <input class="form-control" type="number" placeholder="12" />
        </div>
        <div class="col-md-2">
            <button class="btn btn-success w-100">Thêm mới</button>
        </div>
    </form>
    <!-- Modal thêm nhanh thuộc tính (placeholder) -->
    <!-- ... -->
</template>
<style scoped>
.product-detail-form {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
}

.form-select,
.form-control {
    border: 1px solid #dee2e6;
    border-radius: 6px;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-select:focus,
.form-control:focus {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-success {
    background-color: #198754;
    border-color: #198754;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
}

.btn-success:hover {
    background-color: #157347;
    border-color: #146c43;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .row.g-3 {
        margin: 0;
    }
    
    .col-md-1,
    .col-md-2 {
        margin-bottom: 1rem;
    }
    
    .btn-success {
        margin-top: 1rem;
    }
}

/* Animation for form elements */
.form-select,
.form-control {
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

/* Hover effects for form elements */
.form-select:hover,
.form-control:hover {
    border-color: #adb5bd;
}

/* Custom styling for select options */
.form-select option {
    padding: 8px;
}

/* Loading state for button */
.btn-success:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}
</style>
