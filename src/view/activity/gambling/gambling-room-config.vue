<template>
  <div>
    <!--博饼包间列表-->
    <Table ref="tablesMain" :data="gamblingRoomsList" :columns="columns" :loading="listLoadingGamblingRoom"
           :border="true">
      <template slot-scope="{ row, index }" slot="logo">
        <ImgUpload ref="row.name"
                   :required-width="100"
                   :required-height="100"
                   :width="50"
                   :height="50"
                   :show-px="false"
                   optStatus="detail"
                   :init-url="row.roomExt.logo"/>
      </template>

      <template slot-scope="scope" slot="orderId">
        <span v-if="scope.row.orderNo == 0">置顶</span>
        <span v-else>{{scope.row.orderNo}}</span>
      </template>

      <template slot-scope="{ row, index }" slot="slogan">
        <span>{{row.roomExt.slogan}}</span>
      </template>

      <template slot-scope="{ row, index }" slot="advList">
        <span v-for="(item,index) in row.roomExt.advList">{{item.advTitle}}&nbsp</span>
      </template>

      <template slot-scope="{ row, index }" slot="action">
        <Button v-if="$viewAccess('act:gamblingRoom:edit')" type="primary" size="small" style="margin-right: 5px"
                @click="optStatus==='create'?handleUpdateGamblingRoomByCreate(index):handleUpdateGamblingRoom(row.id)">
          编辑
        </Button>
        <Button v-if="$viewAccess('act:gamblingRoom:delete')" type="error" size="small"
                @click="optStatus==='create'?handleDeleteGamblingRoomByCreate(index):handleDeleteGamblingRoom(row.id)">
          删除
        </Button>
      </template>
    </Table>
    <div>
      <Page v-show="true" :total="total" :current.sync="listQueryGamblingRoom.current"
            :page-size="listQueryGamblingRoom.size"
            show-total show-sizer show-elevator style="display:inline-block;vertical-align:middle"
            @on-change="getGamblingRoomList(actId)" @on-page-size-change="handleGamblingRoomPageSize"/>
      <div class="add-gamblingRooms">
        <Button v-if="$viewAccess('act:gamblingRoom:add') && optStatus !=='detail'"
                type="success"
                icon="md-add"
                size="small"
                @click="handleCreateGamblingRoom()">添加博饼包间
        </Button>
      </div>
    </div>
    <!--博饼包间编辑对话框-->
    <Modal :title="textMapGamblingRoom[optStatus]"
           v-model="dialogFormVisibleGamblingRooms"
           @on-cancel="resetTempGamblingRoom"
           :mask-closable="false"
           :width="1000">

      <Form ref="dataFormGamblingRoom" :rules="rulesGamblingRooms" :model="tempGamblingRoom" :label-width="145" inline>
        <Row>
          <Col :span="14">
          <FormItem label="博饼包间名称" prop="name">
            <Input v-model="tempGamblingRoom.name" placeholder="博饼包间名称(10字以内)" style="width:150px" :maxlength="10"
                   clearable/>
          </FormItem>
          <FormItem label="包间排序" prop="orderNo">
            <Select v-model="tempGamblingRoom.orderNo"
                    @on-change="changeOrderNo"
                    style="width:150px"
                    clearable>
              <Option :value=0>置顶</Option>
              <Option v-for="index in 99" :value="index" :key="index">{{index}}</Option>
            </Select>
          </FormItem>
          <FormItem>
            （注：置顶的包间封面将主要凸显，尺寸规格与其他排序封面区分）
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="包间封面图片" prop="roomExt.coverImg">
            <!--置顶的封面照片-->
            <ImgUpload v-if="tempGamblingRoom.orderNo === 0"
                       ref="coverImg"
                       :requiredWidth="644"
                       :requiredHeight="340"
                       :initUrl="tempGamblingRoom.roomExt.coverImg"
                       @getImgUrl="getImgData($event,'coverImg')"/>
            <!--非置顶的封面照片-->
            <ImgUpload v-else
                       ref="coverImg"
                       :requiredWidth="300"
                       :requiredHeight="134"
                       :initUrl="tempGamblingRoom.roomExt.coverImg"
                       @getImgUrl="getImgData($event,'coverImg')"/>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="14">
          <FormItem label=" 包间宣传语">
            <Input v-model="tempGamblingRoom.roomExt.slogan" style="width: 300px"
                   placeholder="包间宣传语(20字以内)" :maxlength="20" clearable/>
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="包间宣传语文字颜色" prop="roomExt.sloganColor">
            <Input v-model="tempGamblingRoom.roomExt.sloganColor" style="width: 100px"
                   placeholder="" :maxlength="10" clearable/>
            <ColorPicker v-model="tempGamblingRoom.roomExt.sloganColor"/>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <FormItem label="冠名商名称">
            <Input v-model="tempGamblingRoom.entName" placeholder="冠名商名称(10字以内)" style="width:150px"
                   :maxlength="10" clearable/>
          </FormItem>
        </Row>

        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">包间模板设置</Divider>
        <Alert show-icon>
          <Row>
            <Col :span="18">
            （注：图片格式支持.jpg .png .gif，建议按图片的分辨率上传显示效果最好，大小建议不超过1M）
            </Col>
            <Col :span="6">
            <Button @click="tempImgVisible = true"
                    size="small"
                    type="info"> 参看参考示例图
            </Button>
            </Col>
          </Row>
        </Alert>
        <Row>
          <Col :span="8">
          <FormItem label="包间名称背景图" prop="roomExt.nameBackground">
            <ImgUpload ref="nameBackground"
                       :requiredWidth="550"
                       :requiredHeight="80"
                       :initUrl="tempGamblingRoom.roomExt.nameBackground"
                       @getImgUrl="getImgData($event,'nameBackground')"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="包间说明框背景图" prop="roomExt.descBackground">
            <ImgUpload ref="descBackground"
                       :requiredWidth="650"
                       :requiredHeight="204"
                       :initUrl="tempGamblingRoom.roomExt.descBackground"
                       @getImgUrl="getImgData($event,'descBackground')"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="包间博饼碗背景图" prop="roomExt.bowlImg">
            <ImgUpload ref="bowlImg"
                       :requiredWidth="470"
                       :requiredHeight="411"
                       :initUrl="tempGamblingRoom.roomExt.bowlImg"
                       @getImgUrl="getImgData($event,'bowlImg')"/>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="8">
          <FormItem label="包间品牌Logo" prop="roomExt.logo">
            <ImgUpload ref="logo"
                       :requiredWidth="118"
                       :requiredHeight="118"
                       :initUrl="tempGamblingRoom.roomExt.logo"
                       @getImgUrl="getImgData($event,'logo')"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="包间说明框按钮背景图" prop="roomExt.descBtnBackground">
            <ImgUpload ref="descBtnBackground"
                       :requiredWidth="144"
                       :requiredHeight="44"
                       :initUrl="tempGamblingRoom.roomExt.descBtnBackground"
                       @getImgUrl="getImgData($event,'descBtnBackground')"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="换其他包间按钮背景图" prop="roomExt.otherRoomBtnBackground">
            <ImgUpload ref="otherRoomBtnBackground"
                       :requiredWidth="160"
                       :requiredHeight="104"
                       :initUrl="tempGamblingRoom.roomExt.otherRoomBtnBackground"
                       @getImgUrl="getImgData($event,'otherRoomBtnBackground')"/>
          </FormItem>
          </Col>
        </Row>

        <Row>
          <Col :span="8">
          <FormItem label="包间背景图" prop="roomExt.roomBackground">
            <ImgUpload ref="roomBackground"
                       :requiredWidth="750"
                       :requiredHeight="1184"
                       :initUrl="tempGamblingRoom.roomExt.roomBackground"
                       @getImgUrl="getImgData($event,'roomBackground')"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="包间页背景颜色值" prop="roomExt.roomBackColor">
            <Input v-model="tempGamblingRoom.roomExt.roomBackColor" style="width: 100px"
                   placeholder="" :maxlength="10" clearable/>
            <ColorPicker v-model="tempGamblingRoom.roomExt.roomBackColor"/>
          </FormItem>
          <FormItem label="说明文字颜色值" prop="roomExt.descColor">
            <Input v-model="tempGamblingRoom.roomExt.descColor" style="width: 100px"
                   placeholder="" :maxlength="10" clearable/>
            <ColorPicker v-model="tempGamblingRoom.roomExt.descColor"/>
          </FormItem>
          </Col>
          <Col :span="8">
          <FormItem label="包间剩余次数背景图" prop="roomExt.timesBackground">
            <ImgUpload ref="timesBackground"
                       :requiredWidth="110"
                       :requiredHeight="183"
                       :initUrl="tempGamblingRoom.roomExt.timesBackground"
                       @getImgUrl="getImgData($event,'timesBackground')"/>
          </FormItem>
          </Col>
        </Row>

        <Divider orientation="left" style="font-size: 16px;color:#2d8cf0"></Divider>
        <FormItem label="包间广告">
          <Alert show-icon style="width: 700px">
              <span>
                （注：从i车位广告列表选择-博饼广告位, i车位广告下架后需要将包间广告删除配置）
              </span>
          </Alert>
          <Row>
              <span>
              已配置{{tempGamblingRoom.roomExt.advList.length}}个广告:
              </span>
          </Row>
          <Row>
              <span v-for="item in tempGamblingRoom.roomExt.advList">
                    <Button type="primary"
                            size="small"
                            style="margin-left:10px;width: 150px"
                            ghost>{{item.advTitle}}
                      <Icon type="ios-trash-outline"
                            style="margin-right: 5px;color: red"
                            size="18"
                            @click="removeAdv(item.adverId)">
                      </Icon>
                    </Button>
              </span>
          </Row>

          <Row>
              <span>
                i车位目前生效的广告:
              </span>
          </Row>
          <Row>
            <CheckboxGroup v-model="selectedAdvIdList" @on-change="changeAdvCheckbox">
              <Checkbox v-for="(item,index) in iParkingAdvList"
                        :label="item.adverId"
                        :key="item.adverId"
                        style="margin-right: 10px"
                        border>
                {{item.advTitle}}
              </Checkbox>
            </CheckboxGroup>
          </Row>
        </FormItem>

        <!--包间博饼次数-->
        <Row>
          <Col span="12">
          <FormItem label="博饼次数" prop="times">
            每人每天固定有&nbsp
            <Input v-model="tempGamblingRoom.times"
                   size="small"
                   @on-keydown="tempGamblingRoom.times=tempGamblingRoom.times.replace(/[^\d]/g,'')"
                   @on-keyup="tempGamblingRoom.times=tempGamblingRoom.times.replace(/[^\d]/g,'')"
                   style="width:100px;height:20px"
                   :maxlength="10"
                   clearable>
            </Input>
            &nbsp次博饼机会
          </FormItem>
          </Col>
          <Col span="12">
          <FormItem prop="weight">
            额外获得博饼机会的随机权重&nbsp
            <Input v-model="tempGamblingRoom.weight" size="small"
                   @on-keydown="tempGamblingRoom.weight=tempGamblingRoom.weight.replace(/[^\d]/g,'')"
                   @on-keyup="tempGamblingRoom.weight=tempGamblingRoom.weight.replace(/[^\d]/g,'')"
                   style="width:100px;height:20px" :maxlength="10" clearable>
            </Input>
          </FormItem>
          </Col>
        </Row>

      </Form>
      <div slot="footer">
        <Button type="success"
                v-if="$viewAccess('act:gamblingRoom:preview')"
                @click="showPreviewQr">预览
        </Button>
        <Button @click="dialogFormVisibleGamblingRooms = false ">取消</Button>
        <Button type="primary"
                v-if="$viewAccess('act:gamblingRoom:add') && optStatus==='create'"
                @click="dialogStatusGamblingRooms==='create'?createGamblingRoomDataByCreate():updateGamblingRoomDataByCreate()">
          保存
        </Button>
        <Button type="primary"
                v-if="$viewAccess('act:gamblingRoom:add') && optStatus==='update'"
                @click="dialogStatusGamblingRooms==='create'?createGamblingRoomData():updateGamblingRoomData()">保存
        </Button>
      </div>

      <Modal title="参看包间参考示例" v-model="tempImgVisible">
        <img src="../../../assets/images/gambling/room-page.png" style="width: 100%"/>
      </Modal>

      <Modal title="包间效果预览" v-model="previewVisible" :width="300" style="text-align:center">
        <vue-qr :text="previewUrl"
                :size="200">
        </vue-qr>
      </Modal>
    </Modal>
  </div>
</template>
<script>
  import * as gamblingRoomApi from '@/api/activity/gamblingRoom'
  import FormItem from 'iview/src/components/form/form-item'
  import ImgUpload from '_c/uploader/img-upload.vue'
  import vueQr from 'vue-qr'

  export default {
    components: {FormItem, ImgUpload, vueQr},
    name: 'GamblingRoomConfig',
    // 传入参数
    props: {
      // 操作状态
      optStatus: {
        type: String,
        required: true
      },
      actId: {
        type: String,
        required: true
      },
      gamblingRooms: {
        type: Array,
        required: true
      }
    },
    watch: {
      gamblingRooms: function (newVal, oldVal) {
        this.gamblingRoomsList = this.gamblingRooms
      }
    },
    data() {
      let colorReg = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
      let validateColor = (rule, value, callback) => {
        if ((value !== '') && !colorReg.test(value)) {
          callback(new Error('颜色格式错误'))
        } else {
          callback()
        }
      }

      return {
        visibleGamblingRoom: false,
        gamblingRoomsList: [],
        // 博饼包间数据模型
        // 博饼包间对象
        tempGamblingRoom: {
          id: null,
          actId: null,
          name: null,
          orderNo: null,
          entName: null,
          times: null, // 每日博饼次数
          weight: null, // 额外博饼次数权重
          roomExt: {
            coverImg: '', // 包间封面图片
            slogan: '', // 包间宣传语
            sloganColor: '', // 包间宣传语文字颜色
            nameBackground: '', // 包间名称背景图
            logo: '', // 包间品牌logo
            roomBackground: '', // 包间背景图
            roomBackColor: '', // 包间页背景颜色
            descBackground: '', // 包间说明框背景
            descBtnBackground: '', // 包间说明框按钮背景
            descColor: '', // 说明文字颜色
            bowlImg: '', // 包间博饼碗图片
            otherRoomBtnBackground: '', // 其他包间按钮背景
            timesBackground: '', // 剩余次数背景
            advList: []// 包间广告
          }
        },
        // 博饼包间校验
        rulesGamblingRooms: {
          name: [{required: true, message: '博饼包间名称不能为空'}],
          orderNo: [{required: true, message: '博饼包间排序不能为空'}],
          'roomExt.coverImg': [{required: true, message: '需上传图片'}],
          'roomExt.sloganColor': [{required: false, validator: validateColor}],
          'roomExt.nameBackground': [{required: true, message: '需上传图片'}],
          'roomExt.descBackground': [{required: true, message: '需上传图片'}],
          'roomExt.bowlImg': [{required: true, message: '需上传图片'}],
          'roomExt.logo': [{required: true, message: '需上传图片'}],
          'roomExt.descBtnBackground': [{required: true, message: '需上传图片'}],
          'roomExt.otherRoomBtnBackground': [{required: true, message: '需上传图片'}],
          'roomExt.roomBackground': [{required: true, message: '需上传图片'}],
          'roomExt.roomBackColor': [
            {required: true, message: '必填项'},
            {validator: validateColor}],
          'roomExt.descColor': [
            {required: true, message: '必填项'},
            {validator: validateColor}],
          'roomExt.timesBackground': [{required: true, message: '需上传图片'}],
          times: [{required: true, message: '必填项'}],
          weight: [{required: true, message: '必填项'}]
        },
        total: 10,
        listLoadingGamblingRoom: false,
        dialogFormVisibleGamblingRooms: false,
        dialogStatusGamblingRooms: '',
        // 首次创建活动博饼包间索引
        gamblingRoomIndex: null,
        // 博饼包间列表信息
        listQueryGamblingRoom: {
          current: 1,
          size: 10,
          actId: null
        },
        textMapGamblingRoom: {
          update: '修改博饼包间',
          create: '新增博饼包间'
        },
        // 规则配置结束
        columns: [
          {
            title: '包间主题名称',
            key: 'name',
            align: 'center'
          },
          {
            title: '冠名商名称',
            key: 'entName',
            align: 'center'
          },
          {
            title: '排序',
            width: 100,
            slot: 'orderId',
            align: 'center'
          },
          {
            title: '包间品牌Logo',
            slot: 'logo',
            align: 'center'
          },
          {
            title: '包间宣传语',
            tooltip: true,
            slot: 'slogan',
            align: 'center'
          },
          {
            title: '每日博饼次数',
            key: 'times',
            align: 'center'
          },
          {
            title: '每日额外获得博饼次数随机权重',
            key: 'weight',
            align: 'center'
          },
          {
            title: '包间广告',
            slot: 'advList',
            align: 'center'
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],

        // 广告数据
        iParkingAdvList: [],
        // 选中的广告id集合
        selectedAdvIdList: [],
        currentOrderNo: null, // 用于记录当前包间的排序，保证置顶包间的唯一性

        tempImgVisible: false,

        // 效果预览
        previewVisible: false,
        previewUrl: ''
      }
    },
    created() {
      this.getIParkingAdvList()
      if (this.optStatus === 'update') {
        this.currentOrderNo = this.tempGamblingRoom.orderNo
      }
    },
    mounted: function () {
      this.gamblingRoomsList = this.gamblingRooms

      if (this.optStatus === 'detail') {
        this.columns = this.columns.filter(col => col.slot !== 'action')
      }
    },
    methods: {
      // 获取广告列表
      getIParkingAdvList() {
        gamblingRoomApi.advList().then(res => {
          this.iParkingAdvList = res.data
        })
      },
      // 广告数据初始化
      initAdvList() {
        let list = []
        let advList = this.tempGamblingRoom.roomExt.advList
        advList.forEach(item => {
          list.push(String(item.adverId))
        })
        this.selectedAdvIdList = list
      },
      changeAdvCheckbox(data) {
        let advList = []
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < this.iParkingAdvList.length; j++) {
            if (this.iParkingAdvList[j].adverId === data[i]) {
              advList.push(this.iParkingAdvList[j])
            }
          }
        }
        this.tempGamblingRoom.roomExt.advList = advList
      },
      removeAdv(adverId) {
        this.tempGamblingRoom.roomExt.advList.forEach((adv, index) => {
          if (adv.adverId == adverId) {
            this.tempGamblingRoom.roomExt.advList.splice(index, 1)
          }
        })
        this.initAdvList()
      },

      // 排序切换
      changeOrderNo(value) {
        let orderNoList = []
        this.gamblingRoomsList.forEach(g => {
          orderNoList.push(g.orderNo)
        })
        // 判断置顶包间的唯一性
        if (value === 0 && orderNoList.indexOf(0) > -1) {
          this.$Message.warning('已有置顶的包间，请核实！')
          this.$nextTick(() => {
            this.tempGamblingRoom.orderNo = null
          })
          return
        }
        // 因为像素不同，删除包间封面照片
        if (this.currentOrderNo === 0 || value === 0) {
          this.$nextTick(() => {
            // 调用子组件的删除方法
            this.$refs.coverImg.handleRemove()
          })
        }
        // 设置当前的排序值
        this.currentOrderNo = value
      },

      // 博饼包间 开始
      getGamblingRoomList(actId) {
        this.listLoadingGamblingRoom = true
        this.listQueryGamblingRoom.actId = actId
        gamblingRoomApi.fetchList(this.listQueryGamblingRoom).then(response => {
          this.gamblingRoomsList = this.parseGamblingRoomExt(response.data.records)
          this.total = response.data.total
          this.listLoadingGamblingRoom = false
        })
      },
      handleGamblingRoomPageSize(value) {
        this.listQueryGamblingRoom.size = value
        this.getGamblingRoomList(this.actId)
      },
      // 解析博饼包间表达式
      parseGamblingRoomExt(gamblingRoomsList) {
        let list = []
        for (let i = 0; i < gamblingRoomsList.length; i++) {
          gamblingRoomsList[i].roomExt = JSON.parse(gamblingRoomsList[i].roomExt)
          list.push(gamblingRoomsList[i])
        }
        return list.reverse()
      },

      // 添加博饼包间
      handleCreateGamblingRoom() {
        this.$nextTick(() => {
          this.resetTempGamblingRoom()
          this.$refs['dataFormGamblingRoom'].resetFields()
        })
        this.dialogStatusGamblingRooms = 'create'
        this.dialogFormVisibleGamblingRooms = true
        this.tempGamblingRoom.actId = this.actId
      },
      // 活动不存在时 配置博饼包间
      handleUpdateGamblingRoomByCreate(index) {
        this.gamblingRoomIndex = index
        this.tempGamblingRoom = this.gamblingRoomsList[index]
        this.dialogStatusGamblingRooms = 'update'
        this.dialogFormVisibleGamblingRooms = true
      },
      createGamblingRoomDataByCreate() {
        this.$refs['dataFormGamblingRoom'].validate((valid) => {
          if (valid) {
            if (!this.checkGamblingRoom()) {
              return
            }
            this.tempGamblingRoom.actId = this.actId
            this.gamblingRoomsList.push(this.tempGamblingRoom)
            this.resetTempGamblingRoom()
            this.dialogFormVisibleGamblingRooms = false
            // 向上传值
            this.$emit('getGamblingRooms', this.gamblingRoomsList)
          } else {
            return this.$Message.error('请填写必填项')
          }
        })
      },
      updateGamblingRoomDataByCreate() {
        this.$refs['dataFormGamblingRoom'].validate((valid) => {
          if (valid) {
            if (!this.checkGamblingRoom()) {
              return
            }
            this.gamblingRoomsList.splice(this.gamblingRoomIndex, 1, this.tempGamblingRoom)
            this.gamblingRoomIndex = null
            this.resetTempGamblingRoom()
            this.dialogFormVisibleGamblingRooms = false
            // 向上传值
            this.$emit('getGamblingRooms', this.gamblingRoomsList)
          } else {
            return this.$Message.error('请填写必填项')
          }
        })
      },
      handleDeleteGamblingRoomByCreate(index) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该博饼包间, 是否继续?',
          onOk: () => {
            this.gamblingRoomsList.splice(index, 1)
            this.resetTempGamblingRoom()
            this.dialogFormVisibleGamblingRooms = false
            this.$Notice.success({title: '成功', desc: '删除成功'})
          }
        })
      },
      // 活动已经存在时 配置博饼包间
      handleUpdateGamblingRoom(id) {
        gamblingRoomApi.fetchInfo(id).then(res => {
          this.tempGamblingRoom = Object.assign({}, res.data) // copy obj
          this.initAdvList()
          this.dialogStatusGamblingRooms = 'update'
          this.dialogFormVisibleGamblingRooms = true
        })
      },
      createGamblingRoomData() {
        this.$refs['dataFormGamblingRoom'].validate((valid) => {
          if (valid) {
            if (!this.checkGamblingRoom()) {
              return
            }
            this.tempGamblingRoom.actId = this.actId
            gamblingRoomApi.create(this.tempGamblingRoom).then(() => {
              this.dialogFormVisibleGamblingRooms = false
              this.$Notice.success({title: '成功', desc: '新增成功'})
              this.getGamblingRoomList(this.actId)
            })
          } else {
            return this.$Message.error('请填写必填项')
          }
        })
      },
      updateGamblingRoomData() {
        this.$refs['dataFormGamblingRoom'].validate((valid) => {
          if (valid) {
            if (!this.checkGamblingRoom()) {
              return
            }
            gamblingRoomApi.update(this.tempGamblingRoom).then(() => {
              this.dialogFormVisibleGamblingRooms = false
              this.$Notice.success({title: '成功', desc: '修改成功'})
              this.getGamblingRoomList(this.actId)
              this.resetTempGamblingRoom()
            })
          } else {
            return this.$Message.error('请填写必填项')
          }
        })
      },
      handleDeleteGamblingRoom(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该博饼包间, 是否继续?',
          onOk: () => {
            this.tempGamblingRoom.actId = this.actId
            this.tempGamblingRoom.id = id
            gamblingRoomApi.remove(this.tempGamblingRoom).then(() => {
              this.getGamblingRoomList(this.actId)
              this.$Notice.success({title: '成功', desc: '删除成功'})
            })
          }
        })
      },

      // 校验博饼包间
      checkGamblingRoom() {
        let flag = false

        return true
      },
      // 博饼包间 结束

      // 从组件获取图片url
      getImgData(imgUrl, refName) {
        switch (refName) {
          case 'coverImg':
            this.tempGamblingRoom.roomExt.coverImg = imgUrl
            break
          case 'nameBackground':
            this.tempGamblingRoom.roomExt.nameBackground = imgUrl
            break
          case 'descBackground':
            this.tempGamblingRoom.roomExt.descBackground = imgUrl
            break
          case 'bowlImg':
            this.tempGamblingRoom.roomExt.bowlImg = imgUrl
            break
          case 'logo':
            this.tempGamblingRoom.roomExt.logo = imgUrl
            break
          case 'descBtnBackground':
            this.tempGamblingRoom.roomExt.descBtnBackground = imgUrl
            break
          case 'otherRoomBtnBackground':
            this.tempGamblingRoom.roomExt.otherRoomBtnBackground = imgUrl
            break
          case 'roomBackground':
            this.tempGamblingRoom.roomExt.roomBackground = imgUrl
            break
          case 'timesBackground':
            this.tempGamblingRoom.roomExt.timesBackground = imgUrl
            break
        }
      },

      // 预览
      showPreviewQr() {
        this.$refs['dataFormGamblingRoom'].validate((valid) => {
          if (valid) {
            if (!this.checkGamblingRoom()) {
              return
            }
            this.tempGamblingRoom.actId = this.actId
            gamblingRoomApi.preview(this.tempGamblingRoom).then((res) => {
              let roomId = res.data
              this.previewUrl = this.$apiBaseWebUrl + '/#/gambling/detail?roomId=' + roomId + '&actId=1&isPreview=1'
              this.previewVisible = true
            })
          } else {
            return this.$Message.error('请填写必填项')
          }
        })
      },

      getAdvItemStyle(item) {
        return 'margin-left:10px;width: ' + item.length * 25 + 'px'
      },
      resetTempGamblingRoom() {
        this.selectedAdvIdList = []
        this.tempGamblingRoom = {
          id: null,
          actId: null,
          name: null,
          orderNo: null,
          entName: null,
          times: null, // 每日博饼次数
          weight: null, // 额外博饼次数权重
          roomExt: {
            coverImg: '', // 包间封面图片
            slogan: '', // 包间宣传语
            sloganColor: '', // 包间宣传语文字颜色
            nameBackground: '', // 包间名称背景图
            logo: '', // 包间品牌logo
            roomBackground: '', // 包间背景图
            roomBackColor: '', // 包间页背景颜色
            descBackground: '', // 包间说明框背景
            descBtnBackground: '', // 包间说明框按钮背景
            descColor: '', // 说明文字颜色
            bowlImg: '', // 包间博饼碗图片
            otherRoomBtnBackground: '', // 其他包间按钮背景
            timesBackground: '', // 剩余次数背景
            advList: []// 包间广告
          }
        }
      }
    }
  }
</script>
<style lang="less">
  .add-gamblingRooms {
    margin-left: 20px;
    margin-top: 10px;
    text-align: center;
    display: inline-block;
    vertical-align: middle
  }
</style>
