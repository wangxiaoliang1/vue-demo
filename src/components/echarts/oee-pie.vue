<template>
  <div :id="'pieChart' + index" class="pieChart"></div>
</template>
<script>
import echarts from "echarts";
export default {
  name: "oee-pie",
  props: {
    index: {
      type: String, // String, Number, Object
      required: false,
      default: "0",
    },
    data: {},
  },

  data() {
    return {
      pieChart: {},
    };
  },
  methods: {
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.pieChart = echarts.init(document.getElementById("pieChart" + this.index));
      // 绘制图表
      this.pieChart.setOption({
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        series: [
          {
            name: this.$t("state"),
            type: "pie",
            radius: "60%",
            center: ["50%", "50%"],
            data: [
              {
                value: this.data.production,
                name: "Production",
                itemStyle: {
                  color: "#4BE64B",
                },
              },
              { value: this.data.idle, name: "Idle" },
              { value: this.data.setup, name: "Setup" },
              { value: this.data.changeOver, name: "ChangeOver" },
              { value: this.data.pmBuyoff, name: "Repair" },
              { value: this.data.eng, name: "Eng" },
              { value: this.data.pm, name: "PM" },
              { value: this.data.spcHold, name: "Install" },
              { value: this.data.cim, name: "Other" },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      });
    },
  },
  mounted() {
    this.initChart();
  },
};
</script>
<style lang="less" scoped>
.pieChart {
  width: 100%;
  height: 100%;
}
</style>
