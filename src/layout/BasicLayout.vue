<template>
  <div class="common-layout">
    <el-container>
<!--      aside-->
      <el-aside width="13%">
        <layout-aside/>
      </el-aside>

      <el-container>
<!--        header-->
        <el-header>
          <LayoutHeader/>
        </el-header>
<!--       main container -->
        <el-main class="main">
          <div class="content-layer">
            <router-view/>
          </div>
        </el-main>

      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import LayoutAside from "./container/LayoutAside.vue";
import LayoutHeader from "./container/LayoutHeader.vue";
</script>

<style>
.common-layout {
  background-image: url('../assets/background/swpu.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-container {
  background-color: transparent !important;
}

.el-aside,
.el-header,
.el-main,
.el-footer {
  background-color: transparent !important;
  color: #333;
}

.main {
  width: 100%;
  position: relative;
  padding: 0;
  min-height: calc(100vh - 120px);
  flex-grow: 1;
}

.content-layer {
  position: relative;
  z-index: 2;
  min-height: 100%;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>