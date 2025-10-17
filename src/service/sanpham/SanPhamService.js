// Update SanPhamService.js to fix the RAM endpoint and add proper API calls
import client from '@/utils/api'

const BASE_ROUTE = '/api/san-pham'
const CTSP_ROUTE = '/api/chi-tiet-san-pham'

// SẢN PHẨM
export const getAllSanPham = (params) => {
  return client.get(`${BASE_ROUTE}`, { params })
}

export const updateSanPham = (id, payload) => {
  return client.put(`${BASE_ROUTE}/${id}`, payload)
}

export const updateTrangThai = (id, payload) => {
  return client.put(`${BASE_ROUTE}/${id}/trang-thai`, payload)
}

export const deleteSanPham = (id) => {
  return client.delete(`${BASE_ROUTE}/${id}`)
}

export const createSanPham = (formData) => {
  return client.post(`${BASE_ROUTE}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// CHI TIẾT SẢN PHẨM
export const getAllSanPhamChiTiet = () => {
  return client.get(`${CTSP_ROUTE}`)
}

export const createChiTietSanPham = (payloadList) => {
  return client.post(`${CTSP_ROUTE}`, payloadList)
}

export const getCTSPBySanPham = (idSanPham) => {
  return client.get(`${CTSP_ROUTE}/san-pham/${idSanPham}`)
}

export const updateChiTietSanPham = (id, payload) => {
  return client.put(`${CTSP_ROUTE}/${id}`, payload, {
    withCredentials: true,
  })
}

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file) // key chính xác là "file"

  return client.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  })
}

export const searchByMaOrTen = (keyword) => {
  return client.get(`${BASE_ROUTE}/search/keyword`, {
    params: { keyword },
  })
}

export const searchByMaOrTenPage = (keyword, page = 0, size = 10) => {
  return client.get(`${BASE_ROUTE}/search/keyword/page`, {
    params: { keyword, page, size },
  })
}

export const advancedSearch = (keyword, trangThai, minPrice, maxPrice) => {
  // Build params object, only including non-null/non-undefined values
  const params = {}

  if (keyword !== null && keyword !== undefined && keyword !== '') {
    params.keyword = keyword
  }

  if (trangThai !== null && trangThai !== undefined && trangThai !== '') {
    params.trangThai = trangThai
  }

  if (minPrice !== null && minPrice !== undefined && minPrice !== '') {
    params.minPrice = minPrice
  }

  if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '') {
    params.maxPrice = maxPrice
  }

  return client.get(`${BASE_ROUTE}/search/advanced-filter`, { params })
}

export const advancedSearchPage = (keyword, trangThai, minPrice, maxPrice, page = 0, size = 10) => {
  // Build params object, only including non-null/non-undefined values
  const params = {}

  if (keyword !== null && keyword !== undefined && keyword !== '') {
    params.keyword = keyword
  }

  if (trangThai !== null && trangThai !== undefined && trangThai !== '') {
    params.trangThai = trangThai
  }

  if (minPrice !== null && minPrice !== undefined && minPrice !== '') {
    params.minPrice = minPrice
  }

  if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '') {
    params.maxPrice = maxPrice
  }

  params.page = page
  params.size = size

  return client.get(`${BASE_ROUTE}/search/advanced-filter/page`, { params })
}

export const getCPUList = () => {
  return client.get(`/api/cpu`)
}

export const getGPUList = () => {
  return client.get(`/api/gpu`)
}

export const getLoaiManHinhList = () => {
  return client.get(`/api/loai-man-hinh`)
}

export const getMauSacList = () => {
  return client.get(`/api/mau-sac`)
}

export const getOCungList = () => {
  return client.get(`/api/o-cung`)
}

export const getPinList = () => {
  return client.get(`/api/pin`)
}

export const getRamList = () => {
  return client.get(`/api/ram`) // Fixed from /api/ramhell to /api/ram
}

export const deleteCTSP = (id) => {
  return client.delete(`${CTSP_ROUTE}/${id}`)
}