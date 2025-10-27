# YÊU CẦU XÂY DỰNG TRANG ĐĂNG NHẬP VÀ TÍCH HỢP XÁC THỰC

Chào bạn, hệ thống của tôi đang thiếu chức năng đăng nhập, dẫn đến không thể xác định được nhân viên khi bán hàng. Vui lòng giúp tôi xây dựng một trang đăng nhập hoàn chỉnh theo các yêu cầu chi tiết về logic, thiết kế và tích hợp dưới đây.

## PHẦN 1: BỐI CẢNH DỰ ÁN (CONTEXT)

1.  **Framework:** Vue 3 (sử dụng Composition API và `<script setup>`).
2.  **Quản lý State:** Pinia.

4.  **Routing:** Vue Router.
5.  **Logo & Branding:**
    *   Tên thương hiệu: **VietLapTop**.
    *   Màu chủ đạo (Primary Color): **#2D7458** (Xanh lá đậm, trang trọng).
    *   Màu nhấn (Accent/Secondary Color): **#396E7C** (Xanh lam khói, hiện đại).
    *   Yêu cầu thiết kế phải **chuyên nghiệp, tối giản, và hiện đại**, phù hợp với một cửa hàng công nghệ.

## PHẦN 2: YÊU CẦU CHI TIẾT VỀ CODE

Vui lòng xây dựng các thành phần sau, trình bày code cho từng file một cách rõ ràng và tách biệt.

---

### **1. Tạo Service/Store Quản lý Xác thực**

*   **Xem có File này chưa , chưa có thì tạo :** `/src/stores/authStore.js`
*   **Mục đích:** Quản lý trạng thái đăng nhập và thông tin người dùng trên toàn bộ ứng dụng.
*   **Nội dung (sử dụng Pinia):**
    *   **State:**
        *   `user`: object, lưu thông tin người dùng sau khi đăng nhập (mặc định là `null`).
        *   `token`: string, lưu JWT token (mặc định là `null`).
        *   `isAuthenticated`: boolean (getter), trả về `true` nếu có `token`.
    *   **Actions:**
        *   `login(credentials)`:
            1.  Nhận `tenDangNhap` và `matKhau`.
            2.  Gọi API `POST /api/auth/login` (bạn cần tạo một service `authService.js` để gọi API này).
            3.  Nếu thành công, API sẽ trả về `userData` và `jwtToken`.
            4.  Lưu `token` vào **Local Storage** để duy trì đăng nhập.
            5.  Gán `userData` vào state `user` và `jwtToken` vào state `token`.
            6.  Sử dụng Vue Router để điều hướng người dùng đến trang chủ (`/`).
        *   `logout()`:
            1.  Xóa `token` khỏi Local Storage.
            2.  Reset tất cả state (`user`, `token`) về `null`.
            3.  Điều hướng người dùng về trang đăng nhập (`/login`).
        *   `checkAuthStatus()`:
            1.  Action này sẽ được gọi khi ứng dụng khởi động lần đầu (trong `App.vue` hoặc file main).
            2.  Kiểm tra xem có `token` trong Local Storage không.
            3.  Nếu có, lấy token đó, gán vào state `token`, và gọi một API `/api/auth/me` để lấy lại thông tin `user` và cập nhật state.
*   **File mới cần tạo:** `/src/api/authService.js`
    *   Chứa hàm `login(credentials)` để gọi API và trả về promise.

---

### **2. Thiết kế và Xây dựng Trang Đăng Nhập**

*   **File mới cần tạo:** `/src/views/auth/LoginView.vue`
*   **Routing:** Cấu hình một route mới trong `router/index.js` cho đường dẫn `/login`, trỏ đến component `LoginView.vue`.
*   **Yêu cầu về Thiết kế (UI/UX):**
    *   Layout: Canh giữa màn hình.
    *   Background: Sử dụng màu nền nhẹ nhàng (ví dụ: `gray-100`) hoặc một gradient tinh tế giữa hai màu xanh đã cho.
    *   Form đăng nhập: Đặt trong một card có bo góc và đổ bóng nhẹ để tạo chiều sâu.
    *   Logo: Hiển thị logo "VietLapTop" nổi bật ở phía trên form.
    *   Input Fields:
        *   Hai ô input cho "Tên đăng nhập" và "Mật khẩu".
        *   Thiết kế hiện đại, có placeholder rõ ràng, icon (user, lock) và hiệu ứng `focus` với màu chủ đạo `#2D7458`.
    *   Button "Đăng nhập":
        *   Sử dụng màu chủ đạo `#2D7458` làm màu nền.
        *   Có hiệu ứng hover (ví dụ: sáng màu hơn một chút).
        *   Nút phải có trạng thái "loading" (hiển thị spinner) khi đang gọi API để người dùng biết hệ thống đang xử lý.
    *   Thông báo lỗi: Hiển thị thông báo lỗi (ví dụ: "Sai tên đăng nhập hoặc mật khẩu") một cách thân thiện, không dùng `alert()` của trình duyệt.
*   **Yêu cầu về Logic (trong `<script setup>`):**
    1.  Import và sử dụng `authStore` từ Pinia.
    2.  Tạo các `ref` cho `tenDangNhap` và `matKhau`.
    3.  Viết hàm `handleLogin` được gọi khi form được submit.
    4.  Trong `handleLogin`, gọi action `authStore.login({ tenDangNhap, matKhau })`.
    5.  Sử dụng `try...catch` để xử lý lỗi từ API và hiển thị thông báo lỗi trên giao diện.

---

### **3. Cập nhật Header và Bảo vệ Route**

*   **File cần sửa:** `/src/layout/Header.vue`
*   **Yêu cầu:**
    1.  Import và sử dụng `authStore`.
    2.  Sử dụng `v-if="authStore.isAuthenticated"` để hiển thị giao diện khác nhau:
        *   **Nếu đã đăng nhập:**
            *   Hiển thị tên của nhân viên (`authStore.user.hoTen`).
            *   Có một menu dropdown (avatar menu) chứa nút "Đăng xuất".
            *   Khi click "Đăng xuất", gọi action `authStore.logout()`.
        *   **Nếu chưa đăng nhập:**
            *   Hiển thị nút "Đăng nhập". Khi click, điều hướng đến trang `/login`.

*   **File cần sửa:** `/src/router/router.js`
*   **Yêu cầu (Navigation Guards):**
    1.  Sử dụng `router.beforeEach()` để tạo một navigation guard.
    2.  Kiểm tra xem route sắp tới có yêu cầu xác thực không (thêm `meta: { requiresAuth: true }` vào các route cần bảo vệ như trang bán hàng, dashboard...).
    3.  Kiểm tra `authStore.isAuthenticated`.
    4.  Nếu route yêu cầu xác thực và người dùng chưa đăng nhập, điều hướng họ về trang `/login`.
    5.  Ngược lại, nếu người dùng đã đăng nhập và cố gắng vào lại trang `/login`, điều hướng họ về trang chủ (`/`).

## Tóm tắt luồng công việc:
1. Tạo `authService.js` để gọi API đăng nhập.
2. Tạo `authStore.js` (Pinia) để quản lý state và logic xác thực.
3. Thiết kế và code `LoginView.vue` với UI/UX chuyên nghiệp theo màu sắc đã cho.
4. Cập nhật `Header.vue` để hiển thị trạng thái đăng nhập.
5. Thiết lập `Navigation Guards` trong `router` để bảo vệ các trang.

Vui lòng viết code sạch, có cấu trúc và tuân thủ các yêu cầu trên. Cảm ơn bạn!