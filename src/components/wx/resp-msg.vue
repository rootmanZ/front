<template>
    <Tabs  v-model="msg.msgType" :size="size" :animated="animated" :name="tabName">
        <TabPane label="文本" icon="md-text" name="text" :tab="tabName">
            <Input v-model="msg.content" style="padding-bottom: 20px" type="textarea" :rows="4"/>
        </TabPane>
        <TabPane label="图片" name='image' icon="md-photos" :tab="tabName">标签二的内容</TabPane>
        <TabPane label="语音" name="voice" icon="md-volume-up" :tab="tabName">标签三的内容</TabPane>
        <TabPane label="视频" name="video" icon="md-videocam" :tab="tabName">标签三的内容</TabPane>
        <TabPane label="图文" name="news" icon="md-share" :tab="tabName">标签三的内容</TabPane>
        <TabPane label="音乐" name="music" icon="md-musical-note" :tab="tabName">标签三的内容</TabPane>
    </Tabs>
</template>

<script>
    export default {
        name: 'resp-msg',
        props: {
            msg: {
                type: Object,
                default: () => {}
            },
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
            }
        },
        methods: {
            checkMsg() {
                let checkResut = true
                switch (this.msg.msgType) {
                    case 'text':
                        if (!this.msg.content) {
                            this.$Message.error('文本内容不能为空')
                            checkResut = false
                        }
                        break
                    default:
                        this.$Message.error('无效的回复消息类型')
                        checkResut = false
                }
                return checkResut
            }
        }
    }
</script>

<style scoped>

</style>