// Gọi API backend
const API = 'http://localhost:8080/api/dot-giam-gia-quan-ly';

// === Helper: xử lý response NGẮN GỌN ===
// - OK 2xx  -> trả JSON (hoặc {} nếu body rỗng)
// - Lỗi     -> cố lấy errors/message/raw text, alert, rồi throw để dừng luồng
async function handleResponse(res) {
  if (res.ok) {
    return await res.json().catch(() => ({}));
  }
  const raw = await res.text().catch(() => '');
  let msg = `HTTP ${res.status}`;
  try {
    const data = raw ? JSON.parse(raw) : null;
    if (data?.errors && typeof data.errors === 'object') {
      msg = Object.values(data.errors).join('\n'); // gộp tất cả lỗi field
    } else if (data?.message) {
      msg = data.message;
    } else {
      msg = raw || msg;
    }
  } catch {
    msg = raw || msg;
  }
  // Throw error để component có thể xử lý và hiển thị toast
  throw new Error(msg);
}

// Lấy danh sách
export const getDotGiamGias = async () => {
  const res = await fetch(`${API}/danh-sach`);
  return handleResponse(res);
};

// Lấy chi tiết 1 đợt theo id
export const getDotGiamGiaById = async (id) => {
  const res = await fetch(`${API}/detail/${id}`);
  return handleResponse(res);
};

// Thêm mới
export const addDotGiamGia = async (data) => {
  const res = await fetch(`${API}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// Cập nhật
export const updateDotGiamGia = async (data, id) => {
  const res = await fetch(`${API}/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// Xóa
export const deleteDotGiamGia = async (id) => {
  const res = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
  return handleResponse(res);
};
