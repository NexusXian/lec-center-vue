<template>
  <div class="update-password-container">
    <el-card class="password-card">
      <div class="card-header">
        <div class="logo-section">
          <div class="logo-image">
            <img src="../../../assets/icon/profile.png" alt="NEXUS GAL ARCHIVE" style="width: 95px"/>
          </div>
          <h1 class="brand-title">乐程团队中心站</h1>
          <p class="brand-subtitle">唯有那份炫目，我未曾忘却。</p>
        </div>
      </div>

      <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          status-icon
          :rules="rules"
          label-width="120px"
          class="password-form"
      >
        <div class="form-section">
          <h4 class="section-title">安全设置</h4>

          <el-form-item label="当前密码" prop="currentPass">
            <el-input
                v-model="passwordForm.currentPass"
                type="password"
                placeholder="请输入当前密码"
                :prefix-icon="Lock"
                autocomplete="off"
                show-password
                class="custom-input"
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPass">
            <el-input
                v-model="passwordForm.newPass"
                type="password"
                placeholder="请输入新密码"
                :prefix-icon="Lock"
                autocomplete="off"
                show-password
                class="custom-input"
            />
          </el-form-item>

          <el-form-item label="确认新密码" prop="checkNewPass">
            <el-input
                v-model="passwordForm.checkNewPass"
                type="password"
                placeholder="请再次输入新密码"
                :prefix-icon="Lock"
                autocomplete="off"
                show-password
                class="custom-input"
            />
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button type="primary" @click="handlePasswordUpdate" class="action-btn primary-btn">
            <el-icon class="btn-icon"><Check /></el-icon>
            保存密码
          </el-button>
          <el-button @click="resetPasswordForm" class="action-btn secondary-btn">
            <el-icon class="btn-icon"><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button type="info" @click="goBack" class="action-btn info-btn">
            <el-icon class="btn-icon"><Back /></el-icon>
            返回
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { useUserInfoStore } from "../../../store/userInfoStore.ts";
import { reactive, ref } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import axios from "axios";
import { Lock, Check, RefreshLeft, Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { baseURL } from "../../../config";
import type { FormInstance, FormRules } from 'element-plus'

const user = useUserInfoStore();
const router = useRouter()
const passwordFormRef = ref<FormInstance | null>(null)

const passwordForm = reactive({
  currentPass: '',
  newPass: '',
  checkNewPass: '',
})

// ✅ 自定义校验函数（使用显式类型）
const validateNewPass = (_rule: unknown, value: string, callback: (error?: string | Error) => void) => {
  if (value === passwordForm.currentPass) {
    callback(new Error('新密码不能与当前密码相同'));
  } else {
    callback();
  }
};

const validateCheckPass = (_rule: unknown, value: string, callback: (error?: string | Error) => void) => {
  if (value !== passwordForm.newPass) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

// ✅ 表单校验规则
const rules: FormRules = {
  currentPass: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' }
  ],
  newPass: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '新密码长度不能少于8位', trigger: 'blur' },
    { validator: validateNewPass, trigger: 'blur' }
  ],
  checkNewPass: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateCheckPass, trigger: 'blur' }
  ]
}

function resetPasswordForm() {
  passwordFormRef.value?.resetFields();
}

function goBack() {
  router.push('/profile')
}

const handlePasswordUpdate = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();

    const userEmail = user.userInfo.email;
    if (!userEmail) {
      ElMessage.error("无法获取用户信息，请重新登录");
      router.push('/login')
      return;
    }

    const requestData = {
      email: userEmail,
      old_password: passwordForm.currentPass,
      new_password: passwordForm.newPass
    }

    const res = await axios.post(baseURL + '/user/update/password', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    ElMessage.success(res.data.message);
    ElMessage.success("请重新登录")
    resetPasswordForm();
    setTimeout(() => {
      router.push('/user/login')
    }, 1500)
    goBack();

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return;
    }

    let errorMsg = '更新密码失败，请稍后重试'
    if (axios.isAxiosError(error) && error.response) {
      switch (error.response.status) {
        case 400:
          errorMsg = error.response.data?.error || '输入信息有误'
          break;
        case 401:
          errorMsg = error.response.data?.error || '当前密码错误'
          break;
        case 404:
          errorMsg = error.response.data?.error || '用户不存在'
          break;
        case 500:
          errorMsg = error.response.data?.error || '服务器错误'
          break;
      }
    }
    ElMessage.error(errorMsg);
    console.error("更新密码错误:", error);
  }
}
</script>




<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 全局消息样式 - 降低毛玻璃效果 */
:global(.el-message) {
  border: none !important;
  background: rgba(92, 42, 157, 0.9) !important;
  backdrop-filter: blur(5px) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(110, 142, 251, 0.3) !important;
}
:global(.el-message--success) {
  background: linear-gradient(135deg, #6e8efb, #a777e3) !important;
}
:global(.el-message--error) {
  background: rgba(92, 42, 157, 0.9) !important;
}

.update-password-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.password-card {
  width: 100%;
  max-width: 550px;
  padding: 0;
  border-radius: 24px;
  backdrop-filter: blur(8px);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.75));
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #333;
  transition: all 0.3s ease;
  overflow: hidden;
}

.password-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 50px 0 rgba(31, 38, 135, 0.2),
  inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.card-header {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
  padding: 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.brand-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.brand-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-style: italic;
}

.password-form {
  padding: 40px;
}

.form-section {
  margin-bottom: 35px;
  position: relative;
}

.section-title {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
}

/* 表单标签样式 */
.password-form :deep(.el-form-item__label) {
  color: #555 !important;
  font-weight: 600;
  font-size: 14px;
}

/* 输入框样式 */
.custom-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: none;
}

.custom-input :deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.95);
  border-color: #6e8efb;
  transform: translateY(-1px);
  box-shadow: 0 0 0 2px rgba(110, 142, 251, 0.1);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.98);
  border-color: #6e8efb;
  box-shadow: 0 0 0 2px rgba(110, 142, 251, 0.3);
}

.custom-input :deep(.el-input__inner) {
  color: #2c3e50;
  font-size: 14px;
  font-weight: 400;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
}

.action-btn {
  padding: 12px 25px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.primary-btn {
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  border: none;
  color: white;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(110, 142, 251, 0.3);
  opacity: 0.9;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #555;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.info-btn {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #555;
}

.info-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.btn-icon {
  font-size: 18px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .password-card {
    border-radius: 16px;
    margin: 10px;
  }

  .card-header {
    padding: 20px;
  }

  .brand-title {
    font-size: 20px;
  }

  .password-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-btn {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>