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
          :render-format="transferRender"
          @on-change="transferChange"
        >
        </Transfer>
      </div>

      <div slot="footer">
        <Button @click="modalCancel">{{ $t("cancel") }}</Button>
        <Button type="primary" @click="ruleSubmit">{{ $t("ok") }}</Button>
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
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="submitData.name" :placeholder="$t('pleaseEnter') + $t('name')" />
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
                @on-editRule-click="editRuleClick"
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
  getRuleListReq,
  addRuleReq,
} from "@/api/system-manager/code-set";
import { getlistReq as getOrderCodelistReq } from "@/api/system-manager/order-code";
import {
  formatDate,
  getButtonBoolean,
  errorType,
  renderSpan,
  exportFile,
  ordertCodeCategory,
} from "@/libs/tools";
import ButtonCustom from "@/components/button-custom";
import DrawerButton from "@/components/drawer-button";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";

export default {
  name: "code-set",
  components: { ButtonCustom, DrawerButton, TableCustom, PageCustom },
  data() {
    return {
      tablekey:0,
      modalFlag: false,
      modalTitle: this.$t("editRule"),
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
        { title: this.$t("name"), key: "name", sortable: "custom" },
        { title: this.$t("remark"), key: "remark" },
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
          title: this.$t("name"),
          key: "name",
        },
        {
          title: this.$t("code"),
          key: "encode",
        },
        {
          title: this.$t("category"),
          key: "category",
          render: (h, params) => {
            return h("div", ordertCodeCategory(params.row.category));
          },
        },
      ],
      selectNameList: [
        { title: "name", value: "name" },
        { title: "remark", value: "remark" },
      ], //搜索项列表
      req: {
        selectName: "name", //搜索项
        queryName: "", //搜索名称
        ...this.$config.pageConfig,
      }, //查询数据
      submitData: {
        id: "",
        name: "", //名称
        enabled: 1, // 1有效 0无效
        remark: "", // 描述
      },
      // 验证实体
      ruleValidate: {
        name: [
          { required: true, message: this.$t("pleaseEnter") + this.$t("name"), trigger: "change" },
        ],
      },
      transferData: [], //穿梭框数据源
      targetKeys: [], //穿梭框已选数据
      listStyle: {
        width: "300px",
        height: "300px",
      },
    };
  },
  mounted() {
    this.pageLoad();
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
    //多级table展开或收起
    expandChange(row, status) {
      if (status) {
        this.getRuleList(row);
      }
    },
    //获取规则列表
    getRuleList(row) {
      this.tableLoading = true;
      getRuleListReq({ id: row.id })
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            this.data.forEach((item) => {
              if (item.id === row.id) {
                let result = res.result || [];
                item.children = result;
                this.targetKeys = result.map((o) => o.id);
              }
            });
            ++this.tablekey;
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
        let { id, name, remark, enabled } = this.selectObj;
        this.submitData = { id, name, remark, enabled };
        this.drawerFlag = true;
        this.isAdd = false;
        this.drawerTitle = this.$t("edit");
      } else this.$Message.warning(this.$t("oneData"));
    },
    //提交
    submitClick(isClose = false) {
      this.$refs.submitReq.validate((validate) => {
        if (validate) {
          let obj = { ...this.submitData, name: this.submitData.name.trim() };
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
        const fileName = `${this.$t("code-set")}${formatDate(
          new Date(),
          "yyyy-MM-dd hh:mm:ss"
        )}.xlsx`; // 自定义文件名
        exportFile(blob, fileName);
      });
    },
    // 点击编辑规则按钮触发
    editRuleClick() {
      if (this.selectObj) {
        this.getOrderCodelist();
        this.getRuleList(this.selectObj);
        this.modalFlag = true;
      } else this.$Message.warning(this.$t("oneData"));
    },
    // 编辑规则弹窗取消
    modalCancel() {
      this.modalFlag = false;
    },
    //获取穿梭框数据源
    getOrderCodelist() {
      this.tableLoading = true;
      getOrderCodelistReq({enabled: 1})
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            let result = res.result || [];
            this.transferData = result.map((item) => {
              return { key: item.id, label: item.name, encode: item.encode };
            });
          }
        })
        .catch(() => (this.tableLoading = false));
    },
    // 编辑规则提交
    ruleSubmit() {
      let obj = {
        codeRuleId: this.targetKeys, //规则ID
        collectionId: this.selectObj.id, //规则集合Id
        enabled: 1,
      };
      addRuleReq(obj).then((res) => {
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
    //穿梭框change
    transferChange(newTargetKeys) {
      this.targetKeys = newTargetKeys;
    },
    //穿梭框重置显示值
    transferRender(item) {
      return item.label + " - " + item.encode;
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
<style lang="less" scoped>
.transfer_con {
  display: flex;
  justify-content: center;
}
</style>
