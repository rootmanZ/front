<template>
    <div>
        <Card v-for="(item, index) in list" class="voice-item" :class="{'card-selected': temp.mediaId === item.mediaId}"  
              :key="index" @click.native="selected(item.mediaId, item.name)">
            <Row>
                <Col span="5"><Icon color="#2d8cf0" type="md-volume-up" size="48"></Icon></Col>
                <Col span="19">
                    <strong class="voice-title">{{item.name}}</strong>
                    <Time :time="new Date(item.updateTime)" type="datetime" class="voice-date" />
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
        name: "resp-msg-voice-select",
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
                    type: 'voice',
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
           // this.getList()
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
                    name: name
                }
                this.$emit('enableConfirmButton')
            },
            resetTemp() {
                this.temp={
                    mediaId: null,
                    name: null
                }
            }
        }
    }
</script>

<style scoped>
    .voice-item {
        position: relative;
        float: left;
        width: 300px;
        margin: 0 20px 20px 0;
        cursor: pointer;
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
    .card-selected{
        border-color: #2d8cf0;
    }
</style>