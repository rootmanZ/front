<template>
  <div>
    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" @on-cancel="handleClose"
           :width="1000">
      <Steps :current="currentStep" class="ivu-steps">
        <Step title="基础配置" content="填写活动基础信息"></Step>
        <Step title="规则配置" content="设置活动规则"></Step>
      </Steps>
      <Divider></Divider>

      <Form ref="dataFormActivity" :label-width="100" :model="tempActivity" :rules="rulesActivity">
        <!--基础配置开始-->
        <div v-if="currentStep === 0">
          <FormItem label="活动类型" prop="actType">
            <Select v-model="tempActivity.actType" style="width: 120px" disabled clearable>
              <Option :value=3 disabled>返佣类活动</Option>
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
          <FormItem label="参与次数" prop="actConfigExpress.actNumberConfig.limit">
            活动期间最多可返佣&nbsp
            <Input v-model="tempActivity.actConfigExpress.actNumberConfig.limit" size="small"
                   @on-keydown="tempActivity.actConfigExpress.actNumberConfig.limit=tempActivity.actConfigExpress.actNumberConfig.limit.replace(/[^\d]/g,'')"
                   @on-keyup="tempActivity.actConfigExpress.actNumberConfig.limit=tempActivity.actConfigExpress.actNumberConfig.limit.replace(/[^\d]/g,'')"
                   style="width:100px;height:20px" :maxlength="10" clearable></Input>
            &nbsp次
          </FormItem>
          &nbsp&nbsp&nbsp
          <FormItem prop="actConfigExpress.actNumberConfig.dailyLimit">
            每天最多可返佣&nbsp
            <Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyLimit" size="small"
                   @on-keydown="tempActivity.actConfigExpress.actNumberConfig.dailyLimit=tempActivity.actConfigExpress.actNumberConfig.dailyLimit.replace(/[^\d]/g,'')"
                   @on-keyup="tempActivity.actConfigExpress.actNumberConfig.dailyLimit=tempActivity.actConfigExpress.actNumberConfig.dailyLimit.replace(/[^\d]/g,'')"
                   style="width:100px;height:20px" :maxlength="10" clearable></Input>
            &nbsp次
          </FormItem>
          <FormItem label="分享">
            <RadioGroup v-model="tempActivity.actConfigExpress.actShareConfig.shareFlag" @on-change="changeShareConfig">
              <Radio :label="1">是</Radio>
              <Radio :label="0">否</Radio>
            </RadioGroup>
            <div v-if="tempActivity.actConfigExpress.actShareConfig.shareFlag === 1">
              <div>
                <div style="display:inline-block;vertical-align:middle">
                  <FormItem>
                    标题：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareTitle"
                              style="width: 350px" :maxlength="30"
                              placeholder="输入30个字以内"
                              clearable/></FormItem>
                  <br>
                  <FormItem>
                    描述：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareDesc"
                              style="width: 520px" :maxlength="50"
                              placeholder="输入50个字以内"
                              clearable/></FormItem>
                  <br>
                  <FormItem prop="actConfigExpress.actShareConfig.shareUrl">
                    链接：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareUrl"
                              style="width: 520px" type="textarea" :autosize="{minRows: 2,maxRows: 8}"
                              placeholder="输入分享的连接"
                              clearable/></FormItem>
                </div>
                &nbsp&nbsp&nbsp
                <!--图片上传组件-->
                <div style="display:inline-block;vertical-align:middle">图片：&nbsp</div>
                <div style="display:inline-block;vertical-align:middle">
                  <div>
                    <div class="demo-upload-list" v-if="tempActivity.actConfigExpress.actShareConfig.shareIcon !== ''">
                      <img :src=tempActivity.actConfigExpress.actShareConfig.shareIcon>
                      <div class="demo-upload-list-cover">
                        <Icon type="ios-eye-outline" @click.native="handleShareView"></Icon>
                        <Icon type="ios-trash-outline" @click.native="handleShareRemove"></Icon>
                      </div>
                    </div>
                    <Upload
                      v-if="tempActivity.actConfigExpress.actShareConfig.shareIcon === ''"
                      ref="uploadshareIcon"
                      :show-upload-list="false"
                      :on-success="handleShareSuccess"
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
                    <Modal title="图片查看" v-model="visibleShare">
                      <img :src="tempActivity.actConfigExpress.actShareConfig.shareIcon" v-if="visibleShare"
                           style="width: 100%">
                    </Modal>
                  </div>
                </div>
              </div>
            </div>
          </FormItem>
          <FormItem label="返佣业务">
            <Select v-model="tempActivity.actConfigExpress.actTypeConfig.bizType" @on-change="searchParkList"
                    style="width: 120px">
              <Option :value=0>无</Option>
              <Option :value=1>闲时优惠</Option>
              <Option :value=2 disabled>月租</Option>
            </Select>
          </FormItem>
          <!--基础配置结束-->

          <!--返佣设置开始-->
          <Divider orientation="left" id="divider" style="font-size: 16px;color:#2d8cf0;">返佣奖励设置</Divider>
          <CouponSelect ref="CouponSelect" @getSelectCoupons="getCoupons($event)"
                        :coupon-multiple-selection="couponMultipleSelection"/>
          <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">推荐车场设置</Divider>
          <!--引入子模块，ref作为标识, 选择部分车场时显示子模块-->
          <ParkSelect ref="ParkSelect" @getSelectParks="getParks($event)"
                      :park-multiple-selection="parkMultipleSelection"/>
          <!--返佣设置结束-->

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
    </modal>
  </div>
</template>

<script>
import { create, remove, update } from '@/api/activity/activity'
import Divider from 'iview/src/components/divider/divider'
import editor from '_c/editor/editor.vue'
import ParkSelect from '_c/park-select/park-select.vue'
import CouponSelect from '_c/coupon-select/coupon-select.vue'

export default {
  name: 'activity-config-rebate',
  components: {
    Divider, editor, ParkSelect, CouponSelect
  },

  data () {
    return {
      parkMultipleSelection: [],
      couponMultipleSelection: [],
      editorCache: false,
      // 上传图片
      visible: false,
      visibleShare: false,

      // 活动
      currentStep: 0,
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      buttonBackward: true,
      buttonForward: false,

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
        actConfigExpress: {
          actTypeConfig: {
            bizType: 1,
            rewardList: [],
            parkList: []
          },
          actParticipantConfig: {
            participantType: ['0'],
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
            shareUrl: null,
            shareDesc: null
          }
        }
      },
      // 活动校验
      rulesActivity: {
        actType: [{ required: true, message: '活动类型不能为空' }],
        title: [{ required: true, message: '活动主题不能为空' }],
        actPic: [{ required: true, message: '活动主题图不能为空' }],
        summary: [{ required: true, message: '活动简介不能为空' }],
        rangeTime: [{ required: true, message: '有效期不能为空' }],
        context: [{ required: true, message: '内容及说明不能为空' }],
        'actConfigExpress.actShareConfig.shareUrl': [{ type: 'url', message: 'URL格式错误' }]
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
          value: '抽奖类活动',
          label: 0
        },
        {
          value: '礼包类活动',
          label: 1
        },
        {
          value: '祝福类活动',
          label: 2
        },
        {
          value: '返佣类活动',
          label: 3
        }
      ]
    }
  },
  created () {
  },
  methods: {
    // 获取父组件值
    getActivityValue (val) {
      this.tempActivity = val
      this.couponMultipleSelection = this.tempActivity.actConfigExpress.actTypeConfig.rewardList
      this.parkMultipleSelection = this.tempActivity.parkList
      this.$refs.editor.setHtml(this.tempActivity.context)
    },
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList()
    },
    createData () {
      if (!this.checkStep2()) {
        return
      }
      this.getParkIds()
      create(this.tempActivity).then(() => {
        this.dialogFormVisible = false
        // 调用父组件的getList
        this.$emit('getList')
        this.resetStep()
        this.$Notice.success({ title: '成功', desc: '新增成功' })
      })
    },
    updateData () {
      if (!this.checkStep2()) {
        return
      }
      this.getParkIds()
      this.tempActivity.status = ''
      update(this.tempActivity).then(() => {
        this.$emit('getList', 3)
        this.resetStep()
        this.dialogFormVisible = false
        this.$Notice.success({ title: '成功', desc: '修改成功' })
      })
    },
    handleStopActivity (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将停止活动的使用, 是否继续?',
        onOk: () => {
          remove(id).then(() => {
            this.$emit('getList', 3)
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
      this.$emit('getList', 3)
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
      if ((this.tempActivity.actConfigExpress.actNumberConfig.limit == null ||
            Number(this.tempActivity.actConfigExpress.actNumberConfig.limit) == 0) &&
          (this.tempActivity.actConfigExpress.actNumberConfig.dailyLimit == null ||
            Number(this.tempActivity.actConfigExpress.actNumberConfig.dailyLimit) == 0)) {
        this.$Message.error('活动期间参与次数和每日参与次数不能同时为空')
        return flag
      }
      if ((Number(this.tempActivity.actConfigExpress.actNumberConfig.limit) <
            Number(this.tempActivity.actConfigExpress.actNumberConfig.dailyLimit))) {
        this.$Message.error('每日参与次数不能大于总参与次数')
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
        if (this.tempActivity.actConfigExpress.actTypeConfig.rewardList.length === 0) {
          this.$Message.error('请配置优惠券')
          return flag
        }
        if (this.tempActivity.actConfigExpress.actTypeConfig.parkList.length === 0) {
          this.$Message.error('请配置推荐停车场')
          return flag
        }
        if (this.tempActivity.actConfigExpress.actTypeConfig.parkList.length > 6) {
          this.$Message.error('推荐停车场不能超过6个')
          return flag
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

    // 从车场选择组件中获取已选择的车场id
    getParks (selectedParks) {
      this.tempActivity.actConfigExpress.actTypeConfig.parkList = selectedParks
    },
    // 保存数据时 只保存车场id
    getParkIds () {
      let selectedParks = this.tempActivity.actConfigExpress.actTypeConfig.parkList
      let parkIdList = []
      selectedParks.forEach((item) => {
        parkIdList.push(item.parkId)
      })
      this.tempActivity.actConfigExpress.actTypeConfig.parkList = parkIdList
    },
    // 从车场选择组件中获取已选择的优惠券
    getCoupons (selectedCoupons) {
      this.tempActivity.actConfigExpress.actTypeConfig.rewardList = selectedCoupons
    },

    // 下拉框变化触发车场列表筛选
    searchParkList () {
      this.$refs.ParkSelect.resetParkSearch()
      this.$refs.ParkSelect.parkSearch.bizType = this.tempActivity.actConfigExpress.actTypeConfig.bizType
      this.$refs.ParkSelect._searchParks()
    },

    // 数据清空
    resetTempActivity () {
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
            bizType: 1,
            rewardList: [],
            parkList: []
          },
          actParticipantConfig: {
            participantType: ['0'],
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
            shareUrl: null,
            shareDesc: null
          }
        }
      }
      this.$refs.editor.setHtml(this.tempActivity.context)
      this.parkMultipleSelection = []
      this.couponMultipleSelection = []
    }
  }
}
</script>

<style>

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
