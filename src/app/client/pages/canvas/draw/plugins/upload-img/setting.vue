<template>
    <ul>
        <li>
           
        </li>
        <li></li>
    </ul>
</template>

<script>
import { eventEmitter } from '../util.js'
export default {
  name: 'eraser',
  props: ['config'],
  data() {
    return {
      value: '20'
    }
  },
  methods: {
    changeWidth(width) {
      eventEmitter.emitEvent('on-eraser-width-change', [width])
    }
  }
}
</script>

<style lang='scss'>
.content.slider{
    width: 200px;
  }
</style>
