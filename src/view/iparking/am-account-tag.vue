<template>
  <div>
    <div class="search-con">
      <Input v-model="listQuery.linkPhone" clearable placeholder="用户电话" style="width: 150px"/>
      <Input v-model="listQuery.locationGzhAn" clearable placeholder="公众号位置" style="width: 150px"/>
      <Input v-model="listQuery.locationParkingAn" clearable placeholder="车辆缴费位置" style="width: 150px"/>
      <Select v-model="listQuery.status" clearable style="width:150px" placeholder="标签状态">
        <Option v-for="item in statusMap" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>

      <DatePicker :value="listQuery.tagDtRange"
                  type="daterange"
                  formart="yyyy-MM-dd"
                  @on-change="listQuery.tagDtRange=$event"
                  placement="bottom-end"
                  placeholder="打标签时间范围"
                  style="width: 200px"></DatePicker>
      <DatePicker :value="listQuery.createDtRange"
                  type="daterange"
                  formart="yyyy-MM-dd"
                  @on-change="listQuery.createDtRange=$event"
                  placement="bottom-end"
                  placeholder="创建时间范围"
                  style="width: 200px"></DatePicker>
      <Button v-if="$viewAccess('iparking:tag:list')" class="search-btn" type="primary" @click="getList"
              icon="md-search">搜索
      </Button>
    </div>
    <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading">
      <template slot="stautsValue" slot-scope="{ row, index}">
        <span v-for="item in statusMap" v-if="item.value === row.status">{{item.label}}</span>
      </template>
    </Table>
    <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
          show-total show-sizer show-elevator
          @on-change="getList" @on-page-size-change="handlePageSize"/>
  </div>

</template>

<script>
  import {fetchList} from '@/api/iparking/amAccountTag'

  export default {
    name: 'am-account-tag',
  data () {
    return {
      listLoading: false,
      list: [],
      listQuery: {
        current: 1,
        size: 10,
        locationGzhAn: '',
        locationParkingAn: '',
        status: '',
        tagDtRange: [],
        createDtRange: [],
        linkPhone: ''
      },
      total: 10,
      columns: [
        {
          title: '昵称',
          key: 'nickName',
          align: 'center'
        },
        {
          title: '用户电话',
          key: 'linkPhone',
          align: 'center',
          width: '120Px'

        },
        {
          title: '标签状态',
          key: 'status',
          slot: 'stautsValue',
          align: 'center'
        },
        {
          title: '公众号位置',
          key: 'locationGzhAn',
          align: 'center'
        },
        {
          title: '公众号位置更新日期',
          key: 'updateGzhDt',
          align: 'center'
        },
        {
          title: '车辆缴费位置',
          key: 'locationParkingAn',
          align: 'center'
        },
        {
          title: '车辆缴费位置更新日期',
          key: 'updateParkingDt',
          align: 'center'
        },
        {
          title: '打标签时间',
          key: 'tagDt',
          align: 'center'
        },
        {
          title: '创建日期',
          key: 'createDt',
          align: 'center'
        },
        {
          title: '备注',
          key: 'tagRemark',
          align: 'center'
        }
      ],
      statusMap: [
        {
          value: '0',
          label: '未同步'
        },
        {
          value: '1',
          label: '同步成功'
        },
        {
          value: '2',
          label: '同步失败'
        },
        {
          value: '3',
          label: '取消关注'
        }
      ]
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
    }
  }
}
</script>

<style scoped>

</style>
