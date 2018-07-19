<template>
    <ul>
        <li>
            <label for="">尺寸：</label>
            <div class="content slider">
                <el-slider v-model="config.width"></el-slider>
            </div>
        </li>
        <li></li>
    </ul>
</template>

<script>
export default {
  name: 'eraser',
  props: ['config'],
  data() {
    return {
      value: '20'
    }
  }
}
</script>

<style lang='scss'>
.content.slider{
    width: 200px;
  }
</style>
