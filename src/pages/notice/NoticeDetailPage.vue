<template>
  <div class="notice-detail-page">
    <div class="back-container">
      <el-button
          type="text"
          icon="el-icon-back"
          @click="$router.back()"
      >
        返回通知列表
      </el-button>
    </div>

    <el-card class="detail-card">
      <div class="title-section">
        <h1 class="notice-title">
          {{ noticeDetail.title }}
          <el-tag
              v-if="noticeDetail.is_important"
              type="danger"
              size="small"
              class="important-tag"
          >
            重要
          </el-tag>
        </h1>
      </div>

      <div class="publisher-info">
        <el-avatar
            class="avatar"
            :src="avatarUrl"
            :alt="noticeDetail.username"
        >
          <span slot="fallback">{{ getAvatarFallback() }}</span>
        </el-avatar>

        <div class="publisher-meta">
          <div class="username">
            {{ noticeDetail.username }}
            <span v-if="noticeDetail.role === 'admin'" class="admin-tag">负责人</span>
          </div>
          <div class="publish-time">
            发布时间：{{ formatDate(noticeDetail.created_at) }}
          </div>
          <div class="update-time">
            更新时间：{{ noticeDetail.updated_at ? formatDate(noticeDetail.updated_at) : '暂无更新' }}
          </div>
        </div>
      </div>

      <el-divider />

      <div class="content-section">
        <h3 class="content-title">通知内容</h3>
        <div class="content-text">{{ noticeDetail.content || '暂无内容' }}</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { baseURL } from '../../config' // Ensure your baseURL is correctly imported
// Get route parameters
const route = useRoute()
const noticeId = route.params.id as string // Get the ID from the URL

// Reactive data for notice details
const noticeDetail = ref({
  title: '',
  content: '',
  username: '',
  avatar: '',
  created_at: '',
  updated_at: '', // Added updated_at field
  is_important: false,
  role: ''
})
const isLoading = ref(true)
const errorMsg = ref('')

// Computed property for full avatar URL (baseURL + avatar)
const avatarUrl = computed(() => {
  return noticeDetail.value.avatar
      ? `${baseURL}${noticeDetail.value.avatar}`
      : ''
})
// Fallback text for avatar if image fails to load
function getAvatarFallback(): string {
  return noticeDetail.value.username.charAt(0) || 'N'
}

// Format date string to locale-specific date and time
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString() // Displays date (Y/M/D) + time (H:M)
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateStr
  }
}

// Fetch notice detail data from API (baseURL + "/notice/{id}")
async function fetchNoticeDetail() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await axios.get(`${baseURL}/notice/${noticeId}`)
    // Assuming API response format is { data: { ... } }
    noticeDetail.value = res.data.data
  } catch (err) {
    console.error('Failed to fetch notice details:', err)
    errorMsg.value = '获取通知详情失败，请稍后重试' // Failed to fetch notice details, please try again later
  } finally {
    isLoading.value = false
  }
}

// Fetch data when the component mounts
onMounted(fetchNoticeDetail)
</script>

<style scoped>
.notice-detail-page {
  padding: 20px;
  margin-left: 20px;
  min-height: calc(100vh - 100px); /* Consistent height calculation with list page */
}

/* Back button styling */
.back-container {
  margin-bottom: 20px;
}

/* Detail card styling */
.detail-card {
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* Soft shadow for better appearance */
}

/* Title section */
.title-section {
  margin-bottom: 20px;
  text-align: center; /* Center the title */
}

.notice-title {
  font-size: 28px; /* Slightly larger title */
  font-weight: 700; /* Bolder title */
  color: #333;
  display: inline-block;
  line-height: 1.2; /* Adjust line height for better readability */
}

.important-tag {
  margin-left: 12px; /* Increased margin */
  vertical-align: middle;
  font-size: 13px; /* Slightly larger tag text */
  padding: 4px 8px; /* More padding */
  border-radius: 6px; /* Slightly more rounded corners */
}

/* Publisher information section */
.publisher-info {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding-left: 5px; /* Slight indent for alignment */
}

/* Avatar styling */
.avatar {
  width: 60px;
  height: 60px;
  border: 2px solid #e0e0e0; /* Softer border */
  flex-shrink: 0; /* Prevent avatar from shrinking */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

/* Publisher meta info */
.publisher-meta {
  margin-left: 18px; /* Increased margin */
  line-height: 1.5; /* Improve readability of text lines */
}

.username {
  font-size: 17px; /* Slightly larger username */
  color: #333;
  margin-bottom: 4px;
  font-weight: 500;
}

/* Admin tag */
.admin-tag {
  margin-left: 10px;
  font-size: 13px; /* Slightly larger tag */
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 3px 8px; /* More padding */
  border-radius: 5px; /* More rounded corners */
  font-weight: 600;
}

.publish-time, .update-time {
  font-size: 14px;
  color: #666;
  margin-top: 3px; /* Refined spacing */
}

/* Content section */
.content-section {
  margin-top: 20px;
}

.content-title {
  font-size: 18px; /* Larger content title */
  color: #555; /* Slightly darker grey */
  margin-bottom: 18px; /* More spacing */
  font-weight: 600; /* Bolder content title */
  border-left: 4px solid #409eff; /* Add a subtle left border */
  padding-left: 10px;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-line; /* Preserves line breaks in content */
  padding: 10px 0;
  background-color: #f9f9f9; /* Light background for content area */
  border-radius: 8px;
  padding: 20px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); /* Subtle inner shadow */
}

/* Loading state styling */
.el-loading {
  background-color: rgba(255, 255, 255, 0.7) !important; /* Slightly more opaque loading overlay */
}
</style>