import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/material/list',
    method: 'post',
    data
  })
}
export const fetchInfo = (id) => {
  return axios.request({
    url: `/act/material/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: '/act/material/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: '/act/material/update',
    method: 'post',
    data
  })
}

export const remove = (data) => {
  return axios.request({
    url: `/act/material/delete`,
    method: 'post',
    data
  })
}
