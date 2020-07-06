<template>
  <div>
    <Page class-name="custom-page" :total="total" :page-size="pageSize" :current="pageIndex" :page-size-opts="pageSizeList" :prev-text="prevText" :next-text="nextText" size="small" show-total show-sizer show-elevator @on-change="pageChange" @on-page-size-change="pageSizeChange">
      <slot>{{ pageShowTips }}</slot>
    </Page>
  </div>
</template>
<script>
export default {
  name: 'PageCustom',
  props: {
    total: Number, // 总条数
    totalPage: Number, // 总页数
    pageIndex: Number, // 当前页
    pageSize: Number // 每页大小
  },
  data () {
    return {
      pageSizeList: this.$config.pageSizeList,
      prevText: this.$t('prevText'),
      nextText: this.$t('nextText')
    }
  },
  computed: {
    // 提示信息
    pageShowTips() {
      return `${this.$t('pageTips1')}${this.total}, ${this.$t('pageTips2')}${this.totalPage}`
    }
  },
  methods: {
    /**
     * 选择跳转到第几页
     * @param index Number 要跳转的页数
     */
    pageChange (index) {
      this.$emit('on-change', index)
    },
    /**
     * 选择一页有条数据
     * @param index Number 返回的条数
     */
    pageSizeChange (index) {
      this.$emit('on-page-size-change', index)
    }
  }
}
</script>
