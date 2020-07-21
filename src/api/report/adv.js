import axios from '@/libs/api.request'

export const fetchList = (data) => {
    return axios.request({
        url: '/rep/adv/list',
        method: 'post',
        data
    })
}

export const fetchExcel = (data) => {
    return axios.request({
        url: '/rep/adv/excel',
        method: 'post',
        data
    })
}
