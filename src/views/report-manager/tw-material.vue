<template>
  <div class="page-style ">
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
        <FormItem :label="$t('matLocation')" prop="equipmentType">
          <Select
            v-model="defaultReq.equipmentType"
            multiple
            :max-tag-count="2"
            :placeholder="$t('pleaseSelect') + $t('matLocation')"
            @on-change="equipmentTypeChange"
          >
            <Option
              v-for="(item, index) in equipmentTypeList"
              :value="item.objectName"
              :key="index"
              >{{ item.objectName }}
            </Option>
          </Select>
        </FormItem>

        <FormItem :label="$t('machineInfo')" prop="machineInfo">
          <Select
            v-model="defaultReq.machineInfo"
            multiple
            :max-tag-count="2"
            @on-open-change="getMachineInfo"
            :placeholder="$t('pleaseSelect') + $t('machineInfo')"
          >
            <Option
              v-for="(item, index) in machineInfoList"
              :value="item.objectName"
              :key="index"
            >
              {{ item.objectName }}
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
      <div class="setting" @click="settingClick">
        <Icon type="md-construct" color="red" />
        Setting
      </div>
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <Table
          border
          size="large"
          :height="tableHeight"
          :loading="tableLoading"
          :columns="columns"
          :data="data"
          highlight-row
          @on-current-change="currentClick"
          :row-class-name="tableRowClassName"
        ></Table>
      </Card>
    </div>
  </div>
</template>

<script>
import {
  getEquipmentTypeReq,
  getMachineInfoReq,
  getReportlistReq,
} from "@/api/report-manager/tw-material";
import { playSound } from "@/libs/tools";
import DrawerButton from "@/components/drawer-button";
import dayjs from "dayjs";
export default {
  name: "tw-material",
  components: { DrawerButton },
  data() {
    return {
      interval: null, //定时器
      setTimer: null, //报警定时器
      split: 0.15,
      drawerFlag: false,
      drawerTitle: this.$t("setting"),
      tableHeight: 400,
      tableLoading: false, // table加载动画
      equipmentTypeList: [], //设备类型数据
      machineInfoList: [], //机台信息数据
      data: [], // 表格数据
      columns: [],
      selectObj: null, // 表格选中数据
      defaultReq: {
        equipmentType: [],
        machineInfo: [],
      },
      req: {
        equipmentType: [],
        machineInfo: [],
      },
      // 验证实体
      ruleValidate: {
        equipmentType: [
          {
            type: "array",
            required: true,
            message: this.$t("pleaseEnter") + this.$t("matLocation"),
            trigger: "change",
          },
        ],
        machineInfo: [
          {
            type: "array",
            required: true,
            message: this.$t("pleaseEnter") + this.$t("machineInfo"),
            trigger: "change",
          },
        ],
      },
    };
  },
  mounted() {
    this.getEquipmentType();
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
          title: this.$t("sequenceNumber"),
          key: "matconsumeSeq",
          width: 50,
          align: "center",
        },
        {
          title: this.$t("equipmentId"),
          key: "name",
          width: 100,
          resizable: true,
          align: "center",
        },

        {
          title: this.$t("matLocation"),
          key: "matLocation",
          width: 90,
          resizable: true,
          align: "center",
        },
        {
          title: this.$t("REELId"),
          key: "lotId",
          align: "center",
        },
        {
          title: this.$t("matPN"),
          key: "matPN",
          width: 150,
          resizable: true,
          align: "center",
        },
        {
          title: this.$t("matType"),
          key: "matType",
          align: "center",
        },

        {
          title: this.$t("quantity"),
          key: "quantity",
          width: 60,
          resizable: true,
          align: "center",
        },
        {
          title: this.$t("state"),
          key: "state",
          width: 80,
          resizable: true,
          align: "center",
        },
        {
          title: this.$t("matExpire"),
          key: "matExpire",
          align: "center",
          width: 85,
          resizable: true,
          render: (h, params) => {
            return h(
              "div",
              params.row.matExpire
                ? dayjs(params.row.matExpire).format("YYYY/MM/DD HH:mm:ss")
                : null
            );
          },
        },
        {
          title: this.$t("QTime/Min"),
          key: "limitNum",
          align: "center",
          width: 80,
          resizable: true,
          render: (h, params) => {
            if (params.row.limitNum < 0) playSound(this.$config.tipsVoice.NgTips);
            return h("div", params.row.limitNum);
          },
        },
      ];
    },
    // 设置时间
    settingTime() {
      this.interval = setInterval(() => {
        this.pageLoad();
      }, 300000);
    },
    //设备类型change事件
    equipmentTypeChange() {
      this.defaultReq.machineInfo = [];
    },
    // 获取设备类型
    getEquipmentType() {
      getEquipmentTypeReq().then((res) => {
        if (res.code === 200) this.equipmentTypeList = res.result || [];
      });
    },
    // 获取机台信息
    getMachineInfo(e) {
      if (e) {
        if (this.defaultReq.equipmentType.length > 0) {
          getMachineInfoReq({
            ids: this.defaultReq.equipmentType.join(","),
          }).then((res) => {
            if (res.code === 200) this.machineInfoList = res.result || [];
            else this.machineInfoList = [];
          });
        } else
          this.$Message.warning(
            `${this.$t("pleaseSelect")}${this.$t("matLocation")}`
          );
      }
    },
    // 获取列表数据
    pageLoad() {
      if (
        this.req.equipmentType.length > 0 &&
        this.req.machineInfo.length > 0
      ) {
        getReportlistReq({ ids: this.req.machineInfo.join(",") }).then(
          (res) => {
            if (res.code === 200) {
              this.data = res.result || [];
              let arr = this.data.filter(o => o.name.includes('E11PNP') && o.quantity < 5)
              let arr1 = this.data.filter(o => o.name.includes('E11PNP') && o.quantity < 8)
              if ((arr.length || arr1.length) && !this.setTimer) {
                playSound(this.$config.tipsVoice.NgTips)
                this.setTimer = setInterval(() => {
                  playSound(this.$config.tipsVoice.NgTips)
                }, arr.length ? 60 * 1000 : 300 * 1000)
              } else {
                if (this.setTimer) clearInterval(this.setTimer)
              }
            }
          }
        );
      }
    },
    // 点击新增按钮触发
    settingClick() {
      this.defaultReq = Object.assign({}, this.req);
      this.drawerFlag = true;
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
      this.drawerFlag = false;
    },
    // 自动改变表格高度
    autoSize() {
      let height = document.body.clientHeight - 60;
      this.tableHeight = height;
    },
    // 某一行高亮时触发
    currentClick(currentRow) {
      this.selectObj = currentRow;
    },
    tableRowClassName(row) {
      if (row.limitNum < 0 || row.quantity < 5) {
        return "table_cell_bg_color_red";
      } else if ((row.limitNum > 1 && row.limitNum < 30) || row.quantity < 8) {
        return "table_cell_bg_color_yellow";
      }
      return "table_cell_bg_color_green";
    },
  },
};
</script>
<style scoped lang="less">
.setting {
  display: flex;
  flex-direction: row-reverse;
  padding: 20px 20px 0 0;
  font-size: 18px;
  cursor: pointer;
}
</style>
