<template>
  <div class="login">
    <div class="top_con">
      <a href="#/TV" target="_blank">白泽TV</a>
      <Dropdown @on-click="openPage">
        <span>公共报表</span>
        <DropdownMenu slot="list">
          <DropdownItem
              v-for="(item, index) in $config.controlList"
              :key="index"
              :name='item.to'
          >
            {{ $t(item.title) }}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div class="login-con">
      <Card
          icon="log-in"
          title="欢迎登录 (新精益生产系统)"
          :bordered="false"
          style="opacity: 0.75;"
      >
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit" :loginLoading="loginLoading"></login-form>
        </div>
      </Card>
    </div>
    <div class="footer">
      <span>昆山立讯精密 - BU22大数据开发</span>
      <span class="microsoft_r" @click="handleSpeak('白泽开发团队真牛逼,长得还好看,说话还好听')">
        © 2020 白泽开发团队
      </span>
    </div>
  </div>
</template>

<script>
  import LoginForm from "@/components/login-form";
  import {mapMutations, mapActions} from "vuex";
  import {localSave} from "@/libs/utils";
  import {getNowToDate, errorType, speak} from "@/libs/tools";

  export default {
    components: {
      LoginForm,
    },
    name: "login",
    data() {
      return {
        loginLoading: false
      }
    },
    methods: {
      ...mapActions(["handleLogin", "handleLogOut"]),
      ...mapMutations(["setLocking"]),
      handleSubmit({userName, password}) {
        this.loginLoading = !this.loginLoading
        this.handleLogin({userName, password}).then(() => {
          this.setLocking(password);
          localSave("locked", 0);
          localSave("timer", getNowToDate(this.$store.state._setTimeValue));
          localSave("logoutTimer", getNowToDate(this.$store.state._setLoginOutTimeValue));
          this.loginLoading = !this.loginLoading
          this.$router.push({name: this.$config.homeName}, () => {});
        }).catch((error) => {
          this.loginLoading = !this.loginLoading
          if (error.error === "invalid_grant") this.$Message.error(errorType(this, error.error_description));
          else if (error.error === "invalid_scope") this.$Message.error(this.$t("invalidScope"));
          else if (error.error === '"invalid_client"') this.$Message.error(this.$t("invalidClient"));
          else {
            this.$Message.error(this.$t("errNetwork"));
            this.handleLogOut();
          }
        });
      },
      // 语音播报的函数
      handleSpeak(text) {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
          this.$Message.error('IE浏览器不支持本功能')
        } else speak({text})
      },
      // 语音停止
      handleStop() {
        speak({closeSpeakTime: 1})
      },
      openPage(item) {
        let routeData = this.$router.resolve({name: item});
        window.open(routeData.href, "_blank");
      },
    },
  };
</script>

<style scoped lang="less">
  @import "./login.less";

  .footer {
    width: 100%;
    background-color: #333;
    font-weight: 400;
    line-height: 35px;
    padding: 0 20px 0 49px;
    position: absolute;
    bottom: 0;

    a, span {
      color: #666;
      margin-right: 24px;

      &:hover {
        color: #9a9a9a;
      }
    }

    .microsoft_r {
      cursor: pointer;
      position: absolute;
      right: 10px;
      bottom: 0;
    }
  }

  .top_con {
    padding: 0 20px 0 49px;
    position: absolute;
    top: 10px;

    a, span {
      cursor: pointer;
      color: #fff;
      opacity: 0.8;
      margin-right: 24px;

      &:hover {
        opacity: 1;
      }
    }
  }
</style>
