import { getMenuByRouter } from '@/libs/utils'
import routers from '@/router/routers'

export default {
  menuList: state => getMenuByRouter(routers, state.access),
  errorCount: state => state.errorList.length
}