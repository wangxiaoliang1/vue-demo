<template>
  <div class="page-style">
    <!-- 页面图表 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row type="flex" justify="space-between" flex-direction="row-reverse">
            <div>
              {{ $t("dataAcquisitionTime(s)") }}
              <InputNumber
                :max="60"
                :min="1"
                v-model="req.minute"
                @on-change="inputNumberChange"
              ></InputNumber>
            </div>
          </Row>
        </div>
        <LineCustom index="1" ref="charts" :data="chartsData" />
      </Card>
    </div>
  </div>
</template>

<script>
import { getGasMongoReq } from "@/api/report-manager/steel-manager";
import LineCustom from "@/components/echarts/line-custom";
import { formatDate } from "@/libs/tools";
import _ from "lodash";
export default {
  name: "steel-charts",
  components: { LineCustom },
  data() {
    return {
      timeOut: null,
      interval: null, //定时器
      req: {
        minute: 15,
      },
      chartsData: {
        xData: [],
        series: [],
      },
    };
  },

  mounted() {
    this.settingTime();
    this.pageLoad();
    window.onresize = () => {
      this.$refs.charts.lineChart.resize();
    };
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    // 搜索防抖
    inputNumberChange() {
      if (this.timeOut) {
        clearTimeout(this.timeOut);
      }
      this.timeOut = setTimeout(() => {
        this.pageLoad();
      }, 1000);
    },

    // 定时一分钟刷新数据
    settingTime() {
      this.interval = setInterval(() => {
        this.pageLoad();
      }, 2000);
    },
    // 获取列表数据
    pageLoad() {
      let obj = {
        category: "Gas",
        fromStartDate: new Date(new Date().getTime() - this.req.minute * 1000),
        fromEndDate: new Date(new Date().getTime()),
      };
      getGasMongoReq(obj)
        .then((res) => {
          if (res.code === 200) {
            let data = res.result || [];
            let newData = _.groupBy(data, "fromName");
            let index = 0;
            for (let item in newData) {
              if (index === 0) {
                this.chartsData.xData = newData[item].map((o) =>
                  formatDate(o.fromDate, "hh:mm:ss")
                );
              }
              let seriesItem = {
                name: item,
                data: newData[item].map((o) => o.dataDecimal),
              };
              this.chartsData.series[index] = seriesItem;
              index = index + 1;
            }
            this.$refs.charts.initChart();
          }
        })
        .catch((err) => {
          this.$Message.error(`${err.status} ${err.statusText}`);
        });
    },
  },
};
</script>
