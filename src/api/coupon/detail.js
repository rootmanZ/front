import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/coupon-batch-detail/list',
    method: 'post',
    data
  })
}

export const resend = (data) => {
  return axios.request({
    url: '/act/coupon-batch-detail/resendMsg',
    method: 'post',
    data
  })
}
