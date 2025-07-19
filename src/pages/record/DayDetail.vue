<template>
  <div class="day-detail-page">
    <div class="page-header">
      <el-button
          type="text"
          icon="el-icon-back"
          @click="goBack"
      >返回</el-button>
      <h2 class="page-title">{{ formatDisplayDate(currentDate) }} 打卡详情</h2>
    </div>

    <el-table
        :data="dayAttendances"
        border
        style="width: 100%; margin-top: 20px"
        v-loading="isLoading"
    >
      <el-table-column
          prop="username"
          label="姓名"
          width="120"
          align="center"
      />
      <el-table-column
          prop="created_at"
          label="打卡时间"
          width="200"
          align="center"
          :formatter="formatFullTime"
      />
      <el-table-column
          prop="check_info"
          label="打卡备注"
          align="center"
          min-width="150"
      />
      <el-table-column
          label="打卡图片"
          align="center"
          width="120"
      >
        <template #default="scope">
          <el-image
              v-if="scope.row.img"
              :src="getImageUrl(scope.row.img)"
              :preview-src-list="[getImageUrl(scope.row.img)]"
              style="width: 60px; height: 60px; cursor: zoom-in"
          />
          <span v-else>无图片</span>
        </template>
      </el-table-column>
    </el-table>

    <el-empty
        v-if="!isLoading && dayAttendances.length === 0"
        description="暂无该日打卡记录"
        style="margin: 40px auto"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { baseURL } from '../../config' // 确保你的 baseURL 配置正确
import { ElMessage } from 'element-plus'

// 类型定义
interface Attendance {
  ID: number
  username: string
  email: string
  created_at: string
  img: string
  check_info: string
}

// 状态
const route = useRoute()
const router = useRouter()
const currentDate = ref('') // 当前日期（从路由参数获取）
const dayAttendances = ref<Attendance[]>([]) // 当日所有打卡记录
const isLoading = ref(true)

// 格式化日期显示（2025/7/18 → 2025年07月18日）
function formatDisplayDate(dateKey: string) {
  try {
    // 确保月份和日期是两位数
    const [year, month, day] = dateKey.split('/')
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    return `${year}年${formattedMonth}月${formattedDay}日`
  } catch (e) {
    return dateKey
  }
}

// 格式化完整时间（含秒）
function formatFullTime(row: Attendance) {
  try {
    return new Date(row.created_at).toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return row.created_at
  }
}

// 构建图片URL（添加baseURL前缀）
function getImageUrl(imgPath: string) {
  // 如果已经是完整URL则直接返回
  if (imgPath.startsWith('http') || imgPath.startsWith('//')) {
    return imgPath
  }
  // 拼接baseURL和图片路径
  return `${baseURL}${imgPath}`
}

// 获取当日打卡记录
async function fetchDayAttendances() {
  isLoading.value = true
  try {
    const rawDate = route.query.date as string;
    // 解码 URL 中的日期字符串，例如 '2025%2F3%2F17' 会变成 '2025/3/17'
    const decodedDate = decodeURIComponent(rawDate);

    // 关键修改：将日期格式化为 YYYY/MM/DD 且月份和日期有前导零
    // 示例：将 '2025/3/17' 转换为 '2025/03/17'
    const dateParts = decodedDate.split('/');
    const year = dateParts[0];
    const month = dateParts[1].padStart(2, '0'); // 添加前导零
    const day = dateParts[2].padStart(2, '0');   // 添加前导零
    const formattedDateForBackend = `${year}/${month}/${day}`;

    currentDate.value = formattedDateForBackend; // 更新页面显示的日期

    // 调用接口获取该日数据
    // 请求路径将是：`${baseURL}/record/attendance/day?date=2025/03/17`
    const res = await axios.get(`${baseURL}/record/attendance/day`, {
      params: { date: formattedDateForBackend } // 发送格式化后的日期
    });

    // 按时间排序（最新的在前面）
    dayAttendances.value = (res.data.data || []).sort(
        (a: Attendance, b: Attendance) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } catch (err: any) {
    // 改进错误消息显示
    ElMessage.error('获取打卡详情失败：' + (err.response?.data?.message || '未知错误'));
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

// 返回主页面
function goBack() {
  router.back()
}

// 页面加载时获取数据
onMounted(fetchDayAttendances)
</script>

<style scoped>
.day-detail-page {
  padding: 20px;
  margin-left: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #333;
}

/* 表格图片预览样式 */
::v-deep .el-image-viewer__wrapper {
  z-index: 9999;
}
</style>