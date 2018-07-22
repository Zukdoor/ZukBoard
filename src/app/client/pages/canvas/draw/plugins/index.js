import brushPlugin from './brush/plugin'
import brushSetting from './brush/setting.vue'

import eraserPlugin from './eraser/plugin'
import eraserSetting from './eraser/setting.vue'

import uploadImgPlugin from './upload-img/plugin'
import uploadImgSetting from './upload-img/setting.vue'
import uploadImgAction from './upload-img/action.vue'

export const plugins = {
  brush: brushPlugin,
  eraser: eraserPlugin,
  uploadImg: uploadImgPlugin
}
export const settings = {
  brush: brushSetting,
  eraser: eraserSetting,
  uploadImg: uploadImgSetting
}

export const actions = {
  uploadImgAction
}
