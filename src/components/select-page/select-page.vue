<template>
  <Select v-model="selectObj.value" :multiple="selectObj.multiple" :clearable="!selectObj.multiple" filterable
          :max-tag-count="selectObj.tagsLength" remote :remote-method="remoteMethod"
          :loading="selectObj.loading" @on-change="selectChange">
    <Option v-if="selectObj.multiple" value="" disabled>
      <ButtonGroup size="small">
        <Button @click="selectAll()">{{$t('selectAll')}}</Button>
        <Button @click="selectCancel()">{{$t('selectCancel')}}</Button>
        <Button @click="selectAllCancel()">{{$t('selectAllCancel')}}</Button>
      </ButtonGroup>
    </Option>
    <Option v-for="(child, i) in selectObj.children" :key="i" :value="child[selectObj.keyWord]">{{child.name}}</Option>
    <Option v-if="selectObj.multiple" value="" disabled>
      <Page class-name="select_page_style" :current="1" :total="selectObj.total" simple @on-change="pageChange"/>
    </Option>
  </Select>
</template>

<script>
  // 下拉分页组件1.0
  export default {
    name: "select-page",
    props: {
      // 列表数据
      list: Object
    },
    data() {
      return {
        selectObj: this.list
      }
    },
    methods: {
      // 选择改变时触发
      selectChange(data) {
        this.$emit('select-page-change', data)
      },
      // 点击全选当前页按钮触发
      selectAll() {
        const addArrTotal = this.selectObj.children.map(o => o[this.selectObj.keyWord])
        let addArr = []
        if (this.selectObj.value.length) {
          addArrTotal.forEach(o => {
            if (!this.selectObj.value.includes(o)) addArr.push(o)
          })
        } else addArr = addArrTotal
        this.selectObj.value.push(...addArr)
      },
      // 点击全选取消当前页触发
      selectCancel() {
        const addArrTotal = this.selectObj.children.map(o => o[this.selectObj.keyWord])
        addArrTotal.forEach(o => {
          this.selectObj.value = this.selectObj.value.filter(x => x !== o)
        })
      },
      // 点击全选取消触发
      selectAllCancel() {
        this.selectObj.value = []
      },
      // 分页组件页码改变触发
      pageChange(data) {
        this.$emit('page-change', data)
      },
      // 远程搜索
      remoteMethod(query) {
        this.$emit('select-page-remote-method', query)
      }
    }
  }
</script>

