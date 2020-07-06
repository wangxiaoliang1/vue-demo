<template>
  <div class="bar-code-style">
    <img id="barCode"/>
  </div>
</template>

<script>
  import JsBarcode from 'jsbarcode'

  export default {
    name: "bar-code",
    props: {
      barCode: {
        type: String,
        default: ''
      },
      showText: {
        type: Boolean,
        default: false
      },
      options: {
        type: Object,
        default: () => {
        }
      }
    },
    watch: {
      barCode() {
        this.createBarCode()
      },
      showText() {
        this.createBarCode()
      },
      options() {
        this.createBarCode()
      }
    },
    mounted() {
      this.createBarCode()
    },
    methods: {
      createBarCode() {
        JsBarcode('#barCode', this.barCode, {
          displayValue: this.showText,
          ...this.options
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .bar-code-style {
    text-align: center;

    img {
      vertical-align: middle;
    }
  }
</style>