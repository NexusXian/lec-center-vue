<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="logo-section">
        <div class="logo-image">
          <img src="../../assets/icon/login.png" alt="NEXUS GAL ARCHIVE" style="width: 80px"/>
        </div>
        <h1 class="brand-title">乐程团队中心站</h1>
        <p class="brand-subtitle">唯有那份炫目,我未曾忘却。</p>
      </div>

      <h2 class="title">登录</h2>
      <el-form :model="{ account, password }" label-position="top">
        <el-form-item label="邮箱/手机号">
          <el-input v-model="account" placeholder="请输入邮箱或手机号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="password" placeholder="请输入密码" />
        </el-form-item>

        <div class="forgot-password-section">
          <a href="#" class="forgot-password-link" @click="handleForgotPassword">忘记密码？</a>
        </div>

        <el-form-item>
          <el-button type="primary" class="login-button" @click="login">登录</el-button>
        </el-form-item>
      </el-form>

      <div class="register-section">
        <span class="register-text">没有账号？</span>
        <a href="#" class="register-link" @click="handleRegister">点击注册</a>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useUserInfoStore } from '../../store/userInfoStore.ts'
import { ElMessage } from 'element-plus'
import router from '../../routers'
import axios from "axios"

const userStore = useUserInfoStore()

const account = ref('')
const password = ref('')

function handleRegister() {
  router.push('/user/register')
}

function handleForgotPassword() {
  router.push('/forgot-password')
}

async function login() {
  try {
    const currentAccount = account.value
    const currentPassword = password.value

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentAccount)
    const isPhone = /^1[3-9]\d{9}$/.test(currentAccount)

    if (!isEmail && !isPhone) {
      ElMessage.error('请输入有效的邮箱或手机号')
      return
    }

    const requestBody = {
      account: currentAccount,
      password: currentPassword
    }

    const res = await axios.post('http://localhost:8080/user/login', requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (res.data?.code === 200) {
      const user = res.data.data // ✅ 正确位置
      userStore.setUserInfo({
        username: user.username,
        email: user.email,
        avatar: user.avatar || ''
      })

      userStore.setIsAdmin(user.role === 'admin')
      userStore.setIsLogin(true)


      await nextTick() // ✅ 等待响应式更新
      router.push('/') // ✅ 页面跳转
    } else {
      ElMessage.error(res.data?.message || '登录失败，请检查账户或密码')
    }
  } catch (err: any) {
    console.error('登录错误:', err)
    let errorMessage = '登录时发生未知错误'

    if (axios.isAxiosError(err) && err.response) {
      errorMessage = err.response.data?.error || err.response.data?.message || '网络错误或服务器问题'
    } else if (err instanceof Error) {
      errorMessage = err.message
    }

    ElMessage.error(errorMessage)
  }
}
</script>

<style scoped>
/* 样式部分保持不变 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
:global(.el-message) {
  border: none !important;
  background: rgba(92, 42, 157, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(110, 142, 251, 0.4) !important;
}
:global(.el-message--success) {
  background: linear-gradient(135deg, #6e8efb, #a777e3) !important;
}
:global(.el-message--error) {
  background: rgba(92, 42, 157, 0.9) !important;
}

.login-container {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  width: 420px;
  padding: 40px 35px;
  border-radius: 24px;
  backdrop-filter: blur(15px);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  transition: all 0.3s ease;
}
.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 50px 0 rgba(31, 38, 135, 0.5),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.logo-section {
  text-align: center;
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.logo-image {
  margin-bottom: 15px;
  position: relative;
}
.logo-image img {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(110, 142, 251, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}
.logo-image img:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(110, 142, 251, 0.6);
}

.brand-title {
  font-size: 22px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.brand-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 300;
}

.title {
  text-align: center;
  font-size: 26px;
  color: white;
  margin-bottom: 25px;
  font-weight: 600;
}

.el-form-item {
  margin-bottom: 20px;
}
.el-input,
.el-button {
  width: 100%;
}
.el-input :deep(.el-input__inner) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 400;
  padding: 12px 15px;
  transition: all 0.3s ease;
}
.el-input :deep(.el-input__inner):focus {
  background: rgba(255, 255, 255, 0.95);
  border-color: #6e8efb;
  box-shadow: 0 0 0 2px rgba(110, 142, 251, 0.3);
}
.el-input :deep(.el-input__inner)::placeholder {
  color: rgba(44, 62, 80, 0.5);
  font-weight: 300;
}
.el-form-item :deep(.el-form-item__label) {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.forgot-password-section {
  text-align: right;
  margin-bottom: 15px;
  margin-top: -5px;
}
.forgot-password-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.3s ease;
  position: relative;
}
.forgot-password-link:hover {
  color: #6e8efb;
  text-shadow: 0 0 8px rgba(110, 142, 251, 0.4);
}
.forgot-password-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  transition: width 0.3s ease;
}
.forgot-password-link:hover::after {
  width: 100%;
}

.login-button {
  margin-top: 15px;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 0;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(110, 142, 251, 0.4);
}
.login-button:hover {
  background: linear-gradient(135deg, #5c7cfa, #9775e2);
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(110, 142, 251, 0.5);
}
.login-button:active {
  transform: translateY(0);
}

.register-section {
  text-align: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
.register-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-right: 8px;
}
.register-link {
  color: #6e8efb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
}
.register-link:hover {
  color: #a777e3;
  text-shadow: 0 0 8px rgba(110, 142, 251, 0.6);
}
.register-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  transition: width 0.3s ease;
}
.register-link:hover::after {
  width: 100%;
}
</style>