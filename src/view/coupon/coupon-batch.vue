<template>
  <div>
    <Row>

    </Row>
    <br>
    <Row>
      <Col span="2"></Col>
      <Col span="15">
        <Form ref="dataFormCoupon" :label-width="100" :model="couponBatch" :rules="rulesCoupon">
          <FormItem label="活动名称: " prop="batchTitle">
            {{couponBatch.batchTitle}}&nbsp&nbsp
            <Button  v-show="1===1" type="success"
                     icon="md-search"
                     @click="getCouponList">
              查看所有优惠券
            </Button>
            <br>
          </FormItem>
          <FormItem label="券名称: " v-show="couponBatch.batchTitle != null" >
            {{couponBatch.batchExt.couponName}}
          </FormItem>
          <FormItem label="适用场合: " v-show="couponBatch.batchTitle != null">
            {{couponBatch.batchExt.useType}}
          </FormItem>
          <FormItem label="券面额: " v-show="couponBatch.batchTitle != null">
            <Col span="3">
              {{couponBatch.batchExt.couponAt}}&nbsp元
            </Col>
            <Col span="3">
            </Col>
            <Col span="15">
              指定面额:
              <Input v-model="couponBatch.amount" type="number" style="width: 200px" />&nbsp元
            </Col>

          </FormItem>
          <FormItem label="使用条件: " v-show="couponBatch.batchTitle != null">
            <span v-if="couponBatch.batchExt.minUseFee != null && couponBatch.batchExt.minUseFee >0">满{{couponBatch.batchExt.minUseFee}}元可用</span>
            <span v-else>无限制</span>
          </FormItem>
          <FormItem label="使用有效期: " v-show="couponBatch.batchTitle != null && couponBatch.batchExt.days != null">
            领取之日起{{couponBatch.batchExt.days}}天可用
          </FormItem>
          <FormItem label="每人每日发放: " prop="perNum" v-show="couponBatch.batchTitle != null">
            <Input v-model="couponBatch.perNum" type="number" style="width: 200px" />&nbsp张
          </FormItem>
          <FormItem label="用户名单: "  v-show="couponBatch.batchTitle != null">
            <!--<Tabs value="name1">-->
              <!--<TabPane label="输入手机号" name="name1">-->
                <Input v-model="couponBatch.phoneList" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                       placeholder="请输入或导入用户名单" clearable/>
              <!--</TabPane>-->
              <!--<TabPane label="导入手机号" name="name2">-->
                <!--上传组件-->
                <Upload
                  :headers="uploadHeaders"
                  :format="['xls','xlsx']"
                  :on-success="handleExcelSuccess"
                  :on-format-error="handleExcelFormatError"
                  :action="this.$apiBaseUrl+'/act/coupon-batch/upload'">
                  <Button icon="ios-cloud-upload-outline">导入</Button>
                </Upload>
              <!--</TabPane>-->
            <!--</Tabs>-->
          </FormItem>
          <FormItem label="送券说明: " prop="remark" v-show="couponBatch.batchTitle != null">
            <Input v-model="couponBatch.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                   placeholder="请输入送券说明" clearable/>
          </FormItem>
          <FormItem v-show="couponBatch.batchTitle != null">
            <Button v-show="createStatus" type="primary" @click="handleCreate">确认</Button>
            <Button style="margin-left: 8px">返回</Button>
          </FormItem>
        </Form>
      </Col>
      <Col span="7"></Col>
    </Row>

    <!--优惠券列表-->
    <modal title="优惠券列表" v-model="dialogFormVisibleCoupon" :mask-closable="false" :width="800">
      <Table ref="tablesMain" :data="couponList" :columns="columnsCoupon" :loading="listLoadingCoupon" :border="true">
        <template slot="couponAt" slot-scope="{ row }">
          {{(row.couponAt)/100}}
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button type="primary" size="small" style="margin-right: 5px"
                  @click="selectCoupon(row.cpBatno,row.batTitle,row.useType,row.couponAt)">选择
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
import { create, update, remove } from '@/api/coupon/coupon'
import * as prizeApi from '@/api/activity/prize'
import { getToken } from '@/libs/util'

export default {
  name: 'coupon-batch',
  data () {
    return {
      visibleStatus: false,
      createStatus: true,

      couponBatch: {
        id: null,
        batchNo: null,
        batchTitle: null,
        batchExt: {
          couponName: null,
          useType: null,
          couponAt: null,
          amount: null,
          minUseFee: null,
          startDt: null,
          days: null,
          startType: null
        },
        phoneList: '',
        amount: '',
        perNum: '',
        remark: ''
      },
      uploadHeaders: {
        'x-auth-token': getToken()
      },

      // 校验规则
      rulesCoupon: {
        batchTitle: [{ required: true, message: '活动名称不能为空' }],
        perNum: [{ required: true, message: '每人每次发放次数不能为空' }],
        phoneList: [{ required: true, message: '用户名单不能为空' }],
        remark: [{ required: true, message: '送券备注不能为空' }]
      },

      // 优惠券配置
      listQueryCoupon: {
        current: 1,
        size: 10
      },
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

  created () {

  },

  methods: {
    // 优惠劵
    getCouponList () {
      this.dialogFormVisibleCoupon = true
      this.listLoadingCoupon = true
      prizeApi.couponList(this.listQueryCoupon).then((response) => {
        this.couponList = this.formatCouponListDate(response.data.data)
        this.couponTotal = response.data.pages.totalRecords
        this.listLoadingCoupon = false
      })
    },
    handleCreate () {
      create(this.couponBatch).then(() => {
        this.createStatus = false
        this.$Notice.success({ title: '成功', desc: '新增成功' })
      })
    },

    // 上传文件
    handleExcelSuccess (res, file) {
      if (res.code !== 0) {
        this.$Notice.warning({
          title: '上传失败',
          desc: `文件${file.name}，${res.msg}`
        })
        return
      }
      // this.couponBatch.phoneList = " "
      this.$Notice.success({ title: '上传成功', desc: `文件${file.name}，上传成功` })
    },
    handleExcelFormatError (file) {
      this.$Notice.warning({
        title: '文件类型错误',
        desc: `文件${file.name}是不支持的文件，请选择后缀为xls,xlsx的文件。`
      })
    },

    handlePageSizeCoupon (value) {
      this.listQueryCoupon.size = value
      this.getCouponList()
    },
    selectCoupon (cpBatno, batTitle, picUrl, couponAt) {
      this.couponBatch.batchNo = cpBatno
      this.couponBatch.batchTitle = batTitle
      this.couponBatch.batchExt.useType = picUrl
      this.couponBatch.batchExt.couponAt = couponAt / 100
      this.dialogFormVisibleCoupon = false
      console.log(this.couponBatch)
    },

    // 优惠券时间戳转换为Date
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
    }
  }
}

</script>

<style scoped>

</style>
