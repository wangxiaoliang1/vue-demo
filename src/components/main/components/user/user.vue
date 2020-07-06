<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick">
      <Badge :dot="!!messageUnreadCount">
          <avatar-custom :imgUrl="userAvatar"></avatar-custom>
        <span style="font-size:10pt;color: black;font-weight: 900;">【{{userName}}】</span>
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="message" v-if="false">
          消息中心
          <Badge style="margin-left: 10px" :count="messageUnreadCount"></Badge>
        </DropdownItem>
        <DropdownItem name="userInfo">{{$t('userCenter')}}</DropdownItem>
        <DropdownItem name="logOut">{{$t('logOut')}}</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
import AvatarCustom from '@/components/avatar-custom'
export default {
  name: 'User',
  components: { AvatarCustom },
  props: {
    userAvatar: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: '未登录'
    },
    messageUnreadCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    logOut () {
      this.handleLogOut().then(() => {
        // this.$router.push({
        //   name: 'login'
        // })
        this.$router.go(0)
      })
    },
    message () {
      this.$router.push({
        name: 'message-page'
      })
    },
    userInfo () {
      this.$router.push({
        name: 'user-info'
      })
    },
    handleClick (name) {
      switch (name) {
        case 'logOut': this.logOut()
          break
        case 'message': this.message()
          break
        case 'userInfo': this.userInfo()
          break
      }
    }
  }
}
</script>
