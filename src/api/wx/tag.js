import axios from '@/libs/api.request'

export const fetchTagList = (data) => {
  return axios.request({
    url: 'wx/tag/allList',
    method: 'post',
    data
  })
}

export const fetchList = (data) => {
  return axios.request({
    url: 'wx/tag/list',
    method: 'post',
    data
  })
}

export const fectchInfo = (id) => {
  return axios.request({
    url: `wx/tag/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: 'wx/tag/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: 'wx/tag/update',
    method: 'post',
    data
  })
}

export const remove = (id) => {
  return axios.request({
    url: `wx/tag/delete/${id}`,
    method: 'post'
  })
}

export const synchronize = (id) => {
  return axios.request({
    url: `wx/tag/synchronize/${id}`,
    method: 'post'
  })
}
