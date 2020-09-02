<template>
  <div>
    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" @on-cancel="handleClose"
           :width="1200">
      <Steps :current="currentStep" class="ivu-steps">
        <Step title="基础配置" content="填写活动基础信息"></Step>
        <Step title="规则配置" content="设置活动规则"></Step>
      </Steps>
      <Divider></Divider>

      <Form ref="dataFormActivity" :label-width="150" :model="tempActivity" :rules="rulesActivity">
        <!--基础配置开始-->
        <div v-if="currentStep === 0">
          <FormItem label="活动类型" prop="actType">
            <Select v-model="tempActivity.actType" style="width: 100px" disabled clearable>
              <Option :value=4 disabled>博饼类活动</Option>
            </Select>
          </FormItem>
          <FormItem label="活动主题" prop="title">
            <Input v-model="tempActivity.title" style="width: 520px" placeholder="输入30个字以内" :maxlength="30" clearable/>
          </FormItem>
          <FormItem label="有效期" prop="rangeTime">
            <DatePicker :value="tempActivity.rangeTime" type="datetimerange" formart="yyyy-MM-dd"
                        @on-change="tempActivity.rangeTime=$event"
                        placement="right-start"
                        placeholder="选择时间"
                        style="width: 300px"
                        :options="optionsTime"
                        required></DatePicker>
          </FormItem>
          <FormItem label="主题图片" prop="actPic">
            <div>（注：图片格式支持.jpg .jpeg .png ，大小不超过2M）</div>
            <!--图片上传组件-->
            <div>
              <div class="demo-upload-list" v-if="tempActivity.actPic !== ''">
                <img :src=tempActivity.actPic>
                <div class="demo-upload-list-cover">
                  <Icon type="ios-eye-outline" @click.native="handleActView"></Icon>
                  <Icon type="ios-trash-outline" @click.native="handleActRemove"></Icon>
                </div>
              </div>
              <Upload
                v-if="tempActivity.actPic === ''"
                ref="uploadactPic"
                :show-upload-list="false"
                :on-success="handleActSuccess"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                multiple
                type="drag"
                :action="this.$apiBaseUrl+'/file/image/upload'"
                style="display: inline-block;width:58px;">
                <div style="width: 58px;height:58px;line-height: 58px;">
                  <Icon type="ios-camera" size="20"></Icon>
                </div>
              </Upload>
              <Modal title="图片查看" v-model="visible">
                <img :src="tempActivity.actPic" v-if="visible" style="width: 100%">
              </Modal>
            </div>
          </FormItem>
          <FormItem label="活动简介" prop="summary">
            <Input v-model="tempActivity.summary" type="textarea" :autosize="{minRows: 5,maxRows: 10}" :maxlength="500"
                   style="width: 520px" placeholder="请输入简介、描述、宣传等话术(500字以内)" clearable/>
          </FormItem>
          <FormItem label="内容及说明" prop="context">
            <!--富文本编辑器-->
            <editor ref="editor" :value="tempActivity.context" :cache="editorCache"
                    @on-change="handleChangeContent"></editor>
          </FormItem>
        </div>
        <!--规则配置开始-->
        <div v-if="currentStep === 1">
          <FormItem label="参与条件" prop="actConfigExpress.actParticipantConfig.participantType">
            <CheckboxGroup v-model="tempActivity.actConfigExpress.actParticipantConfig.participantType">
              <Checkbox label=0 disabled>注册用户</Checkbox>
              <Checkbox label=1>关注用户</Checkbox>
            </CheckboxGroup>
          </FormItem>

          <!--参与次数配置-->
          <Row>
            <Col span="14">
            <FormItem label="额外获得博饼机会" prop="actConfigExpress.actNumberConfig.shareAddNum">
              每日每个好友首次点击分享链接可额外获得&nbsp
              <Input v-model="tempActivity.actConfigExpress.actNumberConfig.shareAddNum"
                     size="small"
                     @on-keydown="tempActivity.actConfigExpress.actNumberConfig.shareAddNum=tempActivity.actConfigExpress.actNumberConfig.shareAddNum.replace(/[^\d]/g,'')"
                     @on-keyup="tempActivity.actConfigExpress.actNumberConfig.shareAddNum=tempActivity.actConfigExpress.actNumberConfig.shareAddNum.replace(/[^\d]/g,'')"
                     style="width:100px;height:20px"
                     :maxlength="10"
                     clearable>
              </Input>
              &nbsp次博饼机会
            </FormItem>
            </Col>
            <Col span="10">
            <FormItem prop="actConfigExpress.actNumberConfig.dailyShareAddLimit">
              每人每日最多可额外获得&nbsp
              <Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyShareAddLimit"
                     size="small"
                     @on-keydown="tempActivity.actConfigExpress.actNumberConfig.dailyShareAddLimit=tempActivity.actConfigExpress.actNumberConfig.dailyShareAddLimit.replace(/[^\d]/g,'')"
                     @on-keyup="tempActivity.actConfigExpress.actNumberConfig.dailyShareAddLimit=tempActivity.actConfigExpress.actNumberConfig.dailyShareAddLimit.replace(/[^\d]/g,'')"
                     style="width:100px;height:20px"
                     :maxlength="10"
                     clearable>
              </Input>
              &nbsp次博饼机会
            </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="14">
            <FormItem prop="actConfigExpress.actNumberConfig.payAddNum">
              每日每个账号每支付成功一笔订单（不限业务）可额外获得&nbsp
              <Input v-model="tempActivity.actConfigExpress.actNumberConfig.payAddNum"
                     size="small"
                     @on-keydown="tempActivity.actConfigExpress.actNumberConfig.payAddNum=tempActivity.actConfigExpress.actNumberConfig.payAddNum.replace(/[^\d]/g,'')"
                     @on-keyup="tempActivity.actConfigExpress.actNumberConfig.payAddNum=tempActivity.actConfigExpress.actNumberConfig.payAddNum.replace(/[^\d]/g,'')"
                     style="width:100px;height:20px"
                     :maxlength="10"
                     clearable>
              </Input>
              &nbsp次博饼机会
            </FormItem>
            </Col>
            <Col span="10">
            <FormItem prop="actConfigExpress.actNumberConfig.dailyPayAddLimit">
              每人每日最多可额外获得&nbsp
              <Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit" size="small"
                     @on-keydown="tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit=tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit.replace(/[^\d]/g,'')"
                     @on-keyup="tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit=tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit.replace(/[^\d]/g,'')"
                     style="width:100px;height:20px"
                     :maxlength="10"
                     clearable>
              </Input>
              &nbsp次博饼机会
            </FormItem>
            </Col>
          </Row>

          <!--活动模板设置-->
          <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">活动模板设置</Divider>
          <Alert show-icon>活动模板：（图片格式支持.jpg .png .gif，建议按图片的分辨率上传显示效果最好，大小建议不超过3M；具体位置查阅参考示例图）</Alert>

          <!--首页设置-->
          <Divider orientation="center" style="font-size: 14px;color:#19be6b">首页设置</Divider>
          <Row>
            <Col :span="6">
            <FormItem label="首页背景图" prop="actConfigExpress.actTypeConfig.indexBackground">
              <ImgUpload ref="indexBackground"
                         :requiredWidth="750"
                         :requiredHeight="1184"
                         :initUrl="tempActivity.actConfigExpress.actTypeConfig.indexBackground"
                         @getImgUrl="getImgData($event,'indexBackground')"/>
            </FormItem>
            </Col>
            <Col :span="6">
            <FormItem label="首页主题字图" prop="actConfigExpress.actTypeConfig.indexThemeImg">
              <ImgUpload ref="indexThemeImg"
                         :requiredWidth="668"
                         :requiredHeight="190"
                         :initUrl="tempActivity.actConfigExpress.actTypeConfig.indexThemeImg"
                         @getImgUrl="getImgData($event,'indexThemeImg')"/>
            </FormItem>
            </Col>
            <Col :span="8">
            <FormItem label="纯色背景颜色值" prop="actConfigExpress.actTypeConfig.indexBackColor">
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.indexBackColor"
                     style="width: 100px"
                     placeholder=""
                     :maxlength="10"
                     clearable/>
              <ColorPicker v-model="tempActivity.actConfigExpress.actTypeConfig.indexBackColor"/>
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
            <FormItem label="其他页背景图" prop="actConfigExpress.actTypeConfig.otherBackground">
              <ImgUpload ref="otherBackground"
                         :requiredWidth="750"
                         :requiredHeight="1184"
                         :initUrl="tempActivity.actConfigExpress.actTypeConfig.otherBackground"
                         @getImgUrl="getImgData($event,'otherBackground')"/>
            </FormItem>
            </Col>
            <Col :span="8">
            <FormItem label="纯色背景颜色值" prop="actConfigExpress.actTypeConfig.otherBackColor">
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.otherBackColor"
                     style="width: 100px"
                     placeholder=""
                     :maxlength="10"
                     clearable/>
              <ColorPicker v-model="tempActivity.actConfigExpress.actTypeConfig.otherBackColor"/>
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
            <FormItem label="其他页说明框背景图" prop="actConfigExpress.actTypeConfig.otherDescBackground">
              <ImgUpload ref="otherDescBackground"
                         :requiredWidth="650"
                         :requiredHeight="240"
                         :initUrl="tempActivity.actConfigExpress.actTypeConfig.otherDescBackground"
                         @getImgUrl="getImgData($event,'otherDescBackground')"/>
            </FormItem>
            </Col>
            <Col :span="6">
            <FormItem label="其他页说明按钮背景图" prop="actConfigExpress.actTypeConfig.otherDescBtnBackground">
              <ImgUpload ref="otherDescBtnBackground"
                         :requiredWidth="144"
                         :requiredHeight="44"
                         :initUrl="tempActivity.actConfigExpress.actTypeConfig.otherDescBtnBackground"
                         @getImgUrl="getImgData($event,'otherDescBtnBackground')"/>
            </FormItem>
            </Col>
            <Col :span="8">
            <FormItem label="其他页说明文字颜色值" prop="actConfigExpress.actTypeConfig.otherDescColor">
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.otherDescColor"
                     style="width: 100px"
                     placeholder=""
                     :maxlength="10"
                     clearable/>
              <ColorPicker v-model="tempActivity.actConfigExpress.actTypeConfig.otherDescColor"/>
            </FormItem>
            </Col>
          </Row>

          <Row>
            <Col :span="12">
            <FormItem label="其他页面宣传语" prop="actConfigExpress.actTypeConfig.otherSlogan">
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.otherSlogan"
                     type="textarea"
                     :rows="2"
                     style="width: 400px"
                     placeholder="其他页面宣传语（50字内）"
                     :maxlength="50"
                     clearable/>
            </FormItem>
            </Col>
            <Col :span="8">
            <FormItem label="其他页宣传语颜色值" prop="actConfigExpress.actTypeConfig.otherSloganColor">
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.otherSloganColor"
                     style="width: 100px"
                     placeholder=""
                     :maxlength="10"
                     clearable/>
              <ColorPicker v-model="tempActivity.actConfigExpress.actTypeConfig.otherSloganColor"/>
            </FormItem>
            </Col>
          </Row>

          <!--分享设置-->
          <Divider orientation="center" style="font-size: 14px;color:#19be6b">分享设置</Divider>
          <Row>
            <Col :span="12">
            <Row>
              <FormItem label="分享标题" prop="actConfigExpress.actShareConfig.shareTitle">
                <Input v-model="tempActivity.actConfigExpress.actShareConfig.shareTitle"
                       style="width: 400px"
                       :maxlength="30"
                       placeholder="输入分享标题(30字内)"
                       clearable/>
              </FormItem>
            </Row>
            <Row>
              <FormItem label="分享描述" prop="actConfigExpress.actShareConfig.shareDesc">
                <Input v-model="tempActivity.actConfigExpress.actShareConfig.shareDesc"
                       style="width: 400px"
                       type="textarea"
                       :autosize="{minRows: 2,maxRows: 5}"
                       :maxlength="50"
                       placeholder="输入分享描述(50字内)"
                       clearable/>
              </FormItem>
            </Row>
            <Row>
              <FormItem label="分享链接" prop="actConfigExpress.actShareConfig.shareUrl">
                <Input v-model="tempActivity.actConfigExpress.actShareConfig.shareUrl"
                       style="width: 400px" type="textarea"
                       :autosize="{minRows: 2,maxRows: 5}"
                       placeholder="输入分享的连接"
                       clearable/>
              </FormItem>
            </Row>
            </Col>
            <Col :span="12">
            <Row>
              <FormItem label="分享小图" prop="actConfigExpress.actShareConfig.shareIcon">
                <ImgUpload ref="shareIcon"
                           :requiredWidth="60"
                           :requiredHeight="60"
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
            <FormItem label="分享页背景图" prop="actConfigExpress.actTypeConfig.shareBackground">
              <ImgUpload ref="shareBackground"
                         :requiredWidth="750"
                         :requiredHeight="1184"
                         :initUrl="tempActivity.actConfigExpress.actTypeConfig.shareBackground"
                         @getImgUrl="getImgData($event,'shareBackground')"/>
            </FormItem>
            </Col>
            <Col :span="7">
            <FormItem label="纯色背景颜色值" prop="actConfigExpress.actTypeConfig.shareBackColor">
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.shareBackColor"
                     style="width: 100px"
                     placeholder=""
                     :maxlength="10"
                     clearable/>
              <ColorPicker v-model="tempActivity.actConfigExpress.actTypeConfig.shareBackColor"/>
            </FormItem>
            </Col>
            <Col :span="5">
            <FormItem label="分享页说明框背景图" prop="actConfigExpress.actTypeConfig.shareDescBackground">
              <ImgUpload ref="shareDescBackground"
                         :requiredWidth="650"
                         :requiredHeight="100"
                         :initUrl="tempActivity.actConfigExpress.actTypeConfig.shareDescBackground"
                         @getImgUrl="getImgData($event,'shareDescBackground')"/>
            </FormItem>
            </Col>
          </Row>

          <Row>
            <Col :span="12">
            <FormItem label="分享页面宣传语" prop="actConfigExpress.actTypeConfig.shareSlogan">
              <Input v-model="tempActivity.actConfigExpress.actTypeConfig.shareSlogan"
                     type="textarea"
                     :rows="2"
                     style="width: 400px"
                     placeholder="其他页面宣传语（50字内）"
                     :maxlength="50"
                     clearable/>
            </FormItem>
            </Col>
            <Col :span="8">
            <FormItem label="分享页宣传语颜色值" prop="actConfigExpress.actTypeConfig.shareSloganColor">
              <Row>
                <Input v-model="tempActivity.actConfigExpress.actTypeConfig.shareSloganColor"
                       style="width: 100px"
                       placeholder=""
                       :maxlength="10"
                       clearable/>
                <ColorPicker v-model="tempActivity.actConfigExpress.actTypeConfig.shareSloganColor"/>
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

          <!--基础配置结束-->

          <!--博饼包间设置模块-->
          <Divider orientation="left" style="font-size: 16px;color:#2d8cf0;">博饼包间设置</Divider>
          <GamblingRoomConfig ref="GamblingRoomConfig"
                              :opt-status="dialogStatus"
                              :act-id="dialogStatus === 'create'? '' : String(tempActivity.id)"
                              :gambling-rooms="gamblingRooms"
                              @getGamblingRooms="getGamblingRooms($event)"/>

          <!--积分设置模块-->
          <Divider orientation="left" style="font-size: 16px;color:#2d8cf0;">积分设置</Divider>
          <GamblingGradeConfig ref="GamblingGradeConfig"
                               :optStatus="dialogStatus"
                               :gambling-grade-list="gradeConfigList"
                               @getGamblingGradeList="getGamblingGradeList($event)"/>

          <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">奖品池设置</Divider>
          <!--奖品配置模块-->
          <PrizeConfig ref="PrizeConfig"
                       :opt-status="dialogStatus"
                       :act-id="dialogStatus === 'create'? '' : String(tempActivity.id)"
                       :act-prizes="actPrizes"
                       @getPrizes="getPrizes($event)"/>
        </div>

        <!--规则配置结束-->
      </Form>
      <br>
      <div class="forward-backward">
        <ButtonGroup>
          <Button type="primary" v-bind:disabled="buttonBackward" @click="handleBackward">
            <Icon type="ios-arrow-back"/>
            上一步
          </Button>
          <Button type="primary" v-bind:disabled="buttonForward" @click="handleForward">
            下一步
            <Icon type="ios-arrow-forward"/>
          </Button>
        </ButtonGroup>
      </div>
      <div slot="footer">
        <Button @click="handleClose" align="right">取消</Button>
        <Button type="primary" v-if="$viewAccess('act:activity:add') && currentStep===1"
                @click="dialogStatus==='create'?createData():updateData()"
                align="right">保存
        </Button>
      </div>

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
import { create, remove, update } from '@/api/activity/activity'
import FormItem from 'iview/src/components/form/form-item'
import Divider from 'iview/src/components/divider/divider'
import editor from '_c/editor/editor.vue'
import vueQr from 'vue-qr'
import ImgUpload from '_c/uploader/img-upload.vue'
import PrizeConfig from './prize/prize-config.vue'
import GamblingRoomConfig from './gambling/gambling-room-config.vue'
import GamblingGradeConfig from './gambling/gambling-grade-config.vue'

export default {
  name: 'activity-config-gambling',
  components: {
    FormItem,
    Divider,
    editor,
    vueQr,
    ImgUpload,
    PrizeConfig,
    GamblingRoomConfig,
    GamblingGradeConfig
  },

  data () {
    let colorReg = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
    let validateColor = (rule, value, callback) => {
      if ((value !== '') && !colorReg.test(value)) {
        callback(new Error('颜色格式错误'))
      } else {
        callback()
      }
    }
    return {
      // 活动
      currentStep: 0,
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      buttonBackward: true,
      buttonForward: false,
      // 编辑器缓存
      editorCache: false,
      // 上传图片
      visible: false,
      visibleShare: false,

      // 模型数据——活动
      tempActivity: {
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
        // ActConfigExpress对象 活动配置扩展对象
        actConfigExpress: {
          // 活动类型配置
          actTypeConfig: {
            bizType: 1,
            rewardList: [],
            parkList: [],
            indexBackground: '', // 首页背景
            indexThemeImg: '', // 首页主题字图
            indexBackColor: '', // 首页背景颜色
            otherBackground: '', // 其他页背景
            otherBackColor: '', // 其他页背景颜色
            otherDescBackground: '', // 其他页说明框背景
            otherDescColor: '', // 其他页说明文字颜色
            otherDescBtnBackground: '', // 其他页说明按钮背景
            otherSlogan: '', // 其他页宣传语
            otherSloganColor: '', // 其他页宣传语文字颜色
            shareBackground: '', // 分享页背景
            shareBackColor: '', // 分享页背景颜色
            shareDescBackground: '', // 分享页说明框背景
            shareSlogan: '', // 分享页宣传语
            shareSloganColor: '', // 分享页宣传语文字颜色
            gradeConfigs: []// 博饼等级配置
          },
          // 参与对象
          actParticipantConfig: {
            participantType: ['0'],
            participantValue: null
          },
          // 参与次数
          actNumberConfig: {
            limit: null, // 总参与次数限则
            dailyLimit: null, // 每日参与次数限制
            shareAddNum: null, // 分享成功获得参与次数
            dailyShareAddLimit: null, // 每日分享成功获得参与次数限制
            payAddNum: null, // 支付成功获得参与次数
            dailyPayAddLimit: null// 每日支付成功获得参与次数限制
          },
          // 分享配置
          actShareConfig: {
            shareFlag: 1,
            shareTitle: null,
            shareIcon: '',
            shareUrl: null,
            shareDesc: null
          }
        }
      },
      // 奖品数据
      actPrizes: [],
      // 博饼包间数据
      gamblingRooms: [],
      // 博饼积分配置
      gradeConfigList: [],
      // 活动配置校验
      rulesActivity: {
        // actType: [{required: true, message: '活动类型不能为空'}],
        // title: [{required: true, message: '活动主题不能为空'}],
        // actPic: [{required: true, message: '活动主题图不能为空'}],
        // summary: [{required: true, message: '活动简介不能为空'}],
        // rangeTime: [{required: true, message: '有效期不能为空'}],
        // context: [{required: true, message: '内容及说明不能为空'}],
        // 'actConfigExpress.actNumberConfig.dailyShareAddLimit': [{required: true, message: '必填项'}],
        // 'actConfigExpress.actNumberConfig.dailyPayAddLimit': [{required: true, message: '必填项'}],
        // 'actConfigExpress.actTypeConfig.indexBackground': [{required: true, message: '需上传图片'}],
        // 'actConfigExpress.actTypeConfig.indexThemeImg': [{required: true, message: '需上传图片'}],
        // 'actConfigExpress.actTypeConfig.indexBackColor': [
        //   {required: true, message: '必填项'}, {validator: validateColor}],
        // 'actConfigExpress.actTypeConfig.otherBackground': [{required: true, message: '需上传图片'}],
        // 'actConfigExpress.actTypeConfig.otherBackColor': [
        //   {required: true, message: '必填项'}, {validator: validateColor}],
        // 'actConfigExpress.actTypeConfig.otherDescBackground': [{required: true, message: '需上传图片'}],
        // 'actConfigExpress.actTypeConfig.otherDescBtnBackground': [{required: true, message: '需上传图片'}],
        // 'actConfigExpress.actTypeConfig.otherDescColor': [
        //   {required: true, message: '必填项'}, {validator: validateColor}],
        // 'actConfigExpress.actTypeConfig.otherSlogan': [{required: true, message: '必填项'}],
        // 'actConfigExpress.actTypeConfig.otherSloganColor': [
        //   {required: true, message: '必填项'}, {validator: validateColor}],
        // 'actConfigExpress.actShareConfig.shareTitle': [{required: true, message: '必填项'}],
        // 'actConfigExpress.actShareConfig.shareDesc': [{required: true, message: '必填项'}],
        // 'actConfigExpress.actShareConfig.shareUrl': [
        //   {required: true, message: '必填项'}, {type: 'url', message: 'URL格式错误'}],
        // 'actConfigExpress.actShareConfig.shareIcon': [{required: true, message: '需上传图片'}],
        // 'actConfigExpress.actTypeConfig.shareBackground': [{required: true, message: '需上传图片'}],
        // 'actConfigExpress.actTypeConfig.shareBackColor': [
        //   {required: true, message: '必填项'}, {validator: validateColor}],
        // 'actConfigExpress.actTypeConfig.shareDescBackground': [{required: true, message: '需上传图片'}],
        // 'actConfigExpress.actTypeConfig.shareSlogan': [{required: true, message: '必填项'}],
        // 'actConfigExpress.actTypeConfig.shareSloganColor': [
        //   {required: true, message: '必填项'}, {validator: validateColor}],
      },
      optionsTime: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000
        }
      },
      textMap: {
        update: '修改活动',
        create: '新增活动'
      },
      statusList: [
        {
          value: '未开始',
          label: 0
        },
        {
          value: '进行中',
          label: 1
        },
        {
          value: '已下架',
          label: 2
        }
      ],
      actTypeList: [
        {
          value: '博饼类活动',
          label: 4
        }
      ],

      // 参考示例图
      tempImgVisible: false,
      indexVisible: false,
      otherVisible: false,
      shareVisible: false,

      qrContent: 'https://www.cnblogs.com/zouwangblog/p/11141125.html'
    }
  },
  created () {
  },
  methods: {
    // 获取父组件值
    getActivityValue (val) {
      this.tempActivity = val
      // 组件赋值
      this.gamblingRooms = this.tempActivity.actGamblingRooms == null ? [] : this.tempActivity.actGamblingRooms
      this.actPrizes = this.tempActivity.actPrizes == null ? [] : this.tempActivity.actPrizes
      this.gradeConfigList = this.tempActivity.actConfigExpress.actTypeConfig.gradeConfigs == null ? [] : this.tempActivity.actConfigExpress.actTypeConfig.gradeConfigs
      this.$refs.editor.setHtml(this.tempActivity.context)
    },
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList()
    },
    createData () {
      this.$refs['dataFormActivity'].validate((valid) => {
        if (valid) {
          if (!this.checkStep2()) {
            return
          }
          if (!this.checkGamblingGrade()) {
            return
          }
          this.tempActivity.actPrizes = this.actPrizes
          this.tempActivity.actGamblingRooms = this.gamblingRooms
          this.tempActivity.actConfigExpress.actTypeConfig.gradeConfigs = this.gradeConfigList
          create(this.tempActivity).then(() => {
            this.dialogFormVisible = false
            // 调用父组件的getList
            this.$emit('getList')
            this.resetStep()
            this.$Notice.success({ title: '成功', desc: '新增成功' })
          })
        } else {
          return this.$Message.error('请填写必填项')
        }
      })
    },
    updateData () {
      this.$refs['dataFormActivity'].validate((valid) => {
        if (valid) {
          if (!this.checkStep2()) {
            return
          }
          if (!this.checkGamblingGrade()) {
            return
          }
          this.tempActivity.actConfigExpress.actTypeConfig.gradeConfigs = this.gradeConfigList
          this.tempActivity.status = ''
          update(this.tempActivity).then(() => {
            this.$emit('getList', 4)
            this.resetStep()
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '修改成功' })
          })
        } else {
          return this.$Message.error('请填写必填项')
        }
      })
    },
    handleStopActivity (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将停止活动的使用, 是否继续?',
        onOk: () => {
          remove(id).then(() => {
            this.$emit('getList', 4)
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '下架成功' })
          })
        }
      })
    },
    handleBackward () {
      if (this.currentStep !== 0) {
        this.currentStep -= 1
        this.buttonForward = false
        this.buttonBackward = true
      }
    },
    handleForward () {
      // 开发注释
      if (!this.checkStep1()) {
        return
      }
      if (this.currentStep !== 1) {
        this.currentStep += 1
        this.buttonForward = true
        this.buttonBackward = false
      }
    },
    handleClose () {
      this.dialogFormVisible = false
      this.resetStep()
      this.resetTempActivity()
      this.$emit('getList', 4)
    },
    resetStep () {
      this.currentStep = 0
      this.buttonBackward = true
      this.buttonForward = false
    },

    //  规则配置开始
    handleActView () {
      this.visible = true
    },
    handleActRemove () {
      this.tempActivity.actPic = ''
    },
    handleActSuccess (res, file) {
      this.tempActivity.actPic = res.data
      this.$Notice.success({ title: '上传成功', desc: `文件${file.name}，上传成功` })
    },
    handleShareView () {
      this.visibleShare = true
    },
    handleShareRemove () {
      this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
    },
    handleShareSuccess (res, file) {
      this.tempActivity.actConfigExpress.actShareConfig.shareIcon = res.data
      this.$Notice.success({ title: '上传成功', desc: `文件${file.name}，上传成功` })
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件类型错误',
        desc: `文件${file.name}不是图片文件，请选择后缀为png/jpeg/jpg的文件。`
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '文件大小超出限制',
        desc: `文件${file.name}太大, 不能超过2M。`
      })
    },
    handleChangeContent (html, text) {
      this.tempActivity.context = html
    },
    checkStep1 () {
      let flag = false
      if (this.tempActivity.title === null || this.tempActivity.title.trim() === '') {
        this.$Message.error('请输入活动主题')
        return flag
      }
      if (this.tempActivity.actType === null || this.tempActivity.actType === '') {
        this.$Message.error('请选择活动类型')
        return flag
      }
      if (this.tempActivity.actPic === '') {
        this.$Message.error('请上传活动主题图')
        return flag
      }
      if (this.tempActivity.summary == null || this.tempActivity.summary.trim() === '') {
        this.$Message.error('请输入活动简介')
        return flag
      }
      if (this.tempActivity.context.trim() === '') {
        this.$Message.error('请输入活动内容及说明')
        return flag
      }
      return true
    },
    checkStep2 () {
      let flag = false
      if (this.tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit == null) {
        this.$Message.error('通过分享获得的总次数不能为空')
        return flag
      }
      if (this.tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit == null) {
        this.$Message.error('通过支付获得的总次数不能为空')
        return flag
      }
      if ((Number(this.tempActivity.actConfigExpress.actNumberConfig.dailyShareAddLimit) <
            Number(this.tempActivity.actConfigExpress.actNumberConfig.shareAddNum))) {
        this.$Message.error('每日每个好友首次点击获得次数不能大于总获得次数')
        return flag
      }
      if ((Number(this.tempActivity.actConfigExpress.actNumberConfig.dailyPayAddLimit) <
            Number(this.tempActivity.actConfigExpress.actNumberConfig.payAddNum))) {
        this.$Message.error('每日每个账号每支付成功一笔订单获得次数不能大于总获得次数')
        return flag
      }
      if (this.tempActivity.actConfigExpress.actShareConfig.shareFlag === 1) {
        if (this.tempActivity.actConfigExpress.actShareConfig.shareTitle == null ||
            this.tempActivity.actConfigExpress.actShareConfig.shareTitle.trim() === '') {
          this.$Message.error('请输入分享标题')
          return flag
        }
        if (this.tempActivity.actConfigExpress.actShareConfig.shareDesc == null ||
            this.tempActivity.actConfigExpress.actShareConfig.shareDesc.trim() === '') {
          this.$Message.error('请输入分享描述')
          return flag
        }
        if (this.tempActivity.actConfigExpress.actShareConfig.shareUrl == null ||
            this.tempActivity.actConfigExpress.actShareConfig.shareUrl.trim() === '') {
          this.$Message.error('请输入分享链接')
          return flag
        }
      }
      return true
    },
    checkGamblingGrade () {
      let flag = false
      let list = this.gradeConfigList
      if (list.length === 0) {
        this.$Message.error('请设置 博饼等级积分信息')
        return flag
      } else {
        for (let i = 0; i < list.length; i++) {
          if (list[i].probability == null || list[i].probability === '') {
            this.$Message.error('请填写博饼等级： ' + list[i].gradeName + ' 的博中概率')
            return flag
          }
          if (list[i].point == null || list[i].point === '') {
            this.$Message.error('请填写博饼等级： ' + list[i].gradeName + ' 的积分')
            return flag
          }
          if (list[i].hintGraph === '') {
            this.$Message.error('请填写博饼等级： ' + list[i].gradeName + ' 的中奖提示图')
            return flag
          }
        }
      }
      return true
    },
    changeShareConfig () {
      this.tempActivity.actConfigExpress.actShareConfig.shareTitle = null
      this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
      this.tempActivity.actConfigExpress.actShareConfig.shareDesc = null
      this.tempActivity.actConfigExpress.actShareConfig.shareUrl = null
    },
    //  规则配置结束

    // 从组件获取图片url
    getImgData (imgUrl, refName) {
      switch (refName) {
        case 'indexBackground':
          this.tempActivity.actConfigExpress.actTypeConfig.indexBackground = imgUrl
          break
        case 'indexThemeImg':
          this.tempActivity.actConfigExpress.actTypeConfig.indexThemeImg = imgUrl
          break
        case 'otherBackground':
          this.tempActivity.actConfigExpress.actTypeConfig.otherBackground = imgUrl
          break
        case 'otherDescBackground':
          this.tempActivity.actConfigExpress.actTypeConfig.otherDescBackground = imgUrl
          break
        case 'otherDescBtnBackground':
          this.tempActivity.actConfigExpress.actTypeConfig.otherDescBtnBackground = imgUrl
          break
        case 'shareBackground':
          this.tempActivity.actConfigExpress.actTypeConfig.shareBackground = imgUrl
          break
        case 'shareDescBackground':
          this.tempActivity.actConfigExpress.actTypeConfig.shareDescBackground = imgUrl
          break
        case 'shareIcon':
          this.tempActivity.actConfigExpress.actShareConfig.shareIcon = imgUrl
          break
      }
    },

    // 从组件中获取博饼包间列表
    getGamblingRooms (val) {
      this.gamblingRooms = val
    },

    // 从组件中获取博饼积分列表
    getGamblingGradeList (val) {
      this.gradeConfigList = val
    },

    // 从组件中获取奖品列表
    getPrizes (val) {
      this.actPrizes = val
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
    },

    // 数据清空
    resetTempActivity () {
      this.actPrizes = []
      this.gamblingRooms = []
      this.gradeConfigList = []
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
        // ActConfigExpress对象 活动配置扩展对象
        actConfigExpress: {
          // 活动类型配置
          actTypeConfig: {
            bizType: 1,
            rewardList: [],
            parkList: [],
            indexBackground: '', // 首页背景
            indexThemeImg: '', // 首页主题字图
            indexBackColor: '', // 首页背景颜色
            otherBackground: '', // 其他页背景
            otherBackColor: '', // 其他页背景颜色
            otherDescBackground: '', // 其他页说明框背景
            otherDescColor: '', // 其他页说明文字颜色
            otherDescBtnBackground: '', // 其他页说明按钮背景
            otherSlogan: '', // 其他页宣传语
            otherSloganColor: '', // 其他页宣传语文字颜色
            shareBackground: '', // 分享页背景
            shareBackColor: '', // 分享页背景颜色
            shareDescBackground: '', // 分享页说明框背景
            shareSlogan: '', // 分享页宣传语
            shareSloganColor: '', // 分享页宣传语文字颜色
            gradeConfigs: []// 博饼等级配置
          },
          // 参与对象
          actParticipantConfig: {
            participantType: ['0'],
            participantValue: null
          },
          // 参与次数
          actNumberConfig: {
            limit: null, // 总参与次数限则
            dailyLimit: null, // 每日参与次数限制
            shareAddNum: null, // 分享成功获得参与次数
            dailyShareAddLimit: null, // 每日分享成功获得参与次数限制
            payAddNum: null, // 支付成功获得参与次数
            dailyPayAddLimit: null// 每日支付成功获得参与次数限制
          },
          // 分享配置
          actShareConfig: {
            shareFlag: 1,
            shareTitle: null,
            shareIcon: '',
            shareUrl: null,
            shareDesc: null
          }
        }
      }
      this.$refs.editor.setHtml(this.tempActivity.context)
    }
  }
}
</script>

<style>
  .ivu-form-item-label {
    font-weight: 700;
  }

  .ivu-steps {
    background-color: transparent;
    align-content: center;
    width: 1070px;
    margin-left: 150px;
    margin-right: 150px;
  }

  .forward-backward {
    text-align: center;
    vertical-align: middle
  }

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
