import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/prize/list',
    method: 'post',
    data
  })
}

export const fetchInfo = (id) => {
  return axios.request({
    url: `/act/prize/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: '/act/prize/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: '/act/prize/update',
    method: 'post',
    data
  })
}

export const remove = (id) => {
  return axios.request({
    url: `/act/prize/delete/${id}`,
    method: 'post'
  })
}

export const coupon = (id) => {
  return axios.request({
    url: `/act/prize/coupon/${id}`,
    method: 'post'
  })
}
