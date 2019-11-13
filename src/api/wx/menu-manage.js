import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: 'wx/menuConditional/list',
    method: 'post',
    data
  })
}

export const fectchInfo = (data) => {
  return axios.request({
    url: `wx/menuConditional/info`,
    method: 'post',
    data
  })
}

export const save = (data) => {
  return axios.request({
    url: 'wx/menuConditional/save',
    method: 'post',
    data
  })
}

export const remove = (id) => {
  return axios.request({
    url: `wx/menuConditional/delete/${id}`,
    method: 'post'
  })
}
