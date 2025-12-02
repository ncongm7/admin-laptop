import axiosInstance from '../axiosInstance'

/**
 * ========================================
 * DELIVERY SERVICE ABSTRACTION LAYER
 * ========================================
 * 
 * Service này cung cấp abstraction layer cho các API giao hàng bên thứ 3.
 * Dễ dàng thay thế provider (GHN, GHTK, Viettel Post, etc.) mà không cần
 * thay đổi code ở các component khác.
 * 
 * Cách sử dụng:
 * 1. Import deliveryService
 * 2. Gọi các method như createShipment, trackShipment, etc.
 * 3. Để thay đổi provider, chỉ cần sửa implementation trong file này
 * 
 * Các provider có thể tích hợp:
 * - GHN (Giao Hàng Nhanh)
 * - GHTK (Giao Hàng Tiết Kiệm)
 * - Viettel Post
 * - J&T Express
 * - Custom delivery service
 */

/**
 * Delivery Service Interface
 * Tất cả các provider phải implement interface này
 */
class DeliveryServiceInterface {
  /**
   * Tạo đơn giao hàng
   * @param {Object} shipmentData - Dữ liệu đơn hàng
   * @returns {Promise<Object>} Thông tin đơn giao hàng
   */
  async createShipment(shipmentData) {
    throw new Error('createShipment must be implemented')
  }

  /**
   * Theo dõi đơn giao hàng
   * @param {String} trackingCode - Mã vận đơn
   * @returns {Promise<Object>} Thông tin tracking
   */
  async trackShipment(trackingCode) {
    throw new Error('trackShipment must be implemented')
  }

  /**
   * Hủy đơn giao hàng
   * @param {String} trackingCode - Mã vận đơn
   * @returns {Promise<Object>} Kết quả hủy đơn
   */
  async cancelShipment(trackingCode) {
    throw new Error('cancelShipment must be implemented')
  }

  /**
   * Tính phí vận chuyển
   * @param {Object} shippingData - Dữ liệu tính phí
   * @returns {Promise<Object>} Thông tin phí vận chuyển
   */
  async calculateShippingFee(shippingData) {
    throw new Error('calculateShippingFee must be implemented')
  }
}

/**
 * Default Delivery Service (Backend API)
 * Sử dụng API backend hiện tại, có thể tích hợp với provider bên thứ 3
 */
class DefaultDeliveryService extends DeliveryServiceInterface {
  constructor() {
    super()
    this.baseURL = '/api/v1/delivery'
  }

  /**
   * Tạo đơn giao hàng
   * @param {Object} shipmentData - {
   *   hoaDonId: string,
   *   tenNguoiNhan: string,
   *   soDienThoai: string,
   *   diaChi: string,
   *   tinh: string,
   *   huyen: string,
   *   xa: string,
   *   ghiChu?: string,
   *   khoiLuong?: number (gram),
   *   giaTriHang?: number (VND)
   * }
   */
  async createShipment(shipmentData) {
    try {
      console.log('📦 [DeliveryService] Tạo đơn giao hàng:', shipmentData)
      
      const response = await axiosInstance.post(`${this.baseURL}/create`, shipmentData)
      
      // Extract data từ ResponseObject
      const data = response.data?.data || response.data
      
      console.log('✅ [DeliveryService] Đơn giao hàng đã được tạo:', data)
      return {
        success: true,
        trackingCode: data.trackingCode || data.maVanDon,
        provider: data.provider || 'DEFAULT',
        estimatedDeliveryDate: data.estimatedDeliveryDate,
        shippingFee: data.shippingFee,
        data: data
      }
    } catch (error) {
      console.error('❌ [DeliveryService] Lỗi khi tạo đơn giao hàng:', error)
      throw new Error(error.response?.data?.message || 'Không thể tạo đơn giao hàng')
    }
  }

  /**
   * Theo dõi đơn giao hàng
   * @param {String} trackingCode - Mã vận đơn
   */
  async trackShipment(trackingCode) {
    try {
      console.log('🔍 [DeliveryService] Theo dõi đơn giao hàng:', trackingCode)
      
      const response = await axiosInstance.get(`${this.baseURL}/track/${trackingCode}`)
      
      const data = response.data?.data || response.data
      
      console.log('✅ [DeliveryService] Thông tin tracking:', data)
      return {
        success: true,
        trackingCode: data.trackingCode || trackingCode,
        status: data.status,
        currentLocation: data.currentLocation,
        timeline: data.timeline || [],
        estimatedDeliveryDate: data.estimatedDeliveryDate,
        data: data
      }
    } catch (error) {
      console.error('❌ [DeliveryService] Lỗi khi theo dõi đơn giao hàng:', error)
      throw new Error(error.response?.data?.message || 'Không thể theo dõi đơn giao hàng')
    }
  }

  /**
   * Hủy đơn giao hàng
   * @param {String} trackingCode - Mã vận đơn
   */
  async cancelShipment(trackingCode) {
    try {
      console.log('🚫 [DeliveryService] Hủy đơn giao hàng:', trackingCode)
      
      const response = await axiosInstance.post(`${this.baseURL}/cancel/${trackingCode}`)
      
      const data = response.data?.data || response.data
      
      console.log('✅ [DeliveryService] Đã hủy đơn giao hàng:', data)
      return {
        success: true,
        message: data.message || 'Đã hủy đơn giao hàng thành công',
        data: data
      }
    } catch (error) {
      console.error('❌ [DeliveryService] Lỗi khi hủy đơn giao hàng:', error)
      throw new Error(error.response?.data?.message || 'Không thể hủy đơn giao hàng')
    }
  }

  /**
   * Tính phí vận chuyển
   * @param {Object} shippingData - {
   *   from: { tinh, huyen, xa },
   *   to: { tinh, huyen, xa },
   *   khoiLuong: number (gram),
   *   giaTriHang: number (VND)
   * }
   */
  async calculateShippingFee(shippingData) {
    try {
      console.log('💰 [DeliveryService] Tính phí vận chuyển:', shippingData)
      
      const response = await axiosInstance.post(`${this.baseURL}/calculate-fee`, shippingData)
      
      const data = response.data?.data || response.data
      
      console.log('✅ [DeliveryService] Phí vận chuyển:', data)
      return {
        success: true,
        shippingFee: data.shippingFee || 0,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        provider: data.provider || 'DEFAULT',
        data: data
      }
    } catch (error) {
      console.error('❌ [DeliveryService] Lỗi khi tính phí vận chuyển:', error)
      // Không throw error, trả về phí mặc định
      return {
        success: false,
        shippingFee: 0,
        message: error.response?.data?.message || 'Không thể tính phí vận chuyển'
      }
    }
  }
}

/**
 * GHN (Giao Hàng Nhanh) Service Implementation
 * TODO: Implement khi cần tích hợp GHN
 */
class GHNDeliveryService extends DeliveryServiceInterface {
  constructor() {
    super()
    this.apiKey = process.env.VUE_APP_GHN_API_KEY || ''
    this.shopId = process.env.VUE_APP_GHN_SHOP_ID || ''
    this.baseURL = 'https://online-gateway.ghn.vn/shipping-order/v2'
  }

  async createShipment(shipmentData) {
    // TODO: Implement GHN API integration
    throw new Error('GHN integration not yet implemented')
  }

  async trackShipment(trackingCode) {
    // TODO: Implement GHN tracking
    throw new Error('GHN tracking not yet implemented')
  }

  async cancelShipment(trackingCode) {
    // TODO: Implement GHN cancel
    throw new Error('GHN cancel not yet implemented')
  }

  async calculateShippingFee(shippingData) {
    // TODO: Implement GHN fee calculation
    throw new Error('GHN fee calculation not yet implemented')
  }
}

/**
 * GHTK (Giao Hàng Tiết Kiệm) Service Implementation
 * TODO: Implement khi cần tích hợp GHTK
 */
class GHTKDeliveryService extends DeliveryServiceInterface {
  constructor() {
    super()
    this.token = process.env.VUE_APP_GHTK_TOKEN || ''
    this.baseURL = 'https://services.giaohangtietkiem.vn/services'
  }

  async createShipment(shipmentData) {
    // TODO: Implement GHTK API integration
    throw new Error('GHTK integration not yet implemented')
  }

  async trackShipment(trackingCode) {
    // TODO: Implement GHTK tracking
    throw new Error('GHTK tracking not yet implemented')
  }

  async cancelShipment(trackingCode) {
    // TODO: Implement GHTK cancel
    throw new Error('GHTK cancel not yet implemented')
  }

  async calculateShippingFee(shippingData) {
    // TODO: Implement GHTK fee calculation
    throw new Error('GHTK fee calculation not yet implemented')
  }
}

/**
 * Delivery Service Factory
 * Chọn provider dựa trên config hoặc environment variable
 */
class DeliveryServiceFactory {
  static create(provider = null) {
    // Lấy provider từ env hoặc config
    const selectedProvider = provider || 
                            process.env.VUE_APP_DELIVERY_PROVIDER || 
                            'DEFAULT'

    switch (selectedProvider.toUpperCase()) {
      case 'GHN':
        return new GHNDeliveryService()
      case 'GHTK':
        return new GHTKDeliveryService()
      case 'DEFAULT':
      default:
        return new DefaultDeliveryService()
    }
  }
}

// Export singleton instance
const deliveryService = DeliveryServiceFactory.create()

// Export factory để có thể tạo instance mới với provider khác
export { DeliveryServiceFactory, deliveryService as default }

// Export các class để có thể extend
export { DefaultDeliveryService, GHNDeliveryService, GHTKDeliveryService }

