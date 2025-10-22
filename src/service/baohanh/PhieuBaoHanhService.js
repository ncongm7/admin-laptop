const API = 'http://localhost:8080/api/phieu-bao-hanh-quan-ly';

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
//Get All
export const getPhieuBaoHanh = async () => {
  const res = await fetch(`${API}/danh-sach`);
  return handleResponse(res);
};
// Xóa
export const deletePhieuBaoHanh = async (id) => {
  const res = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
  return handleResponse(res);
};
export const getPhieuBaoHanhById = async (id) => {
  const res = await fetch(`${API}/detail/${id}`);
  return handleResponse(res);
};