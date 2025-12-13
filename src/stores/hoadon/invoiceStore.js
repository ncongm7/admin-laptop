import { defineStore } from 'pinia'
import { ref } from 'vue'

const STATUS_NUMBER_MAP = {
  0: 'CHO_THANH_TOAN',
  1: 'DA_THANH_TOAN',
  2: 'DA_HUY',
  3: 'DANG_GIAO',
  4: 'HOAN_THANH',
}

const STEP_STATUS_MAP = {
  CHO_THANH_TOAN: 'pending',
  DA_THANH_TOAN: 'confirmed',
  DANG_GIAO: 'shipping',
  HOAN_THANH: 'done',
  DA_HUY: 'canceled',
}

function deriveBackendStatus(status) {
  if (typeof status === 'string' && status.length > 0) {
    return status
  }

  if (typeof status === 'number' && STATUS_NUMBER_MAP[status]) {
    return STATUS_NUMBER_MAP[status]
  }

  if (status && typeof status === 'object') {
    if (status.name && typeof status.name === 'string') {
      return status.name
    }
    if (status.code && typeof status.code === 'string') {
      return status.code
    }
  }

  return null
}

function buildPaymentHistory(rawInvoice, paymentMeta = {}) {
  const entries = []
  if (!rawInvoice && !paymentMeta) return entries

  const baseAmount = Number(
    paymentMeta.soTienThanhToan ?? rawInvoice?.tongTienSauGiam ?? rawInvoice?.tongTien ?? 0,
  )
  const staffName =
    paymentMeta.tenNhanVien || rawInvoice?.tenNhanVien || rawInvoice?.nhanVien?.hoTen || 'N/A'

  if (paymentMeta && paymentMeta.idPhuongThucThanhToan) {
    entries.push({
      method: paymentMeta.tenPhuongThucThanhToan || 'Thanh toán',
      amount: baseAmount,
      time: rawInvoice?.ngayThanhToan || new Date().toISOString(),
      staff: staffName,
    })
  } else if (rawInvoice?.trangThaiThanhToan === 1) {
    entries.push({
      method: 'Đã thanh toán',
      amount: baseAmount,
      time: rawInvoice?.ngayThanhToan || rawInvoice?.ngayTao,
      staff: staffName,
    })
  }

  return entries
}

function normalizeInvoice(rawInvoice, options = {}) {
  if (!rawInvoice) return null

  // Đã ở định dạng chuẩn
  if (rawInvoice.details && rawInvoice.customer && rawInvoice.code) {
    const normalized = {
      ...rawInvoice,
      backendStatus: rawInvoice.backendStatus || rawInvoice.status || null,
    }
    if (!normalized.status && normalized.backendStatus) {
      normalized.status = STEP_STATUS_MAP[normalized.backendStatus] || 'pending'
    }
    normalized._raw = rawInvoice._raw || rawInvoice
    return normalized
  }

  const backendStatus = deriveBackendStatus(rawInvoice.trangThai)
  const status = STEP_STATUS_MAP[backendStatus] || 'pending'
  const customerNameParts = []
  if (rawInvoice.tenKhachHang) {
    customerNameParts.push(rawInvoice.tenKhachHang)
  }
  if (rawInvoice.sdt) {
    customerNameParts.push(rawInvoice.sdt)
  }

  const detailsSource = rawInvoice.chiTietList || rawInvoice.details || []

  return {
    id: rawInvoice.id,
    code: rawInvoice.ma || rawInvoice.code || '',
    customer: {
      name: customerNameParts.length > 0 ? customerNameParts.join(' - ') : 'Khách lẻ',
      phone: rawInvoice.sdt || '',
      address: rawInvoice.diaChi || '',
    },
    type: rawInvoice.loaiHoaDon === 0 ? 'Tại quầy' : 'Online',
    createdBy: options.staffName || rawInvoice.tenNhanVien || rawInvoice.nhanVien?.hoTen || 'N/A',
    createdAt: rawInvoice.ngayTao,
    total: Number(rawInvoice.tongTienSauGiam ?? rawInvoice.tongTien ?? 0),
    status,
    backendStatus,
    note: rawInvoice.ghiChu || '',
    discount: Number(rawInvoice.tienDuocGiam ?? 0),
    tax: Number(rawInvoice.thue ?? rawInvoice.tax ?? 0),
    shippingFee: Number(rawInvoice.phiVanChuyen ?? rawInvoice.shippingFee ?? 0),
    payments: buildPaymentHistory(rawInvoice, options.payment),
    details: detailsSource.map((item) => ({
      sku: item.maChiTietSanPham || item.sku || '',
      name: item.tenSanPham || item.name || '',
      quantity: item.soLuong ?? item.quantity ?? 0,
      price: Number(item.donGia ?? item.price ?? 0),
      total:
        Number(item.thanhTien ?? item.total) ||
        Number(item.donGia ?? 0) * Number(item.soLuong ?? 0),
      image: item.anhSanPham || item.image || null,
    })),
    paymentsMeta: options.payment || null,
    _raw: rawInvoice,
  }
}

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref([
    {
      id: 1,
      code: 'HD0582',
      customer: { name: 'Lý Tiến Duy - 0961866385' },
      type: 'Tại quầy',
      createdBy: 'Nguyễn Văn A',
      createdAt: '2025-07-12T15:35',
      total: 605000,
      status: 'delivered',
      note: 'Khách lấy hàng tại quầy',
      payments: [
        {
          method: 'Tiền mặt',
          amount: 500000,
          time: '2025-07-12T15:35',
          staff: 'Nguyễn Văn A',
        },
        {
          method: 'Chuyển khoản',
          amount: 105000,
          time: '2025-07-12T16:00',
          staff: 'Nguyễn Văn A',
        },
      ],
      details: [
        {
          sku: 'IP15PM-256',
          name: 'iPhone 15 Pro Max',
          quantity: 1,
          price: 600000,
          total: 600000,
          image: 'https://via.placeholder.com/40x40?text=IP15',
        },
        {
          sku: 'OPL-001',
          name: 'Ốp lưng',
          quantity: 1,
          price: 5000,
          total: 5000,
          image: 'https://via.placeholder.com/40x40?text=OPL',
        },
      ],
      discount: 0,
      tax: 5000,
      shippingFee: 0,
      shippingAddress: '',
    },
    {
      id: 2,
      code: 'HD1760',
      customer: { name: 'Khách vãng lai - 0909123456' },
      type: 'Online',
      createdBy: 'Trần Thị B',
      createdAt: '2025-07-15T10:36',
      total: 499999,
      status: 'processing',
      note: '',
      payments: [],
      details: [
        {
          sku: 'SSG-S24',
          name: 'Samsung Galaxy S24',
          quantity: 1,
          price: 499999,
          total: 499999,
          image: 'https://via.placeholder.com/40x40?text=SSG',
        },
      ],
      discount: 0,
      tax: 0,
      shippingFee: 20000,
      shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
    },
    {
      id: 3,
      code: 'HD1579',
      customer: { name: 'Lý Tiến Duy - 0961866385' },
      type: 'Online',
      createdBy: 'Nguyễn Văn A',
      createdAt: '2025-07-12T10:41',
      total: 514000,
      status: 'confirmed',
      note: '',
      payments: [
        {
          method: 'Tiền mặt',
          amount: 514000,
          time: '2025-07-12T10:41',
          staff: 'Nguyễn Văn A',
        },
      ],
      details: [
        {
          sku: 'IPA-2024',
          name: 'iPad Air 2024',
          quantity: 1,
          price: 500000,
          total: 500000,
          image: 'https://via.placeholder.com/40x40?text=IPA',
        },
        {
          sku: 'CAP-001',
          name: 'Cáp sạc',
          quantity: 2,
          price: 7000,
          total: 14000,
          image: 'https://via.placeholder.com/40x40?text=CAP',
        },
      ],
      discount: 10000,
      tax: 0,
      shippingFee: 15000,
      shippingAddress: '456 Đường XYZ, Quận 3, TP.HCM',
    },
    {
      id: 4,
      code: 'HD8888',
      customer: { name: 'Mai Phương - 0909123456' },
      type: 'Online',
      createdBy: 'Nguyễn Văn A',
      createdAt: '2025-07-16T11:00',
      total: 300000,
      status: 'shipping',
      note: '',
      payments: [],
      details: [
        {
          sku: 'TNG-BT',
          name: 'Tai nghe Bluetooth',
          quantity: 1,
          price: 300000,
          total: 300000,
          image: 'https://via.placeholder.com/40x40?text=TNG',
        },
      ],
      discount: 0,
      tax: 0,
      shippingFee: 0,
      shippingAddress: '789 Đường DEF, Quận 5, TP.HCM',
    },
    {
      id: 5,
      code: 'HD6306',
      customer: { name: 'Lý Tiến Duy - 0961866385' },
      type: 'Tại quầy',
      createdBy: 'Trần Thị B',
      createdAt: '2025-07-12T10:46',
      total: 0,
      status: 'delivering',
      note: '',
      payments: [],
      details: [],
      discount: 0,
      tax: 0,
      shippingFee: 0,
      shippingAddress: '',
    },
  ])

  function getInvoiceByCode(code) {
    return invoices.value.find((inv) => inv.code === code)
  }

  function getInvoiceById(id) {
    return invoices.value.find((inv) => inv.id === id)
  }

  function upsertInvoice(rawInvoice, options = {}) {
    const normalized = normalizeInvoice(rawInvoice, options)
    if (!normalized) return null

    const indexById = invoices.value.findIndex((inv) => inv.id === normalized.id)
    const indexByCode = invoices.value.findIndex((inv) => inv.code === normalized.code)
    const targetIndex = indexById !== -1 ? indexById : indexByCode

    if (targetIndex !== -1) {
      invoices.value[targetIndex] = {
        ...invoices.value[targetIndex],
        ...normalized,
      }
      return invoices.value[targetIndex]
    }

    invoices.value.unshift(normalized)
    return normalized
  }

  function updateInvoiceStatus(code, status) {
    const invoice = invoices.value.find((inv) => inv.code === code || inv.id === code)
    if (!invoice) return

    const backendStatus = deriveBackendStatus(status) || status || invoice.backendStatus
    invoice.backendStatus = backendStatus
    invoice.status = STEP_STATUS_MAP[backendStatus] || status || invoice.status
  }

  return {
    invoices,
    getInvoiceByCode,
    getInvoiceById,
    upsertInvoice,
    updateInvoiceStatus,
  }
})
