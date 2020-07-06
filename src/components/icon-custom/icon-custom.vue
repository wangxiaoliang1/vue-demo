<template>
  <Row>
    <i-col v-for="(item, i) in iconList" :key="i" span="4" class-name="icon-style" @dblclick.native="copyClick(item)">
      <Icon :custom="`iconfont ${item}`"/>
      <p>{{item}}</p>
    </i-col>
  </Row>
</template>

<script>
  import iconData from '@/assets/iconfont/iconfont.json'

  export default {
    name: "icon-custom",
    computed: {
      iconList() {
        return iconData ? iconData.glyphs.map(o => `icon-${o.font_class}`) : []
      }
    },
    methods: {
      /**
       * 点击给出图标的class-name
       * @param name
       */
      copyClick(name) {
        this.$emit('on-copy', `iconfont ${name}`)
      }
    }
  }
</script>

<style scoped lang="less">
  .icon-style {
    padding: 5px;
    text-align: center;
    cursor: pointer;

    &:hover {
      background-color: #c3c3c3;
      color: #fff;
    }

    p {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
</style>
