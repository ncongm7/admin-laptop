// FILE: src/stores/phieuGiamGiaStore.js
import { defineStore } from 'pinia';
import * as phieuGiamGiaService from '@/service/phieugiamgia/PhieuGiamGiaService';
import * as phieuGiamGiaKhachHangService from '@/service/phieugiamgia/PhieuGiamGiaKhachHangService';

export const usePhieuGiamGiaStore = defineStore('phieuGiamGia', {
  state: () => ({
    danhSachPhieuGiamGia: [],
    phieuGiamGiaHienTai: null,
    loading: false,
    error: null,
    ketQuaKiemTra: null
  }),

  getters: {
    phieuGiamGiaHopLe: (state) => state.danhSachPhieuGiamGia.filter(pgg => pgg.trangThai === 1),
  },

  actions: {
    async fetchDanhSachPhieuGiamGia() {
      this.loading = true;
      this.error = null;
      try {
        const response = await phieuGiamGiaService.getVouchers();
        this.danhSachPhieuGiamGia = response.data || [];
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchPhieuGiamGiaCuaKhachHang(khachHangId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await phieuGiamGiaKhachHangService.getPhieuGiamGiaCuaKhachHang(khachHangId);
        this.danhSachPhieuGiamGia = response.data || [];
        return response.data || [];
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async kiemTraVaApDungPhieuGiamGia(ma, khachHangId, tongTienHoaDon) {
      this.loading = true;
      this.error = null;
      try {
        const response = await phieuGiamGiaKhachHangService.kiemTraVaApDungPhieuGiamGia(ma, khachHangId, tongTienHoaDon);
        this.ketQuaKiemTra = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        this.ketQuaKiemTra = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    resetKetQuaKiemTra() {
      this.ketQuaKiemTra = null;
      this.error = null;
    }
  }
});

