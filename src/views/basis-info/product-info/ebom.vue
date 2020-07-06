<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="500" :mask-closable="false" @on-close="cancelClick">
      <Form ref="submitReq" :model="submitData" :rules="ruleValidate" :label-width="100" :label-colon="true"
            @submit.native.prevent>
        <!-- 料号 -->
        <FormItem :label="$t('partNO')" prop="partNO">
          <Select v-model="submitData.partNO" clearable filterable remote :remote-method="(e) => getPartDataHandle(e, 'Good')"
                  :loading="loadingPart" :placeholder="$t('pleaseSelect') + $t('partNO')">
            <Option v-for="(item, i) in partDataGood" :value="item.pn" :key="i">{{ item.pn }}</Option>
          </Select>
        </FormItem>
        <!-- 主料号 -->
        <FormItem :label="$t('itemPartId')" prop="itemPartId">
          <Select v-model="submitData.itemPartId" clearable filterable remote :remote-method="(e) => getPartDataHandle(e, 'Main')"
                  :loading="loadingPart" :placeholder="$t('pleaseSelect') + $t('itemPartId')">
            <Option v-for="(item, i) in partDataMain" :value="item.id" :key="i">{{ item.pn }}</Option>
          </Select>
        </FormItem>
        <!-- 替代料 -->
        <FormItem :label="$t('itemAVLId')" prop="itemAVLId">
          <Select v-model="submitData.itemAVLId" clearable filterable remote :remote-method="(e) => getPartDataHandle(e, 'Replace')"
                  :loading="loadingPart" :placeholder="$t('pleaseSelect') + $t('itemAVLId')">
            <Option v-for="(item, i) in partDataReplace" :value="item.id" :key="i">{{ item.pn }}</Option>
          </Select>
        </FormItem>
        <!-- 制程 -->
        <FormItem :label="$t('processId')" prop="processId">
          <treeselect v-model="submitData.processId" :options="zoneData" :disable-branch-nodes="true" :showCount="true"
                      @input="zoneInput" :placeholder="$t('pleaseSelect') + $t('processId')"/>
        </FormItem>
        <!-- 版本 -->
        <FormItem :label="$t('version')" prop="version">
          <Input v-model="submitData.version" :placeholder="$t('pleaseEnter') + $t('version')"/>
        </FormItem>
        <!-- 位号 -->
        <FormItem :label="$t('location')" prop="location">
          <Input v-model="submitData.location" :placeholder="$t('pleaseEnter') + $t('location')" @on-blur="locationBlur"/>
        </FormItem>
        <!-- 用量 -->
        <FormItem :label="$t('qty')" prop="qty">
          <InputNumber v-model="submitData.qty" :min="0"></InputNumber>
        </FormItem>
        <!-- 单位 -->
        <FormItem :label="$t('unit')" prop="unit">
          <Input v-model="submitData.unit" :placeholder="$t('pleaseEnter') + $t('unit')"/>
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
                    <!-- 成品料号 -->
                    <FormItem :label="$t('partNO')">
                      <Select v-model="req.partNO" clearable filterable remote :remote-method="(e) => getPartDataHandle(e, 'Good')"
                              :loading="loadingPart" :placeholder="$t('pleaseSelect') + $t('partNO')">
                        <Option v-for="(item, i) in partDataGood" :value="item.pn" :key="i">{{ item.pn }}</Option>
                      </Select>
                    </FormItem>
                    <!-- 主料号 -->
                    <FormItem :label="$t('itemPartId')">
                      <Select v-model="req.itemPartId" clearable filterable remote :remote-method="(e) => getPartDataHandle(e, 'Main')"
                              :loading="loadingPart" :placeholder="$t('pleaseSelect') + $t('itemPartId')">
                        <Option v-for="(item, i) in partDataMain" :value="item.id" :key="i">{{ item.pn }}</Option>
                      </Select>
                    </FormItem>
                    <!-- 替代料 -->
                    <FormItem :label="$t('itemAVLId')">
                      <Select v-model="req.itemAVLId" clearable filterable remote :remote-method="(e) => getPartDataHandle(e, 'Replace')"
                              :loading="loadingPart" :placeholder="$t('pleaseSelect') + $t('itemAVLId')">
                        <Option v-for="(item, i) in partDataReplace" :value="item.id" :key="i">{{ item.pn }}</Option>
                      </Select>
                    </FormItem>
                    <!-- 制程 -->
                    <FormItem :label="$t('processId')">
                      <treeselect v-model="req.processId" :options="zoneData" :disable-branch-nodes="true" :showCount="true"
                                  @input="zoneInputSearch" :placeholder="$t('pleaseSelect') + $t('processId')"/>
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
  import {getpagelistReq, addReq, modifyReq, exportReq} from '@/api/basis-info/ebom'
  import {getpagelistReq as getpartlistReq} from "@/api/basis-info/part-master";
  import {getlisttreeReq} from "@/api/flow-manager/zone-manage";
  import {formatDate, getButtonBoolean, exportFile, errorType} from '@/libs/tools'
  import {hasChild} from '@/libs/utils'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'
  import DrawerButton from "@/components/drawer-button"
  import Treeselect from '@riophae/vue-treeselect'

  export default {
    name: "ebom",
    components: {ButtonCustom, TableCustom, PageCustom, DrawerButton, Treeselect},
    data() {
      return {
        poptipModal: false,
        isSubmit: false,
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
          {title: this.$t('partNO'), key: 'partNO', sortable: 'custom', width: 120},
          {title: this.$t('itemPartName'), key: 'itemPartName', width: 120},
          {title: this.$t('processName'), key: 'processName', width: 120},
          {title: this.$t('itemAVLName'), key: 'itemAVLName', width: 120},
          {title: this.$t('version'), key: 'version', width: 100},
          {title: this.$t('location'), key: 'location', width: 100},
          {title: this.$t('qty'), key: 'qty', width: 80},
          {title: this.$t('unit'), key: 'unit', width: 100},
          {title: this.$t('remark'), key: 'remark', width: 240}
        ], // 表格数据
        data: [], // 表格数据
        typeData: [], // 工单类型数据
        statusData: [], // 工单状态数据
        zoneData: [], // 机种数据
        timeOutGood: null, // 定时器-成品料号
        timeOutMain: null, // 定时器-主料号
        timeOutReplace: null, // 定时器-替代料号
        timeOutValue: 500, // 定时器时间
        loadingPart: false, // 料号数据加载
        partDataGood: [], // 成品料号数据
        partDataMain: [], // 主料号数据
        partDataReplace: [], // 替代料号数据
        selectObj: null, // 表格选中数据
        selectNameList: [
          { title: "version", value: "version" },
          { title: "location", value: "location" },
          { title: "unit", value: "unit" },
        ], //搜索项列表
        req: {
          selectName: "version", //搜索项
          queryName: "", //搜索名称
          id: '', // 主键Id
          partNO: '',// 成品料号
          itemPartId: '',// 主料号
          processId: null,// 制程
          itemAVLId: '',// 替代料
          version: '',// 版本
          location: '',// 位号
          rulesId: '',// 条码规则
          qty: '',// 用量
          unit: '',// 单位
          remark: '',// 描述
          enabled: -1, // 是否有效 -1:所有 0:无效 1:有效
          ...this.$config.pageConfig
        },
        submitData: {
          id: '', // 主键Id
          partNO: '',// 成品料号
          itemPartId: '',// 主料号
          processId: null,// 制程
          itemAVLId: '',// 替代料
          version: '',// 版本
          location: '',// 位号
          rulesId: '',// 条码规则
          qty: 0,// 用量
          unit: '',// 单位
          remark: '',//描述
          sortCode: 0,//排序码
          enabled: 1//是否有效
        },
        // 验证实体
        ruleValidate: {
          partNO: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('partNO')}`, trigger: 'change'}],
          location: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('location')}`, trigger: 'blur'}],
        },
        btnData: []
      }
    },
    mounted() {
      getButtonBoolean(this, this.btnData)
      this.getZoneData()
      this.pageLoad()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true
        let {id, partNO, itemPartId, processId, itemAVLId, remark, enabled} = this.req
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {id, partNO, itemPartId, processId: processId || '', itemAVLId,
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
      // 获取制程数据
      getZoneData() {
        const obj = {systemFlag: this.req.systemFlag, id: "", parentId: "0", name: "", category: 0, enabled: 1,};
        getlisttreeReq(obj).then(res => {
          if (res.code === 200) {
            let data = res.result ? res.result : []
            this.zoneData = []
            this.initTreeData(this.zoneData, data)
          }
        })
      },
      // 初始化树型数据
      initTreeData(list, data) {
        for (let item of data) {
          let node = {
            id: item.id,
            label: item.name
          }
          if (item.category === 0) node.children = []
          if (hasChild(item)) this.initTreeData(node.children, item.children)
          list.push(node)
        }
      },
      // 制程选择操作
      zoneInput(value) {
        this.submitData.processId = value || null
      },
      zoneInputSearch(value) {
        this.req.processId = value || null
      },
      // 获取替代料号数据
      async getPartDataHandle(query = '', name) {
        if (query !== '') {
          if (this[`timeOut${name}`]) clearTimeout(this[`timeOut${name}`])
          this[`timeOut${name}`] = await setTimeout(async () => {
            const obj = {
              orderField: 'CREATEDATE', // 排序字段
              ascending: true, // 是否升序
              pageSize: 50, // 分页大小
              pageIndex: 1, // 当前页码
              data: {pn: query.trim(), enabled: 1}
            }
            this.loadingPart = true
            await getpartlistReq(obj).then(res => {
              this.loadingPart = false
              if (res.code === 200) {
                this[`partData${name}`] = res.result.data ? res.result.data : []
              }
            })
          }, this.timeOutValue);
        } else this[`partData${name}`] = []
      },
      // 点击搜索按钮触发
      locationBlur() {
        let locationValue = this.submitData.location || ''
        let qty = this.submitData.qty || 0
        this.isSubmit = locationValue.split(',').length === qty
        if (!this.isSubmit) this.$Message.error(this.$t('ebomAvlLocation'))
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
          let {id, partNO, itemPartId, processId, itemAVLId, version, location, qty, unit, remark, sortCode, enabled} = this.selectObj;
          this.submitData = {id, partNO, itemPartId, processId, itemAVLId, version, location, qty, unit, remark, sortCode, enabled};
          this.drawerFlag = true;
          this.isAdd = false;
          this.drawerTitle = this.$t("edit");
        } else this.$Message.warning(this.$t("oneData"));
      },
      //提交
      submitClick(isClose = false) {
        this.$refs.submitReq.validate((validate) => {
          if (validate) {
            this.locationBlur()
            if (!this.isSubmit) return false
            let trimArr = ['version', 'location', 'unit']
            trimArr.forEach(o => {
              this.submitData[o] = this.submitData[o] ? this.submitData[o].trim() : ''
            })
            let obj = { ...this.submitData, processId: this.submitData.processId || '' };
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
        let {id, partNO, itemPartId, processId, itemAVLId,  remark, enabled} = this.req
        exportReq({id, partNO, itemPartId, processId: processId || '', itemAVLId,
          [this.req.selectName]: this.req.queryName.trim(),
          remark, enabled}).then(res => {
          let blob = new Blob([res], {type: "application/vnd.ms-excel"})
          const fileName = `${this.$t('ebom')}${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xlsx` // 自定义文件名
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
