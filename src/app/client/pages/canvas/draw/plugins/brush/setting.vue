<template>
    <ul>
        <li>
            <label for="">颜色：</label>
            <div class="content">
            <input type="color" id="head" name="color"
            v-model="config.color"/>
            </div>
        </li>
        <li>
            <label for="">尺寸：</label>
            <div class="content">
            <el-select v-model="config.width" placeholder="请选择">
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
</template>

<script>
export default {
  name: 'brush',
  props: ['config'],
  data() {
    return {
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
  }
}
</script>

<style>

</style>
