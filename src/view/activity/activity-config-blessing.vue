<template>
  <div>
    <modal :title="textMap[dialogStatus]" v-model="dialogFormVisible" :mask-closable="false" @on-cancel="handleClose"
           :width="1000">
      <Steps :current="currentStep" class="ivu-steps">
        <Step title="基础配置" content="填写活动基础信息"></Step>
        <Step title="规则配置" content="设置活动规则"></Step>
      </Steps>
      <Divider></Divider>

      <Form ref="dataFormActivity" :label-width="100" :model="tempActivity" :rules="rulesActivity">
        <!--基础配置开始-->
        <div v-if="currentStep === 0">
          <FormItem label="活动类型" prop="actType">
            <Select v-model="tempActivity.actType" style="width: 120px" disabled clearable>
              <Option :value=0>抽奖类活动</Option>
              <Option :value=1 disabled>礼包类活动</Option>
              <Option :value=2 disabled>祝福类活动</Option>
            </Select>
          </FormItem>
          <FormItem label="活动主题" prop="title">
            <Input v-model="tempActivity.title" style="width: 520px" placeholder="输入30个字以内" :maxlength="30" clearable/>
          </FormItem>
          <FormItem label="有效期" prop="rangeTime">
            <DatePicker :value="tempActivity.rangeTime" type="datetimerange" formart="yyyy-MM-dd"
                        @on-change="tempActivity.rangeTime=$event"
                        placement="right-start"
                        placeholder="选择时间"
                        style="width: 300px"
                        :options="optionsTime"
                        required></DatePicker>
          </FormItem>
          <FormItem label="主题图片" prop="actPic">
            <div>（注：图片格式支持.jpg .jpeg .png ，大小不超过2M）</div>
            <!--图片上传组件-->
            <div>
              <div class="demo-upload-list" v-if="tempActivity.actPic !== ''">
                <img :src=tempActivity.actPic>
                <div class="demo-upload-list-cover">
                  <Icon type="ios-eye-outline" @click.native="handleActView"></Icon>
                  <Icon type="ios-trash-outline" @click.native="handleActRemove"></Icon>
                </div>
              </div>
              <Upload
                v-if="tempActivity.actPic === ''"
                ref="uploadactPic"
                :show-upload-list="false"
                :on-success="handleActSuccess"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                multiple
                type="drag"
                :action="this.$apiBaseUrl+'/file/image/upload'"
                style="display: inline-block;width:58px;">
                <div style="width: 58px;height:58px;line-height: 58px;">
                  <Icon type="ios-camera" size="20"></Icon>
                </div>
              </Upload>
              <Modal title="图片查看" v-model="visible">
                <img :src="tempActivity.actPic" v-if="visible" style="width: 100%">
              </Modal>
            </div>
          </FormItem>
          <FormItem label="活动简介" prop="summary">
            <Input v-model="tempActivity.summary" type="textarea" :autosize="{minRows: 5,maxRows: 10}" :maxlength="500"
                   style="width: 520px" placeholder="请输入简介、描述、宣传等话术(500字以内)" clearable/>
          </FormItem>
          <FormItem label="内容及说明" prop="context">
            <!--富文本编辑器-->
            <editor ref="editor" :value="tempActivity.context" :cache="editorCache"
                    @on-change="handleChangeContent"></editor>
          </FormItem>
        </div>
        <!--规则配置开始-->
        <div v-if="currentStep === 1">
          <FormItem label="参与条件" prop="actConfigExpress.actParticipantConfig.participantType">
            <CheckboxGroup v-model="tempActivity.actConfigExpress.actParticipantConfig.participantType">
              <Checkbox label=0 disabled>注册用户</Checkbox>
              <Checkbox label=1>关注用户</Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="参与次数" prop="actConfigExpress.actNumberConfig.limit">
            活动期间最多可制作&nbsp
            <Input v-model="tempActivity.actConfigExpress.actNumberConfig.limit" size="small"
                   @on-keydown="tempActivity.actConfigExpress.actNumberConfig.limit=tempActivity.actConfigExpress.actNumberConfig.limit.replace(/[^\d]/g,'')"
                   @on-keyup="tempActivity.actConfigExpress.actNumberConfig.limit=tempActivity.actConfigExpress.actNumberConfig.limit.replace(/[^\d]/g,'')"
                   style="width:100px;height:20px" :maxlength="10" clearable></Input>
            &nbsp个祝福
          </FormItem>
          &nbsp&nbsp&nbsp
          <FormItem prop="actConfigExpress.actNumberConfig.dailyLimit">
            每天最多可制作&nbsp
            <Input v-model="tempActivity.actConfigExpress.actNumberConfig.dailyLimit" size="small"
                   @on-keydown="tempActivity.actConfigExpress.actNumberConfig.dailyLimit=tempActivity.actConfigExpress.actNumberConfig.dailyLimit.replace(/[^\d]/g,'')"
                   @on-keyup="tempActivity.actConfigExpress.actNumberConfig.dailyLimit=tempActivity.actConfigExpress.actNumberConfig.dailyLimit.replace(/[^\d]/g,'')"
                   style="width:100px;height:20px" :maxlength="10" clearable></Input>
            &nbsp个祝福
          </FormItem>
          <FormItem label="分享">
            <RadioGroup v-model="tempActivity.actConfigExpress.actShareConfig.shareFlag" @on-change="changeShareConfig">
              <Radio :label="1">是</Radio>
              <Radio :label="0">否</Radio>
            </RadioGroup>
            <div v-if="tempActivity.actConfigExpress.actShareConfig.shareFlag === 1">
              <div>
                <div style="display:inline-block;vertical-align:middle">
                  <FormItem>
                    标题：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareTitle"
                              style="width: 350px" :maxlength="30"
                              placeholder="输入30个字以内"
                              clearable/></FormItem>
                  <br>
                  <FormItem>
                    描述：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareDesc"
                              style="width: 520px" :maxlength="30"
                              placeholder="输入30个字以内"
                              clearable/></FormItem>
                  <br>
                  <FormItem prop="actConfigExpress.actShareConfig.shareUrl">
                    链接：<Input v-model="tempActivity.actConfigExpress.actShareConfig.shareUrl"
                              style="width: 520px" type="textarea" :autosize="{minRows: 2,maxRows: 8}"
                              placeholder="输入分享的连接"
                              clearable/></FormItem>
                </div>
                &nbsp&nbsp&nbsp
                <!--图片上传组件-->
                <div style="display:inline-block;vertical-align:middle">图片：&nbsp</div>
                <div style="display:inline-block;vertical-align:middle">
                  <div>
                    <div class="demo-upload-list" v-if="tempActivity.actConfigExpress.actShareConfig.shareIcon !== ''">
                      <img :src=tempActivity.actConfigExpress.actShareConfig.shareIcon>
                      <div class="demo-upload-list-cover">
                        <Icon type="ios-eye-outline" @click.native="handleShareView"></Icon>
                        <Icon type="ios-trash-outline" @click.native="handleShareRemove"></Icon>
                      </div>
                    </div>
                    <Upload
                      v-if="tempActivity.actConfigExpress.actShareConfig.shareIcon === ''"
                      ref="uploadshareIcon"
                      :show-upload-list="false"
                      :on-success="handleShareSuccess"
                      :format="['jpg','jpeg','png']"
                      :max-size="2048"
                      :on-format-error="handleFormatError"
                      :on-exceeded-size="handleMaxSize"
                      multiple
                      type="drag"
                      :action="this.$apiBaseUrl+'/file/image/upload'"
                      style="display: inline-block;width:58px;">
                      <div style="width: 58px;height:58px;line-height: 58px;">
                        <Icon type="ios-camera" size="20"></Icon>
                      </div>
                    </Upload>
                    <Modal title="图片查看" v-model="visibleShare">
                      <img :src="tempActivity.actConfigExpress.actShareConfig.shareIcon" v-if="visibleShare"
                           style="width: 100%">
                    </Modal>
                  </div>
                </div>
              </div>
            </div>
          </FormItem>
          <!--基础配置结束-->

          <Divider orientation="left" style="font-size: 16px;color:#2d8cf0">祝福主题设置</Divider>
          <!--祝福主题列表-->
          <Table ref="tablesMain" :data="blessingList" :columns="columns" :loading="listLoadingBlessing" :border="true">
            <template slot="blessingType" slot-scope="scope">
              {{blessingTypeMap[scope.row.blessingType]}}
            </template>
            <template slot-scope="{row}" slot="cardTemplates">
              {{(row.actBlessingThemeExtExPress.cardTemplates).length}}
            </template>
            <template slot-scope="{row}" slot="musics">
              {{(row.actBlessingThemeExtExPress.musics).length}}
            </template>
            <template slot-scope="{row}" slot="videos">
              {{(row.actBlessingThemeExtExPress.videos).length}}
            </template>
            <template slot-scope="{row}" slot="texts">
              {{(row.actBlessingThemeExtExPress.texts).length}}
            </template>

            <template slot-scope="{ row, index }" slot="action">
              <Button type="primary" size="small" style="margin-right: 5px" v-if="$viewAccess('act:blessingTheme:edit')"
                      @click="dialogStatus==='create'?handleUpdateBlessingByCreate(index):handleUpdateBlessing(row.id)">
                编辑
              </Button>
              <Button type="error" size="small" v-if="$viewAccess('act:blessingTheme:delete')"
                      @click="dialogStatus==='create'?handleDeleteBlessingByCreate(index):handleDeleteBlessing(row.id)">
                删除
              </Button>
            </template>
          </Table>
          <div>
            <Page v-show="true" :total="total" :current.sync="listQueryBlessing.current"
                  :page-size="listQueryBlessing.size"
                  show-total show-sizer show-elevator style="display:inline-block;vertical-align:middle"
                  @on-change="getBlessingList(tempActivity.id)" @on-page-size-change="handleBlessingPageSize"/>
            <div class="add-blessing">
              <Button v-if="$viewAccess('act:blessingTheme:add')" type="success" icon="md-add"
                      @click="handleCreateBlessing">添加祝福主题
              </Button>
            </div>
          </div>
        </div>

        <!--祝福主题modal-->
        <Modal :title="textMapBlessing[dialogStatusBlessing]" v-model="dialogFormVisibleBlessing" :mask-closable="false"
               :width="1100">
          <Form ref="dataFormBlessing" :rules="rulesBlessing" :model="tempBlessing" :label-width="100" inline>
            <FormItem label="祝福类型" prop="blessingType">
              <Select v-model="tempBlessing.blessingType" style="width:100px" clearable>
                <Option :value=0>节日</Option>
                <Option :value=1>社会关系</Option>
                <Option :value=2>生日</Option>
              </Select>
            </FormItem>
            <FormItem label="主题名称" prop="name">
              <Input v-model="tempBlessing.name" style="width:250px" :maxlength="16" placeholder="输入主题名称"
                     clearable/>
            </FormItem>
            <br>
            <FormItem label="主题排序" prop="orderNo">
              <Input v-model="tempBlessing.orderNo" size="small" placeholder="排序（整数）"
                     @on-keydown="tempBlessing.orderNo=tempBlessing.orderNo.replace(/[^\d]/g,'')"
                     @on-keyup="tempBlessing.orderNo=tempBlessing.orderNo.replace(/[^\d]/g,'')"
                     style="width:100px;height:20px" :maxlength="10" clearable></Input>
            </FormItem>
            <FormItem label="合作冠名商" prop="entName">
              <div @click="partnerList">
                <Select v-model="tempBlessing.entName" style="width:250px" @on-change="saveEnt" @on-clear="clearEnt"
                        filterable clearable>
                  <Option v-for="item in entList" :value="item.entName" :key="item.entId">{{item.entName}}
                  </Option>
                </Select>
              </div>
            </FormItem>
            <br>
            <FormItem label="主题描述" prop="description">
              <Input v-model="tempBlessing.description" style="width: 520px" type="textarea"
                     :autosize="{minRows: 2,maxRows: 8}"
                     placeholder="输入主题描述(500个字以内)"
                     clearable/>
            </FormItem>
            <br>

            <FormItem label="主题卡模板" prop="actBlessingThemeExtExPress.cardTemplates">
              <div>
                <Button type="primary" @click="handleCreateCard">添加主题模板</Button>
                （注：图片格式支持.jpg .jpeg .png .bmp .gif，大小不超过2M）
                <br><br>
                <modal title="添加主题模板" v-model="dialogVisibleCard" :mask-closable="false" :width="300">
                  <div style="text-align:center">
                    <Input v-model="cardTemplate.name" :maxlength="5" placeholder="主题模板名称（5个字以内）" style="width:180px"/>
                    <div align="center">
                      <Card style="height:110px;width:180px">
                        <Row :gutter="16">
                          <Col span="8">
                          <div>
                            <div class="demo-upload-list" v-if="cardTemplate.coverPic !== ''">
                              <img :src=cardTemplate.coverPic>
                              <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleCoverPicView"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleCoverPicRemove"></Icon>
                              </div>
                            </div>
                            <Upload
                              v-if="cardTemplate.coverPic === ''"
                              ref="uploadactPic"
                              :show-upload-list="false"
                              :on-success="handleCoverPicSuccess"
                              :format="['jpg','jpeg','png','bmp','gif']"
                              :max-size="2048"
                              :on-format-error="handleFormatErrorBlessing"
                              :on-exceeded-size="handleMaxSize"
                              multiple
                              type="drag"
                              :action="this.$apiBaseUrl+'/file/image/upload'"
                              style="display: inline-block;width:58px;">
                              <div style="width: 58px;height:58px;line-height: 58px;">
                                <Icon type="ios-camera" size="20"></Icon>
                              </div>
                            </Upload>
                            <Modal title="图片查看" v-model="visibleCoverPic">
                              <img :src="cardTemplate.coverPic" v-if="visibleCoverPic" style="width: 100%">
                            </Modal>
                          </div>
                          </Col>
                          <Col span="8" offset="4">
                          <div>
                            <div class="demo-upload-list" v-if="cardTemplate.backgroundPic !== ''">
                              <img :src=cardTemplate.backgroundPic>
                              <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleBackgroundPicView"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleBackgroundPicRemove"></Icon>
                              </div>
                            </div>
                            <Upload
                              v-if="cardTemplate.backgroundPic === ''"
                              ref="uploadactPic"
                              :show-upload-list="false"
                              :on-success="handleBackgroundPicSuccess"
                              :format="['jpg','jpeg','png','bmp','gif']"
                              :max-size="2048"
                              :on-format-error="handleFormatErrorBlessing"
                              :on-exceeded-size="handleMaxSize"
                              multiple
                              type="drag"
                              :action="this.$apiBaseUrl+'/file/image/upload'"
                              style="display: inline-block;width:58px;">
                              <div style="width: 58px;height:58px;line-height: 58px;">
                                <Icon type="ios-camera" size="20"></Icon>
                              </div>
                            </Upload>
                            <Modal title="图片查看" v-model="visibleBackgroundPic">
                              <img :src="cardTemplate.backgroundPic" v-if="visibleBackgroundPic" style="width: 100%">
                            </Modal>
                          </div>
                          </Col>
                        </Row>
                        <Row :gutter="16">
                          <Col span="8" offset="2">
                          <div style="font-size: 12px">封面</div>
                          </Col>
                          <Col span="8" offset="4">
                          <div style="font-size: 12px">背景</div>
                          </Col>
                        </Row>
                      </Card>
                    </div>
                  </div>

                  <div slot="footer">
                    <Button @click="dialogVisibleCard=false" align="right">取消</Button>
                    <Button @click="createDataCard" align="right" type="primary">添加</Button>
                  </div>
                </modal>
                <!-------------------------------主题卡模板列表--------------------------------->
                <Card v-for="(cardTemplate,index) in tempBlessing.actBlessingThemeExtExPress.cardTemplates"
                      class="img-item"
                      style="height:150px;width:180px" :key="index">
                  <div slot="title" style="height:10px;width:160px;font-size:11px;font-weight:900">{{cardTemplate.name}}
                    <Button style="float:right" size="small" shape="circle" icon="ios-trash"
                            @click="removeCardTemplate(index)"></Button>
                  </div>
                  <Row :gutter="16">
                    <Col span="8">
                    <div>
                      <div class="demo-upload-list" v-if="cardTemplate.coverPic !== ''">
                        <img :src=cardTemplate.coverPic>
                        <div class="demo-upload-list-cover">
                          <Icon type="ios-eye-outline" @click.native="handleCoverPicView"></Icon>
                          <!--<Icon type="ios-trash-outline" @click.native="handleTempCoverPicRemove(index)"></Icon>-->
                        </div>
                      </div>
                      <Upload
                        v-if="cardTemplate.coverPic === ''"
                        ref="uploadactPic"
                        :show-upload-list="false"
                        :on-success="handleCoverPicSuccess"
                        :format="['jpg','jpeg','png','bmp','gif']"
                        :max-size="2048"
                        :on-format-error="handleFormatErrorBlessing"
                        :on-exceeded-size="handleMaxSize"
                        multiple
                        type="drag"
                        :action="this.$apiBaseUrl+'/file/image/upload'"
                        style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                          <Icon type="ios-camera" size="20"></Icon>
                        </div>
                      </Upload>
                      <Modal title="图片查看" v-model="visibleCoverPic">
                        <img :src="cardTemplate.coverPic" v-if="visibleCoverPic" style="width: 100%">
                      </Modal>
                    </div>
                    </Col>
                    <Col span="8" offset="4">
                    <div>
                      <div class="demo-upload-list" v-if="cardTemplate.backgroundPic !== ''">
                        <img :src=cardTemplate.backgroundPic>
                        <div class="demo-upload-list-cover">
                          <Icon type="ios-eye-outline" @click.native="handleBackgroundPicView"></Icon>
                          <!--<Icon type="ios-trash-outline" @click.native="handleTempBackgroundPicRemove(index)"></Icon>-->
                        </div>
                      </div>
                      <Upload
                        v-if="cardTemplate.backgroundPic === ''"
                        ref="uploadactPic"
                        :show-upload-list="false"
                        :on-success="handleBackgroundPicSuccess"
                        :format="['jpg','jpeg','png','bmp','gif']"
                        :max-size="2048"
                        :on-format-error="handleFormatErrorBlessing"
                        :on-exceeded-size="handleMaxSize"
                        multiple
                        type="drag"
                        :action="this.$apiBaseUrl+'/file/image/upload'"
                        style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                          <Icon type="ios-camera" size="20"></Icon>
                        </div>
                      </Upload>
                      <Modal title="图片查看" v-model="visibleBackgroundPic">
                        <img :src="cardTemplate.backgroundPic" v-if="visibleBackgroundPic" style="width: 100%">
                      </Modal>
                    </div>
                    </Col>
                  </Row>
                  <Row :gutter="16">
                    <Col span="8" offset="2">
                    <div style="font-size: 12px">封面</div>
                    </Col>
                    <Col span="8" offset="4">
                    <div style="font-size: 12px">背景</div>
                    </Col>
                  </Row>
                </Card>
              </div>
            </FormItem>
            <br>

            <!----------------------------------主题音乐库------------------------------------------->
            <FormItem label="主题音乐库" prop="actBlessingThemeExtExPress.musics">
              <div>
                <modal title="音乐库列表" v-model="dialogFormVisibleMusics" :mask-closable="false" :width="650">
                  <div class="search-con" :loading="listLoadingMusics">
                    <Input v-model="listQueryMaterial.name" clearable placeholder="主题名称" class="search-item-first"/>
                    <Button v-if="$viewAccess('act:material:list')" @click="getMusicsList"
                            class="search-btn" type="primary" icon="md-search">搜索
                    </Button>
                  </div>
                  <Table ref="musicsTable" :data="musicsList" :columns="columnsMaterial" :loading="listLoadingMusics"
                         :border="true">
                    <template slot-scope="{ row, index }" slot="action">
                      <Button v-if="$viewAccess('act:blessingTheme:add')&& musicIdsList.indexOf(row.id) === -1"
                              type="primary" size="small"
                              style="margin-right: 5px"
                              @click="addMusicToList(index)">添加
                      </Button>
                      <Button v-if="$viewAccess('act:blessingTheme:add')&& musicIdsList.indexOf(row.id) !== -1"
                              type="error" size="small"
                              style="margin-right: 5px"
                              @click="removeMusicFromList(index)">删除
                      </Button>
                    </template>
                  </Table>
                  <Page v-show="totalMusics>0" :total="totalMusics" :current.sync="listQueryMaterial.current"
                        :page-size="listQueryMaterial.size"
                        show-total show-sizer show-elevator
                        @on-change="getMusicsList" @on-page-size-change="handleMusicsPageSize"/>
                </modal>
                <Button v-if="$viewAccess('act:blessingTheme:add')" type="primary"
                        @click="handleSelectMusics">
                  添加音乐
                </Button>
                &nbsp
                <Alert show-icon style="width:300px;display:inline-block">
                  已添加{{tempBlessing.actBlessingThemeExtExPress.musics.length}}个音乐（最多可添加15个）
                </Alert>
                <br>
                <span v-for="(music,index) in tempBlessing.actBlessingThemeExtExPress.musics"
                      style="width:200px;text-align:center;font-weight:900">
                  <Icon color="#2d8cf0" type="md-musical-notes" size="25"/>
                  {{music.name}}
                  <Button size="small" shape="circle" icon="ios-trash" @click="removeMusicsList(index)"></Button>&nbsp&nbsp&nbsp
                  <br v-if="(index+1)%3 === 0">
                </span>
              </div>
            </FormItem>
            <br><br>


            <!----------------------------------主题视频库------------------------------------------->
            <FormItem label="主题视频库" prop="actBlessingThemeExtExPress.videos">
              <div>
                <modal title="视频库列表" v-model="dialogFormVisibleVideos" :mask-closable="false" :width="650">
                  <div class="search-con" :loading="listLoadingVideos">
                    <Input v-model="listQueryMaterial.name" clearable placeholder="主题名称" class="search-item-first"/>
                    <Button v-if="$viewAccess('act:material:list')" @click="getVideosList"
                            class="search-btn" type="primary" icon="md-search">搜索
                    </Button>
                  </div>
                  <Table ref="videosTable" :data="videosList" :columns="columnsMaterial" :loading="listLoadingVideos"
                         :border="true">
                    <template slot-scope="{ row, index }" slot="action">
                      <Button v-if="$viewAccess('act:blessingTheme:add')&& videoIdsList.indexOf(row.id) === -1"
                              type="primary" size="small"
                              style="margin-right: 5px"
                              @click="addVideoToList(index)">添加
                      </Button>
                      <Button v-if="$viewAccess('act:blessingTheme:add')&& videoIdsList.indexOf(row.id) !== -1"
                              type="error" size="small"
                              style="margin-right: 5px"
                              @click="removeVideoFromList(index)">删除
                      </Button>
                    </template>
                  </Table>
                  <Page v-show="totalVideos>0" :total="totalVideos" :current.sync="listQueryMaterial.current"
                        :page-size="listQueryMaterial.size"
                        show-total show-sizer show-elevator
                        @on-change="getVideosList" @on-page-size-change="handleVideosPageSize"/>
                </modal>
                <Button v-if="$viewAccess('act:blessingTheme:add')" type="primary"
                        @click="handleSelectVideos">
                  添加视频
                </Button>
                &nbsp
                <Alert show-icon style="width:300px;display:inline-block">
                  已添加{{tempBlessing.actBlessingThemeExtExPress.videos.length}}个视频（最多可添加15个）
                </Alert>
                <br>
                <span v-for="(video,index) in tempBlessing.actBlessingThemeExtExPress.videos" style="font-weight:900">
                  <Icon color="#2d8cf0" type="md-videocam" size="25"/>
                  {{video.name}}
                  <Button size="small" shape="circle" icon="ios-trash" @click="removeVideosList(index)"></Button>&nbsp&nbsp&nbsp
                  <br v-if="(index+1)%3 === 0">
                </span>
              </div>
            </FormItem>
            <br><br>

            <!----------------------------------主题祝福语库------------------------------------------->
            <FormItem label="主题祝福语库" prop="actBlessingThemeExtExPress.texts">
              <div>
                <modal title="祝福语库列表" v-model="dialogFormVisibleTexts" :mask-closable="false" :width="650">
                  <div class="search-con" :loading="listLoadingTexts">
                    <Input v-model="listQueryMaterial.name" clearable placeholder="主题名称" class="search-item-first"/>
                    <Button v-if="$viewAccess('act:material:list')" @click="getTextsList"
                            class="search-btn" type="primary" icon="md-search">搜索
                    </Button>
                  </div>
                  <Table ref="textsTable" :data="textsList" :columns="columnsMaterial" :loading="listLoadingTexts"
                         :border="true">
                    <template slot-scope="{ row, index }" slot="action">
                      <Button v-if="$viewAccess('act:blessingTheme:add')&& textIdsList.indexOf(row.id) === -1"
                              type="primary" size="small"
                              style="margin-right: 5px"
                              @click="addTextToList(index)">添加
                      </Button>
                      <Button v-if="$viewAccess('act:blessingTheme:add')&& textIdsList.indexOf(row.id) !== -1"
                              type="error" size="small"
                              style="margin-right: 5px"
                              @click="removeTextFromList(index)">删除
                      </Button>
                    </template>
                  </Table>
                  <Page v-show="totalTexts>0" :total="totalTexts" :current.sync="listQueryMaterial.current"
                        :page-size="listQueryMaterial.size"
                        show-total show-sizer show-elevator
                        @on-change="getTextsList" @on-page-size-change="handleTextsPageSize"/>
                </modal>
                <Button v-if="$viewAccess('act:blessingTheme:add')" type="primary"
                        @click="handleSelectTexts">
                  添加祝福语
                </Button>
                <br>
                <div v-for="(item,index) of tempBlessing.actBlessingThemeExtExPress.texts" :key="index">
                  名称：<Input type="text" style="width: 200px" readonly
                            v-model="tempBlessing.actBlessingThemeExtExPress.texts[index].name"></Input>
                  内容：<Input type="textarea" :autosize="{minRows: 2,maxRows: 3}" style="width: 400px" readonly
                            v-model="tempBlessing.actBlessingThemeExtExPress.texts[index].content"></Input>
                  <Button size="small" shape="circle" icon="ios-trash" @click="removeTextsList(index)"></Button>
                </div>
              </div>
            </FormItem>
          </Form>
          <div slot="footer">
            <Button @click="dialogFormVisibleBlessing = false ">取消</Button>
            <Button type="primary" v-if="$viewAccess('act:blessingTheme:add') && dialogStatus==='create'"
                    @click="dialogStatusBlessing==='create'?createBlessingDataByCreate():updateBlessingDataByCreate()">
              保存
            </Button>
            <Button type="primary" v-if="$viewAccess('act:blessingTheme:add') && dialogStatus==='update'"
                    @click="dialogStatusBlessing==='create'?createBlessingData():updateBlessingData()">
              保存
            </Button>
          </div>
        </Modal>
        <!--规则配置结束-->
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
        <Button @click="handleClose" align="right">取消</Button>
        <Button type="primary" v-if="$viewAccess('act:activity:add') && currentStep===1"
                @click="dialogStatus==='create'?createData():updateData()"
                align="right">保存
        </Button>
      </div>
    </modal>
  </div>
</template>

<script>
  import {create, fetchInfo, remove, update} from '@/api/activity/activity-blessing'
  import * as blessingApi from '@/api/activity/blessing'
  import * as materialApi from '@/api/activity/material'
  import Divider from 'iview/src/components/divider/divider'
  import editor from '_c/editor/editor.vue'

  export default {
    name: 'activity-config-blessing',
    components: {
      Divider, editor
    },

    data() {
      return {
        editorCache: false,
        // 上传图片
        visible: false,
        visibleShare: false,

        // 活动
        currentStep: 0,
        listLoading: false,
        dialogFormVisible: false,
        dialogStatus: '',
        buttonBackward: true,
        buttonForward: false,

        tempActivity: {
          id: null,
          title: null,
          actType: '',
          actPic: '',
          summary: null,
          context: '',
          rangeTime: [],
          startTime: null,
          endTime: null,
          status: '',
          actConfigExpress: {
            actTypeConfig: {
              templateId: null,
              playType: null
            },
            actParticipantConfig: {
              participantType: ["0"],
              participantValue: null
            },
            actNumberConfig: {
              limit: null,
              dailyLimit: null
            },
            actShareConfig: {
              shareFlag: 0,
              shareTitle: null,
              shareIcon: '',
              shareUrl: null,
              shareDesc: null
            }
          },
          actBlessingThemes: []
        },
        // 活动校验
        rulesActivity: {
          actType: [{required: true, message: '活动类型不能为空'}],
          title: [{required: true, message: '活动主题不能为空'}],
          actPic: [{required: true, message: '活动主题图不能为空'}],
          summary: [{required: true, message: '活动简介不能为空'}],
          rangeTime: [{required: true, message: '有效期不能为空'}],
          context: [{required: true, message: '内容及说明不能为空'}],
          'actConfigExpress.actShareConfig.shareUrl': [{type: 'url', message: 'URL格式错误'}],
        },
        optionsTime: {
          disabledDate(date) {
            return date && date.valueOf() < Date.now() - 86400000;
          }
        },
        textMap: {
          update: '修改活动',
          create: '新增活动'
        },
        statusList: [
          {
            value: '未开始',
            label: 0
          },
          {
            value: '进行中',
            label: 1
          },
          {
            value: '已下架',
            label: 2
          }
        ],
        actTypeList: [
          {
            value: '抽奖类活动',
            label: 0
          },
          {
            value: '礼包类活动',
            label: 1
          },
          {
            value: '祝福类活动',
            label: 2
          }
        ],

        // 祝福主题配置 开始
        columns: [
          {
            title: '主题名称',
            key: 'name'
          },
          {
            title: '祝福类型',
            slot: 'blessingType'
          },
          {
            title: '排序',
            key: 'orderNo',
            width: 50
          },
          {
            title: '主题描述',
            key: 'description',
            tooltip: true
          },
          {
            title: '主题卡数量',
            slot: 'cardTemplates'
          },
          {
            title: '音乐库数量',
            slot: 'musics'
          },
          {
            title: '视频库数量',
            slot: 'videos'
          },
          {
            title: '祝福语库数量',
            slot: 'texts',
            width: 120
          },
          {
            title: '操作',
            slot: 'action',
            width: 150,
            align: 'center'
          }
        ],
        tempBlessing: {
          id: null,
          actId: null,
          blessingType: null,
          name: null,
          orderNo: null,
          description: null,
          //合作商
          entId: '',
          entName: '',
          //扩展信息
          themeExt: null,
          actBlessingThemeExtExPress: {
            cardTemplates: [],
            musics: [],
            videos: [],
            texts: []
          }
        },
        rulesBlessing: {
          blessingType: [{required: true, message: '祝福类型不能为空'}],
          name: [{required: true, message: '主题名称不能为空'}],
          orderNo: [{required: true, message: '主题排序不能为空'}],
          description: [{required: true, message: '主题描述不能为空'},
            {max: 500, message: '主题描述不能超过500字符', trigger: 'blur'}],
          "actBlessingThemeExtExPress.cardTemplates": [{
            required: true,
            type: 'array',
            min: 1,
            message: '主题卡模板不能为空',
            trigger: 'change'
          }],
          "actBlessingThemeExtExPress.musics": [{
            required: true,
            type: 'array',
            min: 1,
            message: '主题音乐库不能为空',
            trigger: 'change'
          }],
          "actBlessingThemeExtExPress.videos": [{
            required: true,
            type: 'array',
            min: 1,
            message: '主题视频库不能为空',
            trigger: 'change'
          }],
          "actBlessingThemeExtExPress.texts": [{
            required: true,
            type: 'array',
            min: 1,
            message: '主题祝福语库不能为空',
            trigger: 'change'
          }],
        },
        listQueryBlessing: {
          current: 1,
          size: 10,
          actId: null
        },
        blessingList: [],
        total: 10,
        listLoadingBlessing: false,
        dialogFormVisibleBlessing: false,
        dialogStatusBlessing: '',
        // 首次祝福主题索引
        blessingIndex: null,
        textMapBlessing: {
          update: '修改祝福主题',
          create: '新增祝福主题'
        },
        blessingTypeMap: {
          0: '节日',
          1: '社会关系',
          2: '生日',
        },
        // 祝福主题配置 结束


        // 素材配置 开始
        // 主题卡
        dialogVisibleCard: false,
        visibleCoverPic: false,
        visibleBackgroundPic: false,
        cardTemplate: {
          name: '',
          coverPic: '',
          backgroundPic: '',
        },
        //数据来源
        musicsList: [],
        videosList: [],
        textsList: [],

        columnsMaterial: [
          {
            title: '素材id',
            key: 'id',
            width: 80,
          },
          {
            title: '名称',
            key: 'name',
            tooltip: true
          },
          {
            title: '内容',
            key: 'content',
            tooltip: true
          },
          {
            title: '操作',
            slot: 'action',
            width: 80,
            align: 'center'
          }
        ],
        listQueryMaterial: {
          current: 1,
          size: 10,
          name: null,
          materialType: null
        },
        //音乐添加弹窗
        musicIdsList: [],
        dialogFormVisibleMusics: false,
        listLoadingMusics: false,
        totalMusics: 10,
        //视频添加弹窗
        videoIdsList: [],
        dialogFormVisibleVideos: false,
        listLoadingVideos: false,
        totalVideos: 10,
        //祝福语添加弹窗
        textIdsList: [],
        dialogFormVisibleTexts: false,
        listLoadingTexts: false,
        totalTexts: 10,
        // 素材配置 结束
        entList: [],
      }
    },
    created() {
    },
    methods: {
      // 获取父组件值
      getActivityValue(val) {
        this.tempActivity = val
        this.blessingList = this.tempActivity.actBlessingThemes
        this.$refs.editor.setHtml(this.tempActivity.context)
      },
      handlePageSize(value) {
        this.listQuery.size = value
        this.getList()
      },
      createData() {
        if (!this.checkStep2()) {
          return
        }
        this.tempActivity.actBlessingThemes = this.blessingList
        create(this.tempActivity).then(() => {
          this.dialogFormVisible = false
          // 调用父组件的getList
          this.$emit('getList')
          this.resetStep()
          this.$Notice.success({title: '成功', desc: '新增成功'})
        })
      },
      updateData() {
        if (!this.checkStep2()) {
          return
        }
        this.tempActivity.status = ''
        update(this.tempActivity).then(() => {
          this.$emit('getList')
          this.resetStep()
          this.dialogFormVisible = false
          this.$Notice.success({title: '成功', desc: '修改成功'})
        })
      },
      handleStopActivity(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将停止活动的使用, 是否继续?',
          onOk: () => {
            remove(id).then(() => {
              this.$emit('getList')
              this.dialogFormVisible = false
              this.$Notice.success({title: '成功', desc: '下架成功'})
            })
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
        if (!this.checkStep1()) {
          return
        }
        if (this.currentStep !== 1) {
          this.currentStep += 1
          this.buttonForward = true
          this.buttonBackward = false
        }
      },
      handleClose() {
        this.dialogFormVisible = false
        this.resetStep()
        this.resetTempActivity()
        this.$emit('getList')
      },
      resetStep() {
        this.currentStep = 0
        this.buttonBackward = true
        this.buttonForward = false
      },

      //  规则配置开始
      getBlessingList(actId) {
        this.listLoadingBlessing = true
        this.listQueryBlessing.actId = actId
        blessingApi.fetchList(this.listQueryBlessing).then(response => {
          this.blessingList = this.parseThemeExt(response.data.records)
          this.total = response.data.total
          this.listLoadingBlessing = false
        })
      },
      // 解析主题表达式
      parseThemeExt(blessingList) {
        let list = []
        for (let i = 0; i < blessingList.length; i++) {
          blessingList[i].actBlessingThemeExtExPress = JSON.parse(blessingList[i].themeExt)
          list.push(blessingList[i])
        }
        return list.reverse()
      },
      handleBlessingPageSize(value) {
        this.listQueryBlessing.size = value
        this.getBlessingList(this.tempActivity.id)
      },
      handleCreateBlessing() {
        this.resetTempBlessing()
        this.dialogStatusBlessing = 'create'
        this.dialogFormVisibleBlessing = true
        this.$nextTick(() => {
          this.$refs['dataFormBlessing'].resetFields()
          this.resetTempBlessing()
        })
        this.tempBlessing.actId = this.tempActivity.id
      },
      handleUpdateBlessing(id) {
        this.$refs['dataFormBlessing'].resetFields()
        this.resetTempBlessing()
        blessingApi.fetchInfo(id).then(res => {
          this.tempBlessing = Object.assign({}, res.data) // copy obj
          this.dialogStatusBlessing = 'update'
          this.getMusicIdsList()
          this.getVideoIdsList()
          this.getTextIdsList()
          this.partnerList()
          this.dialogFormVisibleBlessing = true
        })
      },
      handleUpdateBlessingByCreate(index) {
        this.$refs['dataFormBlessing'].resetFields()
        this.resetTempBlessing()
        this.blessingIndex = index
        this.tempBlessing = this.blessingList[index]
        this.dialogStatusBlessing = 'update'
        this.dialogFormVisibleBlessing = true
      },
      // 首次添加活动时 配置主题
      createBlessingDataByCreate() {
        if (!this.checkBlessing()) {
          return
        }
        this.blessingList.push(this.tempBlessing)
        this.resetTempBlessing()
        this.dialogFormVisibleBlessing = false
      },
      updateBlessingDataByCreate() {
        if (!this.checkBlessing()) {
          return
        }
        this.blessingList.splice(this.blessingIndex, 1, this.tempBlessing)
        this.resetTempBlessing()
        this.dialogFormVisibleBlessing = false
      },
      handleDeleteBlessingByCreate(index) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该主题, 是否继续?',
          onOk: () => {
            this.blessingList.splice(index, 1)
            this.resetTempBlessing()
            this.dialogFormVisibleBlessing = false
            this.$Notice.success({title: '成功', desc: '删除成功'})
          }
        })
      },
      // 活动已经存在时 配置主题
      createBlessingData() {
        if (!this.checkBlessing()) {
          return
        }
        this.tempBlessing.actId = this.tempActivity.id
        this.dialogFormVisibleBlessing = false
        blessingApi.create(this.tempBlessing).then(() => {
          this.$Notice.success({title: '成功', desc: '新增成功'})
          this.getBlessingList(this.tempActivity.id)
          this.resetTempBlessing()
        })
      },
      updateBlessingData() {
        if (!this.checkBlessing()) {
          return
        }
        blessingApi.update(this.tempBlessing).then(() => {
          this.dialogFormVisibleBlessing = false
          this.$Notice.success({title: '成功', desc: '修改成功'})
          this.getBlessingList(this.tempActivity.id)
          this.resetTempBlessing()
        })
      },
      handleDeleteBlessing(id) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该活动主题, 是否继续?',
          onOk: () => {
            this.tempBlessing.actId = this.tempActivity.id
            this.tempBlessing.id = id
            blessingApi.remove(this.tempBlessing).then(() => {
              this.getBlessingList(this.tempActivity.id)
              this.$Notice.success({title: '成功', desc: '删除成功'})
            })
          }
        })
      },
      handleActView() {
        this.visible = true
      },
      handleActRemove() {
        this.tempActivity.actPic = ''
      },
      handleActSuccess(res, file) {
        this.tempActivity.actPic = res.data
        this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
      },
      handleShareView() {
        this.visibleShare = true
      },
      handleShareRemove() {
        this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
      },
      handleShareSuccess(res, file) {
        this.tempActivity.actConfigExpress.actShareConfig.shareIcon = res.data
        this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
      },
      handleFormatError(file) {
        this.$Notice.warning({
          title: '文件类型错误',
          desc: `文件${file.name}不是图片文件，请选择后缀为png/jpeg/jpg的文件。`
        })
      },
      handleMaxSize(file) {
        this.$Notice.warning({
          title: '文件大小超出限制',
          desc: `文件${file.name}太大, 不能超过2M。`
        })
      },
      handleChangeContent(html, text) {
        this.tempActivity.context = html
      },
      checkStep1() {
        let flag = false
        if (this.tempActivity.title === null || this.tempActivity.title.trim() === '') {
          this.$Message.error('请输入活动主题')
          return flag
        }
        if (this.tempActivity.actType === null || this.tempActivity.actType === '') {
          this.$Message.error('请选择活动类型')
          return flag
        }
        if (this.tempActivity.actPic === '') {
          this.$Message.error('请上传活动主题图')
          return flag
        }
        if (this.tempActivity.summary == null || this.tempActivity.summary.trim() === '') {
          this.$Message.error('请输入活动简介')
          return flag
        }
        if (this.tempActivity.context.trim() === '') {
          this.$Message.error('请输入活动内容及说明')
          return flag
        }
        return true
      },
      checkStep2() {
        let flag = false
        if ((this.tempActivity.actConfigExpress.actNumberConfig.limit == null
            || Number(this.tempActivity.actConfigExpress.actNumberConfig.limit) == 0)
          && (this.tempActivity.actConfigExpress.actNumberConfig.dailyLimit == null
            || Number(this.tempActivity.actConfigExpress.actNumberConfig.dailyLimit) == 0)) {
          this.$Message.error('活动期间参与次数和每日参与次数不能同时为空')
          return flag
        }
        if ((Number(this.tempActivity.actConfigExpress.actNumberConfig.limit) < Number(this.tempActivity.actConfigExpress.actNumberConfig.dailyLimit))) {
          this.$Message.error('每日参与次数不能大于总参与次数')
          return flag
        }
        if (this.tempActivity.actConfigExpress.actShareConfig.shareFlag === 1) {
          if (this.tempActivity.actConfigExpress.actShareConfig.shareTitle == null ||
            this.tempActivity.actConfigExpress.actShareConfig.shareTitle.trim() === '') {
            this.$Message.error('请输入分享标题')
            return flag
          }
          if (this.tempActivity.actConfigExpress.actShareConfig.shareDesc == null ||
            this.tempActivity.actConfigExpress.actShareConfig.shareDesc.trim() === '') {
            this.$Message.error('请输入分享描述')
            return flag
          }
          if (this.tempActivity.actConfigExpress.actShareConfig.shareUrl == null ||
            this.tempActivity.actConfigExpress.actShareConfig.shareUrl.trim() === '') {
            this.$Message.error('请输入分享链接')
            return flag
          }
        }
        return true
      },
      changeShareConfig() {
        this.tempActivity.actConfigExpress.actShareConfig.shareTitle = null
        this.tempActivity.actConfigExpress.actShareConfig.shareIcon = ''
        this.tempActivity.actConfigExpress.actShareConfig.shareDesc = null
        this.tempActivity.actConfigExpress.actShareConfig.shareUrl = null
      },
      //  规则配置结束

      // 素材配置 开始
      handleCoverPicView() {
        this.visibleCoverPic = true
      },
      handleCoverPicRemove() {
        this.cardTemplate.coverPic = ''
      },
      handleCoverPicSuccess(res, file) {
        this.cardTemplate.coverPic = res.data
        this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
      },
      handleBackgroundPicView() {
        this.visibleBackgroundPic = true
      },
      handleBackgroundPicRemove() {
        this.cardTemplate.backgroundPic = ''
      },
      handleTempCoverPicRemove(index) {
        this.tempBlessing.actBlessingThemeExtExPress.cardTemplates[index].coverPic = ""
      },
      handleTempBackgroundPicRemove(index) {
        this.tempBlessing.actBlessingThemeExtExPress.cardTemplates[index].backgroundPic = ''
      },
      handleBackgroundPicSuccess(res, file) {
        this.cardTemplate.backgroundPic = res.data
        this.$Notice.success({title: '上传成功', desc: `文件${file.name}，上传成功`})
      },
      handleFormatErrorBlessing(file) {
        this.$Notice.warning({
          title: '文件类型错误',
          desc: `文件${file.name}不是图片文件，请选择后缀为png/jpeg/jpg/bmp/gif的文件。`
        })
      },
      handleMaxSize(file) {
        this.$Notice.warning({
          title: '文件大小超出限制',
          desc: `文件${file.name}太大, 不能超过2M。`
        })
      },
      handleCreateCard() {
        this.resetCardTemplate()
        this.dialogVisibleCard = true
      },
      createDataCard() {
        if (!this.checkCardTemplate()) {
          return
        }
        this.tempBlessing.actBlessingThemeExtExPress.cardTemplates.push(this.cardTemplate)
        this.dialogVisibleCard = false
        this.resetCardTemplate()
      },
      removeCardTemplate(index) {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作将删除该主题模板, 是否继续?',
          onOk: () => {
            this.tempBlessing.actBlessingThemeExtExPress.cardTemplates.splice(index, 1)
            this.$Notice.success({title: '成功', desc: '删除成功'})
          }
        })
      },
      checkCardTemplate() {
        let checkResult = false
        if (this.cardTemplate.name === '') {
          this.$Message.error('主题模板名称不能为空')
          return checkResult
        }
        if (this.cardTemplate.coverPic === '') {
          this.$Message.error('主题模板封面图片为空')
          return checkResult
        }
        if (this.cardTemplate.backgroundPic === '') {
          this.$Message.error('主题模板背景图片为空')
          return checkResult
        }
        return true
      },
      checkBlessing() {
        let checkResult = false
        if (this.tempBlessing.blessingType === null) {
          this.$Message.error('祝福类型不能为空')
          return checkResult
        }
        if (this.tempBlessing.name === null || this.tempBlessing.name.trim() === '') {
          this.$Message.error('主题名称不能为空')
          return checkResult
        }
        if (this.tempBlessing.orderNo === null) {
          this.$Message.error('主题排序不能为空')
          return checkResult
        }
        if (this.tempBlessing.description === null || this.tempBlessing.description.trim() === '') {
          this.$Message.error('主题描述不能为空')
          return checkResult
        }
        if (this.tempBlessing.actBlessingThemeExtExPress.cardTemplates.length === 0) {
          this.$Message.error('主题卡模板不能空')
          return checkResult
        }
        if (this.tempBlessing.actBlessingThemeExtExPress.musics.length === 0) {
          this.$Message.error('主题音乐库不能为空')
          return checkResult
        }
        if (this.tempBlessing.actBlessingThemeExtExPress.videos.length === 0) {
          this.$Message.error('主题视频库不能为空')
          return checkResult
        }
        if (this.tempBlessing.actBlessingThemeExtExPress.texts.length === 0) {
          this.$Message.error('主题祝福语库不能为空')
          return checkResult
        }
        if (this.tempBlessing.actBlessingThemeExtExPress.musics.length > 15) {
          this.$Message.error('音乐数量不能超过15个')
          return checkResult
        }
        if (this.tempBlessing.actBlessingThemeExtExPress.videos.length > 15) {
          this.$Message.error('视频数量不能超过15个')
          return checkResult
        }
        return true
      },
      resetCardTemplate() {
        this.cardTemplate = {
          name: '',
          coverPic: '',
          backgroundPic: ''
        }
      },

      //---------音乐弹窗开始------------------------------
      handleSelectMusics() {
        this.resetListQueryMaterial()
        this.dialogFormVisibleMusics = true
        //从后台获取音乐列表
        this.getMusicsList()
      },
      getMusicsList() {
        this.listLoadingMusics = true
        this.listQueryMaterial.materialType = 2
        materialApi.fetchList(this.listQueryMaterial).then(response => {
          this.musicsList = response.data.records
          this.totalMusics = response.data.total
          this.listLoadingMusics = false
          this.getMusicIdsList()
        })
      },
      handleMusicsPageSize(value) {
        this.listQuery.size = value
        this.getMusicsList()
      },
      addMusicToList(index) {
        this.tempBlessing.actBlessingThemeExtExPress.musics.push(this.musicsList[index])
        this.getMusicIdsList()
      },
      //从表格中删除
      removeMusicFromList(index) {
        for (let i = 0; i < this.tempBlessing.actBlessingThemeExtExPress.musics.length; i++) {
          if (Number(this.tempBlessing.actBlessingThemeExtExPress.musics[i].id) === this.musicsList[index].id) {
            this.tempBlessing.actBlessingThemeExtExPress.musics.splice(i, 1)
            this.getMusicIdsList()
            return
          }
        }

      },
      //从列表中删除
      removeMusicsList(index) {
        this.tempBlessing.actBlessingThemeExtExPress.musics.splice(index, 1)
        this.getMusicIdsList()
      },
      //判断素材是否存在
      getMusicIdsList() {
        this.musicIdsList = []
        for (let i = 0; i < this.tempBlessing.actBlessingThemeExtExPress.musics.length; i++) {
          this.musicIdsList.push(Number(this.tempBlessing.actBlessingThemeExtExPress.musics[i].id))
        }
      },
      //---------音乐弹窗结束------------------------------
      //---------视频弹窗开始------------------------------
      handleSelectVideos() {
        this.resetListQueryMaterial()
        this.dialogFormVisibleVideos = true
        //从后台获取音乐列表
        this.getVideosList()
      },
      getVideosList() {
        this.listLoadingVideos = true
        this.listQueryMaterial.materialType = 3
        materialApi.fetchList(this.listQueryMaterial).then(response => {
          this.videosList = response.data.records
          this.totalVideos = response.data.total
          this.listLoadingVideos = false
          this.getVideoIdsList()
        })
      },
      handleVideosPageSize(value) {
        this.listQuery.size = value
        this.getVideosList()
      },
      addVideoToList(index) {
        this.tempBlessing.actBlessingThemeExtExPress.videos.push(this.videosList[index])
        this.getVideoIdsList()
      },
      //从表格中删除
      removeVideoFromList(index) {
        for (let i = 0; i < this.tempBlessing.actBlessingThemeExtExPress.videos.length; i++) {
          if (Number(this.tempBlessing.actBlessingThemeExtExPress.videos[i].id) === this.videosList[index].id) {
            this.tempBlessing.actBlessingThemeExtExPress.videos.splice(i, 1)
            break
          }
        }
        this.getVideoIdsList()
      },
      //从列表中删除
      removeVideosList(index) {
        this.tempBlessing.actBlessingThemeExtExPress.videos.splice(index, 1)
        this.getVideoIdsList()
      },
      //判断素材是否存在
      getVideoIdsList() {
        this.videoIdsList = []
        for (let i = 0; i < this.tempBlessing.actBlessingThemeExtExPress.videos.length; i++) {
          this.videoIdsList.push(Number(this.tempBlessing.actBlessingThemeExtExPress.videos[i].id))
        }
      },
      //---------视频弹窗结束------------------------------

      //---------祝福语弹窗开始------------------------------
      handleSelectTexts() {
        this.resetListQueryMaterial()
        this.dialogFormVisibleTexts = true
        //从后台获取音乐列表
        this.getTextsList()
      },
      getTextsList() {
        this.listLoadingTexts = true
        this.listQueryMaterial.materialType = 0
        materialApi.fetchList(this.listQueryMaterial).then(response => {
          this.textsList = response.data.records
          this.totalTexts = response.data.total
          this.listLoadingTexts = false
          this.getTextIdsList()
        })
      },
      handleTextsPageSize(value) {
        this.listQuery.size = value
        this.getTextsList()
      },
      addTextToList(index) {
        this.tempBlessing.actBlessingThemeExtExPress.texts.push(this.textsList[index])
        this.getTextIdsList()
      },
      //从表格中删除
      removeTextFromList(index) {
        for (let i = 0; i < this.tempBlessing.actBlessingThemeExtExPress.texts.length; i++) {
          if (Number(this.tempBlessing.actBlessingThemeExtExPress.texts[i].id) === this.textsList[index].id) {
            this.tempBlessing.actBlessingThemeExtExPress.texts.splice(i, 1)
            break
          }
        }
        this.getTextIdsList()
      },
      //从列表中删除
      removeTextsList(index) {
        this.tempBlessing.actBlessingThemeExtExPress.texts.splice(index, 1)
        this.getTextIdsList()
      },
      //判断素材是否存在
      getTextIdsList() {
        this.textIdsList = []
        for (let i = 0; i < this.tempBlessing.actBlessingThemeExtExPress.texts.length; i++) {
          this.textIdsList.push(Number(this.tempBlessing.actBlessingThemeExtExPress.texts[i].id))
        }
      },
      //---------祝福语弹窗结束------------------------------

      resetListQueryMaterial() {
        this.listQueryMaterial = {
          current: 1,
          size: 10,
          name: null,
          materialType: null
        }
      },
      // 素材 结束
      // 合作商
      partnerList() {
        if (this.entList.length === 0) {
          blessingApi.getEntList().then((res) => {
            this.entList = res.data.data
          })
        }
      },
      saveEnt() {
        if (this.tempBlessing.entName != null) {
          for (let i = 0; i < this.entList.length; i++) {
            if (this.entList[i].entName === this.tempBlessing.entName) {
              this.tempBlessing.entId = this.entList[i].entId
              return
            }
          }
        } else {
          this.tempBlessing.entName = ''
        }
      },
      clearEnt() {
        this.tempBlessing.entId = ''
        this.tempBlessing.entName = ''
      },

      // 数据清空
      resetTempActivity() {
        this.blessingList = []
        this.tempActivity = {
          id: null,
          title: null,
          actType: '',
          actPic: '',
          summary: null,
          context: '',
          rangeTime: [],
          startTime: null,
          endTime: null,
          status: '',
          actConfigExpress: {
            actTypeConfig: {
              templateId: null,
              playType: null
            },
            actParticipantConfig: {
              participantType: ["0"],
              participantValue: null
            },
            actNumberConfig: {
              limit: null,
              dailyLimit: null
            },
            actShareConfig: {
              shareFlag: 0,
              shareTitle: null,
              shareIcon: '',
              shareUrl: null,
              shareDesc: null,
            }
          },
          actBlessingThemes: []
        }
        this.$refs.editor.setHtml(this.tempActivity.context)
      },
      resetTempBlessing() {
        this.blessingIndex = null
        this.musicsNameList = []
        this.videosNameList = []
        this.tempBlessing = {
          id: null,
          actId: null,
          blessingType: null,
          name: null,
          orderNo: null,
          description: null,
          //合作商
          entId: '',
          entName: '',
          //扩展信息
          themeExt: null,
          actBlessingThemeExtExPress: {
            cardTemplates: [],
            musics: [],
            videos: [],
            texts: []
          }
        }
      }
    }
  }
</script>

<style>
  .img-item {
    position: relative;
    float: left;
    width: 180px;
    margin: 0 20px 20px 0;
    text-align: center;
  }

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

  .add-blessing {
    margin-left: 20px;
    margin-top: 10px;
    text-align: center;
    display: inline-block;
    vertical-align: middle
  }

  .demo-upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .demo-upload-list img {
    width: 100%;
    height: 100%;
  }

  .demo-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .demo-upload-list:hover .demo-upload-list-cover {
    display: block;
  }

  .demo-upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>
