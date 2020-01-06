import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/material/list',
    method: 'post',
    data
  })
}
