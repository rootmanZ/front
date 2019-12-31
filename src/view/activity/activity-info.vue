<template>
  <div>
    <Tabs value="name1">
      <TabPane label="抽奖类活动" name="name1">
        <div class="search-con">
          <Input v-model="listQuery.loginName" clearable placeholder="主题名称" class="search-item-first"/>
          <Select v-model="listQuery.status" clearable placeholder="状态" style="width: 120px">
            <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
          </Select>
          <DatePicker :value="listQuery.rangeTime"
                      type="datetimerange"
                      formart="yyyy-MM-dd"
                      @on-change="listQuery.rangeTime=$event"
                      placement="bottom-end"
                      placeholder="活动起止时间"
                      style="width: 300px"></DatePicker>
          <Button class="search-btn" type="primary" @click="getList(0)" icon="md-search">搜索</Button>
          <Button v-if="$viewAccess('act:activity:add')" class="search-btn" type="primary" @click="handleCreate"
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
            <Button v-if="$viewAccess('act:activity:edit')&&row.status !== 2" type="primary" size="small"
                    style="margin-right: 5px"
                    @click="handleUpdate(row.id)">编辑
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')" type="primary" size="small" style="margin-right: 5px"
                    @click="handleDetail(row.id)">查看
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')&&row.status === 2" type="warning" size="small"
                    style="margin-right: 5px"
                    @click="handleUpdate(row.id)">重新编辑上架
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')&&row.status !== 2" type="error" size="small"
                    @click="handleStopActivity(row.id)">下架
            </Button>
          </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList(0)" @on-page-size-change="handlePageSize"/>
        <!--引入活动配置模块-->
        <component v-bind:is="activityConfig" ref="activityConfig" @getList="getList(0)"></component>
        <!--引入活动详情-->
        <component v-bind:is="activityDetail" ref="activityDetail"></component>
      </TabPane>
      <TabPane label="福利礼包类活动" name="name2">敬请期待</TabPane>
      <TabPane label="广告类活动" name="name3">敬请期待</TabPane>
    </Tabs>

  </div>
</template>

<script>
  import {create, fetchInfo, fetchList, remove, update} from '@/api/activity/activity'
  import activityConfig from './activity-config.vue'
  import activityDetail from './activity-detail.vue'
  import expandRow from './activity-info-expand-row.vue'

  export default {
    name: 'activity-info',
    components: {activityConfig, activityDetail, expandRow},
    data() {
      return {
        activityConfig: 'activityConfig',
        activityDetail: 'activityDetail',
        list: [],
        total: 10,
        listLoading: false,
        columns: [
          {
            type: 'expand',
            width: 50,
            render: (h, params) => {
              return h(expandRow, {
                props: {
                  row: params.row
                }
              })
            }
          },
          {
            title: '活动主题',
            key: 'title',
            width: 300,
            align: 'center'
          },
          {
            title: '活动类型',
            slot: 'actType',
            align: 'center'
          },
          {
            title: '活动状态',
            slot: 'status',
            align: 'center'
          },
          {
            title: '创建时间',
            width: 200,
            key: 'createTime',
            align: 'center'
          },
          {
            title: '操作',
            slot: 'action',
            width: 200,
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
        tempActivity: {
          id: null,
          title: null,
          actType: '',
          actPic: '',
          summary: null,
          context: '',
          rangeTime: [],
          startTime: null,
          endTime: null,
          status: '',
          actConfigExpress: {
            actTypeConfig: {
              templateId: null,
              playType: null
            },
            actParticipantConfig: {
              participantType: ["0"],
              participantValue: null
            },
            actNumberConfig: {
              limit: null,
              dailyLimit: null
            },
            actShareConfig: {
              shareFlag: 0,
              shareTitle: null,
              shareIcon: '',
              shareUrl: null,
              shareDesc: null
            }
          },
          actPrizes: [],
          ActBlessingThemes:[]
        },
        prizeTaleList: [],
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
          },
          {
            value: '祝福类活动',
            label: '2'
          }
        ],
        statusType: {
          0: "未开始",
          1: "进行中",
          2: "已下架"
        },
        actTypeType: {
          0: "抽奖类活动",
          1: "礼包类活动",
          2: "祝福类活动"
        }
      }
    },
    created() {
      this.getList(0)
    },
    methods: {
      getList(actType) {
        this.restList()
        this.listQuery.actType = actType
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          response.data.records.map(record => {
            record._expanded = true
          })
          this.list = response.data.records
          this.total = response.data.total
          this.listLoading = false
        })
      },
      //抽奖类活动开始
      handlePageSize(value,) {
        this.listQuery.size = value
        this.getList(0)
      },
      handleCreate() {
        this.$refs.activityConfig.dialogStatus = 'create'
        this.$refs.activityConfig.dialogFormVisible = true
        this.resetData()
        this.$refs.activityConfig.resetTempActivity()
        this.$refs.activityConfig.resetStep()
        this.$refs.activityConfig.$refs['dataFormActivity'].resetFields()
        //抽奖活动
        this.$refs.activityConfig.tempActivity.actType = 0
      },
      handleUpdate(id) {
        this.$refs.activityConfig.resetStep()
        fetchInfo(id).then(res => {
          this.tempActivity = Object.assign({}, res.data) // copy obj
          //为子组件赋值
          this.tempActivity.actConfigExpress.actParticipantConfig.participantType
            = this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
          if (typeof(this.tempActivity.actConfigExpress.actShareConfig.shareIcon) === "undefined") {
            this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
          }
          this.$refs.activityConfig.getActivityValue(this.tempActivity)
          this.$refs.activityConfig.dialogStatus = 'update'
          this.$refs.activityConfig.dialogFormVisible = true
        })
      },
      //参与条件类型转换
      transformParticipantType(participantType) {
        let list = []
        for (let i = 0; i < participantType.length; i++) {
          participantType[i] = participantType[i] + ''
          list.push(participantType[i])
        }
        return list.reverse()
      },
      handleDetail(id) {
        fetchInfo(id).then(res => {
          this.tempActivity = Object.assign({}, res.data) // copy obj
          this.tempActivity.actConfigExpress.actParticipantConfig.participantType
            = this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
          this.$refs.activityDetail.getActivityValue(this.tempActivity)
          this.$refs.activityDetail.dialogStatusDetail = res.data.title
          this.$refs.activityDetail.dialogFormVisibleDetail = true
        })
      },
      handleStopActivity(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将停止活动的使用, 是否继续?',
          onOk: () => {
            remove(id).then(() => {
              this.getList(0)
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '下架成功'})
            })
          }
        })
      },
      restList() {
        this.list = []
      },
      //抽奖类活动结束

      resetData() {
        this.tempActivity = {
          id: null,
          title: null,
          actType: '',
          actPic: '',
          summary: null,
          context: '',
          rangeTime: [],
          startTime: null,
          endTime: null,
          status: '',
          actConfigExpress: {
            actTypeConfig: {
              templateId: null,
              playType: null
            },
            actParticipantConfig: {
              participantType: ["0"],
              participantValue: null
            },
            actNumberConfig: {
              limit: null,
              dailyLimit: null
            },
            actShareConfig: {
              shareFlag: 0,
              shareTitle: null,
              shareIcon: '',
              shareUrl: null,
              shareDesc: null
            }
          },
          actPrizes: [],
          ActBlessingThemes:[]
        }
      }
    }
  }
</script>
