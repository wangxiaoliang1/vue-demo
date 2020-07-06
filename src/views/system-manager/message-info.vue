<template>
  <div class="page-style">
    <div class="message-wrapper">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="100" :label-colon="true">
        <FormItem :label="$t('title')" prop="title">
          <Input v-model="req.title" :placeholder="$t('pleaseEnter') + $t('title')"/>
        </FormItem>
        <FormItem :label="$t('content')" prop="content">
          <edit-custom v-model="req.content" :uploadUrl="$store.state.uploadUrl" :editZIndex="1" @change="contentChange"></edit-custom>
        </FormItem>
        <FormItem :label="$t('dialogType')" prop="dialogType">
          <RadioGroup v-model="req.dialogType" @on-change="dialogTypeChange">
            <Radio :label="0">{{$t('isNotButton')}}</Radio>
            <Radio :label="1">{{$t('isButton')}}</Radio>
            <Radio :label="2">{{$t('isWebUpdateForce')}}</Radio>
            <Radio :label="3">{{$t('isWebUpdateTips')}}</Radio>
          </RadioGroup>
          {{$t('dialogState')}}:
          <RadioGroup v-model="req.dialogState">
            <Radio :label="1">info</Radio>
            <Radio :label="2">success</Radio>
            <Radio :label="3">warning</Radio>
            <Radio :label="4">error</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('duration')" prop="duration">
          <InputNumber v-model="req.duration" :min="0" :max="3600"></InputNumber> {{$t('second')}}
        </FormItem>
        <FormItem :label="$t('storeTimeOut')" prop="storeTimeOut">
          <InputNumber v-model="req.storeTimeOut" :min="0" :max="8760"></InputNumber> {{$t('hour')}}
        </FormItem>
        <!-- 按钮 -->
        <FormItem>
          <Button type="primary" long @click="okClick">{{$t('ok')}}</Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script>
  import {pushReq} from '@/api/system-manager/message-info'
  import {errorType} from '@/libs/tools'
  import EditCustom from '@/components/edit-custom'

  export default {
    name: "message-info",
    components: {EditCustom},
    data() {
      return {
        req: {
          systemFlag: this.$store.state.systemFlag,
          queryName: '',
          objectId: 'public', // 接受消息的用户id public所有人，个人是具体的id
          title: '', // 通知标题
          content: '', // 通知内容
          messageType: 0, // 消息类型 1 所有人, 2 个人, 3 角色
          dialogType: 0, // 弹框类型 0 不带按钮 1 带按钮
          duration: 2, // 当弹框类型是不带按钮的时候,这个提示框消失的时间,单位秒 1-3600
          dialogState: 1, // 提示状态 info success warning error
          storeTimeOut: 1 // 此条消息的存储有效期 (单位小时) 1-8760
        },
        // 验证实体
        ruleValidate: {
          title: [{required: true, message: this.$t('pleaseEnter') + this.$t('title'), trigger: 'blur'}],
          content: [{required: true, message: this.$t('pleaseEnter') + this.$t('content'), trigger: 'blur'}],
          duration: [{required: true, type: 'number', message: this.$t('pleaseEnter') + this.$t('duration'), trigger: 'blur'}],
          storeTimeOut: [{required: true, type: 'number', message: this.$t('pleaseEnter') + this.$t('storeTimeOut'), trigger: 'blur'}]
        }
      }
    },
    methods: {
      // 编辑器内容改变触发
      contentChange(html) {
        this.req.content = html
      },
      // 消息类型改变触发
      dialogTypeChange(value) {
        if (value === 2 || value === 3) {
          this.req.title = this.$t('systemUpdateTitle')
          this.req.content = this.$t('systemUpdateContent')
        }
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              objectId: ['public'],
              messageType: 1,
              dialogType: this.req.dialogType,
              duration: this.req.duration,
              dialogState: this.req.dialogState,
              storeTimeOut: this.req.storeTimeOut,
              title: this.req.title.trim(),
              content: this.req.content.trim()
            }
            pushReq(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                this.resetCancel()
              } else this.$Message.error(`${this.$t('add')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
            })
          }
        })
      },
      // 清楚历史数据
      resetCancel() {
        this.drawerFlag = false
        this.req.objectId = 'public'
        this.req.content = ''
        this.req.title = ''
        this.req.dialogState = 1
        this.req.dialogType = 0
        this.req.duration = 2
        this.req.storeTimeOut = 1
      }
    }
  }
</script>

<style scoped lang="less">
  .message-wrapper {
    padding: 5px;
    background-color: #fff;
  }
</style>
