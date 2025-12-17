import Swal from 'sweetalert2'

export const showConfirmation = (title = 'Bạn có chắc chắn thực hiện?', text = '', callback) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy'
  }).then((result) => {
    if (result.isConfirmed) {
      if (typeof callback === 'function') {
        callback()
      }
      return true
    }
    return false
  })
}

export const showSuccess = (title = 'Thực hiện thành công', text = '') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonText: 'OK',
    timer: 2000,
    timerProgressBar: true
  })
}

export const showError = (title = 'Có lỗi xảy ra', text = '') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonText: 'Đóng'
  })
}
