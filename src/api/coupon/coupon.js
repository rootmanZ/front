import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/coupon-batch/list',
    method: 'post',
    data
  })
}

export const create = (data) => {
  return axios.request({
    url: '/act/coupon-batch/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: '/act/activity/update',
    method: 'post',
    data
  })
}

export const remove = (id) => {
  return axios.request({
    url: `/act/coupon-batch/delete/${id}`,
    method: 'post'
  })
}
