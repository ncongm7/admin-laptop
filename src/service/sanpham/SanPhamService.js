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

export const updateSanPhamSilent = (id, payload) => {
  console.log('SanPhamService: Silently updating product with ID:', id)
  return client.put(`${BASE_ROUTE}/${id}`, payload, {
    headers: {
      'X-Silent-Update': 'true'
    }
  })
}

export const updateTrangThai = (id, payload) => {
  return client.put(`${BASE_ROUTE}/${id}/trang-thai`, payload)
}

export const deleteSanPham = (id) => {
  console.log('SanPhamService: Deleting product with ID:', id)
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
  return client.put(`${CTSP_ROUTE}/${id}`, payload)
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

// Cascade delete CTSP with all related data (serials, images, etc.)
export const deleteCTSPWithCascade = async (id) => {
  console.log('SanPhamService: Starting cascade delete for CTSP ID:', id)
  
  try {
    // Step 1: Delete all serials for this variant
    try {
      console.log('SanPhamService: Deleting serials for CTSP ID:', id)
      const serialsResponse = await client.get(`/api/serial/ctsp/${id}`)
      const serials = serialsResponse.data || []
      
      if (serials.length > 0) {
        console.log(`SanPhamService: Found ${serials.length} serials to delete`)
        const deleteSerialPromises = serials.map(serial => 
          client.delete(`/api/serial/${serial.id}`).catch(err => {
            console.warn('Failed to delete serial:', serial.id, err.message)
            return null
          })
        )
        await Promise.allSettled(deleteSerialPromises)
        console.log('SanPhamService: Finished deleting serials')
      }
    } catch (serialError) {
      console.warn('SanPhamService: Error deleting serials:', serialError.message)
      // Continue even if serial deletion fails
    }
    
    // Step 2: Delete all images for this variant
    try {
      console.log('SanPhamService: Deleting images for CTSP ID:', id)
      const imagesResponse = await getHinhAnhByCtspId(id)
      const images = imagesResponse.data || []
      
      if (images.length > 0) {
        console.log(`SanPhamService: Found ${images.length} images to delete`)
        const deleteImagePromises = images.map(image => 
          client.delete(`/api/hinh-anh/${image.id}`).catch(err => {
            console.warn('Failed to delete image:', image.id, err.message)
            return null
          })
        )
        await Promise.allSettled(deleteImagePromises)
        console.log('SanPhamService: Finished deleting images')
      }
    } catch (imageError) {
      console.warn('SanPhamService: Error deleting images:', imageError.message)
      // Continue even if image deletion fails
    }
    
    // Step 3: Now delete the variant
    console.log('SanPhamService: Deleting CTSP ID:', id)
    const result = await client.delete(`${CTSP_ROUTE}/${id}`)
    console.log('SanPhamService: Successfully deleted CTSP')
    
    return result
  } catch (error) {
    console.error('SanPhamService: Error in cascade delete:', error)
    throw error
  }
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
    }
  })
}

export const getAllSerial = () => {
  return client.get(`${SERIAL_ROUTE}/all`)
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

// ===== COMPREHENSIVE PRODUCT CREATION =====
export const createProductWithVariantsAndSerials = async (productData, variantConfigs, previewVariants = []) => {
  try {
    // Step 1: Create product (skip if product ID already exists - for add-variants-only mode)
    let product
    if (productData.id) {
      console.log('Using existing product ID:', productData.id)
      product = { id: productData.id, ...productData }
    } else {
      console.log('Creating new product...')
      const productResponse = await createSanPham(productData)
      product = productResponse.data
    }
    
    if (!variantConfigs || variantConfigs.length === 0) {
      return { product, variants: [], serials: [] }
    }
    
    // Step 2: Create variants using the existing API
    // Use first preview variant price or default
    const firstPreviewPrice = previewVariants && previewVariants.length > 0 ? 
      (parseFloat(previewVariants[0].giaBan) || 1000000) : 1000000
    
    const variantPayload = {
      idSanPham: product.id,
      giaBan: firstPreviewPrice, // Use first variant's price
      ghiChu: variantConfigs[0].ghiChu || '',
      soLuongTon: 0, // Will be updated based on serials
      soLuongTamGiu: variantConfigs[0].soLuongTamGiu || 0,
      trangThai: variantConfigs[0].trangThai || 1,
      selectedCpuIds: variantConfigs[0].selectedCpuIds || [],
      selectedGpuIds: variantConfigs[0].selectedGpuIds || [],
      selectedRamIds: variantConfigs[0].selectedRamIds || [],
      selectedOCungIds: variantConfigs[0].selectedOCungIds || [],
      selectedMauSacIds: variantConfigs[0].selectedMauSacIds || [],
      selectedLoaiManHinhIds: variantConfigs[0].selectedLoaiManHinhIds || [],
      selectedPinIds: variantConfigs[0].selectedPinIds || []
    }
    
    console.log('Creating variants with payload:', variantPayload)
    const variantsResponse = await taoBienTheSanPham(variantPayload)
    let variants = variantsResponse.data || []
    console.log('Created variants:', variants)
    
    // Step 3: Update individual variant prices and properties based on preview data
    if (previewVariants && previewVariants.length > 0) {
      console.log('Matching variants with preview data...')
      console.log('Created variants:', variants.map(v => ({ id: v.id, maCtsp: v.maCtsp, giaBan: v.giaBan })))
      console.log('Preview variants:', previewVariants.map(p => ({ giaBan: p.giaBan, serials: p.serials?.length || 0 })))
      
      // Match variants with preview variants based on attribute combination
      for (let i = 0; i < variants.length && i < previewVariants.length; i++) {
        const variant = variants[i]
        const previewVariant = previewVariants[i]
        
        console.log(`\n=== Updating variant ${i} ===`)
        console.log('Variant ID:', variant.id)
        console.log('Current price:', variant.giaBan)
        console.log('Target price:', previewVariant.giaBan)
        console.log('Serials count:', previewVariant.serials?.length || 0)
        
        // Always update price from preview if it's different
        const targetPrice = parseFloat(previewVariant.giaBan) || 0
        const currentPrice = parseFloat(variant.giaBan) || 0
        
        if (targetPrice !== currentPrice) {
          try {
            const updatePayload = {
              idSanPham: product.id, // Required field
              maCtsp: variant.maCtsp,
              giaBan: parseFloat(previewVariant.giaBan) || 0,
              ghiChu: variant.ghiChu || '',
              soLuongTon: 0, // Will be updated after serials
              soLuongTamGiu: variant.soLuongTamGiu || 0,
              trangThai: variant.trangThai,
              idCpu: variant.idCpu,
              idGpu: variant.idGpu,
              idRam: variant.idRam,
              idOCung: variant.idOCung,
              idMauSac: variant.idMauSac,
              idLoaiManHinh: variant.idLoaiManHinh,
              idPin: variant.idPin
            }
            
            console.log(`Updating variant ${variant.id} price from ${variant.giaBan} to ${updatePayload.giaBan}`)
            const updatedVariant = await updateChiTietSanPham(variant.id, updatePayload)
            variants[i] = updatedVariant.data
            console.log(`✅ Successfully updated variant ${variant.id} price to ${updatedVariant.data.giaBan}`)
          } catch (updateError) {
            console.error(`❌ Failed to update variant ${variant.id} price:`, updateError)
            // Update local variant data even if API call failed
            variants[i] = { ...variant, giaBan: targetPrice }
            console.log(`🔄 Updated variant ${variant.id} price locally to ${targetPrice}`)
          }
        } else {
          console.log(`⏭️ Skipping price update for variant ${variant.id} (same price or undefined)`)
        }
      }
    }
    
    // Step 3.5: Save images for each variant from preview data
    if (previewVariants && previewVariants.length > 0) {
      console.log('Saving variant images...')
      for (let i = 0; i < variants.length && i < previewVariants.length; i++) {
        const variant = variants[i]
        const previewVariant = previewVariants[i]
        
        // Save variant image if provided
        if (previewVariant.anhDaiDien) {
          try {
            const imageRequest = {
              idSpct: variant.id,
              url: previewVariant.anhDaiDien,
              anhChinhDaiDien: true
            }
            await createHinhAnhBatch([imageRequest])
            console.log(`✅ Saved image for variant ${variant.id}:`, previewVariant.anhDaiDien)
          } catch (imageError) {
            console.warn(`❌ Failed to save image for variant ${variant.id}:`, imageError)
          }
        }
      }
    }
    
    // Step 4: Create serials for each variant based on preview data
    const allSerials = []
    if (previewVariants && previewVariants.length > 0) {
      for (let i = 0; i < variants.length && i < previewVariants.length; i++) {
        const variant = variants[i]
        const previewVariant = previewVariants[i]
        
        if (previewVariant.serials && previewVariant.serials.length > 0) {
          const serialRequests = previewVariant.serials.map(serial => ({
            ctspId: variant.id,
            serialNo: serial.soSerial || serial,
            trangThai: serial.trangThai || 1
          }))
          
          try {
            const serialsResponse = await createSerialsBatch(serialRequests)
            const createdSerials = serialsResponse.data || []
            allSerials.push(...createdSerials)
            
            // Update variant stock count
            if (createdSerials.length > 0) {
              const stockUpdatePayload = {
                idSanPham: product.id, // Required field
                maCtsp: variant.maCtsp,
                giaBan: variant.giaBan,
                ghiChu: variant.ghiChu || '',
                soLuongTon: createdSerials.length,
                soLuongTamGiu: variant.soLuongTamGiu || 0,
                trangThai: variant.trangThai,
                idCpu: variant.idCpu,
                idGpu: variant.idGpu,
                idRam: variant.idRam,
                idOCung: variant.idOCung,
                idMauSac: variant.idMauSac,
                idLoaiManHinh: variant.idLoaiManHinh,
                idPin: variant.idPin
              }
              
              try {
                const updatedVariant = await updateChiTietSanPham(variant.id, stockUpdatePayload)
                variants[i] = updatedVariant.data
              } catch (stockUpdateError) {
                console.error('Failed to update variant stock:', variant.id, stockUpdateError)
              }
            }
          } catch (serialError) {
            console.warn('Failed to create serials for variant:', variant.id, serialError)
          }
        }
      }
    }
    
    return {
      product,
      variants,
      serials: allSerials
    }
  } catch (error) {
    console.error('Error in comprehensive product creation:', error)
    throw error
  }
}