<template>
  <div class="attendance-page">
    <div class="page-header">
      <h2 class="page-title">打卡记录管理</h2>
      <div class="action-btn-container">
      </div>
    </div>

    <div class="attendance-container">
      <el-skeleton
          v-if="isLoading && Object.keys(groupedAttendances).length === 0"
          :rows="6"
          animated
          class="loading-skeleton"
      />

      <div v-else-if="Object.keys(groupedAttendances).length === 0" class="empty-state">
        <el-empty
            description="暂无打卡数据"
            :image="ElEmpty.PLACEHOLDER_IMAGE_SIMPLE"
        >
          <template #footer>
            <el-button
                v-if="!userStore.isLogin"
                type="primary"
                @click="goToLogin"
            >
              登录后打卡
            </el-button>
          </template>
        </el-empty>
      </div>

      <div v-else class="attendance-groups">
        <el-row
            :gutter="25"
            style="row-gap: 20px"
        >
          <el-col :span="8" v-for="(group, date) in groupedAttendances" :key="date">
            <el-card
                class="date-group-card"
                shadow="hover"
                @click="goToDayDetail(date)"
            >
              <div class="group-title">
                {{ formatDisplayDate(date) }}
                <el-tag type="info" size="small" class="ml-2">
                  {{ group.length }}人打卡
                </el-tag>
              </div>

              <div class="group-meta">
                <span class="latest-checkin">
                  最新：{{ group[0].username }}
                </span>
                <span class="checkin-count">
                  {{ formatTime(group[0].created_at) }}
                </span>
              </div>

              <div v-if="userStore.isAdmin" class="admin-actions">
                <el-button
                    type="text"
                    size="small"
                    icon="el-icon-download"
                    @click.stop="exportDayData(date)"
                >
                  导出
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <div class="pagination-container">
          <el-pagination
              background
              layout="prev, pager, next, total"
              :total="total"
              :page-size="pageSize"
              :current-page="page"
              :pager-count="5"
              @current-change="handlePageChange"
          />
        </div>
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
import { useUserInfoStore } from '../../store/userInfoStore.ts'

// 状态管理
const userStore = useUserInfoStore()
const router = useRouter()

// 状态定义
const attendances = ref<Attendance[]>([]) // 原始打卡数据（与后端字段匹配）
const groupedAttendances = ref<Record<string, Attendance[]>>({}) // 按日期分组的小卡片数据
const page = ref(1)
const pageSize = 9 // 每页显示9个日期卡片（3行3列）
const total = ref(0) // 总记录数（现在是总的打卡天数）
const isLoading = ref(false)

// 打卡记录类型（与后端返回字段完全匹配）
interface Attendance {
  ID: number
  username: string // 后端字段：username
  email: string // 后端字段：email
  created_at: string // 后端字段：created_at
  img: string // 后端字段：img
  check_info: string // 后端字段：check_info
}

// 获取打卡记录列表
async function fetchAttendances() {
  isLoading.value = true
  try {
    const res = await axios.get(`${baseURL}/record/list`, {
      params: { page: page.value, pageSize: pageSize }
    })

    // 绑定后端数据（字段完全匹配）
    attendances.value = res.data.data || []
    total.value = res.data.total || 0 // total 现在是总的打卡天数

    // 按日期分组生成小卡片
    groupAttendancesByDate()
  } catch (err: any) {
    console.error('获取打卡记录失败:', err)
    ElMessage.error(err.response?.data?.message || '获取打卡记录失败，请重试')
    groupedAttendances.value = {}
  } finally {
    isLoading.value = false
  }
}

// 按日期分组（核心：生成每天的小卡片数据）
function groupAttendancesByDate() {
  const groupMap: Record<string, Attendance[]> = {}

  // 1. 按时间排序（最新的在前面）
  const sortedAttendances = [...attendances.value].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // 2. 按日期分组（键为“YYYY/MM/DD”）
  sortedAttendances.forEach(attendance => {
    // 这里要注意，后端返回的 created_at 可能是 ISO 格式字符串，
    // toLocaleDateString('zh-CN') 通常会得到 'YYYY/M/D' 格式，不带前导零。
    // 为了与后端 `DATE_FORMAT(created_at, '%Y-%m-%d')` 返回的 'YYYY-MM-DD' 格式统一，
    // 建议统一使用 'YYYY-MM-DD' 或 'YYYY/MM/DD' 格式作为 dateKey。
    // 假设后端返回的 created_at 格式能够被 new Date() 正确解析。
    // 如果后端在 `record/list` 中返回的 `created_at` 已经是 `YYYY-MM-DD`，
    // 或者你可以调整后端 `record/list` 的 `created_at` 格式，来减少前端处理。
    // 这里为了兼容性，假设 created_at 是标准日期字符串
    const dateObj = new Date(attendance.created_at);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
    const day = dateObj.getDate().toString().padStart(2, '0'); // 日补零
    const dateKey = `${year}/${month}/${day}`; // 确保格式为 YYYY/MM/DD，与导出参数一致

    if (!groupMap[dateKey]) {
      groupMap[dateKey] = []
    }
    groupMap[dateKey].push(attendance)
  })

  // 3. 赋值给分组数据（用于渲染小卡片）
  groupedAttendances.value = groupMap
}

// 格式化日期显示（2025/7/18 → 2025年07月18日）
function formatDisplayDate(dateKey: string) {
  try {
    const [year, month, day] = dateKey.split('/').map(num => {
      // 补零（7 → 07）
      return num.padStart(2, '0')
    })
    return `${year}年${month}月${day}日`
  } catch (e) {
    return dateKey
  }
}

// 格式化时间（仅显示时分：19:42）
function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

// 分页切换
function handlePageChange(newPage: number) {
  page.value = newPage
  fetchAttendances()
}

// 点击小卡片跳转至当日详情
function goToDayDetail(date: string) {
  router.push(`/attendance/day?date=${encodeURIComponent(date)}`)
}

// 跳转登录页
function goToLogin() {
  router.push('/user/login')
}

// 导出当日数据（管理员）
function exportDayData(date: string) {
  if (!userStore.isAdmin) return

  ElMessageBox.confirm(
      `确定要导出${formatDisplayDate(date)}的打卡数据吗？`,
      '导出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
  ).then(async () => {
    try {
      const res = await axios.get(`${baseURL}/export`, {
        params: { date: date },
        responseType: 'blob' // 必须是 blob 类型才能正确处理文件下载
      })

      // 从响应头中获取文件名，如果后端设置了 Content-Disposition
      // 否则使用默认文件名
      let filename = `打卡记录_${date.replace(/\//g, '-')}.xlsx`; // 默认文件名
      const contentDisposition = res.headers['content-disposition'];
      if (contentDisposition) {
        // 匹配 filename 或 filename*
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;]+)['"]?$/i);
        if (filenameMatch && filenameMatch[1]) {
          try {
            // 解码可能的 URI 编码文件名
            filename = decodeURIComponent(filenameMatch[1]);
          } catch (e) {
            console.error("Failed to decode filename from header:", e);
          }
        }
      }

      // 创建 Blob URL 并下载
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // 设置下载文件名
      document.body.appendChild(a); // 某些浏览器需要将 a 标签添加到 DOM 中才能触发点击
      a.click();
      document.body.removeChild(a); // 下载后移除
      window.URL.revokeObjectURL(url); // 释放 Blob URL 资源

      ElMessage.success('导出成功');
    } catch (err: any) {
      console.error('导出失败:', err);
      // 尝试解析错误响应，如果后端返回了 JSON 错误信息
      if (err.response && err.response.data instanceof Blob) {
        // 如果错误响应是 Blob，尝试将其读取为文本
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            ElMessage.error(errorData.message || '导出失败，请重试');
          } catch (e) {
            ElMessage.error('导出失败，请重试'); // 解析失败
          }
        };
        reader.readAsText(err.response.data);
      } else {
        ElMessage.error(err.response?.data?.message || '导出失败，请重试');
      }
    }
  }).catch(() => {
    // 用户取消操作
    ElMessage.info('导出已取消');
  });
}

// 页面加载时获取数据
onMounted(fetchAttendances)
</script>

<style scoped>
.attendance-page {
  padding: 20px;
  margin-left: 20px;
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

.attendance-container {
  flex: 1;
}

.loading-skeleton {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 12px;
}

.empty-state {
  margin: 40px auto;
  max-width: 600px;
}

/* 每日小卡片样式 */
.date-group-card {
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}

.date-group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  display: flex;
  align-items: center;
}

.group-meta {
  font-size: 14px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.latest-checkin {
  color: #4096ff;
}

.admin-actions {
  position: absolute;
  right: 10px;
  bottom: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.date-group-card:hover .admin-actions {
  opacity: 1;
}

.pagination-container {
  margin-top: 40px;
  text-align: center;
  padding: 16px 0;
}

/* 响应式适配 */
@media (max-width: 992px) {
  .date-group-card {
    min-height: auto;
  }
  .admin-actions {
    opacity: 1;
    position: static;
    margin-top: 10px;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .attendance-page {
    margin-left: 0;
    padding: 10px;
  }
  .group-title {
    font-size: 16px;
  }
}
</style>