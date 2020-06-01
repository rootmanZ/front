import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/rebate-coupon/list',
    method: 'post',
    data
  })
}

export const fetchExcel = (data) => {
  return axios.request({
    url: '/act/rebate-coupon/excel',
    method: 'post',
    data
  })
}
