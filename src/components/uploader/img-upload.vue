<template>
  <!--图片上传组件-->
  <div>
    <!--已上传照片列表-->
    <div class="demo-upload-list" v-if="imgUrl !== ''" :style="uploadListStyle">
      <img :src=imgUrl>
      <!--遮罩层-->
      <div class="demo-upload-list-cover">
        <div :style="uploadIconStyle">
          <Icon type="ios-eye-outline" @click.native="handleView"></Icon>
          <Icon v-if="optStatus !== 'detail'" type="ios-trash-outline" @click.native="handleRemove"></Icon>
        </div>
      </div>
    </div>
    <!--上传组件-->
    <Upload
      v-if="imgUrl === ''"
      ref="upload"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      :action="this.$apiBaseUrl+'/file/image/upload'"
      :on-success="handleSuccess"
      multiple
      type="drag"
      style="display:inline-block;">

      <!--上传图标-->
      <div :style="uploadIconStyle">
        <Icon type="ios-camera" size="20"></Icon>
      </div>
    </Upload>
    <!--像素-->
    <div v-if="showPx" class="showPx">
      ({{requiredWidth}}px*{{requiredHeight}}px)
    </div>
    <!--弹窗-->
    <Modal title="图片查看" v-model="visible">
      <img :src="imgUrl" v-if="visible"
           style="width: 100%">
    </Modal>
  </div>
</template>
<script>
export default {
  name: 'Img-Upload',

  // 传入参数
  props: {
    // 组件大小
    width: {
      type: Number,
      default: 100,
      required: false
    },
    height: {
      type: Number,
      default: 100,
      required: false
    },
    // 像素限制
    requiredWidth: {
      type: Number,
      required: true
    },
    requiredHeight: {
      type: Number,
      required: true
    },
    // 照片url
    initUrl: {
      type: String,
      required: true
    },
    // 是否显示像素
    showPx: {
      type: Boolean,
      default: true,
      required: false
    },
    // 操作状态(detail屏蔽删除)
    optStatus: {
      type: String,
      default: '',
      required: false
    }

  },
  data () {
    return {
      visible: false,
      imgUrl: '',

      // 样式绑定
      uploadListStyle: 'display:inline-block;width:' + this.width + 'px;height:' + this.height + 'px',
      uploadIconStyle: 'width:' + this.width + 'px;height:' + this.height + 'px;line-height:' + this.height + 'px;'
    }
  },
  created () {

  },

  watch: {
    initUrl: function (newVel, oldVel) {
      this.imgUrl = this.initUrl
    }
  },

  mounted () {
    this.imgUrl = this.initUrl
  },

  methods: {

    handleView () {
      this.visible = true
    },
    handleRemove () {
      this.imgUrl = ''
      this.$emit('getImgUrl', this.imgUrl)
    },
    handleSuccess (res, file) {
      this.imgUrl = res.data
      this.$Notice.success({
        title: '上传成功',
        desc: `文件${file.name}，上传成功`
      })
      this.$emit('getImgUrl', this.imgUrl)
    },

    beforeUpload (file) {
      // 上传图片前处理函数
      const isJPG =
          file.type === 'image/jpeg' ||
          file.type === 'image/png' ||
          file.type === 'image/gif'
      const isLt1M = file.size / 1024 / 1024 < 1

      if (!isJPG) {
        this.$Notice.warning({
          title: '文件类型错误',
          desc: `文件${file.name}不是图片文件，请选择后缀为png/jpeg/gif的文件。`
        })
      }
      if (!isLt1M) {
        this.$Notice.warning({
          title: '文件大小超出限制',
          desc: `文件${file.name}太大, 不能超过1M。`
        })
      }
      let requiredWidth = this.requiredWidth
      let requiredHeight = this.requiredHeight
      const isSize = new Promise(function (resolve, reject) {
        let _URL = window.URL || window.webkitURL
        let image = new Image()
        image.onload = function () {
          let valid = image.width === requiredWidth && image.height === requiredHeight
          valid ? resolve() : reject()
        }
        image.src = _URL.createObjectURL(file)
      }).then(
        () => {
          return file
        },
        () => {
          this.$Notice.warning({
            title: '文件像素错误',
            desc: '要求像素' + requiredWidth + 'x' + requiredHeight
          })
          // return isSize;
          return Promise.reject()
        }
      )
      return isJPG && isLt1M && isSize
    }

  }
}
</script>
<style lang="less">

  .demo-upload-list {
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
    vertical-align: middle;
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

  .showPx {
    height: 20px;
    margin-top: -10px;
    margin-left: 10px;
  }
</style>
