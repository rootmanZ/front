## Install 初始化
```bush
npm install
```
## Run 运行
### local  本地启动
```bush
npm run local
```
### dev(Build) 开发/测试环境打包
```bush
npm run build:dev
```
### prod(Build) 生产环境打包
```bush
npm run build:prod
```

##多环境配置
development、test和production是NODE_ENV的默认环境变量，所以不能使用。
```bush
.env.local 本地环境文件
.env.dev 开发/测试环境 文件
.env.prod 生产环境文件
```
环境变量文件属性说明：
```bush
NODE_ENV NODE环境变量
VUE_APP_ENV 对应项目中多环境的值(要替换src目录下文件中的某个参数则要以VUE_APP_开头)
VUE_APP_MOCK 是否引入mock.js文件的标识
BASE_URL 前端项目访问时的相对地址(打包时的路径，vue.config.js中使用)
```
## 简介
项目使用[iview-admin](https://github.com/iview/iview-admin)作为基础框架，UI组件库使用[iView](https://www.iviewui.com/)。

## 文件结构
```shell
.
├── build  项目构建配置
├── config  开发相关配置
├── public  打包所需静态资源
└── src
    ├── api  AJAX请求
    └── assets  项目静态资源
        ├── icons  自定义图标资源
        └── images  图片资源
    ├── components  业务组件
    ├── config  项目运行配置
    ├── directive  自定义指令
    ├── libs  封装工具函数
    ├── locale  多语言文件
    ├── mock  mock模拟数据
    ├── router  路由配置
    ├── store  Vuex配置
    ├── view  页面文件
    └── tests  测试相关
```
