<template>
  <div>
    <div class="search-con" @click="getTitleList">
      <!--<Select v-model="listQuery.title" clearable placeholder="活动标题" style="width: 200px">-->
      <!--<Option v-for="item in titleList" :value="item.title" :key="item.title">{{ item.title }}</Option>-->
      <!--</Select>-->
      <Input v-model="listQuery.phone" clearable placeholder="手机号" style="width: 150px"/>
      <Select v-model="listQuery.status" clearable placeholder="发送状态" style="width: 120px">
        <Option v-for="item in rebateCouponStatusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>

      <DatePicker :value="listQuery.couponTimeRage"
                  type="datetimerange"
                  formart="yyyy-MM-dd"
                  @on-change="listQuery.couponTimeRage=$event"
                  placement="bottom-end"
                  placeholder="优惠券有效期"
                  style="width: 300px"></DatePicker>
      <DatePicker :value="listQuery.assignTimeRage"
                  type="datetimerange"
                  formart="yyyy-MM-dd"
                  @on-change="listQuery.assignTimeRage=$event"
                  placement="bottom-end"
                  placeholder="发送时间范围"
                  style="width: 300px"></DatePicker>

      <Button v-if="$viewAccess('act:rebateCoupon:list')" class="search-btn" type="primary" @click="getList"
              icon="md-search">搜索
      </Button>
      &nbsp&nbsp&nbsp
      <Button v-if="$viewAccess('act:rebateCoupon:list')" type="primary" icon="md-download" :loading="exportLoading"
              @click="exportExcel">
        导出excel
      </Button>
    </div>

    <div>
      <Table ref="rebateCoupontable" :data="rebateCouponList" :columns="columns" :loading="listLoading" :border="true">
        <template slot="status" slot-scope="scope">
          {{rebateCouponStatusMap[scope.row.status]}}
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button type="primary" size="small" style="margin-right: 5px"
                  @click="showResult(index)">查看发送结果
          </Button>
        </template>
      </Table>
      <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
            show-total show-sizer show-elevator
            @on-change="getList" @on-page-size-change="handlePageSize"/>
    </div>

    <modal title="发送结果" v-model="resultVisible" v-show="resultVisible" :mask-closable="false" :closable="false"
           :width="500">
      <div style=" word-wrap: break-word;word-break: break-all;">{{result}}</div>
      <div slot="footer">
        <Button type="primary" @click="handleClose" align="right">关闭</Button>
      </div>
    </modal>
  </div>
</template>

<script>
  import excel from '@/libs/excel'
  import {fetchList, fetchExcel} from '@/api/rebate/rebateCoupon'
  import {titleList} from '@/api/activity/activity'

  export default {
    name: 'rebate-coupon',
    data() {
      return {

        listQuery: {
          current: 1,
          size: 10,
          phone: '',
          status: '',
          couponTimeRage: [],
          assignTimeRage: []
        },
        rebateCouponList: [],
        total: 10,
        listLoading: false,
        exportLoading: false,
        titleList: [],
        resultVisible: false,
        result: null,

        columns: [
          {
            title: '活动id',
            key: 'actId'
          },
          {
            title: '手机号',
            key: 'phone'
          },
          {
            title: '优惠券批次',
            key: 'batno'
          },
          {
            title: '优惠券面额',
            key: 'amount'
          },
          {
            title: '优惠券编号',
            key: 'couponNo'
          },
          {
            title: '优惠券有效开始时间',
            key: 'startTime'
          },
          {
            title: '优惠券有效结束时间',
            key: 'endTime'
          },
          {
            title: '发送状态',
            slot: 'status'
          },
          {
            title: '发送时间',
            key: 'assignTime'
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        rebateCouponStatusList: [
          {
            value: '发送成功',
            label: 1
          },
          {
            value: '发送失败',
            label: 2
          }
        ],
        rebateCouponStatusMap: {
          1: '发送成功',
          2: '发送失败'
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.rebateCouponList = response.data.records
          this.total = response.data.total
          this.listLoading = false
        })
      },
      getTitleList() {
        if (this.titleList = []) {
          titleList().then(response => {
            this.titleList = response.data
          })
        }
      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getList()
      },

      showResult(index) {
        this.resultVisible = true
        this.result = JSON.parse(this.rebateCouponList[index].result)
      },
      handleClose() {
        this.result = null
        this.resultVisible = false
      },

      //获取报表信息
      getAll() {
        fetchExcel(this.listQuery).then(response => {
          this.rebateCouponAllList = response.data
        })
      },
      exportExcel() {
        this.getAll()
        if (this.rebateCouponAllList.length) {
          this.exportLoading = true
          const params = {
            title: ['活动id', '返佣id', '手机号', '优惠券批次', '优惠券面额', '优惠券编号', '优惠券有效开始时间',
              '优惠券有效结束时间', '发送状态', '发送时间'],
            key: ['actId', 'rebateId', 'phone', 'batno', 'amount', 'couponNo', 'startTime',
              'endTime', 'status', 'assignTime'],
            data: this.transExcelData(this.rebateCouponAllList),
            autoWidth: true,
            filename: '返佣奖励列表'
          }
          excel.export_array_to_excel(params)
          this.exportLoading = false
        }
      },

      //导出Excel将数字状态转化文字
      transExcelData(rebateCouponAllList) {
        let list = rebateCouponAllList
        list.forEach(item => {
          item.status = this.rebateCouponStatusMap[item.status]
        })
        return list
      }
    }
  }
</script>

<style>

</style>
