import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo workbook mới
const workbook = new ExcelJS.Workbook();

// ========== SHEET 1: USE CASE TỔNG QUÁT ==========
const wsGeneral = workbook.addWorksheet('Use Case Tổng Quát');

// Định nghĩa các use case tổng quát
const generalUseCases = [
    {
        mau: "UC-1",
        ten: "Quản lý sản phẩm",
        tacNhan: "Admin/Quản lý",
        moTa: "Thêm, sửa, xóa, tìm kiếm sản phẩm, quản lý biến thể, serial/IMEI"
    },
    {
        mau: "UC-2",
        ten: "Quản lý khách hàng",
        tacNhan: "Admin/Quản lý/Nhân viên",
        moTa: "Thêm, sửa, xóa thông tin khách hàng, quản lý điểm tích lũy"
    },
    {
        mau: "UC-3",
        ten: "Quản lý nhân viên",
        tacNhan: "Admin/Quản lý",
        moTa: "Thêm, sửa, xóa nhân viên, quản lý tài khoản, phân quyền"
    },
    {
        mau: "UC-4",
        ten: "Quản lý hóa đơn",
        tacNhan: "Admin/Quản lý/Nhân viên",
        moTa: "Xem, tìm kiếm, cập nhật trạng thái hóa đơn, hủy hóa đơn"
    },
    {
        mau: "UC-5",
        ten: "Quản lý bảo hành",
        tacNhan: "Admin/Quản lý/Nhân viên",
        moTa: "Tạo, sửa, xóa yêu cầu bảo hành, cập nhật trạng thái bảo hành"
    },
    {
        mau: "UC-6",
        ten: "Quản lý trả hàng",
        tacNhan: "Admin/Quản lý/Nhân viên",
        moTa: "Tạo, sửa, xóa phiếu trả hàng, cập nhật trạng thái trả hàng"
    },
    {
        mau: "UC-7",
        ten: "Quản lý đơn điểm",
        tacNhan: "Admin/Quản lý/Nhân viên",
        moTa: "Tạo, sửa, xóa phiếu đổi điểm, cập nhật trạng thái đổi điểm"
    },
    {
        mau: "UC-8",
        ten: "Quản lý giảm giá",
        tacNhan: "Admin/Quản lý",
        moTa: "Tạo, sửa, xóa đợt giảm giá, voucher, quản lý sản phẩm trong đợt giảm giá"
    },
    {
        mau: "UC-9",
        ten: "Quản lý tài khoản",
        tacNhan: "Admin/Quản lý",
        moTa: "Quản lý tài khoản người dùng, thay đổi mật khẩu, phân quyền"
    },
    {
        mau: "UC-10",
        ten: "Quản lý giao hàng",
        tacNhan: "Admin/Quản lý/Nhân viên",
        moTa: "Quản lý phương thức giao hàng, theo dõi trạng thái giao hàng"
    },
    {
        mau: "UC-11",
        ten: "Quản lý thanh toán",
        tacNhan: "Admin/Quản lý/Nhân viên",
        moTa: "Quản lý phương thức thanh toán, xác nhận thanh toán, hoàn tiền"
    },
    {
        mau: "UC-12",
        ten: "Quản lý dashboard",
        tacNhan: "Admin/Quản lý",
        moTa: "Xem thống kê bán hàng, lợi nhuận, khách hàng, sản phẩm bán chạy"
    }
];

// ========== SHEET 2: USE CASE CHI TIẾT ==========
const detailedUseCases = [
    // Use case chi tiết cho Quản lý sản phẩm
    { mau: "UC-1.1", ten: "Thêm sản phẩm mới", tacNhan: "Admin/Quản lý", moTa: "Thêm sản phẩm mới vào hệ thống với thông tin cơ bản (tên, giá, mô tả, hình ảnh)" },
    { mau: "UC-1.2", ten: "Sửa thông tin sản phẩm", tacNhan: "Admin/Quản lý", moTa: "Cập nhật thông tin sản phẩm (tên, giá, mô tả, hình ảnh, trạng thái)" },
    { mau: "UC-1.3", ten: "Xóa sản phẩm", tacNhan: "Admin", moTa: "Xóa sản phẩm và các biến thể liên quan khỏi hệ thống" },
    { mau: "UC-1.4", ten: "Tìm kiếm sản phẩm", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Tìm kiếm sản phẩm theo tên, mã, loại, giá, trạng thái" },
    { mau: "UC-1.5", ten: "Quản lý biến thể sản phẩm", tacNhan: "Admin/Quản lý", moTa: "Thêm, sửa, xóa biến thể sản phẩm (CPU, RAM, Storage, GPU)" },
    { mau: "UC-1.6", ten: "Quản lý serial/IMEI", tacNhan: "Admin/Quản lý", moTa: "Import, quản lý, theo dõi serial/IMEI của từng biến thể sản phẩm" },
    
    // Use case chi tiết cho Quản lý khách hàng
    { mau: "UC-2.1", ten: "Thêm khách hàng mới", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Thêm khách hàng mới với thông tin cơ bản (tên, SĐT, email, địa chỉ)" },
    { mau: "UC-2.2", ten: "Sửa thông tin khách hàng", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Cập nhật thông tin khách hàng (tên, SĐT, email, địa chỉ, trạng thái)" },
    { mau: "UC-2.3", ten: "Xóa khách hàng", tacNhan: "Admin", moTa: "Xóa khách hàng khỏi hệ thống" },
    { mau: "UC-2.4", ten: "Tìm kiếm khách hàng", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Tìm kiếm khách hàng theo tên, SĐT, email, trạng thái" },
    { mau: "UC-2.5", ten: "Xem thông tin điểm tích lũy", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Xem điểm tích lũy, lịch sử sử dụng điểm của khách hàng" },
    
    // Use case chi tiết cho Quản lý nhân viên
    { mau: "UC-3.1", ten: "Thêm nhân viên mới", tacNhan: "Admin", moTa: "Thêm nhân viên mới với thông tin cơ bản (tên, email, SĐT, chức vụ, mật khẩu)" },
    { mau: "UC-3.2", ten: "Sửa thông tin nhân viên", tacNhan: "Admin/Quản lý", moTa: "Cập nhật thông tin nhân viên (tên, email, SĐT, chức vụ, trạng thái)" },
    { mau: "UC-3.3", ten: "Xóa nhân viên", tacNhan: "Admin", moTa: "Xóa nhân viên khỏi hệ thống" },
    { mau: "UC-3.4", ten: "Phân quyền nhân viên", tacNhan: "Admin", moTa: "Gán vai trò (Admin, Quản lý, Nhân viên, Thu ngân) cho nhân viên" },
    
    // Use case chi tiết cho Quản lý hóa đơn
    { mau: "UC-4.1", ten: "Xem danh sách hóa đơn", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Xem danh sách tất cả hóa đơn với lọc theo trạng thái, ngày, khách hàng" },
    { mau: "UC-4.2", ten: "Xem chi tiết hóa đơn", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Xem chi tiết hóa đơn bao gồm danh sách sản phẩm, khách hàng, thanh toán" },
    { mau: "UC-4.3", ten: "Cập nhật trạng thái hóa đơn", tacNhan: "Admin/Quản lý", moTa: "Cập nhật trạng thái hóa đơn (chờ xác nhận, đã xác nhận, đã giao, hủy)" },
    { mau: "UC-4.4", ten: "Hủy hóa đơn", tacNhan: "Admin/Quản lý", moTa: "Hủy hóa đơn và hoàn lại điểm/tiền cho khách hàng" },
    { mau: "UC-4.5", ten: "In hóa đơn", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "In hóa đơn để phát cho khách hàng" },
    
    // Use case chi tiết cho Quản lý bảo hành
    { mau: "UC-5.1", ten: "Tạo yêu cầu bảo hành", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Tạo yêu cầu bảo hành mới cho sản phẩm của khách hàng" },
    { mau: "UC-5.2", ten: "Sửa yêu cầu bảo hành", tacNhan: "Admin/Quản lý", moTa: "Cập nhật thông tin yêu cầu bảo hành (ngày bắt đầu, kết thúc, mô tả, trạng thái)" },
    { mau: "UC-5.3", ten: "Xóa yêu cầu bảo hành", tacNhan: "Admin", moTa: "Xóa yêu cầu bảo hành khỏi hệ thống" },
    { mau: "UC-5.4", ten: "Cập nhật trạng thái bảo hành", tacNhan: "Admin/Quản lý", moTa: "Cập nhật trạng thái bảo hành (đang chờ, đang xử lý, hoàn thành, hủy)" },
    
    // Use case chi tiết cho Quản lý trả hàng
    { mau: "UC-6.1", ten: "Tạo phiếu trả hàng", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Tạo phiếu trả hàng mới cho sản phẩm của khách hàng" },
    { mau: "UC-6.2", ten: "Sửa phiếu trả hàng", tacNhan: "Admin/Quản lý", moTa: "Cập nhật thông tin phiếu trả hàng (sản phẩm, lý do, trạng thái)" },
    { mau: "UC-6.3", ten: "Xóa phiếu trả hàng", tacNhan: "Admin", moTa: "Xóa phiếu trả hàng khỏi hệ thống" },
    { mau: "UC-6.4", ten: "Cập nhật trạng thái trả hàng", tacNhan: "Admin/Quản lý", moTa: "Cập nhật trạng thái trả hàng (chờ xác nhận, đã xác nhận, hoàn tiền, hủy)" },
    
    // Use case chi tiết cho Quản lý đơn điểm
    { mau: "UC-7.1", ten: "Tạo phiếu đổi điểm", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Tạo phiếu đổi điểm cho khách hàng" },
    { mau: "UC-7.2", ten: "Sửa phiếu đổi điểm", tacNhan: "Admin/Quản lý", moTa: "Cập nhật thông tin phiếu đổi điểm (số điểm, sản phẩm, trạng thái)" },
    { mau: "UC-7.3", ten: "Xóa phiếu đổi điểm", tacNhan: "Admin", moTa: "Xóa phiếu đổi điểm khỏi hệ thống" },
    { mau: "UC-7.4", ten: "Cập nhật trạng thái đổi điểm", tacNhan: "Admin/Quản lý", moTa: "Cập nhật trạng thái đổi điểm (chờ xác nhận, đã xác nhận, hoàn thành, hủy)" },
    
    // Use case chi tiết cho Quản lý giảm giá
    { mau: "UC-8.1", ten: "Tạo đợt giảm giá", tacNhan: "Admin/Quản lý", moTa: "Tạo đợt giảm giá mới với thông tin cơ bản (tên, mô tả, ngày bắt đầu, kết thúc)" },
    { mau: "UC-8.2", ten: "Sửa đợt giảm giá", tacNhan: "Admin/Quản lý", moTa: "Cập nhật thông tin đợt giảm giá (tên, mô tả, ngày, trạng thái)" },
    { mau: "UC-8.3", ten: "Xóa đợt giảm giá", tacNhan: "Admin", moTa: "Xóa đợt giảm giá khỏi hệ thống" },
    { mau: "UC-8.4", ten: "Thêm sản phẩm vào đợt giảm giá", tacNhan: "Admin/Quản lý", moTa: "Thêm sản phẩm vào đợt giảm giá với giá giảm" },
    { mau: "UC-8.5", ten: "Quản lý voucher", tacNhan: "Admin/Quản lý", moTa: "Tạo, sửa, xóa voucher giảm giá" },
    
    // Use case chi tiết cho Quản lý tài khoản
    { mau: "UC-9.1", ten: "Xem danh sách tài khoản", tacNhan: "Admin", moTa: "Xem danh sách tất cả tài khoản người dùng" },
    { mau: "UC-9.2", ten: "Xem chi tiết tài khoản", tacNhan: "Admin", moTa: "Xem chi tiết thông tin tài khoản người dùng" },
    { mau: "UC-9.3", ten: "Thay đổi mật khẩu", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Cho phép người dùng thay đổi mật khẩu của chính mình" },
    { mau: "UC-9.4", ten: "Cấp lại mật khẩu", tacNhan: "Admin", moTa: "Admin có thể cấp lại mật khẩu cho người dùng" },
    
    // Use case chi tiết cho Quản lý giao hàng
    { mau: "UC-10.1", ten: "Quản lý phương thức giao hàng", tacNhan: "Admin", moTa: "Tạo, sửa, xóa phương thức giao hàng (giao hàng nhanh, giao hàng tiêu chuẩn)" },
    { mau: "UC-10.2", ten: "Theo dõi trạng thái giao hàng", tacNhan: "Admin/Quản lý", moTa: "Theo dõi trạng thái giao hàng của đơn hàng" },
    
    // Use case chi tiết cho Quản lý thanh toán
    { mau: "UC-11.1", ten: "Quản lý phương thức thanh toán", tacNhan: "Admin", moTa: "Tạo, sửa, xóa phương thức thanh toán (tiền mặt, thẻ, QR code)" },
    { mau: "UC-11.2", ten: "Xác nhận thanh toán", tacNhan: "Admin/Quản lý/Nhân viên", moTa: "Xác nhận thanh toán cho hóa đơn" },
    { mau: "UC-11.3", ten: "Hoàn tiền", tacNhan: "Admin/Quản lý", moTa: "Thực hiện hoàn tiền cho khách hàng khi có yêu cầu" },
    
    // Use case chi tiết cho Quản lý dashboard
    { mau: "UC-12.1", ten: "Xem thống kê bán hàng", tacNhan: "Admin/Quản lý", moTa: "Xem thống kê bán hàng theo ngày, tuần, tháng, năm" },
    { mau: "UC-12.2", ten: "Xem thống kê lợi nhuận", tacNhan: "Admin/Quản lý", moTa: "Xem thống kê lợi nhuận theo sản phẩm, nhân viên, thời gian" },
    { mau: "UC-12.3", ten: "Xem thống kê khách hàng", tacNhan: "Admin/Quản lý", moTa: "Xem thống kê khách hàng mới, tổng số khách hàng, khách hàng hoạt động" },
    { mau: "UC-12.4", ten: "Xem sản phẩm bán chạy", tacNhan: "Admin/Quản lý", moTa: "Xem danh sách sản phẩm bán chạy nhất" }
];

// Hàm tạo sheet
function createSheet(worksheet, useCases, sheetName) {
    // Tạo header
    const headerRow = worksheet.addRow(['Mã Use Case', 'Tên Use Case', 'Tác Nhân', 'Mô Tả']);
    
    // Thiết lập kiểu dáng cho header
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF366092' }
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
            size: 11
        };
        cell.alignment = {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    // Thêm dữ liệu
    useCases.forEach((useCase) => {
        const row = worksheet.addRow([
            useCase.mau,
            useCase.ten,
            useCase.tacNhan,
            useCase.moTa
        ]);
        
        row.eachCell((cell) => {
            cell.alignment = {
                vertical: 'top',
                wrapText: true
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        
        row.height = 50;
    });
    
    // Thiết lập chiều rộng cột
    worksheet.columns = [
        { width: 15 },
        { width: 25 },
        { width: 25 },
        { width: 50 }
    ];
    
    // Thiết lập chiều cao dòng header
    worksheet.getRow(1).height = 30;
}

// Tạo sheets
createSheet(wsGeneral, generalUseCases, 'Use Case Tổng Quát');
createSheet(workbook.addWorksheet('Use Case Chi Tiết'), detailedUseCases, 'Use Case Chi Tiết');

// Lưu file
const outputPath = path.join('C:\\DATN', 'Use_Case_Analysis.xlsx');
workbook.xlsx.writeFile(outputPath).then(() => {
    console.log(`✅ File Excel đã được tạo thành công: ${outputPath}`);
    console.log(`📊 Sheet 1: Use Case Tổng Quát - ${generalUseCases.length} use cases`);
    console.log(`📊 Sheet 2: Use Case Chi Tiết - ${detailedUseCases.length} use cases`);
    process.exit(0);
}).catch((err) => {
    console.error('❌ Lỗi khi tạo file Excel:', err);
    process.exit(1);
});
