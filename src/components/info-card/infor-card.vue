<template>
  <Card :shadow="shadow" class="info-card-wrapper" :padding="12">
    <div slot="title">
      <h3>{{cardTitle}}</h3>
    </div>
    <div slot="extra" class="info-card-tag">
      <Tag type="border" v-show="cardTag" color="primary">{{cardTag}}</Tag>
    </div>
    <slot></slot>
    <div class="info-card-footer"><span>{{cardFooterTitle}}</span><span>{{cardFooterValue}}</span></div>
  </Card>
</template>

<script>

  export default {
    name: 'InforCard',
    props: {
      shadow: {
        type: Boolean,
        default: false
      },
      cardTitle: {
        type: String,
        default: ''
      },
      cardTag: {
        type: String,
        default: ''
      },
      cardFooterTitle: {
        type: String,
        default: ''
      },
      cardFooterValue: {
        type: [Number, String],
        default: null
      }
    },
    computed: {
    }
  }
</script>

<style scoped lang="less">
  .info-card-tag {
    position: absolute;
    right: -9px;
    top: -8px;
  }
  .info-card-footer {
    display: flex;
    justify-content: space-between;
    height: 20px;
    margin-top: 10px;
  }
</style>
