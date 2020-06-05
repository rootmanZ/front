<template>
  <div class="park-table" id="parks">
    <Form :inline="true" class="search-con">
      <Form-item class="park-item">
        省/市/地区：
        <Select v-model="provinceCode" placeholder="请选择省" size="small" style="width:120px" @on-change="provinceChange"
                clearable>
          <Option
            v-for="item in provinces"
            :key="item.areaCode"
            :label="item.areaName"
            :value="item.areaCode">
          </Option>
        </Select>
        <Select v-model="cityCode" placeholder="请选择市" size="small" style="width:120px" @on-change="cityChange"
                clearable>
          <Option
            v-for="item in citys"
            :key="item.areaCode"
            :label="item.areaName"
            :value="item.areaCode">
          </Option>
        </Select>
        <Select v-model="areaCode" placeholder="请选择区域" size="small" style="width:120px" @on-change="areaChange"
                clearable>
          <Option
            v-for="item in areas"
            :key="item.areaCode"
            :label="item.areaName"
            :value="item.areaCode">
          </Option>
        </Select>
      </Form-item>
      <Form-item class="park-item">
        企业名称：
        <Input v-model="parkSearch.entName" style="width:120px" size="small" placeholder="请输入关键字" clearable></Input>
      </Form-item>
      <Form-item class="park-item">
        车场名称：
        <Input v-model="parkSearch.parkName" style="width:120px" size="small" placeholder="请输入关键字" clearable></Input>
      </Form-item>
      <Form-item class="park-item">
        经营类型：
        <Select v-model="parkSearch.isSeftFee" placeholder="请选择经营类型" size="small" style="width:150px" clearable>
          <Option label="全部" value=""></Option>
          <Option label="非自营" value="2"></Option>
          <Option label="独立结算" value="1"></Option>
          <Option label="自营(手动)" value="0"></Option>
          <Option label="自营(自动)" value="-1"></Option>
        </Select>
      </Form-item>

      <Form-item class="park-item">
        手动支付类型：
        <Select v-model="parkSearch.feeType" placeholder="请选择手动支付类型" size="small" style="width:150px" clearable>
          <Option label="全部" value=""></Option>
          <Option
            v-for="item in feePaymentList"
            :key="item.paymentCode"
            :label="item.paymentName"
            :value="item.paymentCode">
          </Option>
        </Select>
      </Form-item>
      <Form-item class="park-item">
        无感支付类型：
        <Select v-model="parkSearch.autoFeeType" placeholder="请选择无感支付类型" size="small" style="width:150px" clearable>
          <Option label="全部" value=""></Option>
          <Option
            v-for="item in autoFeePaymentList"
            :key="item.paymentCode"
            :label="item.paymentName"
            :value="item.paymentCode">
          </Option>
        </Select>
      </Form-item>
      <Form-item class="park-item">
        <Button type="primary" size="small" @click="_searchParks">搜索</Button>
      </Form-item>
    </Form>
    <Row class="table-container" id="park_table">
      <Table id="parkListTable"
             ref="parkListTable"
             :data="parkList"
             :columns="columns"
             :loading="loading"
             size="small"
             style="width: 100%"
             @on-select="handleSelect"
             @on-select-cancel="handleSelect"
             @on-select-all="handleSelectAll"
             @on-select-all-cancel="handleSelectAll">
      </Table>
    </Row>
    <div class="pagination">
      <Page v-show="totalResult>0" :total="totalResult"
            :current.sync="parkSearch.current"
            :page-size="parkSearch.size"
            show-total show-sizer show-elevator
            @on-change="handleCurrentChange" @on-page-size-change="handleSizeChange"/>
    </div>
    <div>
      已选择{{parkMultipleSelection.length}}个停车场:
      <div class="selectParkListContent">
        <template v-for="(item,index) in parkMultipleSelection">
          <div class="parkInfoItem" :key="index">{{item.parkName}}
            <Icon type="ios-trash" size="18" color="red" @click="delParkItem(item,index)"/>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import { getAreaInfoList, getFeePayList, searchParkList } from '@/api/components/parkSelect'
import FormItem from 'iview/src/components/form/form-item'

export default {
  components: { FormItem },
  name: 'ParkSelect',
  props: ['parkMultipleSelection'], // 最终保存停车场数据
  data () {
    return {
      loading: true,
      parkSearch: {
        current: 1,
        size: 10,
        isSeftFee: '',
        parkName: '',
        entName: '',
        areaType: '',
        areaCode: '',
        feeType: '',
        autoFeeType: '',
        bizType: 1
      },
      totalResult: 0,
      feePaymentList: [],
      autoFeePaymentList: [],
      parkList: [], // 所有停车场数据
      columns: [
        {
          type: 'selection',
          width: '55'
        },
        {
          title: '企业名称',
          key: 'entName',
          align: 'center'
        },
        {
          title: '停车场名称',
          key: 'parkName',
          align: 'center'
        },
        {
          title: '地址',
          key: 'address',
          align: 'center'
        },
        {
          title: '总车位数',
          key: 'totalNum',
          align: 'center'
        }
      ],

      // 省市区选择
      code: null, // 最终查询的id
      parentId: '0',
      provinceCode: null,
      cityCode: null,
      areaCode: null,
      areaName: '',
      areaType: '1', // 1 省 2 市 3 区
      provinces: [],
      citys: [],
      areas: []

    }
  },

  created () {
    this._getAreaList()
    this._getFeePayList()
    this._searchParks()
  },
  mounted: function () {
    this.$emit('getSelectParks', this.parkMultipleSelection)
  },
  methods: {
    // 获取支付类型
    _getFeePayList () {
      getFeePayList().then(res => {
        this.autoFeePaymentList = res.data.autoFeePayTypeList
        this.feePaymentList = res.data.feePayTypeList
      })
    },

    // 获取省市区
    _getAreaList () {
      let parentId = this.parentId
      let areaType = this.areaType
      getAreaInfoList(parentId).then(res => {
        if (areaType == '1') {
          this.provinces = res.data
        } else if (areaType == '2') {
          this.citys = res.data
        } else {
          this.areas = res.data
        }
      })
    },

    // 省市区选择
    provinceChange (value) {
      this.code = value
      this.parentId = value
      this.areaType = '2'
      this.citys = []
      this.areas = []
      this.cityCode = null
      this.areaCode = null
      if (value) {
        this._getAreaList()
      }
    },
    cityChange (value) {
      this.areas = []
      this.areaCode = null
      if (value) {
        this.code = value
        this.parentId = value
        this.areaType = '3'
        this._getAreaList()
      } else {
        this.code = this.provinceCode
        this.parentId = this.provinceCode
      }
    },
    areaChange (value) {
      if (value) {
        this.code = value
        this.parentId = value
      } else {
        this.code = this.cityCode
        this.parentId = this.cityCode
      }
    },

    // 搜索车场
    _searchParks () {
      this.loading = true
      let params = {}
      params = this.parkSearch
      searchParkList(params).then(res => {
        this.parkList = res.data.records
        this.totalResult = res.data.total
        this.showSelect()
        this.loading = false
      })
    },

    handleSelect (selection, row) {
      let parkMultipleSelection = this.parkMultipleSelection
      let isCheck = false
      selection.forEach((item, index) => {
        if (item.parkId == row.parkId) {
          isCheck = true
        }
      })

      if (isCheck) {
        let hasRow = false
        parkMultipleSelection.forEach((item, index) => {
          if (item.parkId == row.parkId) {
            hasRow = true
          }
        })
        if (!hasRow) {
          parkMultipleSelection.push(row)
        }
      } else {
        for (let i = 0; i < parkMultipleSelection.length; i++) {
          if (parkMultipleSelection[i].parkId == row.parkId) {
            parkMultipleSelection.splice(i, 1)
          }
        }
      }
    },
    handleSelectAll (selection) {
      let parkMultipleSelection = this.parkMultipleSelection
      if (selection.length > 0) {
        selection.forEach(item => {
          let hasSelect = false
          parkMultipleSelection.forEach(subItem => {
            if (subItem.parkId == item.parkId) {
              hasSelect = true
            }
          })
          if (!hasSelect) {
            parkMultipleSelection.push(item)
          }
        })
      } else {
        let parkList = this.parkList
        let parkMultipleSelection = this.parkMultipleSelection
        if (parkMultipleSelection.length > 0) {
          parkList.forEach((item, index) => {
            for (let i = 0; i < parkMultipleSelection.length; i++) {
              if (parkMultipleSelection[i].parkId == item.parkId) {
                parkMultipleSelection.splice(i, 1)
              }
            }
          })
        }
      }
    },
    // 车场分页
    handleSizeChange (val) {
      // size 改变时会触发
      this.parkSearch.size = val
      this._searchParks()
    },
    handleCurrentChange (val) {
      // current 改变时会触发  第几页
      this.parkSearch.current = val
      this._searchParks()
    },
    // 删除车场
    delParkItem (item, index) {
      this.parkMultipleSelection.splice(index, 1)
      let hasItem = false
      let parkItem
      let parkListIndex
      this.parkList.forEach((row, index) => {
        if (row.parkId == item.parkId) {
          hasItem = true
          parkItem = row
          parkListIndex = index
        }
      })
      if (hasItem) {
        this.$refs.parkListTable.$refs.tbody.objData[parkListIndex]._isChecked = false
      }
    },

    // 车场数据回显
    showSelect () {
      if (this.parkMultipleSelection.length > 0) {
        this.$nextTick(() => {
          this.parkList.forEach((row, index) => {
            let isTrue = false
            this.parkMultipleSelection.forEach(subRow => {
              if (subRow.parkId === row.parkId) {
                isTrue = true
              }
            })
            if (isTrue) {
              this.$refs.parkListTable.$refs.tbody.objData[index]._isChecked = true
            } else {
              this.$refs.parkListTable.$refs.tbody.objData[index]._isChecked = false
            }
          }, 500)
        })
      }
    },
    // 初始化数据
    resetParkSearch () {
      this.parkSearch = {
        current: 1,
        size: 10,
        parkName: '',
        entName: '',
        areaType: null,
        areaCode: null,
        feeType: '',
        autoFeeType: '',
        bizType: 1
      }
    },
    resetParkData () {
      this.parkList = []
      this.parkMultipleSelection = []
    }
  }
}
</script>
<style lang="less">
  .park-item {
    margin-top: -15px;
  }

  .park-table {
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    background-color: #F2F6FC;
    padding: 10px
  }

  .selectParkListContent {
    display: flex;
    flex-wrap: wrap;
    .parkInfoItem {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      line-height: normal;
      border: 1px solid #cccccc;
      width: 150px;
      height: 30px;
      margin-right: 10px;
      margin-bottom: 10px;
      .closeBtn {
        position: absolute;
        top: -5px;
        right: -5px;

      }
    }
  }

</style>
