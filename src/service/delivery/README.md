# Delivery Service - Hướng dẫn sử dụng

## Tổng quan

Delivery Service là một abstraction layer cho các API giao hàng bên thứ 3. Service này cho phép bạn dễ dàng thay đổi nhà cung cấp dịch vụ giao hàng (GHN, GHTK, Viettel Post, etc.) mà không cần thay đổi code ở các component khác.

## Cấu trúc

```
src/service/delivery/
├── deliveryService.js    # Main service file
└── README.md             # File này
```

## Cách sử dụng

### 1. Import service

```javascript
import deliveryService from '@/service/delivery/deliveryService'
```

### 2. Tạo đơn giao hàng

```javascript
const shipmentData = {
  hoaDonId: 'uuid-cua-hoa-don',
  tenNguoiNhan: 'Nguyễn Văn A',
  soDienThoai: '0123456789',
  diaChi: '123 Đường ABC',
  tinh: 'Hà Nội',
  huyen: 'Quận 1',
  xa: 'Phường XYZ',
  ghiChu: 'Giao hàng trong giờ hành chính',
  khoiLuong: 1000, // gram
  giaTriHang: 5000000 // VND
}

try {
  const result = await deliveryService.createShipment(shipmentData)
  console.log('Mã vận đơn:', result.trackingCode)
  console.log('Phí vận chuyển:', result.shippingFee)
} catch (error) {
  console.error('Lỗi:', error.message)
}
```

### 3. Theo dõi đơn giao hàng

```javascript
try {
  const tracking = await deliveryService.trackShipment('TRACKING_CODE')
  console.log('Trạng thái:', tracking.status)
  console.log('Vị trí hiện tại:', tracking.currentLocation)
  console.log('Timeline:', tracking.timeline)
} catch (error) {
  console.error('Lỗi:', error.message)
}
```

### 4. Tính phí vận chuyển

```javascript
const shippingData = {
  from: {
    tinh: 'Hà Nội',
    huyen: 'Quận 1',
    xa: 'Phường ABC'
  },
  to: {
    tinh: 'TP. Hồ Chí Minh',
    huyen: 'Quận 1',
    xa: 'Phường XYZ'
  },
  khoiLuong: 1000, // gram
  giaTriHang: 5000000 // VND
}

try {
  const result = await deliveryService.calculateShippingFee(shippingData)
  console.log('Phí vận chuyển:', result.shippingFee)
  console.log('Thời gian dự kiến:', result.estimatedDeliveryTime)
} catch (error) {
  console.error('Lỗi:', error.message)
}
```

### 5. Hủy đơn giao hàng

```javascript
try {
  const result = await deliveryService.cancelShipment('TRACKING_CODE')
  console.log('Kết quả:', result.message)
} catch (error) {
  console.error('Lỗi:', error.message)
}
```

## Thay đổi Provider

### Cách 1: Sử dụng Environment Variable

Thêm vào file `.env`:

```env
VUE_APP_DELIVERY_PROVIDER=GHN
VUE_APP_GHN_API_KEY=your-api-key
VUE_APP_GHN_SHOP_ID=your-shop-id
```

### Cách 2: Sử dụng Factory

```javascript
import { DeliveryServiceFactory } from '@/service/delivery/deliveryService'

// Tạo instance với provider cụ thể
const ghnService = DeliveryServiceFactory.create('GHN')
const ghtkService = DeliveryServiceFactory.create('GHTK')
const defaultService = DeliveryServiceFactory.create('DEFAULT')
```

## Tích hợp Provider mới

### Bước 1: Tạo class mới extends DeliveryServiceInterface

```javascript
import { DeliveryServiceInterface } from './deliveryService'

class YourProviderService extends DeliveryServiceInterface {
  constructor() {
    super()
    this.apiKey = process.env.VUE_APP_YOUR_PROVIDER_API_KEY
    this.baseURL = 'https://api.yourprovider.com'
  }

  async createShipment(shipmentData) {
    // Implement logic tạo đơn giao hàng
    const response = await axios.post(`${this.baseURL}/create`, {
      // Map shipmentData sang format của provider
    })
    return {
      success: true,
      trackingCode: response.data.tracking_code,
      provider: 'YOUR_PROVIDER',
      // ...
    }
  }

  async trackShipment(trackingCode) {
    // Implement logic tracking
  }

  async cancelShipment(trackingCode) {
    // Implement logic hủy đơn
  }

  async calculateShippingFee(shippingData) {
    // Implement logic tính phí
  }
}
```

### Bước 2: Thêm vào Factory

```javascript
// Trong DeliveryServiceFactory.create()
case 'YOUR_PROVIDER':
  return new YourProviderService()
```

### Bước 3: Export class mới

```javascript
export { YourProviderService }
```

## Providers hiện có

### 1. DEFAULT
- Sử dụng API backend hiện tại
- Endpoint: `/api/v1/delivery`
- Không cần API key

### 2. GHN (Giao Hàng Nhanh)
- Status: Chưa implement (TODO)
- Cần API key và Shop ID
- Documentation: https://api.ghn.vn/

### 3. GHTK (Giao Hàng Tiết Kiệm)
- Status: Chưa implement (TODO)
- Cần Token
- Documentation: https://docs.giaohangtietkiem.vn/

## Lưu ý

1. **Error Handling**: Tất cả các method đều throw error nếu có lỗi. Luôn sử dụng try-catch khi gọi service.

2. **Response Format**: Tất cả các method đều trả về object với format:
   ```javascript
   {
     success: true/false,
     trackingCode: string,
     provider: string,
     data: object, // Raw response từ provider
     // ... các field khác tùy method
   }
   ```

3. **Backend Integration**: Service DEFAULT sử dụng backend API. Đảm bảo backend có các endpoint tương ứng:
   - `POST /api/v1/delivery/create`
   - `GET /api/v1/delivery/track/:trackingCode`
   - `POST /api/v1/delivery/cancel/:trackingCode`
   - `POST /api/v1/delivery/calculate-fee`

4. **Testing**: Khi test với provider mới, nên test với sandbox/test environment trước.

## Ví dụ sử dụng trong Component

```vue
<template>
  <div>
    <button @click="createShipment">Tạo đơn giao hàng</button>
    <button @click="trackShipment">Theo dõi đơn hàng</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import deliveryService from '@/service/delivery/deliveryService'

const trackingCode = ref('')

const createShipment = async () => {
  try {
    const result = await deliveryService.createShipment({
      hoaDonId: 'xxx',
      tenNguoiNhan: 'Nguyễn Văn A',
      // ...
    })
    trackingCode.value = result.trackingCode
    alert('Tạo đơn giao hàng thành công!')
  } catch (error) {
    alert('Lỗi: ' + error.message)
  }
}

const trackShipment = async () => {
  if (!trackingCode.value) {
    alert('Vui lòng nhập mã vận đơn')
    return
  }
  
  try {
    const result = await deliveryService.trackShipment(trackingCode.value)
    console.log('Trạng thái:', result.status)
  } catch (error) {
    alert('Lỗi: ' + error.message)
  }
}
</script>
```

## Troubleshooting

### Lỗi "createShipment must be implemented"
- Provider chưa được implement đầy đủ
- Kiểm tra lại class implementation

### Lỗi "Không thể tạo đơn giao hàng"
- Kiểm tra API key/credentials
- Kiểm tra network connection
- Kiểm tra format dữ liệu đầu vào

### Lỗi 404 khi gọi DEFAULT service
- Backend chưa có endpoint tương ứng
- Kiểm tra route trong backend

## Liên hệ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.

