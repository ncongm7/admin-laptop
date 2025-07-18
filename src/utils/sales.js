import { ref, reactive } from 'vue'

/**
 * Store quản lý trạng thái bán hàng (sales)
 * - Danh sách sản phẩm đã chọn để bán
 * - Thông tin khách hàng
 * - Thông tin IMEI đã quét
 * - Các thao tác thêm/xóa sản phẩm, cập nhật khách hàng, reset đơn hàng
 */

const saleProducts = ref([]) // [{ product, imei, quantity }]
const customer = ref(null)   // { name, phone, ... }
const scannedImeis = ref([]) // [imei string]

function addProductToSale(product, imei = null, quantity = 1) {
    // Nếu sản phẩm có IMEI, kiểm tra trùng IMEI
    if (imei) {
        if (scannedImeis.value.includes(imei)) {
            return false // IMEI đã tồn tại
        }
        scannedImeis.value.push(imei)
    }
    saleProducts.value.push({
        product,
        imei,
        quantity
    })
    return true
}

function removeProductFromSale(index) {
    const removed = saleProducts.value.splice(index, 1)[0]
    if (removed && removed.imei) {
        // Xóa IMEI khỏi danh sách đã quét
        scannedImeis.value = scannedImeis.value.filter(i => i !== removed.imei)
    }
}

function setCustomerInfo(cust) {
    customer.value = cust
}

function resetSale() {
    saleProducts.value = []
    customer.value = null
    scannedImeis.value = []
}

function updateProductQuantity(index, quantity) {
    if (saleProducts.value[index]) {
        saleProducts.value[index].quantity = quantity
    }
}


export function useSalesStore() {
    return {
        saleProducts,
        customer,
        scannedImeis,
        addProductToSale,
        removeProductFromSale,
        setCustomerInfo,
        resetSale,
        updateProductQuantity
    }
}
// The duplicate export and function declaration for useSalesStore is causing the error.
// Remove the redundant export/function below, as it is already declared above.
