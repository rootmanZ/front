import axios from '@/libs/api.request'

export const fetchList = (data) => {
    return axios.request({
        url: 'sys/user/list',
        method: 'post',
        data
    })
}

export const fectchInfo = (id) => {
    return axios.request({
        url: `sys/user/info/${id}`,
        method: 'post',
    })
}

export const create = (data) => {
    return axios.request({
        url: 'sys/user/add',
        method: 'post',
        data
    })
}

export const update = (data) => {
    return axios.request({
        url: 'sys/user/update',
        method: 'post',
        data
    })
}

export const remove = (id) => {
    return axios.request({
        url: `sys/user/delete/${id}`,
        method: 'post',
    })
}

export const changeStatus = (data) => {
    return axios.request({
        url: 'sys/user/changeStatus',
        method: 'post',
        data
    })
}
