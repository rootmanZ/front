import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/prize-win/list',
    method: 'post',
    data
  })
}
