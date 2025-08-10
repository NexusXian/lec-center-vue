<template>
  <!-- 模板内容保持不变 -->
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

      <div class="user-info-display">
        <div class="avatar-section">
          <div class="avatar-ring">
            <el-avatar :size="100" :src="userAvatar" class="user-avatar">
              {{ userInfo.username?.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="status-indicator"></div>
          </div>
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ userInfo.username || '未设置用户名' }}</h3>
          <div class="user-meta">
            <span class="user-role">{{ userRole }}</span>
            <span class="divider">•</span>
            <span class="user-email">{{ userInfo.email || '未设置邮箱' }}</span>
          </div>
        </div>
      </div>

      <div class="profile-actions-list">
        <h4 class="section-title">管理您的账户</h4>
        <el-button class="action-item" @click="goToUpdateAvatar">
          <el-icon class="item-icon"><Camera /></el-icon>
          <span class="item-text">修改头像</span>
          <el-icon class="item-arrow"><ArrowRight /></el-icon>
        </el-button>
        <el-button class="action-item" @click="goToUpdatePassword">
          <el-icon class="item-icon"><Lock /></el-icon>
          <span class="item-text">修改密码</span>
          <el-icon class="item-arrow"><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="form-actions">
        <el-button type="info" @click="goBack" class="action-btn info-btn">
          <el-icon class="btn-icon"><Back /></el-icon>
          返回
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 脚本内容保持不变
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserInfoStore } from '../../../store/userInfoStore.ts';
import { Camera, Lock, Back, ArrowRight } from '@element-plus/icons-vue';
import {imgURL} from "../../../config";

const router = useRouter();
const userStore = useUserInfoStore();

const userInfo = computed(() => userStore.userInfo || {});

const userRole = computed(() => {
  if (userStore.isAdmin) {
    return '负责人'
  } else {
    return '团队成员'
  }
})

const userAvatar = computed(() => {
  return userStore.userInfo?.avatar ? imgURL + userStore.userInfo.avatar : "src/assets/icon/noneAvatar.svg";
});

const goToUpdateAvatar = () => {
  router.push('/profile/update-avatar');
};

const goToUpdatePassword = () => {
  router.push('/profile/update-password');
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 全局消息样式 */
:global(.el-message) {
  border: none !important;
  background: rgba(92, 42, 157, 0.9) !important;
  backdrop-filter: blur(5px) !important; /* 降低毛玻璃模糊度 */
  color: white !important;
  box-shadow: 0 4px 12px rgba(110, 142, 251, 0.4) !important;
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
  /* 可添加浅色背景增强层次感 */
}

.profile-card {
  width: 100%;
  max-width: 700px;
  padding: 0;
  border-radius: 24px;
  backdrop-filter: blur(8px); /* 降低毛玻璃效果 */
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.75)); /* 提高不透明度 */
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.15), /* 降低阴影浓度 */
  inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #333; /* 调整文字颜色适配浅色背景 */
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
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
}

.brand-subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
  font-style: italic;
}

.user-info-display {
  display: flex;
  align-items: center;
  margin: 40px;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(31, 38, 135, 0.08); /* 降低阴影浓度 */
  backdrop-filter: blur(5px); /* 降低模糊度 */
}

.avatar-section {
  margin-right: 30px;
  position: relative;
}

.avatar-ring {
  position: relative;
  padding: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  box-shadow: 0 10px 30px rgba(110, 142, 251, 0.3); /* 降低阴影浓度 */
}

.user-avatar {
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #4CAF50;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(55, 53, 53, 0.8);
  font-size: 14px;
}

.user-role {
  padding: 4px 12px;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.divider {
  color: rgba(0, 0, 0, 0.2); /* 调整分隔符颜色 */
  font-weight: bold;
}

.profile-actions-list {
  padding: 20px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.section-title {
  margin: 0 0 20px 0;
  color: #2c3e50; /* 调整标题颜色 */
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1); /* 调整边框颜色 */
  position: relative;
  width: 100%;
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

.action-item {
  width: 100%;
  justify-content: flex-start;
  margin-bottom: 15px;
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08); /* 调整边框颜色 */
  color: #333; /* 调整文字颜色 */
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.item-icon {
  font-size: 20px;
  margin-right: 15px;
  color: #6e8efb;
}

.item-text {
  flex-grow: 1;
  text-align: left;
}

.item-arrow {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.3); /* 调整箭头颜色 */
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
  padding: 0 40px 40px 40px;
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

.info-btn {
  background: rgba(110, 142, 251, 0.1); /* 使用主题色浅色背景 */
  border: 1px solid rgba(110, 142, 251, 0.3);
  color: #6e8efb; /* 使用主题色文字 */
}

.info-btn:hover {
  background: rgba(110, 142, 251, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(110, 142, 251, 0.15);
}

.btn-icon {
  font-size: 18px;
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

  .user-info-display {
    flex-direction: column;
    text-align: center;
    margin: 20px;
    padding: 20px;
  }

  .avatar-section {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .user-name {
    font-size: 20px;
  }

  .user-meta {
    flex-direction: column;
    gap: 4px;
  }

  .profile-actions-list {
    padding: 10px 20px 20px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
    padding: 0 20px 20px 20px;
  }

  .action-btn {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>