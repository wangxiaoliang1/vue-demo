import directive from "./directives"

const importDirective = Vue => {
  /**
   * 拖拽指令 v-focus="options"
   * options = true|false 是否聚焦
   */
  Vue.directive('focus', directive.focus)
}

export default importDirective