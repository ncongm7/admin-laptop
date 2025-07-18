import axios from './axiosInstance'
const BASE_URL = '/admin/san-pham'

export const getAllCamera = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/camera/hien-thi`)
    console.log('getAllCamera:', res.data)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu camera:', error)
    return null
  }
}

export const getAllCpu = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/cpu/hien-thi`)
    console.log(res)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu cpu:', error)
    return null
  }
}

export const getAllDungLuongPin = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/dung-luong-pin/hien-thi`)
    console.log(res)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dung lượng pin:', error)
    return null
  }
}

export const getAllGpu = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/gpu/hien-thi`)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu gpu:', error)
    return null
  }
}

export const getAllHang = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/hang/hien-thi`)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu hãng:', error)
    return null
  }
}

export const getAllHeDieuHanh = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/he-dieu-hanh/hien-thi`)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu hệ điều hành:', error)
    return null
  }
}

export const getAllKichThuocManHinh = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/kich-thuoc-man-hinh/hien-thi`)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu kích thước màn hình:', error)
    return null
  }
}

export const getAllLoaiManHinh = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/loai-man-hinh/hien-thi`)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu loại màn hình:', error)
    return null
  }
}

export const getAllMauSac = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/mau-sac/hien-thi`)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu màu sắc:', error)
    return null
  }
}

export const getAllOCung = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/o-cung/hien-thi`)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu ổ cứng:', error)
    return null
  }
}

export const getAllRam = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/ram/hien-thi`)
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu ram:', error)
    return null
  }
}
