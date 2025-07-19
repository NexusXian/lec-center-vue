<template>
  <div class="home-container">
    <el-card class="home-card">
      <div class="logo-section">
        <div class="logo-image">
          <img src="../assets/icon/favicon.jpg" alt="乐程团队 Logo" style="width: 100px"/>
        </div>
        <h1 class="brand-title">乐程团队中心站</h1>
      </div>
      <div class="welcome-section">
        <h2 class="welcome-title">欢迎来到乐程团队</h2>
        <p class="welcome-subtitle">与我们一同探索，创造无限可能。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
/* 导入Inter字体，确保与登录页面字体一致 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.home-container {
  min-height: 100vh; /* 确保占据整个视口高度 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  padding: 20px;
  /* 如果需要，也可以在这里添加背景图片或渐变 */
}

.home-card {
  width: 500px; /* 调整卡片宽度 */
  max-width: 90%; /* 防止在小屏幕上溢出 */
  padding: 60px 40px; /* 调整内边距 */
  border-radius: 24px;
  backdrop-filter: blur(15px); /* 磨砂玻璃效果 */
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2)); /* 半透明渐变背景 */
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #333; /* 默认文字颜色 */
  text-align: center; /* 内部内容居中 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.home-card:hover {
  transform: translateY(-2px); /* 鼠标悬停时轻微上浮 */
  box-shadow: 0 16px 50px 0 rgba(31, 38, 135, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.logo-section {
  margin-bottom: 40px; /* Logo与下方内容间距 */
}

.logo-image {
  margin-bottom: 20px; /* Logo图片与标题间距 */
}

.logo-image img {
  width: 100px; /* Logo图片大小 */
  height: 100px;
  border-radius: 20px; /* 圆角 */
  box-shadow: 0 8px 25px rgba(110, 142, 251, 0.3); /* 阴影效果 */
  border: 2px solid rgba(255, 255, 255, 0.2); /* 边框 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.logo-image img:hover {
  transform: scale(1.05); /* 鼠标悬停时放大 */
  box-shadow: 0 12px 35px rgba(110, 142, 251, 0.5);
}

.brand-title {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50; /* 团队名称颜色 */
  margin-top: 15px;
}

.welcome-section {
  /* 欢迎语部分可以根据需要添加更多样式 */
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 15px;
  /* 应用登录页面的渐变文本效果 */
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 18px;
  color: #555; /* 副标题颜色 */
  font-weight: 400;
  line-height: 1.5;
}
</style>