// Gọi API backend
const API = 'http://localhost:8080/api/dot-giam-gia-chi-tiet-quan-ly';

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
  // Throw error để component có thể xử lý và hiển thị toast
  throw new Error(msg);
}

// Lấy danh sách chi tiết theo ID đợt giảm giá
export const findByDotGiamGiaId = async (dotGiamGiaId) => {
  const res = await fetch(`${API}/danh-sach/${dotGiamGiaId}`);
  return handleResponse(res);
};

// Thêm các chi tiết sản phẩm đã chọn vào đợt giảm giá
export const addCtspToDotGiamGia = async (request) => {
  const res = await fetch(`${API}/add-ctsp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse(res);
};

// Xóa
export const deleteDotGiamGiaChiTiet = async (id) => {
  const res = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
  return handleResponse(res);
};

// Lấy danh sách sản phẩm cho combobox
export const getSanPhamCombobox = async () => {
  const res = await fetch(`${API}/san-pham-combobox`);
  return handleResponse(res);
};

// Lấy danh sách CTSP chưa có trong đợt giảm giá theo sản phẩm
export const getAvailableCtsp = async (dotGiamGiaId, sanPhamId) => {
  let url = `${API}/available-ctsp/${dotGiamGiaId}`;
  if (sanPhamId) {
    url += `?sanPhamId=${sanPhamId}`;
  }
  const res = await fetch(url);
  return handleResponse(res);
};
