export default {
  submitNum({state, getters}) {
    state.num = getters.count
  }
}