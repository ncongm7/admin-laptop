import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  function updateInvoiceStatus(code, status) {
    const invoice = invoices.value.find((inv) => inv.code === code)
    if (invoice) invoice.status = status
  }

  return { invoices, getInvoiceByCode, updateInvoiceStatus }
})
