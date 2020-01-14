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
        <!--祝福主题列表-->
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">祝福主题列表</Divider>
        <Table ref="tablesMain" :data="blessingList" :columns="columns" :loading="listLoadingBlessing" :border="true">
          <template slot="blessingType" slot-scope="scope">
            {{blessingTypeMap[scope.row.blessingType]}}
          </template>
          <template slot-scope="{row}" slot="cardTemplates">
            {{(row.actBlessingThemeExtExPress.cardTemplates).length}}
          </template>
          <template slot-scope="{row}" slot="musics">
            {{(row.actBlessingThemeExtExPress.musics).length}}
          </template>
          <template slot-scope="{row}" slot="videos">
            {{(row.actBlessingThemeExtExPress.videos).length}}
          </template>
          <template slot-scope="{row}" slot="texts">
            {{(row.actBlessingThemeExtExPress.texts).length}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button v-if="$viewAccess('act:blessingTheme:info')" type="primary" size="small" style="margin-right: 5px"
                    @click="showBlessingTheme(index)">查看
            </Button>
          </template>
        </Table>

        <modal title="主题详情" v-model="dialogFormVisibleBlessingTheme" :mask-closable="false" :width="750">
          <!-------------------------------主题卡模板列表--------------------------->
          <Divider orientation="left" style="font-size: 16px">主题卡列表</Divider>
          <Card v-for="(cardTemplate,index) in tempBlessing.actBlessingThemeExtExPress.cardTemplates"
                class="img-item"
                style="height:150px;width:180px" :key="index+'card'">
            <div slot="title" style="height:10px;width:160px;font-size:11px;font-weight:900">{{cardTemplate.name}}</div>
            <Row :gutter="16">
              <Col span="8">
              <div>
                <div class="demo-upload-list" v-if="cardTemplate.coverPic !== ''">
                  <img :src=cardTemplate.coverPic>
                  <div class="demo-upload-list-cover">
                    <Icon type="ios-eye-outline" @click.native="visibleCoverPic=true"></Icon>
                  </div>
                </div>
                <Modal title="图片查看" v-model="visibleCoverPic">
                  <img :src="cardTemplate.coverPic" v-if="visibleCoverPic" style="width: 100%">
                </Modal>
              </div>
              </Col>
              <Col span="8" offset="4">
              <div>
                <div class="demo-upload-list" v-if="cardTemplate.backgroundPic !== ''">
                  <img :src=cardTemplate.backgroundPic>
                  <div class="demo-upload-list-cover">
                    <Icon type="ios-eye-outline" @click.native="visibleBackgroundPic= true"></Icon>
                  </div>
                </div>
                <Modal title="图片查看" v-model="visibleBackgroundPic">
                  <img :src="cardTemplate.backgroundPic" v-if="visibleBackgroundPic" style="width: 100%">
                </Modal>
              </div>
              </Col>
            </Row>
            <Row :gutter="16">
              <Col span="8" offset="2">
              <div style="font-size: 12px">封面</div>
              </Col>
              <Col span="8" offset="4">
              <div style="font-size: 12px">背景</div>
              </Col>
            </Row>
          </Card>
          <!-------------------------------音乐列表--------------------------------->
          <Divider orientation="left" style="font-size: 16px">音乐列表</Divider>
          <span v-for="(music,index) in tempBlessing.actBlessingThemeExtExPress.musics"
                style="width:200px;text-align:center;font-weight:900" :key="index+'music'">
                  <Icon color="#2d8cf0" type="md-musical-notes" size="20"/>
                  {{music.name}}&nbsp&nbsp&nbsp&nbsp
            <br v-if="(index+1)%3 === 0">
           </span>
          <!-------------------------------视频列表--------------------------------->
          <Divider orientation="left" style="font-size: 16px">视频列表</Divider>
          <span v-for="(video,index) in tempBlessing.actBlessingThemeExtExPress.videos"
                style="font-weight:900" :key="index+'video'">
                  <Icon color="#2d8cf0" type="md-videocam" size="20"/>
                  {{video.name}}&nbsp&nbsp&nbsp&nbsp
            <br v-if="(index+1)%3 === 0">
          </span>
          <!-------------------------------祝福语列表--------------------------------->
          <Divider orientation="left" style="font-size: 16px">祝福语列表</Divider>
          <div v-for="(item,index) of tempBlessing.actBlessingThemeExtExPress.texts" :key="index+'text'">
            名称：<Input type="text" style="width: 200px" readonly
                      v-model="tempBlessing.actBlessingThemeExtExPress.texts[index].name"></Input>
            内容：<Input type="textarea" :autosize="{minRows: 2,maxRows: 3}" style="width: 400px" readonly
                      v-model="tempBlessing.actBlessingThemeExtExPress.texts[index].content"></Input>
          </div>

        </modal>

      </Form>

    </modal>
  </div>
</template>

<script>
  import editor from '_c/editor/editor.vue'
  import Divider from 'iview/src/components/divider/divider'

  export default {
    name: 'activity-detail-blessing',
    components: {
      Divider, editor
    },
    data() {
      return {
        editorShow: false,
        visibleCoverPic: false,
        visibleBackgroundPic: false,
        dialogFormVisibleBlessingTheme: false,
        dialogFormVisibleDetail: false,
        dialogStatusDetail: '',
        listLoadingBlessing: false,
        tempActivity: {},
        tempBlessing: {
          id: null,
          actId: null,
          blessingType: null,
          name: null,
          orderNo: null,
          description: null,
          //合作商
          entId: '',
          entName: '',
          //扩展信息
          themeExt: null,
          actBlessingThemeExtExPress: {
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
        },
        //祝福主题
        blessingList: [],
        columns: [
          {
            title: '主题名称',
            key: 'name'
          },
          {
            title: '祝福类型',
            slot: 'blessingType'
          },
          {
            title: '排序',
            key: 'orderNo',
            width: 80
          },
          {
            title: '主题描述',
            key: 'description',
            tooltip: true
          },
          // {
          //   title: '合作商',
          //   key: 'endName',
          //   tooltip: true
          // },
          {
            title: '主题卡数量',
            slot: 'cardTemplates'
          },
          {
            title: '音乐库数量',
            slot: 'musics'
          },
          {
            title: '视频库数量',
            slot: 'videos'
          },
          {
            title: '祝福语库数量',
            slot: 'texts',
            width: 120
          },
          {
            title: '操作',
            slot: 'action',
            width: 80,
            align: 'center'
          }
        ],
        blessingTypeMap: {
          0: '节日',
          1: '社会关系',
          2: '生日',
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
        this.blessingList = this.tempActivity.actBlessingThemes
      },
      handleClose() {
        this.dialogFormVisibleDetail = false
        this.resetDataDetail()
      },
      showBlessingTheme(index) {
        this.tempBlessing = this.blessingList[index]
        this.dialogFormVisibleBlessingTheme = true
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
          },
          actBlessingThemes: []
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
