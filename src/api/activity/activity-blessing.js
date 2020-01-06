import axios from '@/libs/api.request'


export const fetchInfo = (id) => {
  return axios.request({
    url: `/act/activity/blessing/info/${id}`,
    method: 'post'
  })
}

export const create = (data) => {
  return axios.request({
    url: '/act/activity/blessing/add',
    method: 'post',
    data
  })
}

export const update = (data) => {
  return axios.request({
    url: '/act/activity/blessing/update',
    method: 'post',
    data
  })
}

export const remove = (id) => {
  return axios.request({
    url: `/act/activity/blessing/delete/${id}`,
    method: 'post'
  })
}

