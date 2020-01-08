import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/blessing-theme/list',
    method: 'post',
    data
  })
}

export const fetchInfo = (id) => {
  return axios.request({
    url: `/act/blessing-theme/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: '/act/blessing-theme/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: '/act/blessing-theme/update',
    method: 'post',
    data
  })
}

export const remove = (data) => {
  return axios.request({
    url: `/act/blessing-theme/delete`,
    method: 'post',
    data
  })
}

export const getEntList = () => {
  return axios.request({
    url: `/act/blessing-theme/entList`,
    method: 'post'
  })
}
