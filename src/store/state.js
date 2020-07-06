import { localRead } from "@/libs/utils"
import { baseUrl } from '@/libs/request'

export default {
  token: localRead('token'),
  refreshToken: localRead('refreshToken'),
  menuId: '',
  id: '',
  roleIds: '',
  systemFlag: 'baize',
  account: '',
  userName: '',
  password: '',
  phone: '',
  email: '',
  companyIds: '',
  departmentIds: '',
  locking: '0',
  access: '',
  avatarImgPath: '',
  breadCrumbList: [],
  tagNavList: [],
  pageName: [],
  homeRoute: {},
  local: '',
  unreadCount: 0,
  errorList: [],
  hasReadErrorPage: false,
  hasGetMenuInfo: false,
  uploadUrl: `${baseUrl}/api/usercenter/v1/user/uploadheadicon`,
  timer: null, // 全局定时器对象
  refreshingToken: false, // 是否正在刷新token true正在刷新
  _setLoginOutTimeValue: 3600 * 12, // 秒, 自动登出时间
  _setTimeValue: 2400, // 秒, 刷新token等的间隔时间
  _setCheckTimeValue: 10, // 秒, 设置全局定时器的刷新频率
  checksnUploadUrl: `${baseUrl}/api/materialcenter/v1/checksn/add`, //批量导入SN检查Excel文件
  attendancePersonnelUploadUrl: `${baseUrl}/api/usercenter/v1/carduser/upload`, //批量导入考勤人员Excel文件
  userattlimitUploadUrl:`${baseUrl}/api/usercenter/v1/userattlimit/upload`,//考勤排班批量导入
}