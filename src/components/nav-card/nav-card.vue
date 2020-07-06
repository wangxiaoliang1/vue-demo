<template>
  <Card :shadow="shadow" class="nav-card-wrapper" :padding="5">
    <Icon :custom="iconName" :color="iconColor" :size="iconSize"></Icon>
    <p>{{navName}}</p>
  </Card>
</template>

<script>

  export default {
    name: 'NavCard',
    props: {
      shadow: {type: Boolean, default: false},
      iconName: {type: String, default: ''},
      iconColor: {type: String, default: ''},
      iconSize: {type: Number, default: 22},
      navName: {type: String, default: ''}
    },
    computed: {}
  }
</script>

<style scoped lang="less">
  .nav-card-wrapper {
    text-align: center;
    cursor: pointer;

    p {
      margin-top: 10px;
    }
  }
</style>
