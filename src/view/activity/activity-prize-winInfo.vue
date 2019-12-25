<template>
  <div>
    <div class="search-con" @click="getTitleList">
      <Input v-model="listQuery.userPhone" clearable placeholder="用户" style="width: 150px"/>
      <Select v-model="listQuery.title" clearable placeholder="活动标题" style="width: 200px">
        <Option v-for="item in titleList" :value="item.title" :key="item.title">{{ item.title }}</Option>
      </Select>
      <Select v-model="listQuery.assignStatus" clearable placeholder="状态" style="width: 120px">
        <Option v-for="item in assignStatusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>
      <Select v-model="listQuery.level" clearable placeholder="奖品等级" style="width: 120px">
        <Option v-for="item in levelList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>
      <Select v-model="listQuery.prizeType" clearable placeholder="奖品类型" style="width: 120px">
        <Option v-for="item in prizeTypeList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>
    </div>
    <div class="search-con">
      <DatePicker :value="listQuery.winTimeRange"
                  type="datetimerange"
                  formart="yyyy-MM-dd"
                  @on-change="listQuery.winTimeRange=$event"
                  placement="bottom-end"
                  placeholder="中奖时间范围"
                  style="width: 300px"></DatePicker>
      <DatePicker :value="listQuery.assignTimeRange"
                  type="datetimerange"
                  formart="yyyy-MM-dd HH:mm:ss"
                  @on-change="listQuery.assignTimeRange=$event"
                  placement="bottom-end"
                  placeholder="兑奖时间范围"
                  style="width: 300px"></DatePicker>
      <Button v-if="$viewAccess('act:prize-win:list')" class="search-btn" type="primary" @click="getList"
              icon="md-search">搜索
      </Button>
      &nbsp&nbsp&nbsp
      <Button v-if="$viewAccess('act:prize-win:list')" type="primary" icon="md-download" :loading="exportLoading"
              @click="exportExcel">
        导出excel
      </Button>
    </div>
    <div>
      <Table ref="prizeWintable" :data="actPrizeWinList" :columns="columns" :loading="listLoading" :border="true">
        <template slot="level" slot-scope="scope">
          {{levelMap[scope.row.level]}}
        </template>
        <template slot="prizeType" slot-scope="scope">
          {{prizeTypeMap[scope.row.prizeType]}}
        </template>
        <template slot="assignStatus" slot-scope="scope">
          {{assignStatusMap[scope.row.assignStatus]}}
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button v-if="row.assignStatus === 4" type="primary" size="small" style="margin-right: 5px"
                  @click="showReason(index)">查看失败原因
          </Button>
        </template>
      </Table>
      <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
            show-total show-sizer show-elevator
            @on-change="getList" @on-page-size-change="handlePageSize"/>
    </div>
    <modal title="失败原因" v-model="reasonVisible" v-show="reasonVisible" :mask-closable="false" :closable="false"
           :width="500">
      <div style=" word-wrap: break-word;word-break: break-all;">{{failureResult}}</div>
      <div slot="footer">
        <Button type="primary" @click="handleClose" align="right">关闭</Button>
      </div>
    </modal>
  </div>
</template>

<script>
  import excel from '@/libs/excel'
  import {fetchList, fetchAll} from '@/api/activity/prizeWin'
  import {titleList} from '@/api/activity/activity'

  export default {
    name: 'activity-prize-winInfo',
    data() {
      return {
        reasonVisible: false,
        failureResult: null,
        total: 10,
        listLoading: false,
        exportLoading: false,
        actPrizeWinList: [],
        actPrizeWinAllList: [],
        titleList: [],

        prizeId: this.$route.query.id,

        listQuery: {
          current: 1,
          size: 10,
          prizeId: null,
          title: null,
          winTimeRange: [],
          assignTimeRange: [],
          userPhone: null,
          assignStatus: null,
          name: null,
          level: null,
        },
        tempActPrizeWin: {
          id: null,
          userId: null,
          actId: null,
          prizeId: null,
          winExt: null,
          prizeWinExtExpress: null,
          userPhone: null,
          name: null,
          level: null,
          prizeType: null,
          createTime: null,
          assignStatus: null,
          assignTime: null,
          contactName: null,
          contactPhone: null,
          contactAddress: null,
        },
        columns: [
          {
            title: '活动标题',
            key: 'title'
          },
          {
            title: '中奖用户',
            key: 'userPhone'
          },
          {
            title: '奖品等级',
            slot: 'level'
          },
          {
            title: '奖品名称',
            key: 'name'
          },
          {
            title: '奖品类型',
            slot: 'prizeType'
          },
          {
            title: '中奖时间',
            key: 'createTime'
          },
          {
            title: '发放状态',
            slot: 'assignStatus'
          },
          {
            title: '兑奖时间',
            key: 'assignTime'
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        assignStatusList: [
          {
            value: '未发放',
            label: 0
          },
          {
            value: '待发放',
            label: 1
          },
          {
            value: '发放中',
            label: 2
          },
          {
            value: '发放成功',
            label: 3
          },
          {
            value: '发放失败',
            label: 4
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
        levelMap: {
          1: '一等奖',
          2: '二等奖',
          3: '三等奖'
        },
        prizeTypeMap: {
          0: '未中奖',
          1: '虚拟物品',
          2: '邮寄实物',
          3: '线下处理物品'
        },
        assignStatusMap: {
          0: '未兑奖',
          1: '待发放',
          2: '发放中',
          3: '发放成功',
          4: '发放失败'
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        this.listQuery.prizeId = this.prizeId
        fetchList(this.listQuery).then(response => {
          this.actPrizeWinList = response.data.records
          this.total = response.data.total
          this.listLoading = false
          this.prizeId = null
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
        fetchAll().then(response => {
          this.actPrizeWinAllList = response.data
        })
      },
      exportExcel() {
        this.getAll()
        if (this.actPrizeWinAllList.length) {
          this.exportLoading = true
          const params = {
            title: ['活动标题', '中奖纪录id', '活动id', '奖品id', '中奖用户', '奖品等级', '奖品名称', '奖品类型', '中奖时间', '发放状态', '兑奖时间'],
            key: ['title', 'id', 'actId', 'prizeId', 'userPhone', 'level', 'name', 'prizeType', 'createTime', 'assignStatus', 'assignTime'],
            data: this.actPrizeWinAllList,
            autoWidth: true,
            filename: '中奖列表'
          }
          excel.export_array_to_excel(params)
          this.exportLoading = false
        }
      },
      showReason(index) {
        this.reasonVisible = true
        this.failureResult = JSON.parse(this.actPrizeWinList[index].winExt).prizeAssignResult
      },
      handleClose() {
        this.failureResult = null
        this.reasonVisible = false
      }
    }
  }
</script>

<style>

</style>
