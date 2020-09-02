<template>
  <div>
    <!--博饼等级配置-->
    <Row>
      <Col :span="12">
      <Table ref="tablesMain" :data="gamblingGradeData.slice(0,7)" :columns="columns" size="small" width="550"
             :border="true">

        <template slot="probability" slot-scope="{ row, index }">
          <!--
          当前版本的iView，在table中嵌套 input：每输入一个字符就会自动跳出焦点
          解决办法：
          1.Input事件中将整行数据放入数组对应的位置
          2.创建一个临时空数组
          -->
          <Form :model="row" ref="probability">
            <FormItem prop="probability"
                      :rules="probability"
                      style="margin-top: 20px">
              <Input type="text"
                     size="small"
                     v-model="row.probability"
                     @on-keydown="row.probability=row.probability.replace(/[^\d]/g,'')"
                     @on-keyup="row.probability=row.probability.replace(/[^\d]/g,'')"
                     :maxlength="10"
                     @input="(value)=>{row.probability = value; this.gamblingGradeData[index] = row}"
                     @on-blur="blurProbability(row,index)"
                     :readonly="optStatus=== 'detail'">
              </Input>
            </FormItem>
          </Form>
        </template>

        <template slot="point" slot-scope="{ row, index }">
          <Form :model="row" ref="point">
            <FormItem prop="point"
                      :rules="point"
                      style="margin-top: 20px">
              <Input type="text"
                     size="small"
                     v-model="row.point"
                     @on-keydown="row.point=row.point.replace(/[^\d]/g,'')"
                     @on-keyup="row.point=row.point.replace(/[^\d]/g,'')"
                     :maxlength="10"
                     @input="(value)=>{row.point = value; this.gamblingGradeData[index] = row}"
                     @on-blur="blurPoint(row,index)"
                     :readonly="optStatus=== 'detail'">
              </Input>
            </FormItem>
          </Form>
        </template>

        <template slot="hintGraph" slot-scope="{ row, index }">
          <ImgUpload ref="row.gradeName"
                     :requiredWidth="654"
                     :requiredHeight="852"
                     :opt-status="optStatus"
                     :width="50"
                     :height="50"
                     :showPx="false"
                     :initUrl="row.hintGraph"
                     v-model="row.hintGraph"
                     @getImgUrl="getImgData($event,index)"/>
        </template>
      </Table>
      </Col>
      <Col :span="12">
      <Table ref="tablesMain" :data="gamblingGradeData.slice(7,13)" :columns="columns" size="small" width="550"
             :border="true">

        <template slot="probability" slot-scope="{ row, index }">
          <Form :model="row" ref="probability">
            <FormItem prop="probability"
                      :rules="probability"
                      style="margin-top: 20px">
              <Input type="text"
                     size="small"
                     v-model="row.probability"
                     @on-keydown="row.probability=row.probability.replace(/[^\d]/g,'')"
                     @on-keyup="row.probability=row.probability.replace(/[^\d]/g,'')"
                     :maxlength="10"
                     @input="(value)=>{row.probability = value; this.gamblingGradeData[index+7] = row}"
                     @on-blur="blurProbability(row,index+7)"
                     :readonly="optStatus=== 'detail'">
              </Input>
            </FormItem>
          </Form>
        </template>

        <template slot="point" slot-scope="{ row, index }">
          <Form :model="row" ref="point">
            <FormItem prop="point"
                      :rules="point"
                      style="margin-top: 20px">
              <Input type="text"
                     size="small"
                     v-model="row.point"
                     @on-keydown="row.point=row.point.replace(/[^\d]/g,'')"
                     @on-keyup="row.point=row.point.replace(/[^\d]/g,'')"
                     :maxlength="10"
                     @input="(value)=>{row.point = value; this.gamblingGradeData[index+7] = row}"
                     @on-blur="blurPoint(row,index+7)"
                     :readonly="optStatus=== 'detail'">
              </Input>
            </FormItem>
          </Form>
        </template>

        <template slot="hintGraph" slot-scope="{ row, index }">
          <ImgUpload ref="row.gradeName"
                     :requiredWidth="654"
                     :requiredHeight="852"
                     :opt-status="optStatus"
                     :width="50"
                     :height="50"
                     :showPx="false"
                     :initUrl="row.hintGraph"
                     v-model="row.hintGraph"
                     @getImgUrl="getImgData($event,index+7)"/>
        </template>
      </Table>
      </Col>
    </Row>
  </div>
</template>
<script>
import ImgUpload from '_c/uploader/img-upload.vue'

export default {
  components: { ImgUpload },
  name: 'GamblingGradeConfig',
  // 传入参数
  props: {
    // 操作状态
    optStatus: {
      type: String,
      required: true
    },

    gamblingGradeList: {
      type: Array,
      required: true
    }

  },
  data () {
    let regExp = /^[0-9]*[1-9][0-9]*$/
    let validaterIntLimit = (rule, value, callback) => {
      let reg = new RegExp(regExp)
      if (value) {
        if (value.match(reg) == null) {
          callback(new Error('请输入正整数'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      columns: [
        {
          title: '博饼等级',
          key: 'gradeName',
          align: 'center'
        },
        {
          title: '博中概率(权重)',
          slot: 'probability',
          align: 'center'
        },
        {
          title: '积分',
          slot: 'point',
          align: 'center'
        },
        {
          title: '中奖提示图',
          slot: 'hintGraph',
          align: 'center'
        }
      ],
      gradesList: [
        {
          grade: 0,
          gradeName: '无'
        },
        {
          grade: 1,
          gradeName: '一秀'
        },
        {
          grade: 2,
          gradeName: '二举'
        },
        {
          grade: 3,
          gradeName: '四进'
        },
        {
          grade: 4,
          gradeName: '三红'
        },
        {
          grade: 5,
          gradeName: '对堂'
        },
        {
          grade: 6,
          gradeName: '状元'
        },
        {
          grade: 7,
          gradeName: '五子'
        },
        {
          grade: 8,
          gradeName: '五王'
        },
        {
          grade: 9,
          gradeName: '六勃黑'
        },
        {
          grade: 10,
          gradeName: '遍地锦'
        },
        {
          grade: 11,
          gradeName: '满堂红'
        },
        {
          grade: 12,
          gradeName: '状元插金花'
        }
      ],
      gamblingGradeData: [],
      gradeConfig: {
        grade: null, // 等级
        gradeName: null,
        probability: null, // 中奖概率
        point: null, // 积分
        hintGraph: ''// 中奖提示图
      },
      probability: [{ required: true, message: '必填项', trigger: 'change' }],
      point: [{ required: true, message: '必填项', trigger: 'change' }]
    }
  },
  created () {
    this.initTable()
  },
  mounted: function () {

  },
  watch: {
    gamblingGradeData (newDate, oldDate) {
      this.$emit('getGamblingGradeList', this.gamblingGradeData)
    }
  },
  methods: {
    initTable () {
      if (this.gamblingGradeList.length === 0) {
        for (let i = 0; i < this.gradesList.length; i++) {
          this.gradeConfig.grade = this.gradesList[i].grade
          this.gradeConfig.gradeName = this.gradesList[i].gradeName
          this.gamblingGradeData.push(this.gradeConfig)
          this.resetGradeConfig()
        }
      } else {
        this.gamblingGradeData = this.gamblingGradeList
      }
    },

    // 离焦保存数据
    blurProbability (row, index) {
      this.gamblingGradeData[index].probability = row.probability
    },
    blurPoint (row, index) {
      this.gamblingGradeData[index].point = row.point
    },

    // 从组件获取图片url
    getImgData (imgUrl, index) {
      this.gamblingGradeData[index].hintGraph = imgUrl
    },

    resetGradeConfig () {
      this.gradeConfig = {
        grade: null, // 等级
        gradeName: null,
        probability: null, // 中奖概率
        point: null, // 积分
        hintGraph: ''// 中奖提示图
      }
    }
  }
}
</script>
<style lang="less">

</style>
