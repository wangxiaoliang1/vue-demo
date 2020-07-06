<template>
  <div class="page-style">
    <Modal class-name="page-style-modal flow-style-modal" v-model="modalFlag" fullscreen :mask="false"
           :mask-closable="false" :closable="false" @on-cancel="modalFlag = false" :ok-text="$t('submit')" @on-ok="modalOk">
      <flow-custom ref="flowRef" v-if="modalFlag" :options="flowObj" :list="flowData" :nameList="flowList"/>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="520" :mask-closable="false" @on-close="cancelClick">
      <Form ref="submitReq" :model="submitData" :rules="ruleValidate" :label-width="80" :label-colon="true">
        <FormItem :label="$t('code')" prop="enCode">
          <Input v-model="submitData.enCode" :placeholder="$t('pleaseEnter') + $t('code')"/>
        </FormItem>
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="submitData.name" :placeholder="$t('pleaseEnter') + $t('name')"/>
        </FormItem>
        <FormItem :label="$t('category')" prop="category">
          <Select v-model="submitData.category" :placeholder="$t('pleaseSelect') + $t('category')">
            <Option v-for="(item, i) in categoryData" :value="Number(item.detailCode)" :key="i">{{ item.detailName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('flowJson')" prop="json">
          <Button type="primary" @click="addFlow">{{submitData.json ? $t('flowEdit') : $t('flowAdd')}}</Button>
        </FormItem>
        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="submitData.sortCode" :min="0"></InputNumber>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled" v-if="!isAdd">
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
              <Form inline class="card-style-form" @submit.native.prevent :label-colon="true">
                <FormItem>
                  <Select class="query_more_select" v-model="req.selectName">
                    <Option v-for="(item, i) in selectList" :key="i" :value="item.value">{{$t(item.name)}}</Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="req.queryName" :placeholder="$t('pleaseEnter') + $t('name')"
                         @on-search="searchClick"/>
                </FormItem>
                <FormItem :label="$t('category')">
                  <Select class="query_more_select" v-model="req.category"
                          :placeholder="$t('pleaseSelect') + $t('category')">
                    <Option v-for="(item, i) in categoryData" :key="i" :value="Number(item.detailCode)">
                      {{item.detailName}}
                    </Option>
                  </Select>
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
  import {getpagelistReq, addReq, modifyReq, exportReq} from "@/api/flow-manager/wf-route";
  import {getlistReq} from "@/api/system-manager/data-item";
  import {getlisttreeReq} from "@/api/flow-manager/zone-manage";
  import {formatDate, getButtonBoolean, errorType, renderSpan, exportFile} from "@/libs/tools";
  import {hasChild} from "@/libs/utils";
  import ButtonCustom from "@/components/button-custom";
  import DrawerButton from "@/components/drawer-button";
  import TableCustom from "@/components/table-custom";
  import PageCustom from "@/components/page-custom";
  import FlowCustom from "@/components/flow-custom";

  export default {
    name: "wf-route",
    components: {ButtonCustom, DrawerButton, TableCustom, PageCustom, FlowCustom},
    data() {
      return {
        split: 0.15,
        modalFlag: false,
        modalTitle: this.$t('flowAdd'),
        drawerFlag: false,
        isSuccess: false,
        isAdd: true,
        drawerTitle: this.$t("add"),
        tableHeight: 200,
        tableLoading: true, // table加载动画
        columns: [
          {
            type: "index",
            width: 50,
            align: "center",
            indexMethod: (row) => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1;
            },
          },
          {title: this.$t("code"), key: "enCode", sortable: "custom"},
          {title: this.$t("name"), key: "name"},
          {
            title: this.$t("category"), key: "category",
            render: (h, params) => {
              let item = this.categoryData.find(o => Number(o.detailCode) === params.row.category)
              return h('span', item ? item.detailName : '');
            }
          },
          {title: this.$t("remark"), key: "remark"},
          {
            title: this.$t("enabled"),
            key: "enabled",
            width: 70,
            render: (h, params) => {
              return renderSpan(this, h, params.row.enabled);
            },
          },
          {
            title: this.$t("createDate"),
            key: "createDate",
            width: 125,
            render: (h, params) => {
              return h("div", params.row.createDate ? formatDate(params.row.createDate, "yyyy-MM-dd hh:mm:ss") : null);
            },
          },
          {
            title: this.$t("modifyDate"),
            key: "modifyDate",
            width: 125,
            render: (h, params) => {
              return h("div", params.row.modifyDate ? formatDate(params.row.modifyDate, "yyyy-MM-dd hh:mm:ss") : null);
            },
          },
        ], // 表格数据
        data: [], // 表格数据
        categoryData: [], // 类型数据
        flowData: {
          nodes: [],
          lines: []
        }, // 流程数据
        flowList: [], // 流程选择数据
        flowObj: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight - 63,
        },
        selectObj: null, // 表格选中数据
        selectList: [
          {value: 'name', name: 'name'},
          {value: 'enCode', name: 'code'},
        ], // 搜索条件下拉列表
        req: {
          queryName: "",
          selectName: "name",
          id: "", // id
          name: "", // 名称
          enCode: "", // 编码
          category: 0, // 类别
          enabled: -1, // 1有效 0无效 -1所有
          remark: "", //描述
          ...this.$config.pageConfig,
        },
        submitData: {
          id: '', // 主键Id
          enCode: '', // 流程编码
          name: '', // 流程名称
          category: 0, // 流程分类
          json: '', // 流程图Json字符串
          sortCode: 0, // 排序码
          enabled: 1, // 1有效 0无效
          remark: '', //描述
        },
        // 验证实体
        ruleValidate: {
          enCode: [{required: true, message: this.$t("pleaseEnter") + this.$t("code"), trigger: "blur"},],
          name: [{required: true, message: this.$t("pleaseEnter") + this.$t("name"), trigger: "blur"},],
          category: [{
            required: true,
            type: 'number',
            message: this.$t("pleaseEnter") + this.$t("category"),
            trigger: "change"
          },],
          json: [{required: true, message: this.$t("pleaseEnter") + this.$t("flowJson"), trigger: "change"},],
        },
        btnData: [],
      };
    },
    mounted() {
      getButtonBoolean(this, this.btnData);
      this.getDataItemData();
      this.pageLoad();
      this.autoSize();
      window.onresize = () => this.autoSize();
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true;
        let {id, category, selectName, queryName, enabled, remark, orderField, ascending, pageSize, pageIndex} = this.req
        const obj = {
          orderField, // 排序字段
          ascending, // 是否升序
          pageSize, // 分页大小
          pageIndex, // 当前页码
          data: {id, category, [selectName]: queryName.trim(), remark, enabled}
        };
        getpagelistReq(obj)
            .then((res) => {
              this.tableLoading = false;
              if (res.code === 200) {
                let data = res.result;
                this.data = data.data ? data.data : [];
                this.req.pageSize = data.pageSize;
                this.req.pageIndex = data.pageIndex;
                this.req.total = data.total;
                this.req.totalPage = data.totalPage;
              }
            })
            .catch(() => (this.tableLoading = false));
      },
      // 点击编码规则中的加号按钮触发
      async getDataItemData() {
        this.categoryData = await this.getDataItemDetailList('WFRoute')
      },
      async getDataItemDetailList(itemCode) {
        let arr = []
        await getlistReq({itemCode, enabled: 1}).then(res => {
          if (res.code === 200) arr = res.result || []
        })
        return arr
      },
      // 获取制程数据
      async getZoneData() {
        const obj = {systemFlag: this.req.systemFlag, id: "", parentId: "0", name: "", category: 0, enabled: 1,};
        await getlisttreeReq(obj).then(res => {
          if (res.code === 200) {
            let data = res.result ? res.result : []
            this.flowList = []
            this.initTreeData(this.flowList, data)
          }
        })
      },
      // 初始化树型数据
      initTreeData(list, data) {
        for (let item of data) {
          let node = {
            id: item.id,
            label: item.name,
          };
          if (item.category === 0) node.children = []
          if (hasChild(item)) this.initTreeData(node.children, item.children)
          list.push(node)
        }
      },
      // 打开流程弹窗
      async addFlow() {
        if (this.isAdd) this.modalTitle = this.$t('flowAdd')
        else {
          this.modalTitle = this.$t('flowEdit')
          const {nodes, edges} = this.submitData.json ? JSON.parse(this.submitData.json) : {nodes: [], edges: []}
          const node = nodes.map(o => {
            let color = ''
            if (o.flowMain && o.necessary) {
              color = '#ed4014'
            } else if (o.flowMain && !o.necessary) {
              color = '#19be6b'
            } else {
              color = '#990099'
            }
            return {
              ...o,
              style: {
                fill: color,
                fillOpacity: 0.5,
                stroke: color,
                radius: 6,
                cursor: 'pointer',
              },
            }
          })
          this.flowData = {nodes: node, edges}
        }
        await this.getZoneData()
        this.modalFlag = true
      },
      // 点击弹窗确定按钮触发
      modalOk() {
        const {nodes, edges} = this.$refs.flowRef.getFlowData()
        const flowData = {
          nodes: nodes.map(o => {
            const {id, labelId, label, type, nodeType, size, x, y, flowMain, necessary} = o
            return {id, labelId, label, type, nodeType, size, x, y, flowMain, necessary}
          }),
          edges: edges.map(o => {
            const {id, label, type, source, target} = o
            return {id, label, type, source, target}
          })
        }
        this.submitData.json = JSON.stringify(flowData)
        this.modalFlag = false
      },
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1;
        this.pageLoad();
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
          let {id, name, enCode, category, json, remark, sortCode, enabled} = this.selectObj;
          this.submitData = {id, name, enCode, category, json, remark, sortCode, enabled};
          this.drawerFlag = true;
          this.isAdd = false;
          this.drawerTitle = this.$t("edit");
        } else this.$Message.warning(this.$t("oneData"));
      },
      //提交
      submitClick(isClose = false) {
        this.$refs.submitReq.validate((validate) => {
          if (validate) {
            let trimArr = ['enCode', 'name']
            trimArr.forEach(o => {
              this.submitData[o] = this.submitData[o] ? this.submitData[o].trim() : ''
            })
            let obj = {...this.submitData};
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
        this.flowList = []
        this.flowData = {
          nodes: [],
          lines: []
        }
      },
      // 导出
      exportClick() {
        let {id, enCode, name, category, remark, enabled} = this.req
        exportReq({id, enCode, name, category, remark, enabled}).then(res => {
          let blob = new Blob([res], {type: "application/vnd.ms-excel"})
          const fileName = `${this.$t('wf-route')}${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xlsx` // 自定义文件名
          exportFile(blob, fileName)
        })
      },
      // 自动改变表格高度
      autoSize() {
        let height = document.body.clientHeight - 120;
        this.tableHeight = height - 60;
      },
      // 某一行高亮时触发
      currentClick(currentRow) {
        this.selectObj = currentRow;
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
    },
  };
</script>
