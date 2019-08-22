import axios from '@/libs/api.request'

export const fetchList = (data) => {
    return axios.request({
        url: 'sys/menu/list',
        method: 'post',
        data
    })
}

export const fetchListTree = () => {
    return axios.request({
        url: 'sys/menu/list/tree',
        method: 'post',
    })
}

export const fetchListCascader = (data) => {
    return axios.request({
        url: 'sys/menu/list/cascader',
        method: 'post',
        data
    })
}

export const fectchInfo = (id) => {
    return axios.request({
        url: `sys/menu/info/${id}`,
        method: 'post',
    })
}

export const create = (data) => {
    return axios.request({
        url: 'sys/menu/add',
        method: 'post',
        data
    })
}

export const update = (data) => {
    return axios.request({
        url: 'sys/menu/update',
        method: 'post',
        data
    })
}

export const remove = (id) => {
    return axios.request({
        url: `sys/menu/delete/${id}`,
        method: 'post',
    })
}
