import {
  getNextRoute,
  routeEqual,
  getHomeRoute,
  getBreadCrumbList,
  routeHasExist,
  getRouteTitleHandled,
  getTagNavListFromLocalstorage,
  setTagNavListInLocalstorage,
  localSave
} from '@/libs/utils'
import router from '@/router'
import routers, { fixRouter } from '@/router/routers'
import config from '@/config'

const { homeName } = config
const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  router.push(nextRoute)
}
export default {
  updateMenuId (state, route) {
    state.menuId = route
  },
  updateAvatarImgPath (state, route) {
    state.avatarImgPath = route
  },
  updateHasGetMenuInfo (state, data) {
    state.hasGetMenuInfo = data
  },
  updatePageName (state, data) {
    state.pageName = data
  },
  updateAppRouter (state, route) {
    routers.splice(0, routers.length)
    routers.push(...route, ...fixRouter)
    // router.addRoutes(route)
  },
  setBreadCrumb (state, route) {
    state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
  },
  setToken(state, data) {
    state.token = data.access_token
    state.refreshToken = data.refresh_token
  },
  setUserInfo(state, data) {
    state.roleIds = data.roleIds
    state.systemFlag = data.systemFlag
    state.account = data.account
    state.userName = data.name
    state.password = data.password
    state.avatarImgPath = data.headIcon
    state.phone = data.phone
    state.email = data.email
    state.companyIds = data.companyIds
    state.departmentIds = data.departmentIds
    state.id = data.id
    state.simpleSpelling = data.simpleSpelling
  },
  setLocking(state, data) {
    state.locking = data
  },
  closeTag (state, route) {
    let tag = state.tagNavList.filter(item => routeEqual(item, route))
    route = tag[0] ? tag[0] : null
    if (!route) return
    closePage(state, route)
  },
  setTagNavList (state, list) {
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
  addTag (state, { route, type = 'unshift' }) {
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
  setLocal (state, lang) {
    localSave('local', lang)
    state.local = lang
  },
  setHomeRoute (state, routes) {
    state.homeRoute = getHomeRoute(routes, homeName)
  },
  setTimer (state, timerObj) {
    state.timer = timerObj
  },
  setRefreshingToken (state, boolean) {
    state.refreshingToken = boolean
  }
}