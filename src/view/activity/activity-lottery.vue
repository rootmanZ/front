<template>
  <div>
    <!--抽奖活动模块-->
    <FormItem label="抽奖形式" prop="">
      <Select v-model="actConfig.luckyDrawExp.lotteryForm" style="width: 120px" clearable>
        <Option v-for="item in lotteryFormList" :value="item.label" :key="item.label">{{item.value}}</Option>
      </Select>
    </FormItem>
    <FormItem label="参与条件" prop="">
      <CheckboxGroup v-model="actConfig.condition">
        <Checkbox label="手机注册用户"></Checkbox>
        <Checkbox label="关注用户"></Checkbox>
      </CheckboxGroup>
    </FormItem>
    <FormItem label="参与次数" prop="">
      活动期间最多有&nbsp<Input v-model="actConfig.luckyDrawExp.maximum" size="small" style="width:40px;height:20px"></Input>&nbsp次抽奖机会
      &nbsp&nbsp&nbsp
      每天最多有&nbsp<Input v-model="actConfig.luckyDrawExp.maximum" size="small" style="width:40px;height:20px"></Input>&nbsp次抽奖机会
    </FormItem>
    <FormItem label="分享" prop="">
      <div>
        <div style="display:inline-block;vertical-align:middle">
          标题：<Input v-model="actConfig.luckyDrawExp.shareConfigExp.shareTitle" style="width: 200px"
                    placeholder="输入30个字以内"
                    clearable/></div>
        &nbsp&nbsp&nbsp
        <!--图片上传组件-->
        <div style="display:inline-block;vertical-align:middle">图片：&nbsp</div>
        <div style="display:inline-block;vertical-align:middle">
          <component v-bind:is="uploadImg" ref="uploadImg"></component>
        </div>
      </div>
      描述：<Input v-model="actConfig.luckyDrawExp.shareConfigExp.shareDes" style="width: 520px" placeholder="输入30个字以内"
                clearable/>
    </FormItem>
    <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">奖品池设置</Divider>
    <!--奖品列表-->
    <Table ref="tablesMain" :data="prizesList" :columns="columns" :loading="listLoading" :border="true">
      <template slot="status" slot-scope="scope">
        {{statusType[scope.row.status]}}
      </template>
      <template slot="actType" slot-scope="scope">
        {{actTypeType[scope.row.actType]}}
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <Button type="primary" size="small" style="margin-right: 5px" @click="handleUpdate(row.id)">编辑</Button>
        <Button type="error" size="small" @click="handleDelete(row.id)">删除</Button>
      </template>
    </Table>
    <div>
      <Page v-show="total>0" :total="total" :current.sync="listQuery.current" :page-size="listQuery.size"
            show-total show-sizer show-elevator style="display:inline-block;vertical-align:middle"
            @on-change="getList" @on-page-size-change="handlePageSize"/>
      <div class="add-prizes">
        <Button type="success" icon="md-add" @click="handleCreatePrize">添加奖项</Button>
      </div>
    </div>

    <!--奖品-->
    <Modal :title="textMap[dialogStatusPrizes]" v-model="dialogFormVisiblePrizes" :closable="false"
           :mask-closable="false" :width="800">
      <Form ref="dataForm" :rules="rulesPrizes" :model="tempPrizes" :label-width="100" inline>
        <FormItem label="奖品类型">
          <Select v-model="tempPrizes.prizeType" style="width:150px" clearable>
            <Option v-for="item in prizeTypeList" :value="item.label" :key="item.value">{{item.value}}</Option>
          </Select>
        </FormItem>
        <FormItem label="虚拟物品类型">
          <Select v-model="tempPrizes.virtualGoodType" style="width:150px" clearable>
            <Option v-for="item in virtualGoodList" :value="item.label" :key="item.value">{{item.value}}</Option>
          </Select>
        </FormItem>
        <Button v-if="tempPrizes.virtualGoodType === '0'" type="success" icon="md-search" @click="">查看所有优惠券</Button>
        <br>
        <FormItem label="奖项名称">
          <Input v-model="tempPrizes.name" style="width:200px" clearable/>
        </FormItem>
        <FormItem label="优惠券金额" v-if="tempPrizes.virtualGoodType === '0'">
          <Input v-model="tempPrizes.PrizeExtExp.couponPrice"
                 style="width:100px" clearable/>
        </FormItem>
        <br>
        <FormItem label="奖项等级">
          <Select v-model="tempPrizes.prizeType" style="width:150px" clearable>
            <!--<Option v-for="" :value="item.tagId" :key="item.tagId">{{item.tagName}}</Option>-->
          </Select>
        </FormItem>
        <FormItem label="中奖率">
          <Input v-model="tempPrizes.PrizeExtExp.winRate" style="width: 70px"> <span slot="append">%</span></Input>
        </FormItem>
        <FormItem label="奖项图片">
          <component v-bind:is="uploadImg" ref="uploadImg"></component>
        </FormItem>
        <br>
        <FormItem label="奖项数量">
          每日固定数量&nbsp<Input v-model="tempPrizes.dailyNum" style="width:100px"></Input>&nbsp&nbsp
          总数量&nbsp<Input v-model="tempPrizes.totalNum" style="width:100px"></Input>
        </FormItem>
        <br>
        <FormItem label="奖项描述">
          <Input v-model="tempPrizes.PrizeExtExp.priceDes" style="width:380px" clearable/>
        </FormItem>
        <br>
        <FormItem label="领取方式">
          <Select v-model="tempPrizes.prizeType" style="width:200px" clearable>
            <!--<Option v-for="" :value="item.tagId" :key="item.tagId">{{item.tagName}}</Option>-->
          </Select>
        </FormItem>


      </Form>
      <div slot="footer">
        <Button @click="dialogFormVisiblePrizes = false">取消</Button>
        <Button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import uploadImg from './upload-img.vue'

  export default {
    name: 'activity-lottery',
    components: {uploadImg},
    data() {
      return {
        uploadImg: 'uploadImg',
        //表单信息
        actConfig: {
          condition: [],
          luckyDrawExp: {
            lotteryForm: null,
            maximum: null,
            dayMaximum: null,
            shareConfigExp: {
              shareTitle: null,
              sharePic: null,
              shareDes: null
            }
          }
        },
        textMap: {
          update: '修改奖品',
          create: '新增奖品'
        },
        //奖项列表信息
        listQuery: {
          current: 1,
          size: 10,
          actId: null
        },
        total: 10,
        listLoading: false,
        dialogFormVisiblePrizes: false,
        dialogStatusPrizes: '',
        //奖品数据模型
        prizesList: [],
        tempPrizes: {
          prizeType: null,
          name: null,
          level: null,
          prizeIcon: null,
          dailyNum: null,
          totalNum: null,
          virtualGoodType: null,
          PrizeExtExp: {
            prizeName: null,
            probability: null,
            couponPrice: null,
            prizeDes: null,
            prizeAccept: null
          }
        },
        rulesPrizes: {},
        columns: [
          {
            title: '奖项名称',
            key: 'name'
          },
          {
            title: '奖项类型',
            key: 'prizeType'
          },
          {
            title: '奖项等级',
            key: 'level'
          },
          {
            title: '奖品名称',
            key: 'prizeName'
          },
          {
            title: '奖项数量',
            slot: 'totalNum'
          },
          {
            title: '中奖率',
            key: 'createTime'
          },
          {
            title: '领奖方式',
            key: 'createTime'
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        lotteryFormList: [
          {
            value: '博饼',
            label: '1'
          },
          {
            value: '幸运时光机',
            label: '2'
          },
          {
            value: '刮刮乐',
            label: '3'
          },
          {
            value: '摇一摇',
            label: '4'
          },
          {
            value: '大转盘',
            label: '5'
          },
          {
            value: '九宫格',
            label: '6'
          },
          {
            value: '翻牌',
            label: '7'
          }
        ],
        prizeTypeList: [
          {
            value: '未中奖',
            label: '0'
          },
          {
            value: '虚拟物品',
            label: '1'
          },
          {
            value: '邮寄实物',
            label: '2'
          },
          {
            value: '线下处理物品',
            label: '3'
          }
        ],
        virtualGoodList: [
          {
            value: '优惠券',
            label: '0'
          },
          {
            value: '话费',
            label: '1'
          },
          {
            value: '积分',
            label: '2'
          },
          {
            value: '现金',
            label: '3'
          }
        ]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {

      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getList()
      },
      handleCreatePrize() {
        debugger
        this.dialogStatusPrizes = 'create'
        this.dialogFormVisiblePrizes = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          this.resetTemp()
        })
      },
      handleUpdatePrize() {
        this.$refs['dataForm'].resetFields()
        fectchInfo(id).then(res => {
          this.tempPrizes = Object.assign({}, res.data) // copy obj
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
        })
      }
    }
  }
</script>

<style>
  .add-prizes {
    margin-left: 20px;
    margin-top: 10px;
    text-align: center;
    display: inline-block;
    vertical-align: middle
  }
</style>>
