<template>
  <div>
    <Row type="flex" justify="start" style="padding-bottom: 10px">
      <Col span="3">
      <Button type="primary" @click="restListMessageMassQuery" icon="ios-list-box">所有消息</Button>
      </Col>
      <Col span="3">
      <Input placeholder="标题内容" v-model="listMessageMassQuery.name"/>
      </Col>
      <Col span="3">
      <template>
        <Select v-model="listMessageMassQuery.sendAll" placeholder="是否全部用户">
          <Option v-for="item in sendAllList" :value="item.label" :key="item.value">{{ item.value }}</Option>
        </Select>
      </template>
      </Col>
      <Col span="3">
      <template>
        <Select v-model="listMessageMassQuery.type" placeholder="消息类型">
          <Option v-for="item in typeList" :value="item.label" :key="item.value">{{ item.value }}</Option>
        </Select>
      </template>
      </Col>
      <Col span="3">
      <DatePicker :value="listMessageMassQuery.rangeTime"
                  type="daterange"
                  formart="daterange"
                  @on-change="listMessageMassQuery.rangeTime=$event"
                  placement="bottom-end"
                  placeholder="选择查询时间"></DatePicker>
      </Col>
      <Col span="3">
      <Button type="primary" @click="getMessageMassList" icon="md-search">搜索</Button>
      </Col>
      <Col span="3">
      <Button type="primary" @click="handleCreate" icon="ios-paper-plane">新增群发消息</Button>
      </Col>
    </Row>

    <Table :data="listMessageMass" :columns="messageMassColumns" :loading="listMessageMassLoading"
           :border="true">
      <template slot="sendAll" slot-scope="scope">
        {{scope.row.sendAll === 0? '否' : '是'}}
      </template>
      <template slot="type" slot-scope="scope">
        {{msgType[scope.row.type]}}
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <Button type="primary" size="small" style="margin-right: 5px" @click="getMessageMassItemList(row.id)">详情
        </Button>
        <Button type="error" size="small" @click="handleDelete(row.id)">删除</Button>
      </template>
    </Table>
    <Page v-show="messageMassTotal>0" :total="messageMassTotal" :current.sync="listMessageMassQuery.current"
          :page-size="listMessageMassQuery.size"
          show-total show-sizer show-elevator
          @on-change="getMessageMassList" @on-page-size-change="handlePageSize"/>
    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" v-show="dialogFormVisible" :mask-closable="false"
           :width="800">
      <Form :model="temp" :label-width="100">
        <div v-show="!dialogItemFromVisible">
          <FormItem label="群发消息标题">
            <Input v-model="temp.name" :maxlength="30"></Input>
          </FormItem>
          <FormItem label="全部用户发送">
            <Select v-model="temp.sendAll" @on-change="getTagNameList" style="width:100px">
              <Option :value="0">否</Option>
              <Option :value="1">是</Option>
            </Select>
          </FormItem>
          <FormItem v-show="temp.sendAll===0?true:false" label="标签类型">
            <Select v-model="temp.sendCondition.tagId" style="width:150px">
              <Option v-for="item in tagList" :value="item.tagId" :key="item.tagId">{{item.tagName}}</Option>
            </Select>
          </FormItem>
          <FormItem v-show="temp.sendAll===0?true:false" label="用户性别">
            <RadioGroup v-model="temp.sendCondition.sex">
              <Radio label="1">男</Radio>
              <Radio label="2">女</Radio>
              <Radio label="">不限</Radio>
            </RadioGroup>
          </FormItem>
        </div>
        <div v-show="dialogItemFromVisible">
          <FormItem label="群发消息标题">
            {{temp.name}}
          </FormItem>
          <FormItem label="全部用户发送">
            {{temp.sendAll===0?"否":"是"}}
          </FormItem>
          <FormItem v-show="temp.sendAll===0" label="标签类型">
            {{temp.tagName}}
          </FormItem>
          <FormItem v-show="temp.sendAll===0" label="用户性别">
            {{temp.sendCondition.sex==='1'?'男':temp.sendCondition.sex==='2'?'女':'不限'}}
          </FormItem>
        </div>
        <FormItem label="回复消息">
          <resp-msg ref="respMsg" size="small" :appId="appId" tabName="respMsgTab"></resp-msg>
        </FormItem>
      </Form>

      <div v-model="dialogItemFromVisible" v-if="dialogItemFromVisible" :mask-closable="false">
        <Table :data="listMsgMassItem" :columns="msgMassItemColumns" :loading="listMsgItemLoading"
               :border="true">
          <template slot="msgStatus" slot-scope="scope">
            {{scope.row.msgStatus==='send success'? '发送成功':scope.row.msgStatus==='send fail'?
            '发送失败':scope.row.msgStatus}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button type="primary" size="small" style="margin-right: 5px" @click="showResult(row.msgId)">查看</Button>
          </template>
        </Table>
        <Page v-show="msgMassTotal>0" :total="msgMassTotal" :current.sync="listMsgMassItemQuery.current"
              :page-size="listMsgMassItemQuery.size"
              show-total show-sizer show-elevator
              @on-change="getMessageMassItemList(listMsgMassItemQuery.messageMassId)"
              @on-page-size-change="getMessageMassItemList(listMsgMassItemQuery.messageMassId)"/>
      </div>
      <div slot="footer" v-show="dialogItemFromVisible">
        <Button type="primary" @click="resetMessageMassItem" align="right">关闭</Button>
      </div>
      <div slot="footer" v-show="!dialogItemFromVisible">
        <Input placeholder="输入预览消息的微信号" v-model="temp.openId"
               style="width: 180px" align="right"/>
        <Button type="primary" @click="preview()" align="right">发送预览</Button>
        <Button @click="dialogFormVisible = false">取消</Button>
        <Button type="primary" @click="createData()">群发消息</Button>
      </div>
    </modal>
    <modal title="微信推送结果" v-model="massResultVisible" v-show="massResultVisible" :mask-closable="false" :width="500">
      <div style=" word-wrap: break-word;word-break: break-all;">{{itemResult}}</div>
      <div slot="footer">
        <Button type="primary" @click="resetMessageMassItemResult()" align="right">关闭</Button>
      </div>
    </modal>
  </div>
</template>

<script>
  import {
    fetchList,
    fectchInfo,
    create,
    update,
    remove,
    preview,
    tagList,
    itemList,
    itemInfo
  } from '@/api/wx/message-mass'
  import respMsg from '_c/wx/resp-msg.vue'

  export default {
    name: 'wx-message-mass',
    components: {respMsg},
    data() {
      return {
        messageMassColumns: [
          {
            title: '创建时间',
            align: 'center',
            key: 'createTime',
            width: 150
          },
          {
            title: '标题',
            align: 'center',
            key: 'name'
          },
          {
            title: '是否全部用户',
            align: 'center',
            slot: 'sendAll'
          },
          {
            title: '消息类型',
            align: 'center',
            slot: 'type'
          },
          {
            title: '发送的总数',
            align: 'center',
            key: 'totalCount'
          },
          {
            title: '过滤后总数',
            align: 'center',
            key: 'filterCount'
          },
          {
            title: '发送成功数',
            align: 'center',
            key: 'sendCount'
          },
          {
            title: '发送失败数',
            align: 'center',
            key: 'errorCount'
          },

          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        listMessageMassQuery: {
          name: '',
          type: '',
          sendAll: '',
          rangeTime: [],
          current: 1,
          size: 10
        },
        sendAllList: [
          {
            value: '是',
            label: '1'
          },
          {
            value: '否',
            label: '0'
          },
          {
            value: '全部',
            label: ''
          }
        ],
        typeList: [
          {
            value: '文本',
            label: 'text'
          },
          {
            value: '图片',
            label: 'image'
          },
          {
            value: '语音',
            label: 'voice'
          },
          {
            value: '视频',
            label: 'video'
          },
          {
            value: '音乐',
            label: 'music'
          },
          {
            value: '图文',
            label: 'news'
          },
          {
            value: '全部',
            label: ''
          }
        ],
        msgMassItemColumns: [
          {
            title: '消息id',
            align: 'center',
            key: 'msgId',
            width: 120
          },
          {
            title: '消息发送状态',
            align: 'center',
            width: 140,
            slot: 'msgStatus'
          },
          {
            title: '发送的总数',
            align: 'center',
            key: 'totalCount'
          },
          {
            title: '过滤后总数',
            align: 'center',
            key: 'filterCount'
          },
          {
            title: '发送成功数',
            align: 'center',
            key: 'sendCount'
          },
          {
            title: '发送失败数',
            align: 'center',
            key: 'errorCount'
          },
          {
            title: '推送结果',
            slot: 'action',
            align: 'center'
          }
        ],
        dialogStatus: '',
        tagList: [],
        listMessageMass: [],
        messageMassTotal: 10,
        listMessageMassLoading: false,
        dialogFormVisible: false,
        listMsgMassItem: [],
        msgMassTotal: 10,
        listMsgItemLoading: false,
        dialogItemFromVisible: false,
        massResultVisible: false,
        itemResult: '暂无数据',
        textMap: {
          create: '新增群发消息',
          details: '消息详情'
        },
        listMsgMassItemQuery: {
          current: 1,
          size: 10,
          messageMassId:''
        },
        msgType: {
          text: '文本',
          image: '图片',
          voice: '语音',
          video: '视频',
          news: '图文',
          music: '音乐'
        },
        temp: {
          openId: '',
          appId: '',
          name: '',
          sendAll: 1,
          tagName: '',
          sendCondition: {
            tagId: '',
            sex: ''
          },
          respMsg: {
            msgType: 'text',
            content: null
          }
        },
        appId: this.$route.query.appId
      }
    },
    created() {
      this.getMessageMassList()
    },
    watch: {
      messageMass: function (val) {
        this.refreshData()
      }
    },
    methods: {
      // 获取标签列表
      getTagNameList() {
        tagList().then(res => {
          this.tagList = res.data
        })
      },
      getMessageMassList() {
        console.log(this.listMessageMassQuery.rangeTime)
        this.listMessageMassLoading = true
        this.listMessageMassQuery.appId = this.appId
        fetchList(this.listMessageMassQuery).then(res => {
          this.listMessageMass = res.data.records
          this.messageMassTotal = res.data.total
          this.listMessageMassLoading = false
        })
      },
      getMessageMassItemList(id) {
        this.dialogStatus = 'details'
        this.dialogItemFromVisible = true
        this.listMsgItemLoading = true
        this.listMsgMassItemQuery.messageMassId = id
        this.listMsgMassItemQuery.current = 1
        itemList(this.listMsgMassItemQuery).then(res => {
          this.listMsgMassItem = res.data.records
          this.msgMassTotal = res.data.total
          this.listMsgItemLoading = false
        })
        fectchInfo(id).then(res => {
          this.temp.name = res.data.name
          this.temp.sendAll = res.data.sendAll
          this.temp.tagName = res.data.tagName
          this.temp.sendCondition.sex = res.data.sendCondition.sex
          this.$refs.respMsg.initTemp(JSON.parse(res.data.content))
          this.dialogFormVisible = true
        })
      },
      // 清除详情数据
      resetMessageMassItem() {
        this.dialogFormVisible = false
        this.dialogItemFromVisible = false
        this.listMsgMassItemQuery.current = 1
        getMessageMassList()
      },
      // 清空微信推送数据
      resetMessageMassItemResult() {
        this.massResultVisible = false
        this.itemResult = '暂无数据'
      },
      // 查看微信推送数据
      showResult(id) {
        this.massResultVisible = true
        itemInfo(id).then(res => {
          if (res.data.result === '') {
            return
          }
          this.itemResult = JSON.stringify(JSON.parse(res.data.result))
        })
      },
      resetTemp() {
        this.temp = {
          openId: '',
          appId: '',
          name: '',
          sendAll: 1,
          tagName: '',
          sendCondition: {
            tagId: '',
            sex: ''
          },
          respMsg: {
            msgType: 'text',
            content: null
          }
        }
      },
      restListMessageMassQuery() {
        this.listMessageMassQuery = {
          name: '',
          type: '',
          sendAll: '',
          rangeTime: [],
          current: 1,
          size: 10
        }
        this.getMessageMassList()
      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getMessageMassList()
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogItemFromVisible = false
        this.dialogFormVisible = true
        this.resetTemp()
        this.$refs.respMsg.initTemp(this.temp.respMsg)
      },
      createData() {
        if (!this.checkForm()) {
          return
        }
        if (!this.$refs.respMsg.checkMsg()) {
          return
        }
        this.temp.appId = this.appId
        this.temp.respMsg = this.$refs.respMsg.formatTemp()
        create(this.temp).then(() => {
          this.dialogFormVisible = false
          this.refreshData()
          this.$Notice.success({title: '成功', desc: '新增成功'})
        })
      },
      // 预览消息
      preview() {
        if (!this.checkForm()) {
          return
        }
        if (!this.$refs.respMsg.checkMsg()) {
          return
        }
        if (this.temp.openId === '') {
          this.$Message.error('请输入要预览的账号')
          return
        }
        this.temp.appId = this.appId
        this.temp.respMsg = this.$refs.respMsg.formatTemp()
        preview(this.temp).then(res => {
          if (res.data === '0') {
            this.temp.openId = ''
            this.$Notice.success({title: '成功', desc: '已发送预览，请查看'})
          } else {
            this.$Message.error('发送失败，请输入正确微信号')
          }
        })
      },
      handleDelete(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该记录, 是否继续?',
          onOk: () => {
            remove(id).then(() => {
              this.refreshData()
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '删除成功'})
            })
          }
        })
      },
      refreshData() {
        this.getMessageMassList()
      },
      checkForm() {
        let checkResut = true

        if (!this.temp.name) {
          this.$Message.error('标题不能为空')
          checkResut = false
        }
        if (this.temp.sendAll === 0 && !this.temp.sendCondition.tagId) {
          this.$Message.error('标签名称不能为空')
          checkResut = false
        }
        return checkResut
      }
    }
  }
</script>

<style scoped>

</style>
