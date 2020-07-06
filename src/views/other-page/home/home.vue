<template>
  <div class="page-style home-style">
    <!--弹窗 -->
    <Modal :mask-closable="false" v-model="modalFlag" :title="modalTitle" @on-cancel="modalCancel">
      <div v-show="navIndex === 0">
        <Tabs v-model="bar.barValue">
          <TabPane v-for="(item, i) in bar.barList" :key="i" :label="item.name" :name="item.text"></TabPane>
        </Tabs>
        <bar-code :barCode="bar.barValue"></bar-code>
      </div>
      <div v-show="navIndex === 1">
        <qr-code :qrCode="qr.text"></qr-code>
      </div>
      <div v-show="navIndex === 2">
        <Form @submit.native.prevent>
          <FormItem>
            <Input ref="carrierInput" v-focus="navIndex === 2" search enter-button v-model="carrierObj.carrierCode"
                   @on-search="carrierSearchClick" :placeholder="$t('pleaseEnter') + $t('carrierCheck')"/>
          </FormItem>
          <FormItem>
            <div v-if="carrierObj.carrierValue" class="carrier-code"
                 :style="{backgroundColor: carrierObj.codeColor,color: carrierColor}">
              {{`${$t("carrierCheck")}:${carrierObj.carrierValue} ${$t("count")}:${carrierObj.carrierCount}`}}
            </div>
          </FormItem>
        </Form>
      </div>
      <div v-show="navIndex === 3">
        <CellGroup>
          <Cell v-for="(item, index) in $config.controlList" :key="index" :title="$t(item.title)" :to="item.to"
                target="_blank"/>
        </CellGroup>
      </div>
      <div slot="footer">
        <Button @click="modalCancel">{{ $t("cancel") }}</Button>
      </div>
    </Modal>
    <!--信息卡片-->
    <Row type="flex" justify="space-around" class-name="info-card">
      <i-col span="4">
        <info-card :cardTitle="$t('platformName')" cardTag="Core" :cardFooterTitle="$t('coreVersion')"
                   :cardFooterValue="infoObj.systemVersion">
          <h3>{{ infoObj.systemName }}</h3>
        </info-card>
      </i-col>
      <i-col span="4">
        <info-card :cardTitle="$t('userTotal')" :cardTag="$t('year')" :cardFooterTitle="$t('effectiveUser')"
                   :cardFooterValue="infoObj.userActive">
          <h3>{{ infoObj.userTotal }}</h3>
        </info-card>
      </i-col>
      <i-col span="4">
        <info-card :cardTitle="$t('onlineUser')" :cardTag="$t('hour')" :cardFooterTitle="$t('cacheSpacing')"
                   :cardFooterValue="`10${$t('minute')}`">
          <h3>{{ infoObj.userLine }}</h3>
        </info-card>
      </i-col>
      <i-col span="4">
        <info-card :cardTitle="$t('pageView')" :cardTag="$t('day')" :cardFooterTitle="$t('pageViewYear')"
                   :cardFooterValue="infoObj.pVYear">
          <h3>{{ infoObj.pVDay }}</h3>
        </info-card>
      </i-col>
      <i-col span="4">
        <info-card :cardTitle="$t('apiView')" :cardTag="$t('day')" :cardFooterTitle="$t('pageViewYear')"
                   :cardFooterValue="infoObj.apiYear">
          <h3>{{ infoObj.apiDay }}</h3>
        </info-card>
      </i-col>
    </Row>
    <!--导航卡片-->
    <Row type="flex" justify="space-around" class-name="nav-card">
      <i-col span="2" v-for="(item, i) in navList" :key="i" @click.native="navClick(i)">
        <nav-card :iconName="item.iconName" :iconColor="item.iconColor" :navName="item.navName"></nav-card>
      </i-col>
    </Row>
    <div class="time-line">
      <Timeline>
        <TimelineItem v-for="(item, i) in versionList" :key="i" :color="item.color">
          <h3>{{item.version}} {{item.title}}</h3>
          <div class="time"><Tag :color="item.color">{{item.formCreateDate}}</Tag></div>
          <pre class="content">{{item.content}}</pre>
        </TimelineItem>
      </Timeline>
    </div>
  </div>
</template>

<script>
  import {getindexjsonReq} from '@/api/organize-manager/user-manager'
  import {getentityReq} from '@/api/material-manager/carrier-check'
  import {getpagelistReq} from '@/api/system-manager/developer-center'
  import {errorType, playSound, inputSelectContent, formatDate} from '@/libs/tools'
  import InfoCard from '@/components/info-card'
  import NavCard from '@/components/nav-card'
  import QrCode from '@/components/qr-code'
  import BarCode from '@/components/bar-code'

  export default {
    name: 'home',
    components: {InfoCard, NavCard, QrCode, BarCode},
    data() {
      return {
        modalFlag: false,
        modalTitle: '',
        navIndex: null,
        qr: {
          text: '功能开发中......'
        },
        bar: {
          barValue: '~VSUFCR.',
          barList: [
            {
              name: '设置为回车结尾',
              text: '~VSUFCR.'
            },
            {
              name: '设置为table结尾',
              text: '~SUFBK29909.'
            },
            {
              name: '删除末尾',
              text: '~SUFCA2.'
            }
          ]
        },
        carrierObj: {
          carrierCode: '',
          carrierValue: '',
          carrierCount: 0,
          codeColor: ''
        },
        infoObj: {
          systemName: '',
          systemVersion: '',
          userTotal: 0,
          userLine: 0,
          userActive: 0,
          pVDay: 0,
          pVYear: 0,
          apiDay: 0,
          apiYear: 0
        },
        navList: [
          {iconName: 'iconfont icon-bar_code', iconColor: '#CCFF33', navName: this.$t('barCodeSetting')},
          {iconName: 'iconfont icon-qr_code', iconColor: '#FF3333', navName: this.$t('qrCode')},
          {iconName: 'iconfont icon-check', iconColor: '#CCFF99', navName: this.$t('carrierCheck')},
          {iconName: 'iconfont icon-barchart', iconColor: '#6699FF', navName: this.$t('publicReport')},
          {iconName: 'iconfont icon-mobile', iconColor: '#66CC33', navName: '白泽TV'},
          {iconName: 'iconfont icon-paper', iconColor: '#66CCFF', navName: '导航列表'},
          {iconName: 'iconfont icon-paper', iconColor: '#66FF66', navName: '导航列表'},
          {iconName: 'iconfont icon-paper', iconColor: '#996699', navName: '导航列表'}
        ],
        userList: [
          {name: '昆山市', count: 100},
          {name: '苏州市', count: 100},
          {name: '郑州市', count: 100},
          {name: '南京市', count: 100},
          {name: '上海市', count: 100},
          {name: '杭州市', count: 100},
          {name: '北京市', count: 100}
        ],
        formList: {
          refName: 'req',
          items: [
            {name: 'add', value: '', type: 'input', maxLength: 10},
            {name: 'edit', value: '', type: 'input'},
            {name: 'delete', value: 0, type: 'number'},
            {
              name: 'updateAndClose',
              value: 'apple',
              type: 'radio',
              children: [{name: 'apple', value: 'apple'}, {name: 'banana', value: 'banana'}]
            },
            {
              name: 'roleAuthorize',
              value: [],
              type: 'selectPage',
              multiple: true,
              keyWord: 'value',
              total: 200,
              tagsLength: 1,
              loading: false,
              children: [{name: 'apple', value: 'apple'}, {name: 'banana', value: 'banana'}]
            },
            {
              name: 'roleAuthorize',
              value: [],
              type: 'check',
              children: [{name: 'apple', value: 'apple'}, {name: 'banana', value: 'banana'}]
            }
          ],
          rules: {
            add: [{required: true, message: '请输入api名称', trigger: 'blur'}]
          },
          btnList: [
            {type: 'default', name: 'reset', value: '重置'},
            {type: 'primary', name: 'search', value: '查询'}
          ]
        },
        versionList: []
      }
    },
    computed: {
      carrierColor() {
        return this.carrierObj.carrierValue ? 'white' : ''
      }
    },
    mounted() {
      this.getIndexJson()
      this.getVersionData()
    },
    methods: {
      // 获取首页数据
      getIndexJson() {
        getindexjsonReq().then((res) => {
          if (res.code === 200) {
            this.infoObj.systemName = res.result.systemName
            this.infoObj.systemVersion = res.result.systemCoreVersion
            this.infoObj.userTotal = res.result.userTotalCount
            this.infoObj.userActive = res.result.userActiveCount
            this.infoObj.userLine = res.result.userOnLineCount
            this.infoObj.pVDay = res.result.pvDay
            this.infoObj.pVYear = res.result.pvYear
            this.infoObj.apiDay = res.result.apiDay
            this.infoObj.apiYear = res.result.apiYear
          }
        })
      },
      // 获取首页数据
      getVersionData() {
        const obj = {
          orderField: 'version', // 排序字段
          ascending: false, // 是否升序
          pageSize: 50, // 分页大小
          pageIndex: 1, // 当前页码
          data: {enabled: 1}
        };
        getpagelistReq(obj).then(res => {
          if (res.code === 200) {
            this.versionList = res.result.data || []
            this.versionList.forEach(o => {
              o.formCreateDate = o.createDate ? formatDate(o.createDate, 'yyyy-MM-dd hh:mm:ss') : null
            })
          }
        })
      },
      // 导航卡片点击事件
      navClick(index) {
        if (index < 5) {
          if (index === 4) {
            let routeData = this.$router.resolve({name: 'tv'})
            window.open(routeData.href, "_blank");
          } else {
            this.modalFlag = true
            this.modalTitle = this.navList[index].navName
            this.navIndex = index
          }
        }
      },
      // 弹窗取消事件
      modalCancel() {
        this.modalFlag = false
        this.modalTitle = ''
        this.navIndex = null
        this.carrierObj.carrierCount = 0
        this.carrierObj.carrierValue = ''
        this.carrierObj.carrierCode = ''
        this.carrierObj.codeColor = ''
      },
      // 查询组件点击查询按钮触发
      searchChange() {
      },
      // 查询组件点击查询按钮触发
      queryChange(data) {
        let num = 2
        this.formList.items[data].children.push({id: num++, name: `dks${num}`})
      },
      // 载具码点击搜索
      carrierSearchClick() {
        getentityReq({carrierId: this.carrierObj.carrierCode}).then((res) => {
          if (res.code === 200) {
            let data = res.result
            if (data) {
              this.carrierObj.carrierCount = data.totalCountUsed
              this.carrierObj.carrierValue = data.carrierId
              this.carrierObj.codeColor = data.totalCountUsed >= 0 && data.totalCountUsed <= 25 ? 'green' : data.totalCountUsed >= 26 && data.totalCountUsed <= 29 ? '#CCFF33' : '#FF3333'
              if (this.carrierObj.codeColor === 'green') playSound(this.$config.tipsVoice.OkTips)
              else if (this.carrierObj.codeColor === '#CCFF33') playSound(this.$config.tipsVoice.WarningTips)
              else playSound(this.$config.tipsVoice.NgTips)
            } else this.$Message.error(`${this.$t('carrierCheck')}${this.$t('isEmpty')}`)
            inputSelectContent(this.$refs.carrierInput)
          } else this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
        })
      }
    }
  }
</script>

<style scoped lang="less">
  ul li {
    list-style-type: none;
    margin-top: 12px;
  }

  .home-style {
    overflow-y: auto;
  }

  .info-card {
    padding-top: 10px;
  }

  .nav-card {
    margin-top: 16px;
  }

  .carrier-code {
    padding: 5px 10px;
    text-align: center;
  }

  .charts-card {
    margin: 16px;

    .charts-mr-8 {
      margin-right: 8px;
    }

    &-col {
      display: flex;
      justify-content: flex-end;
    }

    &-li {
      line-height: 24px;
      text-align: right;
    }
  }

  .time-line {
    padding: 16px;

    .time {
      font-size: 14px;
      margin: 5px 0;
    }

    pre {
      font-size: 14px;
      padding-left: 5px;
      margin: 5px 0;
    }
  }
</style>
