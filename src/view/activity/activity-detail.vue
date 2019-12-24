<template>
  <div>
    <modal :title="dialogStatusDetail" v-model="dialogFormVisibleDetail" :mask-closable="false" :closable="false"
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
          <Modal title="View Image" v-model="visibleAct">
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
        <!--<FormItem label="内容及说明" prop="context">-->
        <!--&lt;!&ndash;富文本编辑器&ndash;&gt;-->
        <!--</FormItem>-->
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">规则信息</Divider>


        <FormItem label="抽奖形式" prop="">
          <Input v-model="playTypeMap[tempActivity.actConfigExpress.actTypeConfig.playType]" style="width:200px"
                 disabled/>
        </FormItem>
        <FormItem label="参与条件" prop="">
          <CheckboxGroup v-model="tempActivity.actConfigExpress.actParticipantConfig.participantType">
            <Checkbox label=0 disabled>注册用户</Checkbox>
            <Checkbox label=1 disabled>关注用户</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="参与次数" prop="">
          活动期间最多有&nbsp<Input v-model="tempActivity.actConfigExpress.actNumberConfig.limit" size="small"
                             style="width:40px;height:20px" disabled></Input>&nbsp次抽奖机会
          &nbsp&nbsp&nbsp
          每天最多有&nbsp<Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyLimit" size="small"
                           style="width:40px;height:20px" disabled></Input>&nbsp次抽奖机会
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
                <Modal title="View Image" v-model="visibleShareIcon">
                  <img :src="tempActivity.actConfigExpress.actShareConfig.shareIcon" v-if="visibleShareIcon"
                       style="width: 100%">
                </Modal>
              </div>
            </div>
            描述：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareDesc" style="width: 520px"
                      disabled/>
          </div>
        </FormItem>
        <br>
        <FormItem label="活动详情说明" disabled>
          <a @click="editorShow = true" v-if="editorShow === false">点我查看效果</a>&nbsp&nbsp&nbsp
          <a @click="editorShow = false" v-if="editorShow === true">收起</a>
          <editor ref="editor" :value="tempActivity.context" disabled v-if="editorShow"></editor>
        </FormItem>
        <!--抽奖类活动才有奖品-->
        <div v-if="tempActivity.actType === 0">
          <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">奖品池</Divider>
          <Table :data="prizesList" :columns="columns" :loading="listLoading" :border="true">
            <template slot="prizeType" slot-scope="scope">
              {{prizeTypeMap[scope.row.prizeType]}}
            </template>
            <template slot="level" slot-scope="scope">
              {{levelMap[scope.row.level]}}
            </template>
            <template slot="virtualType" slot-scope="{row}">
              {{virtualTypeMap[row.prizeExtExpress.virtualType]}}
            </template>
            <template slot="value" slot-scope="{row}">
              {{(row.prizeExtExpress.virtualValue.value)/100}}
            </template>
            <template slot="probability" slot-scope="{row}">
              {{row.prizeExtExpress.probability}}
            </template>
            <template slot-scope="{ row, index }" slot="action">
              <Button v-if="$viewAccess('act:prize-win:list')" type="primary" size="small" style="margin-right: 5px"
                      @click="toPrizeWin(row.id,row.name)">查看中奖纪录
              </Button>
            </template>
          </Table>
        </div>
      </Form>
      <!--<div slot="footer">-->
      <!--<Button @click="handleClose">关闭</Button>-->
      <!--</div>-->
    </modal>
  </div>
</template>

<script>
  import editor from '_c/editor/editor.vue'
  import Divider from 'iview/src/components/divider/divider'

  export default {
    name: 'activity-detail',
    components: {
      Divider, editor
    },
    data() {
      return {
        editorShow: false,
        dialogFormVisibleDetail: false,
        dialogStatusDetail: '',
        listLoading: false,
        tempActivity: {},
        prizesList: [],
        visibleAct: false,
        visibleShareIcon: false,

        columns: [
          {
            title: '奖品名称',
            key: 'name'
          },
          {
            title: '奖品类型',
            slot: 'prizeType'
          },
          {
            title: '奖项等级',
            slot: 'level'
          },
          {
            title: '虚拟奖品类型',
            slot: 'virtualType'
          },
          {
            title: '虚拟奖品值(元)',
            slot: 'value'
          },
          {
            title: '奖项总数',
            key: 'totalNum'
          },
          {
            title: '每日奖品数',
            key: 'dailyNum'
          },
          {
            title: '中奖权重（%）',
            slot: 'probability'
          },
          {
            title: '已中奖数',
            key: 'winNum'
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        playTypeMap: {
          0: '幸运时光机',
          1: '大转盘',
          2: '九宫格',
          3: '刮刮乐'
        },
        statusMap: {
          0: '未开始',
          1: '进行中',
          2: '已下架'
        },
        actTypeMap: {
          0: '抽奖类活动',
          1: '礼包类活动'
        },
        prizeTypeMap: {
          0: '未中奖',
          1: '虚拟物品',
          2: '邮寄实物',
          3: '线下处理物品'
        },
        virtualTypeMap: {
          0: '优惠券',
          1: '积分'
        },
        levelMap: {
          1: '一等奖',
          2: '二等奖',
          3: '三等奖'
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
        this.prizesList = this.tempActivity.actPrizes
      },
      handleClose() {
        this.dialogFormVisibleDetail = false
        this.resetDataDetail()
      },
      //跳转到中奖管理
      toPrizeWin(id, name) {
        const route = {
          path: '/activity/activity-prize-winInfo',
          query: {
            id,
            name
          }
        }
        this.dialogFormVisibleDetail = false
        this.$router.push(route)
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
