<template>
  <div class="create-notice-page">
    <div class="back-container">
      <el-button
          type="text"
          icon="el-icon-back"
          @click="$router.back()"
      >
        返回通知列表
      </el-button>
    </div>

    <el-card class="form-card animate-fade-in">
      <div class="form-header">
        <div class="form-title">发布新通知</div>
        <div class="form-subtitle">
          <span>发布者: {{ userInfoStore.userInfo.username || '系统管理员' }}</span>
        </div>
      </div>

      <el-form
          :model="noticeForm"
          :rules="rules"
          ref="formRef"
          label-width="100px"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input
              v-model="noticeForm.title"
              placeholder="请输入通知标题"
              maxlength="50"
              show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="是否重要">
          <el-switch
              v-model="noticeForm.is_important"
              active-color="#ff4d4f"
              active-text="是"
              inactive-text="否"
          ></el-switch>
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
              v-model="noticeForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入通知内容"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              @click="handleSubmit"
              :loading="isLoading"
              class="mr-3"
              :disabled="!userInfoStore.isLogin"
          >
            发布通知
          </el-button>
          <el-button
              type="default"
              @click="resetForm"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { baseURL } from '../../config'
import { useUserInfoStore } from '../../store/userInfoStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userInfoStore = useUserInfoStore()

const noticeForm = reactive({
  title: '',
  content: '',
  is_important: false,
})

const rules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在2-50个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 5, message: '内容至少5个字符', trigger: 'blur' }
  ]
}

const formRef = ref(null)
const isLoading = ref(false)

onMounted(() => {
  if (!userInfoStore.isLogin) {
    ElMessage.warning('请先登录才能发布通知')
    router.push('/user/login')
  }
})

const handleSubmit = () => {
  if (!userInfoStore.isLogin) {
    ElMessage.warning('登录状态已失效，请重新登录')
    router.push('/user/login')
    return
  }

  (formRef.value as any).validate((valid: boolean) => {
    if (valid) {
      submitNotice()
    } else {
      ElMessage.warning('表单信息不完整，请检查后重新提交')
    }
  })
}

const submitNotice = async () => {
  isLoading.value = true
  try {
    const userInfo = userInfoStore.userInfo

    // 根据 isAdmin 状态设置角色
    const role = userInfoStore.isAdmin ? 'admin' : 'user'

    const requestData = {
      title: noticeForm.title,
      content: noticeForm.content,
      username: userInfo.username || '系统管理员',
      avatar: userInfo.avatar || 'avatar/default.jpg',
      is_important: noticeForm.is_important,
      role: role, // 使用上面根据 isAdmin 判断的角色
      created_at: new Date().toISOString()
    }

    const response = await axios.post(`${baseURL}/notice/create`, requestData)

    if (response.status === 201) {
      ElMessage.success({
        message: '通知发布成功！',
        duration: 1500,
        onClose: () => {
          router.push('/notice')
        }
      })
    } else {
      ElMessage.error('发布失败，请重试')
    }
  } catch (error: any) {
    console.error('通知发布失败:', error)
    const errorMsg = error.response?.data?.message || '发布失败，请稍后重试'
    ElMessage.error(errorMsg)
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  (formRef.value as any).resetFields()
  noticeForm.is_important = false
}
</script>

<style scoped>
.create-notice-page {
  padding: 20px;
  margin-left: 20px;
  min-height: calc(100vh - 100px);
}

.back-container {
  margin-bottom: 20px;
}

.form-card {
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.form-header {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 14px;
  color: #666;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-button.mr-3) {
  margin-right: 15px !important;
}
</style>