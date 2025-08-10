<template>
  <div class="page">
    <el-row class="container">
      <el-col :span="24">
        <div class="logo-image">
          <img src="../../assets/icon/favicon.jpg" alt="NEXUS GAL ARCHIVE" class="logo" />
        </div>
        <br>
        <h5 class="title">乐程团队中心站</h5>

        <el-menu
            :default-active="activeMenuItem"
            class="el-menu-vertical-demo transparent-menu"
            @select="handleMenuSelect"
            @open="handleOpen"
            @close="handleClose"
        >
          <el-menu-item index="1">
            <el-icon><House /></el-icon>
            <span>主页</span>
          </el-menu-item>

          <el-menu-item index="2">
            <el-icon><List /></el-icon>
            <span>签到</span>
          </el-menu-item>

          <el-menu-item index="3">
            <el-icon><DataAnalysis /></el-icon>
            <span>排行</span>
          </el-menu-item>

          <el-menu-item index="4">
            <el-icon><DocumentAdd /></el-icon>
            <span>通告</span>
          </el-menu-item>

          <el-menu-item index="5">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>

          <el-menu-item
              index="6"
              :data-login-required="isAdminRequiredMenus.includes('6') && !isAdmin"
              :class="{'disabled-admin-menu': isAdminRequiredMenus.includes('6') && !isAdmin}"
          >
            <el-icon><Tools /></el-icon>
            <span>负责人页面</span>
          </el-menu-item>

          <el-menu-item index="7">
            <el-icon><Link /></el-icon>
            <span>友情链接</span>
          </el-menu-item>
        </el-menu>
        <br>
        <br>
        <div id="PI">
          <a
              href="https://github.com/NexusXian/lec-center-vue"
              target="_blank"
              class="github-link"
              title="前往 GitHub 主页"
          >
            <GithubOutlined />
          </a>
        </div>

        <div class="music-player">
          <audio
              ref="audioRef"
              :src="currentMusic.url"
              class="audio-element"
              @ended="handleMusicEnd"
              @play="isPlaying = true"
              @pause="isPlaying = false"
              @loadedmetadata="updateProgress"
          ></audio>

          <div class="music-info">
            <div class="music-name-wrapper">
              <span class="music-name" :title="currentMusic.name">{{ currentMusic.name }}</span>
            </div>
            <span class="music-artist">{{ currentMusic.artist }}</span>
          </div>

          <div class="progress-wrapper">
            <div class="progress-container" @click="handleProgressClick">
              <div class="progress-bar">
                <div class="progress-filled" :style="{ width: progressPercent + '%' }"></div>
              </div>
            </div>
          </div>
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>

          <div class="player-controls">
            <button class="nav-btn" @click="playPrev" title="上一首">
              <el-icon><CaretLeft /></el-icon>
            </button>
            <button class="play-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
              <el-icon>
                <component :is="isPlaying ? VideoPause : VideoPlay" />
              </el-icon>
            </button>
            <button class="nav-btn" @click="playNext" title="下一首">
              <el-icon><CaretRight /></el-icon>
            </button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, onMounted, onBeforeUnmount, watch} from 'vue'
import {useRouter} from 'vue-router'
import {
  House, User, List, Link, DataAnalysis, DocumentAdd, Tools,
  VideoPlay, VideoPause, CaretLeft, CaretRight  // 更新图标导入
} from '@element-plus/icons-vue'
import {GithubOutlined} from '@ant-design/icons-vue'
import {ElMessage} from 'element-plus'
import {useUserInfoStore} from "../../store/userInfoStore.ts"

// 导入音乐文件
import music1 from '../../assets/bgm/水月陵 - Summer Pockets.mp3'
import music2 from '../../assets/bgm/麻枝准 - Sea, You Next.mp3'
import music3 from '../../assets/bgm/VISUAL ARTS  Key - Bloom of Youth.mp3'
import music4 from '../../assets/bgm/VISUAL ARTS - glassware.mp3'
import music5 from '../../assets/bgm/VISUAL ARTS  Key - 散花.mp3'
import music6 from '../../assets/bgm/VISUAL ARTS  Key - 渚.mp3'
import music7 from '../../assets/bgm/VISUAL ARTS  Key - 願いが叶う場所II.mp3'
import music8 from '../../assets/bgm/麻枝准 - 夏影.mp3'
import music9 from '../../assets/bgm/麻枝准 - Song for friends (Instrumental).mp3'
// 完善音乐信息（添加艺术家字段）
const musicList = [
  {
    url: music1,
    name: 'Summer Pockets',
    artist: '水月陵'  // 新增艺术家信息
  },
  {
    url: music2,
    name: 'Sea, You Next',
    artist: '麻枝准'  // 新增艺术家信息
  },
  {
    url: music3,
    name: 'Bloom of Youth',
    artist: '清水準一'  // 新增艺术家信息
  },
  {
    url: music4,
    name: 'glassware',
    artist: 'VISUAL ARTS'  // 新增艺术家信息
  },
    {
    url: music5,
    name: '散花',
    artist: 'VISUAL ARTS'  // 新增艺术家信息
  }
  ,
  {
    url: music6,
    name: '渚',
    artist: 'VISUAL ARTS'  // 新增艺术家信息
  },
  {
    url: music7,
    name: '願いが叶う場所II',
    artist: 'VISUAL ARTS'  // 新增艺术家信息
  },
  {
    url: music8,
    name: '夏影',
    artist: '麻枝准'  // 新增艺术家信息
  },
  {
    url: music9,
    name: 'Song for friends (Instrumental)',
    artist: '麻枝准'  // 新增艺术家信息
  }

]

// 音乐播放相关状态
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progressPercent = ref(0)
const currentMusicIndex = ref(0)
let progressInterval: number | undefined;

// 当前播放的音乐
const currentMusic = computed(() => {
  return musicList[currentMusicIndex.value] || { url: '', name: '无音乐', artist: '' };
})

// 切换播放/暂停
const togglePlay = () => {
  if (!audioRef.value || !currentMusic.value.url) return;

  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(err => {
      console.warn('Playback failed:', err)
      if (err.name === 'NotAllowedError') {
        ElMessage({
          message: '自动播放被浏览器阻止，请手动点击播放按钮',
          type: 'info',
          duration: 3000
        });
      }
    })
  }
}

// 播放上一首
const playPrev = () => {
  if (musicList.length <= 1) return;
  currentMusicIndex.value = (currentMusicIndex.value - 1 + musicList.length) % musicList.length
}

// 播放下一首
const playNext = () => {
  if (musicList.length <= 1) return;
  currentMusicIndex.value = (currentMusicIndex.value + 1) % musicList.length
}

// 播放当前索引对应的音乐
const playCurrentMusic = () => {
  if (!audioRef.value) return;

  audioRef.value.src = currentMusic.value.url;
  audioRef.value.load();

  const playPromise = audioRef.value.play();
  if (playPromise !== undefined) {
    playPromise.catch(err => {
      console.warn('Playback failed on song change:', err);
      isPlaying.value = false;
    });
  }
}

// 随机播放初始化
const initRandomPlay = () => {
  if (musicList.length === 0) return;
  const randomIndex = Math.floor(Math.random() * musicList.length)
  currentMusicIndex.value = randomIndex
}

// 格式化时间
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds === 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 点击进度条跳转
const handleProgressClick = (e: MouseEvent) => {
  if (!audioRef.value || isNaN(duration.value) || duration.value === 0) return;

  const progressBar = e.currentTarget as HTMLElement
  const clickPosition = e.offsetX
  const barWidth = progressBar.clientWidth
  const seekTime = (clickPosition / barWidth) * duration.value

  audioRef.value.currentTime = seekTime
}

// 更新播放进度
const updateProgress = () => {
  if (!audioRef.value) return;

  currentTime.value = audioRef.value.currentTime
  duration.value = audioRef.value.duration || 0
  progressPercent.value = duration.value ? (currentTime.value / duration.value) * 100 : 0
}

// 音乐播放结束时自动切换下一首
const handleMusicEnd = () => {
  playNext()
}

// 组件初始化
onMounted(() => {
  initRandomPlay()

  if(audioRef.value) {
    audioRef.value.addEventListener('timeupdate', updateProgress);
  }

  progressInterval = setInterval(updateProgress, 1000)
})

onBeforeUnmount(() => {
  if(audioRef.value) {
    audioRef.value.removeEventListener('timeupdate', updateProgress);
  }
  clearInterval(progressInterval);
});


// 监听音乐索引变化, 并自动播放下一首
watch(currentMusicIndex, (newIndex, oldIndex) => {
  if (newIndex !== oldIndex && audioRef.value) {
    setTimeout(() => {
      playCurrentMusic();
    }, 50);
  }
})

// 原有菜单相关逻辑
const router = useRouter()
const userStore = useUserInfoStore()
const activeMenuItem = ref('1')
const loginRequiredMenus = ['2','3','4','5'];
const isAdminRequiredMenus = ['6']

const isLoggedIn = computed(() => userStore.isLogin || false)
const isAdmin = computed(() => userStore.isAdmin || false)

const menuRoutes: { [key: string]: string } = {
  '1': '/', '2': '/clock-in', '3': '/ranking', '4': '/notice/list',
  '5': '/profile/info', '6': '/admin-dashboard', '7': '/links'
}

const menuNames: { [key: string]: string } = {
  '1': '主页', '2': '签到', '3': '排行', '4': '通告',
  '5': '个人信息', '6': '负责人页面', '7': '友情链接'
}

const handleMenuSelect = async (index: string) => {
  if (isAdminRequiredMenus.includes(index) && !isAdmin.value) {
    ElMessage({
      message: '您没有管理员权限，无法访问此页面',
      type: 'error',
      duration: 3000
    });
    return
  }

  if (loginRequiredMenus.includes(index) && !isLoggedIn.value) {
    ElMessage({
      message: `访问"${menuNames[index]}"需要登录，请先登录！`,
      type: 'warning',
      duration: 3000,
      showClose: true,
      onClose: () => router.push('/user/login')
    });
    return
  }

  activeMenuItem.value = index
  const route = menuRoutes[index]
  if (route) router.push(route)
  ElMessage.success(`进入${menuNames[index]}`)
}

const handleOpen = (key: string, keyPath: string[]) => {
  console.log('open:', key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log('close:', key, keyPath)
}
</script>

<style scoped>
.page {
  height: 100vh;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 0;
  margin: 0;
  position: fixed;
}

.title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.container {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 0 20px 20px 0;
  padding: 30px;
  width: 300px;
  min-height: 100vh;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
}

.transparent-menu {
  background-color: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-right: none;
}

.transparent-menu .el-menu-item,
.transparent-menu .el-sub-menu__title {
  background-color: transparent !important;
  color: #333 !important;
  transition: all 0.3s ease;
}

.transparent-menu .el-menu-item:hover,
.transparent-menu .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
  transform: translateX(5px);
}

.transparent-menu .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.3) !important;
  color: #409eff !important;
  border-left: 3px solid #409eff;
}

.transparent-menu .el-menu--inline {
  background-color: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

:global(.el-menu--popup) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: none !important;
}

.transparent-menu .el-menu-item.disabled-admin-menu {
  position: relative;
  color: #F56C6C !important;
  pointer-events: none;
}

.transparent-menu .el-menu-item.disabled-admin-menu:after {
  content: "🚫";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.8;
  font-size: 14px;
}

.logo-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

#PI {
  text-align: center;
  margin-top: 20px;
  color: #333;
}

.github-link {
  font-size: 24px;
  color: #333;
  transition: color 0.3s ease;
  display: inline-block;
  padding: 4px;
}

.github-link:hover {
  color: #409eff;
  transform: scale(1.1);
}

/* 音乐播放器样式 */
.music-player {
  margin-top: 30px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audio-element {
  display: none;
}

/* 音乐信息美化样式 */
.music-info {
  text-align: center;
  padding: 5px 0;
}

.music-name-wrapper {
  overflow: hidden;
  position: relative;
  height: 22px;
}

.music-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  display: inline-block;
  animation: scrollName 15s linear infinite;
}

/* 鼠标悬停时暂停滚动动画 */
.music-name:hover {
  animation-play-state: paused;
}

.music-artist {
  font-size: 12px;
  color: #666;
  opacity: 0.8;
  display: block;
  margin-top: 3px;
  font-style: italic;
}

/* 音乐名称滚动动画 */
@keyframes scrollName {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(0);
  }
  90% {
    transform: translateX(calc(-100% + 260px));
  }
  100% {
    transform: translateX(calc(-100% + 260px));
  }
}

.progress-wrapper {
  padding: 5px 0;
}

.progress-container {
  width: 100%;
  cursor: pointer;
}

.progress-bar {
  height: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  transition: all 0.2s ease;
}

.progress-container:hover .progress-bar {
  height: 8px;
}

.progress-filled {
  height: 100%;
  background-color: #409eff;
  border-radius: 3px;
  position: relative;
  transition: width 0.1s linear;
}

.progress-filled::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(50%, -50%);
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.7);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-container:hover .progress-filled::after {
  opacity: 1;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #555;
  margin-top: -8px;
  padding: 0 2px;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.nav-btn, .play-btn {
  background: transparent;
  border: none;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* 控制按钮大小调整 */
.nav-btn {
  font-size: 22px;
  width: 35px;
  height: 35px;
}

.play-btn {
  font-size: 30px;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-btn:hover, .play-btn:hover {
  color: #409eff;
  background-color: rgba(255, 255, 255, 0.4);
}
</style>