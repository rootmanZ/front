import {
    backendMenusToRouters,
    getBreadCrumbList,
    getHomeRoute,
    getMenuByRouter,
    getNextRoute,
    getRouteTitleHandled,
    getTagNavListFromLocalstorage,
    localRead,
    localSave,
    routeEqual,
    routeHasExist,
    setTagNavListInLocalstorage
} from '@/libs/util'
import {saveErrorLogger} from '@/api/data'
import router from '@/router'
import config from '@/config'
import {listUserMenus} from '@/api/user'

const {homeName} = config

const closePage = (state, route) => {
    const nextRoute = getNextRoute(state.tagNavList, route)
    state.tagNavList = state.tagNavList.filter(item => {
        return !routeEqual(item, route)
    })
    router.push(nextRoute)
}

export default {
    state: {
        breadCrumbList: [],
        tagNavList: [],
        homeRoute: {},
        local: localRead('local'),
        errorList: [],
        hasReadErrorPage: false,
        routers: [],
        hasGetRouter: false
    },
    getters: {
        menuList: (state, getters, rootState) => getMenuByRouter(state.routers, rootState.user.access),
        errorCount: state => state.errorList.length
    },
    mutations: {
        setBreadCrumb(state, route) {
            state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
        },
        setHomeRoute(state, routes) {
            state.homeRoute = getHomeRoute(routes, homeName)
        },
        setTagNavList(state, list) {
            let tagList = []
            if (list) {
                tagList = [...list]
            } else tagList = getTagNavListFromLocalstorage() || []
            if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
            let homeTagIndex = tagList.findIndex(item => item.name === homeName)
            if (homeTagIndex > 0) {
                let homeTag = tagList.splice(homeTagIndex, 1)[0]
                tagList.unshift(homeTag)
            }
            state.tagNavList = tagList
            setTagNavListInLocalstorage([...tagList])
        },
        closeTag(state, route) {
            let tag = state.tagNavList.filter(item => routeEqual(item, route))
            route = tag[0] ? tag[0] : null
            if (!route) return
            closePage(state, route)
        },
        addTag(state, {route, type = 'unshift'}) {
            let router = getRouteTitleHandled(route)
            if (!routeHasExist(state.tagNavList, router)) {
                if (type === 'push') state.tagNavList.push(router)
                else {
                    if (router.name === homeName) state.tagNavList.unshift(router)
                    else state.tagNavList.splice(1, 0, router)
                }
                setTagNavListInLocalstorage([...state.tagNavList])
            }
        },
        setLocal(state, lang) {
            localSave('local', lang)
            state.local = lang
        },
        addError(state, error) {
            state.errorList.push(error)
        },
        setHasReadErrorLoggerStatus(state, status = true) {
            state.hasReadErrorPage = status
        },
        setRouters(state, routers) {
            state.routers = routers
        },
        setHasGetRouter(state, status) {
            state.hasGetRouter = status
        }
    },
    actions: {
        addErrorLog({commit, rootState}, info) {
            if (!window.location.href.includes('error_logger_page')) commit('setHasReadErrorLoggerStatus', false)
            const {user: {token, userId, userName}} = rootState
            let data = {
                ...info,
                time: Date.parse(new Date()),
                token,
                userId,
                userName
            }
            saveErrorLogger(info).then(() => {
                commit('addError', data)
            })
        },
        getRouters({commit}) {
            return new Promise((resolve, reject) => {
                try {
                    listUserMenus().then(res => {
                        let routers = backendMenusToRouters(res.data)
                        commit('setRouters', routers)
                        commit('setHasGetRouter', true)
                        resolve(routers)
                    }).catch(err => {
                        reject(err)
                    })
                } catch (error) {
                    reject(error)
                }
            })
        }
    }
}
