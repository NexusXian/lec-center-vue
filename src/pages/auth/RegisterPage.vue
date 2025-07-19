<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="logo-section">
        <div class="logo-image">
          <img src="../../assets/icon/register.png" alt="NEXUS GAL ARCHIVE" style="width: 80px" />
        </div>
        <h1 class="brand-title">乐程团队中心站</h1>
        <p class="brand-subtitle">唯有那份炫目，我未曾忘却。</p>
      </div>

      <h2 class="title">注册</h2>
      <el-form :label-position="'top'">
        <el-form-item label="用户名">
          <el-input v-model="userName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="userEmail" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="phoneNumber" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="年级">
          <el-select v-model="grade" placeholder="请选择年级">
            <el-option
                v-for="year in years"
                :key="year"
                :label="year"
                :value="year"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="专业">
          <el-select v-model="major" placeholder="请选择专业">
            <el-option
                v-for="item in majors"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="方向">
          <el-select v-model="direction" placeholder="请选择方向">
            <el-option
                v-for="item in directions"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="密码">
          <el-input type="password" v-model="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item label="确认密码">
          <el-input type="password" v-model="password2" placeholder="请再次输入密码" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-button" @click="register">注册</el-button>
        </el-form-item>
      </el-form>

      <div class="register-section">
        <span class="register-text">已有账号？</span>
        <a href="#" class="register-link" @click="handleLogin">返回登录</a>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import router from '../../routers'; // 确保路径正确
import axios from 'axios';
import { ElMessage } from 'element-plus';
import {baseURL} from "../../config";


// 定义响应式数据
const userEmail = ref('');
const password = ref('');
const password2 = ref('');
const userName = ref('');
const phoneNumber = ref('');
const grade = ref<string | null>(null); // 年级现在是字符串或 null
const major = ref('');
const direction = ref(''); // New reactive data for direction

// 年份、专业和方向数据
const years = Array.from({ length: 90 }, (_, i) => (2010 + i).toString()); // 从2010年开始，生成90个年份字符串
const majors = ['网工', '电计', '信管', '数媒', '其他'];
const directions = ['后端', '前端', '嵌入式', '机器学习', '微课']; // New directions array

/**
 * 处理返回登录页面的逻辑
 */
function handleLogin(): void {
  router.push('/user/login');
}

/**
 * 处理用户注册逻辑
 */
async function register(): Promise<void> {
  // 1. 客户端所有字段非空验证
  if (!userEmail.value || !password.value || !userName.value || !password2.value || !phoneNumber.value || grade.value === null || !major.value || !direction.value) {
    ElMessage.error('所有字段不能为空！');
    return;
  }

  // 2. 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail.value)) {
    ElMessage.error('邮箱格式不正确，请检查！');
    return;
  }

  // 3. 密码强度验证（至少8位并包含至少一个字母）
  const passwordRegex = /^(?=.*[A-Za-z]).{8,}$/;
  if (!passwordRegex.test(password.value)) {
    ElMessage.error('密码必须至少8位，且包含至少一个字母！');
    return;
  }

  // 4. 确认密码一致性验证
  if (password.value !== password2.value) {
    ElMessage.error('两次输入的密码不一致，请重新输入！');
    return;
  }

  // 5. 手机号格式验证（中国大陆手机号）
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phoneNumber.value)) {
    ElMessage.error('请输入有效的中国大陆手机号！');
    return;
  }

  console.log('准备发送注册请求，userName.value:', userName.value);

  try {
    const response = await axios.post(baseURL + '/user/register', {
      email: userEmail.value,
      password: password.value,
      username: userName.value,
      phone: phoneNumber.value,
      grade: grade.value,
      major: major.value,
      direction: direction.value, // Added new direction field
    });

    if (response.data && response.data.code === 200) {
      ElMessage.success(response.data.message || '注册成功！即将跳转到登录页。');
      await router.push('/login');
    } else {
      const errorMsg = response.data?.message || '注册失败，请稍后再试。';
      ElMessage.error(errorMsg);
    }
  } catch (error) {
    let errorMessage = '网络或服务器错误，请检查您的网络连接或联系管理员。';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `服务器响应错误: ${error.response.status} - ${error.response.statusText || '未知错误'}`;
        }
      } else if (error.request) {
        errorMessage = '无法连接到服务器，请检查后端服务是否运行。';
      } else {
        errorMessage = `请求配置错误: ${error.message}`;
      }
    }
    ElMessage.error(errorMessage);
    console.error('注册请求发生错误:', error);
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');


* {

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

}



:global(.el-message) {



  border: none !important;

  border-radius: 12px !important; /* Slightly more rounded corners */

  padding: 14px 20px !important; /* More comfortable padding */

  display: flex !important;

  align-items: center !important;

  justify-content: center !important;

  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important; /* Softer, more pronounced shadow */

  font-size: 15px !important; /* Slightly larger font for readability */

  font-weight: 500 !important;

  backdrop-filter: blur(12px) saturate(180%) !important; /* Stronger, smoother blur */

  -webkit-backdrop-filter: blur(12px) saturate(180%) !important; /* Safari compatibility */

  animation: slideInFromTop 0.4s ease-out forwards; /* Add an entrance animation */

}




:global(.el-message--success) {

  background: linear-gradient(135deg, #4CAF50, #8BC34A) !important; /* A fresh green gradient */

  color: white !important; /* White text for contrast */

  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5) !important; /* Green-matching shadow */

}



/* Error Message */

:global(.el-message--error) {

  background: rgba(255, 70, 70, 0.95) !important; /* A clear, slightly transparent red */

  color: white !important;

  box-shadow: 0 6px 20px rgba(255, 70, 70, 0.3) !important; /* Red-matching shadow */

}



/* Warning Message (if you use it) */

:global(.el-message--warning) {

  background: rgba(255, 193, 7, 0.95) !important; /* Amber for warnings */

  color: #333 !important; /* Dark text for contrast on yellow */

  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.3) !important;

}



/* Info Message (if you use it) */

:global(.el-message--info) {

  background: rgba(108, 117, 125, 0.95) !important; /* Grey for info */

  color: white !important;

  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.3) !important;

}



/* Icon styling for better visual */

:global(.el-message .el-icon) {

  font-size: 18px !important;

  margin-right: 8px !important;

}



/* Close button styling */

:global(.el-message .el-message__closeBtn) {

  color: rgba(255, 255, 255, 0.7) !important;

  transition: color 0.2s ease;

}



:global(.el-message .el-message__closeBtn:hover) {

  color: white !important;

}



/* Animation for messages */

@keyframes slideInFromTop {

  from {

    transform: translateY(-100px);

    opacity: 0;

  }
  to {

    transform: translateY(0);

    opacity: 1;

  }
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



/* Logo Section */

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



/* Login Form */

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



/* Registration Section */

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