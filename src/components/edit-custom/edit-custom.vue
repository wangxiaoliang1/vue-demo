<template>
  <div class="editor-wrapper">
    <div ref="editorEl"></div>
  </div>
</template>

<script>
  import E from 'wangeditor'
  import {localRead} from "@/libs/utils"
  import {getheadiconReq} from '@/api/organize-manager/user-manager'
  export default {
    name: "edit-custom",
    model: {
      prop: 'value',
      event: 'change'
    },
    props: {
      // 编辑器文本域内容
      value: {
        type: String,
        default: ''
      },
      // 文件上传地址
      uploadUrl: {
        type: String,
        default: ''
      },
      // 是否清除文本域内容
      isClear: {
        type: Boolean,
        default: false
      },
      // 图片上传最大数量
      imgLength: {
        type: Number,
        default: 3
      },
      // 图片上传大小 默认2M
      imgSize: {
        type: Number,
        default: 2 * 1024
      },
      // 条形按钮数据
      menuData: {
        type: Array,
        default: () => []
      },
      // 文本域层级
      editZIndex: {
        type: Number,
        default: 10000
      }
    },
    data () {
      return {
        editor: null,
        info_: null
      }
    },
    watch: {
      isClear (newVal) {
        // 触发清除文本域内容
        if (newVal) {
          this.editor.txt.clear()
          this.info_ = null
        }
      },
      value (newVal) {
        // 当父组件调用得时候，如果给value赋值了，子组件将会显示父组件赋给的值
        if (newVal !== this.editor.txt.html()) {
          this.editor.txt.html(this.value)
        }
      }
    },
    mounted () {
      this.setEditor()
      this.editor.txt.html(this.value)
    },
    methods: {
      setEditor() {
        this.editor = new E(this.$refs.editorEl)
        this.editor.customConfig.uploadImgShowBase64 = false // base 64 存储图片
        this.editor.customConfig.showLinkImg = false // 隐藏网络图片选项
        this.editor.customConfig.uploadImgServer = this.uploadUrl // 配置服务器端地址 上传图片
        this.editor.customConfig.uploadImgHeaders = {Authorization: `Bearer ${localRead('token')}`}// 自定义 header
        this.editor.customConfig.uploadImgMaxSize = this.imgSize * 1024 // 将图片大小限制为 2M
        this.editor.customConfig.uploadImgMaxLength = this.imgLength // 限制一次最多上传 3 张图片
        this.editor.customConfig.uploadFileName = 'file' // 后端接受上传文件的参数名
        this.editor.customConfig.zIndex = this.editZIndex // 文本域的层级

        // 配置菜单
        this.editor.customConfig.menus = this.menuData.length > 0 ? this.menuData : [
          'head', // 标题
          'bold', // 粗体
          'fontSize', // 字号
          // 'fontName', // 字体
          'italic', // 斜体
          'underline', // 下划线
          'strikeThrough', // 删除线
          'foreColor', // 文字颜色
          'backColor', // 背景颜色
          // 'link', // 插入链接
          // 'list', // 列表
          'justify', // 对齐方式
          // 'quote', // 引用
          // 'emoticon', // 表情
          'image', // 插入图片
          'table', // 表格
          // 'video', // 插入视频
          // 'code', // 插入代码
          'undo', // 撤销
          'redo', // 重复
          'fullscreen' // 全屏
        ]

        // 请求结果
        this.editor.customConfig.uploadImgHooks = {
          // fail: (xhr, editor, result) => {
          //   // 插入图片失败回调
          //   console.log('fail', xhr, editor, result);
          // },
          // success: (xhr, editor, result) => {
          //   // 图片上传成功回调
          //   console.log('success', xhr, editor, result);
          // },
          // timeout: (xhr, editor) => {
          //   // 网络超时的回调
          //   console.log('timeout', xhr, editor);
          // },
          // error: (xhr, editor) => {
          //   // 图片上传错误的回调
          //   console.log('error', xhr, editor);
          // },
          customInsert: (insertImg, result) => {
            // 图片上传成功，插入图片的回调
            //result为上传图片成功的时候返回的数据
            //insertImg(url)为插入图片的函数
            //editor为插入图片的函数
            // console.log('customInsert', result, editor);
            getheadiconReq({fileName: result.message}).then(async res => {
              const url = `data:image/png;base64,${btoa(new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), ''))}`
              insertImg(url)
            })
          }
        }

        // 同步传入的文本域内容
        this.editor.customConfig.onchange = html => {
          this.info_ = html // 绑定当前逐渐地值
          this.$emit('change', this.info_) // 将内容同步到父组件中
        }

        // 创建富文本编辑器
        this.editor.create()
      }
    }
  }
</script>
