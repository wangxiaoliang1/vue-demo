<template>
  <div class="upload-custom">
    <Upload :show-upload-list="false"
            :format="uploadFormat"
            :max-size="maxSize"
            :on-success="handleSuccess"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            :multiple="multiple"
            type="select"
            :action="uploadUrl"
            :headers="uploadHeaders"
            style="display: inline-block;">
            <slot name="button"></slot>
            <slot name="camera" v-if="uploadIcon=='ios-camera'">
              <div style="text-align: center;border: 1px dashed #ccc;border-radius: 4px;"
           :style="{width: `${uploadHeight}px`, height: `${uploadHeight}px`, lineHeight: `${uploadHeight}px`}">
              <Icon :type="uploadIcon" size="20"></Icon>
            </div>
            </slot>
            <!-- <div style="text-align: center;border: 1px dashed #ccc;border-radius: 4px;"
           :style="{width: `${uploadHeight}px`, height: `${uploadHeight}px`, lineHeight: `${uploadHeight}px`}">
              <Icon :type="uploadIcon" size="20"></Icon>
            </div> -->
    </Upload>
  </div>
</template>

<script>
  import {localRead} from "@/libs/utils"

  export default {
    name: "upload-custom",
    props: {
      // 上传地址
      uploadUrl: {
        type: String,
        default: ''
      },
      // 是否支持多选
      multiple: {
        type: Boolean,
        default: false
      },
      // 上传文件最大限制
      maxSize: {
        type: Number,
        default: 2048
      },
      // 上传文件最大限制
      uploadHeight: {
        type: Number,
        default: 58
      },
      // 上传文件最大限制
      uploadFormat: {
        type: Array,
        default: () => ['jpg', 'jpeg', 'png']
      },
      uploadIcon:{
        type: String,
        default: 'ios-camera'
      }
    },
    data() {
      return {
        visible: false,
        imgName: '',
        imgUrl: ''
      }
    },
    computed: {
      // 上传图片请求头
      uploadHeaders() {
        return {
          Authorization: `Bearer ${localRead('token')}`
        }
      }
    },
    methods: {
      /**
       * 上传之前触发
       */
      handleBeforeUpload() {
        this.$emit('upload-before')
      },
      /**
       * 上传成功触发
       * @return imgObj name图片名称 url图片地址
       */
      handleSuccess(response, file, fileList) {
        this.$emit('upload-success', file, fileList)
      },
      /**
       * 上传失败触发
       */
      handleFormatError(file) {
        this.$Message.warning(`${file.name}。${this.$t('uploadFormError')}.${this.uploadFormat.join(',.')}`)
      },
      /**
       * 上传超出限制触发
       */
      handleMaxSize(file) {
        this.$Message.warning(`${file.name}。${this.$t('uploadMaxSize')}${this.maxSize / 1024}M`)
      }
    }
  }
</script>

<style scoped lang="less">
  .upload-custom {
    display: inline-block;
    margin-left: 10px;
  }
</style>