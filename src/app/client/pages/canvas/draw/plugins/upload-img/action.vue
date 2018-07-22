<template>
  <div class="action-upload-img" @click.stop>
    <div class="drag-area" 
    :class="{'hover': isHover}"
    @drop="dragFile"
    @dragover="dragOver"
    @dragenter="hover(true)"
    @dragleave="hover(false)"
    @click="showUploadDialog">
      <template v-if="!src">
        请拖拽或点击此处上传图片  
      </template>
      <img :src="src" alt="" srcset="" v-else>
      
    </div> 
    <el-button class="drag-btn" @click="drawFile">插入该图片</el-button>
    <input type="file" @change="upload" :accept="imgTypes.join(',')" name="" style="display:none" ref="fileInput" id="">
  </div>
</template>

<script>
import { eventEmitter } from '../util'
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
    showUploadDialog() {
      this.$refs.fileInput.click()
    },
    hover(flag) {
      this.isHover = flag
    },
    upload(ev) {
      const files = ev.target.files
      this.handleFile(files[0])
    },
    dragOver(ev) {
      ev.preventDefault()
    },
    dragFile(ev) {
      const files = ev.dataTransfer.files
      this.handleFile(files[0])
      ev.preventDefault()
      ev.stopPropagation()
    },
    handleFile(file) {
      if (!this.imgTypes.find(t => t === file.type)) {
        this.$message.info('只支持插入jpg/png的图片')
        return
      }
      this.src = window.URL.createObjectURL(file)
      this.file = file
    },
    drawFile() {
      if (!this.file) return
      // const reader = new FileReader()
      const formData = new FormData()
      // formData.append('id', '')
      formData.append('img', this.file)
      this.$http.post('/api/image/upload', formData).then(res => {
        const { code, msg, data } = res.data
        if (code !== 0) {
          this.$message.error(msg)
        }
        this.file = null
        this.src = ''
        eventEmitter.emitEvent('on-should-draw-img', [data.url])
      })
    }
  }
}
</script> 

<style lang="scss">
  .action-upload-img {
    cursor: initial;
    width: 200px;
    box-sizing: border-box;
    .drag-area{
      cursor: pointer;
      height: 180px;
      line-height: 180px;
      text-align: center;
      border: 1px dashed #ccc;
      background-color: #eee;
      color: #aaa;
      margin-bottom: 20px;
      &.hover{
        border-color: #67c23a;
      }
      &>img{
        max-width: 100%;
        height: 180px;
      }
    }
  }
</style>
