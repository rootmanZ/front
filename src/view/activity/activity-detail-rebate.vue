<template>
  <div>
    <modal :title="dialogStatusDetail" v-model="dialogFormVisibleDetail" :mask-closable="false"
           :width="1000">
      <Form :model="tempActivity" :label-width="100" inline>
        <FormItem label="活动主题">
          <Input v-model="tempActivity.title" style="width: 250px" disabled></Input>
        </FormItem>
        <FormItem label="状态">
          <Input v-model="statusMap[tempActivity.status]" style="width: 80px" disabled></Input>
        </FormItem>
        <br>
        <FormItem label="活动主题图" prop="">
          <div class="demo-upload-list">
            <img :src=tempActivity.actPic>
            <div class="demo-upload-list-cover">
              <Icon type="ios-eye-outline" @click="handleActView"></Icon>
            </div>
          </div>
          <Modal title="图片查看" v-model="visibleAct">
            <img :src="tempActivity.actPic" v-if="visibleAct" style="width: 100%">
          </Modal>
        </FormItem>
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">活动信息</Divider>
        <FormItem label="活动起止时间">
          <DatePicker :value="tempActivity.startTime"
                      type="datetime"
                      formart="yyyy-MM-dd"
                      disabled></DatePicker>
          &nbsp&nbsp至&nbsp&nbsp
          <DatePicker :value="tempActivity.endTime"
                      type="datetime"
                      formart="yyyy-MM-dd"
                      disabled></DatePicker>
        </FormItem>
        <FormItem label="活动类型">
          <Input v-model="actTypeMap[tempActivity.actType]" :maxlength="30" disabled></Input>
        </FormItem>
        <br>
        <FormItem label="活动简介">
          <Input v-model="tempActivity.summary" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                 style="width: 520px" disabled/>
        </FormItem>
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">规则信息</Divider>
        <FormItem label="参与条件" prop="">
          <CheckboxGroup v-model="tempActivity.actConfigExpress.actParticipantConfig.participantType">
            <Checkbox label=0 disabled>注册用户</Checkbox>
            <Checkbox label=1 disabled>关注用户</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <br>
        <FormItem label="参与次数" prop="">
          活动期间最多可制作&nbsp<Input v-model="tempActivity.actConfigExpress.actNumberConfig.limit" size="small"
                               style="width:100px;height:20px" disabled></Input>&nbsp个祝福
          &nbsp&nbsp&nbsp
          每天最多可制作&nbsp<Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyLimit" size="small"
                             style="width:100px;height:20px" disabled></Input>&nbsp个祝福
        </FormItem>

        <FormItem label="分享" prop="" disabled>
          <RadioGroup v-model="tempActivity.actConfigExpress.actShareConfig.shareFlag">
            <Radio :label="1" disabled>是</Radio>
            <Radio :label="0" disabled>否</Radio>
          </RadioGroup>
          <div v-if="tempActivity.actConfigExpress.actShareConfig.shareFlag === 1">
            <div>
              <div style="display:inline-block;vertical-align:middle">
                标题：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareTitle" style="width: 350px"
                          disabled/></div>
              &nbsp&nbsp&nbsp
              <!--图片上传组件-->
              <div style="display:inline-block;vertical-align:middle">图片：&nbsp</div>
              <div style="display:inline-block;vertical-align:middle">
                <div class="demo-upload-list">
                  <img :src=tempActivity.actConfigExpress.actShareConfig.shareIcon>
                  <div class="demo-upload-list-cover">
                    <Icon type="ios-eye-outline" @click="handleActView"></Icon>
                  </div>
                </div>
                <Modal title="图片查看" v-model="visibleShareIcon">
                  <img :src="tempActivity.actConfigExpress.actShareConfig.shareIcon" v-if="visibleShareIcon"
                       style="width: 100%">
                </Modal>
              </div>
            </div>
            <br>
            描述：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareDesc" style="width: 520px"
                      disabled/><br><br>
            链接：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareUrl" style="width: 520px"
                      type="textarea" :autosize="{minRows: 2,maxRows: 8}" disabled/>
          </div>
        </FormItem>
        <br>
        <FormItem label="活动详情说明" disabled>
          <a @click="editorShow = true" v-if="editorShow === false">点我查看效果</a>&nbsp&nbsp&nbsp
          <a @click="editorShow = false" v-if="editorShow === true">收起</a>
          <editor v-if="editorShow" ref="editor" :value="tempActivity.context" disabled></editor>
        </FormItem>

        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0;">返佣奖励设置</Divider>

        <template v-for="(item,index) in couponMultipleSelection">
          <Col :span="4" :offset="1">
          <div class="coupon-card" :key="index">
            <div class="couponAt">指定：{{item.limit}}元 原始：{{item.amount}}元</div>
            <br>
            <div class="couponName">{{item.couponName}}</div>
            <div class="entName">{{item.entName}}</div>
          </div>
          </Col>
        </template>
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">推荐车场设置</Divider>
        <div>
          已选择{{parkMultipleSelection.length}}个停车场:
          <div class="selectParkListContent">
            <template v-for="(item,index) in parkMultipleSelection">
              <div class="parkInfoItem" :key="index">{{item.parkName}}</div>
            </template>
          </div>
        </div>
      </Form>

    </modal>
  </div>
</template>

<script>
  import editor from '_c/editor/editor.vue'
  import Divider from 'iview/src/components/divider/divider'

  export default {
    name: 'activity-detail-rebate',
    components: {
      Divider, editor
    },
    data() {
      return {
        editorShow: false,
        visibleCoverPic: false,
        visibleBackgroundPic: false,
        dialogFormVisibleRebateTheme: false,
        dialogFormVisibleDetail: false,
        dialogStatusDetail: '',
        listLoadingRebate: false,
        tempActivity: {},
        tempRebate: {
          id: null,
          actId: null,
          rebateType: null,
          name: null,
          orderNo: null,
          description: null,
          //合作商
          entId: '',
          entName: '',
          //扩展信息
          themeExt: null,
          actRebateThemeExtExPress: {
            cardTemplates: [],
            musics: [],
            videos: [],
            texts: []
          }
        },
        visibleAct: false,
        visibleShareIcon: false,
        statusMap: {
          0: '未开始',
          1: '进行中',
          2: '已下架'
        },
        actTypeMap: {
          0: '抽奖类活动',
          1: '礼包类活动',
          2: '祝福类活动'
        }
      }
    },
    created() {
    },
    methods: {
      handleActView() {
        this.visibleAct = true;
      },
      //获取父组件赋值
      getActivityValue(val) {
        this.tempActivity = val
        this.couponMultipleSelection = this.tempActivity.couponList
        this.parkMultipleSelection = this.tempActivity.parkList
      },
      handleClose() {
        this.dialogFormVisibleDetail = false
        this.resetDataDetail()
      },
      resetDataDetail() {
        this.tempActivity = {
          id: null,
          title: null,
          actType: '',
          actPic: '',
          summary: null,
          context: '',
          rangeTime: [],
          startTime: null,
          endTime: null,
          status: '',
          actConfigExpress: {
            actTypeConfig: {
              templateId: null,
              playType: null
            },
            actParticipantConfig: {
              participantType: [],
              participantValue: null
            },
            actNumberConfig: {
              limit: null,
              dailyLimit: null
            },
            actShareConfig: {
              shareFlag: 0,
              shareTitle: null,
              shareIcon: '',
              shareDesc: null
            }
          }
        }
      }
    }
  }
</script>

<style>
  .demo-upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .demo-upload-list img {
    width: 100%;
    height: 100%;
  }

  .demo-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .demo-upload-list:hover .demo-upload-list-cover {
    display: block;
  }

  .demo-upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>
