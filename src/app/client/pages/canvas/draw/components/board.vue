<template>
  <div class="board">
    <div class="actions" @click.stop>
      <div class="tools">
        <ul>
          <li @click="refresh"><i class="icon disabled ion-md-refresh"></i></li>
          <li @click="undo"><i class="icon ion-md-undo" :class="{'disabled': renderList.length === 0}"></i></li>
          <li @click="redo"><i class="icon ion-md-redo" :class="{'disabled': redoList.length === 0}"></i></li>
        </ul>
        
      </div>
      <div class="tools">
        <ul>
          <li v-for="(plugin, key) in plugins"
             :key="plugin.name" 
             @click="choose(key)"
             :class="{'selected': plugin.active}"
             :title="plugin.title">
            <i class="icon" :class="plugin.icon"></i>
          </li>
          <!-- <li><i class="icon ion-md-brush"></i></li> -->
        </ul>
        
      </div>
      <div class="tools props">
        <ul v-show="plugins.brush.active">
          <li>
              <label for="">颜色：</label>
              <div class="content">
                <input type="color" id="head" name="color"
             v-model="plugins.brush.setting.color"/>
              </div>
          </li>
          <li>
              <label for="">尺寸：</label>
              <div class="content">
                <el-select v-model="plugins.brush.setting.width" placeholder="请选择">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
          </li>
          <li></li>
        </ul>
      </div>
    </div>
    <div class="canvas" id="canvas">
      <!-- <canvas class="canvas-main" width="480" height="270"></canvas> -->
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
import Draw from '../draw.js'
import plugins from '../setting.js'
const socket = io('/')
export default {
  data() {
    Object.keys(plugins).forEach(key => {
      plugins[key].active = key === 'brush'
    })
    return {
      board: {
        _id: '',
        name: '',
        roomId: ''
      },
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
      drawer: {},
      options: [{
        value: '3',
        label: '3'
      }, {
        value: '4',
        label: '4'
      }, {
        value: '6',
        label: '6'
      }, {
        value: '8',
        label: '8'
      }, {
        value: '10',
        label: '10'
      }],
      value: '2'
    }
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
      // this.drawer.syncBoard(r)
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
    this.drawer = new Draw(this, '#canvas', 1000, 500)
    this.drawer.init()
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
        this.drawer.clear()
        this.renderList.forEach((item) => this.drawer.syncBoard(item))
      })
    },
    getQueryString(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      let r = location.search.substr(1).match(reg)
      if (r != null) return unescape(decodeURI(r[2]))
      return null
    },
    sync(key, id, d) {
      let item = {
        id,
        key,
        data: d,
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
    refresh() {

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
      // if (chooseKey === 'eraser') {
      //   this.$message.info('暂未实现！')
      // }
      this.drawer.current = chooseKey
      Object.keys(this.plugins).forEach(key => {
        this.plugins[key].active = key === chooseKey
      })
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
  }
}
.actions {
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

        text-align: center;
        box-sizing: border-box;
        cursor: pointer;
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
.canvas{
  canvas {
    // width: 100%;
    // min-height: 800px;
    cursor: crosshair;
    background-color: #fff;
  }
}
</style>
