<template>
  <div class="page-style">
    <!-- 页面图表 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row type="flex" justify="space-between" flex-direction="row-reverse">
            <div>
              {{$t('dataAcquisitionTime(min)')}}
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
import { getSteelGasReq } from "@/api/report-manager/steel-manager";
import LineCustom from "@/components/echarts/line-custom";
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
      }, 60000);
    },
    // 获取列表数据
    pageLoad() {
      getSteelGasReq(this.req)
        .then((res) => {
          if (res.code === 200) {
            let data = res.result || [];
            data.map((item, index) => {
              this.chartsData.xData = data[0].datas.map((o) => o.itemTime);
              let seriesItem = {
                name: item.floor,
                data: item.datas.map((o) => o.itemValue),
              };
              this.chartsData.series[index] = seriesItem;
            });
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
