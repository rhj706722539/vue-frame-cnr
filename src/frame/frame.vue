<template>
    <div class="layout layout--one-screen bg-gray-lightest-5">
        <div class="layout-content layout-delete-dot">
             <div class="layout-nav navbar navbar-expand-lg align-items-center layout-nav--top">
                <div class="l-hd">
                    <div class="m-nav">
                        <div class="m-nav-menu">
                            <ul>
                                <li><i class="aid aid-view-headline"></i></li>
                            </ul>
                        </div>
                        <div class="m-nav-lg">
                            <img src="../../assets/img/nlogo.png" alt="">
                            江苏移动渠道中心
                        </div>
                    </div>
                    <div class="m-nav-rtlst">
                        <label class="line"></label>
                        <div class="m-nav-rtlst-favorites">
                            <p><i class="aid aid-folder-outline"></i></p>
                        </div>
                        <div class="m-nav-rtlst-favorites">
                            <p><i class="aid aid-outbox"></i></p>
                        </div>
                        <div class="m-nav-caoz">
                            <i class="aid aid-swap-horizontal"></i>
                        </div>
                        <div class="m-nav-rtlst-user">
                            <div class="user-title">
                                <ul>
                                    <li class="userimg">
                                        <img src="../../assets/img/photo.png" alt="">
                                    </li>
                                    <li class="uesr-phone">
                                        <p>系统管理员</p>
                                        <p class="phone">13800000000</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
           <div class="layout-main">
                <div class="layout-main--content">
                    <router-view></router-view>
                </div>
            </div> 
        </div>
        <!-- <div class="slide-wrap-content" :class="[{'slideWrapClose': hideSlideWrapSlip}]">
            <t-icon type="close" size="36" class="icon-close mr-5 mt-3" @click.native="handleClickClose"></t-icon>
        </div> -->
    </div>
</template>
<script>
    import ClickoutSide from './clickoutside.js'
    // import SessionStorage from '../utils/sessionStorage.js'
    import LocalStorage from '../utils/localStorage.js'
    import {transData, getQueryData, getQuery, uuid} from '../utils/utils.js'
    import * as Constant from '../store/constant.js'
    import {mapMutations, mapState} from 'vuex'
    import {Base64} from 'js-base64'
    import QueryString from 'query-string'
    // import EventHub from '../eventHub'
    // let sessionStorage = new SessionStorage ()
    let localStorage = new LocalStorage()

    let timeout = null

    let throttle = function (func, wait, options) {
        let context
        let args
        let result
        // 上次执行时间点
        let previous = 0
        if (!options) options = {}
        // 延迟执行函数
        let later = function () {
            // 若设定了开始边界不执行选项，上次执行时间始终为0
            previous = options.leading === false ? 0 : new Date().getTime()
            timeout = null
            result = func.apply(context, args)
            if (!timeout) context = args = null
        }
        return function () {
            let now = new Date().getTime()
            // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
            if (!previous && options.leading === false) previous = now
            // 延迟执行时间间隔
            let remaining = wait - (now - previous)
            context = this
            args = arguments
            // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
            // remaining大于时间窗口wait，表示客户端系统时间被调整过
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout)
                timeout = null
                previous = now
                result = func.apply(context, args)
                if (!timeout) context = args = null
                // 如果延迟执行不存在，且没有设定结尾边界不执行选项
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining)
            }
            return result
        }
    }

    export default {
        name: 'TFrame',
        props: {
            img: {
                type: String
            },
            imgMin: {
                type: String
            },
            // logo 路由
            // logoRouter: {
            //     type: Object,
            //     default: () => {
            //         return {
            //             path: '/'
            //         }
            //     }
            // },
            // 当前展开的menu
            activeMenu: {
                type: [String, Number]
            },
            openNames: {
                type: [Array]
            },
            /**
             * 渲染menu菜单
             * {
             *  menuIcon, 一级菜单的右侧icon的type，对应的是aidesign的图标库
             *  name, 当前菜单的名称
             *  path, 路由的path对象
             *  link  非本项目的链接
             * }
             */
            menuList: {
                type: Array,
                default: () => {
                    return []
                }
            },
            /**
             * 渲染头部menu
             * {
             *  type, 'icon'| 'dropdown' | 'avatar'
             *  icon, 图标icon的type，对应的是aidesign的图标库
             *  children, 如果是dropdown时需要提供dropdownitem
             * }
             */
            navs: {
                type: Array,
                default: []
            },
            /**
             * 服务调用实例
             */
            instance: {
                type: Function
            },
            /**
             * 登录相关的设置
             */
            authorization: {
                type: Object
            },
            /**
             * 当前服务的
             */
            tag: {
                type: String
            }
        },
        data() {
            return {
                formRight:{
                    staffName: '',
                    staffNo: '',
                },
                isOpen: true,
                isOpenOnMinWin: true,
                openPosition: 'down',
                clientWidth: 1200,
                showMenu: true,
                needBackDrop: false,
                hideSlip: true,
                hideSlideWrapSlip: true,
                accordion: true,
                isActive: 0,
                menu: [],
                count: 10,
                notices: [],
                queryActiveMenu: '',
                queryOpenName: [],
                lang: 'EN',
                tabs: 'tab-1'
            }
        },
        computed: {
            breadcrumbArr(){
                return this.$store.state.storeModule.breadcrumbArr
            },
            treeData() {
                if (this.menuList && this.menuList.length) {
                    return this.menuList
                } else if (this.menu && this.menu.length) {
                    return this.menu
                }
                return []
            },
            ins() {
                this.setInstance(this.instance)
                return this.instance
            },
            auth() {
                this.setAuthorization(this.authorization)
                return this.authorization
            },
            pagerFooter() {
                let year = new Date().getFullYear()
                return `©️${year} ` + this.$t('frame.pagerFooter')
            }
        },
        directives: {
            ClickoutSide
        },
        filters: {
            format: function (param) {
                if (!param || param < 0) return ''
                let crt = new Date(param)

                function Format(format) {
                    let fmt = format
                    if (!fmt) fmt = 'yyyy/MM/dd HH:mm:ss'
                    let o = {
                        "M+": crt.getMonth() + 1, //月份
                        "d+": crt.getDate(), //日
                        "h+": crt.getHours(), //小时
                        "m+": crt.getMinutes(), //分
                        "s+": crt.getSeconds(), //秒
                        "q+": Math.floor((crt.getMonth() + 3) / 3), //季度
                        "S": crt.getMilliseconds() //毫秒
                    };
                    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (crt.getFullYear() + "").substr(4 - RegExp.$1.length))
                    for (let k in o)
                        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
                    return fmt
                }

                return Format('yyyy/MM/dd')
            }
        },
        methods: {
//            goRoute(path){
//                this.$router.push({name: path})
//            },

            /* 消息点击触发 */
            handleNoticeClick(index, item) {
                this.isActive = index
                // this.hideSlideWrapSlip = false
                this.hideSlip = true
                const bulletinId = item.bulletinId
                this.$router.push({name: 'notice', params: {bulletinId}})
                // this.$router.push({ path: `/notice/${item.bulletinId}` })
                // this.$router.push({ path: '/notice', query: { bulletinId: item.bulletinId } })
            },
            /* 页面存在点击操作、keyUp操作, 将sessionTime更新 */
            handleRefreshSessionTime(that) {
                /**
                 *  在存数据之前需要判断一下当前 sessionTime 是否生效
                 *  如果已经失效，则不需要存数据
                 *  如果没失效，这里需要判断accsstoken 是否存在，不存在的话，需要重新请求token
                 */
                let accessToken = localStorage.get('access_token')
                let refreshToken = localStorage.get('refresh_token')
                let sessionTime = localStorage.get('session_time')
                let currentTime = new Date().getTime()
                /**
                 * sessionTime 存在,需要重新设置sessiontime的过期时间
                 */
                if (sessionTime) {
                    let time = new Date().getTime() + 30 * 60 * 1000
                    throttle(() => {
                        localStorage.set('session_time', time, 30 * 60 * 1000)
                    }, 5 * 1000, {leading: false, trailing: true})()

                    /**
                     * accessToken 不存在，需要根据refreshToken，获取并设置accessToken、refreshToken
                     */
                    if (!accessToken) {
                        that.instance.post(that.authorization.tokenUri +
                            '?grant_type=refresh_token' + '&refresh_token=' + encodeURIComponent(refreshToken) + '&scope=read', '', {
                            headers: {
                                Authorization: 'Basic ' + Base64.encode(that.authorization.client_id + ':' + that.authorization.clientSecret)
                            }
                        })
                            .then(res => {
                                localStorage.set('access_token', res.data.access_token, res.data.expires_in * 1000)
                                // localStorage.set('refresh_token', res.data.refresh_token, Math.pow(2, 32))
                            }).catch(res => {
                            if (res && res.response) {
                                switch (res.response.status) {
                                    /**
                                     * 判断相关的错误，例如判断 token 失效， 或者没有登录的情况
                                     */
                                    case 401:
                                        that.getTokenAgian()
                                        break
                                }
                            }
                        })
                    }
                } else {
                    let alink = document.createElement('a')
                    alink.href = window.location.href
                    let path = alink.pathname.replace(/^([^\/])/, '/$1')
                    localStorage.set('aid-path', decodeURIComponent(path))
                    that.logoutAndRemoveSession()
                }
            },
            /* 加载更多 */
            loadingMore() {
                this.hideSlip = true
                this.$router.push({name: 'notice-list'})
            },
            /* 点击图标触发 */
            // handleLogout(item) {
            //     if (item && item.handleType && item.handleType === 'logout') {
            //         /* 登出 */
            //         this.logoutAndRemoveSession()
            //     }
            // },
            // logoutAndRemoveSession() {
            //     localStorage.remove('access_token')
            //     localStorage.remove('refresh_token')
            //     localStorage.remove('session_time')
            //     window.location.href = this.authorization.logout_uri
            // },
            /* 到修改密码 */
            toChangePWD() {
                // window.location.href="/cust/"
                window.location.reload();
                this.$router.push({name: 'change'})
            },
            closeMenuOnMinWin() {
                this.isOpenOnMinWin = true
            },
            openOrClose() {
                this.isOpen = !this.isOpen
                this.isOpenOnMinWin = false
                // if (this.clientWidth >= 1200 && !this.isOpen) {
                //  this.openPosition = 'right'
                // } else {
                //  this.openPosition = 'down'
                // }
                if (this.clientWidth >= 1200) {
                    this.openPosition = this.openPosition === 'down' ? 'right' : 'down'
                } else {
                    this.openPosition = 'down'
                }

                if (this.clientWidth >= 1200 && !this.isOpen) {
                    this.showMenu = false
                } else {
                    this.showMenu = true
                }
            },
            hdMenuClick(name) {
                this.$emit('menu-click', name)
            },
            handleNavSelect(name) {
                this.$emit('nav-menu-click', name)
            },
            getMenu(item) {
                this.$emit('on-click', item)
            },
            showSlipbox() {
                this.hideSlip = false
            },
            hideSlipbox() {
                this.hideSlip = true
            },
            _ischild(child) {
                while (child !== undefined && child !== null && child.tagName.toUpperCase() !== 'BODY') {
                    if (child === this.$el) {
                        return true
                    }
                    child = child.parentNode
                }
                return false
            },
            _isChildNode(child, parent) {
                while (child !== undefined && child !== null && child.tagName.toUpperCase() !== 'BODY') {
                    if (child === this.$el.getElementsByClassName(parent)[0]) {
                        return true
                    }
                    child = child.parentNode
                }
                return false
            },
            handleClickoutSide(e) {
                if (this._ischild(e.target) && (!e.target.classList.contains('slipbox__content') || !this._isChildNode(e.target, 'slipbox__content')) && !this._isChildNode(e.target, 'slide-wrap-content')) {
                    this.hideSlipbox()
                    return true
                }
                return false
            },
            /* 切换语言 */
            handleChangeLang() {
                if (this.lang === 'EN') {
                    this.lang = '中'
                    localStorage.set('aid-language', 'en-US')
                    this.$i18n.locale = 'en-US'
                } else if (this.lang === '中') {
                    this.lang = 'EN'
                    localStorage.set('aid-language', 'zh-CN')
                    this.$i18n.locale = 'zh-CN'
                }
                this.instance.post(this.authorization.changeLangUri, {
                    language: this.lang === '中' ? 'en' : 'zh'
                }).then(res => {
                    window.location.reload()
                }).catch(res => {
                    /**
                     * 处理相关错误的问题
                     */
                    if (res && res.response) {
                        switch (res.response.status) {
                            /**
                             * 判断相关的错误，例如判断 token 失效， 或者没有登录的情况
                             */
                            case 401:
                                let that = this
                                let title = this.$t('frame.systemInfo')
                                let content = this.$t('frame.systemInfoContent')
                                this.$Modal.warning({
                                    title: title,
                                    content: content,
                                    onOk: () => {
                                        let accessToken = localStorage.get('access_token')
                                        let refreshToken = localStorage.get('refresh_token')
                                        if (!accessToken || !refreshToken) return
                                        let msg = {
                                            client_id: that.authorization.client_id,
                                            redirect_uri: encodeURIComponent(that.authorization.redirect_uri),
                                            state: uuid(6, 16)
                                        }
                                        window.location.href = that.authorization.authorizeUri + '?client_id=' + msg.client_id + '&redirect_uri=' + msg.redirect_uri + '&response_type=code&scope=read&state=' + msg.state
                                    }
                                })
                                break
                        }
                    }
                })
            },
            /* 跳出当前域，并将其 path 保存下来 */
            handleOtherRegin(url) {
                let accessToken = localStorage.get('access_token')
                let sessionTime = localStorage.get('session_time')
                let refreshToken = localStorage.get('refresh_token')
                let that = this

                if (sessionTime && !accessToken) {
                    that.instance.post(that.authorization.tokenUri +
                        '?grant_type=refresh_token' + '&refresh_token=' + encodeURIComponent(refreshToken) + '&scope=read', '', {
                        headers: {
                            Authorization: 'Basic ' + Base64.encode(that.authorization.client_id + ':' + that.authorization.clientSecret)
                        }
                    }).then(res => {
                        localStorage.set('access_token', res.data.access_token, res.data.expires_in * 1000)
                        // localStorage.set('refresh_token', res.data.refresh_token, Math.pow(2, 32))
                        let alink = document.createElement('a')
                        alink.href = url
                        let path = alink.pathname.replace(/^([^\/])/, '/$1')
                        // localStorage.set('aid-path', path)
                        window.location.href = url + '?path=' + path
                    }).catch(res => {
                        let alink = document.createElement('a')
                        alink.href = url
                        let path = alink.pathname.replace(/^([^\/])/, '/$1')
                        // localStorage.set('aid-path', path)
                        window.location.href = url + '?path=' + path
                    })
                } else {
                    let alink = document.createElement('a')
                    alink.href = url
                    let path = alink.pathname.replace(/^([^\/])/, '/$1')
                    // localStorage.set('aid-path', path)
                    window.location.href = url + '?path=' + path
                }
            },
            /* 用于处理401重新再发请求 */
            // 重新获取 token
            // 获取menu后重新如果返回401
            getTokenAgian(cb) {
                let that = this
                let refreshToken = localStorage.get('refresh_token')
                this.instance.post(this.authorization.tokenUri +
                    '?grant_type=refresh_token' + '&refresh_token=' + encodeURIComponent(refreshToken) + '&scope=read', '', {
                    headers: {
                        Authorization: 'Basic ' + Base64.encode(that.authorization.client_id + ':' + that.authorization.clientSecret)
                    }
                })
                    .then(res => {
                        localStorage.set('access_token', res.data.access_token, res.data.expires_in * 1000)
                        // localStorage.set('refresh_token', res.data.refresh_token, Math.pow(2, 32))
                        cb && cb()
                    })
            },
            // 获取menu数据
            getMenuCb() {
                this.instance.get(this.authorization.menuUri,
                    {
                        params: {
                            language: this.lang
                        }
                    }).then(res => {
                    this.menu = transData(res.data, 'menuId', 'menuPid', 'children', 'menuOrder')
                    /**
                     * 设置自动展开
                     */
                    this.$nextTick(() => {
                        let route = localStorage.get('aid-path') || this.$route.path || getQuery('path') || '/'
                        let queryName = getQueryData(res.data, 'menuId', 'menuPid', decodeURIComponent(route), 'menuName')
                        this.queryActiveMenu = queryName.name
                        this.queryOpenName = queryName.names
                        let routeArr2 = ['/res', '/cust', '/order', '/acct', '/rpt', '/prod', '/odp', '/base', '/']
                        let querys = localStorage.get('query-key')
                        if (route && !routeArr2.includes(decodeURIComponent(path))) {
                            let query = JSON.parse(querys)
                            this.$router.push({path: decodeURIComponent(route), query: query})
                            localStorage.remove('aid-path')
                            localStorage.remove('query-key')
                        }
                    })
                    /**
                     * 先找出这一条数据，并将其 menuName 组成一个数组
                     */
                }).catch(res => {
                    /**
                     * 处理相关错误的问题
                     */
                    if (res && res.response) {
                        switch (res.response.status) {
                            /**
                             * 判断相关的错误，例如判断 token 失效， 或者没有登录的情况
                             */
                            case 401:
                                /**
                                 * 增加错误判断，避免无限刷新
                                 */
                                    // let invalidCount = localStorage.get('token-invalid')
                                    // localStorage.set('token-invalid', parseInt(invalidCount) + 1)
                                let that = this
                                let title = this.$t('frame.systemInfo')
                                let content = this.$t('frame.systemInfoContent')
                                this.$Modal.warning({
                                    title: title,
                                    content: content,
                                    onOk: () => {
                                        let accessToken = localStorage.get('access_token')
                                        let refreshToken = localStorage.get('refresh_token')
                                        if (!accessToken || !refreshToken) return
                                        let msg = {
                                            client_id: that.authorization.client_id,
                                            redirect_uri: encodeURIComponent(that.authorization.redirect_uri),
                                            state: uuid(6, 16)
                                        }
                                        window.location.href = that.authorization.authorizeUri + '?client_id=' + msg.client_id + '&redirect_uri=' + msg.redirect_uri + '&response_type=code&scope=read&state=' + msg.state
                                    }
                                })
                                break
                        }
                    }
                })
            },
            getbulletinListCb() {
                this.instance.get(this.authorization.bulletinListUri,
                    {
                        params: {
                            pageNo: 1,
                            pageSize: 10
                        }
                    }).then(res => {
                    this.notices = res.data.result
                }).catch(res => {
                    /**
                     * 处理相关错误的问题
                     */
                    if (res && res.response) {
                        switch (res.response.status) {
                            /**
                             * 判断相关的错误，例如判断 token 失效， 或者没有登录的情况
                             */
                            case 401:
                                let that = this
                                let title = this.$t('frame.systemInfo')
                                let content = this.$t('frame.systemInfoContent')
                                this.$Modal.warning({
                                    title: title,
                                    content: content,
                                    onOk: () => {
                                        let accessToken = localStorage.get('access_token')
                                        let refreshToken = localStorage.get('refresh_token')
                                        if (!accessToken || !refreshToken) return
                                        let msg = {
                                            client_id: that.authorization.client_id,
                                            redirect_uri: encodeURIComponent(that.authorization.redirect_uri),
                                            state: uuid(6, 16)
                                        }
                                        window.location.href = that.authorization.authorizeUri + '?client_id=' + msg.client_id + '&redirect_uri=' + msg.redirect_uri + '&response_type=code&scope=read&state=' + msg.state
                                    }
                                })
                                break
                        }
                    }
                })
            },
            //查询
            queryStaff() {
                let that = this;
                this.$nextTick(() => {
                    this.instance.get(this.authorization.getStaffName, {}).then(res => {
                        that.formRight = res.data;
                    }).catch(res => {
                        that.makeAlert(that.$t('frame.warning'));
                    })
                })
            },
            ...mapMutations([
                'setInstance',
                'setAuthorization'
            ])
        },
        async created() {
            /* 用于监测传过来的path */
            let path = getQuery('path') || this.$route.path
            debugger
            let routeArr = ['/res', '/cust', '/order', '/acct', '/rpt', '/prod', '/odp', '/base', '/']
            if (path && !routeArr.includes(decodeURIComponent(path))) {
                localStorage.set('aid-path', decodeURIComponent(path))
            }

            /**
             * 获取所有URL query 并存储
             */
            const parsed = QueryString.parse(window.location.search)
            localStorage.set('query-key', JSON.stringify(parsed))
            /**
             * 用于监测用户点击和输入行为
             */
            let that = this
            document.body.onclick = function () {
                that.handleRefreshSessionTime(that)
            }
            document.body.onkeyup = function () {
                that.handleRefreshSessionTime(that)
            }
            // let path = getQuery('path')
            // localStorage.set('aid-path', path, 5 * 60 * 1000)
            let accessToken = localStorage.get('access_token')
            let refreshToken = localStorage.get('refresh_token')
            if (!accessToken || !refreshToken) return
            if (this.menuList && this.menuList.length) return

            // 获取login处设置的语言
            // let fetchLang = await this.instance.get(this.authorization.langUri)
            // if (fetchLang.data === '中') {
            //     this.lang = 'EN'
            //     localStorage.set('aid-language', 'zh-CN')
            //     this.$i18n.locale = 'zh-CN'
            // } else if (fetchLang.data === 'en') {
            //     this.lang = '中'
            //     localStorage.set('aid-language', 'en-US')
            //     this.$i18n.locale = 'en-US'
            // }

            
        },
        mounted() {
            console.log(this.$store.state.storeModule.breadcrumbArr)
            // this.queryStaff();
            /* 设置 */
            this.$nextTick(() => {
                this.setInstance(this.instance)
                this.setAuthorization(this.authorization)
            })
            let that = this
            let clientWidth = document.body.clientWidth || document.body.offsetWidth
            that.clientWidth = clientWidth
            if (this.clientWidth < 1200) {
                this.openPosition = 'down'
            }
            if (that.clientWidth >= 1200 && !that.isOpen) {
                that.showMenu = false
            } else {
                that.showMenu = true
            }
            window.addEventListener('resize', () => {
                let clientWidth = document.body.clientWidth || document.body.offsetWidth
                that.clientWidth = clientWidth
                if (that.clientWidth < 1200) {
                    that.openPosition = 'down'
                }

                if (that.clientWidth >= 1200 && !that.isOpen) {
                    that.showMenu = false
                } else {
                    that.showMenu = true
                }
            })
        }
    }
</script>
<style lang="scss">
    @import './frame.scss';
</style>