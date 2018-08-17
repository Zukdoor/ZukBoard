<template>
  <div class="action-insert-text" @click.stop>
    <div class="insert-item" @click="addText">
      插入文字
    </div> 
  </div>
</template>

<script>
import Draw from '../../draw.js'
export default {
  props: ['config'],
  data() {
    return {
      isHover: false,
      src: '',
      imgTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      file: null
    }
  },
  methods: {
    addText() {
      Draw.getInstance().addText('请插入文字')
      this.config.showAction = false
    }
  }
}
</script> 

<style lang="scss">
  .action-insert-text {
    cursor: initial;
    width: 120px;
    left: -35px;
    padding: 0 !important;
    box-sizing: border-box;
    & .insert-item{
      padding: 10px;
      cursor: pointer;
    }
    & .insert-item:hover{
      background-color: #eee;
    }
  }
</style>
