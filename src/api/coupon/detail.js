import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/coupon-batch-detail/list',
    method: 'post',
    data
  })
}
