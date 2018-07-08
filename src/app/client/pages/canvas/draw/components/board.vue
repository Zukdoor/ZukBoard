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
import io from 'socket.io-client'
import Draw from '../draw.js'
const socket = io()
export default {
  data() {
    return {
      renderList: [],
      socket,
      current: {
        type: '',
        data: {}
      },
      setting: {
        brush: {
          color: 'rgb(222, 18, 33)',
          width: 3
        }
      },
      drawer: {}
    }
  },
  created() {
    this.socket.on('drawline', (r) => {
      // this.drawer.syncBoard(r)
    })
    this.socket.on('drawpoint', (r) => {
      console.log(123, r)
      this.drawer.syncBoardWithPoint(r)
    })
  },
  mounted() {
    this.drawer = new Draw(this, '#canvas', 1000, 500)
    this.drawer.init()
  },
  methods: {
    sync(key, id, data) {
      let item = {
        id,
        key,
        data: Object.assign([], data),
        time: new Date().getTime()
      }
      this.renderList.push(item)
      this.socket.emit('drawline', item)
    },
    syncPoint(key, id, type, point) {
      let item = {
        id,
        key,
        type,
        points: point,
        time: new Date().getTime()
      }
      this.socket.emit('drawpoint', item)
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
