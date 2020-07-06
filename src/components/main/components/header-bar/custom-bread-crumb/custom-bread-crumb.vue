<template>
  <div class="custom-bread-crumb">
    <Breadcrumb :style="{fontSize: `${fontSize}px`}">
      <BreadcrumbItem v-for="item in list" :to="item.to" :key="`bread-crumb-${item.name}`">
        <common-icon style="margin-right: 4px;" :type="item.icon || ''"/>
        {{ showTitle(item) }}
      </BreadcrumbItem>
    </Breadcrumb>
  </div>
</template>
<script>
  import {showTitle} from '@/libs/utils'
  import CommonIcon from '@/components/common-icon'

  export default {
    name: 'customBreadCrumb',
    components: {
      CommonIcon
    },
    props: {
      list: {
        type: Array,
        default: () => []
      },
      fontSize: {
        type: Number,
        default: 14
      },
      showIcon: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      showTitle(item) {
        return showTitle(item, this)
      },
      isCustomIcon(iconName) {
        return iconName.indexOf('_') === 0
      },
      getCustomIconName(iconName) {
        return iconName.slice(1)
      }
    }
  }
</script>

<style scoped lang="less">
  @size: 40px;
  .custom-bread-crumb {
    height: @size;
    line-height: @size;
    display: inline-block;
    vertical-align: top;
  }
</style>
