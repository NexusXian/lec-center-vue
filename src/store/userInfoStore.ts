import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserInfoStore = defineStore('userInfo', () => {
    // 从 localStorage 加载初始状态，如果不存在则使用默认值
    const isLogin = ref(JSON.parse(localStorage.getItem('isLogin') || 'false'))
    // 确保 userInfo 默认值包含 role 字段
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{ "username": "", "email": "", "avatar": "", "phone": "", "role": "" }'))
    const isAdmin = ref(JSON.parse(localStorage.getItem('isAdmin') || 'false'))

    // 设置登录状态并保存到 localStorage
    const setIsLogin = (value: boolean) => {
        isLogin.value = value
        localStorage.setItem('isLogin', JSON.stringify(value))
    }

    // 设置用户信息并保存到 localStorage
    // 更新 setUserInfo 的类型定义以包含 role
    const setUserInfo = (value: { username: string, email: string, avatar: string, phone?: string, role?: string }) => {
        userInfo.value = value
        localStorage.setItem('userInfo', JSON.stringify(value))
    }

    // 设置管理员状态并保存到 localStorage
    const setIsAdmin = (value: boolean) => {
        isAdmin.value = value
        localStorage.setItem('isAdmin', JSON.stringify(value))
    }

    /**
     * 用户登出功能
     */
    function logout() {
        setIsLogin(false)
        setIsAdmin(false)
        // 登出时，确保 userInfo 的所有字段都被清空
        setUserInfo({
            username: '',
            email: '',
            avatar: '',
            phone: '', // 清空 phone
            role: ''   // 清空 role
        })
        localStorage.removeItem('isLogin')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('isAdmin') // 确保清除管理员状态
    }

    return {
        isAdmin,
        isLogin,
        userInfo,
        logout,
        setUserInfo,
        setIsAdmin,
        setIsLogin
    }
})