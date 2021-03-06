import axios from 'axios'
import store from '@/store'
import {getToken, setToken} from '@/libs/util'
// import { Spin } from 'iview'
import {Message} from 'iview'
import router from '@/router'

const addErrorLog = errorInfo => {
    const {statusText, status, request: {responseURL}} = errorInfo
    let info = {
        type: 'ajax',
        code: status,
        mes: statusText,
        url: responseURL
    }
    if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
}

class HttpRequest {
    constructor(baseUrl = baseURL) {
        this.baseUrl = baseUrl
        this.queue = {}
    }

    getInsideConfig() {
        const config = {
            baseURL: this.baseUrl,
            headers: {
                'x-auth-token': getToken()
            }
        }
        return config
    }

    destroy(url) {
        delete this.queue[url]
        if (!Object.keys(this.queue).length) {
            // Spin.hide()
        }
    }

    interceptors(instance, url) {
        // 请求拦截
        instance.interceptors.request.use(config => {
            // 添加全局的loading...
            if (!Object.keys(this.queue).length) {
                // Spin.show() // 不建议开启，因为界面不友好
            }
            this.queue[url] = true
            return config
        }, error => {
            return Promise.reject(error)
        })
        // 响应拦截
        instance.interceptors.response.use(res => {
            this.destroy(url)
            // modify by sf  start----响应码不为0则抛出错误
            if (res.data.code !== undefined) {
                if (res.data.code !== 0) {
                    if (res.data.code === 10005) { // 未登录
                        setToken('')
                        router.push({
                            name: 'login'
                        })
                    }
                    this.showError(res.data.msg)
                    throw new Error(res.data.msg || 'error')
                }
                return res.data
            } else {
                const {data, status} = res
                return {data, status}
            }
            // modify end
        }, error => {
            this.destroy(url)
            let errorInfo = error.response
            if (!errorInfo) {
                const {request: {statusText, status}, config} = JSON.parse(JSON.stringify(error))
                errorInfo = {
                    statusText,
                    status,
                    request: {responseURL: config.url}
                }
            }
            addErrorLog(errorInfo)
            this.showError('系统繁忙，请稍后再试')
            return Promise.reject(error)
        })
    }

    request(options) {
        const instance = axios.create()
        options = Object.assign(this.getInsideConfig(), options)
        this.interceptors(instance, options.url)
        return instance(options)
    }

    showError(msg) {
        Message.error({
            content: msg,
            duration: 3
        })
    }
}

export default HttpRequest
