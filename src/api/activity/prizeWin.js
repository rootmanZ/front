import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/prize-win/list',
    method: 'post',
    data
  })
}

export const fetchAll = (data) => {
  return axios.request({
    url: '/act/prize-win/all',
    method: 'post',
    data
  })
}
