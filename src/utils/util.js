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

// 经纬度转化
export function latLonTransform (latLon, flag) {
  let newLatLon
  if (Number(localStorage.getItem('latLon')) === 0) { // 换算为度
    newLatLon = `${Math.abs(latLon).toFixed(5)}°`
  } else if (Number(localStorage.getItem('latLon')) === 1) { // 换算为度分
    newLatLon = changeToDF(Math.abs(latLon))
  } else if (Number(localStorage.getItem('latLon')) === 2) { // 换算为度分秒
    newLatLon = changeToDFM(Math.abs(latLon))
  } else {
    newLatLon = changeToDFM(Math.abs(latLon))
  }
  if (flag === 'lat') { // 纬度转换
    if (latLon > 0) {
      newLatLon = `N${newLatLon}`
    } else {
      newLatLon = `S${newLatLon}`
    }
  } else { // 经度转换
    if (latLon > 0) {
      newLatLon = `E${newLatLon}`
    } else {
      newLatLon = `W${newLatLon}`
    }
  }
  return newLatLon
}