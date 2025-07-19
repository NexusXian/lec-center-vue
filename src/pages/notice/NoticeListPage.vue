<template>
  <div class="notice-page">
    <div class="page-header">
      <h2 class="page-title">通告管理</h2>
      <div class="publish-btn-container">
        <el-button
            v-if="userStore.isLogin"
            type="primary"
            @click="createNotice"
            icon="el-icon-plus"
        >
          发布通告
        </el-button>
      </div>
    </div>

    <div class="notice-container">
      <el-skeleton
          v-if="isLoading && notices.length === 0"
          :rows="6"
          animated
          class="loading-skeleton"
      />

      <div v-else-if="notices.length === 0" class="empty-state">
        <el-empty
            description="暂无通告数据"
            :image="ElEmpty.PLACEHOLDER_IMAGE_SIMPLE"
        >
          <template #footer>
            <el-button
                v-if="userStore.isLogin"
                type="primary"
                @click="createNotice"
            >
              发布第一条通告
            </el-button>
            <el-button
                v-else
                type="primary"
                @click="goToLogin"
            >
              登录后发布通告
            </el-button>
          </template>
        </el-empty>
      </div>

      <el-row
          v-else
          :gutter="25"
          style="row-gap: 20px"
      >
        <el-col :span="8" v-for="notice in notices" :key="notice.noticeID">
          <el-card
              class="notice-card"
              shadow="hover"
              @click="goToDetail(notice.noticeID)"
          >
            <div class="notice-title">
              {{ notice.title }}
              <el-tag
                  v-if="notice.is_important"
                  type="danger"
                  size="small"
                  class="ml-2"
              >
                重要
              </el-tag>
            </div>

            <div class="notice-meta">
              <span
                  class="notice-author"
                  :class="{ 'admin-name': notice.role === 'admin' }"
              >
                <el-tooltip
                    effect="dark"
                    :content="notice.role === 'admin' ? '管理员发布' : '普通用户发布'"
                    placement="top"
                >
                  <span>发布者：{{ notice.username }}</span>
                </el-tooltip>
              </span>
              <span class="notice-date">
                {{ formatDate(notice.created_at) }}
              </span>
            </div>

            <div v-if="userStore.isAdmin" class="admin-actions">
              <el-button
                  type="text"
                  size="small" icon="el-icon-edit"
                  @click.stop="editNotice(notice.noticeID.toString())"
              >
                修改
              </el-button>
              <el-button
                  type="text"
                  size="small" icon="el-icon-delete"
                  @click.stop="confirmDelete(notice.noticeID.toString())"
              >
                删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div
          v-if="total > 0"
          class="pagination-container"
      >
        <el-pagination
            background
            layout="prev, pager, next, total"
            :total="total"
            :page-size="pageSize"
            :current-page="page"
            :pager-count="5"
            @current-change="handlePageChange"
            :small="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { baseURL } from '../../config'
import { ElEmpty, ElMessage, ElMessageBox } from 'element-plus'
// 引入 Pinia 用户信息存储
import { useUserInfoStore } from '../../store/userInfoStore.ts'

// 初始化 Pinia 存储
const userStore = useUserInfoStore()
const router = useRouter()

// 定义通告数据接口
interface Notice {
  noticeID: number
  title: string
  is_important: boolean
  username: string
  role: string
  created_at: string
}

// 状态管理
const notices = ref<Notice[]>([])
const page = ref(1)
const pageSize = 18
const total = ref(0)
const isLoading = ref(false)

// 获取通告列表
async function fetchNotices() {
  isLoading.value = true
  try {
    const res = await axios.get(`${baseURL}/notice/list`, {
      params: {
        page: page.value,
        pageSize: pageSize,
      },
    })
    notices.value = res.data.data || []
    total.value = res.data.total || 0
  } catch (err: any) {
    console.error('获取通告失败:', err)
    ElMessage.error(err.response?.data?.message || '获取通告失败，请重试')
    notices.value = []
    total.value = 0
  } finally {
    isLoading.value = false
  }
}

// 日期格式化
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

// 分页切换
function handlePageChange(newPage: number) {
  page.value = newPage
  fetchNotices()
}

// 跳转详情
function goToDetail(id: number) {
  router.push(`/notice/${id}`)
}

// 跳转创建页（已登录用户）
function createNotice() {
  router.push('/notice/create')
}

// 跳转登录页（未登录用户）
function goToLogin() {
  router.push('/user/login')
}

// 跳转编辑页（仅管理员）
function editNotice(id: string) {
  router.push(`/notice/edit/${id}`)
}

// 删除通知（仅管理员）
async function deleteNotice(id: string) {
  try {
    const res = await axios.post(`${baseURL}/notice/delete/${id}`)

    if (res.status === 200) {
      ElMessage.success('通告删除成功')
      fetchNotices() // 刷新列表
    } else {
      ElMessage.error('通告删除失败')
    }
  } catch (error: any) {
    console.error('删除通告失败:', error)
    ElMessage.error(error.response?.data?.message || '删除通告失败，请重试')
  }
}

// 确认删除对话框
function confirmDelete(id: string) {
  ElMessageBox.confirm(
      '确定要删除这条通告吗？此操作不可撤销。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    deleteNotice(id)
  }).catch(() => {
    // 取消操作，不做处理
  })
}

// 页面挂载时加载数据
onMounted(fetchNotices)
</script>

<style scoped>
/* 样式保持不变 */
.notice-page {
  padding: 20px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 40px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  color: #333;
  font-size: 20px;
  margin: 0;
}

.notice-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.loading-skeleton {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 12px;
}

.empty-state {
  margin: 40px auto;
  width: 100%;
  max-width: 600px;
}

.notice-card {
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  overflow: hidden;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.notice-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.notice-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.notice-meta {
  font-size: 14px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.admin-name {
  color: #e54d42;
  font-weight: 600;
}

.admin-actions {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notice-card:hover .admin-actions {
  opacity: 1;
}

.pagination-container {
  margin-top: 40px;
  text-align: center;
  padding: 16px 0;
}

@media (max-width: 992px) {
  .notice-card {
    min-height: auto;
  }

  .page-title {
    font-size: 18px;
  }

  .admin-actions {
    opacity: 1;
    position: static;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>