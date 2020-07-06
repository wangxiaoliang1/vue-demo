<template>
  <div class="page-style">
    <!-- 页面弹窗 -->
    <Modal class-name="page-style-modal" v-model="modalFlag" width="1000" :styles="{ top: '20px' }"
           :title="modalTitle" :mask-closable="false" :scrollable="true" @on-cancel="modalCancel">
      <div class="modal_record">
        <div>{{ $t("onlyStateChangesAreRecorded") }}</div>
        <div>
          <Button class="button-right-style" type="primary" custom-icon="icon-download" @click="changeRecordExport()">
            {{ $t("export") }}
          </Button>
        </div>
      </div>
      <table-custom :tableHeight="300" :columns="columnsDetails" :data="dataDetails"></table-custom>
      <page-custom :total="logSearchReq.total" :totalPage="logSearchReq.totalPage" :pageIndex="logSearchReq.pageIndex"
          :page-size="logSearchReq.pageIndex" @on-change="pageChangeModal" @on-page-size-change="pageSizeChangeModal"/>
      <div slot="footer">
        <Button type="primary" @click="modalCancel">{{ $t("cancel") }}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="800" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="100" :label-colon="true" @submit.native.prevent>
        <FormItem :label="$t('reason')" prop="reason" v-if="isAdd === 1">
          <Select v-model="req.reason" clearable filterable :placeholder="$t('pleaseSelect') + $t('reason')"
                  @on-select="setAutoFocus(1)">
            <Option v-for="(item, i) in reasonData" :value="item.id" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('theWarehouse')" prop="warehouse" v-if="isAdd === 1">
          <Select v-model="req.warehouse" clearable filterable :placeholder="$t('pleaseSelect') + $t('theWarehouse')"
                  @on-select="setAutoFocus(1)">
            <Option v-for="(item, i) in warehouseData" :value="item.id" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('fidFidl')" prop="feeder">
          <Input ref="fidFidlRefsName" v-model="req.feeder" v-focus="autoFocus === 1"
                 @on-keydown.enter="okClick" :placeholder="$t('pleaseEnter') + $t('fidFidl')"/>
        </FormItem>
      </Form>
      <List border v-show="errData.length > 0">
        <ListItem v-for="(item, i) in errData" :key="i">
          <Tag :color="item.errCode === 200 ? 'success' : 'error'">
            {{`${$t('fidFidl')}:${item.feeder} ${$t('databaseName')}:${item.floor} `}}
            {{isAdd ? `${$t('reason')}:${reasonData.find(o => o.id === item.reason).detailName} ` : ''}}
            {{isAdd ? `${$t('theWarehouse')}:${warehouseData.find(o => o.id === item.warehouse).detailName} ` : ''}}
            {{item.errCode !== 200 ? `${$t('errCase')}:${item.errText}` : ''}}
          </Tag>
        </ListItem>
      </List>
    </Drawer>
    <!-- 页面表格 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row>
            <i-col span="12">
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Select class="query_more_select" v-model="searchReq.data.floor">
                    <Option v-for="(item, i) in databaseData" :key="i" :value="item.name">{{item.name}}</Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="searchReq.data.feeder" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t('code')"/>
                </FormItem>
              </Form>
            </i-col>
            <i-col span="12">
              <button-custom :btnData="btnData" @on-maintain-click="maintainClick" @on-inMaintain-click="inMaintainClick" @on-changeRecord-click="changeRecordClick"></button-custom>
            </i-col>
          </Row>
        </div>
        <table-custom :tableHeight="tableHeight" :tableLoading="tableLoading" :columns="columns" :data="data"
                      @on-current-change="currentClick" @on-sort-change="sortChange"></table-custom>
        <page-custom :total="searchReq.total" :totalPage="searchReq.totalPage" :pageIndex="searchReq.pageIndex" :page-size="searchReq.pageSize"
                     @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
      </Card>
    </div>
  </div>
</template>

<script>
  import {getpagelistReq, getsinglefeederlogReq, exportsinglefeederlogReq, setfeedermaintenanceinReq, setfeedermaintenanceoutReq} from '@/api/material-manager/feeder-in'
  import {getlistReq} from '@/api/system-manager/data-item'
  import {getlistReq as getdatabaselistReq} from '@/api/system-manager/database-manager'
  import {formatDate, getButtonBoolean, exportFile, formatOperationType, playSound, inputSelectContent, errorType} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'
  export default {
    name: "feeder-maintain",
    components: {ButtonCustom, TableCustom, PageCustom},
    data() {
      return {
        isAdd: 0,
        autoFocus: 0,
        poptipModal: false,
        modalFlag: false,
        modalTitle: this.$t('changeRecord'),
        drawerFlag: false,
        drawerTitle: '',
        tableHeight: 200,
        tableLoading: true, // table加载动画
        columns: [
          {
            type: 'index', width: 50, align: 'center', fixed: 'left',
            indexMethod: row => {
              return (this.searchReq.pageIndex - 1) * this.searchReq.pageSize + row._index + 1
            }
          },
          {title: this.$t('fidFidl'), key: 'fidFidl', sortable: 'custom', width: 100},
          {title: this.$t('state'), key: 'fidStt', width: 100},
          {title: this.$t('fidSlt'), key: 'fidSlt', width: 100},
          {title: this.$t('fidSslt'), key: 'fidSslt', width: 100},
          {title: this.$t('fidNam'), key: 'fidNam', width: 100},
          {title: this.$t('fidCnt'), key: 'fidCnt', width: 100},
          {title: this.$t('fidNpc'), key: 'fidNpc', width: 100},
          {title: this.$t('fidPer'), key: 'fidPer', width: 100},
          {title: this.$t('fidErr'), key: 'fidErr', width: 100},
          {title: this.$t('fidBnpc'), key: 'fidBnpc', width: 100},
          {title: this.$t('fidBper'), key: 'fidBper', width: 120},
          {title: this.$t('fidBerr'), key: 'fidBerr', width: 120},
          {title: this.$t('fidBper'), key: 'fidBper', width: 120},
          {title: this.$t('fidBusr'), key: 'fidBusr', width: 100},
          {title: this.$t('fidFmc'), key: 'fidFmc', width: 100},
          {title: this.$t('lineWarehouse'), key: 'lineWarehouseName', width: 100},
          {title: this.$t('theWarehouse'), key: 'lineWarehouseName_W', width: 100},
        ], // 表格数据
        data: [], // 表格数据
        columnsDetails: [
          { type: "index", width: 50, align: "center", fixed: "left" },
          { title: 'Feeder', key: "feederId", width: 130, fixed: "left" },
          {
            title: this.$t("operationType"), key: "operationType", width: 100,
            render: (h, params) => {
              return h("div", formatOperationType(params.row.operationType));
            },
          },
          {
            title: this.$t("operationDate"), key: "createDate", width: 125,
            render: (h, params) => {
              return h("div", params.row.createDate ? formatDate(params.row.createDate, "yyyy-MM-dd hh:mm:ss") : null);
            },
          },
          { title: this.$t("createUserName"), key: "createUserName", width: 70 },
          { title: this.$t("lineName"), key: "lineName", width: 100 },
          { title: this.$t("recUser"), key: "recUser", width: 100 },
          { title: this.$t("lineWarehouse"), key: "wareHouseLine", width: 100 },
          { title: this.$t("reason"), key: "reason" },
        ], // 工单明细表格数据
        dataDetails: [], // 工单明细表格数据
        databaseData: [], // 数据库数据
        reasonData: [], // 原因数据
        warehouseData: [], // 所在仓库数据
        feederData: [], // 区段数据
        errData: [], // 区段数据
        selectObj: null, // 表格选中数据
        searchReq: {
          orderField: this.$config.pageConfig.orderField, // 排序字段
          ascending: this.$config.pageConfig.ascending, // 是否升序
          pageSize: this.$config.pageConfig.pageSize, // 分页大小
          pageIndex: this.$config.pageConfig.pageIndex, // 当前页码
          total: this.$config.pageConfig.total, // 当前页码
          totalPage: this.$config.pageConfig.totalPage, // 当前页码
          data: {
            feeder: '',
            fidStt: '0',
            feederName: '',
            floor: '',
            lineWarehouseName: '',
            warehouse: ''
          }
        },
        logSearchReq: {
          orderField: this.$config.pageConfig.orderField, // 排序字段
          ascending: this.$config.pageConfig.ascending, // 是否升序
          pageSize: this.$config.pageConfig.pageSize, // 分页大小
          pageIndex: this.$config.pageConfig.pageIndex, // 当前页码
          total: this.$config.pageConfig.total, // 当前页码
          totalPage: this.$config.pageConfig.totalPage, // 当前页码
          data: {
            feederId: ''
          }
        },
        req: {
          feeder: '', // Feeder编号
          reason: '', // 原因
          warehouse: '', // 库房Id
          enabled: 1
        },
        // 验证实体
        ruleValidate: {
          feeder: [{required: true, message: this.$t('pleaseEnter') + this.$t('fidFidl'), trigger: 'blur'}],
          reason: [{required: true, message: this.$t('pleaseEnter') + this.$t('reason'), trigger: 'change'}],
          warehouse: [{required: true, message: this.$t('pleaseEnter') + this.$t('theWarehouse'), trigger: 'change'}],
        },
        btnData: []
      }
    },
    mounted() {
      getButtonBoolean(this, this.btnData)
      this.getDataItemData()
      this.getDataBaseData()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true
        this.searchReq.data.feeder = this.searchReq.data.feeder.trim()
        getpagelistReq({...this.searchReq}).then(res => {
          this.tableLoading = false
          if (res.code === 200) {
            let data = res.result
            this.data = data.data ? data.data.usedFeederResponses || data.data.notUsedFeederResponses || [] : []
            this.searchReq.pageSize = data.pageSize
            this.searchReq.pageIndex = data.pageIndex
            this.searchReq.total = data.total
            this.searchReq.totalPage = data.totalPage
          }
        }).catch(() => this.tableLoading = false)
      },
      // 获取数据字典数据
      async getDataItemData() {
        this.reasonData = await this.getDataItemDetailList('Reason')
        this.warehouseData = await this.getDataItemDetailList('WareHouse')
      },
      async getDataItemDetailList(itemCode = '') {
        const obj = {
          itemCode,
          enabled: 1
        }
        let arr = []
        await getlistReq(obj).then(res => {
          if (res.code === 200) arr = res.result || []
        })
        return arr
      },
      // 获取数据库数据
      getDataBaseData() {
        let obj = {
          enabled: 1,
          userId: this.$store.state.id,
          systemFlag: this.$store.state.systemFlag,
          sortCode: 0,
          remark: ''
        }
        getdatabaselistReq(obj).then(res => {
          if (res.code === 200 && res.result) {
            this.databaseData = res.result || []
            this.searchReq.data.floor = this.databaseData.length ? this.databaseData[0].name : ''
          }
          this.searchReq.orderField = 'fidFidl'
          this.pageLoad()
        })
      },
      // 点击搜索按钮触发
      searchClick() {
        this.searchReq.pageIndex = 1
        this.pageLoad()
      },
      // select选中事件
      setAutoFocus(num = 0) {
        this.autoFocus = num
      },
      // 进维修保养
      inMaintainClick() {
        this.drawerFlag = true
        this.drawerTitle = this.$t('inMaintain')
        this.autoFocus = 1
        this.isAdd = 0
      },
      // 维修保养
      maintainClick() {
        this.drawerFlag = true
        this.drawerTitle = this.$t('maintain')
        this.isAdd = 1
      },
      // 提交判断
      okClick() {
        if (this.isAdd === 0) this.inMaintainSubmit()
        else this.maintainSubmit()
      },
      // 进维修保养提交
      inMaintainSubmit() {
        this.req.reason = '111'
        this.req.warehouse = '111'
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              floor: this.searchReq.data.floor, // 数据库标识
              feeder: this.req.feeder.trim(), // Feeder编号
              enabled: 1
            }
            setfeedermaintenanceinReq(obj).then(res => {
              if (res.code === 200) {
                playSound(this.$config.tipsVoice.OkTips)
                this.$Message.success(this.$t('success'))
              } else {
                playSound(this.$config.tipsVoice.NgTips)
                this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
              }
              inputSelectContent(this.$refs.fidFidlRefsName)
              this.errData.unshift({...obj, errCode: res.code, errText: errorType(this, res.errorCode)})
            })
          }
        })
      },
      // 维修保养提交
      maintainSubmit() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              floor: this.searchReq.data.floor, // 数据库标识
              feeder: this.req.feeder.trim(), // Feeder编号
              reason: this.req.reason.trim(), // 原因
              warehouse: this.req.warehouse.trim(), // 仓库
              enabled: 1
            }
            setfeedermaintenanceoutReq(obj).then(res => {
              if (res.code === 200) {
                playSound(this.$config.tipsVoice.OkTips)
                this.$Message.success(this.$t('success'))
              } else {
                playSound(this.$config.tipsVoice.NgTips)
                this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
              }
              inputSelectContent(this.$refs.fidFidlRefsName)
              this.errData.unshift({...obj, errCode: res.code, errText: errorType(this, res.errorCode)})
            })
          }
        })
      },
      // 点击变更记录按钮触发
      cancelClick() {
        this.drawerFlag = false
        this.autoFocus = 0
        this.isAdd = 0
        this.$refs.req.resetFields() //清除表单红色提示
        this.errData = []
        this.req.warehouse = ''
        this.req.reason = ''
      },
      // 点击变更记录按钮触发
      changeRecordClick() {
        if (this.selectObj) {
          const data = this.selectObj
          this.logSearchReq.data.feederId = data.fidFidl
          getsinglefeederlogReq({...this.logSearchReq}).then(res => {
            if (res.code === 200) {
              let data = res.result
              this.dataDetails = data.data ? data.data.usedFeederResponses || data.data.notUsedFeederResponses || [] : []
              this.logSearchReq.pageSize = data.pageSize
              this.logSearchReq.pageIndex = data.pageIndex
              this.logSearchReq.total = data.total
              this.logSearchReq.totalPage = data.totalPage
              this.modalFlag = true
            }
          })
        } else this.$Message.warning(this.$t('oneData'))
      },
      // 点击变更记录弹窗内导出按钮触发
      changeRecordExport() {
        exportsinglefeederlogReq({...this.logSearchReq.data}).then(res => {
          let blob = new Blob([res], {type: "application/vnd.ms-excel"})
          const fileName = `${this.$t('feeder-search')}${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xlsx` // 自定义文件名
          exportFile(blob, fileName)
        })
      },
      // 点击变更记录按钮触发
      modalCancel() {
        this.modalFlag = false
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
        this.searchReq.orderField = data.key.toUpperCase()
        this.searchReq.ascending = data.order === 'asc'
        this.pageLoad()
      },
      // 选择第几页
      pageChange(index) {
        this.searchReq.pageIndex = index
        this.pageLoad()
      },
      // 选择一页有条数据
      pageSizeChange(index) {
        this.searchReq.pageIndex = 1
        this.searchReq.pageSize = index
        this.pageLoad()
      },
      // 选择第几页
      pageChangeModal(index) {
        this.logSearchReq.pageIndex = index;
        this.changeRecordClick();
      },
      // 选择一页有条数据
      pageSizeChangeModal(index) {
        this.logSearchReq.pageIndex = 1;
        this.logSearchReq.pageSize = index;
        this.changeRecordClick();
      }
    }
  }
</script>

<style scoped lang="less">
  .modal_record {
    display: flex;
    justify-content: space-between;
    padding: 5px 20px;
  }
</style>
