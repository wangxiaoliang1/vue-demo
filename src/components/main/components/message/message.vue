<template>
  <div>
    <Poptip trigger="hover">
      <Badge :dot="dot" :offset="[8, 0]">
        <Icon custom="iconfont icon-notice" :size="size"></Icon>
      </Badge>
      <div slot="content">
        <Tabs value="name1">
          <TabPane label="标签一" name="name1">标签一的内容</TabPane>
          <TabPane label="标签二" name="name2">标签二的内容</TabPane>
        </Tabs>
      </div>
    </Poptip>
  </div>
</template>

<script>
  export default {
    name: "message",
    props: {
      dot: {
        type: Boolean,
        default: Boolean
      },
      size: {
        type: Number,
        default: 22
      }
    }
  }
</script>

<style scoped>

</style>