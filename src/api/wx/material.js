import axios from '@/libs/api.request'

export const fetchList = (data) => {
    return axios.request({
        url: 'wx/material/list',
        method: 'post',
        params: data
    })
}

export const download = (data) => {
    return axios.request({
        url: 'wx/material/download',
        method: 'get',
        params: data
    })
}

export const remove = (data) => {
    return axios.request({
        url: 'wx/material/delete',
        method: 'post',
        params: data
    })
}

