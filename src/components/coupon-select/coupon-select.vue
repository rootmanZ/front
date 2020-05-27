<template>
  <div class="coupon-table" id="coupons">
    <Row>
      <Col :span="2">
      <Button type="primary" class="card-wrap" @click="dialogFormVisible = true" ghost>
        <Icon type="md-add" size="20"/>
        <br>
        添加券
      </Button>
      </Col>
      <Col :span="18">
      <Row>
        <template v-for="(item,index) in couponMultipleSelection">
          <Col :span="4" :offset="2">
          <div class="coupon-card" :key="index">
            <div class="couponAt">指定：{{item.limit}}元 原始：{{item.amount}}元</div>
            <br>
            <div class="couponName">{{item.couponName}}</div>
            <div class="entName">{{item.entName}}</div>
            <!--遮罩层-->
            <div class="coupon-cover">
              <Icon type="ios-trash" size="28" style="margin-top:20px" @click="delCouponItem(item,index)"></Icon>
            </div>
          </div>
          </Col>
        </template>
      </Row>
      </Col>
    </Row>

    <!--优惠券配置-->
    <modal title="返佣奖励配置" v-model="dialogFormVisible" :mask-closable="false" @on-cancel="handleClose" :width="650">
      <Button type="success" icon="md-search" @click="handleShowCouponList">查看所有优惠券</Button>
      <Form ref="dataFormCoupon" :label-width="100" v-if="couponVisible" :model="coupon">
        <FormItem label="活动标题: ">
          {{coupon.batTitle}}
        </FormItem>
        <FormItem label="券名称: ">
          {{coupon.couponName}}
        </FormItem>
        <FormItem label="合作商: ">
          {{coupon.entName}}
        </FormItem>
        <FormItem label="券面额: ">
          {{coupon.amount}}&nbsp元
        </FormItem>
        <FormItem label="指定面额: ">
          <InputNumber :min="0" :max="Number(coupon.amount)" v-model="coupon.limit"></InputNumber>
          &nbsp元
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleClose">取消</Button>
        <Button type="primary" v-show="couponVisible" @click="saveCoupon">添加</Button>
      </div>
    </modal>

    <!--优惠券列表-->
    <modal title="优惠券列表" v-model="dialogFormVisibleCoupon" :mask-closable="false" :width="800">
      <Form :inline="true" class="search-con">
        <Form-item>
          优惠券名称：
          <Input v-model="couponSearch.couponName" style="width:120px" size="small" placeholder="请输入关键字"
                 clearable></Input>
        </Form-item>
        <Form-item>
          合作商名称：
          <Input v-model="couponSearch.entName" style="width:120px" size="small" placeholder="请输入关键字" clearable></Input>
        </Form-item>

        <Form-item>
          <Button type="primary" size="small" @click="getCouponList">搜索</Button>
        </Form-item>
      </Form>
      <Table ref="tablesMain" :data="couponList" :columns="columns" :loading="listLoadingCoupon" :border="true">
        <template slot-scope="{ row, index }" slot="action">
          <Button type="primary" size="small" style="margin-right: 5px"
                  v-if="couponCpBatnoList.indexOf(row.cpBatno) === -1"
                  @click="selectCoupon(row.batTitle,row.cpBatno,row.couponName,row.entName,row.amount,row.entLogo)">选择
          </Button>
        </template>
      </Table>
      <Page v-show="couponTotalResult>0" :total="couponTotalResult" :current.sync="couponSearch.current"
            :page-size="couponSearch.size"
            show-total show-sizer show-elevator
            @on-change="getCouponList" @on-page-size-change="handlePageSizeCoupon"/>
    </modal>
  </div>
</template>
<script>
import { searchCouponList } from '@/api/components/couponSelect'
import FormItem from 'iview/src/components/form/form-item'

export default {
  components: { FormItem },
  name: 'CouponSelect',
  props: ['couponMultipleSelection'], // 最终保存的优惠券数据
  data () {
    return {
      // 优惠券配置相关
      dialogFormVisible: false,
      couponSearch: {
        current: 1,
        size: 10,
        couponName: '',
        entName: '',
        startDt: null,
        endDt: null
      },
      totalResult: 0,

      couponList: [], // 所有优惠券数据
      columns: [
        {
          title: '优惠券名称',
          key: 'couponName',
          align: 'center'
        },
        {
          title: '合作商',
          key: 'entName',
          align: 'center'
        },
        {
          title: '金额(元)',
          key: 'amount',
          align: 'center'
        },
        {
          title: '开始时间',
          key: 'startDt',
          align: 'center'
        },
        {
          title: '结束时间',
          key: 'endDt',
          align: 'center'
        },
        {
          title: '操作',
          slot: 'action',
          width: 100,
          align: 'center'
        }
      ],

      // 优惠券列表相关
      couponVisible: false,
      couponCpBatnoList: [],
      listLoadingCoupon: false,
      dialogFormVisibleCoupon: false,
      couponTotalResult: 10,
      coupon: {
        cpBatno: '',
        batTitle: '',
        couponName: '',
        entName: '',
        amount: '',
        entLogo: '',
        limit: ''
      }
    }
  },
  created () {
  },
  mounted: function () {
    this.$emit('getSelectCoupons', this.couponMultipleSelection)
  },
  methods: {

    // 搜索优惠券列表
    getCouponList () {
      this.listLoadingCoupon = true
      let params = {}
      params = this.couponSearch
      searchCouponList(params).then(res => {
        this.couponList = res.data.records
        this.couponTotalResult = res.data.total
        this.listLoadingCoupon = false
      })
    },
    handlePageSizeCoupon (value) {
      this.couponSearch.size = value
      this.getCouponList()
    },
    getCouponCpBatnoList () {
      this.couponCpBatnoList = []
      for (let i = 0; i < this.couponMultipleSelection.length; i++) {
        this.couponCpBatnoList.push(this.couponMultipleSelection[i].cpBatno)
      }
    },
    handleShowCouponList () {
      this.resetCouponSearch()
      this.getCouponList()
      this.dialogFormVisibleCoupon = true
      this.getCouponCpBatnoList()
    },
    // 选择优惠券操作
    selectCoupon (batTitle, cpBatno, couponName, entName, amount, entLogo) {
      this.coupon.batTitle = batTitle
      this.coupon.cpBatno = cpBatno
      this.coupon.couponName = couponName
      this.coupon.entName = entName
      this.coupon.amount = amount
      this.coupon.limit = Number(amount)
      this.coupon.entLogo = entLogo
      this.dialogFormVisibleCoupon = false
      this.couponVisible = true
    },

    // 保存优惠券操作
    saveCoupon () {
      debugger
      this.couponMultipleSelection.push(this.coupon)
      this.couponVisible = false
      this.dialogFormVisible = false
      this.resetCoupon()
    },

    // 删除优惠券
    delCouponItem (item, index) {
      this.couponMultipleSelection.splice(index, 1)
    },

    handleClose () {
      this.dialogFormVisible = false
      this.couponVisible = false
      this.resetCoupon()
    },

    // 初始化数据
    resetCoupon () {
      this.coupon = {
        cpBatno: '',
        batTitle: '',
        couponName: '',
        entName: '',
        amount: '',
        entLogo: '',
        limit: ''
      }
    },

    resetCouponSearch () {
      this.couponSearch = {
        current: 1,
        size: 10,
        couponName: '',
        partnerEndId: '',
        startDt: null,
        endDt: null
      }
    }
  }
}
</script>
<style lang="less">
  .coupon-table {
    margin-left: 20px;
  }

  .card-wrap {
    height: 70px;
    width: 70px;
  }

  .card-content {
    text-align: center;
    display: inline-block;
  }

  .card-text {
    margin-top: -20px;
  }

  #middle-row {
    margin: 10px 0
  }

  .el_bottom {
    margin-bottom: 10px;
  }

  .park-table {
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    background-color: #F2F6FC;
    padding: 10px
  }

  #coupon-middle-row {
    margin: 10px 0
  }

  .coupon-card {
    margin: 0px 10px 10px 0px;
    border: 1px dashed #409eff;
    background-color: #F2F6FC;
    position: relative;
    z-index: 10;
    height: 70px;
    width: 160px;
    text-align: center;
  }

  .couponAt {
    color: #F56C6C;
  }

  .entName {
    height: 25px;
    text-align: center;
  }

  .couponName {
    height: 18px;
    margin-top: -10px;
    text-align: center;
  }

  .coupon-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
    color: #fff;
    cursor: pointer;
  }

  .coupon-card:hover .coupon-cover {
    display: block;
  }

</style>
