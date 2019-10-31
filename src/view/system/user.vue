<template>
    <div>
        <div class="search-con">
            <Input v-model="listQuery.loginName" clearable placeholder="登录名称" class="search-item-first"/>
            <Button class="search-btn" type="primary" @click="getList">搜索</Button>
            <Button class="search-btn" type="primary" @click="handleCreate">新增</Button>
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
                <FormItem label="用户名称" prop="userName">
                    <Input v-model="temp.userName" :maxlength="30"></Input>
                </FormItem>
                <FormItem label="所属部门" prop="deptIds">
                    <Cascader v-model="temp.deptIds" :data="listDeptCascader" change-on-select></Cascader>
                </FormItem>
                <FormItem label="登录账号" prop="loginName">
                    <Input v-model="temp.loginName" :maxlength="30"></Input>
                </FormItem>
                <FormItem label="登录密码" prop="password">
                    <Input type="password" v-model="temp.password" :placeholder="passwordPlaceHolderMap[dialogStatus]"
                           :maxlength="20"></Input>
                </FormItem>
                <FormItem label="手机号" prop="mobile">
                    <Input v-model="temp.mobile" :maxlength="11"></Input>
                </FormItem>
                <FormItem label="性别" prop="sex">
                    <RadioGroup v-model="temp.sex">
                        <Radio label="0">男</Radio>
                        <Radio label="1">女</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="邮箱" prop="email">
                    <Input v-model="temp.email" :maxlength="30"></Input>
                </FormItem>
                <FormItem label="用户状态">
                    <i-switch v-model="temp.status" size="large" :true-value="0" :false-value="1">
                        <span slot="open">正常</span>
                        <span slot="close">停用</span>
                    </i-switch>
                </FormItem>
                <Row>
                    <Col span="24">
                        <FormItem label="角色" prop="roles" style="width: 100%">
                            <CheckboxGroup v-model="temp.roles">
                                <Checkbox v-for="role in listRoles" :label="role.id" :key="role.id">{{ role.roleName
                                    }}
                                </Checkbox>
                            </CheckboxGroup>
                        </FormItem>
                    </Col>
                </Row>
            </Form>
            <div slot="footer">
                <Button @click="dialogFormVisible = false">取消</Button>
                <Button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</Button>
            </div>
        </modal>
    </div>

</template>

<script>
import { changeStatus, create, fectchInfo, fetchList, remove, update } from '@/api/system/user'
import { fetchListCascader as fetchDeptListCascader } from '@/api/system/dept'
import { fetchAll as fetchRoleList } from '@/api/system/role'

export default {
  name: 'User',
  data () {
    return {
      columns: [
        {
          title: '用户ID',
          key: 'id'
        },
        {
          title: '登录账号',
          key: 'loginName'
        },
        {
          title: '用户名称',
          key: 'userName'
        },
        {
          title: '部门',
          key: 'deptName'
        },
        {
          title: '手机',
          key: 'mobile'
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
        loginName: null,
        bizId: undefined
      },
      listDeptCascader: [],
      listRoles: [],
      list: [],
      total: 10,
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改用户',
        create: '新增用户'
      },
      passwordPlaceHolderMap: {
        update: '空表示不修改密码',
        create: '空表示使用默认密码'
      },
      temp: {
        id: null,
        deptId: null,
        deptIds: [],
        userName: null,
        loginName: null,
        password: null,
        mobile: null,
        email: null,
        sex: '0',
        roles: [],
        status: 0
      },
      rules: {
        deptIds: [{ required: true, type: 'array', min: 1, message: '所属部门不能为空', trigger: 'change' }],
        userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        loginName: [{ required: true, message: '登录账号不能为空', trigger: 'blur' }],
        mobile: [{ required: true, message: '手机号不能为空' }, { pattern: /^1[34578]\d{9}$/, message: '无效的手机号格式' }],
        email: [{ type: 'email', message: '无效的邮箱格式', trigger: 'blur' }],
        roles: [{ required: true, type: 'array', min: 1, message: '角色不能为空', trigger: 'change' }]
      }
    }
  },
  created () {
    this.getList()
    this.getDeptListCascader()
    this.getRoleList()
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
    },
    // 获取部门级联选择数据
    getDeptListCascader () {
      fetchDeptListCascader({}).then(res => {
        this.listDeptCascader = res.data
      })
    },
    // 获取角色数据
    getRoleList () {
      fetchRoleList().then(res => {
        this.listRoles = res.data
      })
    },
    handleCreate () {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
    },
    handleUpdate (id) {
      this.$refs['dataForm'].resetFields()
      fectchInfo(id).then(res => {
        this.temp = Object.assign({}, res.data) // copy obj
        let deptIdArr = this.temp.deptAncestors.split(',')
        // deptIdArr.shift()
        deptIdArr.push(this.temp.deptId)
        this.temp.deptIds = deptIdArr.map(value => Number(value))
        this.temp.sex = this.temp.sex.toString()
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      })
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.deptId = this.temp.deptIds[this.temp.deptIds.length - 1]
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
          this.temp.deptId = this.temp.deptIds[this.temp.deptIds.length - 1]
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
    },
    handleStatusChange (id, status) {
      let content = status === 0 ? '启用' : '停用'
      this.$Modal.confirm({
        title: '提示',
        content: `确认要${content}用户吗？`,
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
