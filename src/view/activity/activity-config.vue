<template>
  <div>
    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false"
           :width="1000">
      <Steps :current="currentStep" class="ivu-steps">
        <Step title="基础配置" content="填写活动基础信息"></Step>
        <Step title="规则配置" content="设置活动规则"></Step>
      </Steps>
      <Divider></Divider>

      <Form ref="dataFormActivity" :label-width="100" :model="tempActivity" :rules="rulesActivity">
        <!--基础配置-->
        <div v-if="currentStep === 0">
          <FormItem label="活动类型" prop="actType">
            <Select v-model="tempActivity.actType" style="width: 120px" clearable>
              <!--<Option v-for="item in actTypeList" :value="item.label" :key="item.label">{{item.value}}</Option>-->
              <Option :value=0>抽奖类活动</Option>
              <Option :value=1 disabled>礼包类活动</Option>
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
              <Modal title="View Image" v-model="visible">
                <img :src="tempActivity.actPic" v-if="visible" style="width: 100%">
              </Modal>
            </div>
          </FormItem>
          <FormItem label="活动简介" prop="summary">
            <Input v-model="tempActivity.summary" type="textarea" :autosize="{minRows: 5,maxRows: 10}" :maxlength="500"
                   style="width: 520px" placeholder="请输入简介、描述、宣传等话术(100字以内)" clearable/>
          </FormItem>
          <FormItem label="内容及说明" prop="context">
            <!--富文本编辑器-->
            <editor ref="editor" :value="tempActivity.context" :cache="editorCache"
                    @on-change="handleChangeContent"></editor>
          </FormItem>
        </div>
        <!--规则配置开始-->
        <div v-if="currentStep === 1">
          <!--抽奖活动模块-->
          <FormItem label="抽奖形式" prop="actConfigExpress.actTypeConfig.playType">
            <Select v-model="tempActivity.actConfigExpress.actTypeConfig.playType" style="width: 120px"
                    clearable>
              <!--<Option v-for="item in playTypeList" :value="item.label" :key="item.label">{{item.value}}</Option>-->
              <Option :value=0>幸运时光机</Option>
              <Option :value=1 disabled>大转盘</Option>
              <Option :value=2 disabled>九宫格</Option>
              <Option :value=3 disabled>刮刮乐</Option>
            </Select>
          </FormItem>
          <FormItem label="参与条件" prop="actConfigExpress.actParticipantConfig.participantType">
            <CheckboxGroup v-model="tempActivity.actConfigExpress.actParticipantConfig.participantType">
              <Checkbox label=0 disabled>注册用户</Checkbox>
              <Checkbox label=1>关注用户</Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="参与次数" prop="actConfigExpress.actNumberConfig.limit">
            活动期间最多有&nbsp<Input v-model="tempActivity.actConfigExpress.actNumberConfig.limit" size="small"
                               @on-keydown="tempActivity.actConfigExpress.actNumberConfig.limit=tempActivity.actConfigExpress.actNumberConfig.limit.replace(/[^\d]/g,'')"
                               @on-keyup="tempActivity.actConfigExpress.actNumberConfig.limit=tempActivity.actConfigExpress.actNumberConfig.limit.replace(/[^\d]/g,'')"
                               style="width:100px;height:20px" :maxlength="10" clearable></Input>&nbsp次抽奖机会
          </FormItem>
          &nbsp&nbsp&nbsp
          <FormItem prop="actConfigExpress.actNumberConfig.dailyLimit">
            每天最多有&nbsp<Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyLimit" size="small"
                             @on-keydown="tempActivity.actConfigExpress.actNumberConfig.dailyLimit=tempActivity.actConfigExpress.actNumberConfig.dailyLimit.replace(/[^\d]/g,'')"
                             @on-keyup="tempActivity.actConfigExpress.actNumberConfig.dailyLimit=tempActivity.actConfigExpress.actNumberConfig.dailyLimit.replace(/[^\d]/g,'')"
                             style="width:100px;height:20px" :maxlength="10" clearable></Input>&nbsp次抽奖机会
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
                              style="width: 350px" :maxlength="20"
                              placeholder="输入20个字以内"
                              clearable/></FormItem>
                  <br>
                  <FormItem>
                    描述：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareDesc"
                              style="width: 520px" :maxlength="30"
                              placeholder="输入30个字以内"
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
                    <Modal title="View Image" v-model="visibleShare">
                      <img :src="tempActivity.actConfigExpress.actShareConfig.shareIcon" v-if="visibleShare"
                           style="width: 100%">
                    </Modal>
                  </div>
                </div>
              </div>
            </div>
          </FormItem>
          <!--奖品列表-->
          <!--抽奖类活动才有奖品-->
          <div v-if="tempActivity.actType === 0">
            <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">奖品池设置</Divider>
            <Table ref="tablesMain" :data="prizesList" :columns="columns" :loading="listLoadingPrize" :border="true">
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
                <Button v-if="$viewAccess('act:prize:edit')" type="primary" size="small" style="margin-right: 5px"
                        @click="dialogStatus==='create'?handleUpdatePrizeByCreate(index):handleUpdatePrize(row.id)">编辑
                </Button>
                <Button v-if="$viewAccess('act:prize:delete')" type="error" size="small"
                        @click="dialogStatus==='create'?handleDeletePrizeByCreate(index):handleDeletePrize(row.id)">删除
                </Button>
              </template>
            </Table>
            <div>
              <Page v-show="true" :total="total" :current.sync="listQueryPrize.current"
                    :page-size="listQueryPrize.size"
                    show-total show-sizer show-elevator style="display:inline-block;vertical-align:middle"
                    @on-change="getPrizeList(tempActivity.id)" @on-page-size-change="handlePrizePageSize"/>
              <div class="add-prizes">
                <Button v-if="$viewAccess('act:prize:add')" type="success" icon="md-add"
                        @click="handleCreatePrize">添加奖项
                </Button>
              </div>
            </div>
          </div>

          <!--奖品-->
          <Modal :title="textMapPrize[dialogStatusPrizes]" v-model="dialogFormVisiblePrizes"
                 :mask-closable="false" :width="900">
            <Form ref="dataFormPrize" :rules="rulesPrizes" :model="tempPrize" :label-width="100" inline>
              <FormItem label="奖品名称" prop="name">
                <Input v-model="tempPrize.name" style="width:200px" :maxlength="10" clearable/>
              </FormItem>
              <FormItem label="奖品类型" prop="prizeType">
                <Select v-model="tempPrize.prizeType" style="width:150px" @on-change="changePrizeType" clearable>
                  <Option v-for="item in prizeTypeList" :value="item.label" :key="item.value">{{item.value}}</Option>
                </Select>
              </FormItem>
              <br>
              <FormItem label="虚拟奖品类型" v-show="tempPrize.prizeType === 1">
                <Select v-model="tempPrize.prizeExtExpress.virtualType" style="width:150px"
                        @on-change="changeVirtualType" clearable>
                  <!--<Option v-for="item in virtualTypeList" :value="item.label" :key="item.value">{{item.value}}</Option>-->
                  <Option :value=0>优惠券</Option>
                  <Option :value=1 disabled>积分</Option>
                </Select>
              </FormItem>
              <Button v-if="$viewAccess('act:prize:add')"
                      v-show="tempPrize.prizeType === 1 && tempPrize.prizeExtExpress.virtualType === 0" type="success"
                      icon="md-search"
                      @click="getCouponList">
                查看所有优惠券
              </Button>
              <br>
              <FormItem label="优惠券名称" v-show="tempPrize.prizeType === 1 && tempPrize.prizeExtExpress.virtualType === 0">
                <Input v-model="tempPrize.prizeExtExpress.virtualValue.couponName"
                       style="width:200px" :maxlength="10" clearable/>
              </FormItem>
              <br>
              <FormItem label="优惠券最大值（元）" v-show="tempPrize.prizeExtExpress.virtualType === 0"
                        prop="prizeExtExpress.virtualValue.value">
                <Input v-model="tempPrize.prizeExtExpress.virtualValue.couponMax"
                       style="width:100px" disabled clearable/>
              </FormItem>
              <FormItem label="虚拟奖品金额（元）" v-show="tempPrize.prizeType === 1" prop="prizeExtExpress.virtualValue.value">
                <Input v-model="tempPrize.prizeExtExpress.virtualValue.value"
                       @on-keydown="tempPrize.prizeExtExpress.virtualValue.value=tempPrize.prizeExtExpress.virtualValue.value.replace(/[^\d]/g,'')"
                       @on-keyup="tempPrize.prizeExtExpress.virtualValue.value=tempPrize.prizeExtExpress.virtualValue.value.replace(/[^\d]/g,'')"
                       style="width:100px" clearable/>
              </FormItem>
              <br>
              <FormItem label="奖项等级">
                <Select v-model="tempPrize.level" style="width:150px" clearable>
                  <Option v-for="item in levelList" :value="item.label" :key="item.value">{{item.value}}</Option>
                </Select>
              </FormItem>
              <FormItem label="中奖权重占比" prop="prizeExtExpress.probability">
                <Input v-model="tempPrize.prizeExtExpress.probability"
                       @on-keydown="tempPrize.prizeExtExpress.probability=tempPrize.prizeExtExpress.probability.replace(/[^\d]/g,'')"
                       @on-keyup="tempPrize.prizeExtExpress.probability=tempPrize.prizeExtExpress.probability.replace(/[^\d]/g,'')"
                       style="width: 100px" :maxlength="10" clearable>
                </Input>
              </FormItem>
              <FormItem label="奖项图片">
                <div>
                  <div class="demo-upload-list" v-if="tempPrize.prizeIcon !== ''">
                    <img :src=tempPrize.prizeIcon>
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-eye-outline" @click.native="handlePrizeView"></Icon>
                      <Icon type="ios-trash-outline" @click.native="handlePrizeRemove"></Icon>
                    </div>
                  </div>
                  <Upload
                    v-if="tempPrize.prizeIcon === ''"
                    ref="uploadprizeIcon"
                    :show-upload-list="false"
                    :on-success="handlePrizeSuccess"
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
                  <Modal title="View Image" v-model="visiblePrize">
                    <img :src="tempPrize.prizeIcon" v-if="visiblePrize"
                         style="width: 100%">
                  </Modal>
                </div>
              </FormItem>
              <br>
              <FormItem label="奖项数量" prop="dailyNum">
                每日固定数量&nbsp<Input v-model="tempPrize.dailyNum"
                                  @on-keydown="tempPrize.dailyNum=tempPrize.dailyNum.replace(/[^\d]/g,'')"
                                  @on-keyup="tempPrize.dailyNum=tempPrize.dailyNum.replace(/[^\d]/g,'')"
                                  style="width:100px" :maxlength="10" clearable></Input>
              </FormItem>
              <FormItem prop="totalNum">
                总数量&nbsp<Input v-model="tempPrize.totalNum"
                               @on-keydown="tempPrize.totalNum=tempPrize.totalNum.replace(/[^\d]/g,'')"
                               @on-keyup="tempPrize.totalNum=tempPrize.totalNum.replace(/[^\d]/g,'')"
                               style="width:100px" :maxlength="10" clearable></Input>
              </FormItem>
              <br>
              <!--<FormItem label="奖项描述">-->
              <!--<Input v-model="tempPrize.prizeExtExpress.prizeDesc" style="width:380px" clearable/>-->
              <!--</FormItem>-->

            </Form>
            <div slot="footer">
              <Button @click="dialogFormVisiblePrizes = false ">取消</Button>
              <Button type="primary" v-if="$viewAccess('act:prize:add') && dialogStatus==='create'"
                      @click="dialogStatusPrizes==='create'?createPrizeDataByCreate():updatePrizeDataByCreate()">保存
              </Button>
              <Button type="primary" v-if="$viewAccess('act:prize:add') && dialogStatus==='update'"
                      @click="dialogStatusPrizes==='create'?createPrizeData():updatePrizeData()">保存
              </Button>
            </div>
          </Modal>
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
    <!--优惠券列表-->
    <modal title="优惠券列表" v-model="dialogFormVisibleCoupon" :mask-closable="false" :width="800">
      <Table ref="tablesMain" :data="couponList" :columns="columnsCoupon" :loading="listLoadingCoupon" :border="true">
        <template slot="couponAt" slot-scope="{ row }">
          {{(row.couponAt)/100}}
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button type="primary" size="small" style="margin-right: 5px"
                  @click="selectCoupon(row.cpBatno,row.batTitle,row.picUrl,row.couponAt)">选择
          </Button>
        </template>
      </Table>
      <Page v-show="couponTotal>0" :total="couponTotal" :current.sync="listQueryCoupon.current"
            :page-size="listQueryCoupon.size"
            show-total show-sizer show-elevator
            @on-change="getCouponList" @on-page-size-change="handlePageSizeCoupon"/>
    </modal>
  </div>
</template>

<script>
  import {create, fetchInfo, fetchList, remove, update, couponList} from '@/api/activity/activity'
  import * as prizeApi from '@/api/activity/prize'
  import Divider from 'iview/src/components/divider/divider'
  import editor from '_c/editor/editor.vue'

  export default {
    name: 'activity-config',
    components: {
      Divider, editor
    },

    data() {
      return {
        editorCache: false,
        // 上传图片
        visible: false,
        visibleShare: false,
        visiblePrize: false,

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
              templateId: null,
              playType: null
            },
            actParticipantConfig: {
              participantType: ["0"],
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
          },
          actPrizes: []
        },
        // 活动校验
        rulesActivity: {
          actType: [{required: true, message: '活动类型不能为空'}],
          title: [{required: true, message: '活动主题不能为空'}],
          actPic: [{required: true, message: '活动主题图不能为空'}],
          summary: [{required: true, message: '活动简介不能为空'}],
          rangeTime: [{required: true, message: '有效期不能为空'}],
          context: [{required: true, message: '内容及说明不能为空'}],
          'actConfigExpress.actShareConfig.shareUrl': [{type: 'url', message: 'URL格式错误'}],
          'actConfigExpress.actTypeConfig.playType': [{required: true, message: '抽奖形式不能为空', trigger: 'blur'}],
          'actConfigExpress.actNumberConfig.limit': [{
            type: 'number',
            message: '请输入数字',
            trigger: 'blur',
            transform(value) {
              return Number(value)
            }
          }],
          'actConfigExpress.actNumberConfig.dailyLimit': [{
            type: 'number',
            message: '请输入数字',
            trigger: 'blur',
            transform(value) {
              return Number(value)
            }
          }]
        },
        optionsTime: {
          disabledDate(date) {
            return date && date.valueOf() < Date.now() - 86400000;
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
          }
        ],
        // 规则配置开始
        // 奖品数据模型
        tempPrize: {
          id: null,
          actId: null,
          prizeType: 0,
          name: null,
          level: null,
          prizeIcon: '',
          dailyNum: null,
          totalNum: null,
          prizeExt: '',
          prizeExtExpress: {
            virtualType: null,
            probability: null,
            prizeDesc: null,
            entLogo: null,
            // 优惠券
            virtualValue: {
              couponId: null,
              couponName: null,
              couponPicUrl: null,
              couponMax: null,
              value: null
            }
          }
        },
        // 奖品校验
        rulesPrizes: {
          name: [{required: true, message: '奖品名称不能为空'}],
          prizeType: [{required: true, message: '奖品类型不能为空'}],
          'prizeExtExpress.virtualValue.value': [{
            type: 'number',
            message: '请输入数字',
            trigger: 'blur',
            transform(value) {
              return Number(value)
            }
          }],
          'prizeExtExpress.probability': [
            {required: true, message: '中奖权重占比不能为空'},
            {
              type: 'number',
              message: '请输入数字',
              trigger: 'blur',
              transform(value) {
                return Number(value)
              }
            }
          ],
          dailyNum: [{
            type: 'number',
            message: '请输入数字',
            trigger: 'blur',
            transform(value) {
              return Number(value)
            }
          }],
          totalNum: [
            {
              type: 'number',
              message: '请输入数字',
              trigger: 'blur',
              transform(value) {
                return Number(value)
              }
            }
          ]
        },
        prizesList: [],
        total: 10,
        listLoadingPrize: false,
        dialogFormVisiblePrizes: false,
        dialogStatusPrizes: '',
        // 首次创建活动奖品索引
        prizeIndex: null,
        // 奖项列表信息
        listQueryPrize: {
          current: 1,
          size: 10,
          actId: null
        },
        listQuery: {
          current: 1,
          size: 10
        },
        listQueryCoupon: {
          current: 1,
          size: 10
        },
        textMapPrize: {
          update: '修改奖品',
          create: '新增奖品'
        },
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
            title: '虚拟奖品值（元）',
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
            title: '中奖权重占比',
            slot: 'probability',
            renderHeader: (h, params) => {
              return h('span', [
                h('Tooltip', {
                  props: {
                    maxWidth: '200',
                    content: "     单个奖品的中奖权重占比除以所有奖品的中奖权重占比之和，即为该奖品的中奖率。",
                    trigger: 'hover',
                    size: 'small',
                    placement: 'top-start'
                  }
                }, [
                  h('span', {
                    domProps: {
                      innerHTML: '中奖权重占比   <i class="ivu-icon ivu-icon-md-help-circle"></i>'
                    }
                  })
                ])
              ])
            }
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        playTypeList: [
          {
            value: '幸运时光机',
            label: 0
          },
          {
            value: '大转盘',
            label: 1
          },
          {
            value: '九宫格',
            label: 2
          },
          {
            value: '刮刮乐',
            label: 3
          }
        ],
        participantTypeList: [
          {
            value: '注册用户',
            label: 0
          },
          {
            value: '关注用户',
            label: 1
          }
        ],
        prizeTypeList: [
          {
            value: '未中奖',
            label: 0
          },
          {
            value: '虚拟物品',
            label: 1
          },
          {
            value: '邮寄实物',
            label: 2
          },
          {
            value: '线下处理物品',
            label: 3
          }
        ],
        virtualTypeList: [
          {
            value: '优惠券',
            label: 0
          },
          {
            value: '积分',
            label: 1
          }
        ],
        levelList: [
          {
            value: '一等奖',
            label: 1
          },
          {
            value: '二等奖',
            label: 2
          },
          {
            value: '三等奖',
            label: 3
          }
        ],
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
        },
        // 规则配置结束
        // 优惠券配置
        couponList: [],
        listLoadingCoupon: false,
        dialogFormVisibleCoupon: false,
        couponTotal: 10,
        pages: {},
        columnsCoupon: [
          {
            title: '活动编号',
            key: 'cpBatno'
          },
          {
            title: '优惠券名称',
            key: 'batTitle'
          },
          {
            title: '优惠券金额',
            slot: 'couponAt'
          },
          {
            title: '活动开始时间',
            key: 'batStartDt'
          },
          {
            title: '活动结束时间',
            key: 'batEndDt'
          },
          {
            title: '操作',
            slot: 'action',
            width: 100,
            align: 'center'
          }
        ]
      }
    },
    created() {
    },
    methods: {
      // 获取父组件值
      getActivityValue(val) {
        this.tempActivity = val
        this.prizesList = this.tempActivity.actPrizes
        this.$refs.editor.setHtml(this.tempActivity.context)
      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getList()
      },
      createData() {
        if (!this.checkStep2()) {
          return
        }
        this.tempActivity.actPrizes = this.prizesList
        create(this.tempActivity).then(() => {
          this.dialogFormVisible = false
          // 调用父组件的getList
          this.$emit('getList')
          this.resetStep()
          this.$Notice.success({title: '成功', desc: '新增成功'})
        })
      },
      updateData() {
        if (!this.checkStep2()) {
          return
        }
        this.tempActivity.status = ''
        update(this.tempActivity).then(() => {
          this.$emit('getList')
          this.resetStep()
          this.dialogFormVisible = false
          this.$Notice.success({title: '成功', desc: '修改成功'})
        })
      },
      handleStopActivity(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将停止活动的使用, 是否继续?',
          onOk: () => {
            remove(id).then(() => {
              this.$emit('getList')
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '下架成功'})
            })
          }
        })
      },
      handleBackward() {
        if (this.currentStep !== 0) {
          this.currentStep -= 1
          this.buttonForward = false
          this.buttonBackward = true
        }
      },
      handleForward() {
        if (!this.checkStep1()) {
          return
        }
        if (this.currentStep !== 1) {
          this.currentStep += 1
          this.buttonForward = true
          this.buttonBackward = false
        }
      },
      handleClose() {
        this.dialogFormVisible = false
        this.resetStep()
        this.resetTempActivity()
        this.$emit('getList')
      },
      resetStep() {
        this.currentStep = 0
        this.buttonBackward = true
        this.buttonForward = false
      },
      //  规则配置开始
      getPrizeList(actId) {
        this.listLoadingPrize = true
        this.listQueryPrize.actId = actId
        prizeApi.fetchList(this.listQueryPrize).then(response => {
          this.prizesList = this.parsePrizeExt(response.data.records)
          this.total = response.data.total
          this.listLoadingPrize = false
        })
      },
      // 解析奖品表达式
      parsePrizeExt(prizesList) {
        let list = []
        for (let i = 0; i < prizesList.length; i++) {
          prizesList[i].prizeExtExpress = JSON.parse(prizesList[i].prizeExt)
          list.push(prizesList[i])
        }
        return list.reverse()
      },
      handlePrizePageSize(value) {
        this.listQueryPrize.size = value
        this.getPrizeList(this.tempActivity.id)
      },
      handleCreatePrize() {
        this.resetTempPrize()
        this.$refs['dataFormPrize'].resetFields()
        this.dialogStatusPrizes = 'create'
        this.dialogFormVisiblePrizes = true
        this.tempPrize.actId = this.tempActivity.id
      },
      handleUpdatePrize(id) {
        prizeApi.fetchInfo(id).then(res => {
          this.tempPrize = Object.assign({}, res.data) // copy obj
          this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax / 100
          this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value / 100
          this.dialogStatusPrizes = 'update'
          this.dialogFormVisiblePrizes = true
        })
      },
      handleUpdatePrizeByCreate(index) {
        this.prizeIndex = index
        this.tempPrize = this.prizesList[index]
        this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax / 100
        this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value / 100
        this.dialogStatusPrizes = 'update'
        this.dialogFormVisiblePrizes = true
      },
      // 首次添加活动时 配置奖品
      createPrizeDataByCreate() {
        if (!this.checkPrize()) {
          return
        }
        this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax * 100
        this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value * 100
        this.prizesList.push(this.tempPrize)
        this.resetTempPrize()
        this.dialogFormVisiblePrizes = false
      },
      updatePrizeDataByCreate() {
        if (!this.checkPrize()) {
          return
        }
        this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax * 100
        this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value * 100
        this.prizesList.splice(this.prizeIndex, 1, this.tempPrize)
        this.prizeIndex = null
        this.resetTempPrize()
        this.dialogFormVisiblePrizes = false
      },
      handleDeletePrizeByCreate(index) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该奖品, 是否继续?',
          onOk: () => {
            this.prizesList.splice(index, 1)
            this.resetTempPrize()
            this.dialogFormVisiblePrizes = false
            this.$Notice.success({title: '成功', desc: '删除成功'})
          }
        })
      },
      // 活动已经存在时 配置奖品
      createPrizeData() {
        if (!this.checkPrize()) {
          return
        }
        this.dialogFormVisiblePrizes = false
        this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax * 100
        this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value * 100
        prizeApi.create(this.tempPrize).then(() => {

          this.$Notice.success({title: '成功', desc: '新增成功'})
          this.getPrizeList(this.tempActivity.id)
        })
      },
      updatePrizeData() {
        if (!this.checkPrize()) {
          return
        }
        this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax * 100
        this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value * 100
        prizeApi.update(this.tempPrize).then(() => {
          this.dialogFormVisiblePrizes = false
          this.$Notice.success({title: '成功', desc: '修改成功'})
          this.getPrizeList(this.tempActivity.id)
          this.resetTempPrize()
        })
      },
      handleDeletePrize(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该奖品, 是否继续?',
          onOk: () => {
            this.tempPrize.actId = this.tempActivity.id
            this.tempPrize.id = id
            prizeApi.remove(this.tempPrize).then(() => {
              this.getPrizeList(this.tempActivity.id)
              this.$Notice.success({title: '成功', desc: '删除成功'})
            })
          }
        })
      },
      // 优惠劵
      getCouponList() {
        this.dialogFormVisibleCoupon = true
        this.listLoadingCoupon = true
        prizeApi.couponList(this.listQueryCoupon).then((response) => {
          this.couponList = this.formatCouponListDate(response.data.data)
          this.couponTotal = response.data.pages.totalRecords
          this.listLoadingCoupon = false
        })
      },
      handlePageSizeCoupon(value) {
        this.listQueryCoupon.size = value
        this.getCouponList()
      },
      selectCoupon(cpBatno, batTitle, picUrl, couponAt) {
        this.tempPrize.prizeExtExpress.virtualValue.couponId = cpBatno
        this.tempPrize.prizeExtExpress.virtualValue.couponName = batTitle
        this.tempPrize.prizeExtExpress.virtualValue.couponPicUrl = picUrl
        this.tempPrize.prizeExtExpress.virtualValue.value = couponAt / 100
        this.tempPrize.prizeExtExpress.virtualValue.couponMax = couponAt / 100
        this.dialogFormVisibleCoupon = false
      },
      // 优惠券时间戳转换为Date
      formatCouponListDate(couponList) {
        let list = []
        for (let i = 0; i < couponList.length; i++) {
          couponList[i].batStartDt = this.formatTimestamptoDate(couponList[i].batStartDt)
          couponList[i].batEndDt = this.formatTimestamptoDate(couponList[i].batEndDt)
          list.push(couponList[i])
        }
        return list
      },
      formatTimestamptoDate(timestamp) {
        let date = new Date(timestamp)
        let Y = date.getFullYear() + '-'
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
        let D = date.getDate() + ' '
        let h = date.getHours() + ':'
        let m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
        let s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
        return Y + M + D + h + m + s
      },
      //  规则配置结束
      checkStep1() {
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
      checkStep2() {
        let flag = false
        if (this.tempActivity.actConfigExpress.actTypeConfig.playType === null) {
          this.$Message.error('请选择抽奖形式')
          return flag
        }
        if (this.tempActivity.actConfigExpress.actNumberConfig.limit == null &&
          this.tempActivity.actConfigExpress.actNumberConfig.dailyLimit == null) {
          this.$Message.error('活动期间参与次数和每日参与次数不能同时为空')
          return flag
        }
        if (Number(this.tempActivity.actConfigExpress.actNumberConfig.limit)
          < Number(this.tempActivity.actConfigExpress.actNumberConfig.dailyLimit)) {
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
        }
        return true
      },
      checkPrize() {
        let flag = false
        if (this.tempPrize.prizeType == null) {
          this.$Message.error('请输入奖品类型')
          return flag
        }
        if (this.tempPrize.prizeType === 1 && this.tempPrize.prizeExtExpress.virtualType === null) {
          this.$Message.error('请选择虚拟奖品类型')
          return flag
        }
        if (this.tempPrize.prizeExtExpress.virtualType === 0
          && (this.tempPrize.prizeExtExpress.virtualValue.couponName == null
            || this.tempPrize.prizeExtExpress.virtualValue.couponName === '')) {
          this.$Message.error('请输入优惠券名称')
          return flag
        }
        if (this.tempPrize.prizeExtExpress.virtualType === 0
          && (this.tempPrize.prizeExtExpress.virtualValue.value == null
            || this.tempPrize.prizeExtExpress.virtualValue.value === '')) {
          this.$Message.error('请输入虚拟奖品金额')
          return flag
        }
        if (this.tempPrize.prizeExtExpress.virtualType === 0
          && (this.tempPrize.prizeExtExpress.probability == null
            || this.tempPrize.prizeExtExpress.probability === '')) {
          this.$Message.error('中奖权重占比不能为空')
          return flag
        }
        if (this.tempPrize.prizeExtExpress.virtualType === 0 &&
          (Number(this.tempPrize.prizeExtExpress.virtualValue.value)
            > Number(this.tempPrize.prizeExtExpress.virtualValue.couponMax))) {
          this.$Message.error('虚拟奖品金额不能大于最大值')
          return flag
        }
        if (Number(this.tempPrize.dailyNum) > Number(this.tempPrize.totalNum)) {
          this.$Message.error('每日奖品数量不能大于总数量')
          return flag
        }
        return true
      },
      changePrizeType() {
        // 活动奖品不是虚拟奖品,virtualType,virtualValue置空
        this.tempPrize.prizeExtExpress.virtualType = null
        this.tempPrize.prizeExtExpress.virtualValue.couponId = null
        this.tempPrize.prizeExtExpress.virtualValue.couponName = null
        this.tempPrize.prizeExtExpress.virtualValue.couponPicUrl = null
        this.tempPrize.prizeExtExpress.virtualValue.value = null
      },
      changeVirtualType() {
        // 虚拟奖品不是优惠券,virtualValue置空
        this.tempPrize.prizeExtExpress.virtualValue.couponId = null
        this.tempPrize.prizeExtExpress.virtualValue.couponName = null
        this.tempPrize.prizeExtExpress.virtualValue.couponPicUrl = null
        this.tempPrize.prizeExtExpress.virtualValue.couponMax = null
        this.tempPrize.prizeExtExpress.virtualValue.value = null
      },
      changeShareConfig() {
        this.tempActivity.actConfigExpress.actShareConfig.shareTitle = null
        this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
        this.tempActivity.actConfigExpress.actShareConfig.shareDesc = null
        this.tempActivity.actConfigExpress.actShareConfig.shareUrl = null
      },
      handleActView() {
        this.visible = true
      },
      handleActRemove() {
        this.tempActivity.actPic = ''
      },
      handleActSuccess(res, file) {
        this.tempActivity.actPic = res.data
        this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
      },
      handleShareView() {
        this.visibleShare = true
      },
      handleShareRemove() {
        this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
      },
      handleShareSuccess(res, file) {
        this.tempActivity.actConfigExpress.actShareConfig.shareIcon = res.data
        this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
      },
      handlePrizeView() {
        this.visiblePrize = true
      },
      handlePrizeRemove() {
        this.tempPrize.prizeIcon = ''
      },
      handlePrizeSuccess(res, file) {
        this.tempPrize.prizeIcon = res.data
        this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
      },
      handleFormatError(file) {
        this.$Notice.warning({
          title: '文件类型错误',
          desc: `文件${file.name}不是图片文件，请选择后缀为bmp/png/jpeg/jpg/gif的文件。`
        })
      },
      handleMaxSize(file) {
        this.$Notice.warning({
          title: '文件大小超出限制',
          desc: `文件${file.name}太大, 不能超过2M。`
        })
      },
      handleChangeContent(html, text) {
        this.tempActivity.context = html
      },
      // 数据清空
      resetTempActivity() {
        this.prizesList = []
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
              participantType: ["0"],
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
              shareDesc: null,
            }
          },
          actPrizes: []
        }
        this.$refs.editor.setHtml(this.tempActivity.context)
      },
      resetTempPrize() {
        this.tempPrize = {
          id: null,
          actId: null,
          prizeType: 0,
          name: null,
          level: null,
          prizeIcon: '',
          dailyNum: null,
          totalNum: null,
          prizeExt: '',
          prizeExtExpress: {
            virtualType: null,
            probability: null,
            prizeDesc: null,
            entLogo: null,
            // 优惠券
            virtualValue: {
              couponId: null,
              couponName: null,
              couponPicUrl: null,
              couponMax: null,
              value: null
            }
          }
        }
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

  .add-prizes {
    margin-left: 20px;
    margin-top: 10px;
    text-align: center;
    display: inline-block;
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
</style>>
