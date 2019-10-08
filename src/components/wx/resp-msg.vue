<template>
    <Tabs v-model="temp.msgType" :size="size" :animated="animated" :name="tabName">
        <TabPane label="文本" icon="md-text" name="text" :tab="tabName">
            <div class="tab-content">
             <Input v-model="temp.content"  type="textarea" :rows="6"/>
            </div>
        </TabPane>
        <TabPane label="图片" name='image' icon="md-photos" :tab="tabName">
            <div class="tab-content">
                <Row v-if="!temp.imgUrl">
                    <Col span="11">
                        <Card>
                            <div class="card-wrap">
                                <div class="card-content">
                                    <img class="card-img" src="../../assets/images/icon_add_gray.png" height="36" width="36" @click="openSelectedImg"/>
                                    <p class="card-msg">从素材库中选择</p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span="11" offset="2">
                        <Card>
                            <div class="card-wrap">
                                <div class="card-content">
                                    <Upload
                                            ref="uploadImage"
                                            :headers="uploadHeaders"
                                            :data="uploadImageData"
                                            :on-success="handleImageSuccess"
                                            :format="['jpg','jpeg','png','bmp','gif']"
                                            :max-size="2048"
                                            :on-format-error="handleImageFormatError"
                                            :on-exceeded-size="handleMaxSize"
                                            :action="this.$apiBaseUrl+'/wx/material/add'">
                                        <img class="card-img" src="../../assets/images/icon_add_gray.png" height="36" width="36"/>
                                    </Upload>
                                    <p class="card-msg">上传图片</p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <div v-else class="media-img-wrap">
                    <div class="media-img" :style="{backgroundImage: 'url(' + temp.imgUrl + ')'}"></div>
                    <div class="media-opr">
                        <Tooltip content="编辑" placement="top">
                            <Button shape="circle" icon="ios-create" @click="openSelectedImg"></Button>
                        </Tooltip>
                        <Tooltip content="删除" placement="top">
                            <Button style="margin: 0 5px" shape="circle" icon="md-trash" @click="removeSelectedImg"></Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TabPane>
        <TabPane label="语音" name="voice" icon="md-volume-up" :tab="tabName">
            <div class="tab-content">
                <Row v-if="!temp.voiceName">
                    <Col span="11">
                        <Card>
                            <div class="card-wrap">
                                <div class="card-content">
                                    <img class="card-img" src="../../assets/images/icon_add_gray.png" height="36" width="36" @click="openSelectedVoice"/>
                                    <p class="card-msg">从素材库中选择</p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span="11" offset="2">
                        <Card>
                            <div class="card-wrap">
                                <div class="card-content">
                                    <Upload
                                            ref="uploadVoice"
                                            :headers="uploadHeaders"
                                            :data="uploadImageData"
                                            :on-success="handleVoiceSuccess"
                                            :format="['mp3','wma','wav','amr']"
                                            :max-size="2048"
                                            :on-format-error="handleVoiceFormatError"
                                            :on-exceeded-size="handleMaxSize"
                                            :action="this.$apiBaseUrl+'/wx/material/add'">
                                        <img class="card-img" src="../../assets/images/icon_add_gray.png" height="36" width="36"/>
                                    </Upload>
                                    <p class="card-msg">上传语音</p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <div v-else class="media-img-wrap">
                    <div class="media-voice">
                        <Card dis-hover>
                            <Row>
                                <Col span="5"><Icon color="#2d8cf0" type="md-volume-up" size="48"></Icon></Col>
                                <Col span="19">
                                    <strong class="voice-title">{{temp.voiceName}}</strong>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                    <div class="media-opr">
                        <Tooltip content="编辑" placement="top">
                            <Button shape="circle" icon="ios-create" @click="openSelectedVoice"></Button>
                        </Tooltip>
                        <Tooltip content="删除" placement="top">
                            <Button style="margin: 0 5px" shape="circle" icon="md-trash" @click="removeSelectedVoice"></Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TabPane>
        <TabPane label="视频" name="video" icon="md-videocam" :tab="tabName">
            <div class="tab-content">
                <Row v-if="!temp.videoTitle">
                    <Col span="24">
                        <Card>
                            <div class="card-wrap">
                                <div class="card-content">
                                    <img class="card-img" src="../../assets/images/icon_add_gray.png" height="36" width="36" @click="openSelectedVideo"/>
                                    <p class="card-msg">从素材库中选择</p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <div v-else class="media-img-wrap">
                    <div class="media-voice">
                        <Card dis-hover>
                            <Row>
                                <Col span="5"><Icon color="#2d8cf0" type="md-videocam" size="48"></Icon></Col>
                                <Col span="19">
                                    <strong class="voice-title">{{temp.videoTitle}}</strong>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                    <div class="media-opr">
                        <Tooltip content="编辑" placement="top">
                            <Button shape="circle" icon="ios-create" @click="openSelectedVideo"></Button>
                        </Tooltip>
                        <Tooltip content="删除" placement="top">
                            <Button style="margin: 0 5px" shape="circle" icon="md-trash" @click="removeSelectedVideo"></Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TabPane>
        <TabPane label="图文" name="news" icon="md-share" :tab="tabName">
            <div class="tab-content">
                <Row v-if="!temp.newsArticles || temp.newsArticles.length === 0">
                    <Col span="24">
                        <Card>
                            <div class="card-wrap">
                                <div class="card-content">
                                    <img class="card-img" src="../../assets/images/icon_add_gray.png" height="36" width="36" @click="openSelectedNews"/>
                                    <p class="card-msg">从素材库中选择</p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <div v-else class="media-img-wrap">
                    <div class="media-voice">
                        <Card dis-hover>
                            <div v-for="(article, articleIndex) in temp.newsArticles">
                                <!--第一篇图文-->
                                <div  v-if="articleIndex ===0" class="news-body">
                                    <div v-if="temp.newsArticles.length === 1" class="news-title wx-msg">{{article.title}}</div>
                                    <div class="news-thumb" :style="{backgroundImage: 'url(' + article.picUrl + ')'}">
                                        <div v-if="temp.newsArticles.length !== 1" class="news-title-cover">
                                            <div class="news-title-cover-msg wx-msg">{{article.title}}</div>
                                        </div>
                                    </div>
                                    <p v-if="temp.newsArticles.length === 1" class="news-desc">{{article.description}}</p>
                                </div>
                                <!--其余图文-->
                                <div class="news-sub-body" v-if="articleIndex !==0">
                                    <div class="news-sub-thumb" :style="{backgroundImage: 'url(' + article.picUrl + ')'}"></div>
                                    <div class="wx-msg">{{article.title}}</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div class="media-opr">
                        <Tooltip content="编辑" placement="top">
                            <Button shape="circle" icon="ios-create" @click="openSelectedNews"></Button>
                        </Tooltip>
                        <Tooltip content="删除" placement="top">
                            <Button style="margin: 0 5px" shape="circle" icon="md-trash" @click="removeSelectedNews"></Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TabPane>
        <TabPane label="音乐" name="music" icon="md-musical-note" :tab="tabName">
            <div class="tab-content">敬请期待...</div></TabPane>
        <modal title="选择图片" v-model="dialogImageSelectedVisible" :mask-closable="false" :width="800">
            <resp-msg-img-select ref="imgSelect" :appId="appId" @enableConfirmButton="imgConfirmButtonDisable = false"></resp-msg-img-select>
            <div slot="footer">
                <Button @click="dialogImageSelectedVisible = false">取消</Button>
                <Button type="primary" :disabled="imgConfirmButtonDisable" @click="selectedImg">确定</Button>
            </div>
        </modal> 
        <modal title="选择语音" v-model="dialogVoiceSelectedVisible" :mask-closable="false" :width="800">
            <resp-msg-voice-select ref="voiceSelect" :appId="appId" @enableConfirmButton="voiceConfirmButtonDisable = false"></resp-msg-voice-select>
            <div slot="footer">
                <Button @click="dialogVoiceSelectedVisible = false">取消</Button>
                <Button type="primary" :disabled="voiceConfirmButtonDisable" @click="selectedVoice">确定</Button>
            </div>
        </modal>
        <modal title="选择视频" v-model="dialogVideoSelectedVisible" :mask-closable="false" :width="800">
            <resp-msg-video-select ref="videoSelect" :appId="appId" @enableConfirmButton="videoConfirmButtonDisable = false"></resp-msg-video-select>
            <div slot="footer">
                <Button @click="dialogVideoSelectedVisible = false">取消</Button>
                <Button type="primary" :disabled="videoConfirmButtonDisable" @click="selectedVideo">确定</Button>
            </div>
        </modal>
        <modal title="选择图文" v-model="dialogNewsSelectedVisible" :mask-closable="false" :width="672">
            <resp-msg-news-select ref="newsSelect" :appId="appId" @enableConfirmButton="newsConfirmButtonDisable = false"></resp-msg-news-select>
            <div slot="footer">
                <Button @click="dialogNewsSelectedVisible = false">取消</Button>
                <Button type="primary" :disabled="newsConfirmButtonDisable" @click="selectedNews">确定</Button>
            </div>
        </modal>

    </Tabs>
</template>

<script>
    import {getToken} from '@/libs/util'
    import RespMsgImgSelect from "./resp-msg-img-select";
    import RespMsgVoiceSelect from "./resp-msg-voice-select";
    import RespMsgVideoSelect from "./resp-msg-video-select";
    import RespMsgNewsSelect from "./resp-msg-news-select";

    export default {
        name: 'resp-msg',
        components: {RespMsgNewsSelect, RespMsgVideoSelect, RespMsgVoiceSelect, RespMsgImgSelect},
        props: {
            size: {
                type: String,
                default: 'default'
            },
            animated: {
                type: Boolean,
                default: false
            },
            tabName: {
                type: String,
                default: 'respMsgTab'
            },
            appId: {
                type: String,
                required: true
            },
        },
        data() {
            return {
                dialogImageSelectedVisible: false,
                imgConfirmButtonDisable: true,
                dialogVoiceSelectedVisible: false,
                voiceConfirmButtonDisable: true,
                dialogVideoSelectedVisible: false,
                videoConfirmButtonDisable: true, 
                dialogNewsSelectedVisible: false,
                newsConfirmButtonDisable: true,
                uploadHeaders:{
                    'x-auth-token': getToken()
                },
                uploadImageData: {
                    appId: this.appId,
                    type: 'image',
                },
                uploadVoiceData: {
                    appId: this.appId,
                    type: 'voice',
                },
                temp: {
                    msgType: null,
                    content:null,
                    imgUrl: null,
                    imgMediaId: null,
                    voiceName: null,
                    voiceMediaId: null,
                    videoTitle: null,
                    videoMediaId: null,
                    newsArticles: null
                }
            }
            
        },
        methods: {
            initTemp(respMsg){
                switch (respMsg.msgType) {
                    case 'text':
                       this.temp={
                           msgType: respMsg.msgType,
                           content: respMsg.content
                       }
                        break
                    case 'image':
                        this.temp={
                            msgType: respMsg.msgType,
                            imgMediaId: respMsg.mediaId,
                            imgUrl: respMsg.url
                        }
                        break
                    case 'voice':
                        this.temp={
                            msgType: respMsg.msgType,
                            voiceMediaId: respMsg.mediaId,
                            voiceName: respMsg.title
                        }
                        break 
                    case 'video':
                        this.temp={
                            msgType: respMsg.msgType,
                            videoMediaId: respMsg.mediaId,
                            videoTitle: respMsg.title
                        }
                        break
                    case 'news':
                        this.temp={
                            msgType: respMsg.msgType,
                            newsArticles: respMsg.articles
                        }
                        break
                    default:
                        this.temp={}
                }
            },
            formatTemp(){
                let result = {
                    msgType: this.temp.msgType
                }
                switch (this.temp.msgType) {
                    case 'text':
                       result.content = this.temp.content
                        break
                    case 'image':
                        result.url = this.temp.imgUrl
                        result.mediaId = this.temp.imgMediaId
                        break
                    case 'voice':
                        result.title = this.temp.voiceName
                        result.mediaId = this.temp.voiceMediaId
                        break 
                    case 'video':
                        result.title = this.temp.videoTitle
                        result.mediaId = this.temp.videoMediaId
                        break
                    case 'news':
                        result.articles = this.temp.newsArticles
                        break
                }
                return result
            },
            checkMsg() {
                let checkResut = true
                switch (this.temp.msgType) {
                    case 'text':
                        if (!this.temp.content) {
                            this.$Message.error('文本内容不能为空')
                            checkResut = false
                        }
                        break 
                    case 'image':
                        if (!this.temp.imgMediaId) {
                            this.$Message.error('请添加素材')
                            checkResut = false
                        }
                        break
                    case 'voice':
                        if (!this.temp.voiceMediaId) {
                            this.$Message.error('请添加素材')
                            checkResut = false
                        }
                        break 
                    case 'video':
                        if (!this.temp.videoMediaId) {
                            this.$Message.error('请添加素材')
                            checkResut = false
                        }
                        break 
                    case 'news':
                        if (!this.temp.newsArticles || this.temp.newsArticles.length===0) {
                            this.$Message.error('请添加素材')
                            checkResut = false
                        }
                        break
                    default:
                        this.$Message.error('无效的回复消息类型')
                        checkResut = false
                }
                return checkResut
            },
            selectedImg(){
                let selectedData = this.$refs.imgSelect.temp
                this.temp.imgMediaId = selectedData.mediaId
                this.temp.imgUrl = selectedData.url
                this.dialogImageSelectedVisible = false
            },
            selectedVoice(){
                let selectedData = this.$refs.voiceSelect.temp
                this.temp.voiceMediaId = selectedData.mediaId
                this.temp.voiceName = selectedData.name
                this.dialogVoiceSelectedVisible = false
            }, 
            selectedVideo(){
                let selectedData = this.$refs.videoSelect.temp
                this.temp.videoMediaId = selectedData.mediaId
                this.temp.videoTitle = selectedData.title
                this.dialogVideoSelectedVisible = false
            },
            selectedNews(){
                let selectedData = this.$refs.newsSelect.temp
                this.temp.newsArticles = selectedData.articles.map(
                    article => {
                        return {
                            title: article.title,
                            description: article.digest,
                            picUrl: article.thumbUrl,
                            url: article.url
                        }
                    }
                )
                this.dialogNewsSelectedVisible = false
            },
            openSelectedImg() {
                this.$refs.imgSelect.resetTemp()
                this.dialogImageSelectedVisible = true
                this.imgConfirmButtonDisable = true
            },
            openSelectedVoice() {
                this.$refs.voiceSelect.resetTemp()
                this.dialogVoiceSelectedVisible = true
                this.voiceConfirmButtonDisable = true
            },
            openSelectedVideo() {
                this.$refs.videoSelect.resetTemp()
                this.dialogVideoSelectedVisible = true
                this.videoConfirmButtonDisable = true
            },
            openSelectedNews() {
                this.$refs.newsSelect.resetTemp()
                this.dialogNewsSelectedVisible = true
                this.newsConfirmButtonDisable = true
            },
            removeSelectedImg() {
                this.temp = Object.assign({}, this.temp, {
                    imgMediaId: null,
                    imgUrl: null
                })
            },
            removeSelectedVoice() {
                this.temp = Object.assign({}, this.temp, {
                    voiceMediaId: null,
                    voiceName: null
                })
            }, 
            removeSelectedVideo() {
                this.temp = Object.assign({}, this.temp, {
                    videoMediaId: null,
                    videoTitle: null
                })
            },
            removeSelectedNews() {
                this.temp = Object.assign({}, this.temp, {
                    newsArticles: null
                })
            },
            handleImageSuccess (res, file) {
                if(res.code !== 0){
                    this.$Notice.warning({
                        title: '上传失败',
                        desc: `文件${file.name}，${res.msg}`
                    })
                    return
                }
                this.temp.imgMediaId = res.data.mediaId
                this.temp.imgUrl = res.data.url
                this.$refs.uploadImage.clearFiles()
                this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
            },
            handleVoiceSuccess (res, file) {
                if(res.code !== 0){
                    this.$Notice.warning({
                        title: '上传失败',
                        desc: `文件${file.name}，${res.msg}`
                    })
                    return
                }
                this.temp.voiceMediaId = res.data.mediaId
                this.temp.voiceName = file.name
                this.$refs.uploadVoice.clearFiles()
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
    .tab-content{
        padding: 0 20px 20px 20px;
    }
    .card-wrap {
        position: relative;
        height: 120px;
        text-align: center;
    }
    .card-wrap:after, .media-opr:after{
        content: " ";
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 100%;
        overflow: hidden;
    }
    .card-content {
        vertical-align: middle;
        display: inline-block;
        margin: 0 10px;
    }
    .card-img{
        cursor: pointer;
    }
    .card-msg{
        color: #9A9A9A;
    }
    .media-img-wrap{
        display: inline-block;
        vertical-align: middle;
        position: relative;
    }
    .media-img{
        display: block;
        border: 1px solid #E4E8EB;
        width: 180px;
        height: 120px;
        background-size: contain;
        background-position: 50% 50%;
        background-repeat: no-repeat;
    }
    .media-voice{
        display: block;
        width: 300px;
        background-size: contain;
        background-position: 50% 50%;
        background-repeat: no-repeat;
    }
    .media-opr{
        position: absolute;
        left: 100%;
        top: 0;
        bottom: 0;
        display: none;
        padding-left: 15px;
        transition: opacity .3s;
        white-space: nowrap;
        
    }
    .media-img-wrap:hover .media-opr{
        display: block;
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
        color: #2d8cf0;
        line-height: 48px;
    }
    
    .news-body{
        position: relative;
        padding-bottom: 15px;
    }
    .news-title {
        margin-bottom: 20px;
    }
    .news-thumb{
        position: relative;
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
    .news-title-cover{
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 8px 12px;
        background-color: rgba(0, 0, 0, 0.55);
    }
    .news-title-cover-msg{
        color: #fff !important;
    }
    .news-desc{
        padding-top: 12px;
        color: #9A9A9A;
        text-align: left;
    }
    .news-sub-thumb{
        float: right;
        margin-left: 12px;
        width: 60px;
        height: 60px;
        -webkit-background-size: cover;
        background-size: cover;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-color: #F6F8F9;
    }
    .news-sub-body{
        width: 100%;
        border-top: 1px solid #E4E8EB;
        padding-top: 12px;
        padding-bottom: 12px;
        position: relative;
    }
    .news-sub-body:after{
        content: "\200B";
        display: block;
        height: 0;
        clear: both;
    }
    .wx-msg{
        text-align: left;
        font-size: 16px;
        font-weight: 400;
        display: block;
        line-height: 1.2;
        color: #353535;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
    }
</style>