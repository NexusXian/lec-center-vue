<template>
  <div class="page-background">
    <div style="width: 95%; max-width: 1400px; display: flex; justify-content: flex-end; margin-bottom: 20px">
      <el-button type="primary" plain @click="openMyRecord">我的打卡记录</el-button>
    </div>

    <div class="frosted-table-card">
      <el-table :data="userList" style="width: 100%" height="400">
        <el-table-column label="头像" width="100">
          <template #default="scope">
            <img :src="getAvatarUrl(scope.row.avatar)" class="user-avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="姓名" />
        <el-table-column prop="major" label="专业" />
        <el-table-column prop="grade" label="年级" />
        <el-table-column prop="direction" label="方向" />
        <el-table-column prop="count" label="打卡次数" sortable />
      </el-table>

      <div style="margin-top: 20px; text-align: center">
        <el-pagination
            background
            layout="prev, pager, next"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalUsers"
            @current-change="handlePageChange"
        />
      </div>
    </div>

    <div class="rank-card-header-style leaderboard-card-base">
      <h3 style="margin-bottom: 10px; color: #2c3e50;">打卡排行榜 🏆</h3>
      <div
          v-for="(item, index) in topFive"
          :key="item.UserID"
          class="leaderboard-item"
      >
        <img :src="getAvatarUrl(item.avatar)" class="user-avatar" />
        <span class="leaderboard-text-with-details">
          <span class="rank-number">{{ index + 1 }}.</span>
          <span class="user-details">{{ item.grade }}{{ item.major }} {{ item.username }}</span>
          <span class="count-display">({{ item.count }}次)</span>
        </span>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="我的打卡记录" width="500px">
      <template #default>
        <p v-if="myUser" style="font-weight: 600; margin-bottom: 15px;">姓名：{{ myUser.username }}</p>
        <el-timeline v-if="myRecords.length > 0">
          <el-timeline-item
              v-for="(item, index) in myRecords"
              :key="index"
              :timestamp="item.date"
          >
            {{ item.detail }}
          </el-timeline-item>
        </el-timeline>
        <p v-else>暂无打卡记录。</p>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { baseURL } from "../../config";
import {useRouter} from "vue-router";
const router = useRouter()
// --- 接口定义 ---
interface User {
  UserID: number
  username: string
  email: string
  phone: string
  grade: string
  major: string
  avatar: string
  role: string
  count: number
  direction: string
  created_at: string
  updated_at: string
}

interface AttendanceRecord {
  date: string
  detail: string
}

// --- 状态管理 (State) ---
const userList = ref<User[]>([])
const totalUsers = ref(0)
const topFive = ref<User[]>([])
const myRecords = ref<AttendanceRecord[]>([])
const dialogVisible = ref(false)
const myUser = ref<User | null>(null)

// --- 分页相关 ---
const currentPage = ref(1)
const pageSize = ref(5) // Set to 5 items per page

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPaginatedUsers()
}

// --- 工具函数 ---
const getAvatarUrl = (path: string) => {
  if (!path || path.startsWith('http')) {
    return path || 'https://placehold.co/50x50/cccccc/ffffff?text=No+Img';
  }
  return `${baseURL}${path}`
}

// --- API 请求 ---

const fetchPaginatedUsers = async () => {
  try {
    const res = await axios.get(`${baseURL}/rank/table`, {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
      }
    })
    if (res.data && res.data.data) {
      userList.value = res.data.data.list
      totalUsers.value = res.data.data.total
    }
  } catch (err) {
    console.error('Failed to fetch paginated user data:', err)
  }
}

const fetchLeaderboard = async () => {
  try {
    const res = await axios.get(`${baseURL}/rank/board`)
    // Validate status code and data format
    if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
      topFive.value = res.data.data; // Directly use the data array
    } else {
      console.warn('Leaderboard data error:', res.data);
      topFive.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
    topFive.value = [];
  }
}


const fetchMyData = async () => {
  try {
    const res = await axios.get(`${baseURL}/user/me`)
    if (res.data && res.data.data) {
      myUser.value = res.data.data
    }
  } catch (err) {
    console.error('Failed to fetch current user info:', err)
  }
}

const openMyRecord = async () => {
  router.push('/clock-in/records')
}

// --- Lifecycle Hook ---
onMounted(() => {
  fetchPaginatedUsers()
  fetchLeaderboard()
  fetchMyData()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-background {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background-size: cover;
}

.frosted-table-card {
  width: 95%;
  max-width: 1400px;
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.frosted-table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.el-table {
  background-color: transparent !important;
}

:deep(.el-table th.el-table__cell), :deep(.el-table tr) {
  background-color: transparent;
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.6) !important;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.el-table td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.4) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #333;
}

.el-table::before {
  background-color: transparent !important;
}

:deep(.el-table .el-table__body tr:hover > td.el-table__cell) {
  background-color: rgba(230, 230, 250, 0.5) !important;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.leaderboard-card-base {
  margin-top: 30px;
  width: 400px;
  padding: 20px;
  border-radius: 12px;
}

.rank-card-header-style {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* Updated styles for leaderboard items */
.leaderboard-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.leaderboard-text-with-details {
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  align-items: baseline;
  gap: 5px;
  font-weight: 500;
  color: #34495e;
}

.rank-number {
  font-weight: 600;
  color: #2c3e50;
  width: 25px;
  text-align: right;
  flex-shrink: 0;
}

.user-details {
  flex-grow: 1;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95em;
  color: #555;
}

.count-display {
  font-weight: 600;
  color: #4CAF50;
  min-width: 60px;
  text-align: right;
  flex-shrink: 0;
}
</style>