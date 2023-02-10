// 时间戳转换为年月日时分秒
export function transformTime (timestamp) {
  let date = new Date(timestamp) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '-'
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  let D = date.getDate() + ' '
  D = D < 10 ? ('0' + D) : D
  let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
  let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
  let s = date.getSeconds()
  s = s < 10 ? ('0' + s) : s
  return Y + M + D + h + m + s
}