import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: 'wx/analysis/list',
    method: 'post',
    data
  })
}
