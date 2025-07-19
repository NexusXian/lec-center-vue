<template>
  <el-page-header
      class="header-with-opacity header-align-right"
      @back="goBack"
      title="返回"
  >
    <template #content>
      <div class="flex items-center" v-if="isLoggedIn">
        <span id="welcom">欢迎您！</span>
        &nbsp;
        <span class="text-large font-600 mr-3 text-white" id="username">{{ currentUserName }}</span>
        <el-tag size="small" type="info">{{ userRole }}</el-tag>
      </div>
    </template>

    <template #extra>
      <div class="flex items-center">
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleDropdownCommand" class="mr-2">
            <el-avatar
                :size="32"
                :src="userAvatar"
                class="cursor-pointer hover-avatar"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item divided command="logout">登出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button @click="login" type="info" plain>登录</el-button>
          <el-button type="primary" class="ml-2" @click="register">注册</el-button>
        </template>
      </div>
    </template>
  </el-page-header>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from "../../store/userInfoStore.ts"
import { ElMessage } from 'element-plus'
import { baseURL } from "../../config"

const router = useRouter()
const userStore = useUserInfoStore()

// 计算属性：判断是否已登录
const isLoggedIn = computed(() => userStore.isLogin || false)

// 当前用户名
const currentUserName = computed(() => userStore.userInfo?.username || '未登录')

// 用户头像
const userAvatar = computed(() => {
  return userStore.userInfo?.avatar
      ? baseURL + userStore.userInfo.avatar
      : "https://avatars.githubusercontent.com/u/106912574?v=4"
})

// 用户角色
const userRole = computed(() => (userStore.isAdmin ? '负责人' : '团队成员'))

// 监听登录状态变化
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    ElMessage.success(`欢迎回来，${currentUserName.value}！`)
  }
})

function login() {
  router.push('/user/login')
}

function register() {
  router.push('/user/register')
}

function logout() {
  userStore.logout()
  ElMessage.success('已成功登出')
  router.push('/')
}


function handleDropdownCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      logout()
      break
    default:
      console.log('未知命令:', command)
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.header-with-opacity {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  padding: 10px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  margin-left: 30px;
}

.header-align-right :deep(.el-page-header__wrapper) {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.el-page-header__content {
  display: flex;
  align-items: center;
  order: 2;
  margin-left: 20px;
}

.el-page-header__extra {
  display: flex;
  align-items: center;
  order: 1;
}

.el-avatar {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.text-large {
  font-weight: 700;
  color: #333;
}

.el-tag {
  margin-left: 8px;
}

.el-button.is-circle {
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
  color: #606266;
}

.el-button.is-circle:hover {
  background-color: rgba(240, 240, 240, 0.9);
  border-color: rgba(255, 255, 255, 0.7);
}

.hover-avatar {
  transition: transform 0.2s ease;
}

.hover-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.el-dropdown {
  display: inline-flex;
  align-items: center;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
