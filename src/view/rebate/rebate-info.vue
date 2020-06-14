<template>
  <div>
    <div class="search-con">
      <!--<Select v-model="listQuery.title" clearable placeholder="活动标题" style="width: 200px">-->
      <!--<Option v-for="item in titleList" :value="item.title" :key="item.title">{{ item.title }}</Option>-->
      <!--</Select>-->
      <Input v-model="listQuery.phone" clearable placeholder="返佣手机号" style="width: 150px"/>
      <Input v-model="listQuery.orderPhone" clearable placeholder="下单人手机号" style="width: 150px"/>
      <Input v-model="listQuery.plateno" clearable placeholder="车牌号" style="width: 150px"/>
      <Input v-model="listQuery.parkName" clearable placeholder="车场名称" style="width: 150px"/>
      <Select v-model="listQuery.status" clearable placeholder="状态" style="width: 120px">
        <Option v-for="item in rebateStatusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>

      <DatePicker :value="listQuery.orderTimeRage"
                  type="datetimerange"
                  formart="yyyy-MM-dd"
                  @on-change="listQuery.orderTimeRage=$event"
                  placement="bottom-end"
                  placeholder="下单时间范围"
                  style="width: 300px"></DatePicker>

      <Button v-if="$viewAccess('act:rebate:list')" class="search-btn" type="primary" @click="getList"
              icon="md-search">搜索
      </Button>
      &nbsp&nbsp&nbsp
      <Button v-if="$viewAccess('act:rebate:list')" type="primary" icon="md-download" :loading="exportLoading"
              @click="exportExcel">
        导出excel
      </Button>
    </div>
    <div>
      <Table ref="rebatetable" :data="rebateList" :columns="columns" :loading="listLoading" :border="true">
        <template slot="status" slot-scope="scope">
          {{rebateStatusMap[scope.row.status]}}
        </template>
        <template slot="orderAmount" slot-scope="scope">
          {{scope.row.orderAmount*0.01}}
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button type="success" size="small" style="margin-right: 5px" v-if="row.status === 2"
                  @click="toRebateCoupon(row.actId,row.id,row.account)">查看返佣奖励
          </Button>
        </template>
      </Table>
      <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
            show-total show-sizer show-elevator
            @on-change="getList" @on-page-size-change="handlePageSize"/>
    </div>

  </div>
</template>

<script>
  import excel from '@/libs/excel'
  import {fetchList, fetchExcel} from '@/api/rebate/rebate'
  import {titleList} from '@/api/activity/activity'

  export default {
    name: 'rebate-info',
    data() {
      return {

        listQuery: {
          current: 1,
          size: 10,
          phone: '',
          orderPhone: '',
          plateno: '',
          parkName: '',
          status: '',
          orderTimeRage: []
        },
        total: 10,
        rebateList: [],
        actRebateAllList: [],

        listLoading: false,
        exportLoading: false,
        titleList: [],

        columns: [
          {
            title: 'id',
            key: 'id'
          },
          {
            title: '活动id',
            key: 'actId'
          },
          {
            title: '返佣账号',
            key: 'account'
          },
          {
            title: '返佣手机号',
            key: 'phone'
          },
          {
            title: '订单id',
            key: 'orderId'
          },
          {
            title: '订单金额',
            slot: 'orderAmount'
          },
          {
            title: '下单人账号',
            key: 'orderAccount'
          },
          {
            title: '下单人手机号',
            key: 'orderPhone'
          },
          {
            title: '下单时间',
            key: 'orderTime'
          },
          {
            title: '车牌号',
            key: 'plateno'
          },
          {
            title: '停车场编号',
            key: 'parkNo'
          },
          {
            title: '停车场名称',
            key: 'parkName'
          },
          {
            title: '状态',
            slot: 'status'
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        rebateStatusList: [
          {
            value: '待发放',
            label: 0
          },
          {
            value: '不发放',
            label: 1
          },
          {
            value: '已发放',
            label: 2
          },
          {
            value: '订单取消',
            label: 4
          }
        ],
        rebateStatusMap: {
          0: '待发放',
          1: '不发放',
          2: '已发放',
          4: '订单取消'
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {

      //跳转返佣奖励
      toRebateCoupon(actId, rebateId, account) {
        const route = {
          path: '/rebate/rebate-coupon',
          query: {
            actId,
            rebateId,
            account
          }
        }
        this.$router.push(route)
      },
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.rebateList = response.data.records
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


      //获取报表信息
      getAll() {
        fetchExcel(this.listQuery).then(response => {
          this.actRebateAllList = response.data
        })
      },
      exportExcel() {
        this.getAll()
        if (this.actRebateAllList.length) {
          this.exportLoading = true
          const params = {
            title: ['返佣id', '活动id', '返佣账号', '返佣手机号', '订单id', '订单金额', '下单人账号', '下单人手机号',
              '下单时间', '车牌号', '停车场编号', '停车场名称', '状态'],
            key: ['id', 'actId', 'account', 'phone', 'orderId', 'orderAmount', 'orderAccount', 'orderPhone',
              'orderTime', 'plateno', 'parkNo', 'parkName', 'status'],
            data: this.transExcelData(this.actRebateAllList),
            autoWidth: true,
            filename: '返佣记录列表'
          }
          excel.export_array_to_excel(params)
          this.exportLoading = false
        }
      },


      //导出Excel将数字状态转化文字
      transExcelData(actRebateAllList) {
        let list = actRebateAllList
        list.forEach(item => {
          item.status = this.rebateStatusMap[item.status]
          item.orderAmount *= 0.01
        })
        return list
      }
    }
  }
</script>

<style>

</style>
