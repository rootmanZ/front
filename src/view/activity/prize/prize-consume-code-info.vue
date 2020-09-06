<template>
  <div>
    <div class="search-con">
      <Input v-model="listQuery.code" clearable placeholder="消费码" style="width: 150px"/>
      <Select v-model="listQuery.actId" clearable placeholder="活动名称" style="width: 200px">
        <Option v-for="item in actList" :value="item.id" :key="item.id">{{ item.title }}&nbsp(活动id:{{item.id}})</Option>
      </Select>
      <Select v-model="listQuery.prizeId" clearable placeholder="奖品名称" style="width: 200px">
        <Option v-for="item in prizeList" :value="item.id" :key="item.id">{{ item.name }}&nbsp(奖品id:{{item.id}})</Option>
      </Select>
      <Input v-model="listQuery.receiveUser" clearable placeholder="领取人" style="width: 150px"/>
      <Select v-model="listQuery.status" clearable placeholder="状态" style="width: 120px">
        <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>
      <DatePicker :value="listQuery.usedTimeRange"
                  type="datetimerange"
                  formart="yyyy-MM-dd HH:mm:ss"
                  @on-change="listQuery.usedTimeRange=$event"
                  placement="bottom-end"
                  placeholder="使用时间范围"
                  style="width: 300px"></DatePicker>
      <Button v-if="$viewAccess('act:consumeCode:list')" class="search-btn" type="primary" @click="getList"
              icon="md-search">搜索
      </Button>
    </div>

    <!--备用-->
    <!--<div class="search-con">-->
    <!--<DatePicker :value="listQuery.receiveTimeRange"-->
    <!--type="datetimerange"-->
    <!--formart="yyyy-MM-dd"-->
    <!--@on-change="listQuery.receiveTimeRange=$event"-->
    <!--placement="bottom-end"-->
    <!--placeholder="有效期范围"-->
    <!--style="width: 300px"></DatePicker>-->
    <!--</div>-->

    <div>
      <Table ref="consumeCodeTable" :data="consumeCodeList" :columns="columns" :loading="listLoading" :border="true">

        <template slot="status" slot-scope="scope">
          {{statusMap[scope.row.status]}}
        </template>
      </Table>
      <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
            show-total show-sizer show-elevator
            @on-change="getList" @on-page-size-change="handlePageSize"/>
    </div>
  </div>
</template>

<script>
  import {fetchList} from '@/api/activity/consumeCode'

  export default {
    name: 'prize-consume-code-info',
    data() {
      return {
        listQuery: {
          current: 1,
          size: 10,
          actId: null,
          prizeId: null,
          code: null,
          status: null,
          receiveUser: null,
          usedTimeRange: [],
          receiveTimeRange: []
        },
        listLoading: false,
        consumeCodeList: [],
        total: 10,
        actList: [],
        prizeList: [],
        columns: [
          {
            title: '活动id',
            key: 'actId'
          },
          {
            title: '奖品id',
            key: 'prizeId'
          },
          {
            title: '消费码',
            key: 'code'
          },
          {
            title: '状态',
            slot: 'status'
          },
          {
            title: '领取时间',
            key: 'receiveTime'
          },
          {
            title: '领取人',
            key: 'receiveUser'
          },
          {
            title: '使用时间',
            key: 'usedTime'
          }
          // 备用
          // {
          //   title: '有效期开始时间',
          //   key: 'beginTime'
          // },
          // {
          //   title: '有效期结束时间',
          //   key: 'endTime'
          // }
        ],
        statusList: [
          {
            value: '未领取',
            label: 0
          },
          {
            value: '未使用',
            label: 1
          },
          {
            value: '已使用',
            label: 2
          },
          {
            value: '已过期',
            label: 3
          },
          {
            value: '发放失败',
            label: 4
          }
        ],
        statusMap: {
          0: '未领取',
          1: '未使用',
          2: '已使用',
          3: '已过期'
        },
        actMap: {},
        prizeMap: {}
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.consumeCodeList = response.data.data.records
          this.total = response.data.data.total
          this.actList = response.data.actList
          this.prizeList = response.data.prizeList
          this.getActMap()
          this.getPrizeMap()
          this.listLoading = false
        })
      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getList()
      },
      getActMap() {
        debugger
        let map = new Map()
        let list = this.actList
        if (list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            let id = list[i].id
            let title = list[i].title
            map.set(id, title)
          }
          debugger
          this.actMap = map
        }
      },
      getPrizeMap() {
        let map = new Map()
        let list = this.prizeList
        if (list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            let id = list[i].id
            let name = list[i].name
            map.set(id, name)
          }
          this.prizeMap = map
        }
      }
    }
  }
</script>

<style>

</style>
