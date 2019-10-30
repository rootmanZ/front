<template>
  <div>
    <Row type="flex" justify="start" style="padding-bottom: 10px">
      <Col span="2">
      <Button type="primary" @click="restListMessageMassQuery" icon="ios-list-box" style="width: 100px">所有消息</Button>
      </Col>
      <Col span="3">
      <Input placeholder="标题内容" v-model="listMessageMassQuery.name"
             style="width: 150px"/>
      </Col>
      <Col span="3">
      <template>
        <Select v-model="listMessageMassQuery.sendAll" placeholder="是否全部用户" style="width:150px">
          <Option v-for="item in sendAllList" :value="item.label" :key="item.value">{{ item.value }}</Option>
        </Select>
      </template>
      </Col>
      <Col span="3">
      <template>
        <Select v-model="listMessageMassQuery.type" placeholder="消息类型" style="width:150px">
          <Option v-for="item in typeList" :value="item.label" :key="item.value">{{ item.value }}</Option>
        </Select>
      </template>
      </Col>
      <Col span="3">
      <DatePicker :value="listMessageMassQuery.startTime"
                  @on-change="listMessageMassQuery.startTime=$event" type="date"
                  placeholder="开始时间"
                  style="width: 150px"></DatePicker>
      </Col>
      <Col span="3">
      <DatePicker :value="listMessageMassQuery.endTime"
                  @on-change="listMessageMassQuery.endTime=$event" type="date"
                  placeholder="结束时间"
                  style="width: 150px"></DatePicker>
      </Col>
      <Col span="2">
      <Button type="primary" @click="getMessageMassList" icon="md-search" style="width: 100px">搜索</Button>
      </Col>
      <Col span="2">
      <Button type="primary" @click="handleCreate" icon="ios-paper-plane" style="width: 150px">新增群发消息</Button>
      </Col>
    </Row>
    <Tabs v-model="messageMass" :animated="false" name="replyTab">
      <TabPane label="群发消息列表" name="messageMass" tab="replyTab">
        <Table ref="messageMass" :data="listMessageMass" :columns="messageMassColumns" :loading="listMessageMassLoading"
               :border="true">
          <template slot="sendAll" slot-scope="scope">
            {{scope.row.sendAll === 0? '否' : '是'}}
          </template>
          <template slot="type" slot-scope="scope">
            {{msgType[scope.row.type]}}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button type="primary" size="small" style="margin-right: 5px" @click="getMessageMassItemList(row.id)">详情</Button>
            <Button type="error" size="small" @click="handleDelete(row.id)">删除</Button>
          </template>
        </Table>
        <Page v-show="messageMassTotal>0" :total="messageMassTotal" :current.sync="listMessageMassQuery.current"
              :page-size="listMessageMassQuery.size"
              show-total show-sizer show-elevator
              @on-change="getMessageMassList" @on-page-size-change="getMessageMassList"/>
      </TabPane>
    </Tabs>
    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
      <Form ref="dataForm" :model="temp" :rules="rules" :label-width="100">
        <FormItem label="群发消息标题">
          <Input v-model="temp.name" :maxlength="30"></Input>
        </FormItem>
        <FormItem label="全部用户发送">
          <Select v-model="temp.sendAll" style="width:100px">
            <Option :value="0">否</Option>
            <Option :value="1">是</Option>
          </Select>
        </FormItem>
        <FormItem v-show="temp.sendAll==0?true:false" label="标签类型">
          <Select v-model="temp.sendCondition.tagName" style="width:150px">
            <Option v-for="item in tagNameList" :value="item" :key="item">{{item}}</Option>
          </Select>
        </FormItem>
        <FormItem v-show="temp.sendAll==0?true:false" label="用户性别">
          <RadioGroup v-model="temp.sendCondition.sex">
            <Radio label="1">男</Radio>
            <Radio label="2">女</Radio>
            <Radio label="all">不限</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="回复消息">
          <resp-msg ref="respMsg" size="small" :appId="appId" tabName="respMsgTab"></resp-msg>
        </FormItem>
      </Form>
      <div slot="footer">
        <Input placeholder="输入预览消息的微信号" v-model="temp.openId"
               style="width: 180px" align="right"/>
        <Button type="primary" @click="preview()" align="right">发送预览</Button>
        <Button @click="dialogFormVisible = false">取消</Button>
        <Button type="primary" @click="createData()">群发消息</Button>
      </div>
    </modal>
    <modal title="消息详情" v-model="dialogItemFromVisible" :mask-closable="false" :width="700">
      <Table :data="listMsgMassItem" :columns="msgMassItemColumns" :loading="listMsgItemLoading"
             :border="true">
      </Table>
      <Page v-show="msgMassTotal>0" :total="msgMassTotal" :current.sync="listMsgMassItemQuery.current"
            :page-size="listMsgMassItemQuery.size"
            show-total show-sizer show-elevator
            @on-change="getMessageMassItemList(listMsgMassItemQuery.messageMassId)"
            @on-page-size-change="getMessageMassItemList((listMsgMassItemQuery.messageMassId))"/>
      <div slot="footer">
        <Button type="primary" @click="resetMessageMassItem">关闭</Button>
      </div>
    </modal>
  </div>
</template>

<script>
  import {fetchList, fectchInfo, create, update, remove, preview, tagList, itemList} from '@/api/wx/message-mass'
  import respMsg from '_c/wx/resp-msg.vue'

  export default {
    name: 'wx-message-mass',
    components: {respMsg},
    data() {
      return {
        messageMass: 'messageMass',

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
          name: null,
          type: null,
          sendAll: null,
          startTime: null,
          endTime: null,
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
            label: null
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
            label: null
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
            key: 'msgStatus',
            width: 140
          },
          {
            title: '发送的总数',
            align: 'center',
            key: 'totalCount',
            width: 100,
          },
          {
            title: '过滤后总数',
            align: 'center',
            key: 'filterCount',
            width: 100
          },
          {
            title: '发送成功数',
            align: 'center',
            key: 'sendCount',
            width: 100,
          },
          {
            title: '发送失败数',
            align: 'center',
            key: 'errorCount',
            width: 100
          },
        ],
        tagNameList: [],
        listMessageMass: [],
        messageMassTotal: 10,
        listMessageMassLoading: false,
        dialogFormVisible: false,
        listMsgMassItem: [],
        msgMassTotal: 10,
        listMsgItemLoading: false,
        dialogItemFromVisible: false,
        textMap: {
          update: '修改群发消息',
          create: '新增群发消息'
        },
        listMsgMassItemQuery: {
          current: 1,
          size: 10,
          messageMassId: null
        },
        msgType: {
          text: '文本',
          image: '图片',
          voice: '语音',
          video: '视频',
          news: '图文',
          music: '音乐',
          shortvideo: '小视频消息',
          location: '地理位置消息',
          link: '链接消息'
        },
        respMsg: {
          msgType: 'text',
          content: null
        },
        temp: {
          openId: null,
          appId: null,
          name: null,
          sendAll: 1,
          sendCondition: {
            tagName: null,
            sex: 'all'
          },
          respMsg: {
            msgType: 'text',
            content: ''
          }
        },
        rules: {},
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
      getTagNameList() {
        tagList().then(res => {
          this.tagNameList = res.data
        })
      },
      getMessageMassList() {
        this.listMessageMassLoading = true
        this.listMessageMassQuery.appId = this.appId
        fetchList(this.listMessageMassQuery).then(res => {
          this.listMessageMass = res.data.records
          this.messageMassTotal = res.data.total
          this.listMessageMassLoading = false
        })
      },
      getMessageMassItemList(id) {
        this.dialogItemFromVisible = true
        this.listMsgItemLoading = true
        this.listMsgMassItemQuery.messageMassId = id
        itemList(this.listMsgMassItemQuery).then(res => {
          this.listMsgMassItem = res.data.records
          this.msgMassTotal = res.data.total
          this.listMsgItemLoading = false
        })
      },
      resetMessageMassItem() {
        this.dialogItemFromVisible = false
        this.listMsgMassItemQuery.current = 1
        getMessageMassList()
      },
      resetTemp() {
        this.temp = {
          openId: null,
          appId: null,
          name: null,
          sendAll: 1,
          sendCondition: {
            tagName: null,
            sex: 'all'
          },
          respMsg: {
            msgType: 'text',
            content: null
          }
        }
      },
      restListMessageMassQuery() {
        this.listMessageMassQuery = {
          name: null,
          type: null,
          sendAll: null,
          startTime: null,
          endTime: null,
          current: 1,
          size: 10
        }
        this.getMessageMassList()
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.resetTemp()
        // 获取标签列表
        this.getTagNameList()
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
          this.refreshData()
          this.dialogFormVisible = false
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
        if (this.temp.openId == null) {
          this.$Message.error('请输入要预览的账号')
          return
        }
        this.temp.appId = this.appId
        this.temp.respMsg = this.$refs.respMsg.formatTemp()
        preview(this.temp).then(res => {
          if (res.data === '0') {
            this.temp.openId = null
            this.$Notice.success({title: '成功', desc: '已发送预览，请查看'})
          } else if (res.data === '40132') {
            this.$Message.error('发送失败，请输入已关注的微信号')
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
        switch (this.messageMass) {
          case 'messageMass':
            this.getMessageMassList()
            break
          case 'autoReply':
            this.getAutoReplyList()
            break
        }
      },
      checkForm() {
        let checkResut = true

        if (!this.temp.name) {
          this.$Message.error('标题不能为空')
          checkResut = false
        }
        if (this.temp.sendAll == 0 && !this.temp.sendCondition.tagName) {
          this.$Message.error('标签不能为空')
          checkResut = false
        }
        return checkResut
      }
    }
  }
</script>

<style scoped>

</style>
