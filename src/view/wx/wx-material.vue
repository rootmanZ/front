<template>
    <div>
        <Tabs v-model="materialType" :animated="false" >
            <TabPane label="图文" name="news" icon="md-share">
                <Card v-for="(item, index) in listNews" class="news-item" :bordered="false" :key="index" dis-hover>
                    <div v-for="(article, articleIndex) in item.content.articles">
                        <!--第一篇图文-->
                        <div  v-if="articleIndex ===0" class="news-body">
                            <div v-if="item.content.articles.length === 1" class="news-title wx-msg">{{article.title}}</div>
                            <div class="news-thumb" :style="{backgroundImage: 'url(' + article.thumbUrl + ')'}">
                                <div v-if="item.content.articles.length !== 1" class="news-title-cover">
                                    <div class="news-title-cover-msg wx-msg">{{article.title}}</div>
                                </div>
                            </div>
                            <p v-if="item.content.articles.length === 1" class="news-desc">{{article.digest}}</p>
                            <div :class="{'news-cover' : true, 'multi-news-cover' : item.content.articles.length !== 1}">
                                <span style="cursor: pointer" @click="openUrl(article.url)">预览文章</span>
                            </div>
                        </div>
                        <!--其余图文-->
                        <div class="news-sub-body" v-if="articleIndex !==0">
                            <div class="news-sub-thumb" :style="{backgroundImage: 'url(' + article.thumbUrl + ')'}"></div>
                            <div class="wx-msg">{{article.title}}</div>
                            <div class="news-sub-cover">
                                <span style="cursor: pointer" @click="openUrl(article.url)">预览文章</span>
                            </div>
                        </div>
                    </div>
                    <!--底部-->
                    <div class="news-foot">
                        更新于&nbsp;<Time :time="new Date(item.updateTime)" class="voice-date" />
                    </div>
                </Card>
                <Page style="clear:both" v-show="newsTotal>0" :total="newsTotal" :current.sync="listNewsQuery.current" :page-size="listNewsQuery.size"
                      show-total show-sizer show-elevator :page-size-opts="[10,20]"
                      @on-change="getNewsList" @on-page-size-change="handleNewListPageSize"/>
            </TabPane>
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
                        <Icon type="md-eye" size="20" @click.native="openUrl(item.url)"></Icon>
                        <Icon type="md-trash" size="20" @click.native="handleDelete(item.mediaId)"></Icon>
                    </div>
                </Card>
                <Page style="clear:both" v-show="imageTotal>0" :total="imageTotal" :current.sync="listImageQuery.current" :page-size="listImageQuery.size"
                      show-total show-sizer show-elevator :page-size-opts="[10,20]"
                      @on-change="getImageList" @on-page-size-change="handleImagePageSize"/>
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
                                <Icon style="margin-right: 5px" type="md-download" size="20" @click.native="downloadVoice(item.mediaId, item.name)"></Icon>
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
                      @on-change="getVoiceList" @on-page-size-change="handleVoicePageSize"/>
            </TabPane>
            <TabPane label="视频" name="video" icon="md-videocam">
                <Row style="padding-bottom: 10px">
                    <Col span="24" style="text-align: right"> <Button type="primary" @click="handleCreate">添加视频</Button></Col>
                </Row>
                <Card v-for="(item, index) in listVideo" class="voice-item" :bordered="false" :key="index" dis-hover>
                    <Row>
                        <Col span="5"><Icon color="#2d8cf0" type="md-videocam" size="48"></Icon></Col>
                        <Col span="19">
                            <strong class="voice-title">{{item.name}}</strong>
                            <Time :time="new Date(item.updateTime)" type="datetime" class="voice-date" />
                        </Col>
                    </Row>
                    <div class="voice-cover">
                        <Tooltip content="查看" placement="top">
                            <Icon style="margin-right: 5px" type="md-eye" size="20" @click.native="viewVideo(item.mediaId, item.name)"></Icon>
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
                <Page style="clear:both" v-show="videoTotal>0" :total="videoTotal" :current.sync="listVideoQuery.current" :page-size="listVideoQuery.size"
                      show-total show-sizer show-elevator :page-size-opts="[10,20]"
                      @on-change="getVideoList" @on-page-size-change="handlePageSize"/>
            </TabPane>
            <Spin size="large" fix v-if="spinShow"></Spin>
        </Tabs>
        <modal title="添加视频" v-model="dialogFormVisible" :mask-closable="false" :width="650">
            <Form ref="dataForm" :rules="rules" :model="uploadData" :label-width="100">
                <FormItem label="标题" prop="title">
                    <Input v-model="uploadData.title" :maxlength="30" placeholder="标题将展示在相关播放页面，建议填写清晰、准确、生动的标题"></Input>
                </FormItem>
                <FormItem label="视频介绍" prop="introduction">
                    <Input type="textarea" :rows="5" v-model="uploadData.introduction" :maxlength="140" placeholder="介绍语将展示在相关播放页面，建议填写简洁明确、有信息量的内容"></Input>
                </FormItem>
                <FormItem label="上传视频">
                    <Upload
                            ref="uploadVideo"
                            :headers="uploadHeaders"
                            :data="uploadData"
                            :before-upload="handleVideoUpload"
                            :on-success="handleVideoSuccess"
                            :format="['mp4']"
                            :max-size="10240"
                            :on-format-error="handleVideoFormatError"
                            :on-exceeded-size="handleMaxSize"
                            multiple
                            :action="this.$apiBaseUrl+'/wx/material/add'">
                        <span class="upload-tips">支持mp4格式，文件大小不超过10M</span>
                        <Button type="primary" icon="ios-cloud-upload-outline">上传</Button>
                    </Upload>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="dialogFormVisible = false">取消</Button>
            </div>
        </modal>
    </div>
</template>

<script>
import { fetchList, remove } from '@/api/wx/material'
import { getToken } from '@/libs/util'

export default {
  name: 'wx-material',
  data () {
    return {
      materialType: 'news',
      spinShow: false,
      dialogFormVisible: false,
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

      listVideoQuery: {
        current: 1,
        size: 10,
        type: 'video'
      },
      listVideo: [],
      videoTotal: 10,

      uploadHeaders: {
        'x-auth-token': getToken()
      },
      uploadData: {
        appId: this.$route.query.appId,
        type: this.materialType,
        title: null,
        introduction: null
      },
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        introduction: [{ required: true, message: '视频介绍不能为空', trigger: 'blur' }]
      },
      appId: this.$route.query.appId
    }
  },
  created () {
    this.getNewsList()
  },
  watch: {
    materialType: function (val) {
      this.refresh()
    }
  },
  methods: {
    getImageList () {
      this.spinShow = true
      this.listImageQuery.appId = this.appId
      fetchList(this.listImageQuery).then(response => {
        this.listImage = response.data.items
        this.imageTotal = response.data.totalCount
        this.spinShow = false
      })
    },
    getVoiceList () {
      this.spinShow = true
      this.listVoiceQuery.appId = this.appId
      fetchList(this.listVoiceQuery).then(response => {
        this.listVoice = response.data.items
        this.voiceTotal = response.data.totalCount
        this.spinShow = false
      })
    },
    getNewsList () {
      this.spinShow = true
      this.listNewsQuery.appId = this.appId
      fetchList(this.listNewsQuery).then(response => {
        this.listNews = response.data.items
        this.newsTotal = response.data.totalCount
        this.spinShow = false
      })
    },
    getVideoList () {
      this.spinShow = true
      this.listVideoQuery.appId = this.appId
      fetchList(this.listVideoQuery).then(response => {
        this.listVideo = response.data.items
        this.videoTotal = response.data.totalCount
        this.spinShow = false
      })
    },
    openUrl (url) {
      window.open(url)
    },
    resetUploadData () {
      this.uploadData = {
        appId: this.appId,
        type: this.materialType,
        title: null,
        introduction: null
      }
    },
    handleVoicePageSize (value) {
      this.listQuery.size = value
      this.getVoiceList()
    },
    handleImagePageSize (value) {
      this.listQuery.size = value
      this.getImageList()
    },
    handleNewListPageSize (value) {
      this.listQuery.size = value
      this.getNewsList()
    },
    handlePageSize (value) {
      this.listQuery.size = value
      this.getVideoList()
    },
    handleCreate () {
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.resetUploadData()
      })
    },
    handleDelete (id) {
      this.$Modal.confirm({
        title: '提示',
        content: '此操作将永久删除该素材, 是否继续?',
        onOk: () => {
          this.deleteData(id)
        }
      })
    },
    deleteData (id) {
      remove({ appId: this.appId, mediaId: id }).then(() => {
        this.refresh()
        this.$Notice.success({ title: '成功', desc: '删除成功' })
      })
    },
    downloadVoice (id, name) {
      let a = document.createElement('a')
      a.href = `${this.$apiBaseUrl}/wx/material/download?appId=${this.appId}&mediaId=${id}&fileName=${name}&type=image`
      a.click()
    },
    viewVideo (id, name) {
      this.openUrl(`${this.$apiBaseUrl}/wx/material/download?appId=${this.appId}&mediaId=${id}&fileName=${name}&type=video`)
    },
    refresh () {
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
        case 'video':
          this.getVideoList()
          break
      }
    },
    handleImageSuccess (res, file) {
      if (res.code !== 0) {
        this.$Notice.warning({
          title: '上传失败',
          desc: `文件${file.name}，${res.msg}`
        })
        return
      }
      this.listImage.unshift({
        url: res.data.url,
        mediaId: res.data.mediaId,
        name: file.name
      })
      this.imageTotal = this.imageTotal + 1
      this.$Notice.success({ title: '上传成功', desc: `文件${file.name}，上传成功` })
    },
    handleVoiceSuccess (res, file) {
      if (res.code !== 0) {
        this.$Notice.warning({
          title: '上传失败',
          desc: `文件${file.name}，${res.msg}`
        })
        return
      }
      this.listVoice.unshift({
        updateTime: new Date(),
        mediaId: res.data.mediaId,
        name: file.name
      })
      this.voiceTotal = this.voiceTotal + 1
      this.$Notice.success({ title: '上传成功', desc: `文件${file.name}，上传成功` })
    },
    handleVideoSuccess (res, file) {
      if (res.code !== 0) {
        this.$Notice.warning({
          title: '上传失败',
          desc: `文件${file.name}，${res.msg}`
        })
        return
      }
      this.dialogFormVisible = false
      this.getVideoList()
      this.$Notice.success({ title: '上传成功', desc: `文件${file.name}，上传成功` })
    },
    handleImageFormatError (file) {
      this.$Notice.warning({
        title: '文件类型错误',
        desc: `文件${file.name}不是图片文件，请选择后缀为bmp/png/jpeg/jpg/gif的文件。`
      })
    },
    handleVoiceFormatError (file) {
      this.$Notice.warning({
        title: '文件类型错误',
        desc: `文件${file.name}不是语音文件，请选择后缀为mp3/wma/wav/amr的文件。`
      })
    },
    handleVideoFormatError (file) {
      this.$Notice.warning({
        title: '文件类型错误',
        desc: `文件${file.name}是不支持的视频文件，请选择后缀为mp4的文件。`
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '文件大小超出限制',
        desc: `文件${file.name}太大, 不能超过2M。`
      })
    },
    handleVideoUpload (file) {
      this.$refs['dataForm'].validate()
      if (this.uploadData.title && this.uploadData.introduction) {
        return true
      }
      return false
    }
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
    .news-content{
        max-width: 1000px;
    }
    .news-title {
        margin-bottom: 20px;
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
    .news-body{
        position: relative;
        padding-bottom: 15px;
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
    .news-body:hover .news-cover{
        display: block;
    }
    .news-cover{
        display: none;
        position: absolute;
        top: -16px;
        left: -16px;
        right: -16px;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        cursor: default;
        color: #FFFFFF;
        line-height: 250px;
    }
    .multi-news-cover{
        line-height: 150px !important;
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
    .news-sub-cover{
        display: none;
        position: absolute;
        top: 0;
        left: -16px;
        right: -16px;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        cursor: default;
        color: #FFFFFF;
        line-height: 85px;
        text-align: center;
    }
    .news-sub-body:hover .news-sub-cover{
        display: block;
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
