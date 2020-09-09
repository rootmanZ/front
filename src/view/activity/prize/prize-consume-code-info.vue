<template>
  <div>
    <div class="search-con">
      <Input v-model="listQuery.code"
             clearable
             placeholder="消费码"
             :maxlength="10"
             style="width: 150px"/>
      <Select v-model="listQuery.actId"
              clearable
              placeholder="活动名称"
              style="width: 200px">
        <Option v-for="item in actList" :value="item.id" :key="item.id">
          {{ item.title }}&nbsp(活动id:{{item.id}})
        </Option>
      </Select>
      <Select v-model="listQuery.prizeId"
              clearable
              placeholder="奖品名称"
              style="width: 200px">
        <Option v-for="item in prizeList" :value="item.id" :key="item.id">{{ item.name }}&nbsp(奖品id:{{item.id}})</Option>
      </Select>
      <!--<Input v-model="listQuery.receiveUser"-->
             <!--clearable-->
             <!--placeholder="领取人"-->
             <!--:maxlength="10" style="width: 150px"/>-->
      <Input v-model="listQuery.userPhone"
             clearable
             placeholder="领取人电话"
             :maxlength="11"
             style="width: 150px"/>
      <Select v-model="listQuery.status"
              clearable
              placeholder="状态"
              style="width: 120px">
        <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>
      <DatePicker :value="listQuery.receiveTimeRange"
                  type="datetimerange"
                  formart="yyyy-MM-dd HH:mm:ss"
                  @on-change="listQuery.receiveTimeRange=$event"
                  placement="bottom-end"
                  placeholder="接收时间范围"
                  style="width: 300px"></DatePicker>
      <DatePicker :value="listQuery.usedTimeRange"
                  type="datetimerange"
                  formart="yyyy-MM-dd HH:mm:ss"
                  @on-change="listQuery.usedTimeRange=$event"
                  placement="bottom-end"
                  placeholder="使用时间范围"
                  style="width: 300px"></DatePicker>
      <Button v-if="$viewAccess('act:consumeCode:list')"
              class="search-btn"
              type="primary"
              @click="getList"
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
import { fetchList } from '@/api/activity/consumeCode'

export default {
  name: 'prize-consume-code-info',
  data () {
    return {
      listQuery: {
        current: 1,
        size: 10,
        actId: null,
        prizeId: null,
        code: null,
        status: null,
        receiveUser: null,
        userPhone: null,
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
          key: 'actId',
          align: 'center'
        },
        {
          title: '活动名称',
          key: 'actTitle',
          width: 150,
          align: 'center'
        },
        {
          title: '奖品id',
          key: 'prizeId',
          align: 'center'
        },
        {
          title: '奖品名称',
          key: 'prizeName',
          width: 150,
          align: 'center'
        },
        {
          title: '消费码',
          key: 'code',
          width: 150,
          align: 'center'
        },
        {
          title: '状态',
          slot: 'status',
          align: 'center'
        },
        {
          title: '领取时间',
          key: 'receiveTime',
          align: 'center'
        },
        // {
        //   title: '领取人',
        //   key: 'receiveUser',
        //   align: 'center'
        // },
        {
          title: '领取人电话',
          key: 'userPhone',
          width: 150,
          align: 'center'
        },
        {
          title: '使用时间',
          key: 'usedTime',
          align: 'center'
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
  created () {
    this.getList()
  },
  methods: {
    getList () {
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
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList()
    },
    getActMap () {
      let map = new Map()
      let list = this.actList
      if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          let id = list[i].id
          let title = list[i].title
          map.set(id, title)
        }
        this.actMap = map
      }
    },
    getPrizeMap () {
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
