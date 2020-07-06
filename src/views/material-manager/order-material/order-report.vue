<template>
  <div class="page-style">
    <!-- 页面表格 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row type="flex" justify="space-between">
            <i-col>
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Select class="query_more_select" v-model="req.selectName">
                    <Option value="workOrder">{{$t('workOrder')}}</Option>
                    <Option value="pn">{{$t('pn')}}</Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t(req.selectName)"/>
                </FormItem>
              </Form>
            </i-col>
            <i-col>
              <button-custom :btnData="btnData" @on-export-click="exportClick"></button-custom>
            </i-col>
          </Row>
        </div>
        <table-custom :tableHeight="tableHeight" :tableLoading="tableLoading" :columns="columns" :data="data"
                      @on-current-change="currentClick" @on-sort-change="sortChange"></table-custom>
        <page-custom :total="req.total" :totalPage="req.totalPage" :pageIndex="req.pageIndex" :page-size="req.pageSize"
                     @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
      </Card>
    </div>
  </div>
</template>

<script>
  import {getpagelistReq, exportReq} from '@/api/material-manager/order-report'
  import {formatDate, getButtonBoolean, exportFile} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "order-report",
    components: {ButtonCustom, TableCustom, PageCustom},
    data() {
      return {
        split: .15,
        autoFocus: 0,
        drawerFlag: false,
        isAdd: 0,
        drawerTitle: this.$t('add'),
        tableHeight: 200,
        tableLoading: true, // table加载动画
        columns: [
          {
            type: 'index', width: 50, align: 'center', fixed: 'left',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('workOrder'), key: 'workorder', sortable: 'custom', fixed: 'left', width: 160},
          {title: this.$t('pn'), key: 'pn', width: 130},
          {title: this.$t('pnUsedCountReport'), key: 'pnusedcount', width: 70},
          {title: this.$t('issueQtyReport'), key: 'issueqty', width: 80},
          {title: this.$t('outputUnitIdQtyReport'), key: 'outputunitidqty', width: 90, sortable: 'custom'},
          {title: this.$t('originalQtyReport'), key: 'originalqty', width: 80, sortable: 'custom'},
          {title: this.$t('diffQty'), key: 'diffqty', width: 90, sortable: 'custom'},
          {title: this.$t('initialQtyReport'), key: 'initialqty', width: 80, sortable: 'custom'},
          {title: this.$t('usedQtyReport'), key: 'usedqty', width: 90, sortable: 'custom'},
          {title: this.$t('lossQty'), key: 'lossqty', width: 80, sortable: 'custom'},
          {
            title: this.$t('lossQtyRate'), key: 'lossqtyrate', width: 90, sortable: 'custom',
            render: (h, params) => {
              return h('span', `${params.row.lossqtyrate}%`)
            }
          }
        ], // 表格数据
        data: [], // 表格数据
        zoneData: [], // 区段数据
        errData: [], // 区段数据
        selectObj: null, // 表格选中数据
        maxLength: 36, // 表格选中数据
        req: {
          thisUserId: this.$store.state.id,
          systemFlag: this.$store.state.systemFlag,
          selectName: 'workOrder',
          queryName: '',
          queryLineId: '',
          lineId: '', // 线体ID
          newWorkOrder: '', // 新工单
          oldWorkOrder: '', // 旧工单
          oldInputQty: null, // 老工单投入量
          orderField: 'workOrder',
          ascending: this.$config.pageConfig.ascending,
          pageSize: this.$config.pageConfig.pageSize,
          pageIndex: this.$config.pageConfig.pageIndex
        },
        btnData: []
      }
    },
    mounted() {
      getButtonBoolean(this, this.btnData)
      this.pageLoad()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {
            lineId: this.req.queryLineId,
            work_Order: this.req.selectName === 'workOrder' ? this.req.queryName.trim() : '',
            rid: '',
            pn: this.req.selectName === 'pn' ? this.req.queryName.trim() : ''
          }
        }
        getpagelistReq(obj).then(res => {
          this.tableLoading = false
          if (res.code === 200) {
            let data = res.result
            this.data = data.data ? data.data : []
            this.req.pageSize = data.pageSize
            this.req.pageIndex = data.pageIndex
            this.req.total = data.total
            this.req.totalPage = data.totalPage
          }
        }).catch(() => this.tableLoading = false)
      },
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1
        this.pageLoad()
      },
      // 工单导出
      exportClick() {
        const obj = {
          lineId: this.req.queryLineId,
          work_Order: this.req.selectName === 'workOrder' ? this.req.queryName.trim() : '',
          rid: '',
          pn: this.req.selectName === 'pn' ? this.req.queryName.trim() : ''
        }
        exportReq(obj).then(res => {
          let blob = new Blob([res], {type: "application/vnd.ms-excel"})
          const fileName = `${this.$t('order-report')}${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xlsx` // 自定义文件名
          exportFile(blob, fileName)
        })
      },
      // 自动改变表格高度
      autoSize() {
        let height = document.body.clientHeight - 120
        this.tableHeight = height - 60
      },
      // 某一行高亮时触发
      currentClick(currentRow) {
        this.selectObj = currentRow
      },
      // 排序时有效，当点击排序时触发
      sortChange(data) {
        this.req.orderField = data.key.toUpperCase()
        this.req.ascending = data.order === 'asc'
        this.pageLoad()
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
    }
  }
</script>
