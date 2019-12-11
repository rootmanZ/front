<template>
  <div>
    <modal :title="dialogStatus" v-model="dialogFormVisible" :mask-closable="false" :closable="false"
           :width="700">
      <Form :model="tempActivity" :label-width="100" inline>
        <FormItem label="活动主题图" prop="">

        </FormItem>
        <br>
        <FormItem label="活动标题">
          <Input v-model="tempActivity.title" :maxlength="50" disabled></Input>
        </FormItem>
        <FormItem label="状态">
          <Input v-model="tempActivity.status" :maxlength="50" disabled></Input>
        </FormItem>
        <br>
        <Button class="search-btn" type="primary" @click="">编辑</Button>
        <Button class="search-btn" type="error" @click="">下架</Button>
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">活动信息</Divider>
        <FormItem label="活动起止时间：">
          <span>{{tempActivity.startTime}}</span>至<span>{{tempActivity.endTime}}</span>
        </FormItem>
        <FormItem label="活动类型：">
          <span>{{tempActivity.actType}}</span>
        </FormItem>
        <br>
        <FormItem label="活动简介">
          <Input v-model="tempActivity.summary" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                 style="width: 520px" disabled/>
        </FormItem>
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">规则信息</Divider>
        <FormItem label="抽奖形式：">
          <span>{{tempActivity.actConfigExpress.actTypeConfig.playType}}</span>
        </FormItem>
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">奖品池</Divider>
        <!--<FormItem label="AppSecret" prop="appSecret">-->
        <!--<Input v-model="" :maxlength="200"></Input>-->
        <!--</FormItem>-->
        <!--<Row>-->
        <!--<FormItem label="Token" style="width: 100%">-->
        <!--<Input v-model="temp.token" :maxlength="32"></Input>-->
        <!--</FormItem>-->
        <!--</Row>-->
        <!--<Row>-->
        <!--<FormItem label="encodingAeskey" style="width: 100%">-->
        <!--<Input v-model="temp.encodingAeskey" :maxlength="50"></Input>-->
        <!--</FormItem>-->
        <!--</Row>-->
        <!--<FormItem label="公众号原始ID" prop="originalId">-->
        <!--<Input v-model="temp.originalId" :maxlength="32"></Input>-->
        <!--</FormItem>-->
      </Form>
      <div slot="footer">
        <Button @click="handleClose">关闭</Button>
      </div>
    </modal>
  </div>
</template>

<script>

  export default {
    name: 'activity-detail',
    components: {},
    data() {
      return {
        dialogFormVisible: false,
        dialogStatus: '',
        tempActivity: {
          id: null,
          title: null,
          actType: '',
          actPic: null,
          summary: null,
          context: null,
          startTime: null,
          endTime: null,
          status: '',
          actConfigExpress: {
            actTypeConfig: {
              playType: null
            },
            actParticipantConfig: {
              participantType: [],
              participantValue: {}
            },
            actNumberConfig: {
              limit: null,
              dailyLimit: null
            },
            actShareConfig: {
              shareFlag: null,
              shareTitle: null,
              shareIcon: null,
              shareDesc: null
            }
          },
          actPrizes: []
        },
      }
    },
    created() {
      this.getList()
    },
    methods: {

      resetTempActivity() {
        this.tempActivity = {
          id: null,
          title: null,
          actType: '',
          actPic: null,
          summary: null,
          context: null,
          startTime: null,
          endTime: null,
          status: '',
          actConfig: {},
          actPrizes: []
        }
      },
      handleClose() {
        this.dialogFormVisible = false;
        this.resetTempActivity()
      }
    }
  }
</script>

<style>


</style>
