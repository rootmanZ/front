import axios from '@/libs/api.request'

export const fetchList = (data) => {
    return axios.request({
        url: 'sys/dept/list',
        method: 'post',
        data
    })
}

export const fetchListTree = (data) => {
    return axios.request({
        url: 'sys/dept/list/tree',
        method: 'post',
        data
    })
}

export const fetchListCascader = (data) => {
    return axios.request({
        url: 'sys/dept/list/cascader',
        method: 'post',
        data
    })
}

export const fectchInfo = (id) => {
    return axios.request({
        url: `sys/dept/info/${id}`,
        method: 'post',
    })
}

export const create = (data) => {
    return axios.request({
        url: 'sys/dept/add',
        method: 'post',
        data
    })
}

export const update = (data) => {
    return axios.request({
        url: 'sys/dept/update',
        method: 'post',
        data
    })
}

export const remove = (id) => {
    return axios.request({
        url: `sys/dept/delete/${id}`,
        method: 'post',
    })
}
