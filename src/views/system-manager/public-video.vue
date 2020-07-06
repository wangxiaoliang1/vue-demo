<template>
  <div class="video-wrapper">
    <Modal :mask-closable="false" title="视频播放" v-model="modalFlag" @on-cancel="modalCancel">
      <video v-if="videoValue"
             id="my-video"
             class="video-style video-js vjs-big-play-centered"
             webkit-playsinline="webkit-playsinline"
             playsinline="playsinline" @contextmenu.prevent
      >
        <source :src="videoValue" type='video/mp4'/>
        <p class="vjs-no-js">{{$t('videoTips')}}</p>
      </video>
      <div slot="footer">
        <Button @click="modalCancel">{{ $t("cancel") }}</Button>
      </div>
    </Modal>
    <header class="video-header">
      <div class="video-content">
        <div class="video-header-logo">
          <img src="@/assets/video_logo.png" :alt="$config.title">
        </div>
        <div class="video-header-search">
          <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                 size="default" :placeholder="$t('pleaseEnter') + $t('name')"/>
        </div>
      </div>
    </header>
    <nav class="video-nav">
      <div class="video-content">
        <Row>
          <i-col v-for="(item, i) in navList" :key="i" class="video-nav-item" :class="{active: i === isActive}" span="2"
                 @click.native="navClick(i)">
            {{item.name}}
          </i-col>
        </Row>
      </div>
    </nav>
    <section class="video-section">
      <div class="video-content">
        <Row>
          <i-col v-for="(item, i) in videoList" :key="i" class="video-section-item" span="3">
            <img :src="item.poster" :alt="item.name" :title="item.remark" @click="videoClick(item)">
            <p :title="item.name">{{item.name}}</p>
          </i-col>
        </Row>
      </div>
    </section>
  </div>
</template>

<script>
  import {getpagelistReq} from '@/api/system-manager/public-video'
  import {getpagelistReq as gettypepagelistReq} from "@/api/system-manager/assets-type"

  export default {
    name: "tv",
    data() {
      return {
        videoList: [],
        navList: [],
        modalFlag: false,
        player: null,
        isActive: 0,
        videoValue: '',
        videoSource: '',
        req: {
          queryName: '',
          typeId: ''
        },
        videoObj: {
          language: 'zh-CN',
          autoplay: false,
          controls: true,
          preload: 'auto',
          poster: '',
          aspectRatio: '640:267',
          playbackRates: [1, 1.5, 2],
          notSupportedMessage: this.$t('videoTips'),
          controlBar: {
            captionsButton: true,
            chaptersButton: true,
            liveDisplay: true,
            playbackRateMenuButton: true,
            subtitlesButton: true
          }
        }
      }
    },
    mounted() {
      this.getNavData()
      this.pageLoad()
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        const obj = {
          orderField: 'CREATEDATE', // 排序字段
          ascending: true, // 是否升序
          pageSize: 100, // 分页大小
          pageIndex: 1, // 当前页码
          data: {
            name: this.req.queryName.trim(),
            typeId: this.req.typeId,
            enabled: 1
          }
        }
        getpagelistReq(obj).then(res => {
          if (res.code === 200) {
            this.videoList = res.result.data.map(o => {
              return {
                url: `http://10.32.42.30:8000/api/systemcenter/anonymous/v1/assets/video?directory=static&fileName=${o.fileName}`,
                name: o.name,
                poster: `http://10.32.42.30:8000/api/systemcenter/anonymous/v1/assets/image?directory=CoverImage&fileName=${o.coverImage}`,
                remark: o.remark
              }
            })
          }
        })
      },
      // 点击搜索按钮触发
      getNavData() {
        const obj = {
          orderField: 'CREATEDATE', // 排序字段
          ascending: true, // 是否升序
          pageSize: 50, // 分页大小
          pageIndex: 1, // 当前页码
          data: {
            name: '',
            enabled: -1,
          }
        }
        gettypepagelistReq(obj).then(res => {
          if (res.code === 200 && res.result) {
            this.navList = res.result.data.filter(o => o.enabled === 1)
            this.navList.unshift({name: this.$t('home')})
          }
        })
      },
      // 点击搜索按钮触发
      searchClick() {
        this.pageLoad()
      },
      // 点击导航内容触发
      navClick(index) {
        this.isActive = index
        this.req.typeId = this.navList[index].id
        this.pageLoad()
      },
      // 点击视频方框触发
      videoClick(data) {
        this.modalFlag = true
        this.videoValue = data.url
        this.videoObj.poster = data.poster
        setTimeout(() => {
          this.player = this.$video('my-video', this.videoObj)
        }, 1000)
      },
      // 关闭弹窗触发
      modalCancel() {
        this.modalFlag = false
        this.videoValue = ''
        this.player.dispose()
      }
    }
  }
</script>

<style scoped lang="less">
  @primaryColor: #5FB878;

  .video-size {
    height: 100%;
  }

  .video-wrapper {
    .video-size;
  }

  .video-content {
    width: 80%;
    .video-size;
    min-width: 1000px;
    margin: 0 auto;
  }

  .video-header {
    height: 80px;

    &-logo {
      display: inline-block;
      width: 200px;
      .video-size;

      img {
        width: 100%;
        .video-size;
      }
    }

    &-search {
      display: inline-block;
      width: calc(100% - 200px);
      .video-size;
      line-height: 80px;
      padding: 22px 5px;
    }
  }

  .video-nav {
    text-align: center;
    font-size: 14px;
    border-top: 1px solid @primaryColor;
    border-bottom: 1px solid @primaryColor;

    &-item {
      padding: 10px 5px;
      color: @primaryColor;
      cursor: pointer;

      &:hover {
        color: #fff;
        background-color: @primaryColor;
      }
    }

    &-item.active {
      color: #fff;
      background-color: @primaryColor;
    }
  }

  .video-style {
    width: 100%;
    height: 260px;
  }

  .video-section {
    height: calc(100% - 120px);
    overflow-y: auto;

    &-item {
      width: 170px;
      height: 120px;
      text-align: center;
      margin: 10px 5px;

      img {
        width: 100%;
        height: calc(100% - 20px);
        outline: none;
        vertical-align: bottom;
        cursor: pointer;

        &:hover {
          box-shadow: 0 0 5px @primaryColor;
        }
      }

      p {
        margin-top: 7px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
</style>
