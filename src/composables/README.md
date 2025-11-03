# YÊU CẦU NÂNG CẤP VÀ THIẾT KẾ LẠI LAYOUT ADMIN CHUYÊN NGHIỆP

**Bối cảnh:** Bạn là một Senior Frontend Developer và chuyên gia UX/UI, có kinh nghiệm dày dặn trong việc thiết kế các hệ thống  và Admin Panel hiện đại. Hãy phân tích giao diện hiện tại của tôi (dựa trên hình ảnh đã cung cấp) và thực hiện một cuộc "đại tu" về mặt thẩm mỹ và trải nghiệm người dùng cho phần khung chính (Sidebar, Header).

**Ràng buộc cốt lõi:**
*   **CHỈ tập trung vào các component layout** như `Sidebar.vue`, `Header.vue`, và file layout chính (ví dụ `DefaultLayout.vue` hoặc `App.vue`).
*   **KHÔNG được thay đổi logic nghiệp vụ** bên trong các trang con (views) như `SalesView.vue`, `HoaDonView.vue`... Chúng ta chỉ thay đổi "cái khung" bao bọc bên ngoài.

---

## PHẦN 1: PHÂN TÍCH VÀ CHẨN ĐOÁN GIAO DIỆN HIỆN TẠI

Dựa trên hình ảnh, đây là những vấn đề cần khắc phục:

1.  **Header (Thanh tiêu đề trên cùng):**
    *   **Thanh tìm kiếm toàn cục:** Đặt ở đây rất vô ích và chiếm diện tích. Người dùng thường muốn tìm kiếm trong một bối cảnh cụ thể (tìm sản phẩm trong trang sản phẩm, tìm hóa đơn trong trang hóa đơn). Nó cần được loại bỏ khỏi header.
    *   **Thiếu sự tinh tế:** Bố cục tổng thể của header còn đơn giản, thiếu các yếu tố cần thiết như breadcrumbs (đường dẫn điều hướng).

2.  **Sidebar (Menu điều hướng bên trái):**
    *   **Visual Hierarchy kém:** Font chữ của các mục menu chính quá lớn, gần bằng tiêu đề. Khoảng cách và padding không đồng đều.
    *   **Dropdown/Sub-menu xấu:** Cách xổ xuống của các mục menu con (như "Quản lý sản phẩm") rất thô, thiếu hiệu ứng chuyển động mượt mà và thiết kế không đẹp.
    *   **Icon không nhất quán:** Cần một bộ icon đồng bộ và chuyên nghiệp hơn.
    *   **Tổng thể:** Cảm giác bị "phẳng" và thiếu sự phân cấp rõ ràng giữa các mục.

---

## PHẦN 2: ĐỀ XUẤT THIẾT KẾ VÀ CẢI TIẾN (Tư vấn của chuyên gia)

Hãy áp dụng các nguyên tắc thiết kế hiện đại để cải thiện những điểm yếu trên.

### **A. Cải tiến Header (`Header.vue`)**

1.  **Loại bỏ hoàn toàn thanh tìm kiếm toàn cục.** Giải thích cho người dùng hiểu rằng chức năng tìm kiếm sẽ được đặt một cách hợp lý hơn bên trong từng trang chức năng cụ thể.
2.  **Bổ sung Breadcrumbs:** Thêm một khu vực breadcrumbs (ví dụ: `Trang chủ / Bán Hàng`) ở bên trái header. Điều này giúp người dùng luôn biết mình đang ở đâu trong hệ thống.
3.  **Gom nhóm các hành động:** Giữ các icon hành động (thông báo,...) và menu người dùng ở phía bên phải. Cải thiện thiết kế của menu dropdown người dùng cho đẹp hơn (thêm avatar, tên, vai trò, và các tùy chọn như "Hồ sơ", "Đăng xuất").
4.  **Thêm đường phân cách:** Sử dụng một đường kẻ mỏng (`border-bottom`) để tách biệt header với phần nội dung chính, tạo cảm giác sạch sẽ.

### **B. Cải tiến Sidebar (`Sidebar.vue`)**

1.  **Phân cấp lại menu:**
    *   **Giảm kích thước font** của các mục menu xuống một cách hợp lý (ví dụ: 14px hoặc 15px).
    *   Sử dụng **độ đậm của chữ (font-weight)** để phân biệt mục menu đang được chọn (active).
    *   Tăng **padding** bên trong các mục menu để tạo không gian thoáng đãng hơn.
2.  **Thiết kế lại Sub-menu:**
    *   Khi một mục menu cha được click, các mục con sẽ xổ xuống một cách **mượt mà (sử dụng CSS transition)**.
    *   Các mục con nên được **thụt vào lề (indent)** so với mục cha để tạo sự phân cấp rõ ràng.
    *   Mục con đang active cũng cần được làm nổi bật.
3.  **Sử dụng bộ Icon nhất quán:** Đề xuất sử dụng một thư viện icon chất lượng như **Tabler Icons** hoặc **Lucide Icons**. Tất cả các icon phải có cùng kích thước và độ dày nét.
4.  **Cấu trúc lại dữ liệu menu:** Thay vì viết thẳng các link trong template, hãy cấu trúc lại danh sách menu thành một mảng các đối tượng trong `<script setup>`. Điều này giúp dễ dàng quản lý, thêm/bớt và xử lý quyền hạn sau này. Ví dụ:
    ```javascript
    const menuItems = ref([
      { title: 'Trang chủ', icon: 'icon-home', to: '/' },
      { title: 'Bán Hàng', icon: 'icon-cart', to: '/ban-hang' },
      {
        title: 'Quản lý sản phẩm',
        icon: 'icon-box',
        children: [
          { title: 'Danh sách sản phẩm', to: '/quan-ly-san-pham/danh-sach' },
          // ...
        ]
      },
      // ...
    ]);
    ```

---

## PHẦN 3: YÊU CẦU LẬP TRÌNH CỤ THỂ

Bây giờ, hãy viết lại code cho các file sau đây, áp dụng tất cả các cải tiến đã đề xuất.

### **1. Viết lại `Header.vue`:**
*   Loại bỏ component/element của thanh tìm kiếm.
*   Thêm vào component `Breadcrumbs.vue` (bạn có thể tạo mới component này).
*   Tinh chỉnh lại CSS để có giao diện sạch sẽ, chuyên nghiệp.

### **2. Viết lại `Sidebar.vue`:**
*   Tái cấu trúc lại template, sử dụng `v-for` để duyệt qua mảng `menuItems` đã định nghĩa trong script.
*   Viết lại CSS/SCSS để áp dụng các style mới: font chữ, padding, màu sắc cho trạng thái active/hover.
*   Thêm logic trong script để xử lý việc đóng/mở các sub-menu một cách mượt mà.

### **3. Cập nhật file Layout chính (ví dụ `DefaultLayout.vue`):**
*   Đảm bảo `Sidebar` và `Header` mới được đặt đúng vị trí.
*   Điều chỉnh lại grid layout nếu cần để phần nội dung chính (`<router-view>`) có padding hợp lý và không bị các thành phần khác đè lên.

Hãy trình bày code cho từng file một cách riêng biệt và rõ ràng.