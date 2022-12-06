import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import "leaflet.fullscreen/Control.FullScreen.css"
import "leaflet.fullscreen"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster"
import "../assets/less/leaflet/leaflet.less" //引入聚合点样式

let baseLayers = [] //基本图层
baseLayers['#Empty'] = {}
baseLayers['#street'] = {} // 街道
baseLayers['#satellite'] = {} // 卫星
baseLayers['#terrain'] = {} // 地形
// 随机取[3,7]之间整数
let nodeRandom = Math.floor(Math.random() * 5) + 3
// t4很容易出问题
nodeRandom === 4 && (nodeRandom = 6)
// 街道
baseLayers['#street'].tiles = L.layerGroup([L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)])
// 卫星
baseLayers['#satellite'].tiles = L.layerGroup([L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)])
// 地形
baseLayers['#terrain'].tiles = L.layerGroup([L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)])
baseLayers['#Empty'].tiles = L.tileLayer('https://beidouim.oss-cn-hangzhou.aliyuncs.com/map/img/map_whiteBackGround.jpg', {})
baseLayers['#Empty'].name = '空白'
baseLayers['#street'].name = '街道'
baseLayers['#satellite'].name = '卫星'
baseLayers['#terrain'].name = '地形'
const mapFunc=['polyline','polygon','circle','rectangle']
export default {
  map: null,
  markerGroup: null,
  pointList: {},
  polylineList: {},
  polygon: null,
  mapControl: {},
  initLeaflet: function (eleId) {
    let lat = 23.15385551286836
    let lon = 113.03091108798982
    let zoom = 4
    let reMap
    let tempSortKey = ['#Empty', '#satellite', '#terrain', '#street'] //存储名称以便切换图层
    let defalutLabelIndex = parseInt(sessionStorage.getItem('layerIndex'))
    if (isNaN(defalutLabelIndex)) {
      defalutLabelIndex = 3
    }
    this.map = null
    reMap = L.map(eleId, {
      center: [lat, lon], zoom: zoom, maxZoom: 18, minZoom: 3, layers: [baseLayers[tempSortKey[defalutLabelIndex]].tiles], // 默认地图
      preferCanvas: true, attributionControl: false, zoomControl: false, fullscreenControl: false
    }).setView([lat, lon], zoom)
    reMap._controlCorners.topright.style.position = 'absolute'
    reMap._controlCorners.topright.style.left = '120%'
    var tempSetting = {
      空白: baseLayers['#Empty'].tiles,
      卫星: baseLayers['#satellite'].tiles,
      地形: baseLayers['#terrain'].tiles,
      街道: baseLayers['#street'].tiles
    }
    this.mapControl.layers = L.control.layers(tempSetting)
    this.mapControl.layers.addTo(reMap).setPosition('topright')
    this.mapControl.zomm = L.control.zoom()
    this.mapControl.zomm.addTo(reMap).setPosition('topright')
    this.mapControl.fullscreen = L.control.fullscreen()
    this.mapControl.fullscreen.addTo(reMap).setPosition('topright')
    this.map = reMap
  },
  fitBounds: function (areaData) {
    let corner1 = L.latLng(areaData[0])
    let corner2 = L.latLng(areaData[1])
    let bounds = L.latLngBounds([corner1, corner2])
    this.map.fitBounds(bounds)
  },
  fitPoint(pointData) {
    this.map.setView(pointData, 16);
  },
  renderPoint(list, layersName = 'layers1', iconUrl = require("@/assets/images/leaflet_icon/marker-icon.png"), clusterFlag = false) {
    if (clusterFlag) {
      this.mapControl[layersName] = L.markerClusterGroup({
        spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: true, disableClusteringAtZoom: 16, maxClusterRadius: 60, iconCreateFunction: function (cluster) {
          var tempcount = cluster.getChildCount()
          var tempclass = tempcount > 500 ? 'red' : tempcount > 200 ? 'blue2' : tempcount > 100 ? 'blue' : tempcount > 50 ? 'green2' : 'green'
          return L.divIcon({ html: '<b class="' + tempclass + '">' + cluster.getChildCount() + '</b>' });
        }
      });
    } else { //聚合点
      this.mapControl[layersName] = L.layerGroup()
    }
    this.loadPic(iconUrl).then(() => {
      var icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 41]
      })
      for (var p of list) {
        this.pointList[p.id] = L.marker(L.latLng(p.lat, p.lon), { icon: icon, info: p }).on('click', function (e) {
          console.log('点击的marker的信息:')
          console.log(e.target.options.info)

        }) //以id为属性作为点的区别

        // 点击点出现的信息
        this.pointList[p.id].bindPopup('纬度' + p.lat).openPopup();
        this.mapControl[layersName].addLayer(this.pointList[p.id])
      }
      this.map.addLayer(this.mapControl[layersName]);
    })
  },
  clearLayer(layersName) {
    this.mapControl[layersName].clearLayers()
  },
  loadPic(url) {
    return new Promise(function (pass, fall) {
      var img = new Image()
      img.onload = pass()
      img.onerrof = fall()
      img.src = require(`${url}`) // 解决依赖代码不支持变量，需要转模板模式
    })
  },
  drawPolyline(list, layersName='polylineLayers', type,options={color:'#fc4a14',weight:2}) { //画线
    if(this.mapControl[layersName]){
      this.mapControl[layersName].clearLayers()
    }else{
      this.mapControl[layersName] = L.layerGroup()
    }
    let latlngs = []
    for (var p of list) {
      latlngs.push([p.lat, p.lon])
    }
    let rst = mapFunc.some((item)=>item===type)
    console.log(rst,999)

    
    let polylineList = L.polyline(latlngs, options)  //挂载线路路线  
    this.mapControl[layersName].addLayer(polylineList )
    this.map.addLayer(this.mapControl[layersName]);
  },
  drawPolygon(list, layersName='polylineLayers', options={color:'#fc4a14',weight:2}) { //画线
    if(this.mapControl[layersName]){
      this.mapControl[layersName].clearLayers()
    }else{
      this.mapControl[layersName] = L.layerGroup()
    }
    let latlngs = []
    for (var p of list) {
      latlngs.push([p.lat, p.lon])
    }
    let polygonList = L.polygon(latlngs, options)  //挂载线路路线  
    this.mapControl[layersName].addLayer(polygonList  )
    this.map.addLayer(this.mapControl[layersName]);
  },
  
}