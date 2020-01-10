<template>
    <div>
      <div class="search-con">
        <Input v-model="listQuery.couponBatchId" clearable placeholder="定向送券id" class="search-item-first" style="width: 180px"/>
        <Input v-model="listQuery.phone" clearable placeholder="手机号" class="search-item-first"/>
        <DatePicker type="daterange" :options="options"  split-panels placeholder="请选择发送时间" style="width: 200px" @on-change="changeDate" ></DatePicker>
        <Select v-model="listQuery.status" clearable style="width:200px" placeholder="请选择送券状态">
          <Option v-for="item in statusEnum" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button class="search-btn" type="primary" @click="getList">搜索</Button>
        <Button :disabled="resendButtonStatus" type="primary" @click="resendMsg">重新发送</Button>
      </div>
      <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading" @on-selection-change="selectDetail">
        <template slot-scope="{ row, index }" slot="stautsEn">
          <span v-for="item in statusEnum" v-if="item.value === row.status">{{item.label}}</span>
        </template>
      </Table>
      <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
            show-total show-sizer show-elevator
            @on-change="getList" @on-page-size-change="handlePageSize"/>
    </div>
</template>

<script>
import { fetchList, resend } from '@/api/coupon/detail'

export default {
  name: 'coupon-batch-detail',

  data () {
    return {
      // 送券状态枚举
      statusEnum: [
        {
          value: 1,
          label: '送券成功'
        },
        {
          value: 2,
          label: '送券失败'
        }
      ],

      // 送券明细列表
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '定向送券id',
          key: 'couponBatchId',
          align: 'center'
        },
        {
          title: '优惠券名称',
          key: 'title',
          align: 'center'
        },
        {
          title: '手机号',
          key: 'phone',
          align: 'center'
        },
        {
          title: '发送状态',
          key: 'status',
          slot: 'stautsEn',
          align: 'center'
        },
        {
          title: '发送结果',
          key: 'result',
          align: 'center'
        },
        {
          title: '发送时间',
          key: 'createTime',
          width: 150,
          align: 'center'
        }
      ],
      listQuery: {
        current: 1,
        size: 10,
        couponBatchId: null,
        phone: null,
        startDt: null,
        endDt: null,
        status: null
      },
      list: [],
      total: 10,
      listLoading: false,

      resendList: [],
      resendButtonStatus: false
    }
  },

  created () {
    this.getList()
  },
  methods: {
    getList () {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList()
    },
    changeDate (date) {
      this.listQuery.startDt = date[0]
      this.listQuery.endDt = date[1]
      console.log(this.listQuery)
    },

    // 明细多选
    selectDetail (data) {
      if (data.length > 0) {
        this.resendButtonStatus = false
      } else {
        this.resendButtonStatus = true
      }
      this.resendList = data
    },
    // 重新发送
    resendMsg () {
      resend(this.resendList).then(response => {
        this.resendList = []
        this.$Notice.success({ title: '成功', desc: '新增成功' })
      })
    }
  }
}
</script>

<style scoped>

</style>
