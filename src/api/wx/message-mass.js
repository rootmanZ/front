import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/wx/message-mass/list',
    method: 'post',
    data
  })
}

export const fectchInfo = (id) => {
  return axios.request({
    url: `/wx/message-mass/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: '/wx/message-mass/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: '/wx/message-mass/update',
    method: 'post',
    data
  })
}

export const remove = (id) => {
  return axios.request({
    url: `/wx/message-mass/delete/${id}`,
    method: 'post'
  })
}

export const preview = (data) => {
  return axios.request({
    url: `/wx/message-mass/preview`,
    method: 'post',
    data
  })
}

export const tagList = (appId) => {
  return axios.request({
    url: `/wx/message-mass/tagList/${appId}`,
    method: 'post'
  })
}

export const itemList = (data) => {
  return axios.request({
    url: `/wx/message-mass/itemList`,
    method: 'post',
    data
  })
}

export const itemInfo = (id) => {
  return axios.request({
    url: `/wx/message-mass/itemInfo/${id}`,
    method: 'post'
  })
}
