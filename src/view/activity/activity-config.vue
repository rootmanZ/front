<template>
  <div>
    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" :closable="false"
           :width="1000">
      <Steps :current="currentStep" class="ivu-steps">
        <Step title="基础配置" content="填写活动基础信息"></Step>
        <Step title="规则配置" content="设置活动规则"></Step>
      </Steps>
      <Divider></Divider>

      <Form ref="dataForm" :label-width="100" v-model="temp" :rules="ruleValidate">
        <!--基础配置-->
        <div v-if="currentStep === 0">
          <FormItem label="活动类型" prop="actType">
            <Select v-model="temp.actType" style="width: 120px" clearable>
              <Option v-for="item in actTypeList" :value="item.label" :key="item.label">{{item.value}}</Option>
            </Select>
          </FormItem>
          <FormItem label="活动主题" prop="title">
            <Input v-model="temp.title" style="width: 520px" placeholder="输入30个字以内" clearable/>
          </FormItem>
          <FormItem label="活动主题图">
            <div>（注：图片格式支持.jpg .jpeg .png ，大小不超过3M）</div>
            <!--图片上传组件-->
            <component v-bind:is="uploadImg" ref="uploadImg"></component>
          </FormItem>
          <FormItem label="活动简介" prop="summary">
            <Input v-model="temp.summary" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                   style="width: 520px" placeholder="请输入简介、描述、宣传等话术" clearable/>
          </FormItem>
          <FormItem label="活动有效期">
            <DatePicker :value="temp.rangeTime" type="daterange" formart="daterange"
                        @on-change="listQuery.rangeTime=$event"
                        placement="right-start"
                        placeholder="选择时间"></DatePicker>
          </FormItem>
          <FormItem label="活动内容及说明">
            <!--富文本编辑器-->
          </FormItem>
        </div>
        <!--规则配置-->
        <div v-if="currentStep === 1">
          <!--抽奖活动模块-->
          <component v-bind:is="activityLottery" ref="activityLottery"></component>
        </div>
      </Form>
      <br>
      <div class="forward-backward">
        <ButtonGroup>
          <Button type="primary" v-bind:disabled="buttonBackward" @click="handleBackward">
            <Icon type="ios-arrow-back"/>
            上一步
          </Button>
          <Button type="primary" v-bind:disabled="buttonForward" @click="handleForward">
            下一步
            <Icon type="ios-arrow-forward"/>
          </Button>
        </ButtonGroup>
      </div>
      <div slot="footer">
        <Button @click="dialogFormVisible = false" align="right">取消</Button>
        <Button type="primary" v-if="currentStep===1" @click="" align="right">保存</Button>
      </div>
    </modal>
  </div>
</template>

<script>
  import activityLottery from './activity-lottery.vue'
  import uploadImg from './upload-img.vue'
  import Divider from "iview/src/components/divider/divider";

  export default {
    name: 'activity-config',
    components: {
      Divider, uploadImg, activityLottery
    },
    data() {
      return {
        uploadImg: 'uploadImg',
        activityLottery: 'activityLottery',
        temp: {
          id: null,
          title: null,
          actType: '',
          actPic: null,
          summary: null,
          context: null,
          status: '',
          rangeTime: null,
          actConfig: {},
          prizes: []
        },
        ruleValidate: {
          title: [
            {required: true, message: '活动主题不能为空', trigger: 'blur'},
            {type: 'string', max: 30, message: '活动主题不能超过30字', trigger: 'blur'}],
          actType: [{required: true, message: '活动类型不能为空', trigger: 'change'}]
        },
        textMap: {
          update: '修改活动',
          create: '新增活动'
        },
        statusList: [
          {
            value: '未开始',
            label: '0'
          },
          {
            value: '进行中',
            label: '1'
          },
          {
            value: '已下架',
            label: '2'
          }
        ],
        actTypeList: [
          {
            value: '抽奖类活动',
            label: '0'
          },
          {
            value: '礼包类活动',
            label: '1'
          }
        ],
        currentStep: 0,
        listLoading: false,
        dialogFormVisible: false,
        dialogStatus: '',
        buttonBackward: true,
        buttonForward: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.list = response.data.records
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getList()
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          this.resetTemp()
        })
      },
      handleUpdate(id) {
        this.$refs['dataForm'].resetFields()
        fectchInfo(id).then(res => {
          this.temp = Object.assign({}, res.data) // copy obj
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            create(this.temp).then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '新增成功'})
            })
          }
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            update(this.temp).then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '修改成功'})
            })
          }
        })
      },
      handleStopActivity(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将停止活动的使用, 是否继续?',
          onOk: () => {
            remove(id).then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '下架成功'})
            })
          }
        })
      },
      handleRestartActivity(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将重启该活动, 是否继续?',
          onOk: () => {

          }
        })
      },
      handleBackward() {
        if (this.currentStep !== 0) {
          this.currentStep -= 1
          this.buttonForward = false
          this.buttonBackward = true
        }
      },
      handleForward() {
        if (this.currentStep !== 1) {
          this.currentStep += 1
          this.buttonForward = true
          this.buttonBackward = false
        }
      }
    }
  }
</script>

<style>
  .ivu-steps {
    background-color: transparent;
    align-content: center;
    width: 1070px;
    margin-left: 150px;
    margin-right: 150px;
  }

  .forward-backward {
    text-align: center;
    vertical-align: middle
  }
</style>>
