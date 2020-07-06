<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="500" :mask-closable="false" @on-close="cancelClick">
      <Form ref="submitReq" :model="submitData" :rules="ruleValidate" :label-width="100" :label-colon="true"
            @submit.native.prevent>
        <!-- 工单 -->
        <FormItem :label="$t('workOrder')" prop="workOrder">
          <Input v-model="submitData.workOrder" :placeholder="$t('pleaseEnter') + $t('workOrder')"/>
        </FormItem>
        <!-- 类型 -->
        <FormItem :label="$t('type')" prop="woType">
          <Select v-model="submitData.woType" clearable filterable :placeholder="$t('pleaseSelect') + $t('type')">
            <Option v-for="(item, i) in typeData" :value="item.detailCode" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <!-- 状态 -->
        <FormItem :label="$t('status')" prop="status">
          <Select v-model="submitData.status" clearable filterable :placeholder="$t('pleaseSelect') + $t('status')">
            <Option v-for="(item, i) in statusData" :value="item.detailCode" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <!-- 料号 -->
        <FormItem :label="$t('pn')" prop="partId">
          <Select v-model="submitData.partId" clearable filterable :placeholder="$t('pleaseSelect') + $t('pn')">
            <Option v-for="(item, i) in partData" :value="item.id" :key="i">{{ item.pn }}</Option>
          </Select>
        </FormItem>
        <!-- 机种 -->
        <FormItem :label="$t('model')" prop="modelId">
          <Select v-model="submitData.modelId" clearable filterable :placeholder="$t('pleaseSelect') + $t('model')">
            <Option v-for="(item, i) in modelData" :value="item.id" :key="i">{{ item.modelName }}</Option>
          </Select>
        </FormItem>
        <!-- 客户 -->
        <FormItem :label="$t('customer')" prop="customerId">
          <Select v-model="submitData.customerId" clearable filterable
                  :placeholder="$t('pleaseSelect') + $t('customer')">
            <Option v-for="(item, i) in customerData" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <!-- 区域 -->
        <FormItem :label="$t('area')" prop="areaId">
          <Select v-model="submitData.areaId" clearable filterable :placeholder="$t('pleaseSelect') + $t('area')">
            <Option v-for="(item, i) in areaData" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <!-- 预设流程 -->
        <FormItem :label="$t('routeId')" prop="routeId">
          <Select v-model="submitData.routeId" clearable filterable :placeholder="$t('pleaseSelect') + $t('routeId')">
            <Option v-for="(item, i) in wfRouteData" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <!-- 条码集合规则 -->
        <FormItem :label="$t('rulesId')" prop="rulesId">
          <Select v-model="submitData.rulesId" clearable filterable :placeholder="$t('pleaseSelect') + $t('rulesId')">
            <Option v-for="(item, i) in rulesData" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <!-- 预设线体 -->
        <FormItem :label="$t('orderLine')" prop="lineId">
          <Select v-model="submitData.lineId" clearable filterable :placeholder="$t('pleaseSelect') + $t('orderLine')">
            <Option v-for="(item, i) in areaFloorData" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <!-- 预计生产时间 -->
        <FormItem :label="$t('orderStartTime')" prop="scheduleDate">
          <DatePicker v-model="submitData.scheduleDate" type="date"></DatePicker>
        </FormItem>
        <!-- 投入量 -->
        <FormItem :label="$t('inQTY')" prop="inputQTY">
          <InputNumber v-model="submitData.inputQTY" :min="0"></InputNumber>
        </FormItem>
        <!-- 产出量 -->
        <FormItem :label="$t('outQTY')" prop="outQTY">
          <InputNumber v-model="submitData.outQTY" :min="0"></InputNumber>
        </FormItem>
        <!-- 报废数量 -->
        <FormItem :label="$t('scrapQTY')" prop="scrapQTY">
          <InputNumber v-model="submitData.scrapQTY" :min="0"></InputNumber>
        </FormItem>
        <!-- 出货单 -->
        <FormItem :label="$t('salesOrder')" prop="salesOrder">
          <Input v-model="submitData.salesOrder" :placeholder="$t('pleaseEnter') + $t('salesOrder')"/>
        </FormItem>
        <!-- 版本 -->
        <FormItem :label="$t('version')" prop="version">
          <Input v-model="submitData.version" :placeholder="$t('pleaseEnter') + $t('version')"/>
        </FormItem>
        <!-- 订单号 -->
        <FormItem :label="$t('poNo')" prop="poNo">
          <Input v-model="submitData.poNo" :placeholder="$t('pleaseEnter') + $t('poNo')"/>
        </FormItem>
        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="submitData.sortCode" :min="0"></InputNumber>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled">
          <i-switch size="large" v-model="submitData.enabled" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("open") }}</span>
            <span slot="close">{{ $t("close") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark">
          <Input v-model="submitData.remark" :placeholder="$t('pleaseEnter') + $t('remark')"/>
        </FormItem>
        <!-- 按钮 -->
        <FormItem>
          <drawer-button :isAdd="isAdd" @on-cancel="cancelClick" @on-ok="submitClick" @on-update="submitClick"
                         @on-okOrUpdate="submitClick(true)"></drawer-button>
        </FormItem>
      </Form>
    </Drawer>
    <!-- 页面表格 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row>
            <i-col span="12">
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Select v-model="req.woType" clearable filterable :placeholder="$t('pleaseSelect') + $t('orderType')">
                    <Option v-for="(item, i) in typeData" :value="item.detailCode" :key="i">{{ item.detailName }}
                    </Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="req.workOrder" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t('workOrderName')"/>
                </FormItem>
              </Form>
            </i-col>
            <i-col span="12">
              <button-custom :btnData="btnData" @on-add-click="addClick" @on-edit-click="editClick"
                             @on-export-click="exportClick"></button-custom>
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
  import {getpagelistReq, addReq, modifyReq, exportReq} from '@/api/material-manager/order-info'
  import {getlisttreeauthReq} from '@/api/system-manager/area-floor'
  import {getlistReq as getcustomerlistReq} from '@/api/system-manager/customer-vendor'
  import {getlistReq} from "@/api/system-manager/data-item";
  import {getlistReq as getmodellistReq} from "@/api/basis-info/model-manager";
  import {getlistReq as getpartlistReq} from "@/api/basis-info/part-master";
  import {getlistReq as getwfroutelistReq} from "@/api/flow-manager/wf-route";
  import {getlistReq as getcodelistReq} from "@/api/system-manager/code-set";
  import {formatDate, getButtonBoolean, exportFile, errorType, initTreeList} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'
  import DrawerButton from "@/components/drawer-button"

  export default {
    name: "order-info",
    components: {ButtonCustom, TableCustom, PageCustom, DrawerButton},
    data() {
      return {
        poptipModal: false,
        isSuccess: false,
        isAdd: true,
        drawerFlag: false,
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
          {title: this.$t('workOrderName'), key: 'workOrder', width: 125, sortable: 'custom', fixed: 'left'},
          {title: this.$t('type'), key: 'woType', width: 90},
          {title: this.$t('status'), key: 'status', width: 110},
          {title: this.$t('orderVersion'), key: 'version', width: 90},
          {title: this.$t('scrapQTY'), key: 'scrapQTY', width: 90},
          {title: this.$t('scheduleDate'), key: 'scheduleDate', width: 90,
            render: (h, params) => {
              return h("div", params.row.scheduleDate ? formatDate(params.row.scheduleDate, "yyyy-MM-dd") : null);
            }
          },
          {title: this.$t('salesOrder'), key: 'salesOrder', width: 90},
          {title: this.$t('workQTY'), key: 'qty', width: 90},
          {title: this.$t('inQTY'), key: 'inputQTY', width: 90},
          {title: this.$t('outQTY'), key: 'outQTY', width: 90},
          {title: this.$t('poNo'), key: 'poNo', width: 120},
          {title: this.$t('remark'), key: 'remark', width: 240}
        ], // 表格数据
        data: [], // 表格数据
        typeData: [], // 工单类型数据
        statusData: [], // 工单状态数据
        wfRouteData: [], // 预设流程数据
        rulesData: [], // 条码规则数据
        areaFloorData: [], // 线体数据
        areaData: [], // 区域数据
        partData: [], // 料号数据
        modelData: [], // 机种数据
        customerData: [], // 厂商客户数据
        lineWarehouseData: [], // 线边仓数据
        warehouseData: [], // 所在仓库数据
        selectObj: null, // 表格选中数据
        req: {
          id: '', // 主键Id
          woType: '',// 工单类型来自数据字典
          workOrder: '',// 工单
          remark: '',// 描述
          enabled: -1, // 是否有效 -1:所有 0:无效 1:有效
          ...this.$config.pageConfig
        },
        submitData: {
          id: '',
          woType: '',// 工单类型来自数据字典
          workOrder: '',// 工单
          status: '',//工单状态
          version: '',//工单版本
          scrapQTY: 0,//报废数量
          scheduleDate: '',//预计生产时间
          salesOrder: '',//出货单
          rulesId: '',//工单规则
          routeId: '',//流程
          qty: 0,//工单数量
          poNo: '',//客户订单
          partId: '',//料号
          packRuleId: '',//包装码
          outQTY: 0,//产出量
          inputQTY: 0,//投入量
          modelId: '',//机种ID
          lineId: '',//预设线别
          customerId: '',//客户ID
          areaId: '',//区域Id
          opT1: '',//扩展1
          opT2: '',
          opT3: '',
          opT4: '',
          opT5: '',
          opT6: '',
          remark: '',//描述
          sortCode: 0,//排序码
          enabled: 1//是否有效
        },
        // 验证实体
        ruleValidate: {
          workOrder: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('workOrder')}`, trigger: 'blur'}],
          woType: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('orderType')}`, trigger: 'change'}],
        },
        btnData: []
      }
    },
    mounted() {
      getButtonBoolean(this, this.btnData)
      this.getAreaFloorData()
      this.getCustomVendorData()
      this.getModelData()
      this.getPartData()
      this.getWFRouteData()
      this.getRulesData()
      this.getDataItemData()
      this.pageLoad()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true
        let {id, woType, workOrder, remark, enabled} = this.req
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {id, woType, workOrder: workOrder.trim(), remark, enabled}
        };
        getpagelistReq(obj).then(res => {
          this.tableLoading = false
          if (res.code === 200) {
            let data = res.result
            this.data = data.data || []
            this.req.pageSize = data.pageSize
            this.req.pageIndex = data.pageIndex
            this.req.total = data.total
            this.req.totalPage = data.totalPage
          }
        }).catch(() => this.tableLoading = false)
      },
      // 获取线体数据
      getAreaFloorData() {
        getlisttreeauthReq({userId: this.$store.state.id, systemFlag: this.$store.state.systemFlag}).then(res => {
          if (res.code === 200) {
            let data = []
            initTreeList(data, res.result ? res.result : [])
            this.areaData = data.filter(o => o.category === 2)
            this.areaFloorData = data.filter(o => o.category === 4)
          }
        })
      },
      // 获取客户厂商数据
      getCustomVendorData() {
        getcustomerlistReq({enabled: 1}).then(res => {
          if (res.code === 200) {
            this.customerData = res.result ? res.result : []
          }
        })
      },
      // 获取机种数据
      getModelData() {
        getmodellistReq({enabled: 1}).then(res => {
          if (res.code === 200) {
            this.modelData = res.result ? res.result : []
          }
        })
      },
      // 获取料号数据
      getPartData() {
        getpartlistReq({enabled: 1}).then(res => {
          if (res.code === 200) {
            this.partData = res.result ? res.result : []
          }
        })
      },
      // 获取预设流程数据
      getWFRouteData() {
        getwfroutelistReq({enabled: 1}).then(res => {
          if (res.code === 200) {
            this.wfRouteData = res.result ? res.result : []
          }
        })
      },
      // 获取条码规则集合数据
      getRulesData() {
        getcodelistReq({enabled: 1}).then(res => {
          if (res.code === 200) {
            this.rulesData = res.result ? res.result : []
          }
        })
      },
      // 点击编码规则中的加号按钮触发
      async getDataItemData() {
        this.typeData = await this.getDataItemDetailList('OrderType')
        this.statusData = await this.getDataItemDetailList('OrderStatus')
      },
      async getDataItemDetailList(itemCode) {
        let arr = []
        await getlistReq({itemCode, enabled: 1}).then(res => {
          if (res.code === 200) arr = res.result || []
        })
        return arr
      },
      // 点击搜索按钮触发
      selectChange(name) {
        if (!this.req.data[name]) this.req.data[name] = ''
        this.pageLoad()
      },
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1
        this.pageLoad()
      },
      // 点击新增按钮触发
      addClick() {
        this.drawerFlag = true;
        this.isAdd = true;
        this.drawerTitle = this.$t("add");
      },
      // 点击编辑按钮触发
      editClick() {
        if (this.selectObj) {
          let {id, woType, workOrder, status, version, scrapQTY, scheduleDate, salesOrder, rulesId, routeId, qty,
            poNo, partId, packRuleId, outQTY, inputQTY, modelId, lineId, customerId, areaId, remark, sortCode, enabled} = this.selectObj;
          this.submitData = {id, woType, workOrder, status, version, scrapQTY, scheduleDate, salesOrder, rulesId, routeId, qty,
            poNo, partId, packRuleId, outQTY, inputQTY, modelId, lineId, customerId, areaId, remark, sortCode, enabled};
          this.drawerFlag = true;
          this.isAdd = false;
          this.drawerTitle = this.$t("edit");
        } else this.$Message.warning(this.$t("oneData"));
      },
      //提交
      submitClick(isClose = false) {
        this.$refs.submitReq.validate((validate) => {
          if (validate) {
            let trimArr = ['workOrder', 'poNo', 'version', 'salesOrder']
            trimArr.forEach(o => {
              this.submitData[o] = this.submitData[o] ? this.submitData[o].trim() : ''
            })
            this.submitData.scheduleDate = this.submitData.scheduleDate ? formatDate(this.submitData.scheduleDate, 'yyyy-MM-dd') : ''
            let obj = { ...this.submitData };
            let request = this.isAdd ? addReq(obj) : modifyReq(obj);
            request.then((res) => {
              if (res.code === 200) {
                this.selectObj = null;
                this.$Message.success(`${this.drawerTitle}${this.$t("success")}`);
                this.pageLoad();
                if (isClose) this.cancelClick();
              } else this.$Message.error(`${this.drawerTitle}${this.$t("fail")},${errorType(this, res.errorCode)}`);
            });
          }
        });
      },
      // 左侧抽屉取消
      cancelClick() {
        this.drawerFlag = false;
        this.isSuccess = false;
        this.$refs.submitReq.resetFields(); //清除表单红色提示
        this.submitData.id = "";
      },
      // 工单导出
      exportClick() {
        let {id, woType, workOrder, remark, enabled} = this.req
        exportReq({id, woType, workOrder: workOrder.trim(), remark, enabled}).then(res => {
          let blob = new Blob([res], {type: "application/vnd.ms-excel"})
          const fileName = `${this.$t('order-info')}${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xlsx` // 自定义文件名
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
        this.req.orderField = data.key.toUpperCase();
        this.req.ascending = data.order === "asc";
        this.pageLoad();
      },
      // 选择第几页
      pageChange(index) {
        this.req.pageIndex = index;
        this.pageLoad();
      },
      // 选择一页有条数据
      pageSizeChange(index) {
        this.req.pageIndex = 1;
        this.req.pageSize = index;
        this.pageLoad();
      },
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
