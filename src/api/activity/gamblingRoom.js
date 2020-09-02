import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/gamblingRoom/list',
    method: 'post',
    data
  })
}

export const fetchInfo = (id) => {
  return axios.request({
    url: `/act/gamblingRoom/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: '/act/gamblingRoom/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: '/act/gamblingRoom/update',
    method: 'post',
    data
  })
}

export const remove = (data) => {
  return axios.request({
    url: `/act/gamblingRoom/delete`,
    method: 'post',
    data
  })
}

export const advList = (data) => {
  return axios.request({
    url: '/act/gamblingRoom/advList',
    method: 'post',
    data
  })
}
