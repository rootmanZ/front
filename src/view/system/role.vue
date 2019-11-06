<template>
    <div>
        <div class="search-con">
            <Input v-model="listQuery.roleName" clearable placeholder="角色名称" class="search-item-first"/>
            <Button class="search-btn" type="primary" @click="getList" icon="md-search">搜索</Button>
            <Button class="search-btn" type="primary" @click="handleCreate" icon="md-add">新增</Button>
        </div>
        <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading">
            <template slot-scope="{ row, index }" slot="status">
                <i-switch v-model="row.status" size="large" :true-value="0" :false-value="1"
                          @on-change="handleStatusChange(row.id, row.status)">
                    <span slot="open">正常</span>
                    <span slot="close">停用</span>
                </i-switch>
            </template>
            <template slot-scope="{ row, index }" slot="action">
                <Button type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(row.id)">修改</Button>
                <Button type="error" size="small" @click="handleDelete(row.id)">删除</Button>
            </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList" @on-page-size-change="handlePageSize"/>
        <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
            <Form ref="dataForm" :rules="rules" :model="temp" :label-width="100" inline>
                <FormItem label="角色名称" prop="roleName">
                    <Input v-model="temp.roleName" :maxlength="30"></Input>
                </FormItem>
                <FormItem label="显示顺序">
                    <InputNumber :min="0" :precision="0" v-model="temp.roleSort"/>
                </FormItem>
                <FormItem label="权限字符" prop="roleKey">
                    <Input v-model="temp.roleKey" :maxlength="30"></Input>
                </FormItem>
                <FormItem label="角色状态">
                    <i-switch v-model="temp.status" size="large" :true-value="0" :false-value="1">
                        <span slot="open">正常</span>
                        <span slot="close">停用</span>
                    </i-switch>
                </FormItem>
                <Row>
                    <FormItem label="数据范围">
                        <Select v-model="temp.dataScope" style="width: 162px">
                            <Option :value="1">全部数据权限</Option>
                            <Option :value="2">自定数据权限</Option>
                            <Option :value="3">本部门数据权限</Option>
                            <Option :value="4">本部门及以下数据权限</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="数据权限" v-show="temp.dataScope === 2">
                        <Tree ref="deptTree" :data="listDeptTree" show-checkbox></Tree>
                    </FormItem>
                </Row>
                <FormItem label="菜单权限">
                    <Tree ref="menuTree" :data="listMenuTree" show-checkbox></Tree>
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
import { changeStatus, create, fectchInfo, fetchList, remove, update } from '@/api/system/role'
import { fetchListTree as fetchDeptListTree } from '@/api/system/dept'
import { fetchListTree as fetchMenuListTree } from '@/api/system/menu'

export default {
  name: 'Role',
  data () {
    return {
      columns: [
        {
          title: '角色ID',
          key: 'id'
        },
        {
          title: '角色名称',
          key: 'roleName'
        },
        {
          title: '权限字符',
          key: 'roleKey'
        },
        {
          title: '显示顺序',
          key: 'roleSort'
        },
        {
          title: '状态',
          slot: 'status'
        },
        {
          title: '创建时间',
          key: 'createTime',
          width: 150
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
        roleName: null
      },
      listDeptTree: [],
      listMenuTree: [],
      list: [],
      total: 10,
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改角色',
        create: '新增角色'
      },
      passwordPlaceHolderMap: {
        update: '空表示不修改密码',
        create: '空表示使用默认密码'
      },
      temp: {
        id: null,
        deptIds: [],
        menuIds: [],
        roleName: null,
        roleSort: 0,
        roleKey: null,
        dataScope: 4,
        status: 0
      },
      rules: {
        deptIds: [{ required: true, type: 'array', min: 1, message: '所属部门不能为空', trigger: 'change' }],
        roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getList()
    this.getDeptListTree()
    this.getMenuListTree()
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
    // 获取部门树
    getDeptListTree () {
      fetchDeptListTree({}).then(res => {
        this.listDeptTree = res.data
      })
    },
    getMenuListTree () {
      fetchMenuListTree({}).then(res => {
        this.listMenuTree = res.data
      })
    },
    resetTemp () {
      this.temp = {
        id: null,
        deptIds: [],
        menuIds: [],
        roleName: null,
        roleSort: 0,
        roleKey: null,
        dataScope: 4,
        status: 0
      }
      // 清除tree选中项
      this.$refs.menuTree.getCheckedAndIndeterminateNodes().forEach(node => {
        node.checked = false
        node.expand = false
        node.indeterminate = false
      })
      this.$refs.deptTree.getCheckedAndIndeterminateNodes().forEach(node => {
        node.checked = false
        node.expand = false
        node.indeterminate = false
      })
    },
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList()
    },
    handleCreate () {
      this.$refs['dataForm'].resetFields()
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdate (id) {
      this.$refs['dataForm'].resetFields()
      this.resetTemp()
      fectchInfo(id).then(res => {
        this.temp = Object.assign({}, res.data) // copy obj
        this.listDeptTree = res.data.deptVOTreeList
        this.listMenuTree = res.data.menuVOTreeList
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      })
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.handleData()
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
          this.handleData()
          update(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '修改成功' })
          })
        }
      })
    },
    handleData () { // 提交前数据处理
      this.temp.menuIds = this.$refs.menuTree.getCheckedAndIndeterminateNodes().map(item => item.id)
      this.temp.deptIds = this.$refs.deptTree.getCheckedAndIndeterminateNodes().map(item => item.id)
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
    },
    handleStatusChange (id, status) {
      let content = status === 0 ? '启用' : '停用'
      this.$Modal.confirm({
        title: '提示',
        content: `确认要${content}角色吗？`,
        onOk: () => {
          changeStatus({ id, status }).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: `${content}成功` })
          })
        }
      })
    }
  }
}
</script>

<style>
    .ivu-tree ul li {
        margin: 0 0;
    }
</style>
