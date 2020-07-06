<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="520" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true">
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="req.name" :placeholder="$t('pleaseEnter') + $t('name')"/>
        </FormItem>
        <FormItem :label="$t('category')" prop="category">
          <Select v-model="req.category" :clearable="true" :placeholder="$t('pleaseSelect') + $t('category')">
            <Option v-for="(item, i) in categoryList" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('fileUpload')">
          <Button v-show="isAdd" type="primary" style="margin-right: 10px;" @click="uploadVideo">
            {{$t('videoUpload')}}{{req.videoFiles ? $t('finish') : ''}}
          </Button>
          <input type="file" style="display: none;" id="videoFile" accept="video/mp4,application/x-zip-compressed"
                 @change="uploadVideoChange"/>
          <Button type="primary" @click="uploadImage">{{$t('coverPlanUpload')}}{{req.imageFiles ? $t('finish') : ''}}
          </Button>
          <input type="file" style="display: none;" id="imageFile" accept="image/*,application/x-zip-compressed"
                 @change="uploadImageChange"/>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled">
          <i-switch size="large" v-model="req.enabled">
            <span slot="open">{{ $t('open') }}</span>
            <span slot="close">{{ $t('close') }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark">
          <Input v-model="req.remark" :placeholder="$t('pleaseEnter') + $t('remark')"/>
        </FormItem>
        <!-- 按钮 -->
        <FormItem>
          <drawer-button :isAdd="isAdd" @on-cancel="cancelClick" @on-ok="okClick" @on-update="updateClick"
                         @on-okOrUpdate="okOrUpdateClick"></drawer-button>
        </FormItem>
      </Form>
    </Drawer>
    <!-- 页面表格 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row>
            <i-col span="12">
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t('name')"/>
                </FormItem>
              </Form>
            </i-col>
            <i-col span="12">
              <button-custom :btnData="btnData" @on-add-click="addClick" @on-edit-click="editClick"></button-custom>
            </i-col>
          </Row>
        </div>
        <table-custom :tableHeight="tableHeight" :tableLoading="tableLoading" :columns="columns" :data="data"
                      @on-current-change="currentClick" @on-sort-change="sortChange"></table-custom>
        <page-custom :total="req.total" :totalPage="req.totalPage" :pageIndex="req.pageIndex" :page-size="req.pageSize"
                     @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
      </Card>
    </div>
    <Spin size="large" fix v-if="progressShow" style="z-index: 3000;">
      {{$t('uploadFileTips')}}
      <Progress :percent="progressNum" status="active"/>
    </Spin>
  </div>
</template>

<script>
  import {getpagelistReq, addReq, modifyReq} from "@/api/system-manager/public-video";
  import {getpagelistReq as gettypepagelistReq} from "@/api/system-manager/assets-type";
  import {formatDate, getButtonBoolean, errorType, renderSpan, h5FormData, uuid} from "@/libs/tools";
  import ButtonCustom from "@/components/button-custom";
  import DrawerButton from "@/components/drawer-button";
  import TableCustom from "@/components/table-custom";
  import PageCustom from "@/components/page-custom";

  export default {
    name: "assets-upload",
    components: {ButtonCustom, DrawerButton, TableCustom, PageCustom},
    data() {
      return {
        split: 0.15,
        drawerFlag: false,
        isSuccess: false,
        isAdd: true,
        drawerTitle: this.$t("add"),
        tableHeight: 200,
        tableLoading: true, // table加载动画
        progressShow: false,
        progressNum: 0,
        categoryList: [],
        columns: [
          {
            type: "index", width: 50, align: "center",
            indexMethod: (row) => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1;
            }
          },
          {title: this.$t("name"), key: "name", sortable: "custom"},
          {
            title: this.$t("category"), key: "typeId",
            render: (h, params) => {
              let typeItem = this.categoryList.find(o => o.id === params.row.typeId)
              return h("div", typeItem ? typeItem.name : '');
            }
          },
          {
            title: this.$t("enabled"), key: "enabled", width: 70,
            render: (h, params) => {
              return renderSpan(this, h, params.row.enabled);
            }
          },
          {
            title: this.$t("createDate"), key: "createDate", width: 125,
            render: (h, params) => {
              return h("div", params.row.createDate ? formatDate(params.row.createDate, "yyyy-MM-dd hh:mm:ss") : null);
            }
          },
          {
            title: this.$t("modifyDate"), key: "modifyDate", width: 125,
            render: (h, params) => {
              return h("div", params.row.modifyDate ? formatDate(params.row.modifyDate, "yyyy-MM-dd hh:mm:ss") : null);
            }
          },
          {title: this.$t("remark"), key: "remark"}
        ], // 表格数据
        data: [], // 表格数据
        selectObj: null, // 表格选中数据
        req: {
          queryName: '',
          id: '0', // id
          name: '', // 名称
          category: '', // 类别
          videoFiles: null, // 视频资源文件
          imageFiles: null, // 封面图资源文件
          coverImage: '', // 封面图资源文件
          enabled: true, // 描述
          remark: '', // 描述
          ...this.$config.pageConfig,
        },
        // 验证实体
        ruleValidate: {
          name: [{required: true, message: this.$t("pleaseEnter") + this.$t("name"), trigger: "blur"}],
          category: [{required: true, message: this.$t("pleaseEnter") + this.$t("category"), trigger: "change"}]
        },
        btnData: []
      };
    },
    mounted() {
      this.pageLoad();
      getButtonBoolean(this, this.btnData);
      this.getAssetsTypeList();
      this.autoSize();
      window.onresize = () => this.autoSize();
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true;
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {
            name: this.req.queryName.trim(),
            enabled: -1,
          },
        };
        getpagelistReq(obj).then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            let data = res.result;
            this.data = data.data ? data.data : [];
            this.req.pageSize = data.pageSize;
            this.req.pageIndex = data.pageIndex;
            this.req.total = data.total;
            this.req.totalPage = data.totalPage;
          }
        })
            .catch(() => (this.tableLoading = false));
      },
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1;
        this.pageLoad();
      },
      // 获取静态资源类别列表
      getAssetsTypeList() {
        const obj = {
          orderField: 'CREATEDATE', // 排序字段
          ascending: true, // 是否升序
          pageSize: 50, // 分页大小
          pageIndex: 1, // 当前页码
          data: {
            name: '',
            enabled: 1,
          }
        }
        gettypepagelistReq(obj).then(res => {
          if (res.code === 200 && res.result) this.categoryList = res.result.data
        })
      },
      // 点击上传视频按钮触发
      uploadVideo() {
        document.getElementById('videoFile').click()
      },
      // 点击上传视频文件改变触发
      uploadVideoChange() {
        let fileData = document.getElementById('videoFile')
        this.req.videoFiles = fileData.files
      },
      // 点击上传封面图按钮触发
      uploadImage() {
        document.getElementById('imageFile').click()
      },
      // 点击上传封面图文件改变触发
      uploadImageChange() {
        let fileData = document.getElementById('imageFile')
        this.req.imageFiles = fileData.files
      },
      // 点击新增按钮触发
      addClick() {
        this.drawerFlag = true;
        this.isAdd = true;
        this.drawerTitle = this.$t("add");
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate((validate) => {
          if (validate) {
            let that = this
            if (!this.req.videoFiles) return this.$Message.error(this.$t('uploadVideoFileTips'));
            if (!this.req.imageFiles) return this.$Message.error(this.$t('uploadImageFileTips'));
            this.$Spin.show()
            h5FormData(this.req.videoFiles, {
              fileName: `${this.$store.state.account}${uuid(16)}`,
              imageFiles: this.req.imageFiles,
              typeId: this.req.category,
              videoName: this.req.name,
              remark: this.req.remark,
              callback: function (file, name, size, succeed, shardSize, shardCount, getFormData) {
                let self = this
                if (succeed === 0) that.progressShow = true
                let form = getFormData(succeed, size, shardSize, shardCount, file, name)
                // 请求方法
                addReq(form).then(res => {
                  if (res.code === 200) {
                    succeed++
                    that.progressNum = Number(((succeed / shardCount) * 100).toFixed(0))
                    if (succeed < shardCount) {
                      self.callback(file, name, size, succeed, shardSize, shardCount, getFormData)
                    } else {
                      that.$Spin.hide()
                      that.$Message.success(`${that.$t('fileUpload')}${that.$t('success')}`)
                      document.getElementById('videoFile').value = ''
                      that.progressShow = false
                      that.pageLoad()
                      if (that.isSuccess) that.cancelClick()
                    }
                  } else {
                    that.$Spin.hide()
                    that.$Message.error(`${that.$t('fileUpload')}${that.$t('fail')}`)
                    that.progressShow = false
                    that.progressNum = 0
                  }
                }).catch(() => this.$Spin.hide())
              }
            })
          }
        });
      },
      // 点击编辑按钮触发
      editClick() {
        if (this.selectObj) {
          const data = this.selectObj;
          this.req.id = data.id;
          this.req.name = data.name;
          this.req.category = data.typeId;
          this.req.coverImage = data.coverImage;
          this.req.enabled = data.enabled === 1;
          this.req.remark = data.remark;
          this.drawerFlag = true;
          this.isAdd = false;
          this.drawerTitle = this.$t("edit");
        } else this.$Message.warning(this.$t("oneData"));
      },
      // 修改菜单、按钮
      updateClick() {
        this.$refs.req.validate((validate) => {
          if (validate) {
            const enabled = this.req.enabled ? 1 : 0
            let form = new FormData()
            form.append('id', this.req.id)
            form.append('name', this.req.name)
            form.append('typeId', this.req.category)
            if (this.req.imageFiles) form.append('coverImage', this.req.imageFiles[0])
            form.append('coverImageFileName', this.req.coverImage)
            form.append('enabled', String(enabled))
            form.append('remark', this.req.remark || '')
            modifyReq(form).then((res) => {
              if (res.code === 200) {
                this.selectObj = null;
                this.pageLoad();
                this.$Message.success(`${this.$t("edit")}${this.$t("success")}`);
                if (this.isSuccess) this.cancelClick();
              } else this.$Message.error(`${this.$t("edit")}${this.$t("fail")},${errorType(this, res.errorCode)}`);
            });
          }
        });
      },
      // 点击新增或修改并关闭按钮触发
      okOrUpdateClick() {
        this.isSuccess = true;
        this.isAdd ? this.okClick() : this.updateClick();
      },
      // 左侧抽屉取消
      cancelClick() {
        this.drawerFlag = false;
        this.isSuccess = false
        this.$refs.req.resetFields() //清除表单红色提示
        this.progressShow = false;
        this.progressNum = 0;
        this.req.id = '0';
        this.req.name = '';
        this.req.category = '';
        this.req.videoFiles = null;
        this.req.imageFiles = null;
        document.getElementById('imageFile').value = ''
        document.getElementById('videoFile').value = ''
        this.req.remark = '';
      },
      // 自动改变表格高度
      autoSize() {
        let height = document.body.clientHeight - 120;
        this.tableHeight = height - 60;
      },
      // 某一行高亮时触发
      currentClick(currentRow) {
        this.selectObj = currentRow;
      },
      // 排序时有效，当点击排序时触发
      sortChange(data) {
        this.req.orderField = data.key.toUpperCase();
        this.req.ascending = data.order === "asc";
        this.pageLoad();
      },
      // 选择第几页
      pageChange(index) {
        this.req.pageIndex = index;
        this.pageLoad();
      },
      // 选择一页有条数据
      pageSizeChange(index) {
        this.req.pageIndex = 1;
        this.req.pageSize = index;
        this.pageLoad();
      },
    },
  };
</script>
