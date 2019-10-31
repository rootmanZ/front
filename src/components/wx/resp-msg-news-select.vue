<template>
    <div>
        <Card v-for="(item, index) in list" class="news-item" :class="{'card-selected': temp.mediaId === item.mediaId}"
              :key="index" @click.native="selected(item)">
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
                </div>
                <!--其余图文-->
                <div class="news-sub-body" v-if="articleIndex !==0">
                    <div class="news-sub-thumb" :style="{backgroundImage: 'url(' + article.thumbUrl + ')'}"></div>
                    <div class="wx-msg">{{article.title}}</div>
                </div>
            </div>
        </Card>
        <Page style="clear:both" size="small" v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-elevator
              @on-change="getList" @on-page-size-change="getList"/>
        <Spin size="large" fix v-if="spinShow"></Spin>
    </div>
</template>

<script>
import { fetchList } from '@/api/wx/material'

export default {
  name: 'resp-msg-news-select',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      spinShow: false,
      listQuery: {
        current: 1,
        size: 10,
        type: 'news',
        appId: this.appId
      },
      list: [],
      total: 10,

      temp: {
        mediaId: null,
        name: null
      }
    }
  },
  created () {
    //  this.getList()
  },
  methods: {
    getList () {
      this.spinShow = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.totalCount
        this.spinShow = false
      })
    },
    selected (item) {
      this.temp = {
        mediaId: item.mediaId,
        articles: item.content.articles
      }
      this.$emit('enableConfirmButton')
    },
    resetTemp () {
      this.temp = {
        mediaId: null,
        articles: null
      }
    }
  }
}
</script>

<style scoped>
    .news-item {
        position: relative;
        float: left;
        width: 300px;
        margin: 0 10px 20px 10px;
        text-align: center;
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
    .card-selected{
        border-color: #2d8cf0;
    }
</style>
