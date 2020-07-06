<template>
  <div class="qr-code-style">
    <vue-qr :text="qrCode" :logoSrc="qrLogo" :size="qrSize"></vue-qr>
  </div>
</template>

<script>
  import vueQr from 'vue-qr'

  export default {
    name: "qr-code",
    components: {vueQr},
    props: {
      // 二维码文本
      qrCode: {
        type: String,
        default: ''
      },
      // 二维码中间的logo地址
      qrLogo: {
        type: String,
        default: ''
      },
      // 二维码大小
      qrSize: {
        type: Number,
        default: 200
      }
    }
  }
</script>

<style scoped lang="less">
  .qr-code-style {
    text-align: center;

    img {
      vertical-align: middle;
    }
  }
</style>