<template>
  <div>
    <div class="search-con">
      <DatePicker type="daterange" :options="options" format="yyyy-MM-dd" split-panels placeholder="请选择区间" style="width: 200px" @on-change="changeDate" ></DatePicker>
      <Button class="search-btn" type="primary" @click="getList">搜索</Button>
    </div>
    <Row>
      <Card shadow>
        <div ref="dom" style="height: 410px;"></div>
      </Card>
    </Row>
    <br/>
    <Row style="background:#eee;padding:11px">
      <Col span="4">
        <p style="color: #17233d" size="large" >{{timeStr}}</p>
      </Col>
      <Col span="2" offset="17" style="text-align: center; border-left:1px slategray">
        <a style="color: #808695" @click="exportData">导出数据</a>
      </Col>
      <Col span="1" style="text-align: center;border-left:1px solid #5c6b77">
        <Poptip trigger="hover" content="用户总数和用户增长数分别根据不同方法和时间点来统计,可能出现不匹配."  placement="right-end">
          <Icon type="ios-help-circle" />
        </Poptip>
      </Col>
    </Row>
    <Table ref="tablesMain" :data="fieldData" :columns="columns" :loading="listLoading"  :border="true">
      <template slot-scope="{ row, index }" slot="action">
        <Button type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(row.appId)">修改</Button>
        <Button type="error" size="small" @click="handleDelete(row.appId)">删除</Button>
      </template>
    </Table>
    <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="pagesize"
          show-total show-sizer show-elevator
          @on-change="LoadData(listQuery.current)" @on-page-size-change="LoadData(listQuery.current)"/>
  </div>
</template>

<script>
import echarts from 'echarts'
import { off, on } from '@/libs/tools'
import { fetchList } from '../../api/wx/analysis'

export default {
  name: 'wx-useranalysis',
  data () {
    return {
      options: {
        disabledDate (date) {
          return date.valueOf() >= Date.now()
        }
      },
      dom: null,
      total: 0, // 获取后端的数据总条数
      pagesize: 10, // 一页显示10条
      pageindex: 1, // 当前页
      fieldData: [], // 前端模拟后每一页显示的数据
      list: [],
      columns: [// 列表表头
        {
          title: '日期',
          key: 'refDate'
        },
        {
          title: '用户增量',
          key: 'newUser'
        },
        {
          title: '用户减量',
          key: 'cancelUser'
        },
        {
          title: '累计用户数量',
          key: 'cumulateUser'
        }
      ],
      listLoading: false,
      listQuery: {
        current: 1,
        startDt: '',
        endDt: '',
        appId: this.$route.query.appId
      },
      summaryResult: [{
        newUser: 5,
        refDate: '2019-08-01',
        cancelUser: 3,
        cumulateUser: 0
      },
      {
        newUser: 15,
        refDate: '2019-08-02',
        cancelUser: 13,
        cumulateUser: 0
      },
      {
        newUser: 17,
        refDate: '2019-08-03',
        cancelUser: 38,
        cumulateUser: 0
      },
      {
        newUser: 10,
        refDate: '2019-08-04',
        cancelUser: 4,
        cumulateUser: 0
      },
      {
        newUser: 10,
        refDate: '2019-08-05',
        cancelUser: 4,
        cumulateUser: 0
      },
      {
        newUser: 10,
        refDate: '2019-08-06',
        cancelUser: 4,
        cumulateUser: 0
      },
      {
        newUser: 10,
        refDate: '2019-08-07',
        cancelUser: 4,
        cumulateUser: 0
      },
      {
        newUser: 10,
        refDate: '2019-08-08',
        cancelUser: 4,
        cumulateUser: 0
      },
      {
        newUser: 10,
        refDate: '2019-08-09',
        cancelUser: 4,
        cumulateUser: 0
      },
      {
        newUser: 10,
        refDate: '2019-08-10',
        cancelUser: 4,
        cumulateUser: 0
      },
      {
        newUser: 10,
        refDate: '2019-08-11',
        cancelUser: 4,
        cumulateUser: 0
      }
      ],
      cumulateResult: [{
        cumulateUser: 32,
        refDate: '2019-08-01',
        cancelUser: 3
      },
      {
        cumulateUser: 55,
        refDate: '2019-08-02',
        cancelUser: 13
      },
      {
        cumulateUser: 77,
        refDate: '2019-08-03',
        cancelUser: 38
      },
      {
        cumulateUser: 80,
        refDate: '2019-08-04',
        cancelUser: 4
      },
      {
        cumulateUser: 80,
        refDate: '2019-08-05',
        cancelUser: 4
      },
      {
        cumulateUser: 80,
        refDate: '2019-08-06',
        cancelUser: 4
      },
      {
        cumulateUser: 80,
        refDate: '2019-08-07',
        cancelUser: 4
      },
      {
        cumulateUser: 80,
        refDate: '2019-08-08',
        cancelUser: 4
      },
      {
        cumulateUser: 80,
        refDate: '2019-08-09',
        cancelUser: 4
      }
      ],
      summarydata: [],
      reducedata: [],
      cumulatedata: [],
      timedata: []
    }
  },
  created () {
    this.getList()
  },
  computed: {
    totalpages: function () { // 总页数
      return Math.ceil(this.total * 1 / this.pagesize)
    },
    timeStr: function () {
      var len = this.timedata.length - 1
      return this.timedata[0] + '至' + this.timedata[len]
    }
  },
  methods: {
    resize () {
      this.dom.resize()
    },
    // 前端导出
    exportData () {
      this.$refs.tablesMain.exportCsv({
        filename: '用户分析数据'
      })
    },
    // 前端加分页调用的方法
    LoadData (value) {
      let that = this
      that.pageindex = value
      that.fieldData = that.summaryResult.slice((value - 1) * 10, value * 10)
      console.log('总页数：', that.totalpages)
      console.log('截取的数据：', that.fieldData)
      console.log('当前页：', value)
    },
    changeDate (date) {
      this.listQuery.startDt = date[0]
      this.listQuery.endDt = date[1]
      console.log(this.listQuery)
    },
    getList () {
      let that = this
      fetchList(this.listQuery).then(response => {
        let arr1 = []
        let arr2 = []
        let arr3 = []
        let arr4 = []
        /* that.summaryResult = response.data.summaryResult
            that.cumulateResult = response.data.cumulateResult */

        that.summaryResult.forEach(v => {
          arr1.push(v.newUser)
          arr2.push(v.refDate)
          arr3.push(v.cancelUser)
        })
        that.cumulateResult.forEach(v => {
          arr4.push(v.cumulateUser)
        })
        that.summarydata = arr1
        that.reducedata = arr3
        that.cumulatedata = arr4
        that.timedata = arr2
      })
      this.total = this.summaryResult.length// 前端加分页————获取数据总条数
      this.LoadData(1)// 前端加分页————加载第一个数据
    }
  },
  mounted () {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['用户增量', '用户减量', '用户累计数量']
      },
      // xAxis，配置x轴数据、样式、名称
      xAxis: [
        {
          type: 'category',
          name: '日期',
          boundaryGap: false,
          data: this.timedata
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '数量'
        }
      ],
      series: [
        {
          name: '用户增量',
          type: 'line',
          areaStyle: {
            normal: {
              color: '#2d8cf0'
            }
          },
          data: this.summarydata
        },
        {
          name: '用户减量',
          type: 'line',
          areaStyle: {
            normal: {
              color: '#10A6FF'
            }
          },
          data: this.reducedata
        },
        {
          name: '用户累计数量',
          type: 'line',
          areaStyle: {
            normal: {
              color: '#0C17A6'
            }
          },
          data: this.cumulatedata
        }
      ]
    }
    this.$nextTick(() => {
      this.dom = echarts.init(this.$refs.dom)
      this.dom.setOption(option)
      on(window, 'resize', this.resize)
    })
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  }
}
</script>

<style scoped>
  .result-foot{float:right;}
  .active {background:#2d8cf0;}
  .active a{color:#fff !important;}
  .ul {list-style:none;margin:20px;}
  .ul li {float:left;line-height:28px;width:30px;border:1px solid #ccc;border-radius: 4px;height:30px;text-align:center;margin:5px}
  .ul li.disabled{color:#333}
  .ul li a{color:#333}
  .top,.bottom{
    text-align: center;
  }
  .center{
    width: 300px;
    margin: 10px auto;
    overflow: hidden;
  }
  .center-left{
    float: left;
  }
  .center-right{
    float: right;
  }
</style>
