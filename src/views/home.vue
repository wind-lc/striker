<!--
/**
* @description home
* @author wind-lc
* @date 2020-08-07
*/
-->
<template>
  <div class="page-container"
       ref="canvas">
  </div>
</template>
<script>
import Game from '@/util/game.js'
export default {
  name: 'home',
  components: {},
  data () {
    return {
      // 游戏实例
      game: null
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 初始化
    init () {
      this.game = new Game.Striker(this.$refs.canvas)
    }
  }
}
</script>
<style lang="scss">
.page-container {
  height: 100%;
}
</style>
