<template>
  <div class="page-style">
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
        <!-- 工单ID -->
        <FormItem :label="$t('workOrder')" prop="workOrder">
          <Select
            v-model="submitData.workOrder"
            clearable
            filterable
            filter-by-label
            :placeholder="$t('pleaseSelect') + $t('workOrder')"
          >
            <Option v-for="(item, i) in workOrderData" :value="item.workOrder" :key="i">{{
              item.workOrder
            }}</Option>
          </Select>
        </FormItem>
        <!-- 成品料号 -->
        <FormItem :label="$t('partId')" prop="partId">
          <Select
            v-model="submitData.partId"
            clearable
            filterable
            remote
            :remote-method="
              (e) => {
                if (selectObj) {
                  if (e.trim() !== selectObj.partName) {
                    remoteMethod(e, 'partData');
                  }
                } else {
                  remoteMethod(e, 'partData');
                }
              }
            "
            :loading="loading"
            :placeholder="$t('pleaseEnter') + $t('partId')"
          >
            <Option v-for="(item, index) in partData" :value="item.id" :key="index">
              {{ item.pn }}
            </Option>
          </Select>
        </FormItem>
        <!-- 主料号 -->
        <FormItem :label="$t('itemPartId')" prop="itemPartId">
          <Select
            v-model="submitData.itemPartId"
            clearable
            filterable
            remote
            :remote-method="
              (e) => {
                if (selectObj) {
                  if (e.trim() !== selectObj.itemPartName) {
                    remoteMethod(e, 'itemPartData');
                  }
                } else {
                  remoteMethod(e, 'itemPartData');
                }
              }
            "
            :loading="loading"
            :placeholder="$t('pleaseEnter') + $t('itemPartId')"
          >
            <Option v-for="(item, index) in itemPartData" :value="item.id" :key="index">
              {{ item.pn }}
            </Option>
          </Select>
        </FormItem>

        <!-- 替代料 -->
        <FormItem :label="$t('itemAVLId')" prop="itemAVLId">
          <Select
            v-model="submitData.itemAVLId"
            clearable
            filterable
            remote
            :remote-method="
              (e) => {
                if (selectObj) {
                  if (e.trim() !== selectObj.itemAVLName) {
                    remoteMethod(e, 'itemAVLData');
                  }
                } else {
                  remoteMethod(e, 'itemAVLData');
                }
              }
            "
            :loading="loading"
            :placeholder="$t('pleaseEnter') + $t('itemAVLId')"
          >
            <Option
              v-for="(item, index) in itemAVLData"
              :value="item.id"
              :key="index"
              :label="item.pn"
            >
              {{ item.pn }}
            </Option>
          </Select>
        </FormItem>
        <!-- 制程 -->
        <FormItem :label="$t('processId')" prop="processId">
          <treeselect
            v-model="submitData.processId"
            :options="zoneData"
            :disable-branch-nodes="true"
            :showCount="true"
            :placeholder="$t('pleaseSelect') + $t('processId')"
          />
        </FormItem>
        <!-- 用量 -->
        <FormItem :label="$t('qty')" prop="qty">
          <InputNumber
            style="width:100%"
            :min="0"
            v-model="submitData.qty"
            @input="qtyInput"
            :placeholder="$t('pleaseEnter') + $t('qty')"
          ></InputNumber>
        </FormItem>
        <!-- 单位 -->
        <FormItem :label="$t('unit')" prop="unit">
          <Input v-model="submitData.unit" :placeholder="$t('pleaseEnter') + $t('unit')" />
        </FormItem>
        <!-- 位号 -->
        <FormItem :label="$t('location')" prop="location">
          <Input
            v-model="submitData.location"
            :placeholder="$t('pleaseEnter') + $t('location')"
          />
        </FormItem>
        <!-- 版本 -->
        <FormItem :label="$t('version')" prop="version">
          <Input v-model="submitData.version" :placeholder="$t('pleaseEnter') + $t('version')" />
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
import { getpagelistReq, addReq, modifyReq, exportReq } from "@/api/basis-info/workorder-bom";
import {
  formatDate,
  getButtonBoolean,
  errorType,
  renderSpan,
  exportFile,
  isLocationAndQtyOk,
} from "@/libs/tools";
import { hasChild } from "@/libs/utils";
import { getpagelistReq as getPartMasterlistReq } from "@/api/basis-info/part-master";
import { getlisttreeReq } from "@/api/flow-manager/zone-manage";
import { getlistReq as getOrderlistReq } from "@/api/material-manager/order-info";
import ButtonCustom from "@/components/button-custom";
import DrawerButton from "@/components/drawer-button";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";
import Treeselect from "@riophae/vue-treeselect";

export default {
  name: "workorder-bom",
  components: { ButtonCustom, DrawerButton, TableCustom, PageCustom, Treeselect },
  data() {
    return {
      timeOut: null,
      loading: false,
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
          type: "index",
          width: 50,
          align: "center",
          fixed: "left",
          indexMethod: (row) => {
            return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1;
          },
        },
        {
          title: this.$t("workOrder"),
          key: "workOrder",
          sortable: "custom",
          width: 120,
          fixed: "left",
        },
        { title: this.$t("partId"), key: "partName", width: 120 },
        { title: this.$t("itemPartId"), key: "itemPartName", width: 120 },
        { title: this.$t("itemAVLId"), key: "itemAVLName", width: 120 },
        { title: this.$t("processId"), key: "processName", width: 120 },
        { title: this.$t("qty"), key: "qty", width: 60 },
        { title: this.$t("unit"), key: "unit", width: 60 },
        { title: this.$t("location"), key: "location", width: 120 },
        { title: this.$t("version"), key: "version", width: 60 },
        { title: this.$t("remark"), key: "remark", width: 60 },
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
            return h(
              "div",
              params.row.createDate
                ? formatDate(params.row.createDate, "yyyy-MM-dd hh:mm:ss")
                : null
            );
          },
        },
        {
          title: this.$t("modifyDate"),
          key: "modifyDate",
          width: 125,
          render: (h, params) => {
            return h(
              "div",
              params.row.modifyDate
                ? formatDate(params.row.modifyDate, "yyyy-MM-dd hh:mm:ss")
                : null
            );
          },
        },
      ], // 表格数据
      selectNameList: [
        { title: "workOrder", value: "workOrder" },
        { title: "partId", value: "partId" },
        { title: "itemPartId", value: "itemPartId" },
        { title: "itemAVLId", value: "itemAVLId" },
        { title: "processId", value: "processId" },
        { title: "version", value: "version" },
      ], //搜索项列表
      req: {
        selectName: "workOrder", //搜索项
        queryName: "", //搜索名称
        ...this.$config.pageConfig,
      }, //查询数据
      submitData: {
        id: "",
        workOrder: "", //工单ID
        partId: "", //成品料号
        itemPartId: "", //主料号
        itemAVLId: "", //替代料
        processId: null, //制程
        qty: 0, //用量
        unit: "", //单位
        location: "", //位号
        version: "", //版本
        enabled: 1, // 1有效 0无效
        remark: "", //描述
      },
      // 验证实体
      ruleValidate: {
        workOrder: [
          {
            required: true,
            message: this.$t("pleaseSelect") + this.$t("workOrder"),
            trigger: "change",
          },
        ],
        partId: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("partId"),
            trigger: "change",
          },
        ],
        itemPartId: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("itemPartId"),
            trigger: "change",
          },
        ],
        itemAVLId: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("itemAVLId"),
            trigger: "change",
          },
        ],
        qty: [
          {
            type: "number",
            required: true,
            message: this.$t("pleaseEnter") + this.$t("qty"),
            trigger: "change",
          },
        ],
        location: [
          {
            required: true,
            validator: (rule, value, callback) => {
              isLocationAndQtyOk(rule, value, callback, this);
            },
            trigger: "change",
          },
        ],
      },
      workOrderData: [], //工单列表
      partData: [], //成品料号列表
      itemPartData: [], //主料号列表
      itemAVLData: [], //替代料列表
      zoneData: [], //制程列表
      partDataTimeOut: null,
      itemPartDataTimeOut: null,
      itemAVLDataTimeOut: null,
    };
  },
  mounted() {
    this.req.orderField = "workOrder";
    this.pageLoad();
    this.initData();
    getButtonBoolean(this, this.btnData);
    this.autoSize();
    window.onresize = () => this.autoSize();
  },
  methods: {

    qtyInput() {
      this.$refs.submitReq.validateField('location')
    },
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
    //初始化数据
    initData() {
      //获取工单列表
      getOrderlistReq({ enabled: 1 }).then((res) => {
        if (res.code === 200) {
          this.workOrderData = res.result || [];
        }
      });
      // 获取制程列表
      let obj = { parentId: "0", category: 0, enabled: 1 };
      getlisttreeReq(obj).then((res) => {
        if (res.code === 200) {
          this.zoneData = [];
          this.initMenuNode(this.zoneData, res.result);
        }
      });
    },
    // 处理获取的制程数据
    initMenuNode(list, data) {
      for (let item of data) {
        let node = {
          id: item.id,
          label: item.name,
        };
        if (item.category == 0) {
          node.children = [];
        }
        if (hasChild(item)) {
          node.children = [];
          this.initMenuNode(node.children, item.children);
        }
        list.push(node);
      }
    },
    //远程搜索料号
    remoteMethod(query, dataName) {
      if (query.trim() !== "") {
        this.loading = true;
        if (this[dataName + "TimeOut"]) {
          clearTimeout(this[dataName + "TimeOut"]);
        }
        this[dataName + "TimeOut"] = setTimeout(() => {
          const obj = {
            orderField: "CREATEDATE", // 排序字段
            ascending: true, // 是否升序
            pageSize: 50, // 分页大小
            pageIndex: 1, // 当前页码
            data: { pn: query.trim(), enabled: 1 },
          };
          getPartMasterlistReq(obj).then((res) => {
            this.loading = false;
            if (res.code === 200) {
              this[dataName] = res.result.data || [];
            }
          });
        }, 500);
      } else {
        this[dataName] = [];
      }
    },
    // 点击新增按钮触发
    addClick() {
      this.partData = []; //成品料号列表
      this.itemPartData = []; //主料号列表
      this.itemAVLData = []; //替代料列表
      this.drawerFlag = true;
      this.isAdd = true;
      this.drawerTitle = this.$t("add");
    },
    // 点击编辑按钮触发
    editClick() {
      if (this.selectObj) {
        let {
          id,
          workOrder,
          partId,
          itemPartId,
          itemAVLId,
          processId,
          qty,
          unit,
          location,
          version,
          remark,
          enabled,
        } = this.selectObj;
        this.submitData = {
          id,
          workOrder,
          partId,
          itemPartId,
          itemAVLId,
          processId,
          qty,
          unit,
          location,
          version,
          remark,
          enabled,
        };

        this.drawerFlag = true;
        this.isAdd = false;
        this.drawerTitle = this.$t("edit");
      } else this.$Message.warning(this.$t("oneData"));
    },
    //提交
    submitClick(isClose = false) {
      this.$refs.submitReq.validate((validate) => {
        if (validate) {
          let request = this.isAdd ? addReq(this.submitData) : modifyReq(this.submitData);
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
        const fileName = `${this.$t("workorder-bom")}${formatDate(
          new Date(),
          "yyyy-MM-dd hh:mm:ss"
        )}.xlsx`; // 自定义文件名
        exportFile(blob, fileName);
      });
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
