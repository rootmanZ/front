<template>
  <div>
    <Tabs type="card" v-model="tabValue" @on-click="changeTabPane(tabValue)">
      <TabPane label="抽奖类活动" name="0">
        <div class="search-con" :loading="listLoading">
          <Input v-model="listQuery.title" clearable placeholder="主题名称" class="search-item-first"/>
          <Select v-model="listQuery.status" :transfer="isTransfer" clearable placeholder="状态" style="width: 120px">
            <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
          </Select>
          <DatePicker :value="listQuery.rangeTime"
                      :transfer="isTransfer"
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
          <template slot="views" slot-scope="scope">
            {{scope.row.actConfigExpress.actStatConfig.views}}
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
      <TabPane label="祝福类活动" name="2">
        <div class="search-con" :loading="listLoading">
          <Input v-model="listQuery.title" clearable placeholder="主题名称" class="search-item-first"/>
          <Select v-model="listQuery.status" :transfer="isTransfer" clearable placeholder="状态" style="width: 120px">
            <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
          </Select>
          <DatePicker :value="listQuery.rangeTime"
                      :transfer="isTransfer"
                      type="datetimerange"
                      formart="yyyy-MM-dd"
                      @on-change="listQuery.rangeTime=$event"
                      placement="bottom-end"
                      placeholder="活动起止时间"
                      style="width: 300px"></DatePicker>
          <Button class="search-btn" type="primary" @click="getList(2)" icon="md-search">搜索</Button>
          <Button v-if="$viewAccess('act:activity:add')" class="search-btn" type="primary" @click="handleCreateBlessing"
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
          <template slot="views" slot-scope="scope">
            {{scope.row.actConfigExpress.actStatConfig.views}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button v-if="$viewAccess('act:activity:edit')&&row.status !== 2" type="primary" size="small"
                    style="margin-right: 5px"
                    @click="handleUpdateBlessing(row.id)">编辑
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')" type="primary" size="small" style="margin-right: 5px"
                    @click="handleDetailBlessing(row.id)">查看
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')&&row.status === 2" type="warning" size="small"
                    style="margin-right: 5px"
                    @click="handleUpdateBlessing(row.id)">重新编辑上架
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')&&row.status !== 2" type="error" size="small"
                    @click="handleStopActivityBlessing(row.id)">下架
            </Button>
          </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList(2)" @on-page-size-change="handlePageSizeBlessing"/>
        <!--引入活动配置模块-->
        <component v-bind:is="activityConfigBlessing" ref="activityConfigBlessing" @getList="getList(2)"></component>
        <!--引入活动详情-->
        <component v-bind:is="activityDetailBlessing" ref="activityDetailBlessing"></component>
      </TabPane>
      <TabPane label="返佣类活动" name="3">
        <div class="search-con" :loading="listLoading">
          <Input v-model="listQuery.title" clearable placeholder="主题名称" class="search-item-first"/>
          <Select v-model="listQuery.status" :transfer="isTransfer" clearable placeholder="状态" style="width: 120px">
            <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
          </Select>
          <DatePicker :value="listQuery.rangeTime"
                      :transfer="isTransfer"
                      type="datetimerange"
                      formart="yyyy-MM-dd"
                      @on-change="listQuery.rangeTime=$event"
                      placement="bottom-end"
                      placeholder="活动起止时间"
                      style="width: 300px"></DatePicker>
          <Button class="search-btn" type="primary" @click="getList(3)" icon="md-search">搜索</Button>
          <Button v-if="$viewAccess('act:activity:add')" class="search-btn" type="primary" @click="handleCreateRebate"
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
          <template slot="views" slot-scope="scope">
            {{scope.row.actConfigExpress.actStatConfig.views}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button v-if="$viewAccess('act:activity:edit')&&row.status !== 2" type="primary" size="small"
                    style="margin-right: 5px"
                    @click="handleUpdateRebate(row.id)">编辑
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')" type="primary" size="small" style="margin-right: 5px"
                    @click="handleDetailRebate(row.id)">查看
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')&&row.status === 2" type="warning" size="small"
                    style="margin-right: 5px"
                    @click="handleUpdateRebate(row.id)">重新编辑上架
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')&&row.status !== 2" type="error" size="small"
                    @click="handleStopActivityRebate(row.id)">下架
            </Button>
          </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList(3)" @on-page-size-change="handlePageSizeRebate"/>
        <!--引入活动配置模块-->
        <component v-bind:is="activityConfigRebate" ref="activityConfigRebate" @getList="getList(3)"></component>
        <!--引入活动详情-->
        <component v-bind:is="activityDetailRebate" ref="activityDetailRebate"></component>
      </TabPane>
      <TabPane label="博饼类活动" name="4">
        <div class="search-con" :loading="listLoading">
          <Input v-model="listQuery.title" clearable placeholder="主题名称" class="search-item-first"/>
          <Select v-model="listQuery.status" :transfer="isTransfer" clearable placeholder="状态" style="width: 120px">
            <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.value }}</Option>
          </Select>
          <DatePicker :value="listQuery.rangeTime"
                      :transfer="isTransfer"
                      type="datetimerange"
                      formart="yyyy-MM-dd"
                      @on-change="listQuery.rangeTime=$event"
                      placement="bottom-end"
                      placeholder="活动起止时间"
                      style="width: 300px"></DatePicker>
          <Button class="search-btn" type="primary" @click="getList(4)" icon="md-search">搜索</Button>
          <Button v-if="$viewAccess('act:activity:add')" class="search-btn" type="primary" @click="handleCreateGambling"
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
          <template slot="views" slot-scope="scope">
            {{scope.row.actConfigExpress.actStatConfig.views}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button v-if="$viewAccess('act:activity:edit')&&row.status !== 2" type="primary" size="small"
                    style="margin-right: 5px"
                    @click="handleUpdateGambling(row.id)">编辑
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')" type="primary" size="small" style="margin-right: 5px"
                    @click="handleDetailGambling(row.id)">查看
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')&&row.status === 2" type="warning" size="small"
                    style="margin-right: 5px"
                    @click="handleUpdateGambling(row.id)">重新编辑上架
            </Button>
            <Button v-if="$viewAccess('wx:appInfo:edit')&&row.status !== 2" type="error" size="small"
                    @click="handleStopActivityGambling(row.id)">下架
            </Button>
          </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList(4)" @on-page-size-change="handlePageSizeGambling"/>
        <!--引入活动配置模块-->
        <component v-bind:is="activityConfigGambling"
                   ref="activityConfigGambling"
                   @getList="getList(4)">
        </component>
        <!--引入活动详情-->
        <component v-bind:is="activityDetailGambling"
                   ref="activityDetailGambling">
        </component>
      </TabPane>
      <TabPane label="广告类活动" name="1">敬请期待</TabPane>
    </Tabs>

  </div>
</template>

<script>
import expandRow from './activity-info-expand-row.vue'
import { create, fetchInfo, fetchList, remove, update } from '@/api/activity/activity'
import activityConfig from './activity-config.vue'
import activityDetail from './activity-detail.vue'
import activityConfigBlessing from './activity-config-blessing.vue'
import activityDetailBlessing from './activity-detail-blessing.vue'
import activityConfigRebate from './activity-config-rebate.vue'
import activityDetailRebate from './activity-detail-rebate.vue'
import activityConfigGambling from './activity-config-gambling.vue'
import activityDetailGambling from './activity-detail-gambling.vue'

export default {
  name: 'activity-info',
  components: {
    expandRow,
    activityConfig,
    activityDetail,
    activityConfigBlessing,
    activityDetailBlessing,
    activityConfigRebate,
    activityDetailRebate,
    activityConfigGambling,
    activityDetailGambling
  },
  data () {
    return {
      activityConfig: 'activityConfig',
      activityDetail: 'activityDetail',
      activityConfigBlessing: 'activityConfigBlessing',
      activityDetailBlessing: 'activityDetailBlessing',
      activityConfigRebate: 'activityConfigRebate',
      activityDetailRebate: 'activityDetailRebate',
      activityConfigGambling: 'activityConfigGambling',
      activityDetailGambling: 'activityDetailGambling',
      // 初始显示TabPane
      tabValue: '4',
      isTransfer: true,
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
          title: '活动id',
          key: 'id',
          align: 'center'
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
          title: '浏览量',
          slot: 'views',
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
        rangeTime: []
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
            participantType: ['0'],
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
        actBlessingThemes: []
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
        },
        {
          value: '返佣类活动',
          label: '3'
        }
      ],
      statusType: {
        0: '未开始',
        1: '进行中',
        2: '已下架'
      },
      actTypeType: {
        0: '抽奖类活动',
        1: '礼包类活动',
        2: '祝福类活动',
        3: '返佣类活动',
        4: '博饼类活动'
      }
    }
  },
  created () {
    // 初始加载的活动类型
    this.getList(4)
  },
  methods: {
    getList (actType) {
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
    changeTabPane (actType) {
      this.resetListQuery()
      this.getList(actType)
    },
    restList () {
      this.list = []
    },
    // 抽奖类活动开始
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList(0)
    },
    handleCreate () {
      this.$refs.activityConfig.dialogStatus = 'create'
      this.$refs.activityConfig.dialogFormVisible = true
      this.resetData()
      this.$refs.activityConfig.resetTempActivity()
      this.$refs.activityConfig.resetStep()
      this.$refs.activityConfig.$refs['dataFormActivity'].resetFields()
      // 抽奖活动
      this.$refs.activityConfig.tempActivity.actType = 0
    },
    handleUpdate (id) {
      this.$refs.activityConfig.resetStep()
      fetchInfo(id).then(res => {
        this.tempActivity = Object.assign({}, res.data) // copy obj
        // 为子组件赋值
        this.tempActivity.actConfigExpress.actParticipantConfig.participantType =
            this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
        if (typeof (this.tempActivity.actConfigExpress.actShareConfig.shareIcon) === 'undefined') {
          this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
        }
        this.$refs.activityConfig.getActivityValue(this.tempActivity)
        this.$refs.activityConfig.dialogStatus = 'update'
        this.$refs.activityConfig.dialogFormVisible = true
      })
    },
    // 参与条件类型转换
    transformParticipantType (participantType) {
      let list = []
      for (let i = 0; i < participantType.length; i++) {
        participantType[i] = participantType[i] + ''
        list.push(participantType[i])
      }
      return list.reverse()
    },
    handleDetail (id) {
      fetchInfo(id).then(res => {
        this.tempActivity = Object.assign({}, res.data) // copy obj
        this.tempActivity.actConfigExpress.actParticipantConfig.participantType =
            this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
        this.$refs.activityDetail.getActivityValue(this.tempActivity)
        this.$refs.activityDetail.dialogStatusDetail = res.data.title
        this.$refs.activityDetail.dialogFormVisibleDetail = true
      })
    },
    handleStopActivity (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将停止活动的使用, 是否继续?',
        onOk: () => {
          remove(id).then(() => {
            this.getList(0)
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '下架成功' })
          })
        }
      })
    },
    // 抽奖类活动结束

    // 祝福类活动开始
    handlePageSizeBlessing (value) {
      this.listQuery.size = value
      this.getList(2)
    },
    handleCreateBlessing () {
      this.$refs.activityConfigBlessing.dialogStatus = 'create'
      this.$refs.activityConfigBlessing.dialogFormVisible = true
      this.resetData()
      this.$refs.activityConfigBlessing.resetTempActivity()
      this.$refs.activityConfigBlessing.resetStep()
      this.$refs.activityConfigBlessing.$refs['dataFormActivity'].resetFields()
      // 抽奖活动
      this.$refs.activityConfigBlessing.tempActivity.actType = 2
    },
    handleUpdateBlessing (id) {
      this.$refs.activityConfigBlessing.resetStep()
      fetchInfo(id).then(res => {
        this.tempActivity = Object.assign({}, res.data) // copy obj
        // 为子组件赋值
        this.tempActivity.actConfigExpress.actParticipantConfig.participantType =
            this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
        if (typeof (this.tempActivity.actConfigExpress.actShareConfig.shareIcon) === 'undefined') {
          this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
        }
        this.$refs.activityConfigBlessing.getActivityValue(this.tempActivity)
        this.$refs.activityConfigBlessing.dialogStatus = 'update'
        this.$refs.activityConfigBlessing.dialogFormVisible = true
      })
    },
    handleDetailBlessing (id) {
      fetchInfo(id).then(res => {
        this.tempActivity = Object.assign({}, res.data) // copy obj
        this.tempActivity.actConfigExpress.actParticipantConfig.participantType =
            this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
        this.$refs.activityDetailBlessing.getActivityValue(this.tempActivity)
        this.$refs.activityDetailBlessing.dialogStatusDetail = res.data.title
        this.$refs.activityDetailBlessing.dialogFormVisibleDetail = true
      })
    },
    handleStopActivityBlessing (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将停止活动的使用, 是否继续?',
        onOk: () => {
          remove(id).then(() => {
            this.getList(2)
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '下架成功' })
          })
        }
      })
    },
    // 祝福类活动结束

    // 返佣类活动开始
    handlePageSizeRebate (value) {
      this.listQuery.size = value
      this.getList(3)
    },
    handleCreateRebate () {
      this.$refs.activityConfigRebate.dialogStatus = 'create'
      this.$refs.activityConfigRebate.dialogFormVisible = true
      this.resetData()
      this.$refs.activityConfigRebate.resetTempActivity()
      this.$refs.activityConfigRebate.resetStep()
      this.$refs.activityConfigRebate.$refs['dataFormActivity'].resetFields()
      // 返佣活动
      this.$refs.activityConfigRebate.tempActivity.actType = 3
    },
    handleUpdateRebate (id) {
      this.$refs.activityConfigRebate.resetStep()
      fetchInfo(id).then(res => {
        this.tempActivity = Object.assign({}, res.data) // copy obj
        // 为子组件赋值
        this.tempActivity.actConfigExpress.actParticipantConfig.participantType =
            this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
        if (typeof (this.tempActivity.actConfigExpress.actShareConfig.shareIcon) === 'undefined') {
          this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
        }
        this.$refs.activityConfigRebate.getActivityValue(this.tempActivity)
        this.$refs.activityConfigRebate.dialogStatus = 'update'
        this.$refs.activityConfigRebate.dialogFormVisible = true
      })
    },
    handleDetailRebate (id) {
      fetchInfo(id).then(res => {
        this.tempActivity = Object.assign({}, res.data) // copy obj
        this.tempActivity.actConfigExpress.actParticipantConfig.participantType =
            this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
        this.$refs.activityDetailRebate.getActivityValue(this.tempActivity)
        this.$refs.activityDetailRebate.dialogStatusDetail = res.data.title
        this.$refs.activityDetailRebate.dialogFormVisibleDetail = true
      })
    },
    handleStopActivityRebate (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将停止活动的使用, 是否继续?',
        onOk: () => {
          remove(id).then(() => {
            this.getList(3)
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '下架成功' })
          })
        }
      })
    },
    // 返佣类活动结束

    // 博饼类活动开始
    handlePageSizeGambling (value) {
      this.listQuery.size = value
      this.getList(4)
    },
    handleCreateGambling () {
      this.$refs.activityConfigGambling.dialogStatus = 'create'
      this.$refs.activityConfigGambling.dialogFormVisible = true
      this.resetData()
      this.$refs.activityConfigGambling.resetTempActivity()
      this.$refs.activityConfigGambling.resetStep()
      this.$refs.activityConfigGambling.$refs['dataFormActivity'].resetFields()
      // 博饼活动
      this.$refs.activityConfigGambling.tempActivity.actType = 4
    },
    handleUpdateGambling (id) {
      this.$refs.activityConfigGambling.resetStep()
      fetchInfo(id).then(res => {
        this.tempActivity = Object.assign({}, res.data) // copy obj
        // 为子组件赋值
        this.tempActivity.actConfigExpress.actParticipantConfig.participantType =
          this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
        if (typeof (this.tempActivity.actConfigExpress.actShareConfig.shareIcon) === 'undefined') {
          this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
        }
        this.$refs.activityConfigGambling.getActivityValue(this.tempActivity)
        this.$refs.activityConfigGambling.dialogStatus = 'update'
        this.$refs.activityConfigGambling.dialogFormVisible = true
      })
    },
    handleDetailGambling (id) {
      fetchInfo(id).then(res => {
        this.tempActivity = Object.assign({}, res.data) // copy obj
        this.tempActivity.actConfigExpress.actParticipantConfig.participantType =
          this.transformParticipantType(this.tempActivity.actConfigExpress.actParticipantConfig.participantType)
        this.$refs.activityDetailGambling.getActivityValue(this.tempActivity)
        this.$refs.activityDetailGambling.dialogStatusDetail = res.data.title
        this.$refs.activityDetailGambling.dialogFormVisibleDetail = true
      })
    },
    handleStopActivityGambling (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将停止活动的使用, 是否继续?',
        onOk: () => {
          remove(id).then(() => {
            this.getList(4)
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '下架成功' })
          })
        }
      })
    },
    // 博饼类活动结束

    resetData () {
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
            participantType: ['0'],
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
        actBlessingThemes: []
      }
    },
    resetListQuery () {
      this.listQuery = {
        current: 1,
        size: 10,
        title: null,
        actType: null,
        status: null,
        rangeTime: []
      }
    }
  }
}
</script>
