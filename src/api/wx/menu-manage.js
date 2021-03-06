import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: 'wx/menuConditional/list',
    method: 'post',
    data
  })
}

export const fectchInfoConditional = (data) => {
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

export const remove = (data) => {
  return axios.request({
    url: `wx/menuConditional/delete`,
    method: 'post',
    data
  })
}
