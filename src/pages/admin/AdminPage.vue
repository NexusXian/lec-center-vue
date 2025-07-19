<template>
  <div class="page-background">
    <div class="frosted-table-card">
      <!-- 新增：右上角操作按钮区域 -->
      <div class="action-buttons">
        <el-button
            type="success"
            @click="handleCheckAttendance"
            icon="Calendar"
        >
          查看打卡记录
        </el-button>
      </div>

      <div class="search-form" style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.3); border-radius: 8px;">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-input
                v-model="searchForm.username"
                placeholder="请输入姓名搜索"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.major"
                placeholder="选择专业"
                clearable
                @change="handleSearch"
            >
              <el-option
                  v-for="major in majorOptions"
                  :key="major"
                  :label="major"
                  :value="major"
              />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.grade"
                placeholder="选择年级"
                clearable
                @change="handleSearch"
            >
              <el-option
                  v-for="year in gradeOptions"
                  :key="year"
                  :label="year"
                  :value="year"
              />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.direction"
                placeholder="选择方向"
                clearable
                @change="handleSearch"
            >
              <el-option
                  v-for="direction in directionOptions"
                  :key="direction"
                  :label="direction"
                  :value="direction"
              />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.role"
                placeholder="选择身份"
                clearable
                @change="handleSearch"
            >
              <el-option label="负责人" value="admin" />
              <el-option label="团队成员" value="user" />
            </el-select>
          </el-col>
          <el-col :span="2">
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </el-col>
          <el-col :span="2">
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <el-table :data="userList" style="width: 100%" height="400">
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="scope">
            <img
                :src="getAvatarUrl(scope.row.avatar)"
                alt="Avatar"
                class="user-avatar"
                onerror="this.onerror=null; this.src='https://placehold.co/50x50/cccccc/ffffff?text=No+Img';"
            />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="姓名" width="120" />
        <el-table-column prop="grade" label="年级" width="120" />
        <el-table-column prop="major" label="专业" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="created_at" label="注册时间" width="160" />
        <el-table-column prop="updated_at" label="更新时间" width="160" />
        <el-table-column label="身份" width="100">
          <template #default="scope">
            <span :class="{ 'admin-role': scope.row.role === 'admin' }">
              {{ scope.row.role === 'admin' ? '负责人' : '团队成员' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="direction" label="负责方向" width="100" />
        <el-table-column fixed="right" label="操作" min-width="120">
          <template #default="scope">
            <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="deleteUser(scope.row)"
                :disabled="scope.row.role === 'admin'"
            />
            <el-button
                type="primary"
                :icon="Edit"
                circle
                size="small"
                @click="openEditDrawer(scope.row)"
                :disabled="scope.row.role === 'admin'"
            />
          </template>
        </el-table-column>
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

      <el-drawer v-model="drawer2" :direction="directionDrawer">
        <template #header>
          <h4>编辑用户</h4>
        </template>
        <template #default>
          <div v-if="editingUser" class="edit-user-form">
            <el-form :model="editingUser" label-width="80px" label-position="left">
              <el-form-item label="头像">
                <img
                    :src="getAvatarUrl(editingUser.avatar)"
                    alt="Avatar"
                    class="user-avatar-large"
                    onerror="this.onerror=null; this.src='https://placehold.co/80x80/cccccc/ffffff?text=No+Img';"
                />
              </el-form-item>
              <el-form-item label="姓名">
                <el-input v-model="editingUser.username" />
              </el-form-item>
              <el-form-item label="年级">
                <el-select v-model="editingUser.grade" placeholder="选择年级" style="width: 100%;">
                  <el-option
                      v-for="year in gradeOptions"
                      :key="year"
                      :label="year"
                      :value="year"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="专业">
                <el-select v-model="editingUser.major" placeholder="选择专业" style="width: 100%;">
                  <el-option
                      v-for="major in majorOptions"
                      :key="major"
                      :label="major"
                      :value="major"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="editingUser.email" disabled />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="editingUser.phone" disabled />
              </el-form-item>
              <el-form-item label="注册时间">
                <el-input v-model="editingUser.created_at" disabled />
              </el-form-item>
              <el-form-item label="更新时间">
                <el-input v-model="editingUser.updated_at" disabled />
              </el-form-item>
              <el-form-item label="身份">
                <el-select v-model="editingUser.role" placeholder="选择身份" style="width: 100%;">
                  <el-option label="负责人" value="admin" />
                  <el-option label="团队成员" value="user" />
                </el-select>
              </el-form-item>
              <el-form-item label="方向">
                <el-select v-model="editingUser.direction" placeholder="选择方向" style="width: 100%;">
                  <el-option
                      v-for="direction in directionOptions"
                      :key="direction"
                      :label="direction"
                      :value="direction"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <div v-else>
            <p>没有选择用户进行编辑。</p>
          </div>
        </template>
        <template #footer>
          <div style="flex: auto">
            <el-button @click="cancelClick">取消</el-button>
            <el-button type="primary" @click="confirmClick">确认</el-button>
          </div>
        </template>
      </el-drawer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Edit } from '@element-plus/icons-vue'  // 新增导入Calendar图标
import type { DrawerProps } from 'element-plus'
import { baseURL } from "../../config";
import {useRouter} from "vue-router";
const router = useRouter();

// 接口定义
interface User {
  UserID: number;
  username: string;
  email: string;
  phone: string;
  grade: string;
  major: string;
  avatar: string;
  role: string;
  count: number;
  direction: string;
  created_at: string;
  updated_at: string;
}

// 搜索表单数据
const searchForm = ref({
  username: '',
  major: '',
  grade: '',
  direction: '',
  role: ''
})

// 响应式数据
const userList = ref<User[]>([])
const totalUsers = ref(0)
const editingUser = ref<User | null>(null)
const adminInfo = ref<any>(null)

// 抽屉相关
const drawer2 = ref(false)
const directionDrawer = ref<DrawerProps['direction']>('rtl')

// 分页逻辑
const currentPage = ref(1)
const pageSize = ref(5)

// 表单选项
const gradeOptions = ref<string[]>([])
for (let i = 2010; i <= 2030; i++) {
  gradeOptions.value.push(String(i))
}
const majorOptions = ref(['数媒', '信管', '网工', '电计', '其他'])
const directionOptions = ref(['微课', '前端', '后端', '嵌入式', '机器学习'])

// 分页变更处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPaginatedUsers()
}

// 头像URL处理
const getAvatarUrl = (path: string) => {
  if (!path || path.startsWith('http')) {
    return path || 'https://placehold.co/50x50/cccccc/ffffff?text=No+Img'
  }
  return `${baseURL}${path}`
}

// 抽屉操作
const openEditDrawer = (user: User) => {
  editingUser.value = JSON.parse(JSON.stringify(user))
  drawer2.value = true
}

const cancelClick = () => {
  drawer2.value = false
  editingUser.value = null
}

const confirmClick = async () => {
  if (!editingUser.value) return

  ElMessageBox.confirm(`确定保存对${editingUser.value.username}的修改？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.post(`${baseURL}/admin/updateUser`, {
        UserID: editingUser.value?.UserID,
        username: editingUser.value?.username,
        grade: editingUser.value?.grade,
        major: editingUser.value?.major,
        role: editingUser.value?.role,
        direction: editingUser.value?.direction,
        email: editingUser.value?.email,
      })

      if (response.data.code === 200) {
        ElMessage.success('修改成功')
        drawer2.value = false
        fetchPaginatedUsers()
      } else {
        ElMessage.error(`修改失败：${response.data.msg || '未知错误'}`)
      }
    } catch (error) {
      console.error('修改用户失败：', error)
      ElMessage.error('网络错误，修改失败')
    }
  }).catch(() => {
    ElMessage.info('已取消修改')
  })
}

// 删除用户
const deleteUser = async (user: User) => {
  ElMessageBox.confirm(`确定删除用户${user.username}？此操作不可恢复`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      const response = await axios.post(`${baseURL}/admin/deleteUser`, {
        email: user.email
      })

      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        if (userList.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
        }
        fetchPaginatedUsers()
      } else {
        ElMessage.error(`删除失败：${response.data.msg || '未知错误'}`)
      }
    } catch (error) {
      console.error('删除用户失败：', error)
      ElMessage.error('网络错误，删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 搜索与重置
const handleSearch = () => {
  currentPage.value = 1
  fetchPaginatedUsers()
}

const resetSearch = () => {
  searchForm.value = {
    username: '',
    major: '',
    grade: '',
    direction: '',
    role: ''
  }
  currentPage.value = 1
  fetchPaginatedUsers()
}

const handleCheckAttendance = () => {
router.push('/clock/record')

}

//
const fetchPaginatedUsers = async () => {
  try {
    userList.value = []

    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.value.username,
      major: searchForm.value.major,
      grade: searchForm.value.grade,
      direction: searchForm.value.direction,
      role: searchForm.value.role
    }

    const response = await axios.post(`${baseURL}/query/user`, params)

    if (response.data.code === 200 && response.data.data) {
      userList.value = response.data.data.list || []
      totalUsers.value = response.data.data.total || 0
    } else {
      ElMessage.error(`获取数据失败：${response.data.msg || '未知错误'}`)
    }
  } catch (error) {
    console.error('获取用户列表失败：', error)
    ElMessage.error('网络错误，无法获取数据')
  }
}

// 获取管理员信息
const getAdminInfo = async () => {
  try {
    const response = await axios.get(`${baseURL}/admin/info`)
    if (response.data.code === 200) {
      adminInfo.value = response.data.data
    } else {
      ElMessage.error(`获取管理员信息失败：${response.data.msg}`)
    }
  } catch (error) {
    console.error('获取管理员信息失败：', error)
  }
}

// 页面加载时初始化
onMounted(() => {
  getAdminInfo().then(() => {
    fetchPaginatedUsers()
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* 新增：右上角按钮样式 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

/* 全局样式 */
* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 全局消息提示样式 */
:global(.el-message) {
  border: none !important;
  background: rgba(92, 42, 157, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(110, 142, 251, 0.4) !important;
}
:global(.el-message--success) {
  background: linear-gradient(135deg, #6e8efb, #a777e3) !important;
}
:global(.el-message--error) {
  background: rgba(92, 42, 157, 0.9) !important;
}

/* Element Plus 下拉菜单和弹框背景 */
:global(.el-popper.is-light) {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 6px 20px 0 rgba(31, 38, 135, 0.2) !important;
}

:global(.el-select-dropdown__item) {
  color: #34495e !important;
}
:global(.el-select-dropdown__item.hover),
:global(.el-select-dropdown__item.selected) {
  background-color: rgba(110, 142, 251, 0.1) !important;
}

/* 页面背景样式 */
.page-background {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-size: cover;
}

/* 卡片容器样式 */
.frosted-table-card {
  width: 95%;
  max-width: 1400px;
  padding: 30px;
  border-radius: 24px;
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.frosted-table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 50px 0 rgba(31, 38, 135, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

/* 表格样式 */
.frosted-table-card :deep(.el-table) {
  background-color: transparent !important;
}
.frosted-table-card :deep(.el-table th.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(10px);
  color: #2c3e50 !important;
  font-weight: 600 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
}
.frosted-table-card :deep(.el-table td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(8px);
  color: #34495e !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
}
.frosted-table-card :deep(.el-table__inner-wrapper::before) {
  background-color: transparent !important;
}
.frosted-table-card :deep(.el-table__fixed),
.frosted-table-card :deep(.el-table__fixed-right) {
  background-color: transparent !important;
  box-shadow: none !important;
}

/* 表格行交互样式 */
.frosted-table-card :deep(.el-table__body tr:hover > td) {
  background-color: rgba(240, 240, 255, 0.3) !important;
}
.frosted-table-card :deep(.el-table__body tr.el-table__row--striped > td) {
  background-color: rgba(255, 255, 255, 0.4) !important;
}
.frosted-table-card :deep(.el-table__body tr.el-table__row--striped.hover-row > td) {
  background-color: rgba(240, 240, 255, 0.4) !important;
}

/* 头像样式 */
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

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto 20px auto;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 抽屉样式 */
:deep(.el-drawer) {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 24px !important;
  --el-drawer-bg-color: transparent;
}

:deep(.el-drawer__header) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 20px 10px 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-drawer__body) {
  padding: 0 20px;
}

:deep(.el-drawer__footer) {
  margin: 10px 20px 0 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.3) !important;
}

/* 表单样式 */
:deep(.el-form-item__label) {
  color: #34495e !important;
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  background-color: rgba(255, 255, 255, 0.45) !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: none !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* 查询表单样式 */
.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select__wrapper) {
  background-color: rgba(255, 255, 255, 0.6) !important;
}

.search-form :deep(.el-button) {
  width: 100%;
}

/* 管理员身份样式 */
.admin-role {
  color: #ff4d4f !important;
  font-weight: 600;
}

/* 分页器样式 */
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled)) {
  background-color: rgba(255, 255, 255, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #34495e !important;
}
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background: linear-gradient(135deg, #6e8efb, #a777e3) !important;
  color: white !important;
  border-color: transparent !important;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .search-form :deep(.el-col) {
    margin-bottom: 10px;
    flex-basis: 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .frosted-table-card {
    padding: 20px;
  }
  .search-form {
    padding: 10px;
  }
  .el-table-column[prop="email"],
  .el-table-column[prop="phone"],
  .el-table-column[prop="created_at"],
  .el-table-column[prop="updated_at"] {
    display: none;
  }
}
</style>