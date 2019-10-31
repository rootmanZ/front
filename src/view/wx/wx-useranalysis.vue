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
    <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading"  :border="true">
      <template slot-scope="{ row, index }" slot="date">
        {{row.refDate.substring(0,10)}}
      </template>
    </Table>
    <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
          show-total show-sizer show-elevator
          @on-change="getList" @on-page-size-change="handlePageSize"/>
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
      list: [],
      columns: [// 列表表头
        {
          title: '日期',
          key: 'refDate',
          slot: 'date'
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
        appId: this.$route.query.appId,
        startDt: null,
        endDt: null,
        current: 1,
        size: 10
      },
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
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList()
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
        this.list = response.data.records
        this.total = response.data.total
        response.data.records.forEach(v => {
          arr1.push(v.newUser)
          arr2.push(v.refDate.substring(0, 10))
          arr3.push(v.cancelUser)
          arr4.push(v.cumulateUser)
        })
        that.summarydata = arr1
        that.reducedata = arr3
        that.cumulatedata = arr4
        that.timedata = arr2
        console.log(timedata)
      })
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
