import axiosInstance from './axiosInstance'

const base = '/api/nhan-vien'

export const nhanVienApi = {
  listAll() {
    return axiosInstance.get(`${base}/hien-thi-nv`)
  },
  paginate(pageOne = 0, pageSize = 10) {
    return axiosInstance.get(`${base}/phan-trang-nv/${pageOne}/${pageSize}`)
  },
  getOne(id) {
    return axiosInstance.get(`${base}/getOne/${id}`)
  },
  add(payload) {
    return axiosInstance.post(`${base}/add-nhan-vien`, payload)
  },
  update(id, payload) {
    return axiosInstance.put(`${base}/sua-nhan-vien/${id}`, payload)
  },
  remove(id) {
    return axiosInstance.delete(`${base}/xoa-nv/${id}`)
  },
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`${base}/upload-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// Mapping helpers between FE form and BE fields
export function mapFormToRequest(form) {
  return {
    maNhanVien: form.maNhanVien || '',
    hoTen: form.name || '',
    soDienThoai: form.phone || '',
    email: form.email || '',
    gioiTinh: form.gender === 'Nam' ? 1 : form.gender === 'Nữ' ? 0 : null,
    anhNhanVien: form.avatar || '',
    chucVu: form.chucVu || '',
    diaChi: buildDiaChi(form),
    danhGia: form.danhGia || '',
    trangThai: form.status === true ? 1 : form.status === false ? 0 : 1,
  }
}

export function mapDtoToUi(nv) {
  return {
    id: nv.id,
    code: nv.maNhanVien,
    name: nv.hoTen,
    email: nv.email,
    phone: nv.soDienThoai,
    address: nv.diaChi,
    status: nv.trangThai === 1,
    gender: nv.gioiTinh,
    avatar: nv.anhNhanVien,
    chucVu: nv.chucVu,
    danhGia: nv.danhGia,
  }
}

export function mapEntityToRequest(nv) {
  return {
    maNhanVien: nv.maNhanVien || '',
    hoTen: nv.hoTen || '',
    soDienThoai: nv.soDienThoai || '',
    email: nv.email || '',
    gioiTinh: typeof nv.gioiTinh === 'number' ? nv.gioiTinh : null,
    anhNhanVien: nv.anhNhanVien || '',
    chucVu: nv.chucVu || '',
    diaChi: nv.diaChi || '',
    danhGia: nv.danhGia || '',
    trangThai: typeof nv.trangThai === 'number' ? nv.trangThai : 1,
  }
}

function buildDiaChi(form) {
  const parts = [form.diachi, form.xa, form.huyen, form.tinh].filter(Boolean)
  return parts.join(', ')
}
