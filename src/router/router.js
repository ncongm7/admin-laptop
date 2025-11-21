import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  // Route đăng nhập - KHÔNG yêu cầu xác thực
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, hideForAuth: true }, // Ẩn khi đã đăng nhập
  },

  // Các route cần bảo vệ - YÊU CẦU xác thực
  {
    path: '/',
    name: 'DashBoardView',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ban-hang',
    name: 'SalesView',
    component: () => import('@/views/banhang/SalesView.vue'),
    meta: { requiresAuth: true },
  },
  // { path: '/ban-hang', name: 'ProductsView', component: () => import('@/views/ProductsView.vue') },
  {
    path: '/quan-li-hoa-don',
    name: 'QuanLiHoaDon',
    component: () => import('@/views/QuanLiHoaDon.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/quan-li-hoa-don/chi-tiet/:code',
    name: 'ChiTietHoaDon',
    component: () => import('@/components/hoadon/ChiTietHoaDon.vue'),
  },
  {
    path: '/quan-li-tai-khoan',
    name: 'QuanLiTaiKhoan',
    component: () => import('@/views/QuanLiTaiKhoan.vue'),
  },
  {
    path: '/quan-li-giam-gia',
    name: 'QuanLiGiamGia',
    component: () => import('@/views/dotgiamgia/QuanLiGiamGia.vue'),
  },
  {
    path: '/quan-li-giam-gia/add',
    name: 'AddDiscountCampaign',
    component: () => import('@/views/AddDiscountCampaign.vue'),
  },
  {
    path: '/quan-li-giam-gia/edit/:id',
    name: 'EditDiscountCampaign',
    component: () => import('@/views/AddDiscountCampaign.vue'),
  },
  { path: '/thong-ke', name: 'ThongKe', component: () => import('@/views/ThongKe.vue') },
  {
    path: '/quan-li-tra-hang',
    name: 'QuanLiTraHang',
    component: () => import('@/views/QuanLiTraHang.vue'),
  },
  {
    path: '/quan-li-bao-hanh',
    name: 'QuanLiBaoHanh',
    component: () => import('@/views/baohanh/QuanLiBaoHanhView.vue'),
  },
  {
    path: '/quan-li-bao-hanh/chi-tiet/:id',
    name: 'PhieuBaoHanhDetail',
    component: () => import('@/views/baohanh/PhieuBaoHanhDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/quan-li-thong-bao',
    name: 'QuanLiThongBao',
    component: () => import('@/views/QuanLiThongBao.vue'),
  },
  {
    path: '/quan-li-he-thong',
    name: 'QuanLiHeThong',
    component: () => import('@/views/QuanLiHeThong.vue'),
  },
  {
    path: '/quan-li-san-pham',
    name: 'QuanLiSanPham',
    component: () => import('@/views/QuanLiSanPham.vue'),
  },
  {
    path: '/quan-li-bien-the',
    name: 'QuanLiBienThe',
    component: () => import('@/views/QuanLiBienThe.vue'),
  },
  {
    path: '/thuoc-tinh-san-pham',
    name: 'ThuocTinhSanPham',
    component: () => import('@/views/ThuocTinhSanPham.vue'),
  },
  {
    path: '/quan-li-phieu-giam-gia',
    name: 'QuanLiPhieuGiamGia',
    component: () => import('@/views/phieugiamgia/QuanLiPhieuGiamGia.vue'),
  },
  {
    path: '/quan-li-phieu-giam-gia/add',
    name: 'AddPhieuGiamGia',
    component: () => import('@/views/AddPhieuGiamGia.vue'),
  },
  {
    path: '/quan-li-phieu-giam-gia/:id',
    name: 'DetailPhieuGiamGia',
    component: () => import('@/views/DetailPhieuGiamGia.vue'),
  },
  {
    path: '/quan-li-phieu-giam-gia/edit/:id',
    name: 'EditPhieuGiamGia',
    component: () => import('@/views/AddPhieuGiamGia.vue'),
    props: true,
  },
  // {
  //   path: '/product-variants',
  //   name: 'ProductVariantsList',
  //   component: () => import('@/views/sanpham/ProductVariantsList.vue'),
  //   alias: '/inventory', // Cho phép /inventory cũng vào trang này
  // },

  {
    path: '/products/:productId/variants',
    name: 'ProductDetailManagement',
    component: () => import('@/views/sanpham/viewsanpham/ProductDetailManagement.vue'),
    meta: { requiresAuth: true, role: ['ADMIN', 'NHAN_VIEN'] },
  },
  {
    path: '/products/:productId/detail',
    name: 'ProductDetail',
    component: () => import('@/views/sanpham/viewsanpham/ProductDetailManagement.vue'),
    meta: { requiresAuth: true, role: ['ADMIN', 'NHAN_VIEN'] },
  },

  {
    path: '/nhan-vien',
    name: 'NhanVien',
    component: () => import('@/components/taikhoan/nhanvien/NhanVien.vue'),
  },
  {
    path: '/nhan-vien/them',
    name: 'NhanVienForm',
    component: () => import('@/components/taikhoan/nhanvien/NhanVienForm.vue'),
  },
  // Route /login đã được định nghĩa ở đầu file với meta.requiresAuth
  {
    path: '/nhan-vien/sua/:id',
    name: 'NhanVienUpdateForm',
    component: () => import('@/components/taikhoan/nhanvien/NhanVienUpdateForm.vue'),
    props: true,
  },

  ///Long phiếu giảm giá v2
  {
    path: '/phieu-giam-gia2',
    name: 'QuanLiPhieuGiamGiaV2',
    component: () => import('@/views/phieugiamgia/QuanLiPhieuGiamGia.vue'),
  },
  {
    path: '/phieu-giam-gia2/add',
    name: 'AddPhieuGiamGiaV2',
    component: () => import('@/components/phieugiamgia/PhieuGiamGiaFormComponent.vue'),
  },
  {
    path: '/phieu-giam-gia2/detail/:id',
    name: 'DetailPhieuGiamGiaV2',
    component: () => import('@/components/phieugiamgia/PhieuGiamGiaFormComponent.vue'),
    props: true,
  },
  {
    path: '/phieu-giam-gia2/edit/:id',
    name: 'EditPhieuGiamGiaV2',
    component: () => import('@/components/phieugiamgia/PhieuGiamGiaFormComponent.vue'),
    props: true,
  },
  {
    path: '/dot-giam-gia',
    name: 'QuanLiDotGiamGia',
    component: () => import('@/views/dotgiamgia/QuanLiGiamGia.vue'),
  },
  {
    path: '/dot-giam-gia/add',
    name: 'AddDotGiamGia',
    component: () => import('@/components/giamgia/DotGiamGiaFormComponnent.vue'),
  },
  {
    path: '/dot-giam-gia/detail/:id',
    name: 'DetailDotGiamGia',
    component: () => import('@/components/giamgia/DotGiamGiaFormComponnent.vue'),
    props: true,
  },
  {
    path: '/dot-giam-gia/edit/:id',
    name: 'EditDotGiamGia',
    component: () => import('@/components/giamgia/DotGiamGiaFormComponnent.vue'),
    props: true,
  },
  //Chi tiet dot giam gia
  {
    path: '/chi-tiet-giam-gia/:id',
    name: 'DotGiamGiaChiTietView',
    component: () => import('@/views/dotgiamgia/DotGiamGiaChiTietView.vue'),
    props: true,
  },
  //Lịch Sử Bảo Hành
  {
    path: '/lich-su-bao-hanh/:id',
    name: 'LichSuBaoHanhView',
    component: () => import('@/views/baohanh/LichSuBaoHanhView.vue'),
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ==================== NAVIGATION GUARDS ====================
/**
 * Bảo vệ các route yêu cầu xác thực
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Khởi tạo auth store từ localStorage nếu chưa có (lần đầu load app)
  // Điều này đảm bảo token được khôi phục ngay lập tức
  if (!authStore.token && localStorage.getItem('token')) {
    console.log('→ Khôi phục token từ localStorage trong router guard')
    authStore.initialize()
  }

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth !== false // Mặc định tất cả routes đều yêu cầu auth trừ khi set false
  const hideForAuth = to.meta.hideForAuth === true

  console.log('Navigation Guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    requiresAuth,
    hideForAuth,
    hasToken: !!authStore.token,
  })

  // Nếu route yêu cầu xác thực và user chưa đăng nhập
  if (requiresAuth && !isAuthenticated) {
    console.log('→ Chuyển hướng đến /login (chưa đăng nhập)')
    next('/login')
    return
  }

  // Nếu user đã đăng nhập và cố vào trang login
  if (hideForAuth && isAuthenticated) {
    console.log('→ Chuyển hướng đến / (đã đăng nhập)')
    next('/')
    return
  }

  // Cho phép tiếp tục
  console.log('→ Cho phép truy cập:', to.path)
  next()
})

export default router
