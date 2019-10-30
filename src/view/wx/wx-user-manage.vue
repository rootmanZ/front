<template>
    <div>
      <Row>
          <div class="search-con">
            <Input v-model="tagName" placeholder="输入关键字" style="width: 150px" on-blur=""/>
            <Button :disabled="tagButtonStatus" class="search-btn" type="primary" @click="handleCreateTag">打标签</Button>
          </div>
      </Row>
      <br>
      <Row>
        <Col span="4">
          <Tree :data="treeData" empty-text="暂无分类..." @on-select-change="selectTag"></Tree>
        </Col>
        <Col span="20">
          <Table border ref="tablesMain" :data="list" :columns="columns" :loading="listLoading" @on-selection-change="selectUser">
            <template slot-scope="{ row, index }" slot="headImgUrl">
              <img class="img" :src="row.headImgUrl"/>
            </template>
            <template slot-scope="{ row, index }" slot="tagidList">
              <Tag v-for="(item, index) in getTagName(row.tagidList)">{{item}}</Tag>
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
      <modal :title="tagFromTitle" v-model="dialogFormVisibleTag" :mask-closable="false">
        <Form ref="dataForm2" :model="tagTemp" :label-width="100" inline>
        <FormItem prop="tagidList">
          <CheckboxGroup v-model="tagArrResult" @on-change="getCheckbox">
            <Checkbox v-for="(item,index) in treeNode" :key="item.id" :label="item.tagId">
              <span>{{item.tagName}}</span>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
      </Form>
        <div slot="footer">
          <Button @click="dialogFormVisibleTag = false">取消</Button>
          <Button type="primary" @click="updateTagData()">确定</Button>
        </div>
      </modal>
      <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
        <Form ref="dataForm" :rules="rules" :model="temp" :label-width="100" inline>
          <FormItem label="用户头像" prop="headImgUrl">
            <img :src="temp.headImgUrl"  v-model="temp.headImgUrl" />
          </FormItem>
          <br>
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
import Dept from '../system/dept'

export default {
  name: 'wx-user-manage',
  components: { Dept },
  data () {
    return {
      tagButtonStatus: true,
      removeTagFlag: false,
      tagArrResult: [],
      tagArr: [],
      tagFromTitle: '请选择要打的标签',
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
          title: '标签',
          key: 'tagidList',
          align: 'center',
          width: 100,
          slot: 'tagidList'
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
        tagidList: null
      },
      children: [],
      textMap: {
        update: '查看'
      },
      dialogFormVisible: false,
      dialogFormVisibleTag: false,
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
        tagidList: null,
        sex: 0
      },
      rules: {},
      updataList: [],
      selectList: [],
      tagName: null,
      tagTemp: {
        tagList: []
      },
      tagList: [],
      treeNode: []

    }
  },
  created () {
    this.getList()
    this.getTagList()
  },
  computed: {
    treeData () {
      const treeData = [
        {
          title: '全部标签',
          expand: true,
          children: this.treeNode
        }
      ]
      return treeData
    }
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
    getTagList () {
      fetchTagList(this.tagName).then(response => {
        let arr = []
        this.tagList = response.data
        for (var i = 0; i < this.tagList.length; i++) {
          let obj = {
            title: null,
            tagName: null,
            id: null,
            tagId: null
          }
          obj.title = this.tagList[i].tagName
          obj.tagName = this.tagList[i].tagName
          obj.id = this.tagList[i].id
          obj.tagId = this.tagList[i].tagId
          arr.push(obj)
        }
        this.treeNode = arr
      })
    },
    getTagName (tagidList) {
      let arr1 = []
      let arr2 = []
      arr1 = tagidList.split(',')
      for (let i = 0; i < arr1.length; i++) {
        for (let j = 0; j < this.treeNode.length; j++) {
          if (arr1[i] == this.treeNode[j].tagId) {
            arr2.push(this.treeNode[j].tagName)
          }
        }
      }
      return arr2
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
    updateTagData () {
      this.$refs['dataForm2'].validate((valid) => {
        if (valid) {
          update(this.selectList).then(() => {
            this.getList()
            this.dialogFormVisibleTag = false
            this.$Notice.success({ title: '成功', desc: '添加标签成功' })
          })
        }
      })
    },
    handleCreateTag () {
      this.tagArrResult = this.tagArr
      console.log(this.tagArrResult)
      console.log(this.tagArr)
      this.$refs['dataForm2'].resetFields()
      this.dialogFormVisibleTag = true
    },
    selectTag (data) {
      this.listQuery.tagidList = data[0].tagId
      this.getList()
    },
    selectUser (data) {
      if (data.length > 0) {
        this.tagButtonStatus = false
      } else {
        this.tagButtonStatus = true
      }
      this.tagArr = ['']
      let arr1 = []
      let arr2 = []
      let arr3 = []
      let commonTag = []
      let isHaveCommonTag = false
      if (data.length > 0 && data.length < 2) {
        commonTag = data[0].tagidList.split(',')
        isHaveCommonTag = true
      } else {
        arr1 = data[0].tagidList.split(',')
        arr2 = data[1].tagidList.split(',')
      }

      for (let i = 0; i < arr1.length; i++) {
        for (let j = 0; j < arr2.length; j++) {
          console.log(arr1[i] == arr2[j])
          if (arr1[i] == arr2[j]) {
            arr3.push(arr1[i])
          }
        }
      }
      if (data.length === 2) {
        commonTag = arr3
      }
      let flag = true
      for (let i = 0; i < data.length; i++) {
        if (i > 1 && flag) {
          let arr = data[i].tagidList.split(',')
          let result = []
          for (let j = 0; j < arr.length; j++) {
            for (let k = 0; k < arr3.length; k++) {
              if (arr[j] == arr3[k]) {
                result.push(arr[j])
              }
            }
          }
          if (result.length <= 0) {
            flag = false
          }
          arr3 = result
        }
        this.selectList.push(data[i])
      }
      if (!isHaveCommonTag) {
        commonTag = arr3
      }
      for (let i = 0; i < commonTag.length; i++) {
        if (!isNaN(parseInt(commonTag[i]))) {
          this.tagArr.push(parseInt(commonTag[i]))
        }
      }
    },
    getCheckbox (data) {
      console.log(data)
      let tagList = ''
      for (var i = 1; i < data.length; i++) {
        if (i == 1 || i == data.length) {
          tagList += data[i]
        } else {
          tagList = tagList + ',' + data[i]
        }
      }
      for (var i = 0; i < this.selectList.length; i++) {
        this.selectList[i].tagidList = tagList
      }
      console.log(this.selectList)
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
