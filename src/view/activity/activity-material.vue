<template>
  <div>
    <Tabs v-model="tabValue" @on-click="changeTabPane(tabValue)">
      <TabPane label="音乐库" name="2" icon="md-musical-notes">
        <div class="search-con">
          <Input v-model="listQuery.name" clearable placeholder="素材名称" class="search-item-first"/>
          <Button v-if="$viewAccess('act:material:list')" class="search-btn" type="primary" @click="getList(2)"
                  icon="md-search">搜索
          </Button>
          <Button v-if="$viewAccess('act:material:add')" class="search-btn" type="primary" @click="handleCreate(2)"
                  icon="md-add">新增
          </Button>
        </div>
        <Table ref="musicsTable" :data="list" :columns="columns" :loading="listLoading" :border="true">
          <template slot-scope="scope" slot="materialType">
            {{typeMap[scope.row.materialType]}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button v-if="$viewAccess('act:material:edit')" type="primary" size="small" style="margin-right: 5px"
                    @click="handleUpdate(row.id)">修改
            </Button>
            <Button v-if="$viewAccess('act:material:delete')" type="error" size="small"
                    @click="handleDelete(row.id,row.materialType)">删除
            </Button>
          </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList(2)" @on-page-size-change="handlePageSizeMusics"/>
      </TabPane>


      <TabPane label="视频库" name="3" icon="md-videocam">
        <div class="search-con">
          <Input v-model="listQuery.name" clearable placeholder="素材名称" class="search-item-first"/>
          <Button v-if="$viewAccess('act:material:list')" class="search-btn" type="primary" @click="getList(3)"
                  icon="md-search">搜索
          </Button>
          <Button v-if="$viewAccess('act:material:add')" class="search-btn" type="primary" @click="handleCreate(3)"
                  icon="md-add">新增
          </Button>
        </div>
        <Table ref="videosTable" :data="list" :columns="columns" :loading="listLoading" :border="true">
          <template slot-scope="scope" slot="materialType">
            {{typeMap[scope.row.materialType]}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button v-if="$viewAccess('act:material:edit')" type="primary" size="small" style="margin-right: 5px"
                    @click="handleUpdate(row.id)">修改
            </Button>
            <Button v-if="$viewAccess('act:material:delete')" type="error" size="small"
                    @click="handleDelete(row.id,row.materialType)">删除
            </Button>
          </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList(3)" @on-page-size-change="handlePageSizeVideo"/>
      </TabPane>


      <TabPane label="祝福语库" name="0" icon="ios-browsers">
        <div class="search-con">
          <Input v-model="listQuery.name" clearable placeholder="素材名称" class="search-item-first"/>
          <Button v-if="$viewAccess('act:material:list')" class="search-btn" type="primary" @click="getList(0)"
                  icon="md-search">搜索
          </Button>
          <Button v-if="$viewAccess('act:material:add')" class="search-btn" type="primary" @click="handleCreate(0)"
                  icon="md-add">新增
          </Button>
        </div>
        <Table ref="textsTable" :data="list" :columns="columns" :loading="listLoading" :border="true">
          <template slot-scope="scope" slot="materialType">
            {{typeMap[scope.row.materialType]}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button v-if="$viewAccess('act:material:edit')" type="primary" size="small" style="margin-right: 5px"
                    @click="handleUpdate(row.id)">修改
            </Button>
            <Button v-if="$viewAccess('act:material:delete')" type="error" size="small"
                    @click="handleDelete(row.id,row.materialType)">删除
            </Button>
          </template>
        </Table>
        <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-sizer show-elevator
              @on-change="getList(0)" @on-page-size-change="handlePageSizeText"/>
      </TabPane>
    </Tabs>


    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
      <Form ref="dataForm" :rules="rules" :model="temp" :label-width="100" inline>

        <FormItem label="名称" prop="name">
          <Input v-model="temp.name" placeholder="输入名称" :maxlength="16" style="width: 250px" clearable></Input>
        </FormItem>
        <FormItem label="类型" prop="materialType">
          <Select v-model="temp.materialType" style="width:100px" disabled>
            <Option :value=0>祝福语</Option>
            <Option :value=1>图片</Option>
            <Option :value=2>音乐</Option>
            <Option :value=3>视频</Option>
          </Select>
        </FormItem>
        <br>
        <FormItem label="内容" prop="content">
          <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="temp.content" placeholder="输入素材的URL地址"
                 style="width: 500px"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="dialogFormVisible = false">取消</Button>
        <Button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</Button>
      </div>
    </modal>

    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisibleText" :mask-closable="false" :width="650">
      <Form ref="dataFormText" :rules="rulesText" :model="temp" :label-width="100" inline>

        <FormItem label="名称" prop="name">
          <Input v-model="temp.name" placeholder="输入名称" :maxlength="16" style="width: 250px" clearable></Input>
        </FormItem>
        <FormItem label="类型" prop="materialType">
          <Select v-model="temp.materialType" style="width:100px" disabled>
            <Option :value=0>祝福语</Option>
            <Option :value=1>图片</Option>
            <Option :value=2>音乐</Option>
            <Option :value=3>视频</Option>
          </Select>
        </FormItem>
        <br>
        <FormItem label="内容" prop="content">
          <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="temp.content" placeholder="输入祝福语内容"
                 style="width: 500px"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="dialogFormVisibleText = false">取消</Button>
        <Button type="primary" @click="dialogStatus==='create'?createDataText():updateDataText()">确定</Button>
      </div>
    </modal>
  </div>
</template>

<script>
  import {create, fetchInfo, fetchList, remove, update} from '@/api/activity/material'

  export default {
    name: "activity-material",

    data() {
      return {
        tabValue: "2",
        columns: [
          {
            title: '素材id',
            key: 'id',
            width: 100,
            align: 'center'
          },
          {
            title: '类型',
            slot: 'materialType',
            width: 100,
            align: 'center'
          },
          {
            title: '名称',
            key: 'name',
            width: 150,
            align: 'center'
          },
          {
            title: '内容',
            key: 'content',
            align: 'center'
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
          materialType: null,
          name: null
        },
        list: [],
        total: 10,
        listLoading: false,
        dialogFormVisible: false,
        dialogFormVisibleText: false,
        dialogStatus: '',
        textMap: {
          update: '修改素材',
          create: '新增素材'
        },
        typeMap: {
          0: '祝福语',
          1: '图片',
          2: '音乐',
          3: '视频'
        },
        temp: {
          id: null,
          name: null,
          materialType: null,
          content: null
        },
        rules: {
          name: [{required: true, message: '素材名称不能为空', trigger: 'blur'}],
          content: [
            {required: true, message: '素材URL不能为空', trigger: 'blur'},
            {type: 'url', message: '素材URL格式错误'},
            {max: 200, message: '素材URL不能超过200字符', trigger: 'blur'}],
        },
        rulesText: {
          name: [{required: true, message: '素材名称不能为空', trigger: 'blur'}],
          content: [
            {required: true, message: '祝福语内容不能为空', trigger: 'blur'},
            {type: 'string', max: 200, message: '祝福语内容不能超过200字符', trigger: 'blur'}]
        }
      }
    },
    created() {
      this.getList(2)
    },
    methods: {
      changeTabPane(materialType) {
        this.resetListQuery();
        this.getList(materialType)
      },
      getList(materialType) {
        this.listQuery.materialType = materialType
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.list = response.data.records
          this.total = response.data.total
          this.listLoading = false
        })
      },
      resetTemp() {
        this.temp = {
          name: null,
          materialType: null,
          content: null
        }
      },
      resetListQuery() {
        this.listQuery = {
          current: 1,
          size: 10,
          materialType: null,
          name: null
        }
      },
      handlePageSizeMusics(value) {
        this.listQuery.size = value
        this.getList(2)
      },
      handlePageSizeVideo(value) {
        this.listQuery.size = value
        this.getList(3)
      },
      handlePageSizeText(value) {
        this.listQuery.size = value
        this.getList(0)
      },
      handleCreate(materialType) {
        this.dialogStatus = 'create'
        if (materialType === 0) {
          this.dialogFormVisibleText = true
          this.$nextTick(() => {
            this.$refs['dataFormText'].resetFields()
            this.resetTemp()
            this.temp.materialType = materialType
          })
        } else {
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
            this.resetTemp()
            this.temp.materialType = materialType
          })
        }

      },
      handleUpdate(id) {
        this.$refs['dataForm'].resetFields()
        this.$refs['dataFormText'].resetFields()
        fetchInfo(id).then(res => {
          this.temp = Object.assign({}, res.data) // copy obj
          this.dialogStatus = 'update'
          if (this.temp.materialType === 0) {
            this.dialogFormVisibleText = true
          } else {
            this.dialogFormVisible = true
          }
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            create(this.temp).then(() => {
              this.getList(this.temp.materialType)
              this.dialogFormVisible = false
              this.dialogFormVisibleText = false
              this.$Notice.success({title: '成功', desc: '新增成功'})
            })
          }
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            update(this.temp).then(() => {
              this.getList(this.temp.materialType)
              this.dialogFormVisible = false
              this.dialogFormVisibleText = false
              this.$Notice.success({title: '成功', desc: '修改成功'})
            })
          }
        })
      },
      createDataText() {
        this.$refs['dataFormText'].validate((valid) => {
          if (valid) {
            create(this.temp).then(() => {
              this.getList(this.temp.materialType)
              this.dialogFormVisible = false
              this.dialogFormVisibleText = false
              this.$Notice.success({title: '成功', desc: '新增成功'})
            })
          }
        })
      },
      updateDataText() {
        this.$refs['dataFormText'].validate((valid) => {
          if (valid) {
            update(this.temp).then(() => {
              this.getList(this.temp.materialType)
              this.dialogFormVisible = false
              this.dialogFormVisibleText = false
              this.$Notice.success({title: '成功', desc: '修改成功'})
            })
          }
        })
      },
      handleDelete(id, materialType) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该记录, 是否继续?',
          onOk: () => {
            this.temp.id = id
            remove(this.temp).then(() => {
              this.getList(materialType)
              this.dialogFormVisible = false
              this.dialogFormVisibleText = false
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
