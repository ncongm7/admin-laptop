import { ref } from 'vue'

let chartInstance = null

export function useChart() {
  // Khởi tạo chart (Chart.js) trên element truyền vào
  function initChart(el, config) {
    if (!el) return
    // Nếu đã có chart cũ thì destroy trước
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    // Chart.js có thể đã được import toàn cục, hoặc gắn vào window.Chart
    const Chart = window.Chart
    if (!Chart) {
      // Nếu chưa có Chart.js thì báo lỗi
      // eslint-disable-next-line no-console
      console.error('Chart.js chưa được import vào project!')
      return
    }
    chartInstance = new Chart(el, config)
  }

  // Cập nhật dữ liệu chart
  function updateChart(newData, newOptions) {
    if (!chartInstance) return
    if (newData) {
      chartInstance.data = newData
    }
    if (newOptions) {
      chartInstance.options = { ...chartInstance.options, ...newOptions }
    }
    chartInstance.update()
  }

  // Hủy chart khi không dùng nữa (nếu cần)
  function destroyChart() {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
  }

  return {
    initChart,
    updateChart,
    destroyChart
  }
}
