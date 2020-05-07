<template>
  <div class="button-right">
    <ButtonGroup>
      <Button v-for="(item, i) in btnData" :key="i" type="primary" :custom-icon="item.icon" @click="btnClick(item.name)">{{$t(item.name)}}</Button>
    </ButtonGroup>
  </div>

</template>
<script>
  export default {
    name: 'ButtonCustom',
    props: {
      /**
       * @description 要展示的按钮
       */
      btnData: {
        type: Array,
        default: () => []
      }
    },
    methods: {
      btnClick(name) {
        this.$emit(`on-${name}-click`)
      }
    }
  }
</script>
<style scope lang="less">
  .button-right {
    float: right;

    &::after {
      display: block;
      content: '';
      clear: both;
      height: 0;
    }
  }
</style>
