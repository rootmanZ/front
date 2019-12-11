<template>
  <div>
    <div class="search-con">
      <Input v-model="listQuery.loginName" clearable placeholder="主题名称" class="search-item-first"/>
      <Select v-model="listQuery.status" clearable placeholder="状态" style="width: 120px">
        <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>
      <Select v-model="listQuery.actType" clearable placeholder="活动类型" style="width: 120px">
        <Option v-for="item in actTypeList" :value="item.label" :key="item.value">{{ item.value }}</Option>
      </Select>
      <DatePicker :value="listQuery.rangeTime"
                  type="daterange"
                  formart="daterange"
                  @on-change="listQuery.rangeTime=$event"
                  placement="bottom-end"
                  placeholder="选择查询时间"></DatePicker>
      <Button class="search-btn" type="primary" @click="getList" icon="md-search">搜索</Button>
      <Button class="search-btn" type="primary" @click="handleCreate"
              icon="md-add">新增
      </Button>
    </div>
    <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading" :border="true">
      <template slot="status" slot-scope="scope">
        {{statusType[scope.row.status]}}
      </template>
      <template slot="actType" slot-scope="scope">
        {{actTypeType[scope.row.actType]}}
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <Button v-if="$viewAccess('wx:appInfo:edit')" type="primary" size="small" style="margin-right: 5px"
                @click="handleDetail(row.id)">查看
        </Button>
        <Button v-if="$viewAccess('wx:appInfo:delete')" type="error" size="small" @click="handleStopActivity(row.id)">下架
        </Button>
      </template>
    </Table>
    <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
          show-total show-sizer show-elevator
          @on-change="getList" @on-page-size-change="handlePageSize"/>
    <!--引入活动配置模块-->
    <component v-bind:is="activityConfig" ref="activityConfig"></component>
    <!--引入活动详情-->
    <component v-bind:is="activityDetail" ref="activityDetail"></component>
  </div>
</template>

<script>
  import {create, fetchInfo, fetchList, remove, update} from '@/api/activity/activity'
  import activityConfig from './activity-config.vue'
  import activityDetail from './activity-detail.vue'

  export default {
    name: 'activity-info',
    components: {activityConfig, activityDetail},
    data() {
      return {
        activityConfig: 'activityConfig',
        activityDetail: 'activityDetail',
        columns: [
          {
            title: '活动主题图',
            key: ''
          },
          {
            title: '活动主题',
            key: 'title'
          },
          {
            title: '活动类型',
            slot: 'actType'
          },
          {
            title: '活动状态',
            slot: 'status'
          },
          {
            title: '创建时间',
            key: 'createTime'
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        listQuery: {
          current: 1,
          size: 10,
          title: null,
          actType: null,
          status: null,
          rangeTime: [],
        },
        statusList: [
          {
            value: '未开始',
            label: '0'
          },
          {
            value: '进行中',
            label: '1'
          },
          {
            value: '已下架',
            label: '2'
          }
        ],
        actTypeList: [
          {
            value: '抽奖类活动',
            label: '0'
          },
          {
            value: '礼包类活动',
            label: '1'
          }
        ],
        statusType: {
          0: "未开始",
          1: "进行中",
          2: "已下架"
        },
        actTypeType: {
          0: "抽奖类活动",
          1: "礼包类活动"
        },
        list: [],
        total: 10,
        listLoading: false,
        dialogFormVisible: false,
        dialogStatus: '',

      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.list = response.data.records
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getList()
      },
      handleCreate() {
        this.$refs.activityConfig.dialogStatus = 'create'
        this.$refs.activityConfig.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          this.resetTemp()
        })
      },
      handleDetail(id) {
        debugger
        fetchInfo(id).then(res => {
          this.$refs.activityDetail.tempActivity = Object.assign({}, res.data) // copy obj
          // this.$refs.activityDetail.tempActivity.actConfigExpress = JSON.parse(res.data.actConfigExpress)//解析
          this.$refs.activityDetail.dialogStatus = res.data.title
          debugger
          this.$refs.activityDetail.dialogFormVisible = true
        })
      },
      handleUpdate(id) {
        this.$refs['dataForm'].resetFields()
        fetchInfo(id).then(res => {
          this.temp = Object.assign({}, res.data) // copy obj
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            create(this.temp).then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '新增成功'})
            })
          }
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            update(this.temp).then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '修改成功'})
            })
          }
        })
      },
      handleStopActivity(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将停止活动的使用, 是否继续?',
          onOk: () => {
            remove(id).then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '下架成功'})
            })
          }
        })
      },
      handleRestartActivity(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将重启该活动, 是否继续?',
          onOk: () => {

          }
        })
      },
      toActivityConfig(id, methodType) {
        const route = {
          name: 'activity-config',
          query: {
            id,
            methodType
          }
        }
        this.$router.push(route)
      },
    }
  }
</script>
