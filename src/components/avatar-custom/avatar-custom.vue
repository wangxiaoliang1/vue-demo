<template>
  <div class="avatar-custom">
    <Avatar v-if="imgBase64.includes('data:image/')" :size="avatarSize" :src="imgBase64"
            @click.native="visible = !visible"/>
    <Avatar v-else-if="imgBase64.includes('iconfont')" :size="avatarSize" :custom-icon="imgBase64"/>
    <Avatar v-else :icon="imgBase64"/>
    <Modal v-model="visible" :closable="false"><img class="img-style" :src="imgBase64"></Modal>
    <Spin fix v-if="avatarSpin"></Spin>
  </div>
</template>

<script>
  import {getheadiconReq} from '@/api/organize-manager/user-manager'

  export default {
    name: "avatar-custom",
    props: {
      // 图片地址
      imgUrl: {
        type: String,
        default: 'ios-body'
      },
      // 图片名称
      imgName: {
        type: String,
        default: 'ios-body'
      },
      // 头像大小设置
      avatarSize: {
        type: String,
        default: 'small'
      }
    },
    data() {
      return {
        imgBase64: '',
        visible: false,
        avatarSpin: false
      }
    },
    watch: {
      imgUrl() {
        if (this.imgUrl.includes('.png') || this.imgUrl.includes('.jpg')) this.getImbBase64()
        else this.imgBase64 = this.imgUrl
      }
    },
    mounted() {
      if (this.imgUrl.includes('.png') || this.imgUrl.includes('.jpg')) this.getImbBase64()
      else this.imgBase64 = this.imgUrl
    },
    methods: {
      getImbBase64() {
        this.avatarSpin = true
        getheadiconReq({fileName: this.imgUrl}).then(async res => {
          this.imgBase64 = `data:image/png;base64,${btoa(new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), ''))}`
          this.avatarSpin = false
        }).catch(() => {
          this.avatarSpin = false
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .avatar-custom {
    display: inline-block;
    cursor: pointer;
    position: relative;
  }
</style>
