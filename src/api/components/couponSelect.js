import axios from '@/libs/api.request'

export const searchCouponList = (data) => {
  return axios.request({
    url: '/iparking/couponInfo/search',
    method: 'post',
    data
  })
}
