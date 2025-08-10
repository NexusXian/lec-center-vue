<template>
  <div class="link-page">
    <div class="page-header">
      <h2 class="page-title">友情链接</h2>
    </div>

    <div class="link-container">
      <el-skeleton
          v-if="isLoading && links.length === 0"
          :rows="6"
          animated
          class="loading-skeleton"
      />

      <div v-else-if="links.length === 0" class="empty-state">
        <el-empty
            description="暂无友情链接数据"
            :image="ElEmpty.PLACEHOLDER_IMAGE_SIMPLE"
        />
      </div>

      <el-row
          v-else
          :gutter="25"
          style="row-gap: 20px"
      >
        <el-col :span="8" v-for="link in links" :key="link.linkID">
          <el-card
              class="link-card"
              shadow="hover"
              @click="goToLink(link.url)"
          >
            <div class="link-image-container">
              <el-image
                  :src="link.imageUrl"
                  :alt="link.name"
                  class="link-image"
                  fit="cover"
                  lazy
              >
                <template #error>
                  <div class="image-error">
                    <el-icon class="image-icon"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>

            <div class="link-title">
              {{ link.name }}
              <el-tag
                  v-if="link.is_recommended"
                  type="success"
                  size="small"
                  class="ml-2"
              >
                推荐
              </el-tag>
            </div>

            <div class="link-url">
              <el-tooltip
                  effect="dark"
                  :content="link.url"
                  placement="top"
                  :disabled="link.url.length < 20"
              >
                <span class="url-text">{{ formatUrl(link.url) }}</span>
              </el-tooltip>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElEmpty, ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

// 友情链接数据（直接写入网址）
const links = ref([
  {
    linkID: 1,
    name: "西南石油大学门户网站",
    url: "https://www.swpu.edu.cn/",
    imageUrl: "/links/swpu.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 2,
    name: "西南石油大学南充校区门户网站",
    url: "https://www.swpu.edu.cn/nc/",
    imageUrl: "/links/nanchong.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 3,
    name: "西南石油大学本科教学服务平台",
    url: "https://deanservices.swpu.edu.cn/jwapp/sys/jwauthapp/login/index.html#/login",
    imageUrl: "/links/jiaowu.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 4,
    name: "西南石油大学选课系统",
    url: "https://deancs.swpu.edu.cn/xsxk/profile/index.html",
    imageUrl: "/links/xuanke.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 5,
    name: "ArchLinux官网",
    url: "https://archlinux.org/",
    imageUrl: "/links/archlinux.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 6,
    name: "阿里云官网",
    url: "https://cn.aliyun.com/",
    imageUrl: "/links/aliyun.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 7,
    name: "华为云开发者学堂",
    url: "https://edu.huaweicloud.com/courses",
    imageUrl: "/links/huaweiyun.png", // 修正路径
    is_recommended: true
  },
  {
    linkID:8,
    name: "学习通",
    url: "https://v3.chaoxing.com/toJcLogin",
    imageUrl: "/links/xuexitong.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 9,
    name: "mooc",
    url: "https://www.icourse163.org/",
    imageUrl: "/links/mooc.png", // 修正路径
    is_recommended: true
  },
  {
    linkID:10,
    name: "智慧树",
    url: "https://passport.zhihuishu.com/login",
    imageUrl: "/links/zhihuishu.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 11,
    name: "洛谷",
    url: "https://www.luogu.com.cn/",
    imageUrl: "/links/luogu.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 12,
    name: "力扣",
    url: "https://leetcode.cn/",
    imageUrl: "/links/leetcode.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 13,
    name: "牛客",
    url: "https://www.nowcoder.com/",
    imageUrl: "/links/niuke.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 14,
    name: "boss直聘",
    url: "https://www.zhipin.com/chengdu/?seoRefer=index/",
    imageUrl: "/links/boss.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 15,
    name: "计算机设计大赛",
    url: "https://jsjds.blcu.edu.cn/",
    imageUrl: "/links/jisuanjisheji.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 16,
    name: "服务外包大赛",
    url: "http://www.fwwb.org.cn/",
    imageUrl: "/links/fuwuwaibao.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 17,
    name: "蓝桥杯",
    url: "https://dasai.lanqiao.cn/",
    imageUrl: "/links/lanqiaobei.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 18,
    name: "大学生创新创业",
    url: "https://cy.ncss.cn/",
    imageUrl: "/links/dachuang.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 19,
    name: "github",
    url: "https://github.com/",
    imageUrl: "/links/github.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 20,
    name: "博客园",
    url: "https://www.cnblogs.com/",
    imageUrl: "/links/bokeyuan.png", // 修正路径
    is_recommended: true
  },

  {
    linkID: 21,
    name: "成都校区乐程团队Github仓库",
    url: "https://github.com/lec-org",
    imageUrl: "/links/chengduxiaoqu.png", // 修正路径
    is_recommended: true
  },
  {
    linkID: 22,
    name: "bilibili官网",
    url: "https://www.bilibili.com",
    imageUrl: "/links/bilibili.png", // 修正路径
    is_recommended: false
  },
  {
    linkID: 23,
    name: "抖音",
    url: "https://www.douyin.com/?recommend=1",
    imageUrl: "/links/douyin.png", // 修正路径
    is_recommended: false
  },
  {
    linkID: 24,
    name: "知乎",
    url: "https://www.zhihu.com/",
    imageUrl: "/links/zhihu.png", // 修正路径
    is_recommended: false
  },
  {
    linkID: 25,
    name: "巴哈姆特",
    url: "https://www.gamer.com.tw/",
    imageUrl: "/links/bahamute.png", // 修正路径
    is_recommended: false
  },
  {
    linkID: 26,
    name: "KunGal",
    url: "https://www.kungal.com/galgame",
    imageUrl: "/links/kungal.png", // 修正路径
    is_recommended: false
  },
  {
    linkID: 27,
    name: "新浪微博",
    url: "https://weibo.com/newlogin?tabtype=weibo&gid=102803&openLoginLayer=0&url=https%3A%2F%2Fweibo.com%2F",
    imageUrl: "/links/xinlang.png", // 修正路径
    is_recommended: false
  },
  {
    linkID: 28,
    name: "百度贴吧",
    url: "https://tieba.baidu.com/",
    imageUrl: "/links/tieba.png", // 修正路径
    is_recommended: false
  },
  {
    linkID: 29,
    name: "小红书",
    url: "https://www.xiaohongshu.com/explore",
    imageUrl: "/links/xiaohongshu.png", // 修正路径
    is_recommended: false
  },
  {
    linkID: 30,
    name: "萌娘百科",
    url: "https://zh.moegirl.org.cn/Mainpage",
    imageUrl: "/links/mengniang.png", // 修正路径
    is_recommended: false
  },
])
const isLoading = ref(false)

// 模拟获取数据
async function fetchLinks() {
  isLoading.value = true
  try {
    // 模拟接口延迟
    // 在实际项目中，这里会是调用API获取数据
    await new Promise(resolve => setTimeout(resolve, 800))
  } catch (err: any) {
    console.error('获取友情链接失败:', err)
    ElMessage.error('获取友情链接失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// URL格式化（过长时显示省略）
function formatUrl(url: string): string {
  if (url.length <= 20) return url
  return url.substring(0, 20) + '...'
}

// 跳转到目标网址
function goToLink(url: string) {
  window.open(url, '_blank') // 新窗口打开目标网址
}

// 页面挂载时加载
onMounted(fetchLinks)
</script>

<style scoped>
/* 样式部分保持不变 */
.link-page {
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

.link-container {
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

.link-card {
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  overflow: hidden;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.link-image-container {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: #f5f5f5;
}

.link-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.link-card:hover .link-image {
  transform: scale(1.05);
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
}

.image-icon {
  font-size: 24px;
}

.link-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.link-url {
  font-size: 14px;
  color: #409eff;
  word-break: break-all;
  line-height: 1.4;
}

.url-text {
  transition: color 0.2s;
}

.url-text:hover {
  color: #66b1ff;
  text-decoration: underline;
}

@media (max-width: 992px) {
  .link-card {
    min-height: auto;
  }

  .page-title {
    font-size: 18px;
  }

  .link-image-container {
    height: 100px;
  }
}

@media (max-width: 768px) {
  .el-col {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }

  .link-image-container {
    height: 140px;
  }
}
</style>