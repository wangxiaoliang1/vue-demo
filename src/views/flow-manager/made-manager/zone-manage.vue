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
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="90" :label-colon="true">
        <FormItem :label="$t('name')" prop="name">
          <Input
            v-model="req.name"
            :maxlength="maxLength"
            :placeholder="$t('pleaseEnter') + $t('name')"
          />
        </FormItem>
        <FormItem :label="$t('code')" prop="enCode">
          <Input
            v-model="req.enCode"
            :maxlength="maxLength"
            :placeholder="$t('pleaseEnter') + $t('enCode')"
          />
        </FormItem>
        <FormItem :label="$t('type')" prop="category">
          <RadioGroup v-model="req.category">
            <Radio :label="0" :disabled="!isAdd">{{ $t("zone") }}</Radio>
            <Radio :label="1" :disabled="!isAdd">{{ $t("process") }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('typeId')" prop="typeId" v-if="req.category === 1">
          <Select
            v-model="req.typeId"
            :clearable="true"
            :placeholder="$t('pleaseSelect') + $t('typeId')"
          >
            <Option v-for="(item, i) in typeIdList" :value="item.id" :key="i">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('parent')" prop="parentId" v-if="req.category === 1">
          <Select
            v-model="req.parentId"
            :clearable="true"
            :placeholder="$t('pleaseSelect') + $t('parent')"
          >
            <Option v-for="(item, i) in leftTreeData" :value="item.id" :key="i">{{
              item.title
            }}</Option>
          </Select>
        </FormItem>

        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="req.sortCode" :min="0"></InputNumber>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled">
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
      <Split v-model="split">
        <div slot="left" class="split-pane">
          <tree-custom
            :initData="leftTreeData"
            :treeLoading="treeLoading"
            @on-select-change="treeSelect"
          ></tree-custom>
        </div>
        <div slot="right" class="split-pane">
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
      </Split>
    </div>
  </div>
</template>

<script>
import {
  getlisttreeReq,
  getpagelistReq,
  modifyReq,
  getlistReq,
  addReq,
} from "@/api/flow-manager/zone-manage";
import {
  formatDate,
  getButtonBoolean,
  errorType,
  categoryType,
  getZoneIcon,
  renderSpan,
} from "@/libs/tools";
import { hasChild } from "@/libs/utils";
import TreeCustom from "@/components/tree-custom";
import ButtonCustom from "@/components/button-custom";
import DrawerButton from "@/components/drawer-button";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";

export default {
  name: "area-floor",
  components: { TreeCustom, ButtonCustom, DrawerButton, TableCustom, PageCustom },
  data() {
    return {
      split: 0.25,
      maxLength: 36,
      drawerFlag: false,
      isSuccess: false,
      isAdd: true,
      drawerTitle: this.$t("add"),
      leftTreeData: [], // 左侧树型源数据
      typeIdList: [], // 数据字典源数据
      treeLoading: true, // tree加载动画
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
        { title: this.$t("code"), key: "enCode" },
        {
          title: this.$t("type"),
          key: "category",
          render: (h, params) => {
            return h("div", categoryType(this, params.row.category));
          },
        },
        { title: this.$t("remark"), key: "remark" },
        {
          title: this.$t("enabled"),
          key: "enabled",
          width: 60,
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
      selectCategory: 0, // 选中类别
      req: {
        systemFlag: this.$store.state.systemFlag,
        id: "0",
        parentId: "",
        source: 1, // 1web 2app
        queryName: "",
        areaFloorId: "0",
        areaFloorParentId: "0",
        name: "", // 名称
        enCode: "", //编码
        sortCode: 0,
        category: 0, // 类型 0 区段 1 制程
        enabled: true, // 1有效 0无效
        remark: "", // 描述
        typeId: "",
        ...this.$config.pageConfig,
      },
      // 验证实体
      ruleValidate: {
        name: [
          {
            required: true,
            message: `${this.$t("pleaseEnter")}${this.$t("name")}`,
            trigger: "change",
          },
        ],
        typeId: [
          {
            required: true,
            message: `${this.$t("pleaseEnter")}${this.$t("typeId")}`,
            trigger: "change",
          },
        ],
        parentId: [
          {
            required: true,
            message: `${this.$t("pleaseEnter")}${this.$t("parent")}`,
            trigger: "change",
          },
        ],
      },
      btnData: [],
    };
  },
  mounted() {
    this.req.orderField = 'sortCode'
    this.getLeftMenu();
    this.getDataItemData();
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
          systemFlag: this.req.systemFlag,
          category: this.selectCategory,
          id: "",
          parentId: this.req.id,
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
    // 获取页面左侧菜单
    getLeftMenu() {
      this.treeLoading = true;
      const obj = {
        systemFlag: this.req.systemFlag,
        id: "",
        parentId: "0",
        name: "",
        category: 0,
        enabled: -1,
      };
      getlisttreeReq(obj)
        .then((res) => {
          this.treeLoading = false;
          if (res.code === 200) {
            this.leftTreeData = [];
            this.initMenuNode(this.leftTreeData, res.result);
            this.pageLoad();
          } else this.$Message.error(res.message);
        })
        .catch(() => (this.treeLoading = false));
    },
    // 处理获取的菜单数据
    initMenuNode(list, data) {
      for (let item of data) {
        // let isExpand = false
        // if (hasChild(item)) isExpand = true
        let theCategory = item.category
        let node = {
          id: item.id,
          parentId: item.parentId,
          title: item.name,
          category: item.category,
          icon: getZoneIcon(++theCategory),
          expand: item.category === 0,
          selected: false,
          children: [],
        };
        if (hasChild(item)) {
          this.initMenuNode(node.children, item.children);
        }
        list.push(node);
      }
    },
    // 获取数据字典数据
    getDataItemData() {
      const obj = {
        enabled: 1,
      };
      getlistReq(obj)
        .then((res) => {
          this.treeLoading = false;
          if (res.code === 200) {
            this.typeIdList = res.result || [];
          } else this.$Message.error(res.message);
        })
        .catch(() => (this.treeLoading = false));
    },
    // 树型点击事件
    treeSelect(data) {
      if (data.length > 0) {
        const obj = data[0];
        this.req.id = obj.id;
        this.req.parentId = obj.parentId;
        this.selectCategory = obj.category + 1;
        this.req.category = this.selectCategory;
      } else {
        this.treeCancel();
        this.selectCategory = 0;
        this.req.category = 0;
      }
      this.selectObj = null;
      this.pageLoad();
    },
    // 清楚树型数据
    treeCancel() {
      this.req.id = "0";
      this.req.parentId = "0";
    },
    // 点击搜索按钮触发
    searchClick() {
      this.req.pageIndex = 1;
      this.pageLoad();
    },
    // 点击新增按钮触发
    addClick() {
      if (this.selectCategory === 2) return this.$Message.warning(this.$t("addChildNode"));
      this.drawerFlag = true;
      this.isAdd = true;
      this.drawerTitle = this.$t("add");
      this.req.parentId = this.req.id === "0" ? "" : this.req.id;
      this.req.areaFloorId = this.req.id;
    },
    // 新增菜单、按钮
    okClick() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          let obj = {
            systemFlag: this.req.systemFlag,
            parentId: this.req.category === 1 ? this.req.parentId : "0",
            name: this.req.name.trim(),
            enCode: this.req.enCode,
            remark: this.req.remark,
            category: this.req.category,
            typeId: this.req.category === 1 ? this.req.typeId : "",
            enabled: this.req.enabled ? 1 : 0,
            sortCode: this.req.sortCode,
          };
          addReq(obj).then((res) => {
            if (res.code === 200) {
              this.$Message.success(`${this.$t("add")}${this.$t("success")}`);
              this.getLeftMenu();
              if (this.isSuccess) {
                this.cancelClick();
                this.treeCancel();
              }
            } else
              this.$Message.error(
                `${this.$t("add")}${this.$t("fail")},${errorType(this, res.errorCode)}`
              );
          });
        }
      });
    },
    // 点击新增按钮触发
    editClick() {
      if (this.selectObj) {
        const data = this.selectObj;
        this.req.areaFloorId = data.id;
        this.req.areaFloorParentId = data.parentId;
        this.req.parentId = data.parentId;
        this.req.name = data.name;
        this.req.enCode = data.enCode;
        this.req.typeId = data.typeId;
        this.req.sortCode = data.sortCode;
        this.req.enabled = data.enabled === 1;
        this.req.remark = data.remark;
        this.req.category = data.category;
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
            id: this.req.areaFloorId,
            parentId: this.req.category === 1 ? this.req.parentId : "0",
            name: this.req.name.trim(),
            enCode: this.req.enCode,
            remark: this.req.remark,
            enabled: this.req.enabled ? 1 : 0,
            typeId: this.req.category === 1 ? this.req.typeId : "",
            category: this.req.category,
            sortCode: this.req.sortCode,
          };
          modifyReq(obj).then((res) => {
            if (res.code === 200) {
              this.selectObj = null;
              this.getLeftMenu();
              this.$Message.success(`${this.$t("edit")}${this.$t("success")}`);
              if (this.isSuccess) {
                this.cancelClick();
                this.treeCancel();
              }
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
    // 取消
    cancelClick() {
      this.drawerFlag = false;
      this.isSuccess = false;
      this.$refs.req.resetFields(); //清除表单红色提示
      this.req.areaFloorId = "0";
      this.req.areaFloorParentId = "0";
      this.req.name = "";
      this.req.enCode = "";
      this.req.remark = "";
      this.req.typeId = "";
      this.req.sortCode = 0;
      this.selectCategory = 0;
      this.req.category = 0;
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
