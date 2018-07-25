import brushPlugin from './brush/plugin'
import brushSetting from './brush/setting.vue'

import choosePlugin from './choose/plugin'
import chooseSetting from './choose/setting.vue'

import eraserPlugin from './eraser/plugin'
import eraserSetting from './eraser/setting.vue'

import uploadImgPlugin from './upload-img/plugin'
import uploadImgSetting from './upload-img/setting.vue'
import uploadImgAction from './upload-img/action.vue'

export const plugins = {
  brush: brushPlugin,
  eraser: eraserPlugin,
  uploadImg: uploadImgPlugin,
  choose: choosePlugin
}
export const settings = {
  brush: brushSetting,
  eraser: eraserSetting,
  choose: chooseSetting,
  uploadImg: uploadImgSetting
}

export const actions = {
  uploadImgAction
}
