<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login">
        <div class="login-body">
            <div class="login-logo">
                <img src="../../assets/images/logo1.png"  width="220"/>
                <div class="login-title">运营管理平台</div>
                <div class="login-logo2"></div>
            </div>
        </div>
        <div class="login-con">
            <Card icon="log-in" title="欢迎登录" :bordered="false">
                <div class="form-con">
                    <login-form @on-success-valid="handleSubmit"></login-form>
<!--                    <p class="login-tip">输入任意用户名和密码即可</p>-->
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
    import LoginForm from '_c/login-form'
    import {mapActions} from 'vuex'
    import {setTagNavListInLocalstorage} from '@/libs/util'

    export default {
        components: {
            LoginForm
        },
        methods: {
            ...mapActions([
                'handleLogin',
                'getUserInfo'
            ]),
            handleSubmit({userName, password}) {
                this.handleLogin({userName, password}).then(res => {
                    this.getUserInfo().then(res => {
                        setTagNavListInLocalstorage([])
                        //登录后清除获取路由标记，以便切换用户时重新获取用户菜单
                        this.$store.commit('setHasGetRouter', false)
                        this.$router.push({
                            name: this.$config.homeName
                        })
                    })
                })
            }
        }
    }
</script>

<style>

</style>
