export default {
  update: (el, {value}) => {
    if (value) {
      let dom = el.querySelector('input') || el.querySelector('select')
      setTimeout(() => {
        dom.focus()
      }, 100)
    }
  }
}