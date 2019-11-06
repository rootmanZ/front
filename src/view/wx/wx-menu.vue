<template>
    <div>
        <div class="wrapper">
            <div class="left">
                <div>
                    <div class="weixin-hd">
                        <div class="weixin-title">{{ $route.query.appName }}</div>
                    </div>
                    <div class="weixin-space"></div>
                    <div class="weixin-menu">
                        <Row>
                            <Col span="8" v-for="(button, menuIndex) in menus.button" :key="`${menuIndex}`">
                                <div class="menu_text" :class="{menu_active: activeClass === `${menuIndex}`}">
                                    <div class="menu_name" @click="selectedMenu(menuIndex, true)">{{button.name || '菜单名称'}}</div>
                                    <div class="sub_menu" v-show="selectMenuIndex === menuIndex">
                                        <div v-for="(subButton, subMenuIndex) in button.sub_button"
                                             :key="`${menuIndex}_${subMenuIndex}`"
                                             class="sub_title"
                                             :class="{menu_active: activeClass === `${menuIndex}_${subMenuIndex}`}">
                                            <div class="menu_subItem menu_text"
                                                 @click="selectedSubMenu(menuIndex, subMenuIndex, true)">
                                                {{subButton.name || '子菜单名称'}}
                                            </div>
                                        </div>
                                        <div class="sub_title"
                                             v-show="!button || !(button.sub_button && button.sub_button.length === 5)">
                                            <div class="menu_subItem" @click="addSubMenu(menuIndex)">
                                                <Icon type="md-add" size="18"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col :span="(3-menus.button.length) * 8" v-show="menus.button.length !== 3">
                                <div class="menu_text">
                                    <div class="menu_name" @click="addMenu">
                                        <Icon type="md-add" size="18"/>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div class="tool-bar">
                    <Button v-show="$viewAccess('wx:appInfo:add') && menus.button && menus.button.length>0" type="success" @click="saveAndPublish">
                        保存并发布
                    </Button>
                </div>
            </div>
            <div class="right">
                <div v-show="selectMenuType" class="menu_form_hd">
                    <span>{{temp.name}}</span>
                    <a @click="delMenu">{{selectMenuType === 'menu' ? '删除菜单' : '删除子菜单'}}</a>
                </div>
                <Form v-show="selectMenuType" :rules="rules" :model="temp" ref="dataForm" :label-width="80">
                    <FormItem label="菜单名称" prop="name">
                        <Input v-model="temp.name" :maxlength="menuNameMaxLength"></Input>
                    </FormItem>
                    <FormItem label="菜单内容" v-show="selectMenuType === 'subMenu' 
                    || (selectMenuIndex !== null && (!menus.button[selectMenuIndex].sub_button || menus.button[selectMenuIndex].sub_button.length===0))">
                        <Select v-model="menuContentType">
                            <Option :value="0">跳转链接</Option>
                            <Option :value="1">跳转小程序</Option>
                            <Option :value="2">点击回复</Option>
                        </Select>
                    </FormItem>
                    <div class="menu_content" v-show="menuContentType || menuContentType === 0">
                        <FormItem v-show="menuContentType === 0" label="跳转链接" prop="url">
                            <Input v-model="temp.url"></Input>
                        </FormItem>
                        <FormItem v-show="menuContentType === 1" label="小程序appid">
                            <Input v-model="temp.appid"></Input>
                        </FormItem>
                        <FormItem v-show="menuContentType === 1" label="小程序页面路径">
                            <Input v-model="temp.pagepath"></Input>
                        </FormItem>
                        <FormItem v-show="menuContentType === 1" label="备用网页" prop="url">
                            <Input v-model="temp.url"></Input>
                        </FormItem>
                        <resp-msg v-show="menuContentType === 2" ref="respMsg" :appId="appId" ></resp-msg>
                    </div>
                </Form>
                <div class="menu_form_empty" v-show="!selectMenuType">点击左侧菜单进行编辑操作</div>
            </div>

        </div>
    </div>
</template>

<script>
    import {fectchInfo, save} from '@/api/wx/menu'
    import respMsg from '_c/wx/resp-msg.vue'

    export default {
        name: "wx-menu",
        components: { respMsg },
        data: function () {
            return {
                activeClass: '-1', // 当前选中的目录（修改样式）
                selectMenuIndex: null, // 当前选中的主目录索引
                selectSubMenuIndex: null, // 当前选中的字目录索引
                selectMenuType: null, // 当前选中目录的类型 menu 主目录 subMenu 子目录
                menuContentType: null, //菜单内容类型
                menuNameMaxLength: 4, //菜单名称最大长度
                menus: {
                    button: []
                },
                temp: {
                    name: '菜单名称',
                    key: null,
                    type: null,
                    url: null,
                    appid: null,
                    pagepath: null,
                    respMsg: {
                        msgType: 'text',
                        content: null
                    }
                },
                rules: {
                    name: [{required: true, message: '菜单名称不能为空', trigger: 'blur'}],
                    url: [{ type: 'url', message: 'URL格式错误', trigger: 'change' }]
                },
                menuId: null, //当前菜单的数据库主键
                appId: this.$route.query.appId
            }
        },
        watch: {
            menuContentType: function(val) {
                switch (val) {
                    case 0:
                        this.temp.type = 'view'
                        this.temp.key = null
                        this.temp.appid = null
                        this.temp.pagepath = null
                        this.temp.respMsg = null
                        break
                    case 1:
                        this.temp.type = 'miniprogram'
                        this.temp.key = null
                        this.temp.respMsg = null
                        break
                    case 2:
                        this.temp.type = 'click'
                        this.temp.appid = null
                        this.temp.pagepath = null
                        this.temp.url = null
                        if(!this.temp.respMsg){
                            this.temp.respMsg={
                                msgType: 'text'
                            }
                        }
                        this.$refs.respMsg.initTemp(this.temp.respMsg)
                        break
                    default:
                        this.temp.type = null
                }
            }
        },
        created() {
            this.getMenu()
        },
        methods: {
            getMenu() {
                fectchInfo(this.appId).then(response => {
                    if (response.data) {
                        this.menus = JSON.parse(response.data.content)
                        this.menuId = response.data.id
                    }
                })
            },
            selectedMenu(index, checkForm) {
                if(checkForm){
                    //切换时如果当前是选中状态则校验表单
                    if (this.activeClass !== '-1' && !this.checkForm()) {
                        return
                    }
                }
                this.selectMenuIndex = index
                this.selectSubMenuIndex = null
                this.activeClass = `${index}`
                this.selectMenuType = 'menu'
                this.menuNameMaxLength = 4
                this.temp = this.menus.button[index] ? this.menus.button[index] : []
                if (!this.temp.sub_button || this.temp.sub_button.length === 0) {
                    this.calcMenuContentType(this.temp.type)
                } else {
                    this.menuContentType = null
                }
            },
            selectedSubMenu(menuIndex, subMenuIndex, checkForm) {
                if(checkForm){
                    //切换时如果当前是选中状态则校验表单
                    if (this.activeClass !== '-1' && !this.checkForm()) {
                        return
                    }
                }
                this.selectMenuIndex = menuIndex
                this.selectSubMenuIndex = subMenuIndex
                this.activeClass = `${menuIndex}_${subMenuIndex}`
                this.selectMenuType = 'subMenu'
                this.menuNameMaxLength = 6
                this.temp = this.menus.button[menuIndex].sub_button[subMenuIndex]
                this.calcMenuContentType(this.temp.type)
            },
            calcMenuContentType(type){
                switch (type) {
                    case 'click':
                        this.menuContentType = 2
                        this.$refs.respMsg.initTemp(this.temp.respMsg)
                        break
                    case 'view':
                        this.menuContentType = 0
                        break
                    case 'miniprogram':
                        this.menuContentType = 1
                        break
                    default:
                        this.menuContentType = null
                }
            },
            addMenu() {
                //如果当前是选中状态则校验表单
                if (this.activeClass !== '-1' && !this.checkForm()) {
                    return
                }
                let menu = {
                    name: '菜单名称'
                }
                this.menus.button.push(menu)
                this.selectedMenu(this.menus.button.length - 1, false)
            },
            addSubMenu(menuIndex) {
                //如果当前是选中状态则校验表单
                if (this.activeClass !== '-1' && !this.checkForm()) {
                    return
                }
                let subMenu = {
                    name: '子菜单名称',
                    type: 'view'
                }
                if (!this.menus.button[menuIndex].sub_button) {
                    this.menus.button[menuIndex].sub_button = []
                }
                this.menuContentType = null
                this.menus.button[menuIndex].sub_button.push(subMenu)
                this.selectedSubMenu(menuIndex, this.menus.button[menuIndex].sub_button.length - 1, false)
            },
            delMenu() {
                this.$Modal.confirm({
                    title: '删除确认',
                    content: `删除后“${this.temp.name}”菜单下设置的内容将被删除`,
                    onOk: () => {
                        if (this.selectMenuType === 'menu') {
                            this.menus.button.splice(this.selectMenuIndex, 1)
                        } else if (this.selectMenuType === 'subMenu') {
                            this.menus.button[this.selectMenuIndex].sub_button.splice(this.selectSubMenuIndex, 1)
                        }
                        this.unSelectMenu()
                        //清除表单校验
                        this.$refs.dataForm.resetFields()
                        this.$Message.success(`成功删除菜单“${this.temp.name}”`);
                    }
                })
            },
            //菜单未选中状态
            unSelectMenu() {
                this.selectMenuIndex = null
                this.selectSubMenuIndex = null
                this.selectMenuType = null
                this.activeClass = '-1'
            },
            saveAndPublish() {
                //如果当前是选中状态则校验表单
                if (this.activeClass !== '-1' && !this.checkForm()) {
                    return
                }
                if (this.menus.button.length === 0) {
                    this.$Message.error('菜单不能为空')
                }
                this.$Modal.confirm({
                    title: '发布确认',
                    content: '发布成功后会覆盖原版本，且将在24小时内对所有用户生效，确认发布？',
                    onOk: () => {
                        save({
                            appId: this.appId,
                            id: this.menuId,
                            contentExpress: this.menus
                        }).then(() => {
                            this.getMenu()
                            this.unSelectMenu()
                            this.$Notice.success({title: '成功', desc: '保存并发布成功'})
                        })
                    }
                })
            },
            checkForm() {
                let validResult = false
                this.$refs['dataForm'].validate((valid) => {
                    if (valid) {
                        switch (this.temp.type) {
                            case 'view':
                                if (!this.temp.url) {
                                    this.$Message.error("跳转链接不能为空")
                                    valid = false
                                }
                                break
                            case 'click':
                                valid = this.$refs.respMsg.checkMsg()
                                this.temp.respMsg =this.$refs.respMsg.formatTemp()
                                break
                            case 'miniprogram':
                                if (!this.temp.appid) {
                                    this.$Message.error("小程序的appid不能为空")
                                    valid = false
                                    break
                                }
                                if (!this.temp.pagepath) {
                                    this.$Message.error("小程序的页面路径不能为空")
                                    valid = false
                                    break
                                }
                                if (!this.temp.url) {
                                    this.$Message.error("备用网页不能为空")
                                    valid = false
                                    break
                                }
                                break
                        }
                    }
                    validResult = valid
                })
                return validResult
            }
        }
    }
</script>

<style scoped>
    .wrapper {
        display: table;
        background-color: #ffffff;
        min-width: 1070px;
        width: 1070px;
        margin: 0 auto;
        padding-top: 10px;
    }

    .left {
        float: left;
        width: 300px;
        height: 640px;
        margin-left: 12px;
        background-position: 0 0;

    }

    .weixin-hd {
        color: #fff;
        text-align: center;
        width: 300px;
        height: 60px;
        background: transparent url(../../assets/images/menu_head.png) no-repeat 0 0;
        background-size: 100%;
    }

    .weixin-space {
        height: 450px;
        border-left: 1px solid #e7e7eb;
        border-right: 1px solid #e7e7eb;
    }

    .weixin-title {
        color: #fff;
        font-size: 14px;
        position: relative;
        top: 32px;
    }

    .weixin-menu {
        background: transparent url(../../assets/images/bg_mobile_foot_default.png) no-repeat 0 0;
        padding-left: 43px;
        font-size: 12px;
        height: 50px;
        border: 1px solid #e7e7eb;
    }

    .menu_name {
        line-height: 48px;
        border-left: 1px solid #e7e7eb;
    }

    .weixin-menu :hover {
        cursor: pointer;
    }

    .menu_text {
        text-align: center;
        display: block;
        width: auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-wrap: normal;
        color: #616161;
        text-decoration: none;
    }


    .sub_menu {
        background-color: #fafafa;
        border: 1px solid #e7e7eb;
        position: absolute;
        width: 86px;
        bottom: 60px;
        display: flex;
        flex-direction: column;
    }

    .sub_title {
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        padding-left: 5px;
        padding-right: 5px;
    }

    .menu_subItem {
        height: 44px;
        line-height: 44px;
        text-align: center;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        border-bottom: 1px solid #e7e7eb;
    }

    .menu_active {
        background-color: #fff;
        border: 1px solid #44b549;
    }

    .tool-bar {
        margin-top: 20px;
        text-align: center;
    }

    .right {
        float: left;
        display: inline-block;
        margin-left: 24px;
        width: 720px;
        height: 560px;
        padding: 0 20px 5px;
        background-color: #f4f5f9;
        border: 1px solid #e7e7eb;
        border-radius: 0;
        -moz-border-radius: 0;
        -webkit-border-radius: 0;
        box-shadow: none;
        -moz-box-shadow: none;
        -webkit-box-shadow: none;
    }

    .menu_form_hd {
        padding: 9px 0;
        margin-bottom: 25px;
        border-bottom: 1px solid #e7e7eb;
        display: flex;
        justify-content: space-between;
    }

    .menu_form_empty {
        padding: 200px 0 0;
        text-align: center;
        vertical-align: center;
    }

    .menu_content {
        padding: 16px 20px 0;
        border: 1px solid #e7e7eb;
        background-color: #fff;
    }

    .pre_menu_list {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        border-top: 1px solid #e7e7eb;
        background: transparent url(../../assets/images/bg_mobile_foot_default.png) no-repeat 0 0;
        padding-left: 43px;
    }

    a {
        text-decoration: none;
        color: #576b95;
    }
</style>
