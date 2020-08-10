/**
* @fileOverview 打击者
* @author wind-lc
* @version 1.0
*/
const Game = {
  /**
   * 游戏主类
   * @param {Object} dom 画布容器dom对象
   */
  Striker: class Striker {
    constructor (dom) {
      // 画布容器
      this.dom = dom
      // 画布
      this.cas = null
      // 画布2d上下文
      this.ctx = null
      // 画布宽
      this.width = 0
      // 画布高
      this.height = 0
      // 屏幕物理分辨率与像素分辨率比例
      this.ratio = 0
      // 图片
      this.img = {}
      // 刷新率
      this.fps = {
        // fps显示dom
        dom: null,
        // 值
        value: 0,
        // 是否显示fps
        visible: false,
        // 帧结束时间
        lastTime: null,
        //  帧更新结束时间
        lastFpsUpdateTime: 0
      }
      // 元素
      this.element = []
      // 关卡
      this.level = 1
      // 初始化
      this.init()
    }

    // 创建画布
    createCanvas () {
      this.dom.style.cssText = 'position: relative;'
      this.cas = document.createElement('canvas')
      this.cas.style.cssText = `
        width: 100%;
        height: 100%;
      `
      this.dom.appendChild(this.cas)
      this.ctx = this.cas.getContext('2d')
    }

    // 修复绘制模糊
    highDPI () {
      const devicePixelRatio = window.devicePixelRatio || 1
      const backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
        this.ctx.mozBackingStorePixelRatio ||
        this.ctx.msBackingStorePixelRatio ||
        this.ctx.oBackingStorePixelRatio ||
        this.ctx.backingStorePixelRatio || 1
      this.ratio = devicePixelRatio / backingStoreRatio
      this.width = this.cas.offsetWidth
      this.cas.width = this.cas.offsetWidth * this.ratio
      this.height = this.cas.offsetHeight
      this.cas.height = this.cas.offsetHeight * this.ratio
      this.ctx.scale(this.ratio, this.ratio)
      this.ctx.translate(0.5, 0.5)
    }

    // 加载图片
    loadImg () {
      return new Promise(resolve => {
        const getImg = url => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = url
            img.onload = () => {
              resolve(img)
            }
            img.error = error => {
              reject(error)
            }
          })
        }
        (async () => {
          for (const el in Game.img) {
            const item = await getImg(Game.img[el])
            this.img[el] = item
            if (Object.keys(this.img).length === Object.keys(Game.img).length) {
              resolve()
            }
          }
        })()
      })
    }

    // 创建fps
    createFps () {
      const fpsWrapper = document.createElement('p')
      fpsWrapper.innerText = 'FPS:'
      fpsWrapper.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 50px;
      `
      this.fps.dom = document.createElement('span')
      fpsWrapper.appendChild(this.fps.dom)
      this.dom.appendChild(fpsWrapper)
    }

    // 获取fps
    getFps () {
      const now = new Date()
      const fps = 1000 / (now - this.fps.lastTime)
      this.fps.lastTime = now
      return parseInt(fps)
    }

    // 显示fps
    showFps (now) {
      const fps = this.getFps()
      if (now - this.fps.lastFpsUpdateTime > 1000) {
        this.fps.lastFpsUpdateTime = now
        this.fps.value = fps
        this.fps.dom.innerText = this.fps.value
      }
    }

    // 运行
    run () {
      this.draw()
      window.requestAnimationFrame(() => {
        this.run()
      })
    }

    // 绘制
    draw () {
      const now = new Date()
      // 显示fps
      this.showFps(now)
      // 背景移动
      this.element.find(el => el.name === 'bg').el.move(now)
      // 清除画布
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.ctx.save()
      // 绘制所有元素
      this.element.forEach(el => {
        this.ctx.drawImage(el.el.cas, 0, 0, this.width, this.height)
      })
      this.ctx.restore()
    }

    // 初始化
    async init () {
      this.createCanvas()
      this.highDPI()
      await this.loadImg()
      this.createFps()
      // 实例化背景
      const bg = await new Game.Background(this.img.bg5, this.width, this.height, 1, this.level)
      // 背景添加进元素
      this.element.push({ name: 'bg', el: bg })
      // 实例化玩家
      const palyer = new Game.Aircraft(this.img.plane2, this.width, this.height, 1, this.level)
      this.element.push({ name: 'palyer', el: palyer })
      this.run()
    }
  },
  // 图片路径

  img: {
    bg5: require('@/assets/img/bg5.jpg'),
    plane2: require('@/assets/img/plane2.png')
  },
  /**
     * 背景类
     * @param {Object} img 图片
     * @param {Number} width 背景宽度
     * @param {Number} height 背景高度
     * @param {Number} speed 背景移动速度
     * @param {Number} level 关卡背景
     */
  Background: class Background {
    constructor (img, width, height, speed, level) {
      // 画布
      this.cas = document.createElement('canvas')
      // document.body.appendChild(this.cas)
      // 画布2d上下文
      this.ctx = this.cas.getContext('2d')
      // 帧更新结束时间
      this.updateTime = new Date()
      this.level = level - 1
      this.img = img
      this.width = this.cas.width = width
      this.height = this.cas.height = height
      this.speed = speed
      this.y = 0
      return this.create()
    }

    // 创建背景图片
    create () {
      this.ctx.drawImage(this.img, 0, 0, this.width, this.width / this.img.width * this.img.height)
    }

    // 移动
    move (now) {
      if (now - this.updateTime > 20) {
        this.y += 2
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.updateTime = now
        this.ctx.save()
        this.ctx.drawImage(this.img, 0, this.y - this.height + 2, this.width, this.width / this.img.width * this.img.height)
        this.ctx.drawImage(this.img, 0, this.y, this.width, this.width / this.img.width * this.img.height)
        if (this.y >= this.height) {
          this.y = 0
        }
        this.ctx.restore()
      }
    }
  },
  /**
   * 飞机类
   * @param {Object} img 飞机图片
   * @param {Number} width 飞机宽度
   * @param {Number} height 飞机高度
   */
  Aircraft: class Aircraft {
    constructor (img, width, height) {
      this.cas = document.createElement('canvas')
      this.ctx = this.cas.getContext('2d')
      this.img = img
      this.width = this.cas.width = width
      this.height = this.cas.height = height
      this.x = 0
      this.y = 0
      this.create()
    }

    // 创建
    create () {
      this.ctx.drawImage(this.img, 0, 0, this.width, this.width / this.img.width * this.img.height)
    }
  }
}
// /**
//    * 飞机类
//    * @param {String} imgUrl 图片地址
//    * @param {Number} width 飞机宽度
//    * @param {Number} height 飞机高度
//    */
// class Aircraft {
//   constructor (imgUrl, width, height) {
//     this.cas = document.createElement('canvas')
//     this.ctx = this.cas.getContext('2d')
//     this.imgUrl = imgUrl
//     this.width = this.cas.width = width
//     this.height = this.cas.height = height
//     this.x = 0
//     this.y = 0
//   }

//   // 绘制飞机
//   draw () {
//     this.ctx.save()
//     this.ctx.drawImage(require(this.imgUrl), this.x, this.y, this.width, this.height)
//     this.ctx.restore()
//   }
// }
// /**
//    * 玩家飞机类
//    * @param {String} imgUrl 图片地址
//    * @param {Number} width 飞机宽度
//    * @param {Number} height 飞机高度
//    * @param {Number} health 生命值
//    */
// class Player extends Aircraft {
//   constructor (imgUrl, width, height, health) {
//     super(imgUrl, width, height)
//     this.health = health
//   }

//   move () {

//   }
// }
export default Game
