<template>
  <div>
    <div class="search-con">
      <Input v-model="listQuery.name" clearable placeholder="菜单名称" class="search-item-first"/>
      <Button class="search-btn" type="primary" icon="md-search" @click="getList">搜索</Button>
      <Button v-show="$viewAccess('wx:menu:publish')" class="search-btn" type="primary" icon="md-add"
              @click="toMenuInfo(null,appId, appName, null, null, 'create')"> 新增
      </Button>
    </div>
    <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading" :border="true">
      <template slot="type" slot-scope="scope">
        {{scope.row.type === 0? '默认菜单' : '个性化菜单'}}
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <Button v-show="$viewAccess('wx:menu:publish')" type="primary" size="small" style="margin-right: 5px"
                @click="toMenuInfo(row.id,row.appId,appName,row.type,row.conditionalMenuId,'show')">编辑
        </Button>
        <Button v-show="$viewAccess('wx:menu:delete')" type="error" size="small" @click="handleDelete(row.id)">删除
        </Button>
      </template>
    </Table>
    <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
          show-total show-sizer show-elevator
          @on-change="getList" @on-page-size-change="handlePageSize"/>
  </div>
</template>

<script>
  import {fetchList, fectchInfo, remove} from '@/api/wx/menu-manage'

  export default {
    name: 'wx-menu-manage',
    data() {
      return {
        columns: [
          {
            title: '个性化菜单id',
            key: 'conditionalMenuId'
          },
          {
            title: '菜单名称',
            key: 'name'
          },
          {
            title: '菜单类型',
            slot: 'type'
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
          name: null,
          appId: this.$route.query.appId
        },
        list: [],
        listLoading: true,
        total: 10,
        dialogFormVisible: false,
        dialogStatus: '',
        temp: {
          id: null,
          appId: null,
          conditionalMenuId: null,
          createTime: null
        },
        appId: this.$route.query.appId,
        appName: this.$route.query.appName,
      }
    },
    watch: {
      //监听路由变换重新获取列表
      "$route": "getParams"
    },
    created() {
      this.getList()
    },
    methods: {
      toMenuInfo(id, appId, appName, type, conditionalMenuId, methodType) {
        const route = {
          name: 'wx-menu-info',
          query: {
            id,
            appId,
            appName,
            type,
            conditionalMenuId,
            methodType
          }
        }
        this.$router.push(route)
      },
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.list = response.data.records
          this.total = response.data.total
          this.listLoading = false
        })
      },
      getParams() {
        let name = this.$route.name
        if (name === 'wx-menu-manage') {
          this.getList()
        }
      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getList()
      },
      handleCreate(appId, appName) {
        const methodType = "create"
        this.methodType = methodType
        toMenuInfo(appId, appName, null, null, methodType)
      },
      handleDelete(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该记录, 是否继续?',
          onOk: () => {
            this.temp.appId = this.appId
            this.temp.id = id
            remove(this.temp).then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '删除成功'})
            })
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
