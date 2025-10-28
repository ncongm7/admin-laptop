import axios from './axiosInstance'

// ✅ SỬA: Đổi BASE_URL để match với backend controllers
// Backend đang dùng: /api/cpu, /api/gpu, /api/ram, v.v.

// ⚠️ ĐANG TẮT: Backend chưa có Camera controller
// export const getAllCamera = async () => {
//   try {
//     const res = await axios.get('/api/camera')
//     console.log('getAllCamera:', res.data)
//     return res.data
//   } catch (error) {
//     console.error('Lỗi khi lấy dữ liệu camera:', error)
//     return null
//   }
// }

export const getAllCpu = async () => {
  try {
    const res = await axios.get('/api/cpu')
    console.log(res)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu cpu:', error)
    return null
  }
}

export const getAllDungLuongPin = async () => {
  try {
    const res = await axios.get('/api/pin')
    console.log(res)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dung lượng pin:', error)
    return null
  }
}

export const getAllGpu = async () => {
  try {
    const res = await axios.get('/api/gpu')
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu gpu:', error)
    return null
  }
}


export const getAllKichThuocManHinh = async () => {
  try {
    // Backend có LoaiManHinh (có trường kichThuoc) - dùng endpoint đó
    const res = await axios.get('/api/loai-man-hinh')
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu kích thước màn hình:', error)
    return null
  }
}

export const getAllLoaiManHinh = async () => {
  try {
    const res = await axios.get('/api/loai-man-hinh')
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu loại màn hình:', error)
    return null
  }
}

export const getAllMauSac = async () => {
  try {
    const res = await axios.get('/api/mau-sac')
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu màu sắc:', error)
    return null
  }
}

export const getAllOCung = async () => {
  try {
    const res = await axios.get('/api/o-cung')
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu ổ cứng:', error)
    return null
  }
}

export const getAllRam = async () => {
  try {
    const res = await axios.get('/api/ram')
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu ram:', error)
    return null
  }
}
