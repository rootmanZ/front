import axios from '@/libs/api.request'


export const fectchInfo = (appId) => {
    return axios.request({
        url: `wx/menu/info/${appId}`,
        method: 'post',
    })
}

export const save = (data) => {
    return axios.request({
        url: 'wx/menu/save',
        method: 'post',
        data
    })
}



