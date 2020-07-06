<template>
  <div>
    <grid-custom ref="gridHeight" :gridData="gridData"></grid-custom>
    <page-custom :total="req.total" :totalPage="req.totalPage" :pageIndex="req.pageIndex" :page-size="req.pageSize"
                 @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
  </div>
</template>

<script>
  import {getpagelistReq} from '@/api/system-manager/heart-check'
  import {formatDate, getNowToDate} from '@/libs/tools'
  import GridCustom from '@/components/grid-custom'
  import PageCustom from '@/components/page-custom'
  export default {
    name: "usb",
    components: {GridCustom, PageCustom},
    data() {
      return {
        gridData: [],
        timerHeart: null,
        req: {
          category: 0, // 类别 -1-所有 0-U盘检查
          ip: '', // IP
          hostName: '', // 电脑名称
          mac: '', // Mac地址
          orderField: this.$config.pageConfig.orderField, // Mac地址
          ascending: false, // Mac地址
          pageSize: 500, // Mac地址
          pageIndex: this.$config.pageConfig.pageIndex // Mac地址
        }
      }
    },
    mounted() {
      this.pageLoad()
      if (this.timerHeart) clearInterval(this.timerHeart)
      this.timerHeart = setInterval(() => {
        this.pageLoad()
      }, 30 * 1000)
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    methods: {
      pageLoad() {
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {
            category: 0, // 类别 -1-所有 0-U盘检查
            ip: '', // IP
            hostName: '', // 电脑名称
            mac: '', // Mac地址
          }
        }
        this.$Spin.show()
        getpagelistReq(obj).then(res => {
          this.$Spin.hide()
          if (res.code === 200) {
            let data = res.result
            const time = 3 * 60 * 1000
            this.gridData = data.data ? data.data : []
            this.gridData.forEach(o => {
              o['gridDate'] = o.createDate ? formatDate(o.createDate, 'yyyy-MM-dd hh:mm:ss') : null
              const oldTime = getNowToDate(0) - new Date(o.gridDate).getTime()
              o['gridColor'] = Math.abs(oldTime) > time ? '#FF6666' : '#19be6b'
            })
            this.req.pageSize = data.pageSize
            this.req.pageIndex = data.pageIndex
            this.req.total = data.total
            this.req.totalPage = data.totalPage
          }
        }).catch(err => {
          this.$Spin.hide()
          this.$Message.error(`${err.status} ${err.statusText}`)
        })
      },
      // 自动改变表格高度
      autoSize() {
        let height = document.body.clientHeight - 40
        this.$refs.gridHeight.$el.style.height = `${height}px`
      },
      // 选择第几页
      pageChange(index) {
        this.req.pageIndex = index
        this.pageLoad()
      },
      // 选择一页有条数据
      pageSizeChange(index) {
        this.req.pageIndex = 1
        this.req.pageSize = index
        this.pageLoad()
      }
    },
    beforeDestroy() {
      clearInterval(this.timerHeart)
    }
  }
</script>
