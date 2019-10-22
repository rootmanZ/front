import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: 'wx/user/list',
    method: 'post',
    data
  })
}

export const fectchInfo = (id) => {
  return axios.request({
    url: `wx/user/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: 'wx/user/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: 'wx/user/update',
    method: 'post',
    data
  })
}

export const remove = (id) => {
  return axios.request({
    url: `wx/user/delete/${id}`,
    method: 'post'
  })
}
