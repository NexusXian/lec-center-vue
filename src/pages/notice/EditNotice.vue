<template>
  <div class="edit-notice-page">
    <!-- 返回按钮 -->
    <div class="back-container">
      <el-button
          type="text"
          icon="el-icon-back"
          @click="$router.back()"
      >
        返回通知列表
      </el-button>
    </div>

    <!-- 修改通知表单 -->
    <el-card class="form-card">
      <div class="form-title">修改通知</div>

      <el-form
          :model="noticeForm"
          :rules="rules"
          ref="formRef"
          label-width="100px"
      >
        <!-- 通知标题 -->
        <el-form-item label="通知标题" prop="title">
          <el-input
              v-model="noticeForm.title"
              placeholder="请输入通知标题"
              maxlength="50"
              show-word-limit
          ></el-input>
        </el-form-item>

        <!-- 是否重要 -->
        <el-form-item label="是否重要">
          <el-switch
              v-model="noticeForm.is_important"
              active-text="是"
              inactive-text="否"
          ></el-switch>
        </el-form-item>

        <!-- 通知内容 -->
        <el-form-item label="通知内容" prop="content">
          <el-input
              v-model="noticeForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入通知内容"
          ></el-input>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
              type="primary"
              @click="handleSubmit"
              :loading="isLoading"
          >
            保存修改
          </el-button>
          <el-button
              type="default"
              @click="$router.back()"
          >
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { baseURL } from '../../config'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 表单数据
const noticeForm = reactive({
  noticeID: '',
  title: '',
  content: '',
  username: '',
  avatar: '',
  is_important: false,
  role: '',
  created_at: ''
})

// 表单验证规则
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

// 表单引用
const formRef = ref<FormInstance | null>(null)

// 加载状态
const isLoading = ref(true)

// 页面加载时获取通知详情
onMounted(async () => {
  const noticeId = route.params.id

  if (!noticeId) {
    ElMessage.error('通知ID不能为空')
    router.push('/notice')
    return
  }

  try {
    // 获取通知详情
    const res = await axios.get(`${baseURL}/notice/${noticeId}`)

    if (res.status === 200 && res.data.data) {
      // 回填表单数据
      Object.assign(noticeForm, res.data.data)
    } else {
      ElMessage.error('获取通知详情失败')
      router.push('/notice')
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败，请稍后重试')
    router.push('/notice')
  } finally {
    isLoading.value = false
  }
})

// 提交表单（使用 Promise 版本的 validate）
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate() // 等待验证完成
    updateNotice() // 验证通过后执行更新
  } catch (error) {
    console.log('表单验证失败', error)
    // 不需要手动处理错误，Element UI 会自动显示错误信息
  }
}

// 更新通知到后端
const updateNotice = async () => {
  isLoading.value = true

  try {
    // 构建请求数据
    const data = {
      title: noticeForm.title,
      content: noticeForm.content,
      is_important: noticeForm.is_important,
      // 不更新创建时间和发布者信息
    }

    // 发送POST请求到后端（根据你的API实际情况可能需要改为PUT）
    const res = await axios.post(`${baseURL}/notice/edit/${noticeForm.noticeID}`, data)

    if (res.status === 200) {
      // 提交成功，提示并返回列表页
      ElMessage.success('通知更新成功')
      router.push('/notice')
    } else {
      ElMessage.error('通知更新失败')
    }
  } catch (error) {
    console.error('更新通知失败:', error)
    ElMessage.error('通知更新失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.edit-notice-page {
  padding: 20px;
  margin-left: 20px;
  min-height: calc(100vh - 100px);
}

.back-container {
  margin-bottom: 20px;
}

.form-card {
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  padding: 25px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}
</style>