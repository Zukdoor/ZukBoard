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
    <div class="canvas-container" id="canvas" :class="drawer.current">
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
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
        _id: '',
        name: '',
        roomId: ''
      },
      zindex: 0,
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
    this.socket.on('drawline', (r) => {
      const index = this.renderList.findIndex(item => item.id === r.id)
      if (index > -1) {
        this.renderList[index] = r
        return
      }
      this.renderList.push(r)
      if (r.key === 'uploadImg') {
        this.drawer.syncBoard(r)
      }
    })
    this.socket.on('drawpoint', (r) => {
      this.drawer.syncBoardWithPoint(r)
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
      Object.keys(this.plugins).forEach(key => {
        plugins[key].showAction = false
      })
    })
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
        this.initBoard()
        delete data.canvas
        this.board = data
      })
    },
    initBoard() {
      this.$nextTick(() => {
        this.renderList.forEach((item) => this.drawer.syncBoard(item))
      })
    },

    getQueryString(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      let r = location.search.substr(1).match(reg)
      if (r != null) return unescape(decodeURI(r[2]))
      return null
    },
    sync(key, id, data) {
      let item = {
        id,
        key,
        data,
        setting: Object.assign({}, this.plugins[key].setting),
        time: new Date().getTime()
      }
      // this.renderList.push(item)
      this.socket.emit('drawline', item, this.board._id)
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
        this.$message({
          type: 'info',
          message: '画布已被清空!'
        })
      })
    },
    redo() {
      if (this.redoList.length === 0) return
      this.$message.info('暂未实现！')
      // this.redoList.pop()
      // this.initBoard()
      // this.renderList.push(this.redoList.pop())
    },
    undo() {
      if (this.renderList.length === 0) return
      this.$message.info('暂未实现！')
      // this.renderList.pop()
      // this.initBoard()
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
    }
  }
}
</script>

<style lang='scss'>
.board {
  // margin: 20px;
  canvas[data-layer-id=canvas-cover] {
    z-index: 1 !important;
    pointer-events: none;
    background:rgba(255,255,255,0);
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
  // width: 100%;
  // height: 500px;
  &.eraser {
    canvas {
      cursor: none;
    }
    
  }
  &.choose {
    canvas {
      cursor: initial;
    }
    
  }
  canvas {
    // width: 100%;
    // min-height: 800px;
    cursor: crosshair;
    background-color: #fff;
  }
}
</style>
