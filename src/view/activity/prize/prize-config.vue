<template>
  <div>
    <!--奖品列表-->
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
      <template slot="pointPrice" slot-scope="{row}">
        {{row.prizeExtExpress.pointPrice}}
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <Button v-if="$viewAccess('act:prize:edit') && optStatus !== 'detail'" type="primary" size="small"
                style="margin-right: 5px"
                @click="optStatus==='create'?handleUpdatePrizeByCreate(index):handleUpdatePrize(row.id)">编辑
        </Button>
        <Button v-if="$viewAccess('act:prize:delete') && optStatus !== 'detail'" type="error" size="small"
                @click="optStatus==='create'?handleDeletePrizeByCreate(index):handleDeletePrize(row.id)">删除
        </Button>
        <Button v-if="$viewAccess('act:prize-win:list') && optStatus === 'detail'" type="primary" size="small"
                style="margin-right: 5px"
                @click="toPrizeWin(row.id,row.name)">查看中奖纪录
        </Button>
      </template>
    </Table>
    <div>
      <Page v-show="true" :total="total" :current.sync="listQueryPrize.current"
            :page-size="listQueryPrize.size"
            show-total show-sizer show-elevator style="display:inline-block;vertical-align:middle"
            @on-change="getPrizeList(actId)" @on-page-size-change="handlePrizePageSize"/>
      <div class="add-prizes">
        <Button v-if="$viewAccess('act:prize:add') && optStatus !=='detail'"
                type="success"
                icon="md-add"
                size="small"
                @click="handleCreatePrize">添加奖项
        </Button>
      </div>
    </div>
    <!--奖品编辑对话框-->
    <Modal :title="textMapPrize[dialogStatusPrizes]"
           v-model="dialogFormVisiblePrizes"
           @on-cancel="resetTempPrize"
           :mask-closable="false"
           :width="900">
      <Form ref="dataFormPrize" :rules="rulesPrizes" :model="tempPrize" :label-width="120" inline>
        <FormItem label="奖品名称" prop="name">
          <Input v-model="tempPrize.name" placeholder="奖品名称(10字以内)" style="width:150px" :maxlength="10" clearable/>
        </FormItem>
        <FormItem label="奖品类型" prop="prizeType">
          <Select v-model="tempPrize.prizeType" style="width:150px" @on-change="changePrizeType" clearable>
            <Option :value=0 v-if="actType == '0'">未中奖</Option>
            <Option :value=1>虚拟物品</Option>
            <Option :value=2>邮寄实物</Option>
            <Option :value=3>线下处理物品</Option>
            <Option :value=4>线上兑奖物品</Option>
          </Select>
        </FormItem>
        <FormItem label="奖项等级" prop="level">
          <Select v-model="tempPrize.level" style="width:150px" clearable>
            <Option :value=0>无等级</Option>
            <Option :value=1>一等奖</Option>
            <Option :value=2>二等奖</Option>
            <Option :value=3>三等奖</Option>
            <Option :value=4>四等奖</Option>
            <Option :value=5>五等奖</Option>
            <Option :value=99>参与奖</Option>
          </Select>
        </FormItem>

        <Row v-show="tempPrize.prizeType === 1">
          <FormItem label="虚拟奖品类型">
            <Select v-model="tempPrize.prizeExtExpress.virtualType" style="width:150px"
                    @on-change="changeVirtualType" clearable>
              <Option :value=0>优惠券</Option>
              <Option :value=1>积分</Option>
              <Option :value=2>第三方消费固定码</Option>
            </Select>
          </FormItem>
          <Button v-if="$viewAccess('act:prize:add')"
                  v-show="tempPrize.prizeExtExpress.virtualType === 0" type="success"
                  icon="md-search"
                  @click="getCouponList">
            查看所有优惠券
          </Button>
        </Row>
        <Row v-show="tempPrize.prizeType === 1">
          <FormItem label="虚拟奖品金额(元)" v-show="tempPrize.prizeExtExpress.virtualType === 0">
            <InputNumber v-model="tempPrize.prizeExtExpress.virtualValue.value"
                         @on-change="formatVirtualValue"
                         style="width:150px" :max="100000000" :min="0" clearable/>
          </FormItem>
          <FormItem label="优惠券名称" v-show="tempPrize.prizeExtExpress.virtualType === 0">
            <Input v-model="tempPrize.prizeExtExpress.virtualValue.couponName"
                   style="width:150px" :maxlength="10" clearable/>
          </FormItem>
          <FormItem label="优惠券最大值(元)" v-show="tempPrize.prizeExtExpress.virtualType === 0">
            <Input v-model="tempPrize.prizeExtExpress.virtualValue.couponMax"
                   style="width:105px" disabled/>
          </FormItem>
        </Row>
        <Row v-show="tempPrize.prizeType === 4">
          <FormItem label="兑奖URL" prop="prizeExtExpress.onlineUrl" required>
            <Input v-model="tempPrize.prizeExtExpress.onlineUrl" style="width:420px" :maxlength="500"
                   clearable/>
          </FormItem>
        </Row>
        <Row v-show="tempPrize.prizeType === 3">
          <FormItem label="兑奖说明" prop="prizeExtExpress.receiveDesc" required>
            <Input v-model="tempPrize.prizeExtExpress.receiveDesc" style="width:420px" :maxlength="500"
                   clearable/>
          </FormItem>
        </Row>
        <Row>
          <Col :span="18">
          <Row v-if="actType == '0'">
            <FormItem label="中奖权重占比" prop="prizeExtExpress.probability" required>
              <InputNumber v-model="tempPrize.prizeExtExpress.probability" style="width: 150px"
                           @on-change="formatProbability"
                           :max="100000000" :min="0" clearable></InputNumber>
            </FormItem>
          </Row>
          <Row>
            <FormItem label="奖项数量">
              每日固定数量&nbsp<Input v-model="tempPrize.dailyNum"
                                @on-keydown="tempPrize.dailyNum=tempPrize.dailyNum.replace(/[^\d]/g,'')"
                                @on-keyup="tempPrize.dailyNum=tempPrize.dailyNum.replace(/[^\d]/g,'')"
                                style="width:75px" :maxlength="10" clearable></Input>
            </FormItem>
            <FormItem label="总数量">
              <Input v-model="tempPrize.totalNum"
                     @on-keydown="tempPrize.totalNum=tempPrize.totalNum.replace(/[^\d]/g,'')"
                     @on-keyup="tempPrize.totalNum=tempPrize.totalNum.replace(/[^\d]/g,'')"
                     style="width:150px" :maxlength="10" clearable></Input>
            </FormItem>
          </Row>
          <Row>
            <Col :span="12">
            <FormItem label="获奖限制" prop="prizeExtExpress.dailyPerLimit">
              每人每日中奖次数&nbsp<Input v-model="tempPrize.prizeExtExpress.dailyPerLimit"
                          @on-keydown="tempPrize.prizeExtExpress.dailyPerLimit=tempPrize.prizeExtExpress.dailyPerLimit.replace(/[^\d]/g,'')"
                          @on-keyup="tempPrize.prizeExtExpress.dailyPerLimit=tempPrize.prizeExtExpress.dailyPerLimit.replace(/[^\d]/g,'')"
                          style="width:75px" :maxlength="10" clearable></Input>
            </FormItem>
            </Col>
            <Col :span="12">
            <FormItem label="每人最多中奖次数" prop="prizeExtExpress.perLimit">
              &nbsp<Input v-model="tempPrize.prizeExtExpress.perLimit"
                          @on-keydown="tempPrize.prizeExtExpress.perLimit=tempPrize.prizeExtExpress.perLimit.replace(/[^\d]/g,'')"
                          @on-keyup="tempPrize.prizeExtExpress.perLimit=tempPrize.prizeExtExpress.perLimit.replace(/[^\d]/g,'')"
                          style="width:75px" :maxlength="10" clearable></Input>
            </FormItem>
            </Col>
          </Row>

          </Col>
          <Col span="6">
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
                style="display: inline-block;width:64px;">
                <div style="width: 64px;height:64px;line-height: 64px;">
                  <Icon type="ios-camera" size="20"></Icon>
                </div>
              </Upload>
              <Modal title="图片查看" v-model="visiblePrize">
                <img :src="tempPrize.prizeIcon" v-if="visiblePrize"
                     style="width: 100%">
              </Modal>
            </div>
          </FormItem>
          </Col>
        </Row>

        <Row>
          <Col :span="8">
          <!--这里使用虚拟物品的价格-->
          <FormItem label="市场价(元)" prop="prizeExtExpress.marketPrice">
            <InputNumber v-model="tempPrize.prizeExtExpress.marketPrice"
                         @on-change="formatVirtualValue"
                         style="width:150px" :max="100000000" :min="0" clearable/>
          </FormItem>
          </Col>
          <Col :span="8" v-if="actType == '4'">
          <FormItem label="积分兑换价(积分)" prop="prizeExtExpress.pointPrice">
            <Input v-model="tempPrize.prizeExtExpress.pointPrice"
                   @on-keydown="tempPrize.prizeExtExpress.pointPrice=tempPrize.prizeExtExpress.pointPrice.replace(/[^\d]/g,'')"
                   @on-keyup="tempPrize.prizeExtExpress.pointPrice=tempPrize.prizeExtExpress.pointPrice.replace(/[^\d]/g,'')"
                   style="width:150px" :maxlength="10" clearable></Input>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="奖品排序" prop="orderNo">
            <Input v-model="tempPrize.orderNo"
                   @on-keydown="tempPrize.orderNo=tempPrize.orderNo.replace(/[^\d]/g,'')"
                   @on-keyup="tempPrize.orderNo=tempPrize.orderNo.replace(/[^\d]/g,'')"
                   style="width:75px" :maxlength="10" clearable></Input>
          </FormItem>
          </Col>
        </Row>

        <Row>
          <FormItem label="冠名商名称">
            <Input v-model="tempPrize.prizeExtExpress.sponsor" placeholder="冠名商名称(10字以内)" style="width:150px"
                   :maxlength="10" clearable/>
          </FormItem>
        </Row>
        <Row>
          <FormItem label="奖品描述" prop="prizeDesc">
            <Input v-model="tempPrize.prizeDesc" :maxlength="100"
                   style="width: 420px" type="textarea" :autosize="{minRows: 2,maxRows: 6}"
                   placeholder="奖品描述(100字以内)"
                   clearable/>
          </FormItem>
        </Row>

        <Row v-show="tempPrize.prizeExtExpress.virtualType === 2">
          <FormItem label="消费码" prop="prizeDesc">
            <!--todo-->
            <Button v-if="$viewAccess('act:prize:add')"
                    type="success"
                    icon="md-add"
                    size="small"
                    @click="">导入消费码
            </Button>
            <Button v-if="$viewAccess('act:prize:add')"
                    type="primary"
                    icon="md-search"
                    size="small"
                    style="margin-left: 10px"
                    @click="">查看消费码
            </Button>
          </FormItem>
        </Row>

      </Form>
      <div slot="footer">
        <Button @click="dialogFormVisiblePrizes = false; this.resetTempPrize() ">取消</Button>
        <Button type="primary" v-if="$viewAccess('act:prize:add') && optStatus==='create'"
                @click="dialogStatusPrizes==='create'?createPrizeDataByCreate():updatePrizeDataByCreate()">保存
        </Button>
        <Button type="primary" v-if="$viewAccess('act:prize:add') && optStatus==='update'"
                @click="dialogStatusPrizes==='create'?createPrizeData():updatePrizeData()">保存
        </Button>
      </div>
    </Modal>
    <!--优惠券列表-->
    <modal title="优惠券列表" v-model="dialogFormVisibleCoupon" :mask-closable="false" :width="800">
      <Table ref="tablesMain" :data="couponList" :columns="columnsCoupon" :loading="listLoadingCoupon" :border="true">
        <template slot="couponAt" slot-scope="{ row }">
          {{(row.couponAt)/100}}
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button type="primary" size="small" style="margin-right: 5px"
                  @click="selectCoupon(row.cpBatno,row.batTitle,row.entLogPic,row.couponAt)">选择
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
import * as prizeApi from '@/api/activity/prize'
import FormItem from 'iview/src/components/form/form-item'

export default {
  components: { FormItem },
  name: 'PrizeConfig',
  // 传入参数
  props: {
    // 操作状态
    optStatus: {
      type: String,
      required: true
    },
    actId: {
      type: String,
      required: true
    },
    actPrizes: {
      type: Array,
      required: true
    },
    actType: {
      type: String,
      default: '4',
      required: false
    }
  },
  data () {
    return {
      prizesList: [],
      visiblePrize: false,

      // 奖品数据模型
      // 奖品对象
      tempPrize: {
        id: null,
        actId: null,
        prizeType: null,
        name: null,
        level: null,
        prizeIcon: '', // 奖品图片
        prizeDesc: '',
        totalNum: null, // 奖品总数 0表示不限制
        dailyNum: null, // 每日奖品数量
        winNum: null, // 已中奖数量
        orderNo: null, // 序号
        prizeExt: '', // 中奖规则配置
        prizeExtExpress: {
          virtualType: null, // 虚拟奖品类型
          probability: null, // 中奖概率
          onlineUrl: null, // 线上兑奖奖品链接
          sponsor: null, // 冠名商
          dailyPerLimit: null, // 每日每人最多中奖次数
          perLimit: null, // 每日最多中奖次数
          pointPrice: null, // 积分兑换价
          marketPrice: null, // 市场价
          receiveDesc: null, // 兑奖说明
          // 优惠券
          virtualValue: {
            value: null,
            couponId: null,
            couponName: null,
            entLogo: null,
            couponMax: null
          }
        }
      },
      // 奖品校验
      rulesPrizes: {
        name: [{ required: true, message: '奖品名称不能为空' }],
        prizeType: [{ required: true, message: '奖品类型不能为空' }],
        'prizeExtExpress.dailyPerLimit': [{ required: true, message: '获奖限制不能为空' }],
        level: [{ required: true, message: '获奖等级不能为空' }],
        'prizeExtExpress.probability': [
          { required: this.isProbabilityRequired, message: '中奖权重占比不能为空' }
        ],
        'prizeExtExpress.onlineUrl': [
          { required: this.isOnlineUrlRequired, message: '兑奖URL不能为空' },
          { type: 'url', message: '兑奖URL格式错误' }
        ],
        'prizeExtExpress.receiveDesc': [
          { required: this.isOnlineUrlRequired, message: '兑奖说明不能为空' }
        ],
        'prizeExtExpress.marketPrice': [
          { required: true, message: '市场价不能为空' }
        ],
        'prizeExtExpress.pointPrice': [
          { required: true, message: '积分兑换价不能为空' }
        ],
        prizeDesc: [{ required: true, message: '奖品描述不能为空' }]
      },
      total: 10,
      listLoadingPrize: false,

      dialogFormVisiblePrizes: false, // test

      dialogStatusPrizes: '',
      // 首次创建活动奖品索引
      prizeIndex: null,
      // 奖项列表信息
      listQueryPrize: {
        current: 1,
        size: 10,
        actId: null
      },
      // 查询优惠券
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
          title: '奖品价值(积分)',
          slot: 'pointPrice'
        },
        {
          title: '中奖权重占比',
          slot: 'probability',
          renderHeader: (h, params) => {
            return h('span', [
              h('Tooltip', {
                props: {
                  maxWidth: '200',
                  content: '     单个奖品的中奖权重占比除以所有奖品的中奖权重占比之和，即为该奖品的中奖率。',
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

      prizeTypeMap: {
        0: '未中奖',
        1: '虚拟物品',
        2: '邮寄实物',
        3: '线下处理物品',
        4: '线上兑奖物品'
      },
      virtualTypeMap: {
        0: '优惠券',
        1: '积分',
        2: '积分'
      },
      levelMap: {
        0: '无等级',
        1: '一等奖',
        2: '二等奖',
        3: '三等奖',
        4: '四等奖',
        5: '五等奖',
        99: '参与奖'
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
  computed: {
    // 是否兑奖说明 必填
    isReceiveDescRequired: function () {
      return this.tempPrize.prizeType === 3
    },
    // 是否兑奖URL 必填
    isOnlineUrlRequired: function () {
      return this.tempPrize.prizeType === 4
    },
    isProbabilityRequired: function () {
      return this.actType == 0
    }
  },
  watch: {
    actPrizes: function (newVal, oldVal) {
      this.prizesList = this.actPrizes
    }
  },
  created () {
  },
  mounted: function () {
    this.prizesList = this.actPrizes

    if (this.actType === '4') {
      this.columns = this.columns.filter(col => col.slot !== 'probability')
    } else {
      this.columns = this.columns.filter(col => col.slot !== 'pointPrice')
    }
  },
  methods: {

    // 奖品 开始
    getPrizeList (actId) {
      this.listLoadingPrize = true
      this.listQueryPrize.actId = actId
      prizeApi.fetchList(this.listQueryPrize).then(response => {
        this.prizesList = this.parsePrizeExt(response.data.records)
        this.total = response.data.total
        this.listLoadingPrize = false
      })
    },
    handlePrizePageSize (value) {
      this.listQueryPrize.size = value
      this.getPrizeList(this.actId)
    },
    // 解析奖品表达式
    parsePrizeExt (prizesList) {
      let list = []
      for (let i = 0; i < prizesList.length; i++) {
        prizesList[i].prizeExtExpress = JSON.parse(prizesList[i].prizeExt)
        list.push(prizesList[i])
      }
      return list.reverse()
    },

    // 添加奖项
    handleCreatePrize () {
      this.$nextTick(() => {
        this.resetTempPrize()
        this.$refs['dataFormPrize'].resetFields()
      })
      this.dialogStatusPrizes = 'create'
      this.dialogFormVisiblePrizes = true
      this.tempPrize.actId = this.actId
    },
    // 活动不存在时 配置奖品
    handleUpdatePrizeByCreate (index) {
      let obj
      this.prizeIndex = index
      obj = this.prizesList[index]
      this.tempPrize = obj
      this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax / 100
      this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value / 100
      this.tempPrize.prizeExtExpress.marketPrice = this.tempPrize.prizeExtExpress.marketPrice / 100
      this.dialogStatusPrizes = 'update'
      this.dialogFormVisiblePrizes = true
    },
    createPrizeDataByCreate () {
      this.$refs['dataFormPrize'].validate((valid) => {
        if (valid) {
          if (!this.checkPrize()) {
            return
          }
          this.tempPrize.actId = this.actId
          this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax * 100
          this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value * 100
          this.tempPrize.prizeExtExpress.marketPrice = this.tempPrize.prizeExtExpress.marketPrice * 100
          this.prizesList.push(this.tempPrize)
          this.resetTempPrize()
          this.dialogFormVisiblePrizes = false
          // 向上传值
          this.$emit('getPrizes', this.prizesList)
        } else {
          return this.$Message.error('请填写必填项')
        }
      })
    },
    updatePrizeDataByCreate () {
      this.$refs['dataFormPrize'].validate((valid) => {
        if (valid) {
          if (!this.checkPrize()) {
            return
          }
          this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax * 100
          this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value * 100
          this.tempPrize.prizeExtExpress.marketPrice = this.tempPrize.prizeExtExpress.marketPrice * 100
          this.prizesList.splice(this.prizeIndex, 1, this.tempPrize)
          this.prizeIndex = null
          this.resetTempPrize()
          this.dialogFormVisiblePrizes = false
          // 向上传值
          this.$emit('getPrizes', this.prizesList)
        } else {
          return this.$Message.error('请填写必填项')
        }
      })
    },
    handleDeletePrizeByCreate (index) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将删除该奖品, 是否继续?',
        onOk: () => {
          this.prizesList.splice(index, 1)
          this.resetTempPrize()
          this.dialogFormVisiblePrizes = false
          this.$Notice.success({ title: '成功', desc: '删除成功' })
        }
      })
    },
    // 活动已经存在时 配置奖品
    handleUpdatePrize (id) {
      prizeApi.fetchInfo(id).then(res => {
        this.tempPrize = Object.assign({}, res.data) // copy obj
        if (!this.tempPrize.prizeExtExpress.virtualValue) {
          this.tempPrize.prizeExtExpress.virtualValue = {
            couponId: null,
            couponName: null,
            entLogo: null,
            couponMax: 0,
            value: 0
          }
        }
        this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax / 100
        this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value / 100
        this.tempPrize.prizeExtExpress.marketPrice = this.tempPrize.prizeExtExpress.marketPrice / 100
        this.dialogStatusPrizes = 'update'
        this.dialogFormVisiblePrizes = true
      })
    },
    createPrizeData () {
      this.$refs['dataFormPrize'].validate((valid) => {
        if (valid) {
          if (!this.checkPrize()) {
            return
          }
          this.tempPrize.actId = this.actId
          this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax * 100
          this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value * 100
          this.tempPrize.prizeExtExpress.marketPrice = this.tempPrize.prizeExtExpress.marketPrice * 100
          prizeApi.create(this.tempPrize).then(() => {
            this.$Notice.success({ title: '成功', desc: '新增成功' })
            this.getPrizeList(this.actId)
            this.dialogFormVisiblePrizes = false
          })
        } else {
          return this.$Message.error('请填写必填项')
        }
      })
    },
    updatePrizeData () {
      this.$refs['dataFormPrize'].validate((valid) => {
        if (valid) {
          if (!this.checkPrize()) {
            return
          }
          this.tempPrize.prizeExtExpress.virtualValue.couponMax = this.tempPrize.prizeExtExpress.virtualValue.couponMax * 100
          this.tempPrize.prizeExtExpress.virtualValue.value = this.tempPrize.prizeExtExpress.virtualValue.value * 100
          this.tempPrize.prizeExtExpress.marketPrice = this.tempPrize.prizeExtExpress.marketPrice * 100
          prizeApi.update(this.tempPrize).then(() => {
            this.dialogFormVisiblePrizes = false
            this.$Notice.success({ title: '成功', desc: '修改成功' })
            this.getPrizeList(this.actId)
            this.resetTempPrize()
          })
        } else {
          return this.$Message.error('请填写必填项')
        }
      })
    },
    handleDeletePrize (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将删除该奖品, 是否继续?',
        onOk: () => {
          this.tempPrize.actId = this.actId
          this.tempPrize.id = id
          prizeApi.remove(this.tempPrize).then(() => {
            this.getPrizeList(this.actId)
            this.$Notice.success({ title: '成功', desc: '删除成功' })
          })
        }
      })
    },

    formatVirtualValue () {
      setTimeout(() => {
        this.tempPrize.prizeExtExpress.virtualValue.value =
            Math.floor(Number(this.tempPrize.prizeExtExpress.virtualValue.value) * 100) / 100
      })
    },
    formatProbability () {
      setTimeout(() => {
        this.tempPrize.prizeExtExpress.probability =
            Math.trunc(this.tempPrize.prizeExtExpress.probability)
      })
    },
    changePrizeType () {
      // 活动奖品不是虚拟奖品,virtualType,virtualValue置空
      this.tempPrize.prizeExtExpress.virtualType = null
      this.tempPrize.prizeExtExpress.virtualValue.couponId = null
      this.tempPrize.prizeExtExpress.virtualValue.couponName = null
      this.tempPrize.prizeExtExpress.virtualValue.entLogo = null
      this.tempPrize.prizeExtExpress.virtualValue.value = null
      this.tempPrize.prizeExtExpress.onlineUrl = null
      this.tempPrize.prizeExtExpress.receiveDesc = null
    },
    changeVirtualType () {
      // 虚拟奖品不是优惠券,virtualValue置空
      this.tempPrize.prizeExtExpress.virtualValue.couponId = null
      this.tempPrize.prizeExtExpress.virtualValue.couponName = null
      this.tempPrize.prizeExtExpress.virtualValue.entLogo = null
      this.tempPrize.prizeExtExpress.virtualValue.couponMax = null
      this.tempPrize.prizeExtExpress.virtualValue.value = null
    },

    // 校验奖品
    checkPrize () {
      let flag = false
      if (this.tempPrize.name === null || this.tempPrize.name.trim() === '') {
        this.$Message.error('请输入奖品名称')
        return flag
      }
      if (this.tempPrize.prizeType === 1 && this.tempPrize.prizeExtExpress.virtualType === null) {
        this.$Message.error('请选择虚拟奖品类型')
        return flag
      }
      if (this.tempPrize.prizeExtExpress.virtualType === 0 &&
          (this.tempPrize.prizeExtExpress.virtualValue.couponName == null ||
            this.tempPrize.prizeExtExpress.virtualValue.couponName === '')) {
        this.$Message.error('请输入优惠券名称')
        return flag
      }
      if (this.tempPrize.prizeExtExpress.virtualType === 0 &&
          (this.tempPrize.prizeExtExpress.virtualValue.value == null ||
            this.tempPrize.prizeExtExpress.virtualValue.value === '')) {
        this.$Message.error('请输入虚拟奖品金额')
        return flag
      }
      if (this.tempPrize.prizeType === 4 && this.tempPrize.prizeExtExpress.onlineUrl === null) {
        this.$Message.error('请输入兑奖URL')
        return flag
      }
      if (this.tempPrize.prizeType === 3 && this.tempPrize.prizeExtExpress.receiveDesc === null) {
        this.$Message.error('请输入兑奖说明')
        return flag
      }
      if (this.tempPrize.prizeExtExpress.virtualType === 0 &&
          (Number(this.tempPrize.prizeExtExpress.virtualValue.value) >
            Number(this.tempPrize.prizeExtExpress.virtualValue.couponMax))) {
        this.$Message.error('虚拟奖品金额不能大于最大值')
        return flag
      }
      if (Number(this.tempPrize.dailyNum) > Number(this.tempPrize.totalNum)) {
        this.$Message.error('每日奖品数量不能大于总数量')
        return flag
      }
      if (Number(this.tempPrize.prizeExtExpress.dailyPerLimit) > Number(this.tempPrize.prizeExtExpress.perLimit)) {
        this.$Message.error('每人每日中奖次数不能大于每人最多中奖次数')
        return flag
      }
      // 只有抽奖类型活动使用
      if ((this.actType == '0') && (this.tempPrize.prizeExtExpress.probability === null ||
            this.tempPrize.prizeExtExpress.probability === undefined ||
            this.tempPrize.prizeExtExpress.probability === '')) {
        this.$Message.error('中奖权重占比不能为空')
        return flag
      }
      // 只有积分兑换类型使用
      if ((this.actType == '4') && (this.tempPrize.prizeExtExpress.pointPrice === null ||
            this.tempPrize.prizeExtExpress.pointPrice === undefined ||
            this.tempPrize.prizeExtExpress.pointPrice === '')) {
        this.$Message.error('积分兑换价不能为空')
        return flag
      }
      return true
    },
    // 奖品 结束

    // 图片上传 开始
    handlePrizeView () {
      this.visiblePrize = true
    },
    handlePrizeRemove () {
      this.tempPrize.prizeIcon = ''
    },
    handlePrizeSuccess (res, file) {
      this.tempPrize.prizeIcon = res.data
      this.$Notice.success({ title: '上传成功', desc: `文件${file.name}，上传成功` })
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件类型错误',
        desc: `文件${file.name}不是图片文件，请选择后缀为bmp/png/jpeg/jpg/gif的文件。`
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '文件大小超出限制',
        desc: `文件${file.name}太大, 不能超过2M。`
      })
    },
    // 图片上传 结束

    // 优惠劵 开始
    getCouponList () {
      this.dialogFormVisibleCoupon = true
      this.listLoadingCoupon = true
      prizeApi.couponList(this.listQueryCoupon).then((response) => {
        this.couponList = this.formatCouponListDate(response.data.data)
        this.couponTotal = response.data.pages.totalRecords
        this.listLoadingCoupon = false
      })
    },
    handlePageSizeCoupon (value) {
      this.listQueryCoupon.size = value
      this.getCouponList()
    },
    selectCoupon (cpBatno, batTitle, entLogPic, couponAt) {
      this.tempPrize.prizeExtExpress.virtualValue.couponId = cpBatno
      this.tempPrize.prizeExtExpress.virtualValue.couponName = batTitle
      this.tempPrize.prizeExtExpress.virtualValue.entLogo = entLogPic
      this.tempPrize.prizeExtExpress.virtualValue.value = couponAt / 100
      this.tempPrize.prizeExtExpress.virtualValue.couponMax = couponAt / 100
      this.dialogFormVisibleCoupon = false
    },
    formatCouponListDate (couponList) {
      let list = []
      for (let i = 0; i < couponList.length; i++) {
        couponList[i].batStartDt = this.formatTimestamptoDate(couponList[i].batStartDt)
        couponList[i].batEndDt = this.formatTimestamptoDate(couponList[i].batEndDt)
        list.push(couponList[i])
      }
      return list
    },
    formatTimestamptoDate (timestamp) {
      let date = new Date(timestamp)
      let Y = date.getFullYear() + '-'
      let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      let D = date.getDate() + ' '
      let h = date.getHours() + ':'
      let m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
      let s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
      return Y + M + D + h + m + s
    },
    // 优惠劵 结束

    // 跳转到中奖管理
    toPrizeWin (id, name) {
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

    resetTempPrize () {
      this.tempPrize = {
        id: null,
        actId: null,
        prizeType: null,
        name: null,
        level: null,
        prizeIcon: '', // 奖品图片
        prizeDesc: '',
        totalNum: null, // 奖品总数 0表示不限制
        dailyNum: null, // 每日奖品数量
        winNum: null, // 已中奖数量
        orderNo: null, // 序号
        prizeExt: '', // 中奖规则配置
        prizeExtExpress: {
          virtualType: null, // 虚拟奖品类型
          probability: null, // 中奖概率
          onlineUrl: null, // 线上兑奖奖品链接
          sponsor: null, // 冠名商
          dailyPerLimit: null, // 每日每人最多中奖次数
          perLimit: null, // 每日最多中奖次数
          pointPrice: null, // 积分兑换价
          marketPrice: null, // 市场价
          receiveDesc: null, // 兑奖说明
          // 优惠券
          virtualValue: {
            value: null,
            couponId: null,
            couponName: null,
            entLogo: null,
            couponMax: null
          }
        }
      }
    }
  }
}
</script>
<style lang="less">

</style>
