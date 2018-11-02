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
    <div class="upload-loading" v-show="isUploading"><img src="../../../../../assets/50.gif"></div>
  </div>
</template>

<script>
import { eventEmitter, compress } from '../util'
export default {
  props: ['config'],
  data() {
    return {
      isHover: false,
      src: '',
      imgTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      file: null,
      isUploading: false
    }
  },
  mounted() {
    eventEmitter.addListener('imageRenderAfter', () => {
      this.isUploading = false
    })
    eventEmitter.addListener('copyAction', (file) => {
      this.src = window.URL.createObjectURL(file)
      this.file = file
    })
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
      if (file.size > this.config.setting.maxSize) {
        this.$message.info('图片不能超过' + this.config.setting.maxSize)
        return
      }
      this.src = window.URL.createObjectURL(file)
      this.file = file
    },
    drawFile() {
      var that = this
      if (!this.file) return
      this.isUploading = true
      this.$http.get('/api/image/sign').then(res => {
        const { code, msg, data } = res.data
        if (code !== 0) {
          this.$message.error(msg)
        }
        const key = data.startsWith + '/' + data.saveName
        let quality = this.config.setting.quality
        let maxWidth = this.config.setting.maxWidth
        if (this.file.size > this.config.setting.maxCompress) {
          let reader = new FileReader()
          reader.readAsDataURL(this.file)
          reader.onload = function () {
            let result = this.result
            compress(result, { quality: quality, fileName: that.file.name, maxWidth: maxWidth }, function (baseData) {
              that.uploadImg(data, { file: baseData, key: key })
            })
          }
        } else {
          that.uploadImg(data, { file: that.file, key: key })
        }
      })
    },
    uploadImg: function (data, files) {
      const formData = new FormData()
      formData.append('OSSAccessKeyId', data.OSSAccessKeyId)
      formData.append('policy', data.policy)
      formData.append('signature', data.signature)
      formData.append('success_action_status', 200)
      formData.append('key', files.key)
      formData.append('file', files.file)
      this.$http.post(data.host, formData).then(res => {
        const url = `${data.host}/${files.key}`
        this.file = null
        this.src = ''
        this.config.showAction = false
        eventEmitter.emitEvent('on-should-draw-img', [url])
        this.$emit('change-current', 'choose')
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
    .upload-loading{
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: black;
      opacity: 0.6;
      img{
        position: absolute;
        left: 70px;
        top: 100px;
      }
    }
  }
</style>
