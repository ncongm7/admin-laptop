import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/user/LoginView.vue'
// import ProductVariantsList from '@/views/sanpham/ProductVariantsList.vue'
const routes = [
  // { path: '/', name: 'TrangChu', component: () => import('@/views/TrangChu.vue') },
  { path: '/', name: 'DashBoardView', component: () => import('@/views/DashboardView.vue') },
  { path: '/ban-hang', name: 'SalesView', component: () => import('@/views/SalesView.vue') },
  // { path: '/ban-hang', name: 'ProductsView', component: () => import('@/views/ProductsView.vue') },
  {
    path: '/quan-li-hoa-don',
    name: 'QuanLiHoaDon',
    component: () => import('@/views/QuanLiHoaDon.vue'),
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
    component: () => import('@/views/QuanLiBaoHanh.vue'),
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
    props: true
  },
  {
    path: '/product-variants',
    name: 'ProductVariantsList',
    component: () => import('@/views/sanpham/ProductVariantsList.vue'),
    alias: '/inventory', // Cho phép /inventory cũng vào trang này
  },

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
    path: '/products/:productId/variants/:variantId',
    name: 'ProductDetailView',
    component: () => import('@/components/chitietsanpham/ProductDetailView.vue'),
    meta: { requiresAuth: true, role: ['ADMIN', 'NHAN_VIEN'] },
  },
  {
    path: '/nhan-vien',
    name: 'NhanVien',
    component: () => import('@/components/taikhoan/NhanVien.vue'),
  },
  {
    path: '/nhan-vien/them',
    name: 'NhanVienForm',
    component: () => import('@/components/taikhoan/NhanVienForm.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
