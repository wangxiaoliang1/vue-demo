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
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true">
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="req.name" :placeholder="$t('pleaseEnter') + $t('name')" />
        </FormItem>
        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="req.sortCode" :min="0"></InputNumber>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled" v-if="!isAdd">
          <i-switch size="large" v-model="req.enabled">
            <span slot="open">{{ $t("open") }}</span>
            <span slot="close">{{ $t("close") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark">
          <Input v-model="req.remark" :placeholder="$t('pleaseEnter') + $t('remark')" />
        </FormItem>

        <!-- 按钮 -->
        <FormItem>
          <drawer-button
            :isAdd="isAdd"
            @on-cancel="cancelClick"
            @on-ok="okClick"
            @on-update="updateClick"
            @on-okOrUpdate="okOrUpdateClick"
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
                  <Input
                    search
                    enter-button
                    v-model="req.queryName"
                    @on-search="searchClick"
                    :placeholder="$t('pleaseEnter') + $t('name')"
                  />
                </FormItem>
              </Form>
            </i-col>
            <i-col span="12">
              <button-custom
                :btnData="btnData"
                @on-add-click="addClick"
                @on-edit-click="editClick"
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
import { getpagelistReq, addReq, modifyReq } from "@/api/flow-manager/zone-category";
import { formatDate, getButtonBoolean, errorType, renderSpan } from "@/libs/tools";
import ButtonCustom from "@/components/button-custom";
import DrawerButton from "@/components/drawer-button";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";

export default {
  name: "zone-category",
  components: { ButtonCustom, DrawerButton, TableCustom, PageCustom },
  data() {
    return {
      split: 0.15,
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
      data: [], // 表格数据
      selectObj: null, // 表格选中数据
      req: {
        queryName: "",
        id: "0", // id
        name: "", // 名称
        sortCode: 0, // 排序码
        enabled: true, // 1有效 0无效
        remark: "", //描述
        ...this.$config.pageConfig,
      },
      // 验证实体
      ruleValidate: {
        name: [
          { required: true, message: this.$t("pleaseEnter") + this.$t("name"), trigger: "change" },
        ],
      },
      btnData: [],
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
          name: this.req.queryName.trim(),
          enabled: -1,
        },
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
    // 新增菜单、按钮
    okClick() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          let obj = {
            name: this.req.name.trim(),
            sortCode: this.req.sortCode,
            enabled: this.req.enabled ? 1 : 0,
            remark: this.req.remark,
          };
          addReq(obj).then((res) => {
            if (res.code === 200) {
              this.$Message.success(`${this.$t("add")}${this.$t("success")}`);
              this.pageLoad();
              if (this.isSuccess) this.cancelClick();
            } else
              this.$Message.error(
                `${this.$t("add")}${this.$t("fail")},${errorType(this, res.errorCode)}`
              );
          });
        }
      });
    },
    // 点击编辑按钮触发
    editClick() {
      if (this.selectObj) {
        const data = this.selectObj;
        this.req.id = data.id;
        this.req.name = data.name;
        this.req.remark = data.remark;
        this.req.sortCode = data.sortCode;
        this.req.enabled = data.enabled === 1;
        this.drawerFlag = true;
        this.isAdd = false;
        this.drawerTitle = this.$t("edit");
      } else this.$Message.warning(this.$t("oneData"));
    },
    // 修改菜单、按钮
    updateClick() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          let obj = {
            id: this.req.id,
            name: this.req.name.trim(),
            remark: this.req.remark,
            sortCode: this.req.sortCode,
            enabled: this.req.enabled ? 1 : 0,
          };
          modifyReq(obj).then((res) => {
            if (res.code === 200) {
              this.selectObj = null;
              this.pageLoad();
              this.$Message.success(`${this.$t("edit")}${this.$t("success")}`);
              if (this.isSuccess) this.cancelClick();
            } else
              this.$Message.error(
                `${this.$t("edit")}${this.$t("fail")},${errorType(this, res.errorCode)}`
              );
          });
        }
      });
    },
    // 点击新增或修改并关闭按钮触发
    okOrUpdateClick() {
      this.isSuccess = true;
      this.isAdd ? this.okClick() : this.updateClick();
    },
    // 左侧抽屉取消
    cancelClick() {
      this.drawerFlag = false;
      this.isSuccess = false;
      this.$refs.req.resetFields(); //清除表单红色提示
      this.req.id = "0";
      this.req.name = "";
      this.req.remark = "";
      this.req.sortCode = 0;
      this.req.enabled = true;
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
