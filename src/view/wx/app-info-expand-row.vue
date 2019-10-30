<template>
    <div>
        <Row class="expand-row">
            <Col span="20" offset="4">
                <span class="expand-key">AppID: </span>
                <span class="expand-value">{{ row.appId }}</span>
                <Button type="warning" icon="ios-attach"  ghost>查看AccessToken</Button>
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
                <Button type="primary"  icon="md-menu" @click="toMenu(row.appId, row.name)"  ghost>微信菜单</Button>
                <Button type="primary"  icon="md-chatboxes" @click="toAutoReply(row.appId, row.name)"  ghost>自动回复</Button>
                <Button type="primary"  icon="ios-browsers" @click="toMaterial(row.appId, row.name)"  ghost>素材管理</Button>
                <Button type="primary"  icon="ios-chatbubbles" @click="toMessageMass(row.appId, row.name)"  ghost>微信群发</Button>
              <Button type="primary"  icon="ios-open" @click="toUseranalysis(row.appId, row.name)"  ghost>用户分析</Button>
              <Button type="primary"  icon="ios-browsers" @click="toUserManage(row.appId, row.name)"  ghost>用户管理</Button>
              <Button type="primary"  icon="ios-browsers" @click="toTagManage(row.appId, row.name)"  ghost>标签管理</Button>
            </Col>
        </Row>
    </div>
</template>

<script>
export default {
  name: 'app-info-expand-row',
  props: {
    row: Object
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
</style>
