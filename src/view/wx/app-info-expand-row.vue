<template>
    <div>
        <Row class="expand-row">
            <Col span="20" offset="4">
                <span class="expand-key">AppID: </span>
                <span class="expand-value">{{ row.appId }}</span>
                <Button v-if="$viewAccess('wx:appInfo:accessToken')" type="warning" @click="modal1 = true; getAccessToken(row.appId)" icon="ios-attach" ghost>查看AccessToken</Button>
                <Button v-if="$viewAccess('wx:appInfo:clearQuota')" type="warning" ghost @click="modal2 = true" icon="md-sync">api次数清零</Button>
            </Col>
        </Row>
        <Row class="expand-row">
            <Col span="20" offset="4">
                <span class="expand-key">Token: </span>
                <span class="expand-value">{{ row.token }}</span>
            </Col>
        </Row>
        <Row >
            <Col span="20" offset="4">
                <span class="expand-key">EncodingAESKey: </span>
                <span class="expand-value">{{ row.encodingAeskey }}</span>
            </Col>
        </Row>
        <Row class="expand-row">
            <Col span="20" offset="4">
                <Divider />
                <Button v-if="$viewAccess('wx:menu:info')" class="menu-button" type="primary"  icon="md-menu" @click="toMenu(row.appId, row.name)"  ghost>微信菜单</Button>
                <Button v-if="$viewAccess('wx:user:list')" class="menu-button" type="primary"  icon="md-person" @click="toUserManage(row.appId, row.name)"  ghost>用户管理</Button>
                <Button v-if="$viewAccess('wx:mass:list')" class="menu-button" type="primary"  icon="ios-chatbubbles" @click="toMessageMass(row.appId, row.name)"  ghost>微信群发</Button>
                <Button v-if="$viewAccess('wx:autoReply:list')" class="menu-button" type="primary"  icon="md-chatboxes" @click="toAutoReply(row.appId, row.name)"  ghost>自动回复</Button>
                <Button v-if="$viewAccess('wx:material:list')" class="menu-button" type="primary"  icon="ios-browsers" @click="toMaterial(row.appId, row.name)"  ghost>素材管理</Button>
                <Button v-if="$viewAccess('wx:tag:list')" class="menu-button" type="primary"  icon="md-pricetag" @click="toTagManage(row.appId, row.name)"  ghost>标签管理</Button>
                <Button v-if="$viewAccess('wx:analysis:list')" class="menu-button" type="primary"  icon="md-people" @click="toUseranalysis(row.appId, row.name)"  ghost>用户分析</Button>
            </Col>
        </Row>
      <Modal
        v-model="modal1"
        title="查看AccessToken">
        <div style=" word-wrap: break-word;word-break: break-all;">{{accessToken}}</div>
      </Modal>
      <Modal v-model="modal2" width="360">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span>api次数清零</span>
        </p>
        <div style="text-align:center">
          <p>每个月只有10次api次数清零的机会,</p>
          <p>是否确认清零?</p>
        </div>
        <div slot="footer">
          <Button type="error" @click="clearQuota(row.appId)">确认</Button>
        </div>
      </Modal>
    </div>
</template>

<script>
import { getAccessToken, clearQuota } from '@/api/wx/app-info'

export default {
  name: 'app-info-expand-row',
  props: {
    row: Object
  },
  data () {
    return {
      modal1: false,
      accessToken: '',
      modal2: false,
      modal_loading: false
    }
  },
  methods: {
    toMenu (appId, appName) {
      const route = {
        name: 'wx-menu',
        query: {
          appId,
          appName
        }
      }
      this.$router.push(route)
    },
    toAutoReply (appId, appName) {
      const route = {
        name: 'wx-auto-reply',
        query: {
          appId,
          appName
        }
      }
      this.$router.push(route)
    },
    toMaterial (appId, appName) {
      const route = {
        name: 'wx-material',
        query: {
          appId,
          appName
        }
      }
      this.$router.push(route)
    },
    toUseranalysis (appId, appName) {
      const route = {
        name: 'wx-useranalysis',
        query: {
          appId,
          appName
        }
      }
      this.$router.push(route)
    },
    toMessageMass (appId, appName) {
      const route = {
        name: 'wx-message-mass',
        query: {
          appId,
          appName
        }
      }
      this.$router.push(route)
    },
    toUserManage (appId, appName) {
      const route = {
        name: 'wx-user-manage',
        query: {
          appId,
          appName
        }
      }
      this.$router.push(route)
    },
    toTagManage (appId, appName) {
      const route = {
        name: 'wx-tag-manage',
        query: {
          appId,
          appName
        }
      }
      this.$router.push(route)
    },
    createTagParams () {
      const id = parseInt(Math.random() * 100000)
      const route = {
        name: 'params',
        params: {
          id
        },
        meta: {
          title: `动态路由-${id}`
        }
      }
      this.$router.push(route)
    },
    createTagQuery () {
      const id = parseInt(Math.random() * 100000)
      const route = {
        name: 'query',
        query: {
          id
        },
        meta: {
          title: `参数-${id}`
        }
      }
      this.$router.push(route)
    },
    getAccessToken (id) {
      console.log(id)
      getAccessToken(id).then(res => {
        this.accessToken = res.data
      })
    },
    clearQuota (id) {
      clearQuota(id).then(res => {
        this.$Notice.success({ title: '成功', desc: '清零成功' })
      })
    }

  }
}
</script>

<style scoped>
    Button{
        margin-left: 20px;
    }
    .expand-row{
        margin-bottom: 20px;
    }
    .menu-button{
        margin-top: 10px;
    }
</style>
