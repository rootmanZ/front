import axios from '@/libs/api.request'

export const fetchList = (data) => {
    return axios.request({
        url: 'sys/role/list',
        method: 'post',
        data
    })
}

export const fetchAll = () => {
    return axios.request({
        url: 'sys/role/listAll',
        method: 'get'
    })
}

export const fectchInfo = (id) => {
    return axios.request({
        url: `sys/role/info/${id}`,
        method: 'post'
    })
}

export const create = (data) => {
    return axios.request({
        url: 'sys/role/add',
        method: 'post',
        data
    })
}

export const update = (data) => {
    return axios.request({
        url: 'sys/role/update',
        method: 'post',
        data
    })
}

export const remove = (id) => {
    return axios.request({
        url: `sys/role/delete/${id}`,
        method: 'post'
    })
}

export const changeStatus = (data) => {
    return axios.request({
        url: 'sys/role/changeStatus',
        method: 'post',
        data
    })
}
