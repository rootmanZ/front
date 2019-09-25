<template>
    <div>
        <Tabs v-model="materialType" :animated="false" >
            <TabPane label="图片" name="image" icon="md-photos">
                <Upload
                        ref="uploadImage"
                        :show-upload-list="false"
                        :headers="uploadHeaders"
                        :data="uploadData"
                        :on-success="handleImageSuccess"
                        :format="['jpg','jpeg','png','bmp','gif']"
                        :max-size="2048"
                        :on-format-error="handleImageFormatError"
                        :on-exceeded-size="handleMaxSize"
                        multiple
                        :action="this.$apiBaseUrl+'/wx/material/add'"
                        style="text-align: right;padding-bottom: 10px">
                    <span class="upload-tips">支持bmp/png/jpeg/jpg/gif格式，大小不超过2M</span>
                    <Button type="primary" icon="ios-cloud-upload-outline">上传</Button>
                </Upload>
                <Card v-for="(item, index) in listImage" class="img-item" :bordered="false" :key="index" dis-hover>
                    <div class="img-thumb" :style="{backgroundImage: 'url(' + item.url + ')'}" @click="openImage(item.url)"></div>
                    <strong class="img-title">{{item.name}}</strong>
                    <div class="img-cover">
                        <Icon type="ios-eye-outline" size="24" @click.native="openUrl(item.url)"></Icon>
                        <Icon type="ios-trash-outline" size="24" @click.native="handleDelete(item.mediaId)"></Icon>
                    </div>
                </Card>
                <Page style="clear:both" v-show="imageTotal>0" :total="imageTotal" :current.sync="listImageQuery.current" :page-size="listImageQuery.size"
                      show-total show-sizer show-elevator :page-size-opts="[10,20]"
                      @on-change="getImageList" @on-page-size-change="getImageList"/>
            </TabPane>
            <TabPane label="语音" name="voice" icon="md-volume-up">
                <Upload
                        ref="uploadVoice"
                        :show-upload-list="false"
                        :headers="uploadHeaders"
                        :data="uploadData"
                        :on-success="handleVoiceSuccess"
                        :format="['mp3','wma','wav','amr']"
                        :max-size="2048"
                        :on-format-error="handleVoiceFormatError"
                        :on-exceeded-size="handleMaxSize"
                        multiple
                        :action="this.$apiBaseUrl+'/wx/material/add'"
                        style="text-align: right;padding-bottom: 10px">
                    <span class="upload-tips">支持mp3/wma/wav/amr格式，文件大小不超过2M，播放长度不超过60s</span>
                    <Button type="primary" icon="ios-cloud-upload-outline">上传</Button>
                </Upload>
                <Card v-for="(item, index) in listVoice" class="voice-item" :bordered="false" :key="index" dis-hover>
                        <Row>
                            <Col span="5"><Icon color="#2d8cf0" type="md-volume-up" size="48"></Icon></Col>
                            <Col span="19">                       
                                <strong class="voice-title">{{item.name}}</strong>
                                <Time :time="new Date(item.updateTime)" type="datetime" class="voice-date" />
                            </Col>
                        </Row>
                        <div class="voice-cover">
                            <Tooltip content="下载" placement="top">
                                <Icon style="margin-right: 5px" type="md-download" size="20" @click.native="download(item.mediaId, item.name)"></Icon>
                            </Tooltip>
                            <Tooltip content="删除" placement="top">
                                <Poptip
                                        confirm
                                        placement="bottom"
                                        ok-text="删除"
                                        title="确认删除吗?"
                                        @on-ok="deleteData(item.mediaId)">
                                <Icon type="md-trash" size="20"></Icon>
                                </Poptip>
                            </Tooltip>
                        </div>
                    </Card>
                <Page style="clear:both" v-show="voiceTotal>0" :total="voiceTotal" :current.sync="listVoiceQuery.current" :page-size="listVoiceQuery.size"
                      show-total show-sizer show-elevator :page-size-opts="[10,20]"
                      @on-change="getVoiceList" @on-page-size-change="getVoiceList"/>
            </TabPane>
            <TabPane label="视频" name="video" icon="md-videocam"></TabPane>
            <TabPane label="图文" name="news" icon="md-share">
                <Card v-for="(item, index) in listNews" class="news-item" :bordered="false" :key="index" dis-hover>
                    <div class="news-body" v-for="(article, articleIndex) in item.content.articles">
                        <span v-if="item.content.articles.length === 1" class="news-title">{{article.title}}</span>
                        <span v-if="item.content.articles.length !== 1 && articleIndex===0" class="news-title-cover">{{article.title}} {{articleIndex}}</span>
                        <div  class="news-thumb" :style="{backgroundImage: 'url(' + article.thumbUrl + ')'}"></div>
                        <p  class="news-desc">{{article.digest}}</p>
                        <div class="news-cover">
                            <span style="cursor: pointer" @click="openUrl(article.url)">预览文章</span>
                        </div>
                    </div>
                    <div class="news-foot">
                        更新于&nbsp;<Time :time="new Date(item.updateTime)" class="voice-date" />
                    </div>
                </Card>
                <Page style="clear:both" v-show="newsTotal>0" :total="newsTotal" :current.sync="listNewsQuery.current" :page-size="listNewsQuery.size"
                      show-total show-sizer show-elevator :page-size-opts="[10,20]"
                      @on-change="getNewsList" @on-page-size-change="getNewsList"/>
            </TabPane>
            <Spin size="large" fix v-if="spinShow"></Spin>
        </Tabs>
    </div>
</template>

<script>
    import {fetchList, download, remove} from '@/api/wx/material'
    import {getToken} from '@/libs/util'

    export default {
        name: "wx-material",
        data() {
            return {
                materialType: 'image',
                spinShow: false,
                
                listImageQuery: {
                    current: 1,
                    size: 10,
                    type: 'image'
                },
                listImage: [],
                imageTotal: 10,

                listVoiceQuery: {
                    current: 1,
                    size: 10,
                    type: 'voice'
                },
                listVoice: [],
                voiceTotal: 10,

                listNewsQuery: {
                    current: 1,
                    size: 10,
                    type: 'news'
                },
                listNews: [],
                newsTotal: 10,
                
                listSmartReplyLoading: false,
                uploadHeaders:{
                    'x-auth-token': getToken()
                }, 
                uploadData:{
                    appId: this.$route.query.appId,
                    type: this.materialType
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
                appId: this.$route.query.appId
            }
        },
        created() {
            this.getImageList()
        },
        watch: {
            materialType: function (val) {
              this.refresh()
            }
        },
        methods: {
            getImageList() {
                this.spinShow = true
                this.listImageQuery.appId = this.appId
                fetchList(this.listImageQuery).then(response => {
                    this.listImage = response.data.items
                    this.imageTotal = response.data.totalCount
                    this.spinShow = false
                })
            },
            getVoiceList() {
                this.spinShow = true
                this.listVoiceQuery.appId = this.appId
                fetchList(this.listVoiceQuery).then(response => {
                    this.listVoice = response.data.items
                    this.voiceTotal = response.data.totalCount
                    this.spinShow = false
                })
            }, 
            getNewsList() {
                this.spinShow = true
                this.listNewsQuery.appId = this.appId
                fetchList(this.listNewsQuery).then(response => {
                    this.listNews = response.data.items
                    this.newsTotal = response.data.totalCount
                    this.spinShow = false
                })
            },
            openUrl(url) {
                window.open(url)
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
                this.$nextTick(() => {
                    this.$refs['dataForm'].resetFields()
                    this.resetTemp()
                })
            },
            handleUpdate(id) {
                this.$refs['dataForm'].resetFields()
                fectchInfo(id).then(res => {
                    this.temp = Object.assign({}, res.data) // copy obj
                    this.temp.respMsg = JSON.parse(res.data.content)
                    this.dialogStatus = 'update'
                    this.dialogFormVisible = true
                })
            },
            createData() {
                // this.$refs['dataForm'].validate((valid) => {
                //     if (valid) {
                        if (!this.checkForm()) {
                            return
                        }
                        if (!this.$refs.respMsg.checkMsg()) {
                            return
                        }
                        this.temp.appId =  this.appId
                        this.temp.type =  this.replyTypeValue
                        create(this.temp).then(() => {
                            this.refreshCurrentTable()
                            this.dialogFormVisible = false
                            this.$Notice.success({title: '成功', desc: '新增成功'})
                        })
                //     }
                // })
            },
            updateData() {
                // this.$refs['dataForm'].validate((valid) => {
                //     if (valid) {
                        if (!this.checkForm()) {
                            return
                        }
                        if (!this.$refs.respMsg.checkMsg()) {
                            return
                        }
                        this.temp.appId =  this.appId
                        this.temp.type =  this.replyTypeValue
                        update(this.temp).then(() => {
                            this.refreshCurrentTable()
                            this.dialogFormVisible = false
                            this.$Notice.success({title: '成功', desc: '修改成功'})
                        })
                //     }
                // })
            },
            handleDelete(id) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '此操作将永久删除该素材, 是否继续?',
                    onOk: () =>{
                        this.deleteData(id)
                    }
                })
            },
            deleteData(id){
                remove({appId: this.appId, mediaId: id}).then(() => {
                    this.getImageList()
                    this.$Notice.success({title: '成功', desc: '删除成功'})
                })
            },
            download(id, name){
                let a = document.createElement('a')
                a.href =`${this.$apiBaseUrl}/wx/material/download?appId=${this.appId}&mediaId=${id}&fileName=${name}`
                a.click();
            },
            refresh() {
                switch (this.materialType) {
                    case 'image':
                        this.getImageList()
                        break
                    case 'voice':
                        this.getVoiceList()
                        break
                    case 'news':
                        this.getNewsList()
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
            handleImageSuccess (res, file) {
                if(res.code !== 0){
                    this.$Notice.warning({
                        title: '上传失败',
                        desc: `文件${file.name}，${res.msg}`
                    });
                    return
                }
                this.listImage.unshift({
                    url: res.data.url,
                    mediaId: res.data.mediaId,
                    name: file.name
                })
                this.imageTotal = this.imageTotal + 1
                this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
            },
            handleVoiceSuccess (res, file) {
                if(res.code !== 0){
                    this.$Notice.warning({
                        title: '上传失败',
                        desc: `文件${file.name}，${res.msg}`
                    });
                    return
                }
                this.listVoice.unshift({
                    updateTime: new Date(),
                    mediaId: res.data.mediaId,
                    name: file.name
                })
                this.voiceTotal = this.voiceTotal + 1
                this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
            },
            handleImageFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型错误',
                    desc: `文件${file.name}不是图片文件，请选择后缀为bmp/png/jpeg/jpg/gif的文件。`
                });
            },
            handleVoiceFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型错误',
                    desc: `文件${file.name}不是语音文件，请选择后缀为mp3/wma/wav/amr的文件。`
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '文件大小超出限制',
                    desc: `文件${file.name}太大, 不能超过2M。`
                });
            },
        }
    }
</script>

<style scoped>
    .upload-tips{
        margin-right: 10px;
        color: #8d8d8d;
        font-size: 14px;
    }
    .img-item {
        position: relative;
        float: left;
        width: 180px;
        margin: 0 20px 20px 0;
        text-align: center;
    }
    .img-thumb {
        display: block;
        width: 100%;
        height: auto;
        background-size: contain;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        padding-bottom: 100%;
        border: 1px solid transparent;
        border-radius: 3px;
        overflow: hidden;
    }
    .img-title {
        display: block;
        width: auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-wrap: normal;
        font-weight: 400;
        padding: 10px 10px 0;
        line-height: 36px;
    }
    .img-item:hover .img-cover{
        display: block;
    }
    .img-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
        color: #fff;
        cursor: pointer;
        line-height: 200px;
    }
    .voice-item {
        position: relative;
        float: left;
        width: 300px;
        margin: 0 20px 20px 0;
    }
    .voice-title {
        font-weight: 400;
        width: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-wrap: normal;
        min-width: 100%;
        display: block;
        font-style: normal;
        color: #2d8cf0
    }
    .voice-date{
        color: #9A9A9A;
        font-size: 13px;
    }
    .voice-item:hover .voice-cover{
        display: block;
    }
    .voice-cover{
        display: none;
        position: absolute;
        right: 10px;
        bottom: 10px;
    }
    .news-item {
        position: relative;
        float: left;
        width: 300px;
        margin: 0 20px 20px 0;
        text-align: center;
    }
    .news-title {
        text-align: left;
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: 400;
        display: block;
        line-height: 1.2;
        color: #353535;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
    }
    .news-title-cover{
        position: absolute;
        left: 16px;
        right: 16px;
        top: 132px;
        padding: 8px 12px;
        background-color: rgba(0, 0, 0, 0.55);
        font-size: 16px;
        font-weight: 400;
        line-height: 1.2;
        color: #fff;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
    }
    .news-body{
        padding-bottom: 15px;
    }
    .news-thumb{
        width: 100%;
        height: auto;
        -webkit-background-size: cover;
        background-size: cover;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-color: #F6F8F9;
        padding-bottom: 56.25%;
        display: block;
    }
    .news-desc{
        padding-top: 12px;
        color: #9A9A9A;
        text-align: left;
    }
    .news-foot{
        padding-top: 10px;
        padding-bottom: 10px;
        color: #9A9A9A;
        text-align: left;
    }
    .news-item:hover .news-cover{
        display: block;
    }
    .news-cover{
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        cursor: default;
        color: #FFFFFF;
        line-height: 300px;
    }
</style>