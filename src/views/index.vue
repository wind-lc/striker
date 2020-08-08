<!--
/**
* @description 主页
* @author wind-lc
* @date 2020-08-04
*/
-->
<template>
  <div class="canvas-container">
    <p class="canvas-fps">FPS:{{lastFpsUpdate}}</p>
    <canvas ref="canvas"
            class="canvas"></canvas>
  </div>
</template>

<script>

export default {
  name: 'index',
  components: {
  },
  data () {
    return {
      // 画布
      cas: {},
      // 画布上下文
      ctx: {},
      lastCalledTime: null,
      fps: 0,
      lastTime: null,
      lastFpsUpdateTime: 0,
      lastFpsUpdate: 0,
      rect: {}
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 修复绘制模糊
    highDPI () {
      const devicePixelRatio = window.devicePixelRatio || 1
      const backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
        this.ctx.mozBackingStorePixelRatio ||
        this.ctx.msBackingStorePixelRatio ||
        this.ctx.oBackingStorePixelRatio ||
        this.ctx.backingStorePixelRatio || 1
      const ratio = devicePixelRatio / backingStoreRatio
      this.cas.width = this.cas.offsetWidth * ratio
      this.cas.height = this.cas.offsetHeight * ratio
      this.ctx.scale(ratio, ratio)
      this.ctx.translate(0, 0.5)
    },
    // 监听窗口变化
    resize () {
      window.addEventListener('resize', this.highDPI)
    },
    // 移除监听窗口变化事件
    removeResize () {
      window.removeEventListener('resize', this.highDPI)
    },
    // 初始化
    init () {
      this.cas = this.$refs.canvas
      this.ctx = this.cas.getContext('2d')
      this.highDPI()
      this.rect = document.createElement('canvas')
      this.rect.width = 20
      this.rect.height = 20
      const ctx = this.rect.getContext('2d')
      const img = new Image()
      img.src = require('@/assets/img/logo.png')
      ctx.drawImage(img, 0, 0, 20, 20)
      this.loop()
    },
    // 运行
    loop () {
      this.ctx.clearRect(0, 0, this.cas.width, this.cas.height)
      for (let i = 0; i < 1; i++) {
        const x = Math.floor(10 + Math.random() * (this.cas.width / 2 - 120))
        const y = Math.floor(10 + Math.random() * (this.cas.height / 2 - 120))
        this.drawRect(this.ctx, x, y)
      }
      const now = new Date()
      const fps = this.getFps()
      if (now - this.lastFpsUpdateTime > 1000) {
        this.lastFpsUpdateTime = now
        this.lastFpsUpdate = fps
      };
      window.requestAnimationFrame(this.loop)
    },
    // 获取fps
    getFps () {
      const now = new Date()
      const fps = 1000 / (now - this.lastTime)
      this.lastTime = now
      return parseInt(fps)
    },
    // 绘制矩形
    drawRect (ctx, x, y) {
      // ctx.beginPath()
      // ctx.lineWidth = 1
      // ctx.strokeStyle = '#0000ff'
      // ctx.rect(x, y, 100, 100)
      // ctx.closePath()
      // ctx.stroke()
      ctx.drawImage(this.rect, x, y)
    }

  },
  beforeDestroy () {
    this.removeResize()
  }
}
</script>
<style lang="scss">
.canvas-container {
  height: 100%;
  position: relative;
}
.canvas-fps {
  position: absolute;
  top: 10;
  right: 10px;
}
.canvas {
  width: 100%;
  height: 100%;
  // transform-origin: top left;
  // transform: scale(0.5);
  // transform: scale(0.5) translate(-50%, -50%);
}
</style>
