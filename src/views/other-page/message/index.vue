<template>
  <Card dis-hover>
    <Input search :enter-button="$t('send')" v-model="sendMsg" :placeholder="`${$t('pleaseEnter')}${$t('message')}`"
           @on-search="onSearch"/>
  </Card>
</template>
<script>
  // import { pushReq } from '@/api/message-manager/message'
  export default {
    name: 'message-page',
    data() {
      return {
        sendMsg: ''
      }
    },
    methods: {
      onSearch() {
        // const obj = {
        //   method: '',
        //   message: '',
        //   objectId: ''
        // }
        // pushReq(obj).then(res => {
        //   console.log(res);
        // })
      }
    }
  }
</script>
<style scoped lang="less">
  .ivu-card {
    height: ~'calc(100%)';
  }
</style>
