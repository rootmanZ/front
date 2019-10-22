<template>
    <div>
      <Row>
        <Col span="4">
          <Input v-model="value" placeholder="输入关键字" style="width: 150px" on-blur=""/>
        </Col>
        <Col span="4">
        <Button type="primary"  icon="ios-browsers" @click=""  ghost>打标签</Button>
        </Col>
      </Row>
      <br>
      <Row>
        <Col span="4">
          <Tree :data="tagData"></Tree>
        </Col>
        <Col span="20">
          <Table border ref="tablesMain" :data="list" :columns="columns" :loading="listLoading">
            <template slot-scope="{ row, index }" slot="headImgUrl">
              <img class="img" :src="row.headImgUrl"/>
            </template>
            <template slot-scope="{ row, index }" slot="sex">
              {{sexs[row.sex]}}
            </template>
            <template slot-scope="{ row, index }" slot="subscribeTime">
              {{dateConvert(row.subscribeTime)}}
            </template>
            <template slot-scope="{ row, index }" slot="subscribe">
              {{row.subscribe == 0 ? '否' : '是'}}
            </template>
            <template slot-scope="{ row, index }" slot="action">
              <Button type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(row.id)">查看</Button>
            </template>
          </Table>
          <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
                show-total show-sizer show-elevator
                @on-change="getList" @on-page-size-change="getList"/>
        </Col>
      </Row>
      <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
        <Form ref="dataForm" :rules="rules" :model="temp" :label-width="100" inline>
          <FormItem label="用户头像" prop="headImgUrl">
            <Input disabled v-model="temp.headImgUrl" :maxlength="30"></Input>
          </FormItem>
          <FormItem label="用户名称" prop="nickname">
            <Input disabled  v-model="temp.nickname" :maxlength="30"></Input>
          </FormItem>
          <FormItem label="是否关注" prop="subscribe">
            <Input disabled  v-model="temp.subscribe" :maxlength="30"></Input>
          </FormItem>
          <FormItem label="关注时间" prop="subscribeTime">
            <Input disabled  v-model="temp.subscribeTime" :maxlength="30"></Input>
          </FormItem>
          <FormItem label="所在国家" prop="country">
            <Input disabled  v-model="temp.country" :maxlength="30"></Input>
          </FormItem>
          <FormItem label="省份" prop="province">
            <Input disabled v-model="temp.province" :maxlength="30"></Input>
          </FormItem>
          <FormItem label="城市" prop="city">
            <Input disabled v-model="temp.city" :maxlength="30"></Input>
          </FormItem>
          <FormItem label="备注" prop="remark">
            <Input v-model="temp.remark" :maxlength="30"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button @click="dialogFormVisible = false">取消</Button>
          <Button type="primary" @click="updateData()">确定</Button>
        </div>
      </modal>
    </div>
</template>

<script>
import { create, fectchInfo, fetchList, remove, update } from '@/api/wx/user-manage'
import { createTag, fectchTagInfo, fetchTagList, removeTag, updateTag } from '@/api/wx/tag'

export default {
  name: 'wx-user-manage',
  data () {
    return {
      sexs: ['未知', '男', '女'],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '头像',
          key: 'headImgUrl',
          align: 'center',
          slot: 'headImgUrl'
        },
        {
          title: '昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '是否订阅',
          key: 'subscribe',
          align: 'center',
          slot: 'subscribe'
        },
        {
          title: '关注时间',
          key: 'subscribeTime',
          align: 'center',
          width: 100,
          slot: 'subscribeTime'
        },
        {
          title: '性别',
          key: 'sex',
          align: 'center',
          slot: 'sex'
        },
        {
          title: '所在国家',
          key: 'country'
        },
        {
          title: '省份',
          key: 'province',
          align: 'center'
        },
        {
          title: '城市',
          key: 'city',
          align: 'center'
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center'
        },
        {
          title: '操作',
          slot: 'action',
          width: 100,
          align: 'center'
        }
      ],
      list: [],
      listLoading: false,
      total: 10,
      listQuery: {
        current: 1,
        size: 10,
        appId: this.$route.query.appId,
        tagidList: ''
      },
      tagData: [
        {
          title: '全部标签',
          loading: false,
          children: [

          ]
        }
      ],
      textMap: {
        update: '查看'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      temp: {
        id: null,
        headImgUrl: '',
        nickname: null,
        subscribe: null,
        subscribeTime: null,
        sex: null,
        country: null,
        province: null,
        city: null,
        remark: null,
        sex: 0
      },
      rules: {},
      updataList: [],
      tagName: null,
      tagTemp: {
        title: null,
        tagName: null,
        tagId: null,
        id: null
      }
    }
  },
  created () {
    this.getList()
  },
  methods: {
    loadData () {
      const data = [
        {
          title: 'children',
          loading: false,
          children: []
        },
        {
          title: 'children',
          loading: false,
          children: []
        }
      ]
      return data
    },
    getList () {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getTagList () {
      fetchTagList(this.tagName).then(response => {
        this
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
    updateData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.updataList.push(this.temp)
          update(this.updataList).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$Notice.success({ title: '成功', desc: '修改成功' })
          })
        }
      })
    },
    // 转换日期
    dateConvert (value) {
      var date = new Date()
      date.setTime(value * 1000)
      var y = date.getFullYear()
      var m = date.getMonth() + 1
      m = m < 10 ? ('0' + m) : m
      var d = date.getDate()
      d = d < 10 ? ('0' + d) : d
      var h = date.getHours()
      h = h < 10 ? ('0' + h) : h
      var minute = date.getMinutes()
      var second = date.getSeconds()
      minute = minute < 10 ? ('0' + minute) : minute
      second = second < 10 ? ('0' + second) : second
      return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
    }
  }
}
</script>

<style scoped>
  .img{
    width: 20px;
    height: 20px;
  }
</style>
