<template>
  <div class="board">
    <div class="actions" @click.stop>
      <div class="tools">
        <ul>
          <li @click="refresh" title="清空画板"><i class="iconfont" :class="{'disabled': renderList.length === 0}">&#xe6a4;</i></li>
          <li @click="undo" title="撤销"><i class="iconfont" :class="{'disabled': renderList.length === 0}">&#xe822;</i></li>
          <li @click="redo" title="重做"><i class="iconfont" :class="{'disabled': redoList.length === 0}">&#xe7cf;</i></li>
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
            <i class="iconfont" v-html="plugin.icon"></i>
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
    <div class="canvas-container" id="canvas"  ref="canvas" :class="drawer.current">
      <canvas id="layer-draw"></canvas>
    </div>
    <ul class="content-menu" v-show="contextMenu.show" :style="'top:' + contextMenu.y + 'px;left:' + contextMenu.x  + 'px;'">
        <li @click="undo" title="撤销" :class="{'disabled': renderList.length === 0}"><i class="iconfont" >&#xe822;</i>撤销</li>
        <li @click="redo" title="重做" :class="{'disabled': redoList.length === 0}"><i class="iconfont">&#xe7cf;</i>重做</li>
        <li @click="refresh" title="清空画板" :class="{'disabled': renderList.length === 0}"><i class="iconfont" >&#xe6a4;</i>清空画板</li>
    </ul>
  </div>
</template>

<script>
import io from 'socket.io-client'
import uuid from 'node-uuid'
import Draw from '../draw.js'
import plugins from '../plugins/setting.js'
import { settings, actions } from '../plugins'
const socket = io('/')
export default {
  data() {
    Object.keys(plugins).forEach(key => {
      plugins[key].active = key === 'brush'
      plugins[key].hasAction = key === 'uploadImg'
      plugins[key].showAction = false
    })
    return {
      board: {
        _id: uuid.v4(),
        name: '',
        roomId: ''
      },
      contextMenu: {
        show: false,
        x: 0,
        y: 0
      },
      zindex: 0,
      wPercent: 1,
      hPercent: 1,
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
        brush: {
          color: 'rgb(222, 18, 33)',
          width: 3
        }
      },
      drawer: {}
    }
  },
  components: {
    ...settings,
    ...actions
  },
  created() {
    // this.beforeCloseTab()
    this.socket.on('sync', (type, item) => {
      console.log(111, type)
      if (type === 'undo') {
        this.undo(item.opId)
        return
      }
      if (type === 'redo') {
        this.redo(item.opId)
        return
      }
      const index = this.renderList.findIndex(e => e.id === item.id)
      if (index > -1 && item.key !== 'uploadImg') {
        this.renderList[index] = item
        return
      }
      this.renderList.push(item)
      if (item.key === 'uploadImg') {
        this.drawer.syncBoard(item)
      }
    })
    this.socket.on('drawpoint', (r) => {
      this.drawer.syncBoardWithPoint(r)
    })
    this.socket.on('clear', (r) => {
      this.drawer.clear()
      this.$message({
        type: 'info',
        message: '画布已被清空!'
      })
    })
    let id = this.getQueryString('id')
    if (id) {
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
  },
  methods: {
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
        const { code, msg, data } = res.data
        if (code !== 0) {
          this.$message.error(msg)
        }
        this.renderList = Object.assign([], data.canvas)
        this.$nextTick(() => {
          this.initBoard()
        })
        this.initBoard()
        delete data.canvas
        this.board = data
      })
    },
    initBoard() {
      this.renderList.forEach((item) => this.drawer.syncBoard(item))
    },
    initPercent() {
      const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      this.wPercent = width / 1200
      this.hPercent = height / 1200
    },
    getQueryString(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      let r = location.search.substr(1).match(reg)
      if (r != null) return unescape(decodeURI(r[2]))
      return null
    },
    sync(key, id, data, needPush) {
      let item = {
        uid: this.uid,
        id,
        key,
        data,
        opId: this.genKey(),
        setting: Object.assign({}, this.plugins[key].setting),
        time: new Date().getTime()
      }
      if (needPush) {
        this.renderList.push(item)
      }

      this.socket.emit('sync', 'draw', item, this.board._id)
    },
    syncPoint(key, id, type, point) {
      let item = {
        id,
        key,
        type,
        setting: Object.assign({}, this.plugins[key].setting),
        points: point,
        time: new Date().getTime()
      }
      this.socket.emit('drawpoint', item, this.board._id)
    },
    syncDataRealTime(key, id, data) {
      let item = {
        id,
        key,
        data: Object.assign({}, data),
        time: new Date().getTime()
      }
      this.socket.emit('drawpoint', item, this.board._id)
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
      console.log('redo', opid)
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

      !opid && this.socket.emit('sync', 'redo', item, this.board._id)
    },
    undo(opid) {
      if (typeof opid !== 'string') opid = undefined
      console.log('redo', opid)
      if (this.renderList.length === 0) return
      let index = -1
      if (opid) {
        index = this.renderList.findIndex(e => e.opId === opid)
      }
      const item = opid ? this.renderList.splice(index, 1)[0] : this.renderList.pop()
      if (!item) return
      this.redoList.push(item)
      this.$nextTick(() => {
        this.drawer.clear()
        this.initBoard()
      })
      !opid && this.socket.emit('sync', 'undo', item, this.board._id)
      // console.log(9999, item)
      // this.drawer.undo(item)
      // this.redoList.push(item)
    },
    choose(chooseKey) {
      this.drawer.setKey(chooseKey)
      Object.keys(this.plugins).forEach(key => {
        this.plugins[key].active = key === chooseKey
      })
      this.toggleAction(this.plugins[chooseKey], !this.plugins[chooseKey].showAction)
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
    }
  }
}
</script>

<style lang='scss'>
.board {
  // position: relative;
  // margin: 20px;
  height: 100%;

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
        list-style-type: none;
        padding: 15px;
        height: 54px;
        .iconfont {
          font-size: 18px;
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
    cursor: crosshair;
    // background-color: #fff;
  }
  canvas#layer-draw {
    background-color: #fff;
  }
}
</style>
