<template>
  <div class="page-style">
    <Split v-model="split">
      <!--左侧导航栏-->
      <div slot="left" class="split-pane">
        <Card :padding="0" :bordered="false" dis-hover>
          <CellGroup @on-click="cellClick">
            <Cell :name="1" :selected="cellSelected === 1">{{ userInfo }}</Cell>
            <Cell :name="2" :selected="cellSelected === 2">{{ updatePwd }}</Cell>
          </CellGroup>
        </Card>
      </div>
      <!--右侧展示栏-->
      <div slot="right" class="split-pane">
        <Card v-show="isUserInfo === 1" :bordered="false" dis-hover>
          <p slot="title">{{ userInfo }}</p>
          <Form :label-width="80" :label-colon="true">
            <FormItem :label="$t('headIcon')">
              <avatar-custom :imgUrl="req.headIcon" :avatarSize="'default'"></avatar-custom>
              <upload-custom :uploadUrl="uploadUrl" :uploadHeight="33" :multiple="uploadMultiple"
                             @upload-success="uploadSuccess"></upload-custom>
            </FormItem>
            <FormItem :label="$t('account')">{{ req.account }}</FormItem>
            <FormItem :label="$t('userName')">{{ req.userName }}</FormItem>
            <FormItem :label="$t('roleName')" v-if="false">{{ req.roleName }}</FormItem>
            <FormItem :label="$t('organizeName')" v-if="false">{{ req.organizeName }}</FormItem>
            <FormItem :label="$t('phone')">{{ req.phone }}</FormItem>
            <FormItem :label="$t('email')">{{ req.email }}</FormItem>
          </Form>
        </Card>
        <Card :bordered="false" v-show="isUserInfo === 2" dis-hover>
          <p slot="title">{{ updatePwd }}</p>
          <Form ref="req" :model="req" :rules="ruleValidate" :label-width="100" :label-colon="true">
            <FormItem>{{ $t('userInfoTips') }}</FormItem>
            <FormItem :label="$t('oldPwd')" prop="oldPwd"><Input v-model="req.oldPwd"/></FormItem>
            <FormItem :label="$t('newPwd')" prop="newPwd"><Input v-model="req.newPwd"/></FormItem>
            <FormItem :label="$t('surePwd')" prop="surePwd"><Input v-model="req.surePwd"/></FormItem>
            <Button type="primary" long size="default" @click="updateClick">{{ updatePwd }}</Button>
          </Form>
        </Card>
      </div>
    </Split>
  </div>
</template>

<script>
  import {updatepasswordReq, modifyReq} from '@/api/organize-manager/user-manager'
  import {mapActions, mapMutations} from 'vuex'
  import {encryptDes, sha1_to_base64} from '@/libs/des'
  import {localSave, localReadObject} from '@/libs/utils'
  import {errorType} from '@/libs/tools'
  import UploadCustom from '@/components/upload-custom'
  import AvatarCustom from '@/components/avatar-custom'

  export default {
    name: 'user-info',
    components: {UploadCustom, AvatarCustom},
    data() {
      return {
        split: .15,
        isReadonly: true,
        isUserInfo: 1,
        cellSelected: 1,
        userInfo: this.$t('user-info'),
        updatePwd: this.$t('updatePwd'),
        uploadUrl: this.$store.state.uploadUrl, // 图片上传headers
        uploadHeaders: {}, // 图片上传headers
        uploadMultiple: false, // 是否上传多张图片
        uploadData: [], // 要展示的图片
        req: {
          id: this.$store.state.id,
          headIcon: this.$store.state.avatarImgPath,
          account: this.$store.state.account,
          userName: this.$store.state.userName,
          roleName: '',
          organizeName: '',
          phone: this.$store.state.phone,
          email: this.$store.state.email,
          oldPwd: '',
          newPwd: '',
          surePwd: ''
        },
        ruleValidate: {
          oldPwd: [{required: true, message: this.$t('pleaseEnter') + this.$t('oldPwd'), trigger: 'blur'}],
          newPwd: [{required: true, message: this.$t('pleaseEnter') + this.$t('newPwd'), trigger: 'blur'}],
          surePwd: [{required: true, message: this.$t('pleaseEnter') + this.$t('surePwd'), trigger: 'blur'}]
        }
      }
    },
    methods: {
      ...mapActions(['handleLogOut']),
      ...mapMutations(['updateAvatarImgPath', 'setUserInfo']),
      // 点击索引条选择触发
      cellClick(name) {
        this.cellSelected = this.isUserInfo = name
      },
      // 点击修改密码按钮触发
      updateClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            if (this.req.newPwd !== this.req.surePwd) {
              this.$Message.warning(this.$t('surePwdError'))
            } else {
              const obj = {
                id: this.req.id,
                oldPassword: sha1_to_base64(encryptDes(this.req.oldPwd.trim(), 'baize#66', 'lxeP@ssx')),
                newPassword: sha1_to_base64(encryptDes(this.req.newPwd.trim(), 'baize#66', 'lxeP@ssx'))
              }
              updatepasswordReq(obj).then(res => {
                if (res.code === 200) {
                  this.resetCalcel()
                  this.$Message.success(this.$t('success'))
                  this.handleLogOut()
                  this.$router.push({name: 'login'})
                } else this.$Message.error(errorType(this, Number(res.result)))
              })
            }
          }
        })
      },
      // 图片上传成功触发
      uploadSuccess(data) {
        this.req.headIcon = data.response.message
        this.updateHeadIcon(this.req.headIcon)
        this.updateAvatarImgPath(this.req.headIcon)
        const userInfoObj = localReadObject('userInfo')
        userInfoObj.headIcon = this.req.headIcon
        localSave('userInfo', userInfoObj)
      },
      // 修改用户头像
      updateHeadIcon(name) {
        let obj = {
          id: this.req.id,
          name: null,
          headIcon: name,
          phone: null,
          email: null,
          companyId: null,
          departmentId: null,
          systemFlags: null,
          roles: null,
          enabled: 1,
          remark: null
        }
        modifyReq(obj).then(res => {
          if (res.code === 200) {
            this.$Message.success(this.$t('update') + this.$t('success'))
          } else this.$Message.error(`${res.code} ${res.result}`)
        })
      },
      // 清空缓存信息
      resetCalcel() {
        this.req.oldPwd = ''
        this.req.newPwd = ''
        this.req.surePwd = ''
      }
    }
  }
</script>
