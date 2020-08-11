/**
 * @fileOverview 打击者
 * @author wind-lc
 * @version 1.0
 */
const Game = {
  // 图片路径
  img: {
    bg5: require('@/assets/img/bg5.jpg'),
    plane2: require('@/assets/img/plane2.png'),
    lxj4: require('@/assets/img/lxj4.png')
  }
}

/**
 * 游戏主类
 * @param {Object} dom 画布容器dom对象
 */
class Striker {
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
    this.element = {}
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

  // 事件监听
  eventListening (striker) {
    /* 玩家飞机拖拽 */
    const p = this.element.palyer
    const offset = []
    const client = []
    this.cas.addEventListener('touchstart', e => {
      const cx = e.touches[0].clientX
      const cy = e.touches[0].clientY
      if (cx >= p.x && cx <= p.x + p.width && cy >= p.y && cy <= p.y + p.height) {
        p.drag = true
        offset[0] = cx - p.x
        offset[1] = cy - p.y
      }
    }, false)
    this.cas.addEventListener('touchmove', e => {
      e.preventDefault()
      if (p.drag) {
        client[0] = e.touches[0].clientX
        client[1] = e.touches[0].clientY
        let x = client[0] - offset[0]
        let y = client[1] - offset[1]
        if (x <= -p.width / 2) {
          x = -p.width / 2
        }
        if (x + p.width / 2 >= striker.width) {
          x = striker.width - p.width / 2
        }
        if (y <= -p.height / 2) {
          y = -p.height / 2
        }
        if (y + p.height / 2 >= striker.height) {
          y = striker.height - p.height / 2
        }
        p.move(x, y)
      }
    }, false)
    this.cas.addEventListener('touchend', e => {
      p.drag = false
    }, false)
    /* 玩家飞机拖拽 */
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
    this.element.bg.move(now)
    // 清除画布
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.save()
    // 绘制所有元素
    for (const item in this.element) {
      const el = this.element[item]
      this.ctx.drawImage(el.cas, el.x, el.y)
      if (el.list && el.list.length > 0) {
        el.list.forEach(element => {
          this.ctx.drawImage(element.cas, element.x, element.y)
        })
      }
    }
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
    this.element.bg = bg
    // 实例化玩家
    const palyer = new Game.Player(this.img, 66, 50, this.width, this.height)
    this.element.palyer = palyer
    console.log(palyer)
    this.eventListening(this)
    this.run()
  }
}

/**
 * 背景类
 * @param {Object} img 图片
 * @param {Number} width 背景宽度
 * @param {Number} height 背景高度
 * @param {Number} speed 背景移动速度
 * @param {Number} level 关卡背景
 */
class Background {
  constructor (img, width, height, speed, level) {
    // 画布
    this.cas = document.createElement('canvas')
    // 画布2d上下文
    this.ctx = this.cas.getContext('2d')
    // 帧更新结束时间
    this.updateTime = new Date()
    this.level = level - 1
    this.img = img
    this.width = this.cas.width = width
    this.height = this.cas.height = height
    this.speed = speed
    // 垂直偏移
    this.offset = 0
    // x坐标
    this.x = 0
    // y坐标
    this.y = 0
    return this.create()
  }

  // 创建背景图片
  create () {
    this.ctx.drawImage(this.img, 0, 0, this.width, this.width / this.img.width * this.img.height)
  }

  // 移动
  move (now) {
    this.offset += 1.5
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.updateTime = now
    this.ctx.save()
    this.ctx.drawImage(this.img, 0, this.offset - this.height + 2, this.width, this.width / this.img.width * this.img.height)
    this.ctx.drawImage(this.img, 0, this.offset, this.width, this.width / this.img.width * this.img.height)
    if (this.offset >= this.height - 2) {
      this.offset = 0
    }
    this.ctx.restore()
  }
}

/**
 * 飞机类
 * @param {Object} img 资源图片
 * @param {Number} width 飞机宽度
 * @param {Number} height 飞机高度
 * @param {Number} sWidth 游戏宽度
 * @param {Number} sHeight 游戏高度
 */
class Aircraft {
  constructor (img, width, height, sWidth, sHeight) {
    // 画布
    this.cas = document.createElement('canvas')
    // 画布2d上下文
    this.ctx = this.cas.getContext('2d')
    this.img = img
    // 画布宽度
    this.cas.width = width
    // 画布高度
    this.cas.height = height
    this.width = width
    this.height = height
    this.sWidth = sWidth
    this.sHeight = sHeight
    // 生命值
    this.health = 0
    // x坐标
    this.x = 0
    // y坐标
    this.y = 0
    // 影子偏移
    this.shadowOffset = [-10, 60]
  }
}
/**
 * 玩家飞机类
 * @param {Object} img 飞机图片
 * @param {Number} width 飞机宽度
 * @param {Number} height 飞机高度
 * @param {Number} sWidth 游戏宽度
 * @param {Number} sHeight 游戏高度
 */
class Player extends Aircraft {
  constructor (img, width, height, sWidth, sHeight) {
    super(img, width, height, sWidth, sHeight)
    // 其他图层
    this.list = []
    // 是否拖拽
    this.drag = false
    // 螺旋桨偏移
    this.windstickOffset = [this.width / 2, 0]
    this.init()
  }

  // 初始化
  init () {
    this.x = this.sWidth / 2 - this.width / 2
    this.y = this.sHeight - this.height * 2
    this.create()
  }

  // 创建
  create () {
    this.createShadow()
    this.createWindstick()
    this.ctx.save()
    // this.ctx.lineWidth = '1'
    // this.ctx.strokeStyle = 'red'
    // this.ctx.rect(0, 0, this.cas.width, this.cas.height)
    // this.ctx.stroke()
    // 主要图层
    this.ctx.drawImage(this.img.plane2, 264, 0, 66, 50, 0, 0, this.width, this.height)
    this.ctx.restore()
  }

  // 创建阴影
  createShadow () {
    const cas = document.createElement('canvas')
    const ctx = cas.getContext('2d')
    const width = cas.width = this.width / 2
    const height = cas.height = this.height / 2
    const x = this.x + this.shadowOffset[0]
    const y = this.y + this.shadowOffset[1]
    ctx.save()
    ctx.drawImage(this.img.plane2, 264, 51, 66, 50, 0, 0, width, height)
    ctx.restore()
    // 加入图层列表
    this.list[0] = { cas, ctx, width, height, x, y }
  }

  // 创建螺旋桨
  createWindstick () {
    const cas = document.createElement('canvas')
    const ctx = cas.getContext('2d')
    const width = 37
    this.windstickOffset[0] = this.windstickOffset[0] - 37 / 2
    const height = 6
    const x = this.x + this.windstickOffset[0]
    const y = this.y + this.windstickOffset[1]
    ctx.save()
    ctx.drawImage(this.img.lxj4, 6, 2, 37, 6, 0, 0, width, height)
    ctx.restore()
    // 加入图层列表
    this.list[1] = { cas, ctx, width, height, x, y }
    // 第二个螺旋桨[51,2]
    // 第三个螺旋桨[97,2]
  }

  // 移动
  move (x, y) {
    // 飞机坐标变化
    this.x = x
    this.y = y
    // 阴影坐标变化
    this.list[0].x = x + this.shadowOffset[0]
    this.list[0].y = y + this.shadowOffset[1]
    // 螺旋桨坐标变化
    this.list[1].x = x + this.windstickOffset[0]
    this.list[1].y = y + this.windstickOffset[1]
  }
}

Object.assign(Game, {
  Striker: Striker,
  Background: Background,
  Aircraft: Aircraft,
  Player: Player
})

export default Game
