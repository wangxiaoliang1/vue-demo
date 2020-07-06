<template>
  <div class="page-style steel_con">
    <div class="steel-top">
      <div>Luxshare-ict</div>
      <div>E-KanBan(STEEL)</div>
      <div>
        <div>{{ time }}</div>
        <div class="week-con">
          <div>WEEK</div>
          <div>{{ ww }}</div>
          <div>{{ week }}</div>
          <div class="setting" @click="settingClick">
            Setting<Icon type="md-construct" color="red" />
          </div>
        </div>
      </div>
    </div>
    <div class="statistical">
      <div class="normal">{{$t("normal")}}：{{ data.length - offline - warning }}</div>
      <div class="warning">{{$t("warning")}}：{{ warning }}</div>
      <div class="offline">{{$t("offline")}}：{{ offline }}</div>
    </div>
    <!-- 左侧抽屉 -->
    <Drawer
      v-model="drawerFlag"
      :title="drawerTitle"
      width="520"
      :mask-closable="false"
      @on-close="cancelClick"
    >
      <Form
        ref="req"
        :model="defaultReq"
        :rules="ruleValidate"
        :label-width="80"
        :label-colon="true"
      >
        <FormItem label="Plant" prop="site">
          <Select
            v-model="defaultReq.site"
            :placeholder="$t('pleaseSelect') + 'Plant'"
          >
            <Option
              v-for="(item, index) in plantList"
              :value="item.value"
              :key="index"
              >{{ item.label }}</Option
            >
          </Select>
        </FormItem>

        <FormItem label="Product" prop="floor">
          <Select
            v-model="defaultReq.floor"
            :clearable="true"
            @on-open-change="getProductData"
            :placeholder="$t('pleaseSelect') + 'Product'"
          >
            <Option
              v-for="(item, index) in productList"
              :value="item.value"
              :key="index"
            >
              {{ item.label }}
            </Option>
          </Select>
        </FormItem>

        <!-- 按钮 -->
        <FormItem>
          <drawer-button
            @on-cancel="cancelClick"
            @on-ok="okOrUpdateClick"
            @on-update="okOrUpdateClick"
            @on-okOrUpdate="okOrUpdateClick"
          ></drawer-button>
        </FormItem>
      </Form>
    </Drawer>
    <!-- 页面表格 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <Table
          class="steel_table"
          border
          size="large"
          :height="tableHeight"
          :loading="tableLoading"
          :columns="columns"
          :data="data"
          highlight-row
          :row-class-name="tableRowClassName"
          @on-current-change="currentClick"
        ></Table>
      </Card>
    </div>
  </div>
</template>

<script>
import { getsteelReq } from "@/api/report-manager/steel-manager";
import DrawerButton from "@/components/drawer-button";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);
export default {
  name: "steel-manager",
  components: { DrawerButton },
  data() {
    return {
      warning: 0, //预警
      offline: 0, //下线
      time: "", //时间
      week: "", //周几
      ww: "", //一年中的第几周
      interval: null, //定时器
      split: 0.15,
      drawerFlag: false,
      drawerTitle: this.$t("setting"),
      tableHeight: 400,
      tableLoading: false, // table加载动画
      productList: [], // 数据字典源数据
      plantList: [
        {
          label: "KS",
          value: "KS",
        },
      ],
      data: [], // 表格数据
      columns: [],
      selectObj: null, // 表格选中数据
      defaultReq: {
        site: "",
        floor: "",
        stencilCode: ["H18", "H19"],
      },
      req: {
        site: "",
        floor: "",
        stencilCode: ["H18", "H19"],
      },
      // 验证实体
      ruleValidate: {
        site: [
          {
            required: true,
            message: this.$t("pleaseEnter") + "Plant",
            trigger: "change",
          },
        ],
        floor: [
          {
            required: true,
            message: this.$t("pleaseEnter") + "Product",
            trigger: "change",
          },
        ],
      },
    };
  },

  mounted() {
    this.settingTime();
    this.settingClick();
    this.autoSize();
    this.setColumns();
    window.onresize = () => this.autoSize();
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    setColumns() {
      this.columns = [
        {
          type: "index",
          width: 50,
          align: "center",
          indexMethod: (row) => {
            return row._index + 1;
          },
        },
        {
          title: this.$t("stencilId"),
          key: "stencilId",
          width: 140,
          resizable: true,
          align: "center",
        },

        { title: this.$t("pdlineId"), key: "pdlineId", align: "center" },
        {
          title: this.$t("stationId"),
          key: "stationId",
          align: "center",
          width: 50,

          render: (h, params) => {
            let stationId = params.row.stationId;
            let station = "";
            if (stationId) {
              stationId = stationId.substring(stationId.length - 2);
              if (stationId == "01") {
                station = "左耳";
              } else if (stationId == "02") {
                station = "右耳";
              }
            }
            return h("div", station);
          },
        },
        {
          title: this.$t("recipientsTime"),
          key: "recipientsTime",
          width: 140,
          align: "center",
          render: (h, params) => {
            return h(
                "div",
                params.row.recipientsTime
                    ? dayjs(params.row.recipientsTime).format("YYYY/MM/DD HH:mm:ss")
                    : null
            );
          },
        },
        {
          title: this.$t("useTime"),
          key: "useTime",
          width: 120,
          align: "center",
        },
        {
          title: this.$t("standardTime"),
          key: "standardTime",
          width: 120,
          align: "center",
        },
        {
          title: this.$t("stencilStatus"),
          key: "stencilStatus",
          width: 70,
          align: "center",
          render: (h, params) => {
            let stencilStatus = "正常";
            if (params.row.useTime > 11 * 60) {
              stencilStatus = "预警";
            } else if (params.row.useTime > 12 * 60) {
              stencilStatus = "下线";
            }
            return h("div", stencilStatus);
          },
        },
        { title: this.$t("maxNumber"), key: "maxNumber", align: "center" },
        { title: this.$t("totelNumber"), key: "totelNumber", align: "center" },
        { title: this.$t("max"), key: "max", align: "center" },
        { title: this.$t("min"), key: "min", align: "center" },
        { title: this.$t("facade"), key: "facade", align: "center" },
      ];
    },
    // 获取product字典数据
    getProductData(e) {
      if (e) {
        if (!this.defaultReq.site)
          this.$Message.warning(`${this.$t("pleaseSelect")}Plant`);
        else {
          if (this.defaultReq.site == "KS") {
            this.productList = [
              {
                label: "E1-4F",
                value: "OldMes",
              },
            ];
          }
        }
      }
    },
    // 设置时间
    settingTime() {
      let count = 0;
      this.interval = setInterval(() => {
        this.week = dayjs(new Date()).format("dddd");
        this.ww = dayjs(new Date()).week();
        this.time = dayjs(new Date()).format("YYYY-MM-DD,HH:mm:ss");
        count = count + 1;
        if (count == 300) {
          count = 0;
          this.pageLoad();
        }
      }, 1000);
    },
    // 获取列表数据
    pageLoad() {
      if (this.req.site && this.req.floor) {
        getsteelReq(this.req)
          .then((res) => {
            if (res.code === 200) {
              this.warning = 0;
              this.offline = 0;
              res.result.map((item) => {
                if (item.useTime > 12 * 60) {
                  this.offline++;
                } else if (item.useTime > 11 * 60) {
                  this.warning++;
                }
              });
              this.data = res.result || [];
            }
          })
          .catch((err) => {
            this.$Message.error(`${err.status} ${err.statusText}`);
          });
      }
    },

    // 点击新增按钮触发
    settingClick() {
      this.drawerFlag = true;
      this.drawerTitle = this.$t("setting");
      this.defaultReq = Object.assign({}, this.req);
    },

    // 点击新增或修改并关闭按钮触发
    async okOrUpdateClick() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          this.req = Object.assign({}, this.defaultReq);
          this.pageLoad();
          this.cancelClick();
        }
      });
    },
    // 左侧抽屉取消
    cancelClick() {
      this.defaultReq = Object.assign({}, this.req);
      this.drawerFlag = false;
    },
    // 自动改变表格高度
    autoSize() {
      let height = document.body.clientHeight - 240;
      this.tableHeight = height;
    },
    // 某一行高亮时触发
    currentClick(currentRow) {
      this.selectObj = currentRow;
    },
    tableRowClassName(row) {
      if (row.useTime > 12 * 60) {
        return "table_cell_bg_color_red";
      } else if (row.useTime > 11 * 60) {
        return "table_cell_bg_color_yellow";
      }
      return "";
    },
  },
};
</script>
<style scoped lang="less">
.page-style {
  background: #282c37;
}
.steel-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 36px;
  color: yellow;
  padding: 50px 20px 20px 20px;
}
.week-con {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #fff;
  margin-top: 5px;
  .setting {
    cursor: pointer;
  }
}
.statistical {
  width: 300px;
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  margin: 30px 20px 10px 20px;
  .normal {
    color: #5fb878;
  }
  .warning {
    color: #cccc00;
  }
  .offline {
    color: red;
  }
}
.row_height {
  height: 50px;
}
</style>
