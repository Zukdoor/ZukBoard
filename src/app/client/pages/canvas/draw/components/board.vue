<template>
  <div class="board">
    <div class="actions">
      <div class="tools"></div>
      <div class="props"></div>
    </div>
    <div class="canvas" id="canvas">
      <!-- <canvas class="canvas-main" width="480" height="270"></canvas> -->
    </div>
  </div>
</template>

<script>
import Draw from '../draw.js'
export default {
  data() {
    return {
      board: {
        _id: '',
        name: '',
        roomId: ''
      },
      renderList: [],
      setting: {
        brush: {
          color: 'rgb(222, 18, 33)',
          width: 3
        }
      }
    }
  },
  created() {
    let id = this.getQueryString('id')
    if (id) {
      this.getBoard(id)
      return
    }
    this.createBoard()
  },
  mounted() {
    new Draw(this, '#canvas', 1000, 500).init()
  },
  methods: {
    createBoard() {
      this.$http.post('/api/board/create').then(res => {
        const { code, msg, data } = res.data
        if (code !== 0) {
          this.$message.error(msg)
        }
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
        delete data.canvas
        this.board = data
      })
    },
    getQueryString(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      let r = location.search.substr(1).match(reg)
      if (r != null) return unescape(decodeURI(r[2]))
      return null
    }
  }
}
</script>

<style lang='scss'>
.board {
  margin: 20px;
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
