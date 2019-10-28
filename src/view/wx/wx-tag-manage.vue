<template>
  <div>
    <div class="search-con">
      <Input v-model="listQuery.tagName" clearable placeholder="标签名称" class="search-item-first"/>
      <Button class="search-btn" type="primary" @click="getList">搜索</Button>
      <Button class="search-btn" type="primary" @click="handleCreate">新增</Button>
      <Button class="search-btn" type="primary" @click="handleSynchronizeTag">同步标签</Button>
    </div>
    <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading"  :border="true">
      <template slot-scope="{ row, index }" slot="action">
        <Button type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(row.id)">修改</Button>
        <Button type="error" size="small" @click="handleDelete(row.id)">删除</Button>
      </template>
    </Table>
    <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
          show-total show-sizer show-elevator
          @on-change="getList" @on-page-size-change="getList"/>
    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
      <Form ref="dataForm" :model="temp" :label-width="100" inline>
        <FormItem label="appId" prop="appId">
          <Input disabled v-model="this.$route.query.appId" :maxlength="30"></Input>
        </FormItem>
        <FormItem label="标签名称" prop="tagName">
          <Input v-model="temp.tagName" :maxlength="30"></Input>
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
import { create, fectchInfo, fetchList, fetchTagList, remove, update, synchronize } from '@/api/wx/tag'

export default {
  name: 'wx-tag-manage',
  data () {
    return {
      columns: [
        {
          title: 'id',
          key: 'id'
        },
        {
          title: '标签id',
          key: 'tagId'
        },
        {
          title: '标签名称',
          key: 'tagName'
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
        tagName: null,
        appId: this.$route.query.appId
      },
      list: [],
      listLoading: false,
      total: 10,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改标签',
        create: '新增标签'
      },
      temp: {
        id: null,
        appId: null,
        tagName: null,
        tagId: null,
        createTime: null
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
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
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
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      })
    },
    handleSynchronizeTag () {
      synchronize(this.$route.query.appId).then(() => {
        this.getList()
        this.dialogFormVisible = false
        this.$Notice.success({ title: '成功', desc: '同步成功' })
      })
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.appId = this.$route.query.appId
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

<style scoped>

</style>
