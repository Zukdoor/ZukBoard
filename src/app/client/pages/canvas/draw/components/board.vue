<template>
  <div class="board">
    <div class="actions" @click.stop>
      <div class="tools">
        <ul>
          <li @click="toggleFollowing" title="同步模式"><i class="iconfont" :class="{'following-mode': drawer.isFollowingMode}">&#xe6b3;</i></li>
          <li
            @click="() => { !notPresenter && refresh()}"
            title="清空画板"
          >
            <i class="iconfont" :class="{'disabled': renderList.length === 0 || notPresenter}">&#xe6a4;</i>
          </li>
          <li @click="(e) => { !notPresenter && undo(e)}" title="撤销">
            <i class="iconfont" :class="{'disabled': renderList.length === 0 || notPresenter}">&#xe822;</i>
          </li>
          <li @click="(e) => { !notPresenter && redo(e)}" title="重做">
            <i class="iconfont" :class="{'disabled': redoList.length === 0 || notPresenter}">&#xe7cf;</i>
          </li>
          <li @click="(e) => { !notPresenter && deleteSelected(e)}" title="删除">
            <i class="iconfont" :class="{'disabled': !canDelete || notPresenter}">&#xe603;</i>
          </li>
          <li class="tools-item zoom no-hover">
            <i class="iconfont" @click="changeZoom(true)">&#xe85b;</i>
            <el-input
              disabled="disabled"
              @change="onZoomChange"
              :value="zoomPercent"
              @keyup="changeZoom"
              @keyup.up.native="changeZoom(true)"
              @keyup.down.native="changeZoom()"
            >
            </el-input>
            <i class="iconfont" @click="changeZoom()">&#xe663;</i>
          </li>
        </ul>

      </div>
      <div class="tools">
        <ul>
          <li v-for="(plugin, key) in plugins"
             :key="plugin.name"
             @click="choose(key)"
             :class="{'selected': plugin.active}"
             class="plugin-tools-item"
             :title="plugin.title">
            <i class="iconfont" :class="{'disabled': !plugin.useInFollowing && notPresenter}" v-html="plugin.icon"></i>
            <template v-if="plugin.hasAction">
              <component
              v-show="plugin.showAction"
              :config="plugin"
              @change-current="choose"
              class="plugin-tools-item-action"
              @click.stop
              :is="key + '-action'" >
              </component>
            </template>

          </li>
          <!-- <li><i class="icon ion-md-brush"></i></li> -->
        </ul>

      </div>
      <div class="tools props">
        <template v-for="(item, key) in plugins" >
          <component
           v-show="item.active"
           :config="item.setting"
           :is="key"
           :key="key">
          </component>
        </template>
      </div>
    </div>
    <div class="masker" v-show="isLoading">
      <span>loading...</span>
    </div>
    <div class="canvas-container" id="canvas"  ref="canvas" :class="drawer.current">
      <canvas id="layer-draw"></canvas>
    </div>
    <ul class="content-menu" v-show="contextMenu.show" :style="'top:' + contextMenu.y + 'px;left:' + contextMenu.x  + 'px;'">
        <li
          @click="(e) => { !notPresenter && undo(e)}"
          title="撤销"
          :class="{'disabled': renderList.length === 0 || notPresenter}"
        >
          <i class="iconfont" >&#xe822;</i>撤销
        </li>
        <li
          @click="(e) => { !notPresenter && redo(e)}"
          title="重做"
          :class="{'disabled': redoList.length === 0 || notPresenter}"
        >
          <i class="iconfont">&#xe7cf;</i>重做
        </li>
        <li
          @click="(e) => { !notPresenter && refresh(e)}"
          title="清空画板"
          :class="{'disabled': renderList.length === 0 || notPresenter}">
            <i class="iconfont" >&#xe6a4;</i>清空画板
        </li>
        <li
          @click="(e) => { !notPresenter && undeleteSelecteddo(e)}"
          title="清空画板"
          :class="{'disabled': !canDelete || notPresenter}">
            <i class="iconfont" >&#xe603;</i>删除
        </li>
    </ul>
    <sync-status-notify :class="{'show': drawer.isFollowingMode}" ></sync-status-notify>
  </div>
</template>

<script>
import socket from '../plugins/socket.js'
import uuid from 'uuid'
import Draw from '../draw.js'
import {} from '../plugins/events.js'
import plugins from '../plugins/setting.js'
import { settings, actions } from '../plugins'
import SyncStatusNotify from './SyncStatusNotify'
export default {
  data() {
    Object.keys(plugins).forEach(key => {
      plugins[key].active = key === 'choose'
      plugins[key].hasAction = !!actions[key + 'Action']
      plugins[key].showAction = false
    })
    return {
      board: {
        _id: uuid.v4(),
        name: '',
        roomId: ''
      },
      canDelete: false,
      contextMenu: {
        show: false,
        x: 0,
        y: 0
      },
      zindex: 0,
      wPercent: 1,
      hPercent: 1,
      baseWidth: 1080,
      baseHeight: 720,
      uid: '', // temp uid
      renderList: [],
      redoList: [],
      canRedo: true,
      socket,
      current: {
        type: '',
        data: {}
      },
      plugins,
      setting: {
        kbText: {
          color: '#333'
        }
      },
      drawer: {},
      isLoading: true,
      pIndex: 6,
      steps: [10, 15, 20, 33, 50, 75, 100, 125, 150]
    }
  },
  watch: {
    'drawer.zoomPercent': function (val) {
      if (!val) val = 1
      this.drawer.setZoom(val)
    }
  },
  computed: {
    zoomPercent: {
      get: function (val) {
        return (this.drawer.zoomPercent * 100).toFixed(0) + '%'
      }
    },
    notPresenter: {
      get: function () {
        return this.drawer.isFollowingMode && !this.drawer.isPresenter
      }
    }
  },
  components: {
    SyncStatusNotify,
    ...settings,
    ...actions
  },
  created() {
    let id = this.$route.params.id
    this.registerSocket()
    if (id) {
      this.socket.emit('joinRoom', id)
      this.getBoard(id)
      return
    }
    this.createBoard()
  },
  mounted() {
    this.$nextTick(() => {
      this.drawer = new Draw(this, '#canvas', 1000, 500)
      this.drawer.init()
      window.drawer = this.drawer
    })
    document.body.addEventListener('click', () => {
      this.contextMenu.show = false
      Object.keys(this.plugins).forEach(key => {
        plugins[key].showAction = false
      })
      if (this.plugins['uploadImg'].active) {
        this.choose('choose')
      }
    })
    document.oncontextmenu = (ev) => {
      this.contextMenu.x = this.mouseX(ev)
      this.contextMenu.y = this.mouseY(ev)
      this.contextMenu.show = true
      return false // 屏蔽右键菜单
    }
    this.$refs.canvas.oncontextmenu = () => {
      return false
    }
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 8 || e.keyCode === 46) {
        this.deleteSelected()
      }
    })
    window.addEventListener('resize', () => {

    })
  },
  methods: {
    onZoomChange(value) {
      const percent = +value.substring(0, value.length - 1)
      this.drawer.zoomPercent = percent / 100
    },
    registerSocket() {
      this.socket.on('sync', (type, item) => {
        if (type === 'move_by_presenter') {
          this.focusPresenter(item.data)
          this.drawer.resizeCanvas()
          return
        }
        if (type === 'zoom') {
          this.drawer.presenterZoom = item.data.zoom
          this.drawer.resizeCanvas()
          this.focusPresenter()
          return
        }

        if (this.drawer.isFollowingMode) {
          this.drawer.resizeCanvas()
          this.focusPresenter()
        }

        if (type === 'undo') {
          this.undo(item.opId)
          return
        }
        if (type === 'redo') {
          this.redo(item.opId)
          return
        }

        if (type === 'zoom') {
          this.drawer.presenterZoom = item.data.zoom
          this.drawer.resizeCanvas()
          // this.drawer.setZoom(item.data.zoom * 1)
          return
        }
        if (type !== 'move') {
          this.renderList.push(item)
        }
        console.log(item)
        this.drawer.syncBoard(type, item)
      })
      this.socket.on('startFollow', (opt) => {
        this.initFollower(opt)
      })
      this.socket.on('endFollow', (opt) => {
        this.drawer.isPresenter = false
        this.drawer.isFollowingMode = false
        this.drawer.presenterZoom = 1
        this.drawer.setZoom(1)
      })

      this.socket.on('clear', (r) => {
        this.drawer.clear()
        this.renderList = []
        this.redoList = []
        this.$message({
          type: 'info',
          message: '画布已被清空!'
        })
      })
    },
    initFollower(opt) {
      this.drawer.isPresenter = false
      this.drawer.isFollowingMode = true
      this.drawer.presenterZoom = opt.zoom
      this.drawer.baseWidth = opt.width
      this.choose('choose')
      this.drawer.resizeCanvas()
      this.focusPresenter(opt.pan)
    },
    toggleFollowing() {
      if (this.drawer.isFollowingMode && !this.drawer.isPresenter) {
        return
      }
      if (this.drawer.isFollowingMode) {
        this.drawer.isPresenter = false
        this.drawer.isFollowingMode = false
        this.socket.emit('endFollow', null, this.board._id)
        return
      }
      const { container } = this.drawer
      this.drawer.isPresenter = true
      this.drawer.isFollowingMode = true
      this.socket.emit('startFollow', {
        width: container.offsetWidth,
        height: container.offsetHeight,
        zoom: this.drawer.zoomPercent,
        pan: {
          ...this.drawer.getVpPoint()
        }
      }, this.board._id)
    },
    changeZoom(isUp) {
      let filterArr = this.steps.filter((item) => {
        return isUp ? this.drawer.zoomPercent * 100 < item : this.drawer.zoomPercent * 100 > item
      })
      if (filterArr.length === 0) return
      this.pIndex = isUp ? this.steps.indexOf(filterArr[0]) - 1 : this.steps.indexOf(filterArr[filterArr.length - 1]) + 1
      if ((isUp && (this.pIndex === this.steps.length - 1)) || (!isUp && (this.pIndex === 0))) return

      if (isUp) {
        this.pIndex++
      } else {
        this.pIndex--
      }

      this.drawer.zoomPercent = this.steps[this.pIndex] / 100
      if (this.drawer.isPresenter) {
        this.socket.emit('sync', 'zoom', {
          data: {
            zoom: this.drawer.zoomPercent
          }
        }, this.board._id, this.board._id)
      }
    },
    focusPresenter(point) {
      if (!point) {
        point = this.drawer.presenterPan
      } else {
        this.drawer.presenterPan = point
      }

      this.drawer.moveToPoint(point.x, point.y)
    },
    createBoard() {
      this.$http.post('/api/board/create').then(res => {
        const { code, msg, data } = res.data
        if (code !== 0) {
          this.$message.error(msg)
        }
        this.renderList = Object.assign([], data.canvas)
        this.initBoard()
        delete data.canvas
        this.board = data
        this.socket.emit('joinRoom', data._id)
        window.history.replaceState({}, '', `/app/canvas/draw/${data._id}`)
      })
    },
    saveBoard() {
      this.$http.post('/api/board/save', {
        id: this.board._id,
        canvas: this.renderList
      }).then(res => {

      })
    },
    getBoard(id) {
      this.$http.get('/api/board/get', {
        params: {
          id: id
        }
      }).then(res => {
        const { code, data } = res.data
        if (code !== 0 || !data) {
          this.$alert('画板不存在', '提示', {
            confirmButtonText: '创建画板',
            showClose: false,
            callback: action => {
              this.createBoard()
            }
          })
        }
        this.renderList = Object.assign([], data.canvas)
        this.$nextTick(() => {
          this.initBoard()
          if (data.follow && data.follow.open) {
            this.initFollower(data.follow.config)
          }
        })
        delete data.canvas
        this.board = data
      })
    },
    initBoard() {
      this.drawer.initBoard(this.renderList)
    },
    getQueryString(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      let r = location.search.substr(1).match(reg)
      if (r != null) return unescape(decodeURI(r[2]))
      return null
    },
    sync(key, type, data, noPush) {
      let item = {
        uid: this.uid,
        key,
        data,
        type,
        // id: Array.isArray(data) ? data : data.id,
        opId: this.genKey(),
        time: new Date().getTime()
      }
      if (!noPush) {
        this.renderList.push(item)
      }
      this.socket.emit('sync', type, item, this.board._id, this.board._id)
    },
    toggleAction(item, flag) {
      item.showAction = flag
    },
    refresh() {
      this.$confirm('点击确定，画板将会永久清空', '确认清空画板？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.drawer.clear()
        this.renderList = []
        this.redoList = []
        this.socket.emit('clear', this.board._id)
        this.$message({
          type: 'info',
          message: '画布已被清空!'
        })
      })
    },
    redo(opid) {
      if (this.redoList.length === 0) return
      if (typeof opid !== 'string') opid = undefined
      let index = -1
      if (opid) {
        index = this.redoList.findIndex(e => e.opId === opid)
      }
      const item = opid ? this.redoList.splice(index, 1)[0] : this.redoList.pop()
      if (!item) return
      this.renderList.push(item)
      this.$nextTick(() => {
        this.drawer.clear()
        this.initBoard()
      })

      !opid && this.socket.emit('sync', 'redo', item, this.board._id, this.board._id)
    },
    undo(opid) {
      if (typeof opid !== 'string') opid = undefined
      if (this.renderList.length === 0) return
      let index = -1
      if (opid) {
        index = this.renderList.findIndex(e => e.opId === opid)
      }
      const item = opid ? this.renderList.splice(index, 1)[0] : this.renderList.pop()
      console.log(item)
      if (!item) return
      this.redoList.push(item)
      this.$nextTick(() => {
        this.drawer.clear()
        this.initBoard()
      })
      !opid && this.socket.emit('sync', 'undo', item, this.board._id, this.board._id)
    },
    deleteSelected() {
      this.drawer.deleteSelected()
    },
    choose(chooseKey, hiddenAction) {
      if (!this.plugins[chooseKey].useInFollowing && this.notPresenter) {
        return
      }
      this.drawer.setKey(chooseKey)
      Object.keys(this.plugins).forEach(key => {
        this.plugins[key].active = key === chooseKey
      })
      if (!hiddenAction) {
        this.toggleAction(this.plugins[chooseKey], !this.plugins[chooseKey].showAction)
      }
    },
    beforeCloseTab() {
      window.onbeforeunload = function (e) {
        let message = ''
        e = e || window.event

        if (e) {
          e.returnValue = message
        }

        return message
      }
    },
    mouseX(evt) {
      if (evt.pageX) {
        return evt.pageX
      } else if (evt.clientX) {
        return evt.clientX + (document.documentElement.scrollLeft
          ? document.documentElement.scrollLeft
          : document.body.scrollLeft)
      } else {
        return null
      }
    },
    genKey() {
      return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10)
    },
    mouseY(evt) {
      if (evt.pageY) {
        return evt.pageY
      } else if (evt.clientY) {
        return evt.clientY + (document.documentElement.scrollTop
          ? document.documentElement.scrollTop
          : document.body.scrollTop)
      } else {
        return null
      }
    },
    hideLoading() {
      this.isLoading = false
    }

  }
}
</script>

<style lang='scss'>
.board {
  // position: relative;
  // margin: 20px;
  height: 100%;
  -webkit-tap-highlight-color: rgba(0,0,0,0);

  ul.content-menu{
    width: 200px;
    background-color: #fff;
    position: absolute;
    padding: 0;
    box-sizing: border-box;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.15);
    // padding: 5px;
    li {
      i {
        margin-right: 10px;
      }
      padding: 15px;
      width: 100%;
      display: block;
      list-style-type: none;
      box-sizing: border-box;
      border-bottom: 1px solid #eee;
      &.disabled{
        color: #ccc;
      }
    }
    li:hover {
      background-color: rgba(1,1,1,.1);
    }
  }

}

.masker {
  position:absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  background-color: black;
  opacity: .6;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  span{
    text-align: center;
    left: 50%;
    top: 50%;
    position: absolute;
    color: #fff;
    font-size: 24px;
    margin-left: -50px;
  }
}

.actions {
  position: relative;
  width: 100%;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  display: flex;
  .tools {
    box-sizing: border-box;
    padding: 0 20px;
    border-right: 1px solid #ddd;
    ul {
      display: flex;
      margin: 0;
      padding: 0;
      li {
        &.zoom {
          display: flex;
          align-items: center;
          input.el-input__inner {
            width: 70px;
            height: 30px;
            line-height: 20px;
            margin: 0 5px;
            border-radius: 0;

          }
        }
        list-style-type: none;
        padding: 15px;
        height: 54px;
        .iconfont {
          font-size: 18px;
        }
        .following-mode{
          color: green;
        }
        text-align: center;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        .plugin-tools-item-action {
          position: absolute;
          top: 40px;
          padding: 10px;
          top: 58px;
          background-color: #fff;
          border-radius: 4px;
          box-shadow: 0 0 0 1px rgba(0,0,0,.15), 0 8px 16px rgba(0,0,0,.15);
          z-index: 12;
        }
        &:hover {
          background-color: #eee;
        }
        &.no-hover:hover{
          background-color: #fff;
        }
        &.selected {
          background-color: #eee;
        }
        i {
          font-size: 16px;
          &.disabled{
            color: #ccc;
          }
        }
      }
    }
    &.props {
      ul {
        li {
          display: flex;
          align-items: center;
           &:hover {
            background-color: #fff;
          }
          &.selected {
            background-color: #fff;
          }
          .el-input--suffix .el-input__inner {
                padding-right: 0 !important;
            }
          .el-input{
            width: 63px;
            .el-input__inner {
              border: 0;
            }
          }
        }
      }
    }
  }
}
.canvas-container{
  height: 100%;
  &.eraser {
    canvas {
      cursor: none !important;
    }

  }
  &.choose {
    canvas {
      cursor: initial;
    }

  }
  canvas {
     width: 500px;
    height: 600px;
    // width: 100%;
    // min-height: 800px;
    // cursor: crosshair;
    // background-color: #fff;
  }
  canvas#layer-draw {
    background-color: #fff;
  }
}
</style>
