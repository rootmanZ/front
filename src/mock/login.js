import {getParams} from '@/libs/util'

const USER_MAP = {
    super_admin: {
        name: 'super_admin',
        user_id: '1',
        access: ['super_admin', 'admin'],
        token: 'super_admin',
        avator: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png'
    },
    admin: {
        name: 'admin',
        user_id: '2',
        access: ['admin'],
        token: 'admin',
        avator: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
    }
}

export const login = req => {
    req = JSON.parse(req.body)
    return {token: USER_MAP[req.userName].token}
}

export const getUserInfo = req => {
    const params = getParams(req.url)
    return USER_MAP[params.token]
}

export const logout = req => {
    return null
}

export const getUserMenus = req => {
    return [
        // 粘贴到这里就可以了
        // 需要把所有的component: '/view/**/*.vue')
        // 修改为component: 'view/**/*.vue'
        // 注意main和parent-view

        {
            path: '/system',
            name: 'system',
            meta: {
                icon: 'ios-settings',
                title: '系统管理'
            },
            component: 'components/main',
            children: [
                {
                    path: 'user',
                    name: 'user',
                    meta: {
                        icon: 'ios-people',
                        title: '用户管理'
                    },
                    component: 'view/system/User.vue'
                },
                {
                    path: 'dept',
                    name: 'dept',
                    meta: {
                        icon: 'ios-people',
                        title: '部门管理'
                    },
                    component: 'view/system/Dept.vue'
                },
                {
                    path: 'menu',
                    name: 'menu',
                    meta: {
                        icon: 'ios-people',
                        title: '菜单管理'
                    },
                    component: 'view/system/Menu.vue'
                },
                {
                    path: 'role',
                    name: 'role',
                    meta: {
                        icon: 'ios-people',
                        title: '角色管理'
                    },
                    component: 'view/system/Role.vue'
                }
            ]
        },
        {
            path: '',
            name: 'doc',
            meta: {
                title: '文档',
                href: 'https://lison16.github.io/iview-admin-doc/#/',
                icon: 'ios-book'
            }
        },
        {
            path: '/join',
            name: 'join',
            component: 'components/main',
            meta: {
                hideInBread: true
            },
            children: [
                {
                    path: 'join_page',
                    name: 'join_page',
                    meta: {
                        icon: '_qq',
                        title: 'QQ群'
                    },
                    component: '/view/join-page.vue'
                }
            ]
        }

    ]
}
