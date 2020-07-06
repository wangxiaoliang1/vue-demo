<template>
  <div class="drawer-button">
    <Button @click="cancelClick">{{$t('cancel')}}</Button>
    <Button v-show="isAdd" type="primary" @click="okClick">{{$t('ok')}}</Button>
    <Button v-show="!isAdd" type="primary" @click="updateClick">{{$t('update')}}</Button>
    <Button type="primary" @click="okOrUpdateClick">{{isAdd ? $t('okAndClose') :
      $t('updateAndClose')}}
    </Button>
  </div>
</template>

<script>
  export default {
    name: "drawer-button",
    props: {
      isAdd: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      // 取消按钮事件
      cancelClick() {
        this.$emit('on-cancel')
      },
      // 确定按钮事件
      okClick() {
        this.$emit('on-ok')
      },
      // 修改按钮事件
      updateClick() {
        this.$emit('on-update')
      },
      // 确定或修改按钮事件
      okOrUpdateClick() {
        this.$emit('on-okOrUpdate')
      }
    }
  }
</script>

<style scoped lang="less">
  .drawer-button {
    button {
      margin-right: 5px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
</style>