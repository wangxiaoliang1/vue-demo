<template>
  <div class="page-style">
    <!-- 编辑规则 -->
    <Modal
      class-name="page-style-modal"
      v-model="modalFlag"
      :styles="{ top: '20px' }"
      :title="modalTitle"
      :width="700"
      :mask-closable="false"
      :scrollable="true"
      @on-cancel="modalCancel"
    >
      <div class="transfer_con">
        <Transfer
          filterable
          :data="transferData"
          :target-keys="targetKeys"
          :list-style="listStyle"
          @on-change="transferChange"
        >
        </Transfer>
      </div>

      <div slot="footer">
        <Button @click="modalCancel">{{ $t("cancel") }}</Button>
        <Button type="primary" @click="partMasterSubmit">{{ $t("ok") }}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer
      v-model="drawerFlag"
      :title="drawerTitle"
      width="520"
      :mask-closable="false"
      @on-close="cancelClick"
    >
      <Form
        ref="submitReq"
        :model="submitData"
        :rules="ruleValidate"
        :label-width="90"
        :label-colon="true"
      >
        <!-- 机种名称 -->
        <FormItem :label="$t('modelName')" prop="modelName">
          <Input
            v-model="submitData.modelName"
            :placeholder="$t('pleaseEnter') + $t('modelName')"
          />
        </FormItem>
        <!-- 机种类型 -->
        <FormItem :label="$t('modelType')" prop="modelType">
          <Select
            clearable
            v-model="submitData.modelType"
            :placeholder="$t('pleaseSelect') + $t('modelType')"
          >
            <Option v-for="(item, i) in modelTypeData" :key="i" :value="item.detailCode">{{
              item.detailName
            }}</Option>
          </Select>
        </FormItem>
        <!-- 描述1 -->
        <FormItem :label="$t('desc1')" prop="desc1">
          <Input v-model="submitData.desc1" :placeholder="$t('pleaseEnter') + $t('desc1')" />
        </FormItem>
        <!-- 描述2 -->
        <FormItem :label="$t('desc2')" prop="desc2">
          <Input v-model="submitData.desc2" :placeholder="$t('pleaseEnter') + $t('desc2')" />
        </FormItem>
        <!-- 客户 -->
        <FormItem :label="$t('custom')" prop="custom">
          <Select
            v-model="submitData.custom"
            clearable
            filterable
            :placeholder="$t('pleaseSelect') + $t('custom')"
          >
            <Option v-for="(item, i) in customData" :value="item.id" :key="i">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
        <!-- 抽检计划 -->
        <!-- <FormItem :label="$t('sampingId')" prop="sampingId">
          <Input
            v-model="submitData.sampingId"
            :placeholder="$t('pleaseEnter') + $t('sampingId')"
          />
        </FormItem> -->
        <!-- 条码规则集合 -->
        <FormItem :label="$t('rulesId')" prop="rulesId">
          <Select
            v-model="submitData.rulesId"
            clearable
            filterable
            :placeholder="$t('pleaseSelect') + $t('rulesId')"
          >
            <Option v-for="(item, i) in codesetData" :value="item.id" :key="i">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
        <!-- 预设流程 -->
        <FormItem :label="$t('routeId')" prop="routeId">
          <Select
            v-model="submitData.routeId"
            clearable
            filterable
            :placeholder="$t('pleaseSelect') + $t('routeId')"
          >
            <Option v-for="(item, i) in wfRouteData" :value="item.id" :key="i">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
        <!-- 包装规格 -->
        <FormItem :label="$t('pageRuleId')" prop="pageRuleId">
          <Select
            v-model="submitData.pageRuleId"
            clearable
            filterable
            :placeholder="$t('pleaseSelect') + $t('pageRuleId')"
          >
            <Option v-for="(item, i) in packingData" :value="item.id" :key="i">{{
              item.packingMethod
            }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled">
          <i-switch size="large" v-model="submitData.enabled" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("open") }}</span>
            <span slot="close">{{ $t("close") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark">
          <Input v-model="submitData.remark" :placeholder="$t('pleaseEnter') + $t('remark')" />
        </FormItem>
        <!-- 按钮 -->
        <FormItem>
          <drawer-button
            :isAdd="isAdd"
            @on-cancel="cancelClick"
            @on-ok="submitClick"
            @on-update="submitClick"
            @on-okOrUpdate="submitClick(true)"
          ></drawer-button>
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
                  <Select class="query_more_select" v-model="req.selectName">
                    <Option
                      v-for="(item, index) in selectNameList"
                      :value="item.value"
                      :key="index"
                      >{{ $t(item.title) }}</Option
                    >
                  </Select>
                </FormItem>
                <FormItem>
                  <Input
                    search
                    enter-button
                    v-model="req.queryName"
                    @on-search="searchClick"
                    :placeholder="$t('pleaseEnter') + $t('keyWords')"
                  />
                </FormItem>
              </Form>
            </i-col>
            <i-col span="12">
              <button-custom
                :btnData="btnData"
                @on-add-click="addClick"
                @on-edit-click="editClick"
                @on-export-click="exportClick"
                @on-editPartNo-click="editPartNoClick"
              ></button-custom>
            </i-col>
          </Row>
        </div>
        <table-custom
          :tableHeight="tableHeight"
          :tableLoading="tableLoading"
          :columns="columns"
          :data="data"
          @on-current-change="currentClick"
          @on-sort-change="sortChange"
          @on-expand="expandChange"
        ></table-custom>
        <page-custom
          :total="req.total"
          :totalPage="req.totalPage"
          :pageIndex="req.pageIndex"
          :page-size="req.pageSize"
          @on-change="pageChange"
          @on-page-size-change="pageSizeChange"
        />
      </Card>
    </div>
  </div>
</template>

<script>
import {
  getpagelistReq,
  addReq,
  modifyReq,
  exportReq,
  getentityReq,
} from "@/api/basis-info/model-manager";
import { getlistReq } from "@/api/system-manager/data-item";
import { getlistReq as getCustomerlistReq } from "@/api/system-manager/customer-vendor";
import { getlistReq as getCodesetlistReq } from "@/api/system-manager/code-set";
import { getlistReq as getWfRoutelistReq } from "@/api/flow-manager/wf-route";
import { getlistReq as getPackinglistReq } from "@/api/basis-info/packing-specification";
import { getlistReq as getPartMasterlistReq, modifymodelidReq } from "@/api/basis-info/part-master";
import { formatDate, getButtonBoolean, errorType, exportFile } from "@/libs/tools";
import ButtonCustom from "@/components/button-custom";
import DrawerButton from "@/components/drawer-button";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";

export default {
  name: "model-manager",
  components: { ButtonCustom, DrawerButton, TableCustom, PageCustom },
  data() {
    return {
      tablekey: 0,
      modalFlag: false,
      modalTitle: this.$t("editPartNo"),
      split: 0.15,
      drawerFlag: false,
      isAdd: true,
      drawerTitle: this.$t("add"),
      tableHeight: 200,
      tableLoading: true, // table加载动画
      selectObj: null, // 表格选中数据
      data: [], // 表格数据
      btnData: [],
      columns: [
        {
          type: "expand",
          width: 50,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  padding: "5px 0 5px 50px",
                  backgroundColor: "#fff",
                },
              },
              [
                h("Table", {
                  props: {
                    border: true,
                    columns: this.columns1,
                    data: this.data[params.index].children || [],
                    tablekey: this.tablekey,
                  },
                }),
              ]
            );
          },
        },
        {
          type: "index",
          width: 50,
          align: "center",
          indexMethod: (row) => {
            return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1;
          },
        },
        { title: this.$t("modelName"), key: "modelName", sortable: "custom" },
        { title: this.$t("modelType"), key: "modelType" },
        { title: this.$t("desc1"), key: "desc1" },
        { title: this.$t("desc2"), key: "desc2" },
        { title: this.$t("custom"), key: "custom" },
        // { title: this.$t("sampingId"), key: "samping" },
        { title: this.$t("rulesId"), key: "rules" },
        { title: this.$t("routeId"), key: "route" },
        { title: this.$t("pageRuleId"), key: "pageRule" },
        // { title: this.$t("remark"), key: "remark" },
        // {
        //   title: this.$t("enabled"),
        //   key: "enabled",
        //   width: 70,
        //   render: (h, params) => {
        //     return renderSpan(this, h, params.row.enabled);
        //   },
        // },
        // {
        //   title: this.$t("createDate"),
        //   key: "createDate",
        //   width: 125,
        //   render: (h, params) => {
        //     return h(
        //       "div",
        //       params.row.createDate
        //         ? formatDate(params.row.createDate, "yyyy-MM-dd hh:mm:ss")
        //         : null
        //     );
        //   },
        // },
        // {
        //   title: this.$t("modifyDate"),
        //   key: "modifyDate",
        //   width: 125,
        //   render: (h, params) => {
        //     return h(
        //       "div",
        //       params.row.modifyDate
        //         ? formatDate(params.row.modifyDate, "yyyy-MM-dd hh:mm:ss")
        //         : null
        //     );
        //   },
        // },
      ], // 表格数据
      columns1: [
        {
          type: "index",
          width: 50,
          align: "center",
          fixed: "left",
          indexMethod: (row) => {
            return row._index + 1;
          },
        },
        {
          title: this.$t("pn"),
          key: "pn",
          width: 120,
        },
        {
          title: this.$t("partType"),
          key: "partType",
          width: 120,
        },
        {
          title: this.$t("desc1"),
          key: "desc1",
        },
        {
          title: this.$t("desc2"),
          key: "desc2",
        },
      ],
      selectNameList: [
        { title: "modelName", value: "modelName" },
        { title: "modelType", value: "modelType" },
        { title: "desc1", value: "desc1" },
        { title: "desc2", value: "desc2" },
        { title: "custom", value: "custom" },
        { title: "rulesId", value: "rules" },
        { title: "routeId", value: "route" },
        { title: "pageRuleId", value: "pageRule" },
      ], //搜索项列表
      req: {
        selectName: "modelName", //搜索项
        queryName: "", //搜索名称
        ...this.$config.pageConfig,
      }, //查询数据
      submitData: {
        id: "",
        modelName: "", //机种名称
        modelType: "", //机种类型
        desc1: "", //规格1
        desc2: "", //规格2
        custom: "", //客户ID
        sampingId: "", //抽检计划ID
        rulesId: "", //条码规则集合ID
        routeId: "", //预设流程ID
        pageRuleId: "", //包装规格
        enabled: 1, // 1有效 0无效
        remark: "", // 描述
      },
      // 验证实体
      ruleValidate: {
        modelName: [
          { required: true, message: this.$t("pleaseEnter") + this.$t("name"), trigger: "change" },
        ],
      },
      transferData: [], //穿梭框数据源
      targetKeys: [], //穿梭框已选数据
      listStyle: {
        width: "300px",
        height: "300px",
      },
      modelTypeData: [], //机种类型
      customData: [], // 厂商客户数据
      codesetData: [], //条码规则集合
      wfRouteData: [], //预设流程
      packingData: [], //包装规格
    };
  },
  mounted() {
    this.req.orderField = "modelName";
    this.pageLoad();
    this.initData();
    getButtonBoolean(this, this.btnData);
    this.autoSize();
    window.onresize = () => this.autoSize();
  },
  methods: {
    // 获取分页列表数据
    pageLoad() {
      this.tableLoading = true;
      const obj = {
        orderField: this.req.orderField, // 排序字段
        ascending: this.req.ascending, // 是否升序
        pageSize: this.req.pageSize, // 分页大小
        pageIndex: this.req.pageIndex, // 当前页码
        data: {
          [this.req.selectName]: this.req.queryName.trim(),
          enabled: -1,
        },
      };
      getpagelistReq(obj)
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            let { data, pageSize, pageIndex, total, totalPage } = res.result;
            this.req = { ...this.req, pageSize, pageIndex, total, totalPage };
            this.data = data || [];
          }
        })
        .catch(() => (this.tableLoading = false));
    },
    //编辑机种时获取机种实体
    getentity(id) {
      getentityReq({ Id: id }).then((res) => {
        if (res.code === 200) {
          let result = res.result || {};
          let {
            id,
            modelName,
            modelType,
            desc1,
            desc2,
            custom,
            sampingId,
            rulesId,
            routeId,
            pageRuleId,
            remark,
            enabled,
          } = result;
          this.submitData = {
            id,
            modelName,
            modelType,
            desc1,
            desc2,
            custom,
            sampingId,
            rulesId,
            routeId,
            pageRuleId,
            remark,
            enabled,
          };
          this.drawerFlag = true;
          this.isAdd = false;
          this.drawerTitle = this.$t("edit");
        }
      });
    },
    //获取已关联的料号列表
    getPartNoList(id) {
      let obj = {
        modelId: id,
        enabled: 1,
      };
      getPartMasterlistReq(obj).then((res) => {
        this.tableLoading = false;
        if (res.code === 200) {
          this.data.forEach((item) => {
            if (item.id === id) {
              let result = res.result || [];
              item.children = result;
              this.targetKeys = result.map((o) => o.id);
            }
          });
          ++this.tablekey;
        }
      });
    },

    //获取穿梭框料号数据源
    getPartMasterlist() {
      this.tableLoading = true;
      getPartMasterlistReq({ enabled: 1 })
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            let result = res.result || [];
            this.transferData = result.map((item) => {
              return { key: item.id, label: item.pn };
            });
          }
        })
        .catch(() => (this.tableLoading = false));
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
        this.getentity(this.selectObj.id);
      } else this.$Message.warning(this.$t("oneData"));
    },
    //提交
    submitClick(isClose = false) {
      this.$refs.submitReq.validate((validate) => {
        if (validate) {
          let obj = { ...this.submitData, modelName: this.submitData.modelName.trim() };
          let request = this.isAdd ? addReq(obj) : modifyReq(obj);
          request.then((res) => {
            if (res.code === 200) {
              this.selectObj = null;
              this.$Message.success(`${this.drawerTitle}${this.$t("success")}`);
              this.pageLoad();
              if (isClose) this.cancelClick();
            } else
              this.$Message.error(
                `${this.drawerTitle}${this.$t("fail")},${errorType(this, res.errorCode)}`
              );
          });
        }
      });
    },
    // 导出
    exportClick() {
      const obj = {
        [this.req.selectName]: this.req.queryName.trim(),
        enabled: -1,
      };
      exportReq(obj).then((res) => {
        let blob = new Blob([res], { type: "application/vnd.ms-excel" });
        const fileName = `${this.$t("model-manager")}${formatDate(
          new Date(),
          "yyyy-MM-dd hh:mm:ss"
        )}.xlsx`; // 自定义文件名
        exportFile(blob, fileName);
      });
    },
    // 点击编辑料号按钮触发
    editPartNoClick() {
      if (this.selectObj) {
        this.getPartMasterlist();
        this.getPartNoList(this.selectObj.id);
        this.modalFlag = true;
      } else this.$Message.warning(this.$t("oneData"));
    },
    // 编辑规则弹窗取消
    modalCancel() {
      this.modalFlag = false;
    },

    // 编辑料号提交
    partMasterSubmit() {
      let obj = {
        partMasterIds: this.targetKeys, //料号ID
        modelId: this.selectObj.id, //机种Id
        enabled: 1,
      };
      modifymodelidReq(obj).then((res) => {
        if (res.code === 200) {
          this.selectObj = null;
          this.$Message.success(`${this.modalTitle}${this.$t("success")}`);
          this.modalCancel();
          this.pageLoad();
        } else
          this.$Message.error(
            `${this.modalTitle}${this.$t("fail")},${errorType(this, res.errorCode)}`
          );
      });
    },
    //多级table展开或收起
    expandChange(row, status) {
      if (status) {
        this.getPartNoList(row.id);
      }
    },
    //穿梭框change
    transferChange(newTargetKeys) {
      this.targetKeys = newTargetKeys;
    },
    //初始化数据
    initData() {
      this.getDataItemData();
      // 获取客户厂商数据
      getCustomerlistReq({ category: 2, enabled: 1 }).then((res) => {
        if (res.code === 200) {
          this.customData = res.result ? res.result : [];
        }
      });
      //获取规则集合数据
      getCodesetlistReq({ enabled: 1 }).then((res) => {
        if (res.code === 200) {
          this.codesetData = res.result ? res.result : [];
        }
      });
      //预设流程数据
      getWfRoutelistReq({ enabled: 1 }).then((res) => {
        if (res.code === 200) {
          this.wfRouteData = res.result ? res.result : [];
        }
      });
      //包装规格数据
      getPackinglistReq({ enabled: 1 }).then((res) => {
        if (res.code === 200) {
          this.packingData = res.result ? res.result : [];
        }
      });
    },

    async getDataItemData() {
      this.modelTypeData = await this.getDataItemDetailList("ModelType");
    },
    // 获取字典数据
    async getDataItemDetailList(itemCode) {
      let arr = [];
      await getlistReq({ itemCode, enabled: 1 }).then((res) => {
        if (res.code === 200) arr = res.result || [];
      });
      return arr;
    },

    // 点击搜索按钮触发
    searchClick() {
      this.req.pageIndex = 1;
      this.pageLoad();
    },
    // 左侧抽屉取消
    cancelClick() {
      this.drawerFlag = false;
      this.$refs.submitReq.resetFields(); //清除表单红色提示
      this.submitData.id = "";
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
