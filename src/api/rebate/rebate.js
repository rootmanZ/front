import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/rebate/list',
    method: 'post',
    data
  })
}

export const fetchExcel = (data) => {
  return axios.request({
    url: '/act/rebate/excel',
    method: 'post',
    data
  })
}
