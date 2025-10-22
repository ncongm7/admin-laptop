import { defineStore } from 'pinia'
import { ref } from 'vue'
import userApi from '@/service/ApiUser'

export const useUserStore = defineStore('user', () => {
    const user = ref(null)
    const token = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Đăng nhập
    const login = async (credentials) => {
        loading.value = true
        error.value = null
        try {
            const data = await userApi.login(credentials)
            user.value = data.user
            token.value = data.token
            // Lưu vào localStorage để giữ đăng nhập
            localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('token', data.token)
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Đăng nhập thất bại'
            return false
        } finally {
            loading.value = false
        }
    }

    // Đăng xuất
    const logout = () => {
        user.value = null
        token.value = null
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    // Khôi phục trạng thái khi load lại trang
    const restore = () => {
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('token')
        if (savedUser && savedToken) {
            user.value = JSON.parse(savedUser)
            token.value = savedToken
        }
    }

    return { user, token, loading, error, login, logout, restore }
})
