<template>
    <div>
        <div class="search-con">
            <Button class="search-btn" type="primary" icon="ios-add-circle-outline" @click="handleCreate">新增</Button>
        </div>
        <tree-table :expand-type="false" :selectable="false" :columns="columns" :data="list">
            <template slot-scope="scope" slot="action">
                <Button v-if="scope.row.parentId !== 0" type="primary" size="small" style="margin-right: 5px"
                        @click="handleUpdate(scope.row.id)">修改
                </Button>
                <Button v-if="scope.row.parentId !== 0" type="error" size="small" @click="handleDelete(scope.row.id)">
                    删除
                </Button>
            </template>
            <template slot="status" slot-scope="scope">
                {{scope.row.status === 0? '正常' : '停用'}}
            </template>
        </tree-table>
        <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false">
            <Form ref="dataForm" :rules="rules" :model="temp" :label-width="100" style="width: 400px;">
                <FormItem label="上级部门" prop="parentIds">
                    <Cascader v-model="temp.parentIds" :data="listCascader" change-on-select></Cascader>
                </FormItem>
                <FormItem label="部门名称" prop="name">
                    <Input v-model="temp.name"></Input>
                </FormItem>
                <FormItem label="显示排序">
                    <InputNumber :min="0" :precision="0" v-model="temp.orderNum"/>
                </FormItem>
                <FormItem label="部门状态">
                    <i-switch v-model="temp.status" size="large" :true-value="0" :false-value="1">
                        <span slot="open">正常</span>
                        <span slot="close">停用</span>
                    </i-switch>
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
    import {create, fectchInfo, fetchList, fetchListCascader, remove, update} from '@/api/system/dept'
    import TreeSelect from '_c/tree-select'

    export default {
        name: 'Dept',
        components: {
            TreeSelect
        },
        data() {
            return {
                columns: [
                    {
                        title: '部门名称',
                        key: 'name',
                        width: 300
                    },
                    {
                        title: '排序',
                        key: 'orderNum',
                        minWidth: 50
                    },
                    {
                        title: '状态',
                        key: 'status',
                        type: 'template',
                        template: 'status'
                    },
                    {
                        title: '创建时间',
                        key: 'createTime'
                    },
                    {
                        title: '操作',
                        type: 'template',
                        template: 'action',
                        width: 150
                    }
                ],
                list: [],
                listCascader: [],
                dialogFormVisible: false,
                dialogStatus: '',
                textMap: {
                    update: '修改部门',
                    create: '新增部门'
                },
                temp: {
                    id: '',
                    parentId: null,
                    parentIds: [100],
                    name: '',
                    orderNum: 0,
                    status: 0
                },
                rules: {
                    parentIds: [{required: true, type: 'array', min: 1, message: '上级部门不能为空', trigger: 'change'}],
                    name: [{required: true, message: '部门名称不能为空', trigger: 'blur'}]
                }
            }
        },
        created() {
            this.initData()
        },
        methods: {
            initData() {
                this.getList()
                this.getListCascader()
            },
            // 获取部门列表数据
            getList() {
                fetchList().then(res => {
                    this.list = res.data
                })
            },
            // 获取部门级联选择数据
            getListCascader() {
                fetchListCascader({}).then(res => {
                    this.listCascader = res.data
                })
            },
            handleCreate() {
                this.dialogStatus = 'create'
                this.dialogFormVisible = true
                this.$nextTick(() => {
                    this.$refs['dataForm'].resetFields()
                })
            },
            handleUpdate(id) {
                this.$refs['dataForm'].resetFields()
                fectchInfo(id).then(res => {
                    this.temp = Object.assign({}, res.data) // copy obj
                    let parentIdArr = this.temp.ancestors.split(',')
                    parentIdArr.shift()
                    this.temp.parentIds = parentIdArr.map(value => Number(value))
                    this.dialogStatus = 'update'
                    this.dialogFormVisible = true
                })
            },
            createData() {
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        this.temp.parentId = this.temp.parentIds[this.temp.parentIds.length - 1]
                        create(this.temp).then(() => {
                            this.initData()
                            this.dialogFormVisible = false
                            this.$Notice.success({title: '成功', desc: '新增成功'})
                        })
                    }
                })
            },
            updateData() {
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        this.temp.parentId = this.temp.parentIds[this.temp.parentIds.length - 1]
                        update(this.temp).then(() => {
                            this.initData()
                            this.dialogFormVisible = false
                            this.$Notice.success({title: '成功', desc: '修改成功'})
                        })
                    }
                })
            },
            handleDelete(id) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '此操作将删除该记录, 是否继续?',
                    onOk: () => {
                        remove(id).then(() => {
                            this.initData()
                            this.dialogFormVisible = false
                            this.$Notice.success({title: '成功', desc: '删除成功'})
                        })
                    }
                })
            }
        }
    }
</script>
