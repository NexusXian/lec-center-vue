<template>
  <div class="detail-page">
    <div class="page-header">
      <el-button
          type="text"
          icon="el-icon-back"
          @click="$router.back()"
          class="back-btn"
      >
        返回列表
      </el-button>
      <h1 class="page-title">签到详情</h1>
    </div>

    <el-loading
        v-if="isLoading"
        target=".detail-page"
        text="加载详情中..."
    />

    <el-alert
        v-if="!isLoading && isForbidden"
        title="没有权限查看该记录"
        type="error"
        show-icon
        class="alert-forbidden"
    >
      <el-button type="primary" @click="$router.push('/clock-in/records')" class="back-btn">
        返回我的记录
      </el-button>
    </el-alert>

    <el-card class="detail-card" v-if="!isLoading && record && !isForbidden">
      <div class="detail-content">
        <div class="basic-info">
          <div class="info-item">
            <span class="info-label">姓名：</span>
            <span class="info-value">{{ record.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">签到时间：</span>
            <span class="info-value">{{ formatTime(record.created_at) }}</span>
          </div>
          <div class="info-item" v-if="record.check_info">
            <span class="info-label">签到备注：</span>
            <span class="info-value remark">{{ record.check_info }}</span>
          </div>
        </div>

        <div class="image-section">
          <h3 class="section-title">签到图片</h3>
          <div class="image-container">
            <el-image
                :src="`${baseURL}${record.img}`"
                :alt="`${record.username}的签到图片`"
                fit="contain"
                class="checkin-image"
            >
              <template #loading>
                <div class="image-loading">加载中...</div>
              </template>
              <template #error>
                <div class="image-error">图片加载失败</div>
              </template>
            </el-image>
          </div>
        </div>
      </div>
    </el-card>

    <el-empty
        v-if="!isLoading && !record && !isForbidden"
        description="签到记录不存在或已删除"
        class="empty-state"
    >
      <el-button type="primary" @click="$router.push('/clock-in/records')">
        返回列表
      </el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { baseURL } from '../../config' // Ensure baseURL is correctly imported
import { ElMessage } from 'element-plus'

// 签到记录数据结构
interface CheckinRecord {
  ID: number
  username: string // Changed from Username
  email: string // Changed from Email
  created_at: string // Changed from CreatedAt
  img: string // Changed from Img
  check_info: string // Changed from CheckInfo
}

// 状态定义
const record = ref<CheckinRecord | null>(null)
const isLoading = ref(true)
const isForbidden = ref(false) // 是否无权限
const router = useRouter()
const route = useRoute()

// 格式化时间（带秒数）
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(',', '')
}

// 获取单条签到记录详情（JSON传递参数）
const fetchRecordDetail = async () => {
  const recordId = route.params.id // 从路由获取记录ID
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  // 参数校验
  if (!recordId) {
    ElMessage.error('记录ID缺失')
    router.push('/clock-in/records')
    return
  }
  if (!userInfo.email) {
    ElMessage.error('用户信息缺失，请重新登录')
    router.push('/login')
    return
  }

  try {
    isLoading.value = true
    // 核心修改：使用POST请求，通过JSON传递email参数
    const res = await axios.post(`${baseURL}/checkin/records/${recordId}`, {
      email: userInfo.email
    })

    if (res.data.code === 200) {
      record.value = res.data.data
      isForbidden.value = false
    } else if (res.data.code === 403) {
      // 无权限
      isForbidden.value = true
      record.value = null
    } else if (res.data.code === 404) {
      // 记录不存在
      record.value = null
    } else {
      ElMessage.error('获取详情失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    console.error('获取签到详情失败：', error)
    ElMessage.error('网络错误，无法加载详情')
  } finally {
    isLoading.value = false
  }
}

// 页面加载时获取详情
onMounted(() => {
  fetchRecordDetail()
})
</script>

<style scoped>
.detail-page {
  padding: 20px 30px;
  min-height: calc(100vh - 60px);
}

/* 页头样式 */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  margin-right: 15px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 详情卡片样式 */
.detail-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.detail-content {
  padding: 20px;
}

/* 基本信息区 */
.basic-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-label {
  width: 100px;
  color: #666;
  font-size: 15px;
  flex-shrink: 0;
}

.info-value {
  font-size: 15px;
  color: #333;
  line-height: 1.5;
}

/* 备注支持换行 */
.remark {
  white-space: pre-wrap;
  word-break: break-all;
}

/* 图片展示区 */
.image-section {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
  padding-left: 2px;
}

.image-container {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 20px;
  background-color: #fff;
  text-align: center;
}

.checkin-image {
  max-width: 100%;
  max-height: 500px;
  margin: 0 auto;
  border-radius: 4px;
}

.image-loading,
.image-error {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* 无权限提示 */
.alert-forbidden {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 空状态样式 */
.empty-state {
  margin: 80px auto;
  max-width: 300px;
}
</style>