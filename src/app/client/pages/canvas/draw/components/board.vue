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
      renderList: [],
      setting: {
        brush: {
          color: 'rgb(222, 18, 33)',
          width: 3
        }
      }
    }
  },
  mounted() {
    new Draw(this, '#canvas', 1000, 500).init()
  },
  methods: {
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
