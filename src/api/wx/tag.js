import axios from '@/libs/api.request'

export const fetchTagList = (data) => {
  return axios.request({
    url: 'wx/tag/list',
    method: 'post',
    params: data
  })
}

export const fectchTagInfo = (id) => {
  return axios.request({
    url: `wx/tag/info/${id}`,
    method: 'post'
  })
}

export const createTag = (data) => {
  return axios.request({
    url: 'wx/tag/add',
    method: 'post',
    data
  })
}

export const updateTag = (data) => {
  return axios.request({
    url: 'wx/tag/update',
    method: 'post',
    data
  })
}

export const removeTag = (id) => {
  return axios.request({
    url: `wx/tag/delete/${id}`,
    method: 'post'
  })
}
