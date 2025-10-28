# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG ĐĂNG NHẬP

## ✅ HOÀN THÀNH 100%

Đã triển khai đầy đủ hệ thống đăng nhập theo yêu cầu trong README.md với thiết kế chuyên nghiệp cho **VietLapTop**.

---

## 📁 CÁC FILE ĐÃ TẠO/CẬP NHẬT

### 1. **Service Layer** (`/src/service/authService.js`) ✅
**Chức năng:**
- `login(credentials)` - Đăng nhập với tenDangNhap và matKhau
- `getCurrentUser()` - Lấy thông tin user hiện tại
- `logout()` - Đăng xuất
- `refreshToken()` - Làm mới token

**API Endpoints:**
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token

---

### 2. **Auth Store** (`/src/stores/authStore.js`) ✅
**State:**
- `user` - Thông tin người dùng (null khi chưa đăng nhập)
- `token` - JWT token
- `loading` - Trạng thái loading
- `error` - Thông báo lỗi

**Getters:**
- `isAuthenticated` - Kiểm tra đã đăng nhập chưa
- `getUser` - Lấy thông tin user
- `getUserId` - Lấy ID user
- `getUserName` - Lấy tên user

**Actions:**
- `login(credentials)` - Đăng nhập
  - Gọi API đăng nhập
  - Lưu token và user vào localStorage
  - Set Authorization header
  - Lưu userId để dùng cho bán hàng
  
- `logout()` - Đăng xuất
  - Gọi API logout
  - Xóa token và user khỏi localStorage
  - Clear Authorization header
  
- `checkAuthStatus()` - Kiểm tra trạng thái đăng nhập
  - Đọc token từ localStorage
  - Gọi API /auth/me để verify và lấy thông tin mới
  - Tự động logout nếu token không hợp lệ
  
- `initialize()` - Khởi tạo từ localStorage
  - Load token và user từ localStorage
  - Set lại Authorization header

---

### 3. **Trang Đăng Nhập** (`/src/views/auth/LoginView.vue`) ✅

#### **Thiết Kế UI/UX Chuyên Nghiệp:**

**Màu sắc:**
- Primary Color: `#2D7458` (Xanh lá đậm, trang trọng)
- Accent Color: `#396E7C` (Xanh lam khói, hiện đại)
- Gradient Button: `linear-gradient(135deg, #2D7458 0%, #396E7C 100%)`

**Features:**
- ✅ Layout canh giữa màn hình
- ✅ Background gradient nhẹ nhàng với decorations
- ✅ Logo VietLapTop nổi bật
- ✅ Form trong card bo góc, đổ bóng đẹp
- ✅ Input fields với icons (user, lock)
- ✅ Focus effect với màu chủ đạo
- ✅ Toggle hiện/ẩn mật khẩu
- ✅ Button loading state với spinner
- ✅ Thông báo lỗi thân thiện (không dùng alert trình duyệt)
- ✅ Animation mượt mà (slideIn, shake)
- ✅ Responsive mobile-friendly

#### **Logic:**
- Validate input trước khi gửi
- Gọi `authStore.login()` khi submit
- Try-catch để xử lý lỗi
- Hiển thị lỗi trên UI
- Auto redirect về trang chủ khi đăng nhập thành công
- Disable form khi đang xử lý

---

### 4. **Header** (`/src/layout/Header.vue`) ✅

**Cập nhật:**
- Import và sử dụng `authStore`
- Hiển thị thông tin user đã đăng nhập:
  - Avatar (hoặc placeholder)
  - Tên nhân viên (`authStore.getUserName`)
  - Role/chức vụ
- Dropdown menu với:
  - Thông tin cá nhân
  - Cài đặt
  - **Đăng xuất** - Gọi `authStore.logout()` và redirect về `/login`
- Confirm trước khi đăng xuất

---

### 5. **Router** (`/src/router/router.js`) ✅

#### **Route mới:**
```javascript
{
  path: '/login',
  name: 'Login',
  component: () => import('@/views/auth/LoginView.vue'),
  meta: { requiresAuth: false, hideForAuth: true }
}
```

#### **Navigation Guards:**
```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Khởi tạo auth store nếu chưa có
  if (authStore.token === null && localStorage.getItem('token')) {
    authStore.initialize()
  }
  
  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth !== false // Default: true
  const hideForAuth = to.meta.hideForAuth === true
  
  // Bảo vệ routes yêu cầu auth
  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // Redirect nếu đã đăng nhập và vào trang login
  if (hideForAuth && isAuthenticated) {
    next('/')
    return
  }
  
  next()
})
```

**Logic:**
- Mặc định TẤT CẢ routes đều yêu cầu xác thực
- Chỉ `/login` không yêu cầu (set `meta.requiresAuth: false`)
- Nếu chưa đăng nhập → Redirect về `/login`
- Nếu đã đăng nhập và vào `/login` → Redirect về `/`

---

### 6. **App.vue** (`/src/App.vue`) ✅

**Cập nhật:**
- Import `authStore`
- Thêm `onMounted` hook
- Gọi `authStore.checkAuthStatus()` khi app load
- Khôi phục phiên đăng nhập tự động từ localStorage
- Ẩn Header/Sidebar khi ở trang login

---

### 7. **Sales View** (`/src/views/banhang/SalesView.vue`) ✅

**Tích hợp với Auth:**
- Import và sử dụng `authStore`
- Lấy `nhanVienId` từ `authStore.getUserId`
- Không cần gọi API lấy danh sách nhân viên nữa
- Redirect về `/login` nếu không có userId
- Log thông tin user khi mount

---

## 🚀 HƯỚNG DẪN SỬ DỤNG

### 1. Khởi động Backend

Đảm bảo backend đang chạy ở `http://localhost:8080`

### 2. Khởi động Frontend

```bash
cd admin-laptop
npm install
npm run dev
```

### 3. Truy cập Ứng Dụng

Mở trình duyệt: `http://localhost:5173`

### 4. Đăng Nhập

**URL:** `http://localhost:5173/login`

**Thông tin đăng nhập test:**
- Tên đăng nhập: `admin01` (hoặc theo database)
- Mật khẩu: `password123` (hoặc theo database)

### 5. Luồng Hoạt Động

#### **Lần đầu truy cập:**
1. User vào bất kỳ route nào (ví dụ: `/`)
2. Navigation Guard kiểm tra `isAuthenticated`
3. Chưa đăng nhập → Redirect về `/login`
4. User nhập thông tin đăng nhập
5. Click "Đăng nhập"
6. Frontend gọi API → Backend verify
7. Thành công → Lưu token + user vào localStorage
8. Redirect về `/` (Dashboard)

#### **Đăng nhập lại (F5/reload):**
1. App.vue `onMounted` gọi `checkAuthStatus()`
2. Đọc token từ localStorage
3. Gọi API `/auth/me` để verify token
4. Token hợp lệ → Load lại thông tin user
5. Token không hợp lệ → Logout và redirect về `/login`

#### **Bán hàng:**
1. User vào trang `/ban-hang`
2. Click "Tạo hóa đơn mới"
3. Frontend lấy `nhanVienId` từ `authStore.getUserId`
4. Gọi API tạo hóa đơn với `nhanVienId` chính xác
5. Thành công → Hóa đơn được tạo với đúng nhân viên

#### **Đăng xuất:**
1. User click avatar dropdown → "Đăng xuất"
2. Confirm dialog
3. Gọi `authStore.logout()`
4. Xóa token và user khỏi localStorage
5. Redirect về `/login`

---

## 🔐 BẢO MẬT

### Token Management
- ✅ JWT token lưu trong localStorage
- ✅ Token được set vào Authorization header cho mọi request
- ✅ Token được verify mỗi khi app load
- ✅ Auto logout nếu token không hợp lệ

### Route Protection
- ✅ Navigation Guards bảo vệ tất cả routes
- ✅ Redirect về login nếu chưa xác thực
- ✅ Không cho vào login khi đã đăng nhập

### Best Practices
- ✅ Password input có toggle show/hide
- ✅ Không log sensitive data ra console (production)
- ✅ Error messages user-friendly
- ✅ Confirm trước các action quan trọng

---

## 🎨 UI/UX HIGHLIGHTS

### Màu Sắc VietLapTop
- **Primary:** `#2D7458` - Xanh lá đậm, trang trọng
- **Accent:** `#396E7C` - Xanh lam khói, hiện đại
- **Gradient:** Linear gradient giữa 2 màu chủ

### Animations
- **Slide In:** Card đăng nhập xuất hiện mượt mà
- **Shake:** Form rung nhẹ khi có lỗi
- **Hover:** Buttons có hiệu ứng hover tinh tế
- **Focus:** Input có glow effect khi focus

### Responsive
- ✅ Mobile-friendly
- ✅ Tablet responsive
- ✅ Desktop optimized

---

## 🧪 TESTING

### Test Cases

1. **Đăng nhập thành công:**
   - ✅ Input đúng thông tin
   - ✅ Loading state hiển thị
   - ✅ Redirect về trang chủ
   - ✅ Header hiển thị tên user
   - ✅ localStorage có token và user

2. **Đăng nhập thất bại:**
   - ✅ Sai mật khẩu → Hiển thị lỗi
   - ✅ Sai tên đăng nhập → Hiển thị lỗi
   - ✅ API lỗi → Hiển thị thông báo
   - ✅ Form vẫn enable để retry

3. **Route Protection:**
   - ✅ Chưa đăng nhập vào `/ban-hang` → Redirect `/login`
   - ✅ Đã đăng nhập vào `/login` → Redirect `/`
   - ✅ F5 trang → Vẫn giữ đăng nhập

4. **Đăng xuất:**
   - ✅ Click đăng xuất → Confirm dialog
   - ✅ Confirm → Clear localStorage
   - ✅ Redirect về `/login`
   - ✅ Không vào được routes bảo vệ nữa

5. **Bán hàng:**
   - ✅ Tạo hóa đơn với đúng nhanVienId
   - ✅ Không cần gọi API lấy danh sách nhân viên
   - ✅ userId từ authStore

---

## 📝 API BACKEND CẦN CÓ

### 1. **POST /api/auth/login**
**Request:**
```json
{
  "tenDangNhap": "admin01",
  "matKhau": "password123"
}
```

**Response Success (200):**
```json
{
  "data": {
    "userId": "uuid-string",
    "hoTen": "Nguyễn Văn A",
    "tenDangNhap": "admin01",
    "email": "admin@vietlaptop.com",
    "role": "Admin",
    "chucVu": "Quản lý"
  },
  "token": "jwt-token-string"
}
```

**Response Error (401):**
```json
{
  "message": "Tên đăng nhập hoặc mật khẩu không chính xác"
}
```

### 2. **GET /api/auth/me**
**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Response Success (200):**
```json
{
  "data": {
    "userId": "uuid-string",
    "hoTen": "Nguyễn Văn A",
    "tenDangNhap": "admin01",
    "email": "admin@vietlaptop.com",
    "role": "Admin"
  }
}
```

**Response Error (401):**
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 3. **POST /api/auth/logout**
**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "message": "Đăng xuất thành công"
}
```

---

## 🐛 TROUBLESHOOTING

### 1. "Không nhận được token từ server"
- **Nguyên nhân:** Backend không trả về token trong response
- **Giải pháp:** Kiểm tra backend response structure

### 2. "Token không hợp lệ hoặc đã hết hạn"
- **Nguyên nhân:** Token đã expire hoặc không đúng format
- **Giải pháp:** Đăng xuất và đăng nhập lại

### 3. "CORS Error"
- **Nguyên nhân:** Backend chưa config CORS
- **Giải pháp:** Thêm CORS middleware ở backend

### 4. "Infinite redirect loop"
- **Nguyên nhân:** Navigation guard logic lỗi
- **Giải pháp:** Kiểm tra console log để debug

---

## ✨ FEATURES BONUS

- ✅ Auto-complete tên đăng nhập (trình duyệt)
- ✅ Enter để submit form
- ✅ Auto-focus vào input tên đăng nhập
- ✅ Loading spinner trong button
- ✅ Disabled state khi processing
- ✅ Shake animation khi lỗi
- ✅ Smooth transitions
- ✅ Professional error messages

---

## 📊 TỔNG KẾT

### ✅ Hoàn thành:
- [x] Auth Service với đầy đủ API calls
- [x] Auth Store (Pinia) quản lý state toàn cục
- [x] LoginView với UI/UX chuyên nghiệp
- [x] Header hiển thị user info và logout
- [x] Navigation Guards bảo vệ routes
- [x] App.vue khởi tạo auth khi load
- [x] Sales View tích hợp với auth
- [x] Không có lỗi linter
- [x] Code sạch, có comments
- [x] Tuân thủ Vue 3 Composition API
- [x] Responsive design
- [x] Modern UI theo brand VietLapTop

### 🎉 KẾT QUẢ:
**Hệ thống đăng nhập hoàn chỉnh, chuyên nghiệp, sẵn sàng production!**

---

## 🔮 MỞ RỘNG

### Tính năng có thể thêm:
1. **Remember Me** - Lưu đăng nhập lâu dài
2. **Forgot Password** - Quên mật khẩu
3. **2FA/OTP** - Xác thực 2 bước
4. **Session Timeout** - Tự động logout sau thời gian không hoạt động
5. **Login History** - Lịch sử đăng nhập
6. **Multiple Sessions** - Quản lý nhiều phiên đăng nhập
7. **Social Login** - Đăng nhập qua Google/Facebook
8. **Biometric** - Face ID, Touch ID (mobile)

---

**Được phát triển với ❤️ cho VietLapTop**

