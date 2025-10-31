# YÊU CẦU NÂNG CẤP VÀ THIẾT KẾ THÔNG MINH CHO CHỨC NĂNG VOUCHER/KHUYẾN MÃI

**Bối cảnh:** Bạn là một chuyên gia về hệ thống khuyến mãi và là một Full-stack Developer. Chức năng bán hàng của tôi đã hoạt động, nhưng phần áp dụng voucher còn rất đơn giản và thụ động (chỉ nhập mã) or là  chưa có api . Tôi muốn bạn nâng cấp nó trở nên **thông minh, chủ động và hiệu quả hơn** cho nhân viên bán hàng.

**Ràng buộc quan trọng:**
*   **KHÔNG được sửa logic của các module khuyến mãi backend đã có** (ví dụ: các API tạo/sửa/xóa `PhieuGiamGia` hoặc `DotGiamGia`). Đây là phần code của người khác.
*   **CHỈ được phép sửa đổi logic trong phạm vi chức năng bán hàng của tôi** (cả backend và frontend) để tích hợp hệ thống gợi ý này.

**Nhiệm vụ của bạn:**
1.  **Phân tích & Tư vấn:** Rà soát lại các bảng `PhieuGiamGia` và `DotGiamGia` trong DB. Dựa vào đó, đề xuất một hệ thống **gợi ý voucher thông minh** ngay trên giao diện bán hàng.
2.  **Hoàn thiện Backend:** Viết một API mới chuyên dụng cho việc gợi ý voucher.
3.  **Thiết kế lại Frontend:** Tái cấu trúc lại khu vực áp dụng khuyến mãi trên giao diện bán hàng để hiển thị các gợi ý một cách trực quan và dễ sử dụng.

---

## PHẦN 1: PHÂN TÍCH VÀ ĐỀ XUẤT GIẢI PHÁP

1.  **Phân tích tự động:**
    *   **Quét cấu trúc bảng `PhieuGiamGia`:** Phân tích các cột như `loai_phieu_giam_gia`, `hoa_don_toi_thieu`, `ngay_bat_dau`, `ngay_ket_thuc`, `rieng_tu`... để hiểu các loại khuyến mãi hệ thống đang có.
    *   **Quét giao diện bán hàng hiện tại:** Xem lại component/khu vực áp dụng voucher trong file `SalesView.vue` hoặc `/components/banhang/InvoiceDetails.vue` của tôi để hiểu thiết kế cũ.

2.  **Đề xuất giải pháp thông minh (Tư vấn của chuyên gia):**
    > **Vấn đề:** Nhân viên không thể nhớ hết các mã voucher và điều kiện áp dụng. Việc nhập mã thủ công rất chậm và dễ bỏ lỡ cơ hội bán hàng.
    >
    > **Giải pháp đề xuất:** Chúng ta sẽ xây dựng một API "Gợi ý Khuyến mãi". API này sẽ nhận vào thông tin của hóa đơn hiện tại (tổng tiền, danh sách sản phẩm, ID khách hàng) và trả về một danh sách các voucher **đủ điều kiện áp dụng**.
    >
    > **Trên giao diện:** Thay vì chỉ có một ô nhập mã, chúng ta sẽ hiển thị một nút **"Chọn khuyến mãi"**. Khi click vào, một Modal/Popup sẽ hiện ra, liệt kê tất cả các voucher hợp lệ. Nhân viên chỉ cần nhìn, tư vấn cho khách và chọn một cái phù hợp nhất.

---

## PHẦN 2: YÊU CẦU CÔNG VIỆC CỤ THỂ

### **A. Hoàn thiện Backend (Trong phạm vi chức năng Bán hàng)**

*   **Tạo API Gợi ý Voucher Mới:**
    *   **Controller:** `BanHangTaiQuayController.java` (hoặc Controller tương ứng).
    *   **Endpoint:** `GET /api/v1/ban-hang/hoa-don/{idHoaDon}/goi-y-voucher`
    *   **Logic trong Service `BanHangTaiQuayService.java`:**
        1.  Nhận `idHoaDon`.
        2.  Lấy thông tin của hóa đơn chờ đó: `tong_tien`, `id_khach_hang`.
        3.  Thực hiện một query đến bảng `PhieuGiamGia` để tìm tất cả các voucher thỏa mãn **ĐỒNG THỜI** các điều kiện sau:
            *   Còn hiệu lực (`ngay_bat_dau` <= now <= `ngay_ket_thuc`).
            *   Còn số lượng sử dụng (`so_luong_dung > 0`).
            *   Hóa đơn hiện tại đủ điều kiện về giá trị tối thiểu (`hoa_don.tong_tien >= phieu_giam_gia.hoa_don_toi_thieu`).
            *   Là voucher công khai (`rieng_tu = false`) HOẶC là voucher riêng tư dành cho khách hàng này (cần thêm logic kiểm tra nếu có).
        4. Vì giảm giá nó có rất nhiều thể loại nên bạn cần chú trọng nếu ở code backend của người khác có : ví dụ như giảm giá trên hóa đơn, đợt giảm giá ,trên sản phẩm chi tiết chả hạn thì bổ sung và thiết kế thoogn minh....
        4.  **Trả về:** Một danh sách các đối tượng `PhieuGiamGia`và Dợt giảm giá nếu có , hợp lệ.

*   **Sửa API Áp dụng Voucher (Nếu cần):**
    *   Đảm bảo API hiện tại (ví dụ `POST /api/v1/ban-hang/hoa-don/ap-dung-voucher`) nhận vào `id_phieu_giam_gia` thay vì mã code. Điều này giúp việc áp dụng từ danh sách gợi ý trở nên trực tiếp và dễ dàng hơn.

### **B. Tái cấu trúc và Hoàn thiện Frontend**

**1. Sửa Component Chi tiết Hóa đơn (`InvoiceDetails.vue` hoặc tương tự):**
    *   **Thay đổi UI:**
        *   **Xóa ô input "Nhập mã voucher" cũ.**
        *   Thay vào đó, tạo một khu vực mới:
            *   Nếu chưa có voucher nào được áp dụng, hiển thị một nút **`Chọn Khuyến Mãi`** (có thể kèm icon quà tặng).
            *   Nếu đã có voucher được áp dụng, hiển thị tên voucher và số tiền được giảm (ví dụ: "Đã áp dụng `GIAM10%`: -250.000đ") kèm theo một nút "Xóa/Thay đổi" (icon 'x').
    *   **Logic:**
        *   Khi click nút `Chọn Khuyến Mãi`, mở Modal `VoucherSuggestionModal.vue`.
        *   Khi click nút "Xóa/Thay đổi", gọi API để gỡ bỏ voucher khỏi hóa đơn và mở lại Modal.

**2. Tạo mới Component `VoucherSuggestionModal.vue`:**
    *   **Mục đích:** Đây là trái tim của tính năng mới.
    *   **Props:** Nhận vào `idHoaDon` hiện tại.
    *   **Logic trong `<script setup>`:**
        1.  Khi Modal được mở, nó sẽ tự động gọi API mới (`GET .../goi-y-voucher`) để lấy danh sách các voucher hợp lệ.
        2.  Hiển thị một spinner loading trong khi chờ API.
        3.  Nếu không có voucher nào, hiển thị thông báo "Không có khuyến mãi nào phù hợp".
    *   **Thiết kế (UI):** nếu ở bakcend có đầy đủ các trường dữ liệu như vậy
        *   Hiển thị danh sách các voucher dưới dạng các card trực quan.
        *   Mỗi card voucher phải hiển thị rõ ràng:
            *   **Tên voucher** (ví dụ: "Giảm 10% tối đa 1 triệu").
            *   **Mã voucher** (ví dụ: `GIAM10PT`).
            *   **Điều kiện áp dụng** (ví dụ: "Cho đơn từ 10.000.000đ").
            *   **Ngày hết hạn**.
            *   Một nút **`Áp Dụng`** trên mỗi card.
    *   **Sự kiện:**
        *   Khi nhân viên click nút `Áp Dụng` trên một voucher, component này sẽ `emit` một sự kiện (ví dụ: `voucher-selected`) cùng với `id` của voucher được chọn.
        *   `SalesView.vue` sẽ lắng nghe sự kiện này, gọi API để áp dụng voucher vào hóa đơn, và cập nhật lại giao diện.

**3. Cập nhật Service API ở Frontend:**
    *   Trong `/src/api/banHangService.js`, thêm hàm mới `getVoucherSuggestions(idHoaDon)`.
    *   Sửa lại hoặc tạo mới hàm `applyVoucher(idHoaDon, idVoucher)` và `removeVoucher(idHoaDon)`.

---

**Tóm tắt yêu cầu:**
1.  **Backend:** Tạo một API thông minh `goi-y-voucher` dựa trên hóa đơn hiện tại.
2.  **Frontend:**
    *   Thiết kế lại khu vực khuyến mãi, thay ô nhập liệu bằng nút "Chọn Khuyến Mãi".
    *   Xây dựng một Modal `VoucherSuggestionModal.vue` hoàn toàn mới để hiển thị danh sách voucher gợi ý một cách trực quan.
    *   Kết nối toàn bộ luồng logic để nhân viên có thể chọn và áp dụng khuyến mãi một cách dễ dàng.
    *   Tái sử dụng và sửa đổi các component hiện có một cách hợp lý.

Hãy bắt đầu với việc xây dựng API gợi ý ở Backend trước.