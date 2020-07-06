<template>
  <div class="grid-wrapper">
    <div class="grid-wrapper-list">
      <div class="grid-wrapper-item" v-for="(item, i) in gridData" :key="i" :style="{backgroundColor: item.gridColor}">
        <p class="grid-wrapper-item-content">{{`${$t('hostName')}: ${item.hostName}`}}</p>
        <p class="grid-wrapper-item-content" :title="item.ip">{{`${$t('ip')}: ${item.ip}`}}</p>
        <p class="grid-wrapper-item-content">{{`${$t('gridDate')}: ${item.gridDate}`}}</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "grid-custom",
    props: {
      gridData: {
        type: Array,
        default: () => []
      }
    }
  }
</script>

<style scoped lang="less">
  .grid-wrapper {
    width: inherit;
    overflow-y: auto;
    @bgColor: #fff;

    &-item {
      display: inline-block;
      width: 19%;
      height: auto;
      padding: 5px;
      margin: .5%;
      border: 1px solid #cccccc;
      border-radius: 5px;
      background-color: @bgColor;

      &-content {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>