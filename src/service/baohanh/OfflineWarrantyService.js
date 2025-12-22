import axiosInstance from '@/service/common/axiosInstance';

class OfflineWarrantyService {
    searchSoldSerials(keyword) {
        return axiosInstance.get('/api/serial/sold', {
            params: { keyword }
        });
    }
}

export default new OfflineWarrantyService();
