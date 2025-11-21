// FILE: src/service/phieugiamgia/PhieuGiamGiaKhachHangService.js
const API = 'http://localhost:8080/api/phieu-giam-gia-quan-ly';

async function handleResponse(res) {
  const raw = await res.text().catch(() => '');
  
  if (res.ok) {
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  
  // Xử lý lỗi
  let msg = `HTTP ${res.status}`;
  let errorData = null;
  
  try {
    errorData = raw ? JSON.parse(raw) : null;
    if (errorData?.errors && typeof errorData.errors === 'object') {
      msg = Object.values(errorData.errors).join('\n');
    } else if (errorData?.message) {
      msg = errorData.message;
    } else if (errorData?.data?.message) {
      msg = errorData.data.message;
    } else {
      msg = raw || msg;
    }
  } catch {
    msg = raw || msg;
  }
  
  const error = new Error(msg);
  error.status = res.status;
  error.data = errorData;
  throw error;
}

export const ganPhieuGiamGiaChoKhachHang = async (phieuGiamGiaId, khachHangIds) => {
  const res = await fetch(`${API}/gan-cho-khach-hang`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phieuGiamGiaId,
      khachHangIds
    }),
  });
  return handleResponse(res);
};

export const getPhieuGiamGiaCuaKhachHang = async (khachHangId) => {
  const res = await fetch(`${API}/khach-hang/${khachHangId}/danh-sach`);
  return handleResponse(res);
};

export const kiemTraVaApDungPhieuGiamGia = async (ma, khachHangId, tongTienHoaDon) => {
  const res = await fetch(`${API}/kiem-tra-va-ap-dung`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ma,
      khachHangId,
      tongTienHoaDon
    }),
  });
  return handleResponse(res);
};

export const sendEmailPhieuGiamGia = async (phieuGiamGiaId, customerId) => {
  const res = await fetch(`${API}/${phieuGiamGiaId}/send-email-to-customer/${customerId}`, {
    method: 'POST',
  });
  return handleResponse(res);
};

export const getKhachHangCuaPhieuGiamGia = async (phieuGiamGiaId) => {
  const res = await fetch(`${API}/${phieuGiamGiaId}/khach-hang`);
  return handleResponse(res);
};

export const capNhatKhachHangChoPhieuGiamGia = async (phieuGiamGiaId, khachHangIds) => {
  const res = await fetch(`${API}/${phieuGiamGiaId}/khach-hang`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phieuGiamGiaId,
      khachHangIds
    }),
  });
  return handleResponse(res);
};

