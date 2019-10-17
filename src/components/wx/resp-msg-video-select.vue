<template>
    <div>
        <Card v-for="(item, index) in list" class="video-item" :class="{'card-selected': temp.mediaId === item.mediaId}"  
              :key="index" @click.native="selected(item.mediaId, item.name)">
            <Row>
                <Col span="5"><Icon color="#2d8cf0" type="md-videocam" size="48"></Icon></Col>
                <Col span="19">
                    <strong class="video-title">{{item.name}}</strong>
                    <Time :time="new Date(item.updateTime)" type="datetime" class="video-date" />
                </Col>
            </Row>
        </Card>
        <Page style="clear:both" size="small" v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
              show-total show-elevator
              @on-change="getList" @on-page-size-change="getList"/>
        <Spin size="large" fix v-if="spinShow"></Spin>
    </div>
</template>

<script>
    import {fetchList} from '@/api/wx/material'
    
    export default {
        name: "resp-msg-video-select",
        props: {
            appId: {
                type: String,
                required: true
            }
        },
        data(){
            return{
                spinShow: false,
                listQuery: {
                    current: 1,
                    size: 10,
                    type: 'video',
                    appId: this.appId
                },
                list: [],
                total: 10,
                
                temp: {
                    mediaId: null,
                    name: null
                },
            }
        },
        created() {
         //   this.getList()
        },
        methods: {
            getList() {
                this.spinShow = true
                fetchList(this.listQuery).then(response => {
                    this.list = response.data.items
                    this.total = response.data.totalCount
                    this.spinShow = false
                })
            },
            selected(mediaId, name) {
                this.temp={
                    mediaId: mediaId,
                    title: name
                }
                this.$emit('enableConfirmButton')
            },
            resetTemp() {
                this.temp={
                    mediaId: null,
                    title: null
                }
            }
        }
    }
</script>

<style scoped>
    .video-item {
        position: relative;
        float: left;
        width: 300px;
        margin: 0 20px 20px 0;
        cursor: pointer;
    }
    .video-title {
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
    .video-date{
        color: #9A9A9A;
        font-size: 13px;
    }
    .card-selected{
        border-color: #2d8cf0;
    }
</style>