import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/activity/list',
    method: 'post',
    data
  })
}

export const fetchInfo = (id) => {
  return axios.request({
    url: `/act/activity/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: '/act/activity/add',
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
    url: `/act/activity/delete/${id}`,
    method: 'post'
  })
}

export const titleList = () => {
  return axios.request({
    url: `/act/activity/titleList`,
    method: 'post'
  })
}

export const preview = (data) => {
  return axios.request({
    url: '/act/activity/preview/save',
    method: 'post',
    data
  })
}
