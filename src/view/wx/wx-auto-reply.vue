<template>
    <div>
        <Tabs v-model="replyType"  :animated="false" name="replyTab">
            <TabPane label="关键词回复" name="smartReply" tab="replyTab">
                <Row style="padding-bottom: 10px">
                    <Col span="12"><Input search placeholder="搜索关键词" v-model="listSmartReplyQuery.keyword" @on-search="getSmartReplyList" style="width: 200px"/></Col>
                    <Col span="12" style="text-align: right"> <Button  type="primary" @click="handleCreate">添加回复</Button></Col>
                </Row>
                
                <Table ref="smartReply" :data="listSmartReply" :columns="smartReplyColumns" :loading="listSmartReplyLoading"  :border="true">
                    <template slot="matchType" slot-scope="scope">
                        {{scope.row.matchType === 0? '半匹配' : '全匹配'}}
                    </template>
                    <template slot="respMsgType" slot-scope="scope">
                        {{msgTypeTextMap[scope.row.respMsgType]}}
                    </template>
                    <template slot-scope="{ row, index }" slot="action">
                        <Button type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(row.id)">修改</Button>
                        <Button type="error" size="small" @click="handleDelete(row.id)">删除</Button>
                    </template>
                </Table>
                <Page v-show="smartReplyTotal>0" :total="smartReplyTotal" :current.sync="listSmartReplyQuery.current" :page-size="listSmartReplyQuery.size"
                      show-total show-sizer show-elevator
                      @on-change="getSmartReplyList" @on-page-size-change="getSmartReplyList"/>
            </TabPane>
            <TabPane label="收到消息回复" name="autoReply" tab="replyTab">
                <Row style="padding-bottom: 10px">
                    <Col span="24" style="text-align: right"> <Button type="primary" @click="handleCreate">添加回复</Button></Col>
                </Row>
                <Table ref="smartReply" :data="listAutoReply" :columns="autoReplyColumns" :loading="listAutoReplyLoading"  :border="true">
                    <template slot="reqMsgType" slot-scope="scope">
                        {{msgTypeTextMap[scope.row.reqMsgType]}}
                    </template>
                    <template slot="respMsgType" slot-scope="scope">
                        {{msgTypeTextMap[scope.row.respMsgType]}}
                    </template>
                    <template slot-scope="{ row, index }" slot="action">
                        <Button type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(row.id)">修改</Button>
                        <Button type="error" size="small" @click="handleDelete(row.id)">删除</Button>
                    </template>
                </Table>
                <Page v-show="autoReplyTotal>0" :total="autoReplyTotal" :current.sync="listAutoReplyQuery.current" :page-size="listAutoReplyQuery.size"
                      show-total show-sizer show-elevator
                      @on-change="getAutoReplyList" @on-page-size-change="getAutoReplyList"/>
            </TabPane>
            <TabPane label="被关注回复" name="subscribeReply" style="background-color: white" tab="replyTab">
                <resp-msg ref="subscribeReplyRespMsg" :appId="appId" tabName="subscribeReplyRespMsgTab"></resp-msg>
                <div style="padding-bottom: 10px;padding-left: 20px">
                        <Button type="primary" @click="saveSubscribe">保存</Button>
                </div>
            </TabPane>
        </Tabs>
        <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :width="650">
            <Form ref="dataForm" :model="temp" :label-width="100">
                <FormItem v-show="replyType === 'smartReply'" label="关键词">
                    <Input v-model="temp.keyword" :maxlength="30"></Input>
                </FormItem>
                <FormItem v-show="replyType === 'smartReply'" label="匹配类型">
                    <Select v-model="temp.matchType" style="width:200px">
                        <Option :value="0">半匹配</Option>
                        <Option :value="1">全匹配</Option>
                    </Select>
                </FormItem>
                <FormItem v-show="replyType === 'autoReply'" label="请求消息类型">
                    <Select v-model="temp.reqMsgType" style="width:200px">
                        <Option value="text">文本消息</Option>
                        <Option value="image">图片消息</Option>
                        <Option value="voice">语音消息</Option>
                        <Option value="video">视频消息</Option>
                        <Option value="shortvideo">小视频消息</Option>
                        <Option value="location">地理位置消息</Option>
                        <Option value="link">链接消息</Option>
                    </Select>
                </FormItem>
                <FormItem label="回复消息">
                    <resp-msg ref="respMsg" size="small" :appId="appId"  tabName="respMsgTab"></resp-msg>
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
    import {create, fectchInfo, fectchSubscribeInfo, fetchList, remove, update} from '@/api/wx/auto-reply'
    import respMsg from '_c/wx/resp-msg.vue'

    export default {
        name: "wx-auto-reply",
        components: { respMsg },
        data() {
            return {
                replyType: 'smartReply',
                
                smartReplyColumns: [
                    {
                        title: '关键词',
                        align: 'center',
                        key: 'keyword'
                    },
                    {
                        title: '匹配类型',
                        align: 'center',
                        slot: 'matchType',
                    },
                    {
                        title: '回复消息类型',
                        align: 'center',
                        slot: 'respMsgType'
                    },
                    {
                        title: '操作',
                        slot: 'action',
                        width: 150,
                        align: 'center'
                    }
                ],
                listSmartReplyQuery: {
                    current: 1,
                    size: 10,
                    keyword: null,
                    type: 0
                },
                listSmartReply: [],
                smartReplyTotal: 10,
                listSmartReplyLoading: false,

                autoReplyColumns: [
                    {
                        title: '请求消息类型',
                        align: 'center',
                        slot: 'reqMsgType'
                    },
                    {
                        title: '回复消息类型',
                        align: 'center',
                        slot: 'respMsgType'
                    },
                    {
                        title: '操作',
                        slot: 'action',
                        width: 150,
                        align: 'center'
                    }
                ],
                listAutoReplyQuery: {
                    current: 1,
                    size: 10,
                    type: 1
                },
                listAutoReply: [],
                autoReplyTotal: 10,
                listAutoReplyLoading: false,
                
                dialogFormVisible: false,
                dialogStatus: '',
                textMap: {
                    update: '修改回复',
                    create: '新增回复'
                },
                msgTypeTextMap: {
                    text: '文本',
                    image: '图片',
                    voice: '语音',
                    video: '视频',
                    news: '图文',
                    music: '音乐',
                    shortvideo: '小视频消息',
                    location: '地理位置消息',
                    link: '链接消息',
                },
                temp: {
                    keyword: null,
                    matchType: 0,
                    reqMsgType: null,
                    respMsg: {
                        msgType: 'text',
                        content: null
                    }
                },
                rules: {
                    keyword: [{required: true, message: '关键词不能为空', trigger: 'blur'}],
                    // reqMsgType: [{required: true, message: '请求消息类型不能为空', trigger: 'change'}],
                },
                appId: this.$route.query.appId
            }
        },
        created() {
            this.getSmartReplyList()
        },
        watch: {
            replyType: function (val) {
                this.refreshData()
            }
        },
        computed: {
            //消息回复类型的值
            replyTypeValue: function () {
                return this.replyType === 'smartReply' ? 0 : this.replyType === 'autoReply' ? 1 : 2
            }
        },
        methods: {
            getSmartReplyList() {
                this.listSmartReplyLoading = true
                this.listSmartReplyQuery.appId = this.appId
                fetchList(this.listSmartReplyQuery).then(res => {
                    this.listSmartReply = res.data.records
                    this.smartReplyTotal = res.data.total
                    this.listSmartReplyLoading = false
                })
            },
            getAutoReplyList() {
                this.listAutoReplyLoading = true
                this.listAutoReplyQuery.appId = this.appId
                fetchList(this.listAutoReplyQuery).then(res => {
                    this.listAutoReply = res.data.records
                    this.autoReplyTotal = res.data.total
                    this.listAutoReplyLoading = false
                })
            },
            getSubscribeReply() {
                fectchSubscribeInfo(this.appId).then(res => {
                    if(res.data){
                        this.temp = Object.assign({}, res.data)
                        this.$refs.subscribeReplyRespMsg.initTemp(JSON.parse(res.data.content))
                    }else {
                        this.resetTemp()
                    }
                })
            },
            resetTemp() {
                this.temp = {
                    keyword: null,
                    matchType: 0,
                    respMsg: {
                        msgType: 'text',
                        content: null
                    }
                }
            },
            handleCreate() {
                this.dialogStatus = 'create'
                this.dialogFormVisible = true
                this.resetTemp()
                this.$refs.respMsg.initTemp(this.temp.respMsg)
            },
            handleUpdate(id) {
                fectchInfo(id).then(res => {
                    this.temp = Object.assign({}, res.data) 
                    this.$refs.respMsg.initTemp(JSON.parse(res.data.content))
                    this.dialogStatus = 'update'
                    this.dialogFormVisible = true
                })
            },
            createData() {
                if (!this.checkForm()) {
                    return
                }
                if (!this.$refs.respMsg.checkMsg()) {
                    return
                }
                this.temp.appId =  this.appId
                this.temp.type =  this.replyTypeValue
                this.temp.respMsg =this.$refs.respMsg.formatTemp()
                create(this.temp).then(() => {
                    this.refreshData()
                    this.dialogFormVisible = false
                    this.$Notice.success({title: '成功', desc: '新增成功'})
                })
            },
            updateData() {
                if (!this.checkForm()) {
                    return
                }
                if (!this.$refs.respMsg.checkMsg()) {
                    return
                }
                this.temp.appId =  this.appId
                this.temp.type =  this.replyTypeValue
                this.temp.respMsg =this.$refs.respMsg.formatTemp()
                update(this.temp).then(() => {
                            this.refreshData()
                            this.dialogFormVisible = false
                            this.$Notice.success({title: '成功', desc: '修改成功'})
                        })
            },
            saveSubscribe() {
                if (!this.$refs.subscribeReplyRespMsg.checkMsg()) {
                    return
                }
                this.temp.appId = this.appId
                this.temp.type = this.replyTypeValue
                this.temp.respMsg =this.$refs.subscribeReplyRespMsg.formatTemp()
                if (this.temp.id) {
                    update(this.temp).then(() => {
                        this.refreshData()
                        this.$Notice.success({title: '成功', desc: '保存成功'})
                    })
                } else {
                    create(this.temp).then(() => {
                        this.refreshData()
                        this.$Notice.success({title: '成功', desc: '保存成功'})
                    })
                }
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
                switch (this.replyType) {
                    case 'smartReply':
                        this.getSmartReplyList()
                        break
                    case 'autoReply':
                        this.getAutoReplyList()
                        break
                    case 'subscribeReply':
                        this.getSubscribeReply()
                        break
                }
            },
            checkForm() {
                let checkResut = true
                switch (this.replyType) {
                    case 'smartReply':
                        if (!this.temp.keyword) {
                            this.$Message.error('关键词不能为空')
                            checkResut = false
                        }
                        break
                    case 'autoReply':
                        if (!this.temp.reqMsgType) {
                            this.$Message.error('请求消息类型不能为空')
                            checkResut = false
                        }
                        break
                    case 'subscribeReply':
                        break
                    default:
                        this.$Message.error('无效的回复类型')
                        checkResut = false
                }
                return checkResut
            },
        }
    }
</script>

<style scoped>

</style>