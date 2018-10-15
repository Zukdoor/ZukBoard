import kbTextSetting from './kb-text/setting.vue'
import kbTextAction from './kb-text/action.vue'

import choosePlugin from './choose/plugin'
import chooseSetting from './choose/setting.vue'

import uploadImgPlugin from './upload-img/plugin'
import uploadImgSetting from './upload-img/setting.vue'
import uploadImgAction from './upload-img/action.vue'

export const plugins = {
  uploadImg: uploadImgPlugin,
  choose: choosePlugin
}
export const settings = {
  choose: chooseSetting,
  uploadImg: uploadImgSetting,
  kbText: kbTextSetting
}

export const actions = {
  uploadImgAction,
  kbTextAction
}
