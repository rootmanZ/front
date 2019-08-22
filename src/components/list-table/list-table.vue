<template>
    <div>
        <div class="search-con">
            <Input v-model="loginName" clearable placeholder="登录名" class="search-item-first"/>
            <Button @click="handleSearch" class="search-btn" type="primary">
                <Icon type="search"/>&nbsp;&nbsp;搜索
            </Button>
        </div>
        <Table ref="tablesMain" :data="list" :columns="columns">
            <template slot-scope="{ row, index }" slot="action">
                <Button type="primary" size="small" style="margin-right: 5px" @click="show(index)">View</Button>
                <Button type="error" size="small" @click="remove(index)">Delete</Button>
            </template>
        </Table>
        <pagination v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
                    show-total @pagination="getList"/>
    </div>

</template>

<script>
    export default {
        name: 'ListTable',
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
                listQuery: {
                    current: 1,
                    size: 10,
                    loginName: null,
                    bizId: undefined
                },
                list: [],
                total: 0,
                listLoading: false,
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
        }
    }
</script>
