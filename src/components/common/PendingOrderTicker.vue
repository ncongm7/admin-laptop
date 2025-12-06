<template>
    <div v-if="pendingOrders.length > 0" class="pending-order-ticker">
        <div class="ticker-container" @mouseenter="pauseAnimation" @mouseleave="resumeAnimation">
            <div class="ticker-wrapper">
                <div class="ticker-content" :class="{ 'paused': isPaused }" :key="marqueeKey">
                    <template v-for="(order, index) in pendingOrders" :key="order.id">
                        <button type="button" class="ticker-item" @click.stop="handleTickerClick(order)">
                            {{ formatOrderText(order) }}
                        </button>
                        <span v-if="index < pendingOrders.length - 1" class="ticker-separator"> • </span>
                    </template>
                    <!-- Duplicate để tạo vòng lặp liền mạch -->
                    <template v-for="(order, index) in pendingOrders" :key="`dup-${order.id}`">
                        <button type="button" class="ticker-item" @click.stop="handleTickerClick(order)">
                            {{ formatOrderText(order) }}
                        </button>
                        <span v-if="index < pendingOrders.length - 1" class="ticker-separator"> • </span>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getPendingOnlineOrders } from '@/service/hoaDonService'
import socketService from '@/service/socketService'

const pendingOrders = ref([])
const isLoading = ref(false)
const marqueeKey = ref(0)
const isPaused = ref(false)
const subscriptionIds = ref([])

/**
 * Fetch danh sách đơn hàng chờ từ API
 */
const fetchPendingOrders = async () => {
    try {
        isLoading.value = true
        console.log('🔄 [PendingOrderTicker] Bắt đầu fetch pending orders...')

        const response = await getPendingOnlineOrders()
        console.log('📦 [PendingOrderTicker] Raw response:', response)

        // Extract data từ response - xử lý nhiều format
        let orders = response
        if (response?.data) {
            orders = response.data
        } else if (response?.content) {
            orders = response.content
        } else if (Array.isArray(response)) {
            orders = response
        } else {
            orders = []
        }

        console.log('📋 [PendingOrderTicker] Orders sau khi extract:', orders)
        console.log('📊 [PendingOrderTicker] Số lượng orders:', Array.isArray(orders) ? orders.length : 0)

        // Đảm bảo orders là array và filter chỉ lấy đơn online chưa thanh toán
        if (!Array.isArray(orders)) {
            console.warn('⚠️ [PendingOrderTicker] Orders không phải array:', orders)
            pendingOrders.value = []
        } else {
            // Backend đã filter rồi (loaiHoaDon = 1, trangThai = 0, trangThaiThanhToan = 0)
            // Nên tất cả orders từ API đều hợp lệ, không cần filter lại
            // Chỉ cần đảm bảo format đúng
            pendingOrders.value = orders.map(order => ({
                id: order.id,
                ma: order.ma || order.orderCode || order.code,
                tenKhachHang: order.tenKhachHang || order.ten_khach_hang || order.customerName || 'Khách hàng',
                ngayTao: order.ngayTao || order.ngay_tao || order.createdAt || new Date().toISOString(),
                tongTienSauGiam: order.tongTienSauGiam || order.tong_tien_sau_giam || order.totalAmount || 0,
                loaiHoaDon: order.loaiHoaDon || order.loai_hoa_don || 1,
                trangThai: order.trangThai || order.trang_thai || 0,
                trangThaiThanhToan: order.trangThaiThanhToan || order.trang_thai_thanh_toan || 0
            }))
        }

        console.log('✅ [PendingOrderTicker] Fetched orders:', pendingOrders.value.length)
        console.log('📋 [PendingOrderTicker] Orders detail:', pendingOrders.value)

        // Force re-render marquee khi danh sách thay đổi
        marqueeKey.value++
    } catch (error) {
        console.error('❌ [PendingOrderTicker] Lỗi khi fetch pending orders:', error)
        console.error('❌ [PendingOrderTicker] Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        })
        pendingOrders.value = []
    } finally {
        isLoading.value = false
    }
}

/**
 * Format text hiển thị cho mỗi đơn hàng
 */
const formatOrderText = (order) => {
    const customerName = order.tenKhachHang || order.ten_khach_hang || 'Khách hàng'
    const orderCode = order.ma || order.orderCode || ''
    return `🔔 Khách hàng ${customerName} vừa đặt đơn #${orderCode}`
}

/**
 * Dispatch event để mở modal chi tiết hóa đơn trong trang quản lý hóa đơn
 */
const handleTickerClick = (order) => {
    if (!order?.id && !order?.ma) {
        return
    }

    window.dispatchEvent(
        new CustomEvent('open-invoice-detail', {
            detail: {
                orderId: order.id || null,
                orderCode: order.ma || order.orderCode || null
            }
        })
    )
}

/**
 * Xử lý khi nhận event đơn hàng mới
 */
const handleNewOrder = (data) => {
    console.log('📨 [PendingOrderTicker] Nhận được đơn hàng mới:', data)

    // Chỉ thêm nếu là đơn online và chưa thanh toán
    const isOnline = data.loaiHoaDon === 1 || data.loai_hoa_don === 1
    const isPending = data.trangThai === 0 || data.trang_thai === 0 ||
        data.trangThaiThanhToan === 0 || data.trang_thai_thanh_toan === 0

    if (!isOnline || !isPending) {
        console.log('⚠️ [PendingOrderTicker] Đơn hàng không phải online hoặc đã thanh toán, bỏ qua')
        return
    }

    // Kiểm tra xem đơn hàng đã có trong danh sách chưa
    const existingIndex = pendingOrders.value.findIndex(
        order => order.id === data.orderId || order.ma === data.orderCode
    )

    if (existingIndex === -1) {
        // Thêm đơn hàng mới vào đầu danh sách
        pendingOrders.value.unshift({
            id: data.orderId,
            ma: data.orderCode,
            tenKhachHang: data.customerName,
            ngayTao: data.timestamp || new Date().toISOString(),
            loaiHoaDon: 1,
            trangThai: 0,
            trangThaiThanhToan: 0
        })
        marqueeKey.value++
    } else {
        // Refresh lại danh sách để đảm bảo chính xác
        fetchPendingOrders()
    }
}

/**
 * Xử lý khi nhận event thay đổi trạng thái đơn hàng
 */
const handleStatusChange = (data) => {
    console.log('🔄 [PendingOrderTicker] Nhận được thay đổi trạng thái:', data)

    // Nếu đơn hàng không còn ở trạng thái chờ xác nhận (0) hoặc đã thanh toán, xóa khỏi danh sách
    // Hoặc refresh lại danh sách để đảm bảo chính xác
    if (data.newStatus !== 0 && data.newStatus !== undefined) {
        const index = pendingOrders.value.findIndex(
            order => order.id === data.orderId
        )

        if (index > -1) {
            pendingOrders.value.splice(index, 1)
            marqueeKey.value++
        }
    } else {
        // Nếu trạng thái vẫn là 0, refresh lại danh sách để đảm bảo chính xác
        fetchPendingOrders()
    }
}

/**
 * Pause animation khi hover
 */
const pauseAnimation = () => {
    isPaused.value = true
}

/**
 * Resume animation khi không hover
 */
const resumeAnimation = () => {
    isPaused.value = false
}

/**
 * Subscribe vào WebSocket topics
 */
const subscribeWebSocket = () => {
    // Kiểm tra cả isConnected và client.connected
    if (!socketService.isConnected || !socketService.client?.connected) {
        console.warn('⚠️ [PendingOrderTicker] Socket chưa sẵn sàng, sẽ subscribe sau khi kết nối')
        return
    }

    try {
        // Subscribe vào topic đơn hàng mới
        const newOrderSubId = socketService.subscribe('/topic/new-online-order', handleNewOrder)
        if (newOrderSubId) {
            subscriptionIds.value.push(newOrderSubId)
        }

        // Subscribe vào topic thay đổi trạng thái
        const statusChangeSubId = socketService.subscribe('/topic/order-status-changed', handleStatusChange)
        if (statusChangeSubId) {
            subscriptionIds.value.push(statusChangeSubId)
        }

        // Nếu backend dùng topic chung /topic/orders
        const ordersSubId = socketService.subscribe('/topic/orders', (data) => {
            if (data.type === 'new_online_order' || data.eventType === 'new_online_order') {
                handleNewOrder(data)
            } else if (data.type === 'order_status_changed' || data.eventType === 'order_status_changed') {
                handleStatusChange(data)
            }
        })
        if (ordersSubId) {
            subscriptionIds.value.push(ordersSubId)
        }
    } catch (error) {
        console.error('❌ [PendingOrderTicker] Lỗi khi subscribe:', error)
    }
}

/**
 * Handler khi socket kết nối
 */
const handleSocketConnect = () => {
    console.log('✅ [PendingOrderTicker] Socket đã kết nối, đợi một chút rồi subscribe vào topics')
    // Đợi một chút để đảm bảo STOMP connection hoàn toàn sẵn sàng
    setTimeout(() => {
        subscribeWebSocket()
    }, 150) // Đợi 150ms để đảm bảo connection sẵn sàng
}

/**
 * Unsubscribe từ WebSocket topics
 */
const unsubscribeWebSocket = () => {
    subscriptionIds.value.forEach(subId => {
        socketService.unsubscribe(subId)
    })
    subscriptionIds.value = []
}

// Polling interval ref
let pollInterval = null

// Lifecycle hooks
onMounted(async () => {
    // Fetch data ban đầu
    await fetchPendingOrders()

    // Đăng ký listener cho socket connect
    socketService.on('connect', handleSocketConnect)

    // Subscribe WebSocket nếu đã kết nối
    if (socketService.isConnected) {
        subscribeWebSocket()
    }

    // Polling để đảm bảo data luôn được cập nhật (mỗi 30 giây)
    pollInterval = setInterval(() => {
        if (!isLoading.value) {
            fetchPendingOrders()
        }
    }, 30000) // 30 giây
})

onUnmounted(() => {
    // Cleanup polling
    if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
    }

    // Cleanup socket
    unsubscribeWebSocket()
    socketService.off('connect', handleSocketConnect)
})
</script>

<style scoped>
.pending-order-ticker {
    flex: 1 1 0;
    min-width: 0;
    margin: 0 16px;
    max-width: 100%;
}

.ticker-container {
    width: 100%;
    background-color: #FFFBE6;
    border: 1px solid #FFD666;
    border-radius: 8px;
    padding: 8px 16px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.ticker-wrapper {
    overflow: hidden;
    width: 100%;
}

.ticker-content {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    animation: marquee 30s linear infinite;
    animation-play-state: running;
}

.ticker-content.paused {
    animation-play-state: paused;
}

.ticker-item {
    color: #856404;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0 8px;
    transition: color 0.2s;
    cursor: pointer;
    background: transparent;
    border: none;
}

.ticker-item:hover {
    color: #533f03;
    text-decoration: underline;
}

.ticker-item:focus {
    outline: none;
}

.ticker-separator {
    color: #FFD666;
    font-weight: bold;
    user-select: none;
}

@keyframes marquee {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-50%);
    }
}

/* Responsive: Ẩn trên màn hình nhỏ */
@media (max-width: 768px) {
    .pending-order-ticker {
        display: none;
    }
}

/* Đảm bảo animation mượt mà */
.ticker-content {
    will-change: transform;
}
</style>
