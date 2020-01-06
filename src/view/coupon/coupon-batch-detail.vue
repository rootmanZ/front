<template>
    <div>
      <div class="search-con">
        <Select v-model="listQuery.status" clearable style="width:200px" placeholder="请选择送券状态">
          <Option v-for="item in statusEnum" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button class="search-btn" type="primary" @click="getList" icon="md-search">搜索</Button>
      </div>
      <Table ref="tablesMain" :data="list" :columns="columns" :loading="listLoading">
        <template slot-scope="{ row, index }" slot="stautsEn">
          <span v-for="item in statusEnum" v-if="item.value === row.status">{{item.label}}</span>
        </template>
      </Table>
      <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
            show-total show-sizer show-elevator
            @on-change="getList" @on-page-size-change="handlePageSize"/>
    </div>
</template>

<script>
import { fetchList } from '@/api/coupon/detail'

export default {
  name: 'coupon-batch-detail',

  data () {
    return {
      // 送券状态枚举
      statusEnum: [
        {
          value: 1,
          label: '送券成功'
        },
        {
          value: 2,
          label: '送券失败'
        }
      ],

      // 送券明细列表
      columns: [
        {
          title: '明细ID',
          key: 'id',
          align: 'center'
        },
        {
          title: '登录账号',
          key: 'title',
          align: 'center'
        },
        {
          title: '手机号',
          key: 'phone',
          align: 'center'
        },
        {
          title: '发送状态',
          key: 'status',
          slot: 'stautsEn',
          align: 'center'
        },
        {
          title: '发送结果',
          key: 'result',
          align: 'center'
        },
        {
          title: '发送时间',
          key: 'createTime',
          width: 150,
          align: 'center'
        }
      ],
      listQuery: {
        current: 1,
        size: 10,
        status: null
      },
      list: [],
      total: 10,
      listLoading: false
    }
  },

  created () {
    this.getList()
  },
  methods: {
    getList () {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handlePageSize (value) {
      this.listQuery.size = value
      this.getList()
    }
  }
}
</script>

<style scoped>

</style>
