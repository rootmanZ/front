<template>
    <div class="editor-wrapper">
        <div :id="editorId"></div>
    </div>
</template>

<script>
    import Editor from 'wangeditor'
    import 'wangeditor/release/wangEditor.min.css'
    import {oneOf} from '@/libs/tools'

    export default {
        name: 'Editor',
        props: {
            value: {
                type: String,
                default: ''
            },
            /**
             * 绑定的值的类型, enum: ['html', 'text']
             */
            valueType: {
                type: String,
                default: 'html',
                validator: (val) => {
                    return oneOf(val, ['html', 'text'])
                }
            },
            /**
             * @description 设置change事件触发时间间隔
             */
            changeInterval: {
                type: Number,
                default: 200
            },
            /**
             * @description 是否开启本地存储
             */
            cache: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            editorId() {
                return `editor${this._uid}`
            }
        },
        methods: {
            setHtml(val) {
                this.editor.txt.html(val)
            }
        },
        mounted() {
            this.editor = new Editor(`#${this.editorId}`)
            this.editor.customConfig.onchange = (html) => {
                let text = this.editor.txt.text()
                if (this.cache) localStorage.editorCache = html
                this.$emit('input', this.valueType === 'html' ? html : text)
                this.$emit('on-change', html, text)
            }
            this.editor.customConfig.uploadImgMaxLength = 5
            this.editor.customConfig.onchangeTimeout = this.changeInterval
            this.editor.customConfig.pasteFilterStyle = false
            this.editor.customConfig.uploadImgServer = `${this.$apiBaseUrl}/file/image/multi-upload`
            this.editor.customConfig.uploadFileName = 'file'
            
            //自定义提示
            let that = this
            this.editor.customConfig.customAlert = function (info) {
                that.$Message.warning(info)
            }
            this.editor.customConfig.uploadImgHooks = {
                // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
                // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）
                customInsert: function (insertImg, result, editor) {
                    // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
                    // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
                    if(result.code !== 0){
                        that.$Message.warning(result.msg)
                        return
                    }
                    result.data.forEach(insertImg)
                }
            }
        
            // create这个方法一定要在所有配置项之后调用
            this.editor.create()
            // 如果本地有存储加载本地存储内容
            let html = this.value || localStorage.editorCache
            if (html) this.editor.txt.html(html)
        }
    }
</script>

<style lang="less">
 /*   .editor-wrapper * {
        z-index: 100 !important;
    }*/
</style>
