import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/iparking/tag/list',
    method: 'post',
    data
  })
}
