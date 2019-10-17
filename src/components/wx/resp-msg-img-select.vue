<template>
    <div>
        <div class="img-list">
            <div v-for="(item, index) in listImage" class="img-item"  :key="index" >
                <div class="img-thumb" :class="{'img-thumb-selected': temp.mediaId === item.mediaId}" :style="{backgroundImage: 'url(' + item.url + ')'}" @click="selectedImg(item.mediaId, item.url)"></div>
                <strong class="img-title">{{item.name}}</strong>
            </div>
            <Page style="clear: both; text-align: right" size="small" v-show="imageTotal>0" :total="imageTotal" :current.sync="listImageQuery.current" :page-size="listImageQuery.size"
                  show-total show-elevator
                  @on-change="getList" @on-page-size-change="getList"/>
        </div>
        <Spin size="large" fix v-if="spinShow"></Spin>
    </div>
</template>

<script>
    import {fetchList} from '@/api/wx/material'
    
    export default {
        name: "resp-msg-img-select",
        props: {
            appId: {
                type: String,
                required: true
            }
        },
        data(){
            return{
                spinShow: false,
                listImageQuery: {
                    current: 1,
                    size: 10,
                    type: 'image',
                    appId: this.appId
                },
                listImage: [],
                imageTotal: 10,
                temp: {
                    mediaId: null,
                    url: null
                },
            }
        },
        created() {
            //this.getList()
        },
        methods: {
            getList() {
                this.spinShow = true
                fetchList(this.listImageQuery).then(response => {
                    this.listImage = response.data.items
                    this.imageTotal = response.data.totalCount
                    this.spinShow = false
                })
            },
            selectedImg(mediaId, url) {
                this.temp={
                    mediaId: mediaId,
                    url: url
                }
                this.$emit('enableConfirmButton')
            },
            resetTemp() {
                this.temp={
                    mediaId: null,
                    url: null
                }
            }
        }
    }
</script>

<style scoped>
    .img-list{
        margin: 0 auto;
        width: 620px;
        overflow: auto;
    }
    .img-item{
        cursor: pointer;
        position: relative;
        float: left;
        width: 110px;
        margin: 0 13px 20px 0;
    }
    .img-thumb:hover{
        border-color: #2d8cf0;
    }
    .img-thumb{
        position: relative;
        display: block;
        width: 110px;
        height: 110px;
        -webkit-background-size: contain;
        background-size: contain;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        box-sizing: border-box;
        border: 2px solid transparent;
        border-radius: 2px;
        overflow: hidden;
    }
    .img-thumb-selected{
        border-color: #2d8cf0;
    }
    .img-title{
        margin-top: 8px;
        display: block;
        width: auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-wrap: normal;
        font-weight: 400;
        line-height: 20px;
        text-align: center;
    }
</style>