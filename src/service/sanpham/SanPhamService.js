// Update SanPhamService.js to add getAllSanPhamChiTiet method
import client from '@/utils/api'

const BASE_ROUTE = '/api/san-pham'
const CTSP_ROUTE = '/api/chi-tiet-san-pham'
// const UPLOAD_ROUTE = "/api/upload";

// SẢN PHẨM
export const getAllSanPham = (params) => {
  return client.get(`${BASE_ROUTE}`, { params })
}

export const getSanPhamById = (id) => {
  return client.get(`${BASE_ROUTE}/${id}`)
}

export const updateSanPham = (id, payload) => {
  console.log('SanPhamService: Updating product with ID:', id, 'Payload:', payload)
  return client.put(`${BASE_ROUTE}/${id}`, payload)
}

export const updateTrangThai = (id, payload) => {
  return client.put(`${BASE_ROUTE}/${id}/trang-thai`, payload)
}

export const deleteSanPham = (id) => {
  return client.delete(`${BASE_ROUTE}/${id}`)
}

export const bulkDeleteSanPham = (ids) => {
  return client.delete(`${BASE_ROUTE}/bulk`, { data: { ids } })
}

export const createSanPham = (payload) => {
  return client.post(`${BASE_ROUTE}`, payload)
}

// export const getComboboxData = () => {
//   return client.get(`${BASE_ROUTE}/combobox-data`)
// }

// CHI TIẾT SẢN PHẨM
export const getAllSanPhamChiTiet = () => {
  return client.get(`${CTSP_ROUTE}`)
}

// New: search CTSP with filters + paging
export const searchSanPhamChiTiet = (params) => {
  return client.get(`${CTSP_ROUTE}/search`, { params })
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

export const deleteCTSP = (id) => {
  return client.delete(`${CTSP_ROUTE}/${id}`)
}

// ===== CPU CRUD =====
export const getCPUList = () => {
  return client.get('/api/cpu')
}

export const createCPU = (payload) => {
  return client.post('/api/cpu', payload)
}

export const updateCPU = (id, payload) => {
  return client.put(`/api/cpu/${id}`, payload)
}

export const deleteCPU = (id) => {
  return client.delete(`/api/cpu/${id}`)
}

// ===== GPU CRUD =====
export const getGPUList = () => {
  return client.get('/api/gpu')
}

export const createGPU = (payload) => {
  return client.post('/api/gpu', payload)
}

export const updateGPU = (id, payload) => {
  return client.put(`/api/gpu/${id}`, payload)
}

export const deleteGPU = (id) => {
  return client.delete(`/api/gpu/${id}`)
}

// ===== RAM CRUD =====
export const getRamList = () => {
  return client.get('/api/ram')
}

export const createRam = (payload) => {
  return client.post('/api/ram', payload)
}

export const updateRam = (id, payload) => {
  return client.put(`/api/ram/${id}`, payload)
}

export const deleteRam = (id) => {
  return client.delete(`/api/ram/${id}`)
}

// ===== Ổ CỨNG CRUD =====
export const getOCungList = () => {
  return client.get('/api/o-cung')
}

export const createOCung = (payload) => {
  return client.post('/api/o-cung', payload)
}

export const updateOCung = (id, payload) => {
  return client.put(`/api/o-cung/${id}`, payload)
}

export const deleteOCung = (id) => {
  return client.delete(`/api/o-cung/${id}`)
}

// ===== MÀU SẮC CRUD =====
export const getMauSacList = () => {
  return client.get('/api/mau-sac')
}

export const createMauSac = (payload) => {
  return client.post('/api/mau-sac', payload)
}

export const updateMauSac = (id, payload) => {
  return client.put(`/api/mau-sac/${id}`, payload)
}

export const deleteMauSac = (id) => {
  return client.delete(`/api/mau-sac/${id}`)
}

// ===== LOẠI MÀN HÌNH CRUD =====
export const getLoaiManHinhList = () => {
  return client.get('/api/loai-man-hinh')
}

export const createLoaiManHinh = (payload) => {
  return client.post('/api/loai-man-hinh', payload)
}

export const updateLoaiManHinh = (id, payload) => {
  return client.put(`/api/loai-man-hinh/${id}`, payload)
}

export const deleteLoaiManHinh = (id) => {
  return client.delete(`/api/loai-man-hinh/${id}`)
}

// ===== PIN CRUD =====
export const getPinList = () => {
  return client.get('/api/pin')
}

export const createPin = (payload) => {
  return client.post('/api/pin', payload)
}

export const updatePin = (id, payload) => {
  return client.put(`/api/pin/${id}`, payload)
}

export const deletePin = (id) => {
  return client.delete(`/api/pin/${id}`)
}

// ===== TẠO BIẾN THỂ TỰ ĐỘNG =====
export const taoBienTheSanPham = (payload) => {
  return client.post(`${CTSP_ROUTE}/tao-bien-the`, payload)
}

// ===== SERIAL NUMBER MANAGEMENT =====
const SERIAL_ROUTE = '/api/serial'

export const createSerial = (payload) => {
  return client.post(`${SERIAL_ROUTE}`, payload)
}

export const createSerialsBatch = (payloadList) => {
  return client.post(`${SERIAL_ROUTE}/batch`, payloadList)
}

export const importSerialsFromExcel = (ctspId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return client.post(`${SERIAL_ROUTE}/import-excel/${ctspId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  })
}

export const getSerialsByCtspId = (ctspId) => {
  return client.get(`${SERIAL_ROUTE}/ctsp/${ctspId}`)
}

export const getSerialById = (id) => {
  return client.get(`${SERIAL_ROUTE}/${id}`)
}

export const updateSerial = (id, payload) => {
  return client.put(`${SERIAL_ROUTE}/${id}`, payload)
}

export const updateSerialStatus = (id, trangThai) => {
  return client.put(`${SERIAL_ROUTE}/${id}/trang-thai`, null, {
    params: { trangThai }
  })
}

export const deleteSerial = (id) => {
  return client.delete(`${SERIAL_ROUTE}/${id}`)
}

// ===== IMAGE MANAGEMENT =====
const IMAGE_ROUTE = '/api/hinh-anh'

export const createHinhAnh = (payload) => {
  return client.post(`${IMAGE_ROUTE}`, payload)
}

export const createHinhAnhBatch = (payloadList) => {
  return client.post(`${IMAGE_ROUTE}/batch`, payloadList)
}

export const getHinhAnhByCtspId = (ctspId) => {
  return client.get(`${IMAGE_ROUTE}/ctsp/${ctspId}`)
}

export const getMainImageByCtspId = (ctspId) => {
  return client.get(`${IMAGE_ROUTE}/ctsp/${ctspId}/main`)
}

export const getGalleryImagesByCtspId = (ctspId) => {
  return client.get(`${IMAGE_ROUTE}/ctsp/${ctspId}/gallery`)
}

export const updateHinhAnh = (id, payload) => {
  return client.put(`${IMAGE_ROUTE}/${id}`, payload)
}

export const deleteHinhAnh = (id) => {
  return client.delete(`${IMAGE_ROUTE}/${id}`)
}

export const deleteAllImagesByCtspId = (ctspId) => {
  return client.delete(`${IMAGE_ROUTE}/ctsp/${ctspId}`)
}