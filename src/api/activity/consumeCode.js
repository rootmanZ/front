import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/consumeCode/list',
    method: 'post',
    data
  })
}

export const fetchInfo = (id) => {
  return axios.request({
    url: `/act/activity/consumeCode/${id}`,
    method: 'post'
  })
}
