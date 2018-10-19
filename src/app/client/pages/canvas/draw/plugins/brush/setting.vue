<template>
    <ul>
        <li @click.stop>
            <label for="">颜色：</label>
            <div class="content">
                <div class="color-picker">
                    <div class="color-preview">
                        <div class="value" @click="togglePicker(!isShowPicker)" :style="'background-color:' + config.color"></div>

                    </div>
                    <transition name="fade">
                        <div class="color-picker-main" v-show="isShowPicker">
                            <color-picker v-model="colors" @input="updateValue"></color-picker>
                        </div>
                    </transition>

                </div>
            </div>
        </li>
        <li>
            <label for="">尺寸：</label>
            <div class="content">
                <el-select v-model="config.width" placeholder="请选择" @change="handleSelect">
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
import { Sketch } from 'vue-color'
import { eventEmitter } from '../util'
export default {
  name: 'brush',
  props: ['config'],
  components: {
    'color-picker': Sketch
  },
  mounted() {
    document.body.addEventListener('click', () => {
      this.isShowPicker = false
    })
  },
  data() {
    return {
      isShowPicker: false,
      options: [{
        value: '2',
        label: '2'
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
      value: '2',
      colors: ''
    }
  },
  methods: {
    togglePicker(flag) {
      this.isShowPicker = flag
    },
    updateValue(value) {
      this.config.color = value.hex
      eventEmitter.emitEvent('on-brush-update', [this.config.width, value.hex])
    },
    handleSelect(val) {
      eventEmitter.emitEvent('on-brush-update', [val, this.config.color])
    }
  }
}
</script>

<style lang="scss">
    .color-picker{
        position: relative;
        .color-preview {
            margin-top: 1px;
            align-items: center;
            &>.value {
                width: 100px;
                height: 20px;
                border-radius: 5px;
            }

        }
        .fade-enter-active {
            transition: all .3s ease;
        }
        .fade-leave-active {
            transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
        }
        .fade-enter, .fade-leave-to {
            opacity: 0;
        }

        &>.color-picker-main{
            position: absolute;
            z-index: 12;
            top: 40px;
        }
    }
</style>
