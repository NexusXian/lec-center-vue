<template>
  <div class="profile-container">
    <el-card class="profile-card">
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
          ref="formRef"
          :model="formData"
          label-width="120px"
          class="profile-form"
      >
        <div class="form-section">
          <h4 class="section-title">当前头像</h4>
          <div class="current-avatar-display">
            <el-avatar :size="120" :src="currentAvatarUrl" class="user-avatar">
              {{ userInfo.userName?.charAt(0).toUpperCase() }}
            </el-avatar>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">上传新头像</h4>
          <el-form-item label="选择文件">
            <div class="avatar-upload-container">
              <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  action="#"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  :limit="1"
                  :on-exceed="handleExceed">
                <div class="upload-area">
                  <el-avatar
                      :size="80"
                      :src="formData.avatarPreview"
                      v-if="formData.avatarPreview"
                  >
                    {{ userInfo.username?.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <div v-else class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span class="upload-text">点击上传</span>
                  </div>
                  <div class="upload-overlay">
                    <el-icon><Camera /></el-icon>
                  </div>
                </div>
              </el-upload>

              <div class="upload-tip">
                <p>支持 JPG、JPEG、PNG、GIF 格式</p>
                <p>文件大小不超过 10MB</p>
              </div>
            </div>
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button
              type="primary"
              @click="submitForm"
              :loading="loading"
              :disabled="!selectedFile"
              class="action-btn primary-btn"
          >
            <el-icon class="btn-icon"><Check /></el-icon>
            保存修改
          </el-button>
          <el-button @click="goBack" class="action-btn secondary-btn">
            <el-icon class="btn-icon"><Back /></el-icon>
            返回
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 脚本内容保持不变
import { ref, computed } from 'vue'
import { ElMessage, type UploadFile, type UploadRawFile } from 'element-plus'
import { useUserInfoStore } from '../../../store/userInfoStore.ts'
import axios from 'axios'
import { Check, Back, Plus, Camera } from '@element-plus/icons-vue'
import {baseURL} from "../../../config";
const userInfoStore = useUserInfoStore()
const userInfo = computed(() => userInfoStore.userInfo)
const currentAvatarUrl = computed(() => {
  return userInfo.value.avatar ? `${baseURL}${userInfo.value.avatar}` : ''
})

const formRef = ref()
const loading = ref(false)
const formData = ref({ avatarPreview: '' })
const selectedFile = ref<UploadRawFile | null>(null)

const handleAvatarSuccess = (response: any) => {
  console.log('Upload success:', response)
}

const handleFileChange = (uploadFile: UploadFile) => {
  const rawFile = uploadFile.raw;
  if (!rawFile) return;

  if (beforeAvatarUpload(rawFile)) {
    selectedFile.value = rawFile;
    const reader = new FileReader()
    reader.onload = (e: any) => {
      formData.value.avatarPreview = e.target.result
    }
    reader.readAsDataURL(rawFile)
  } else {
    selectedFile.value = null;
    formData.value.avatarPreview = '';
  }
}

const beforeAvatarUpload = (file: UploadRawFile) => {
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('头像必须是 JPG、JPEG、PNG 或 GIF 格式')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('头像大小不能超过 10MB')
    return false
  }
  return true
}

const handleExceed = () => {
  ElMessage.error('一次只能上传一张头像图片')
}


const submitForm = async () => {
  if (!selectedFile.value) {
    ElMessage.info('请先选择要上传的头像文件')
    return
  }

  try {
    loading.value = true
    const form = new FormData()
    form.append('email', userInfo.value.email)
    form.append('avatar', selectedFile.value)

    const res = await axios.post(baseURL + '/file/avatar', form, {
      headers: {
        'Content-Type': "multipart/form-data"
      },
      timeout: 30000
    })

    if (res.data.code === 200) {
      const data = res.data.data
      userInfoStore.setUserInfo({
        username: userInfo.value.username,
        email: userInfo.value.email,
        avatar: data.avatar
      })

      formData.value.avatarPreview = ''
      selectedFile.value = null

      ElMessage.success('头像更新成功')
    } else {
      ElMessage.error(res.data.message || '头像更新失败')
    }
  } catch (error: any) {
    console.error('上传失败:', error)
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('上传超时，请检查网络连接或文件大小')
    } else if (error.response) {
      ElMessage.error(error.response.data.error || '上传失败')
    } else {
      ElMessage.error('上传出错，请重试')
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  history.back()
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
  backdrop-filter: blur(5px) !important; /* 降低模糊度 */
  color: white !important;
  box-shadow: 0 4px 12px rgba(110, 142, 251, 0.3) !important; /* 降低阴影浓度 */
}
:global(.el-message--success) {
  background: linear-gradient(135deg, #6e8efb, #a777e3) !important;
}
:global(.el-message--error) {
  background: rgba(92, 42, 157, 0.9) !important;
}

.profile-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.profile-card {
  width: 100%;
  max-width: 700px;
  padding: 0;
  border-radius: 24px;
  backdrop-filter: blur(8px); /* 降低毛玻璃模糊度 */
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.75)); /* 提高不透明度 */
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.15), /* 降低阴影浓度 */
  inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #333; /* 调整文字颜色为深色 */
  transition: all 0.3s ease;
  overflow: hidden;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 50px 0 rgba(31, 38, 135, 0.2),
  inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.card-header {
  background: rgba(255, 255, 255, 0.6); /* 提高不透明度 */
  backdrop-filter: blur(5px) saturate(180%); /* 降低模糊度 */
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
  color: #2c3e50; /* 改为深色标题 */
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.brand-subtitle {
  font-size: 14px;
  color: #666; /* 调整副标题颜色 */
  margin: 0;
  font-style: italic;
}

.profile-form {
  padding: 40px;
}

.form-section {
  margin-bottom: 35px;
  position: relative;
}

.section-title {
  margin: 0 0 20px 0;
  color: #2c3e50; /* 调整标题颜色为深色 */
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1); /* 调整边框颜色 */
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

/* 调整表单标签颜色 */
.profile-form :deep(.el-form-item__label) {
  color: #555 !important; /* 改为深色标签 */
  font-weight: 600;
  font-size: 14px;
}

.current-avatar-display {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.user-avatar {
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); /* 降低阴影浓度 */
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
}

.avatar-upload-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.avatar-uploader :deep(.el-upload) {
  border: none;
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.upload-area {
  width: 120px;
  height: 120px;
  border: 3px dashed rgba(0, 0, 0, 0.1); /* 调整边框颜色为浅灰 */
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.7); /* 提高不透明度 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.upload-area:hover {
  border-color: #6e8efb; /* 保持主题色高亮 */
  background: rgba(110, 142, 251, 0.05);
  transform: scale(1.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666; /* 调整上传提示颜色为深色 */
}

.upload-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-area:hover .upload-overlay {
  opacity: 1;
}

.upload-overlay .el-icon {
  font-size: 40px;
  color: white;
}

.upload-tip {
  font-size: 12px;
  color: #666; /* 调整提示文字颜色 */
  line-height: 1.6;
}

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

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(110, 142, 251, 0.3); /* 降低阴影浓度 */
  opacity: 0.9;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.7); /* 提高不透明度 */
  border: 1px solid rgba(0, 0, 0, 0.1); /* 调整边框颜色 */
  color: #555; /* 调整按钮文字颜色 */
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-card {
    border-radius: 16px;
    margin: 10px;
  }

  .card-header {
    padding: 20px;
  }

  .brand-title {
    font-size: 20px;
  }

  .profile-form {
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

  .avatar-upload-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>