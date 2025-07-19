<template>
  <div class="checkin-page">
    <!-- 返回按钮 -->
    <div class="back-container">
      <el-button
          type="text"
          icon="el-icon-back"
          @click="$router.back()"
      >
        返回
      </el-button>
    </div>

    <!-- 签到表单卡片 -->
    <el-card class="form-card">
      <div class="form-title">图片签到</div>

      <el-form
          :model="checkinForm"
          :rules="rules"
          ref="formRef"
          label-width="100px"
          class="checkin-form"
      >
        <!-- 用户信息（隐藏域） -->
        <el-form-item prop="email" hidden>
          <el-input v-model="checkinForm.email" />
        </el-form-item>
        <el-form-item prop="username" hidden>
          <el-input v-model="checkinForm.username" />
        </el-form-item>

        <!-- 上传签到图片 -->
        <el-form-item label="签到图片" prop="image">
          <el-upload
              class="upload-area"
              action=""
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :limit="1"
              :on-exceed="handleExceed"
              :file-list="fileList"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持JPG、JPEG、PNG格式，单张图片不超过10MB
              </div>
            </template>
          </el-upload>

          <!-- 图片预览 -->
          <el-image
              v-if="fileList.length > 0"
              :src="fileList[0].url"
              class="preview-img"
              fit="contain"
          ></el-image>
        </el-form-item>

        <!-- 签到备注 -->
        <el-form-item label="签到备注" prop="checkInfo">
          <el-input
              v-model="checkinForm.checkInfo"
              type="textarea"
              :rows="3"
              placeholder="请输入签到备注（可选）"
              maxlength="200"
              show-word-limit
          ></el-input>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
              type="primary"
              @click="handleSubmit"
              :loading="isLoading"
              :disabled="fileList.length === 0"
          >
            提交签到
          </el-button>
          <el-button
              type="default"
              @click="resetForm"
          >
            重置
          </el-button>
          <el-button
              type="info"
              icon="el-icon-document"
              @click="goToRecordList"
              style="margin-left: 10px"
          >
            查看签到记录
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
import { ElMessage, ElMessageBox } from 'element-plus'
// 导入正确的Element Plus表单类型
import type { FormInstance, UploadFile, UploadRawFile } from 'element-plus'

// 路由实例
const router = useRouter()

// 定义上传文件扩展类型（包含预览URL）
interface UploadFileWithUrl extends UploadFile {
  url?: string
}

// 表单数据类型定义
interface CheckinForm {
  email: string
  username: string
  checkInfo: string
  image: UploadRawFile | null
}

// 表单数据（与后端Attendance模型对应）
const checkinForm: CheckinForm = reactive({
  email: '',       // 用户邮箱（从登录态获取）
  username: '',    // 用户名（从登录态获取）
  checkInfo: '',   // 签到备注
  image: null      // 图片文件（用于表单验证）
})

// 上传文件列表（限制1张）
const fileList = ref<UploadFileWithUrl[]>([])
// 表单引用（使用正确的FormInstance类型）
const formRef = ref<FormInstance | null>(null)
// 加载状态
const isLoading = ref(false)
// 最大文件大小（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 字节

// 表单验证规则
const rules = {
  email: [
    { required: true, message: '用户信息缺失', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '用户信息缺失', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请选择签到图片', trigger: 'change' }
  ],
  checkInfo: [
    { max: 200, message: '备注不能超过200个字符', trigger: 'blur' }
  ]
}

// 页面加载时获取当前用户信息
onMounted(() => {
  // 从localStorage获取登录用户信息
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  const userInfo = JSON.parse(userInfoStr)
  if (userInfo.email && userInfo.username) {
    checkinForm.email = userInfo.email
    checkinForm.username = userInfo.username
  } else {
    ElMessage.warning('用户信息不完整，请重新登录')
    router.push('/login')
  }
})

// 处理文件选择（验证格式和大小）
const handleFileChange = (file: UploadFile) => {
  // 清空已有文件（确保只保留1张）
  fileList.value = []

  // 验证文件原始对象是否存在
  if (!file.raw) {
    ElMessage.error('文件格式错误')
    return
  }

  // 验证文件类型（仅图片）
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片格式文件（支持JPG、JPEG、PNG）')
    return
  }

  // 验证文件大小（≤10MB）
  if (file.raw.size > MAX_FILE_SIZE) {
    ElMessage.error('图片大小不能超过10MB')
    return
  }

  // 生成预览地址并添加到列表
  const fileWithUrl: UploadFileWithUrl = {
    ...file,
    url: URL.createObjectURL(file.raw)
  }
  fileList.value.push(fileWithUrl)
  checkinForm.image = file.raw // 绑定到表单用于验证
}

// 处理文件移除
const handleFileRemove = () => {
  fileList.value = []
  checkinForm.image = null
}

// 处理文件超出数量
const handleExceed = () => {
  ElMessage.error('最多只能上传1张图片')
}

// 提交签到（合并图片和表单数据）
const handleSubmit = async () => {
  // 表单验证（添加非空判断）
  if (!formRef.value) return
  await formRef.value.validate() // 使用正确的类型，不再报错

  // 验证文件是否存在
  if (fileList.value.length === 0 || !fileList.value[0].raw) {
    ElMessage.error('请选择签到图片')
    return
  }

  // 构建FormData（支持文件上传）
  const formData = new FormData()
  formData.append('email', checkinForm.email)
  formData.append('username', checkinForm.username)
  formData.append('image', fileList.value[0].raw)
  formData.append('check_info', checkinForm.checkInfo)

  try {
    isLoading.value = true
    // 调用后端接口
    const res = await axios.post(`${baseURL}/checkin`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (res.data.code === 200) {
      ElMessage.success('签到成功！')
      router.push('/clock-in/records')
    } else {
      ElMessage.error(res.data.error || '签到失败，请重试')
    }
  } catch (error) {
    console.error('签到请求失败：', error)
    ElMessage.error('网络错误，签到失败')
  } finally {
    isLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  // 判断是否需要重置
  if (fileList.value.length > 0 || checkinForm.checkInfo) {
    ElMessageBox.confirm(
        '确定要清空已选择的图片和备注吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      // 重置表单（添加非空判断）
      if (formRef.value) {
        formRef.value.resetFields() // 使用正确的类型，不再报错
      }
      fileList.value = []
    })
  } else {
    if (formRef.value) {
      formRef.value.resetFields() // 使用正确的类型，不再报错
    }
  }
}

// 跳转到签到记录列表
const goToRecordList = () => {
  router.push('/clock-in/records')
}
</script>

<style scoped>
.checkin-page {
  padding: 20px;
  margin-left: 20px;
  min-height: calc(100vh - 100px);
}

.back-container {
  margin-bottom: 20px;
}

.form-card {
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.checkin-form {
  margin-top: 20px;
}

.preview-img {
  width: 300px;
  height: 200px;
  margin-top: 10px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  padding: 5px;
}

.upload-area {
  margin-bottom: 10px;
}
</style>