<template style="margin-right: 10px">
  <div @click="lockScreen" class="lock-screen-btn-con">
    <Tooltip content="锁屏" placement="bottom">
      <Icon custom="iconfont icon-lock" :size="size"></Icon>
    </Tooltip>
  </div>
</template>

<script>
  import {localSave} from '@/libs/utils'
  import './styles/unlock.less'

  const setLockBackSize = () => {
    let x = document.body.clientWidth
    let y = document.body.clientHeight
    let r = Math.sqrt(x * x + y * y)
    return parseInt(r)
  }
  export default {
    name: 'lockScreen',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      size: {
        type: Number,
        default: 22
      }
    },
    methods: {
      lockScreen() {
        let lockScreenBack = document.getElementById('lock_screen_back')
        lockScreenBack.style.transition = 'all 3s'
        lockScreenBack.style.zIndex = 10000
        lockScreenBack.style.boxShadow = '0 0 0 ' + this.lockScreenSize + 'px #667aa6 inset'
        // this.showUnlock = true
        setTimeout(() => {
          lockScreenBack.style.transition = 'all 0s'
          localSave('last_page_name', this.$route.name) // 本地存储锁屏之前打开的页面以便解锁后打开
          localSave('locked', 1)
          this.$router.push({name: 'locking'})
        }, 800)
      }
    },
    mounted() {
      let lockScreenBack
      if (!document.getElementById('lock_screen_back')) {
        let lockdiv = document.createElement('div')
        lockdiv.setAttribute('id', 'lock_screen_back')
        lockdiv.setAttribute('class', 'lock-screen-back')
        document.body.appendChild(lockdiv)
        lockScreenBack = document.getElementById('lock_screen_back')
        window.addEventListener('resize', () => {
          let size = setLockBackSize()
          this.lockScreenSize = size
          lockScreenBack.style.transition = 'all 0s'
          lockScreenBack.style.width = lockScreenBack.style.height = size + 'px'
        })
      } else {
        lockScreenBack = document.getElementById('lock_screen_back')
      }
      let size = setLockBackSize()
      this.lockScreenSize = size
      lockScreenBack.style.transition = 'all 3s'
      lockScreenBack.style.width = lockScreenBack.style.height = size + 'px'
    }
  }
</script>
