<template>
  <div class="record-page">
    <div class="page-header">
      <el-button
          type="text"
          icon="el-icon-back"
          @click="$router.back()"
          class="back-btn"
      >
        返回
      </el-button>
      <h1 class="page-title">我的签到记录</h1>
    </div>

    <el-loading
        v-if="isLoading"
        target=".record-page"
        text="加载签到记录中..."
    />

    <el-alert
        v-if="!isLoading && isForbidden"
        title="未登录或权限不足"
        type="error"
        show-icon
        class="alert-forbidden"
    >
      <el-button type="primary" @click="$router.push('/login')" class="login-btn">
        登录
      </el-button>
    </el-alert>

    <el-empty
        v-if="!isLoading && recordList.length === 0 && !isForbidden && pagination.total === 0"
        description="暂无签到记录"
        class="empty-state"
    >
      <el-button type="primary" @click="$router.push('/clock-in')">
        去签到
      </el-button>
    </el-empty>

    <div class="record-grid" v-else-if="!isLoading && !isForbidden">
      <el-card
          class="record-card"
          v-for="record in recordList"
          :key="record.ID"
          @click="$router.push(`/clock-in/record/${record.ID}`)"
      >
        <div class="card-content">
          <div class="record-info">
            <div class="username">
              <span class="label">姓名：</span>
              <span>{{ record.username }}</span>
            </div>
            <div class="checkin-time">
              <span class="label">签到时间：</span>
              <span>{{ formatTime(record.created_at) }}</span>
            </div>
            <div class="checkin-remark" v-if="record.check_info">
              <span class="label">备注：</span>
              <span class="remark-text">{{ record.check_info }}</span>
            </div>
          </div>
        </div>

        <div class="view-detail">
          <span>点击查看详情</span>
          <el-icon class="arrow-icon"><Right /></el-icon>
        </div>
      </el-card>
    </div>

    <div class="pagination" v-if="!isLoading && !isForbidden && pagination.total > 0">
      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :hide-on-single-page="true"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { baseURL } from '../../config'
import { ElMessage } from 'element-plus'
import { Right } from '@element-plus/icons-vue'

// 签到记录数据结构 - 与后端模型对应
interface CheckinRecord {
  ID: number
  username: string
  email: string
  created_at: string  // 对应后端的created_at字段
  img: string
  check_info: string
}

// 分页参数类型 - 与后端返回结构对应
interface Pagination {
  page: number
  pageSize: number
  total: number
  pages: number
}

// 状态定义
const recordList = ref<CheckinRecord[]>([])
const isLoading = ref(true)
const isForbidden = ref(false) // 是否无权限
const pagination = ref<Pagination>({
  page: 1,
  pageSize: 12,
  total: 0,
  pages: 0
})

// 格式化时间 (YYYY-MM-DD HH:MM)
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '')
}

// 获取当前用户的签到记录列表 - 修正后端数据接收逻辑
const fetchRecordList = async () => {
  // 从本地存储获取当前用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  // 参数校验 - 确保有email才能请求
  if (!userInfo.email) {
    isForbidden.value = true
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    // 使用POST请求，通过JSON传递参数（与后端接口匹配）
    const res = await axios.post(`${baseURL}/checkin/records`, {
      email: userInfo.email,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })

    // 根据后端返回结构处理数据
    if (res.data.code === 200) {
      // 后端数据在data字段中
      recordList.value = res.data.data
      // 后端分页信息在pagination字段中
      pagination.value.total = res.data.pagination.total
      pagination.value.pages = res.data.pagination.pages
      isForbidden.value = false
    } else if (res.data.code === 403) {
      // 无权限处理
      isForbidden.value = true
      recordList.value = []
      pagination.value.total = 0
      pagination.value.pages = 0
    } else {
      ElMessage.error('获取记录失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    console.error('获取签到记录失败：', error)
    ElMessage.error('网络错误，无法加载记录')
  } finally {
    isLoading.value = false
  }
}

// 分页大小变化处理
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val
  pagination.value.page = 1 // 重置到第1页
  fetchRecordList()
}

// 当前页变化处理
const handleCurrentChange = (val: number) => {
  pagination.value.page = val
  fetchRecordList()
}

// 页面加载时获取记录
onMounted(() => {
  fetchRecordList()
})
</script>

<style scoped>
/* 样式部分保持不变 */
.record-page {
  padding: 20px 30px;
  min-height: calc(100vh - 60px);
}

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

.record-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.record-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.record-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  gap: 15px;
  padding: 15px 0;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label {
  color: #666;
  font-size: 14px;
}

.username span:not(.label) {
  font-weight: 500;
  color: #333;
}

.checkin-time span:not(.label) {
  color: #4e5969;
  font-size: 14px;
}

.checkin-remark {
  margin-top: 5px;
}

.remark-text {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.view-detail {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #409eff;
  font-size: 13px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
  margin-top: 10px;
}

.arrow-icon {
  margin-left: 5px;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* --- Element Plus 分页组件的自定义样式 --- */
/*
   为了让分页组件的字体颜色更明显，我们通过深度选择器 `:deep()` 来覆盖
   Element Plus 的默认样式。
   您可以根据需要调整颜色值，例如使用更亮的颜色或者加粗字体。
*/
.pagination :deep(.el-pagination__total),
.pagination :deep(.el-pagination__sizes),
.pagination :deep(.el-pagination__jump) {
  /* 统计信息、每页显示条数、前往的字体颜色 */
  color: #333; /* 设为深灰色，您可以改成 #000 (黑色) 或其他醒目颜色 */
  font-weight: 500; /* 加粗一点，使其更明显 */
}

.pagination :deep(.el-pager li) {
  /* 默认页码颜色 */
  color: #606266; /* 默认页码字体颜色，可以调亮或调暗 */
  font-weight: normal; /* 默认页码字体粗细 */
  transition: color 0.3s ease; /* 添加颜色过渡效果 */
}

.pagination :deep(.el-pager li.is-active) {
  /* 激活页码颜色 */
  color: #409eff; /* Element Plus 默认蓝色，很醒目。您也可以尝试其他亮色如 #FF6600 (橙色) */
  font-weight: bold; /* 激活页码字体加粗，强烈推荐，非常明显 */
}

.pagination :deep(.el-pager li:hover) {
  /* 鼠标悬停页码颜色 */
  color: #409eff; /* 鼠标悬停时也保持醒目 */
}

.pagination :deep(.btn-prev),
.pagination :deep(.btn-next) {
  /* 上一页/下一页按钮字体颜色 */
  color: #606266; /* 默认按钮字体颜色 */
  transition: color 0.3s ease;
}

.pagination :deep(.btn-prev:hover),
.pagination :deep(.btn-next:hover) {
  /* 上一页/下一页按钮鼠标悬停颜色 */
  color: #409eff; /* 鼠标悬停时变为醒目的蓝色 */
}

.empty-state {
  margin: 80px auto;
  max-width: 300px;
}

.alert-forbidden {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.login-btn {
  margin-top: 15px;
}
</style>