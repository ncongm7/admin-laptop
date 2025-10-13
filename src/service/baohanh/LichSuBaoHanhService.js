const API = 'http://localhost:8080/api/lich-su-bao-hanh-quan-ly';

// === Helper: xử lý response NGẮN GỌN ===
async function handleResponse(res) {
  if (res.ok) {
    return await res.json().catch(() => ({}));
  }
  const raw = await res.text().catch(() => '');
  let msg = `HTTP ${res.status}`;
  try {
    const data = raw ? JSON.parse(raw) : null;
    if (data?.errors && typeof data.errors === 'object') {
      msg = Object.values(data.errors).join('\n');
    } else if (data?.message) {
      msg = data.message;
    } else {
      msg = raw || msg;
    }
  } catch {
    msg = raw || msg;
  }
  alert(msg);
  throw new Error(msg);
}
// Xóa
export const deleteLichSuBaoHanh = async (id) => {
  const res = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
  return handleResponse(res);
};
export const LayLichSuBaoHanh = async (idPhieuBaoHanh) => {
  const res = await fetch(`${API}/danh-sach/${idPhieuBaoHanh}`);
  return handleResponse(res);
};
// service/baohanh/LichSuBaoHanhService.js
export const AddLichSuBaoHanh = async (idPhieuBaoHanh, moTaLoi) => {
  const res = await fetch(`${API}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idPhieuBaoHanh, moTaLoi }),
  });
  return handleResponse(res);
};
// Cập nhật
export const updateLichSuBaoHanh = async (data, id) => {
  const res = await fetch(`${API}/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};
