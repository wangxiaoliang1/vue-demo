<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="500" :mask-closable="false" @on-close="cancelClick">
      <Form ref="submitReq" :model="submitData" :rules="ruleValidate" :label-width="100" :label-colon="true"
            @submit.native.prevent>
        <!-- 料号 -->
        <FormItem :label="$t('pn')" prop="pn">
          <Input v-model="submitData.pn" :placeholder="$t('pleaseEnter') + $t('pn')"/>
        </FormItem>
        <!-- 机种 -->
        <FormItem :label="$t('model')" prop="modelId">
          <Select v-model="submitData.modelId" clearable filterable :placeholder="$t('pleaseSelect') + $t('model')">
            <Option v-for="(item, i) in modelData" :value="item.id" :key="i">{{ item.modelName }}</Option>
          </Select>
        </FormItem>
          <!-- 类型 -->
        <FormItem :label="$t('type')" prop="partType">
          <Select v-model="submitData.partType" clearable filterable :placeholder="$t('pleaseSelect') + $t('type')"
          @on-change="partTypeSelectChange">
            <Option v-for="(item, i) in partTypeData" :value="item.detailCode" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <!-- MSD级别 -->
        <FormItem :label="$t('msdLevel')" prop="msdLevel" v-if="submitData.partType === 'MSD'">
          <Select v-model="submitData.msdLevel" clearable filterable :placeholder="$t('pleaseSelect') + $t('msdLevel')">
            <Option v-for="(item, i) in msdLevelData" :value="item.detailCode" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <!-- 规格1 -->
        <FormItem :label="$t('desc1')" prop="desc1">
          <Input v-model="submitData.desc1" :placeholder="$t('pleaseEnter') + $t('desc1')"/>
        </FormItem>
        <!-- 规格2 -->
        <FormItem :label="$t('desc2')" prop="desc2">
          <Input v-model="submitData.desc2" :placeholder="$t('pleaseEnter') + $t('desc2')"/>
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
        <!-- 版本 -->
        <FormItem :label="$t('version')" prop="verSion">
          <Input v-model="submitData.verSion" :placeholder="$t('pleaseEnter') + $t('version')"/>
        </FormItem>
        <!-- 客户料号 -->
        <FormItem :label="$t('customerNo')" prop="customerNo">
          <Input v-model="submitData.customerNo" :placeholder="$t('pleaseEnter') + $t('customerNo')"/>
        </FormItem>
        <!-- 厂商料号 -->
        <FormItem :label="$t('vendorNo')" prop="vendorNo">
          <Input v-model="submitData.vendorNo" :placeholder="$t('pleaseEnter') + $t('vendorNo')"/>
        </FormItem>
        <!-- panel数量 -->
        <FormItem :label="$t('panelQty')" prop="panelQty">
          <InputNumber v-model="submitData.panelQty" :min="0"></InputNumber>
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
            <i-col span="2">
              <Poptip v-model="poptipModal" class="poptip-style" placement="right-start" width="400">
                <Button type="primary" icon="ios-search">{{$t('selectQuery')}}</Button>
                <div class="poptip-style-content" slot="content">
                  <Form :label-width="80" :label-colon="true" @submit.native.prevent>
                    <FormItem :label="$t('model')">
                      <Select v-model="req.modelId" clearable filterable :placeholder="$t('pleaseSelect') + $t('model')">
                        <Option v-for="(item, i) in modelData" :value="item.id" :key="i">{{ item.modelName }}</Option>
                      </Select>
                    </FormItem>
                    <FormItem :label="$t('routeId')">
                      <Select v-model="req.routeId" clearable filterable :placeholder="$t('pleaseSelect') + $t('routeId')">
                        <Option v-for="(item, i) in wfRouteData" :value="item.id" :key="i">{{ item.name }}</Option>
                      </Select>
                    </FormItem>
                    <FormItem :label="$t('rulesId')">
                      <Select v-model="req.rulesId" clearable filterable :placeholder="$t('pleaseSelect') + $t('rulesId')">
                        <Option v-for="(item, i) in rulesData" :value="item.id" :key="i">{{ item.name }}</Option>
                      </Select>
                    </FormItem>
                    <FormItem :label="$t('msdLevel')">
                      <Select v-model="req.msdLevel" clearable filterable :placeholder="$t('pleaseSelect') + $t('msdLevel')">
                        <Option v-for="(item, i) in msdLevelData" :value="item.detailCode" :key="i">{{ item.detailName }}</Option>
                      </Select>
                    </FormItem>
                  </Form>
                </div>
              </Poptip>
            </i-col>
            <i-col span="10">
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Select class="query_more_select" v-model="req.selectName">
                    <Option v-for="(item, i) in selectNameList" :value="item.value" :key="i">{{ $t(item.title) }}</Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t('keyWords')"/>
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
  import {getpagelistReq, addReq, modifyReq, exportReq} from '@/api/basis-info/part-master'
  import {getlistReq} from "@/api/system-manager/data-item";
  import {getlistReq as getmodellistReq} from "@/api/basis-info/model-manager";
  import {getlistReq as getwfroutelistReq} from "@/api/flow-manager/wf-route";
  import {getlistReq as getcodelistReq} from "@/api/system-manager/code-set";
  import {formatDate, getButtonBoolean, exportFile, errorType} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'
  import DrawerButton from "@/components/drawer-button"

  export default {
    name: "part-master",
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
          {title: this.$t('pn'), key: 'pn', sortable: 'custom', width: 120, fixed: 'left'},
          {title: this.$t('model'), key: 'modelName',  width: 120, fixed: 'left'},
          {title: this.$t('type'), key: 'partType', width: 90, fixed: 'left'},
          {title: this.$t('routeId'), key: 'routeName', width: 130,},
          {title: this.$t('rulesId'), key: 'rulesName', width: 130,},
          {title: this.$t('version'), key: 'verSion', width: 90},
          {title: this.$t('customerNo'), key: 'customerNo', width: 120},
          {title: this.$t('vendorNo'), key: 'vendorNo', width: 120},
          {title: this.$t('msdLevel'), key: 'msdLevel', width: 80},
          {title: this.$t('panelQty'), key: 'panelQty', width: 80},
          {title: this.$t('desc1'), key: 'desc1', width: 650, resizable: true},
          {title: this.$t('desc2'), key: 'desc2', width: 650, resizable: true},
          {title: this.$t('remark'), key: 'remark', width: 240}
        ], // 表格数据
        data: [], // 表格数据
        typeData: [], // 工单类型数据
        statusData: [], // 工单状态数据
        partTypeData: [], // 料号类别数据
        modelData: [], // 机种数据
        wfRouteData: [], // 预设流程数据
        rulesData: [], // 条码规则数据
        msdLevelData: [], // MSD数据
        selectObj: null, // 表格选中数据
        selectNameList: [
          { title: "pn", value: "pn" },
          { title: "desc1", value: "desc1" },
          { title: "desc2", value: "desc2" },
          { title: "version", value: "verSion" },
          { title: "customerNo", value: "customerNo" },
          { title: "vendorNo", value: "vendorNo" },
          { title: "remark", value: "remark" },
        ], //搜索项列表
        req: {
          selectName: "pn", //搜索项
          queryName: "", //搜索名称
          id: '', // 主键Id
          pn: '',// 料号
          modelId: '',// 机种Id
          partType: '',// 类别
          desc1: '',// 规格1
          desc2: '',// 规格2
          routeId: '',// 预设流程
          rulesId: '',// 条码规则
          verSion: '',// 版本
          customerNo: '',// 客户料号
          vendorNo: '',// 厂商料号
          msdLevel: '',// MSD级别
          panelQty: 0,// Panel数量
          remark: '',// 描述
          enabled: -1, // 是否有效 -1:所有 0:无效 1:有效
          ...this.$config.pageConfig
        },
        submitData: {
          id: '', // 主键Id
          pn: '',// 料号
          modelId: '',// 机种Id
          partType: '',// 类别
          desc1: '',// 规格1
          desc2: '',// 规格2
          routeId: '',// 预设流程
          rulesId: '',// 条码规则
          verSion: '',// 版本
          customerNo: '',// 客户料号
          vendorNo: '',// 厂商料号
          msdLevel: '',// MSD级别
          panelQty: 0,// Panel数量
          remark: '',//描述
          sortCode: 0,//排序码
          enabled: 1//是否有效
        },
        // 验证实体
        ruleValidate: {
          pn: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('pn')}`, trigger: 'change'}],
          modelId: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('model')}`, trigger: 'change'}],
          partType: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('type')}`, trigger: 'change'}],
          msdLevel: [{required: false, message: `${this.$t('pleaseEnter')}${this.$t('msdLevel')}`, trigger: 'change'}],
        },
        btnData: []
      }
    },
    mounted() {
      getButtonBoolean(this, this.btnData)
      this.getModelData()
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
        let {id, modelId, partType, routeId, rulesId, msdLevel, remark, enabled} = this.req
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {id, modelId, partType, routeId, rulesId, msdLevel,
            [this.req.selectName]: this.req.queryName.trim(),
            remark, enabled}
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
      // 获取机种数据
      getModelData() {
        getmodellistReq({enabled: 1}).then(res => {
          if (res.code === 200) {
            this.modelData = res.result ? res.result : []
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
        this.partTypeData = await this.getDataItemDetailList('PartType')
        this.msdLevelData = await this.getDataItemDetailList('MSDLevel')
      },
      async getDataItemDetailList(itemCode) {
        let arr = []
        await getlistReq({itemCode, enabled: 1}).then(res => {
          if (res.code === 200) arr = res.result || []
        })
        return arr
      },
      // 点击搜索按钮触发
      partTypeSelectChange(name) {
        this.ruleValidate = {
          pn: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('pn')}`, trigger: 'change'}],
          modelId: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('model')}`, trigger: 'change'}],
          partType: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('type')}`, trigger: 'change'}],
          msdLevel: [{required: name === 'MSD', message: `${this.$t('pleaseEnter')}${this.$t('msdLevel')}`, trigger: 'change'}],
        }
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
          let {id, pn, modelId, partType, desc1, desc2, routeId, rulesId, verSion, customerNo, vendorNo, msdLevel, panelQty,
            remark, sortCode, enabled} = this.selectObj;
          this.submitData = {id, pn, modelId, partType, desc1, desc2, routeId, rulesId, verSion, customerNo, vendorNo, msdLevel, panelQty,
            remark, sortCode, enabled};
          this.drawerFlag = true;
          this.isAdd = false;
          this.drawerTitle = this.$t("edit");
        } else this.$Message.warning(this.$t("oneData"));
      },
      //提交
      submitClick(isClose = false) {
        this.$refs.submitReq.validate((validate) => {
          if (validate) {
            let trimArr = ['pn', 'desc1', 'desc2', 'verSion', 'customerNo', 'vendorNo']
            trimArr.forEach(o => {
              this.submitData[o] = this.submitData[o] ? this.submitData[o].trim() : ''
            })
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
        this.req.startTime = this.req.startTime ? formatDate(this.req.startTime, 'yyyy-MM-dd') : null
        let {id, modelId, partType, routeId, rulesId, msdLevel, remark, enabled} = this.req
        exportReq({id, modelId, partType, routeId, rulesId, msdLevel,
          [this.req.selectName]: this.req.queryName.trim(),
          remark, enabled}).then(res => {
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
