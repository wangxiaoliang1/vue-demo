<template>
  <div class="header-bar">
    <sider-trigger :collapsed="collapsed" icon="iconfont icon-menu" :size="24" @on-change="handleCollpasedChange"></sider-trigger>
    <custom-bread-crumb show-icon :list="breadCrumbList" :font-size="12"></custom-bread-crumb>
    <div class="custom-content-con">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import siderTrigger from './sider-trigger'
import customBreadCrumb from './custom-bread-crumb'
export default {
  name: 'HeaderBar',
  components: {
    siderTrigger,
    customBreadCrumb
  },
  props: {
    collapsed: Boolean
  },
  computed: {
    breadCrumbList () {
      return this.$store.state.breadCrumbList
    }
  },
  methods: {
    handleCollpasedChange (state) {
      this.$emit('on-coll-change', state)
    }
  }
}
</script>

<style scoped lang="less">
  @size: 40px;
  .header-bar{
    width: 100%;
    height: 100%;
    position: relative;
    .custom-content-con{
      float: right;
      height: auto;
      /*padding-right: 20px;*/
      line-height: @size;
      & > *{
        float: right;
      }
    }
  }
</style>
