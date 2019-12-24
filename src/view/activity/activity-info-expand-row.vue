<template>
  <div>

    <Row type="flex" align="middle" class="expand-row">
      <Col span="4" offset="3" class="code-row-bg">
      <span><img class="expand-row-actPic" :src="row.actPic"></span>
      </Col>
      <Col span="10" offset="3" class="code-row-bg">
      <span class="expand-key">活动简介: </span><br>
      <span class="expand-value">{{row.summary}}</span><br><br><br>
      <span class="expand-key">活动有效期: </span><br>
      <span class="expand-value">{{row.startTime}} — {{row.endTime}}</span>
      </Col>
    </Row>

    <Divider/>

  </div>
</template>

<script>

  export default {
    name: 'activity-info-expand-row',
    props: {
      row: Object
    },
    data() {
      return {}
    },
    methods: {}
  }
</script>

<style scoped>
  Button {
    margin-left: 20px;
  }

  .expand-row {
    margin-bottom: 20px;
  }

  .expand-row-actPic {
    width: 200px;
    height: 200px;

  }
  .expand-key{
    font-size: 14px;
    color: #464c5b;
  }

  .menu-button {
    margin-top: 10px;
  }
</style>
