<template>
    <div>
        <div class="search-con">
            <Button class="search-btn" type="primary" icon="md-add" @click="handleCreate">新增</Button>
        </div>
        <tree-table :expand-type="false" :selectable="false" :columns="columns" :data="list">
            <template slot-scope="scope" slot="action">
                <Button type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(scope.row.id)">修改
                </Button>
                <Button type="error" size="small" @click="handleDelete(scope.row.id)">删除</Button>
            </template>
            <template slot="menuType" slot-scope="scope">
                {{scope.row.menuType === 0? '菜单' : '按钮'}}
            </template>
            <template slot="visible" slot-scope="scope">
                {{scope.row.visible === 0? '显示' : '隐藏'}}
            </template>
        </tree-table>
        <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
            <Form ref="dataForm" :rules="rules" :model="temp" :label-width="100" inline>
                <FormItem label="上级菜单" style="width: 262px">
                    <treeselect v-model="temp.parentId" :options="listCascader" placeholder=""/>
                </FormItem>
                <FormItem label="菜单类型" prop="menuType">
                    <RadioGroup v-model="temp.menuType">
                        <Radio :label="0">菜单</Radio>
                        <Radio :label="1">按钮</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="菜单名称" prop="menuName">
                    <Input v-model="temp.menuName" :maxlength="30"></Input>
                </FormItem>
                <FormItem label="显示排序">
                    <InputNumber :min="0" :precision="0" v-model="temp.orderNum"/>
                </FormItem>
                <FormItem v-show="temp.menuType === 0" label="菜单英文名称">
                    <Input v-model="temp.menuEnName" :maxlength="30"></Input>
                </FormItem>
                <FormItem v-show="temp.menuType === 0" label="打开方式" prop="target">
                    <Select v-model="temp.target">
                        <Option value="menuItem">页签</Option>
                        <Option value="menuBlank">新窗口</Option>
                    </Select>
                </FormItem>
                <FormItem v-show="temp.menuType === 0" label="请求地址" prop="url">
                    <Input v-model="temp.url" :maxlength="200"></Input>
                </FormItem>
                <FormItem v-show="temp.menuType === 1" label="权限标识" prop="perms">
                    <Input v-model="temp.perms" placeholder="controller中定义的权限标识" :maxlength="100"></Input>
                </FormItem>
                <FormItem label="菜单状态" prop="visible">
                    <RadioGroup v-model="temp.visible">
                        <Radio :label="0">显示</Radio>
                        <Radio :label="1">隐藏</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem v-show="temp.menuType === 0" label="菜单图标" prop="icon">
                    <Input v-model="temp.icon" :maxlength="100"></Input>
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
    import {create, fectchInfo, fetchList, fetchListCascader, remove, update} from '@/api/system/menu'
    import Treeselect from '@riophae/vue-treeselect'
    import '@riophae/vue-treeselect/dist/vue-treeselect.css'

    export default {
        name: 'Menu',
        components: {
            Treeselect
        },
        data() {
            return {
                columns: [
                    {
                        title: '菜单名称',
                        key: 'menuName',
                        minWidth: 100
                    },
                    {
                        title: '菜单英文名称',
                        key: 'menuEnName',
                        minWidth: 100
                    },
                    {
                        title: '排序',
                        key: 'orderNum',
                        minWidth: 50
                    },
                    {
                        title: '请求地址',
                        key: 'url'
                    },
                    {
                        title: '类型',
                        type: 'template',
                        template: 'menuType'
                    },
                    {
                        title: '可见',
                        type: 'template',
                        template: 'visible'
                    },
                    {
                        title: '权限标识',
                        key: 'perms'
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
                    update: '修改菜单',
                    create: '新增菜单'
                },
                temp: {
                    id: null,
                    parentId: null,
                    menuType: 0,
                    menuName: null,
                    menuEnName: null,
                    url: null,
                    target: 'menuItem',
                    perms: null,
                    orderNum: 0,
                    icon: null,
                    visible: 0
                },
                rules: {
                    menuName: [{required: true, message: '菜单名称不能为空', trigger: 'blur'}]
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
            // 获取菜单列表数据
            getList() {
                fetchList().then(res => {
                    this.list = res.data
                })
            },
            // 获取菜单级联选择数据
            getListCascader() {
                fetchListCascader({}).then(res => {
                    this.listCascader = res.data
                })
            },
            resetTemp() {
                this.temp = {
                    id: null,
                    parentId: null,
                    menuType: 0,
                    menuName: null,
                    url: null,
                    target: 'menuItem',
                    perms: null,
                    orderNum: 0,
                    icon: null,
                    visible: 0
                }
            },
            handleCreate() {
                this.dialogStatus = 'create'
                this.dialogFormVisible = true
                this.$nextTick(() => {
                    this.$refs['dataForm'].resetFields()
                    this.resetTemp()
                })
            },
            handleUpdate(id) {
                this.$refs['dataForm'].resetFields()
                fectchInfo(id).then(res => {
                    this.temp = Object.assign({}, res.data) // copy obj
                    if (this.temp.parentId === 0) {
                        this.temp.parentId = null
                    }
                    this.dialogStatus = 'update'
                    this.dialogFormVisible = true
                })
            },
            validateForm() {
                if (this.temp.menuType === 0) { // 菜单
                    if (!this.temp.menuEnName || this.temp.menuEnName.trim().length < 1) {
                        this.$Message.error('菜单英文名称不能为空')
                        return false
                    }
                } else { // 按钮
                    if (!this.temp.perms || this.temp.perms.trim().length < 1) {
                        this.$Message.error('权限标识不能为空')
                        return false
                    }
                }
                return true
            },
            createData() {
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        if (!this.validateForm()) {
                            return
                        }
                        this.temp.parentId = this.temp.parentIds ? this.temp.parentIds[this.temp.parentIds.length - 1] : undefined
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
                        if (!this.validateForm()) {
                            return
                        }
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
