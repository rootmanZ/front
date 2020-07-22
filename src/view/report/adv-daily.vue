<template>
    <div>
        <div class="search-con">
            <DatePicker :value="listQuery.queryRefDateRange"
                        type="daterange"
                        formart="yyyy-MM-dd"
                        @on-change="listQuery.queryRefDateRange=$event"
                        :options="optionsRefDate"
                        placement="bottom-end"
                        placeholder="数据日期范围"
                        style="width: 200px"></DatePicker>
            <Input v-model="listQuery.advTitle" clearable placeholder="广告名称" style="width: 150px"/>
            <Select v-model="listQuery.queryAdvTypeList" clearable placeholder="投放位置" multiple style="width: 200px">
                <Option v-for="key in Object.keys(advTypeMap)" :value="key" :key="key">{{ advTypeMap[key] }}</Option>
            </Select>
            <Select v-model="listQuery.status" clearable placeholder="状态" style="width: 120px">
                <Option v-for="key in Object.keys(statusMap)" :value="key" :key="key">{{ statusMap[key] }}</Option>
            </Select>

            <Button v-if="$viewAccess('rep:adv:list')" class="search-btn" type="primary" @click="getList"
                    icon="md-search">搜索
            </Button>
            <Button v-if="$viewAccess('rep:adv:list')" class="search-btn" type="primary" icon="md-download"
                    :loading="exportLoading"
                    @click="exportExcel">
                导出excel
            </Button>
        </div>
        <div>
            <Table ref="advTable" :data="advDailyList" :columns="columns" :loading="listLoading" :border="true">
                <template slot="status" slot-scope="scope">
                    {{statusMap[scope.row.status]}}
                </template>
                <template slot="advType" slot-scope="scope">
                    <!--入场推送广告名称增加显示第几个广告位-->
                    {{scope.row.advType===5101 || scope.row.advType===5103 ?
                    advTypeMap[scope.row.advType]+'-'+scope.row.orderId : advTypeMap[scope.row.advType]}}
                </template>
            </Table>
            <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
                  show-total show-sizer show-elevator
                  @on-change="getList" @on-page-size-change="handlePageSize"/>
        </div>

    </div>
</template>

<script>
    import excel from '@/libs/excel'
    import {getDate} from '@/libs/tools'
    import {fetchExcel, fetchList} from '@/api/report/adv'

    export default {
        name: 'adv-daily',
        data() {
            return {
                listQuery: {
                    current: 1,
                    size: 10,
                    advTitle: '',
                    queryAdvTypeList: [],
                    status: '',
                    queryRefDateRange: []
                },
                total: 10,
                advDailyList: [],
                allList: [],
                listLoading: false,
                exportLoading: false,
                columns: [
                    {
                        title: '日期',
                        key: 'refDate'
                    },
                    {
                        title: '广告名称',
                        key: 'advTitle'
                    },
                    {
                        title: '投放位置',
                        slot: 'advType'
                    },
                    {
                        title: '状态',
                        width: 80,
                        slot: 'status'
                    },
                    {
                        title: '总点击次数',
                        key: 'totalClick',
                        width: 100,
                        align: 'right'
                    },
                    {
                        title: '日点击次数',
                        key: 'dailyClick',
                        width: 100,
                        align: 'right'
                    },
                    {
                        title: '发布时间',
                        key: 'createDt'
                    }
                ],
                statusMap: {
                    0: '未开始',
                    1: '进行中',
                    2: '已下架'
                },
                advTypeMap: {
                    3101: "支付完成广告轮播",
                    3102: "支付完成商品列表",
                    6000: "支付完成页弹窗广告位置",
                    1100: "登录注册页轮播广告位置",
                    1101: "登录注册页弹窗广告位置",
                    4101: "消费详情页面轮播图广告",
                    4102: "消费详情页弹窗广告位置",
                    6001: "缴费输入车牌页轮播广告位置",
                    6101: "合作商送券活动广告推荐轮播位置",
                    6201: "临停缴费页轮播广告位置",
                    6202: "临停缴费页悬停广告位置",
                    6203: "临停缴费页弹窗广告位置",
                    6301: "月租缴费页轮播广告位置",
                    6302: "月租缴费页弹窗广告位置",
                    6401: "商家抵用券抵用结果轮播广告位置",
                    5001: "小程序首页顶部轮播广告位置",
                    5002: "小程序首页业务推荐列表广告位置",
                    5003: "小程序横屏轮播广告位置",
                    5101: "入场推送营销活动轮播",
                    5102: "入场推送营销活动特殊区域",
                    5103: "入场推送营销活动列表",
                },
                optionsRefDate: {
                    disabledDate(date) {
                        return Date.now() < date.getTime() + 3600 * 24 * 1000;
                    },
                    shortcuts: [
                        {
                            text: '7 天',
                            value() {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                return [start, end];
                            }
                        },
                        {
                            text: '30 天',
                            value() {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                return [start, end];
                            }
                        },
                        {
                            text: '90 天',
                            value() {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                return [start, end];
                            }
                        }
                    ]
                },
            }
        },
        created() {
            let currentDateStr = getDate(Date.now() / 1000 - 3600 * 24, 'y-m-d')
            this.listQuery.queryRefDateRange = [currentDateStr, currentDateStr]
            this.getList()
        },
        methods: {
            getList() {
                this.listLoading = true
                fetchList(this.listQuery).then(response => {
                    this.advDailyList = response.data.records
                    this.total = response.data.total
                    this.listLoading = false
                })
            },
            handlePageSize(value) {
                this.listQuery.size = value
                this.getList()
            },
            //获取报表信息
            getAll() {
                fetchExcel(this.listQuery).then(response => {
                    this.allList = response.data
                })
            },
            exportExcel() {
                this.getAll()
                if (this.allList.length) {
                    this.exportLoading = true
                    const params = {
                        title: ['日期', '广告名称', '投放位置', '状态', '总点击次数', '日点击次数', '发布时间'],
                        key: ['refDate', 'advTitle', 'advType', 'status', 'totalClick', 'dailyClick', 'createDt'],
                        data: this.transExcelData(this.allList),
                        autoWidth: true,
                        filename: '广告统计列表'
                    }
                    excel.export_array_to_excel(params)
                    this.exportLoading = false
                }
            },

            //导出Excel将数字状态转化文字
            transExcelData(allList) {
                let list = allList
                list.forEach(item => {
                    item.status = this.statusMap[item.status]
                    if (item.advType === 5101 || item.advType === 5103) {
                        item.advType = this.advTypeMap[item.advType] + '-' + item.orderId
                    } else {
                        item.advType = this.advTypeMap[item.advType]
                    }
                })
                return list
            }
        }
    }
</script>

<style>

</style>
