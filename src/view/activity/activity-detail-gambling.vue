<template>
  <div>
    <modal :title="dialogStatusDetail" v-model="dialogFormVisibleDetail" :mask-closable="false"
           :width="1200">
      <Form :model="tempActivity" :label-width="150" inline>
        <Row>
          <Col :span="8">
          <FormItem label="活动主题">
            <Input v-model="tempActivity.title" style="width: 250px" readonly></Input>
          </FormItem>
          <FormItem label="状态">
            <Input v-model="statusMap[tempActivity.status]" style="width: 80px" readonly></Input>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="活动主题图">
            <ImgUpload ref="actPic"
                       :requiredWidth="100"
                       :requiredHeight="100"
                       :show-px="false"
                       :opt-status="dialogStatus"
                       :initUrl="tempActivity.actPic"
                       @getImgUrl="getImgData($event,'indexBackground')"/>
          </FormItem>
          </Col>
        </Row>

        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">活动信息</Divider>
        <FormItem label="活动起止时间">
          <DatePicker :value="tempActivity.startTime"
                      type="datetime"
                      formart="yyyy-MM-dd"
                      readonly></DatePicker>
          &nbsp&nbsp至&nbsp&nbsp
          <DatePicker :value="tempActivity.endTime"
                      type="datetime"
                      formart="yyyy-MM-dd"
                      readonly></DatePicker>
        </FormItem>
        <FormItem label="活动类型">
          <Input v-model="actTypeMap[tempActivity.actType]" :maxlength="30" readonly></Input>
        </FormItem>
        <br>
        <FormItem label="活动简介">
          <Input v-model="tempActivity.summary" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                 style="width: 520px" readonly/>
        </FormItem>
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">规则信息</Divider>
        <FormItem label="参与条件">
          <CheckboxGroup v-model="tempActivity.actConfigExpress.actParticipantConfig.participantType">
            <Checkbox label=0 disabled>注册用户</Checkbox>
            <Checkbox label=1 disabled>关注用户</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <br>
        <FormItem label="活动详情说明" disabled>
          <a @click="editorShow = true" v-if="editorShow === false">点我查看效果</a>&nbsp&nbsp&nbsp
          <a @click="editorShow = false" v-if="editorShow === true">收起</a>
          <editor v-if="editorShow" ref="editor" :value="tempActivity.context" disabled></editor>
        </FormItem>
        <br>
        <FormItem label="参与条件">
          <CheckboxGroup v-model="tempActivity.actConfigExpress.actParticipantConfig.participantType">
            <Checkbox label=0 disabled>注册用户</Checkbox>
            <Checkbox label=1>关注用户</Checkbox>
          </CheckboxGroup>
        </FormItem>

        <!--参与次数配置-->
        <Row>
          <Col span="14">
          <FormItem label="额外获得博饼机会">
            每日每个好友首次点击分享链接可额外获得&nbsp
            <Input v-model="tempActivity.actConfigExpress.actNumberConfig.shareAddNum"
                   size="small"
                   style="width:100px;height:20px"
                   :maxlength="10"
                   readonly>
            </Input>
            &nbsp次博饼机会
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem>
            每人每日最多可额外获得&nbsp
            <Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyShareAddLimit"
                   size="small"
                   style="width:100px;height:20px" :maxlength="10" readonly>
            </Input>
            &nbsp次博饼机会
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="14">
          <FormItem>
            每日每个账号每支付成功一笔订单（不限业务）可额外获得&nbsp
            <Input v-model="tempActivity.actConfigExpress.actNumberConfig.payAddNum"
                   size="small"
                   style="width:100px;height:20px"
                   readonly>
            </Input>
            &nbsp次博饼机会
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem>
            每人每日最多可额外获得&nbsp
            <Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit"
                   size="small"
                   style="width:100px;height:20px"
                   :maxlength="10"
                   readonly>
            </Input>
            &nbsp次博饼机会
          </FormItem>
          </Col>
        </Row>

        <!--活动模板设置-->
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">活动模板设置</Divider>
        <Alert show-icon>活动模板：（图片格式支持.jpg .png .gif，建议按图片的分辨率上传显示效果最好，大小建议不超过1M；具体位置查阅参考示例图）</Alert>

        <!--首页设置-->
        <Divider orientation="center" style="font-size: 14px;color:#19be6b">首页设置</Divider>
        <Row>
          <Col :span="6">
          <FormItem label="首页背景图">
            <ImgUpload ref="indexBackground"
                       :requiredWidth="100"
                       :requiredHeight="100"
                       :show-px="false"
                       :opt-status="dialogStatus"
                       :initUrl="tempActivity.actConfigExpress.actTypeConfig.indexBackground"
                       @getImgUrl="getImgData($event,'indexBackground')"/>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="首页主题字图">
            <ImgUpload ref="indexThemeImg"
                       :requiredWidth="100"
                       :requiredHeight="100"
                       :show-px="false"
                       :opt-status="dialogStatus"
                       :initUrl="tempActivity.actConfigExpress.actTypeConfig.indexThemeImg"
                       @getImgUrl="getImgData($event,'indexThemeImg')"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="纯色背景颜色值">
            <Row>
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.indexBackColor"
                     style="width: 100px"
                     :maxlength="10"
                     readonly/>
              <ColorPicker disabled v-model="tempActivity.actConfigExpress.actTypeConfig.indexBackColor"/>
            </Row>
          </FormItem>
          </Col>
          <Col :span="4">
          <Button @click="showTempImg('indexVisible')"
                  size="small"
                  type="info"> 参看参考示例图
          </Button>
          </Col>
        </Row>

        <!--其他页设置-->
        <Divider orientation="center" style="font-size: 14px;color:#19be6b">其他页设置</Divider>
        <Row>
          <Col :span="6">
          <FormItem label="其他页背景图">
            <ImgUpload ref="otherBackground"
                       :requiredWidth="100"
                       :requiredHeight="100"
                       :show-px="false"
                       :opt-status="dialogStatus"
                       :initUrl="tempActivity.actConfigExpress.actTypeConfig.otherBackground"
                       @getImgUrl="getImgData($event,'otherBackground')"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="纯色背景颜色值">
            <Input v-model="tempActivity.actConfigExpress.actTypeConfig.otherBackColor" style="width: 100px"
                   :maxlength="10"
                   readonly/>
            <ColorPicker disabled v-model="tempActivity.actConfigExpress.actTypeConfig.otherBackColor"/>
          </FormItem>
          </Col>
          <Col :span="4">
          <Button @click="showTempImg('otherVisible')"
                  size="small"
                  type="info"> 参看参考示例图
          </Button>
          </Col>
        </Row>

        <Row>
          <Col :span="6">
          <FormItem label="其他页说明框背景图">
            <ImgUpload ref="otherDescBackground"
                       :requiredWidth="100"
                       :requiredHeight="100"
                       :show-px="false"
                       :opt-status="dialogStatus"
                       :initUrl="tempActivity.actConfigExpress.actTypeConfig.otherDescBackground"
                       @getImgUrl="getImgData($event,'otherDescBackground')"/>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="其他页说明按钮背景图">
            <ImgUpload ref="otherDescBtnBackground"
                       :requiredWidth="100"
                       :requiredHeight="100"
                       :show-px="false"
                       :opt-status="dialogStatus"
                       :initUrl="tempActivity.actConfigExpress.actTypeConfig.otherDescBtnBackground"
                       @getImgUrl="getImgData($event,'otherDescBtnBackground')"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="其他页说明文字颜色值">
            <Input v-model="tempActivity.actConfigExpress.actTypeConfig.otherDescColor" style="width: 100px"
                   :maxlength="10"
                   readonly/>
            <ColorPicker disabled v-model="tempActivity.actConfigExpress.actTypeConfig.otherDescColor"/>
          </FormItem>
          </Col>
        </Row>

        <Row>
          <Col :span="12">
          <FormItem label="其他页面宣传语">
            <Input v-model="tempActivity.actConfigExpress.actTypeConfig.otherSlogan"
                   type="textarea"
                   :rows="2"
                   style="width: 400px"
                   readonly/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="其他页宣传语颜色值">
            <Input v-model="tempActivity.actConfigExpress.actTypeConfig.otherSloganColor" style="width: 100px"
                   :maxlength="10"
                   readonly/>
            <ColorPicker disabled v-model="tempActivity.actConfigExpress.actTypeConfig.otherSloganColor"/>
          </FormItem>
          </Col>
        </Row>
        <!--分享设置-->
        <Divider orientation="center" style="font-size: 14px;color:#19be6b">分享设置</Divider>
        <Row>
          <Col :span="12">
          <Row>
            <FormItem label="分享标题">
              <Input v-model="tempActivity.actConfigExpress.actShareConfig.shareTitle"
                     style="width: 400px" :maxlength="30"
                     readonly/>
            </FormItem>
          </Row>
          <Row>
            <FormItem label="分享描述">
              <Input v-model="tempActivity.actConfigExpress.actShareConfig.shareDesc"
                     style="width: 400px"
                     type="textarea"
                     :autosize="{minRows: 2,maxRows: 5}"
                     :maxlength="50"
                     readonly/>
            </FormItem>
          </Row>
          <Row>
            <FormItem label="分享链接">
              <Input v-model="tempActivity.actConfigExpress.actShareConfig.shareUrl"
                     style="width: 400px" type="textarea"
                     :autosize="{minRows: 2,maxRows: 5}"
                     readonly/>
            </FormItem>
          </Row>
          </Col>
          <Col :span="12">
          <Row>
            <FormItem label="分享小图">
              <ImgUpload ref="shareIcon"
                         :requiredWidth="100"
                         :requiredHeight="100"
                         :show-px="false"
                         :opt-status="dialogStatus"
                         :initUrl="tempActivity.actConfigExpress.actShareConfig.shareIcon"
                         @getImgUrl="getImgData($event,'shareIcon')"/>
            </FormItem>
          </Row>
          <Row>
            <FormItem>
              （注：当前配置是将活动页面分享至微信朋友圈/群/好友的配置）
            </FormItem>
          </Row>
          </Col>
        </Row>

        <Divider orientation="center" style="font-size: 14px;color:#19be6b">分享页设置</Divider>
        <Row>
          <Col :span="5">
          <FormItem label="分享页背景图">
            <ImgUpload ref="shareBackground"
                       :requiredWidth="100"
                       :requiredHeight="100"
                       :show-px="false"
                       :opt-status="dialogStatus"
                       :initUrl="tempActivity.actConfigExpress.actTypeConfig.shareBackground"
                       @getImgUrl="getImgData($event,'shareBackground')"/>
          </FormItem>
          </Col>
          <Col :span="7">
          <FormItem label="纯色背景颜色值">
            <Input v-model="tempActivity.actConfigExpress.actTypeConfig.shareBackColor"
                   style="width: 100px"
                   :maxlength="10"
                   readonly/>
            <ColorPicker disabled v-model="tempActivity.actConfigExpress.actTypeConfig.shareBackColor"/>
          </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="分享页说明框背景图">
            <ImgUpload ref="shareDescBackground"
                       :requiredWidth="100"
                       :requiredHeight="100"
                       :show-px="false"
                       :opt-status="dialogStatus"
                       :initUrl="tempActivity.actConfigExpress.actTypeConfig.shareDescBackground"
                       @getImgUrl="getImgData($event,'shareDescBackground')"/>
          </FormItem>
          </Col>
        </Row>

        <Row>
          <Col :span="12">
          <FormItem label="分享页面宣传语">
            <Input v-model="tempActivity.actConfigExpress.actTypeConfig.shareSlogan"
                   type="textarea"
                   :rows="2"
                   style="width: 400px"
                   :maxlength="50"
                   readonly/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="分享页宣传语颜色值">
            <Row>
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.shareSloganColor"
                     style="width: 100px"
                     :maxlength="10"
                     readonly/>
              <ColorPicker disabled v-model="tempActivity.actConfigExpress.actTypeConfig.shareSloganColor"/>
            </Row>
          </FormItem>
          </Col>
          <Col :span="4">
          <Button @click="showTempImg('shareVisible')"
                  size="small"
                  type="info"> 参看参考示例图
          </Button>
          </Col>
        </Row>

        <!--博饼包间设置模块-->
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0;">博饼包间设置</Divider>
        <GamblingRoomConfig ref="GamblingRoomConfig"
                            :opt-status="dialogStatus"
                            :act-id="dialogStatus === 'create'? '' : String(tempActivity.id)"
                            :gambling-rooms="gamblingRooms"/>

        <!--积分设置模块-->
        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0;">积分设置</Divider>
        <GamblingGradeConfig ref="GamblingGradeConfig"
                             :optStatus="dialogStatus"
                             :gambling-grade-list="gradeConfigList"/>

        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">奖品池设置</Divider>
        <!--奖品配置模块-->
        <PrizeConfig ref="PrizeConfig"
                     :opt-status="dialogStatus"
                     :act-id="dialogStatus === 'create'? '' : String(tempActivity.id)"
                     :act-prizes="actPrizes"/>
      </Form>
      <!--参考示例图模块-->
      <Modal title="参看参考示例" v-model="tempImgVisible">
        <img v-if="indexVisible" src="../../assets/images/gambling/index-page.png" style="width: 100%"/>
        <img v-if="otherVisible" src="../../assets/images/gambling/other-page.png" style="width: 100%"/>
        <img v-if="shareVisible" src="../../assets/images/gambling/share-page.png" style="width: 100%"/>
      </Modal>
    </modal>
  </div>
</template>

<script>
import Divider from 'iview/src/components/divider/divider'
import editor from '_c/editor/editor.vue'
import ImgUpload from '_c/uploader/img-upload.vue'
import PrizeConfig from './prize/prize-config.vue'
import GamblingRoomConfig from './gambling/gambling-room-config.vue'
import GamblingGradeConfig from './gambling/gambling-grade-config.vue'

export default {
  name: 'activity-detail-gambling',
  components: {
    Divider,
    editor,
    ImgUpload,
    PrizeConfig,
    GamblingRoomConfig,
    GamblingGradeConfig
  },
  data () {
    return {
      // 模型数据——活动
      tempActivity: {},
      // 奖品数据
      actPrizes: [],
      // 博饼包间数据
      gamblingRooms: [],
      // 博饼积分配置
      gradeConfigList: [],
      dialogStatus: 'detail',

      editorShow: false,
      dialogFormVisibleDetail: false,
      dialogStatusDetail: '',
      listLoadingGambling: false,

      statusMap: {
        0: '未开始',
        1: '进行中',
        2: '已下架'
      },
      actTypeMap: {
        0: '抽奖类活动',
        1: '礼包类活动',
        2: '祝福类活动',
        3: '返佣类活动',
        4: '博饼类活动'
      },
      // 参考示例图
      tempImgVisible: false,
      indexVisible: false,
      otherVisible: false,
      shareVisible: false
    }
  },
  created () {
  },
  methods: {
    // 获取父组件赋值
    getActivityValue (val) {
      this.tempActivity = val
      // 组件赋值
      this.gamblingRooms = this.tempActivity.actGamblingRooms == null ? [] : this.tempActivity.actGamblingRooms
      this.actPrizes = this.tempActivity.actPrizes == null ? [] : this.tempActivity.actPrizes
      this.gradeConfigList = this.tempActivity.actConfigExpress.actTypeConfig.gradeConfigs == null ? [] : this.tempActivity.actConfigExpress.actTypeConfig.gradeConfigs
    },
    // 参考示例图显示
    showTempImg (site) {
      this.tempImgVisible = true
      this.indexVisible = false
      this.otherVisible = false
      this.shareVisible = false
      if (site === 'indexVisible') {
        this.indexVisible = true
      }
      if (site === 'otherVisible') {
        this.otherVisible = true
      }
      if (site === 'shareVisible') {
        this.shareVisible = true
      }
    }
  }
}
</script>

<style>

  .demo-upload-list img {
    width: 100%;
    height: 100%;
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
