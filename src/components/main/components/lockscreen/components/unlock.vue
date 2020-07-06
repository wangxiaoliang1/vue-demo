<template>
  <transition name="show-unlock">
    <div class="unlock-body-con" v-if="showUnlock" @keydown.enter="handleUnlock">
      <div @click="handleClickAvator" class="unlock-avator-con" :style="{marginLeft: avatorLeft}">
        <img class="unlock-avator-img" :src="avatorPath">
        <div class="unlock-avator-cover">
          <span><Icon type="md-unlock" :size="30"/></span>
          <p>{{$t('unlock')}}</p>
        </div>
      </div>
      <div class="unlock-avator-under-back" :style="{marginLeft: avatorLeft}"></div>
      <div class="unlock-input-con">
        <div class="unlock-input-overflow-con">
          <div class="unlock-overflow-body" :style="{right: inputLeft}">
            <input ref="inputEle" v-model="password" class="unlock-input" type="password" :placeholder="$t('unlockTips')"/>
            <button ref="unlockBtn" @mousedown="unlockMousedown" @mouseup="unlockMouseup" @click="handleUnlock"
                    class="unlock-btn">
              <Icon type="ios-key"/>
            </button>
          </div>
        </div>
      </div>
      <div class="unlock-locking-tip-con">{{$t('locked')}}</div>
    </div>
  </transition>
</template>

<script>
  import '../styles/unlock.less'
  import {localRead, localSave} from '@/libs/utils'

  export default {
    name: 'Unlock',
    data() {
      return {
        avatorLeft: '0px',
        inputLeft: '400px',
        password: '',
        check: null
      }
    },
    props: {
      showUnlock: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      avatorPath() {
        return localStorage.avatorImgPath
      }
    },
    methods: {
      validator() {
        if (this.password === localRead('locking')) {
          // 你可以在这里写密码验证方式，如发起ajax请求将用户输入的密码this.password与数据库用户密码对比
          localSave('locked', 0)
          return true
        } else {
          return false
        }
      },
      handleClickAvator() {
        this.avatorLeft = '-180px'
        this.inputLeft = '0px'
        this.$refs.inputEle.focus()
      },
      handleUnlock() {
        if (this.validator()) {
          this.avatorLeft = '0px'
          this.inputLeft = '400px'
          this.password = ''
          this.$emit('on-unlock')
        } else {
          this.$Message.error('密码错误,请重新输入。')
        }
      },
      unlockMousedown() {
        this.$refs.unlockBtn.className = 'unlock-btn click-unlock-btn'
      },
      unlockMouseup() {
        this.$refs.unlockBtn.className = 'unlock-btn'
      }
    }
  }
</script>
