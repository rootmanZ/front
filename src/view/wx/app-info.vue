<template>
    <div>
        <div class="search-con">
            <Input v-model="listQuery.loginName" clearable placeholder="登录名称" class="search-item-first"/>
            <Button class="search-btn" type="primary" @click="getList" icon="md-search">搜索</Button>
            <Button v-if="$viewAccess('wx:appInfo:add')" class="search-btn" type="primary" @click="handleCreate" icon="md-add">新增</Button>
        </div>
        <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading"  :border="true">
            <template slot="type" slot-scope="scope">
                {{scope.row.type === 1? '服务号' : '订阅号'}}
            </template>
            <template slot-scope="{ row, index }" slot="action">
                <Button v-if="$viewAccess('wx:appInfo:edit')" type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(row.appId)">修改</Button>
                <Button v-if="$viewAccess('wx:appInfo:delete')" type="error" size="small" @click="handleDelete(row.appId)">删除</Button>
            </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList" @on-page-size-change="handlePageSize"/>
        <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
            <Form ref="dataForm" :rules="rules" :model="temp" :label-width="100" inline>
                <FormItem label="公众号名称" prop="name">
                    <Input v-model="temp.name" :maxlength="30"></Input>
                </FormItem>
                <FormItem label="公众号类型">
                    <RadioGroup v-model="temp.type">
                        <Radio :label="1">服务号</Radio>
                        <Radio :label="0">订阅号</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="AppID" prop="appId">
                    <Input v-model="temp.appId" :maxlength="50" :disabled="dialogStatus==='update'"></Input>
                </FormItem>
                <FormItem label="AppSecret" prop="appSecret">
                    <Input v-model="temp.appSecret" :maxlength="200"></Input>
                </FormItem>
                <Row>
                    <FormItem label="Token" style="width: 100%">
                        <Input v-model="temp.token" :maxlength="32"></Input>
                    </FormItem>
                </Row>
                <Row>
                    <FormItem label="encodingAeskey" style="width: 100%">
                        <Input v-model="temp.encodingAeskey" :maxlength="50"></Input>
                    </FormItem>
                </Row>
                <FormItem label="公众号原始ID" prop="originalId">
                    <Input v-model="temp.originalId" :maxlength="32"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="dialogFormVisible = false">取消</Button>
                <Button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</Button>
            </div>
        </modal>
    </div>

</template>

<script>
import { create, fectchInfo, fetchList, remove, update } from '@/api/wx/app-info'
import expandRow from './app-info-expand-row.vue'

export default {
  name: 'AppInfo',
  components: { expandRow },
  data () {
    return {
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
          title: '公众号名称',
          key: 'name'
        },
        {
          title: '公众号类型',
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
        loginName: null,
        bizId: undefined
      },
      list: [],
      total: 10,
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改用户',
        create: '新增用户'
      },
      temp: {
        name: null,
        type: 1,
        originalId: null,
        appId: null,
        appSecret: null,
        token: null,
        encodingAeskey: null
      },
      rules: {
        name: [{ required: true, message: '公众号名称不能为空', trigger: 'blur' }],
        appId: [{ required: true, message: 'AppID不能为空', trigger: 'blur' }],
        originalId: [{ required: true, message: '公众号原始ID不能为空', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getList()
  },
  methods: {
    getList () {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        response.data.records.map(record => { record._expanded = true })
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    resetTemp () {
      this.temp = {
        name: null,
        type: 1,
        originalId: null,
        appId: null,
        appSecret: null,
        token: null,
        encodingAeskey: null
      }
    },
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList()
    },
    handleCreate () {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.resetTemp()
      })
    },
    handleUpdate (id) {
      this.$refs['dataForm'].resetFields()
      fectchInfo(id).then(res => {
        this.temp = Object.assign({}, res.data) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      })
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          create(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '新增成功' })
          })
        }
      })
    },
    updateData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          update(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '修改成功' })
          })
        }
      })
    },
    handleDelete (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将删除该记录, 是否继续?',
        onOk: () => {
          remove(id).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '删除成功' })
          })
        }
      })
    }
  }
}
</script>
