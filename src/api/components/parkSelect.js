import axios from '@/libs/api.request'

export const getAreaInfoList = (parentId) => {
  return axios.request({
    url: `/iparking/sysAreainfo/getByParentId/${parentId}`,
    method: 'post'
  })
}

export const getFeePayList = () => {
  return axios.request({
    url: '/iparking/feePayType/list',
    method: 'post'
  })
}

export const searchParkList = (data) => {
  return axios.request({
    url: '/iparking/parkInfo/search',
    method: 'post',
    data
  })
}
