import axios from '@/libs/api.request'

export const fetchList = (data) => {
    return axios.request({
        url: 'wx/app-info/list',
        method: 'post',
        data
    })
}

export const fectchInfo = (id) => {
    return axios.request({
        url: `wx/app-info/info/${id}`,
        method: 'post',
    })
}

export const create = (data) => {
    return axios.request({
        url: 'wx/app-info/add',
        method: 'post',
        data
    })
}

export const update = (data) => {
    return axios.request({
        url: 'wx/app-info/update',
        method: 'post',
        data
    })
}

export const remove = (id) => {
    return axios.request({
        url: `wx/app-info/delete/${id}`,
        method: 'post',
    })
}

