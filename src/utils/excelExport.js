/**
 * Utility để xuất dữ liệu ra Excel với định dạng đẹp và auto-fit cột
 */
import * as XLSX from 'xlsx'

export class ExcelExporter {
  /**
   * Xuất dữ liệu khách hàng ra Excel
   * @param {Array} customers - Danh sách khách hàng
   * @param {string} filename - Tên file xuất ra
   */
  static exportCustomers(customers, filename = 'Danh_Sach_Khach_Hang.xlsx') {
    try {
      // Tạo dữ liệu Excel
      const excelData = this.prepareCustomerData(customers)

      // Tạo workbook với thư viện XLSX
      const workbook = this.createWorkbook(excelData.headers, excelData.rows)

      // Download file
      this.downloadExcelFile(workbook, filename)

      return true
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error)
      throw error
    }
  }

  /**
   * Chuẩn bị dữ liệu khách hàng cho Excel
   */
  static prepareCustomerData(customers) {
    const headers = [
      'STT',
      'Mã Khách Hàng',
      'Họ và Tên',
      'Số Điện Thoại',
      'Email',
      'Ngày Sinh',
      'Giới Tính',
      'Trạng Thái',
      'Ngày Tạo',
    ]

    const rows = customers.map((customer, index) => [
      index + 1,
      customer.maKhachHang || '',
      customer.hoTen || '',
      customer.soDienThoai || '',
      customer.email || '',
      this.formatDate(customer.ngaySinh),
      customer.gioiTinh === 1 ? 'Nam' : 'Nữ',
      customer.trangThai === 1 ? 'Hoạt động' : 'Không hoạt động',
      this.formatDate(customer.createdAt || customer.ngayTao),
    ])

    return { headers, rows }
  }

  /**
   * Tạo workbook Excel với thư viện XLSX
   */
  static createWorkbook(headers, rows) {
    // Tạo worksheet data
    const worksheetData = [headers, ...rows]

    // Tạo worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Tính toán độ rộng cột
    const columnWidths = this.calculateColumnWidths(headers, rows)

    // Thiết lập độ rộng cột
    worksheet['!cols'] = columnWidths.map((width) => ({ wch: width / 8 }))

    // Thiết lập style cho header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'])
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4CAF50' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      }
    }

    // Thiết lập style cho data rows
    for (let row = 1; row <= headerRange.e.r; row++) {
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        if (!worksheet[cellAddress]) continue

        // Thiết lập alignment dựa trên loại cột
        let alignment = { horizontal: 'left', vertical: 'center' }
        if (col === 0 || col === 5 || col === 6 || col === 7 || col === 8) {
          alignment.horizontal = 'center' // STT, Ngày sinh, Giới tính, Trạng thái, Ngày tạo
        }

        worksheet[cellAddress].s = {
          alignment,
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        }
      }
    }

    // Tạo workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Khách Hàng')

    return workbook
  }

  /**
   * Tính toán độ rộng cột dựa trên nội dung
   */
  static calculateColumnWidths(headers, rows) {
    const widths = []

    headers.forEach((header, index) => {
      let maxWidth = header.length * 8 // Ước tính độ rộng header

      // Kiểm tra độ rộng của dữ liệu trong cột
      rows.forEach((row) => {
        const cellValue = String(row[index] || '')
        const cellWidth = cellValue.length * 8
        maxWidth = Math.max(maxWidth, cellWidth)
      })

      // Đặt giới hạn min/max cho độ rộng cột
      maxWidth = Math.max(60, Math.min(maxWidth, 200))
      widths.push(maxWidth)
    })

    return widths
  }

  /**
   * Format ngày tháng
   */
  static formatDate(dateStr) {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('vi-VN')
    } catch {
      return ''
    }
  }

  /**
   * Download file Excel
   */
  static downloadExcelFile(workbook, filename) {
    // Xuất workbook thành file Excel
    XLSX.writeFile(workbook, filename)
  }
}

export default ExcelExporter
