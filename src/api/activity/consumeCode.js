import axios from '@/libs/api.request'

export const fetchList = (data) => {
  return axios.request({
    url: '/act/consumeCode/list',
    method: 'post',
    data
  })
}

export const remove = (consumeCodeListFlag) => {
  return axios.request({
    url: `/act/consumeCode/delete/${consumeCodeListFlag}`,
    method: 'post'
  })
}

export const getPrizeCodeList = (data) => {
  return axios.request({
    url: '/act/consumeCode/getPrizeCodeList',
    method: 'post',
    data
  })
}
