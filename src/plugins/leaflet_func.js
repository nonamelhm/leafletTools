import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '@/assets/css/Leaflet.PolylineMeasure.css'// 画线框架
import 'leaflet.pm';
import 'leaflet.pm/dist/leaflet.pm.css';
import '@/assets/js/Leaflet.PolylineMeasure.js';
import 'leaflet-measure/dist/leaflet-measure.css';// 测面积
import 'leaflet-measure/dist/leaflet-measure.cn';
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet.fullscreen";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster";
import 'leaflet-semicircle';// 半圆
import "../assets/less/leaflet/leaflet.less"; //引入聚合点样式
import "@/assets/js/leaflet-heatmap.js"; //引入热力图
//start---设置基本图层:空白+天地图+谷歌
let baseLayers = {
  '#Empty': { name: '空白' },
  '#tiandituStreet': { name: '天地图街道' },
  '#tiandituSatellite': { name: '天地图卫星' },
  '#tiandituTerrain': { name: '天地图地形' },
  '#googleStreet': { name: '谷歌街道' },
  '#googleSatellite': { name: '谷歌卫星' },
  '#googleTerrain': { name: "谷歌地形" }
};
// 随机取[3,7]之间整数
let nodeRandom = Math.floor(Math.random() * 5) + 3;
// t4很容易出问题
nodeRandom === 4 && (nodeRandom = 6);
// 天地图街道
baseLayers['#tiandituStreet'].tiles = L.layerGroup([L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)]);
// 天地图卫星
baseLayers['#tiandituSatellite'].tiles = L.layerGroup([L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)]);
// 天地图地形
baseLayers['#tiandituTerrain'].tiles = L.layerGroup([L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)]);
//空白图层
baseLayers['#Empty'].tiles = L.tileLayer('https://beidouim.oss-cn-hangzhou.aliyuncs.com/map/img/map_whiteBackGround.jpg', {});
// 谷歌街道
baseLayers['#googleStreet'].tiles = L.tileLayer('http://mt0.google.com/vt/lyrs=m&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2');
// 谷歌卫星
baseLayers['#googleSatellite'].tiles = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2');
// 谷歌地形
baseLayers['#googleTerrain'].tiles = L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2');
const tempSetting = {
  空白: baseLayers['#Empty'].tiles,
  天地图卫星: baseLayers['#tiandituSatellite'].tiles,
  天地图地形: baseLayers['#tiandituTerrain'].tiles,
  天地图街道: baseLayers['#tiandituStreet'].tiles,
  谷歌卫星: baseLayers['#googleSatellite'].tiles,
  谷歌地形: baseLayers['#googleTerrain'].tiles,
  谷歌街道: baseLayers['#googleStreet'].tiles
}
//end---设置基本图层:空白+天地图+谷歌

export default {
  map: null,
  markerGroup: null,
  pointList: {},
  drawList: {},
  polygon: null,
  polylineMeasure: false,
  mapControl: {},
  drawLatlng: {},
  drawLayers: [],//绘画的图层
  initLeaflet: function (eleId, options = { lat: 23.1538555, lon: 113.030911, zoom: 4, maxZoom: 18, minZoom: 3 }) {
    let tempSortKey = ['#Empty', '#tiandituSatellite', '#tiandituTerrain', '#tiandituStreet', '#googleSatellite', '#googleTerrain', '#googleStreet'] //存储名称以便切换图层
    let defaultLayersNum = parseInt(sessionStorage.getItem('layerIndex'));
    let defalutLabelIndex = isNaN(defaultLayersNum) ? 3 : defaultLayersNum;
    this.map = null;
    let reMap
    let lat = options.lat ? options.lat : 23.1538555;
    let lon = options.lon ? options.lon : 113.030911;
    let zoom = options.zoom ? options.zoom : 4;
    let maxZoom = options.maxZoom ? options.maxZoom : 18;
    let minZoom = options.minZoom ? options.minZoom : 3;
    reMap = L.map(eleId, {
      center: [lat, lon],
      zoom,
      maxZoom,
      minZoom,
      layers: [baseLayers[tempSortKey[defalutLabelIndex]].tiles], // 默认地图
      preferCanvas: true,
      attributionControl: false,
      zoomControl: false,
      fullscreenControl: false,
      measureControl: true
    })
    reMap._controlCorners.topright.style.position = 'absolute'
    reMap._controlCorners.topright.style.left = '120%' //隐藏调整控件
    this.mapControl.layers = L.control.layers(tempSetting)
    this.mapControl.layers.addTo(reMap).setPosition('topright')
    this.mapControl.zomm = L.control.zoom()
    this.mapControl.zomm.addTo(reMap).setPosition('topright')
    this.mapControl.fullscreen = L.control.fullscreen()
    this.mapControl.fullscreen.addTo(reMap).setPosition('topright')
    this.map = reMap
  },
  changeLayers(idx) {
    this.mapControl.layers._layerControlInputs[idx].click();
  },
  fitBounds: function (areaData) {
    this.map.fitBounds(areaData)
  },
  fitPoint(pointData) {
    this.map.setView(pointData, 16);
  },
  renderPoint(list, layersName = 'layers1', iconUrl = require("@/assets/images/leaflet_icon/marker-icon.png"), clusterFlag = false) {
    if (clusterFlag) {
      this.mapControl[layersName] = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
        maxClusterRadius: 60,
        iconCreateFunction: function (cluster) {
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
        this.pointList[p.id] = L.marker(L.latLng(p.lat, p.lon), {
          icon: icon,
          info: p
        }).on('click', function (e) {
          fn ? fn(e) : ''
        }) //以id为属性作为点的区别
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
  drawDataInMap(list, layersName = 'defaultLayers', type, options = { color: '#fc4a14', weight: 2 }) { //画线
    if (this.mapControl[layersName]) {
      this.mapControl[layersName].clearLayers()
    } else {
      this.mapControl[layersName] = L.layerGroup()
    }
    let latlngs = []
    //绘制台风需要 L.semiCircle radius需要*1000
    let radius = 0
    if (!type.includes('ircle')) {
      for (var p of list) {
        latlngs.push([p.lat, p.lon])
      }
    } else if (type === 'circle') {
      latlngs.push(list.lat, list.lon)
      options.radius = list.radius
    } else if (type === 'semiCircle') {
      latlngs.push(list.lat, list.lon)
      options.radius = list.radius * 1000
    }
    switch (type) {
      case 'polyline':
        this.drawList = L.polyline(latlngs, options);
        break;
      case 'polygon':
        this.drawList = L.polygon(latlngs, options);
        break;
      case 'rectangle':
        this.drawList = L.rectangle(latlngs, options);
        break;
      case 'circle':
        this.drawList = L.circle(latlngs, options);
        break;
      case 'semiCircle':
        this.drawList = L.semiCircle(latlngs, options);
        break;
    }
    this.mapControl[layersName].addLayer(this.drawList);
    this.map.addLayer(this.mapControl[layersName]);
  },
  drawInMap(type, options = { iconSie: [15, 15], iconUrl: 'https://oss.irim.online/eim/icon/boat/positionMark.png' }) { //绘制在地图上
    switch (type) {
      case 'marker':
        let iconSize = options && options.iconSize ? options.iconSize : [15, 15]
        let iconUrl = options && options.iconUrl ? options.iconUrl : 'https://oss.irim.online/eim/icon/boat/positionMark.png'
        let myIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: iconSize,
          iconAnchor: [iconSize[0] / 2, iconSize[1] / 2]
        })
        this.map.pm.enableDraw('Marker', { tooltips: false, markerStyle: { icon: myIcon } });
        break;
      case '':
    }
  },
  measure() {
    if (!this.polylineMeasure) {
      this.polylineMeasure = true
      L.control.polylineMeasure({
        position: 'topleft',
        unit: 'kilometres', //最小单位
        showBearings: true,
        clearMeasurementsOnStop: false,
        showClearControl: true,
        showUnitControl: true,
        bearingTextIn: '起点',
        bearingTextOut: '终点',
        tooltipTextFinish: '单击并<b>拖动到移动点</b><br>',
        tooltipTextDelete: '<b>按shift键，然后单击删除</b>',
        unitControlLabel: {
          metres: '米',
          kilometres: '千米',
          feet: '英尺',
          landmiles: '英里',
          nauticalmiles: '海里'
        },
      }).addTo(this.map)
    }
    document.getElementById(`polyline-measure-control`).click()
  },
  mearsureArea() {
    if (!this.polylineMeasure) {
      this.polylineMeasure = true
      document.querySelector(".js-start").click();
    }
  },
  drawHeatMap(data, options = { radius: 10, minOpacity: 0.85 }) {
    let heatPoints = [];
    data.forEach(item => {
      heatPoints.push([item.lat, item.lng, item.count]);
    })
    L.heatLayer(heatPoints, options).addTo(this.map);
  },
  clearAllEdit(){
    this.map.pm.disableDraw('Line')
    this.map.pm.disableDraw('Marker')
    this.map.pm.disableDraw('Polygon')
    this.map.pm.disableDraw('Circle')
    this.map.pm.disableDraw('Rectangle')
  },
  editMapGetData(type = 0, color = 'rgba(51, 136, 255, 1)') {
    this.clearAllEdit();
    //监听地图经纬度
    this.map.on('pm:drawstart', ({ workingLayer }) => { // 记录绘制的点得到数据
      workingLayer.on('pm:vertexadded', e => {
        localStorage.setItem('drawLatLng', JSON.stringify(e.target._latlngs));//将数据存到localStorage
      })
    })
    let chooseDraw = 'Polygon';//默认多边形
    let drawType = {
      0: 'Polygon',
      1: 'Circle',
      2: 'Rectangle',
      3: 'Line',
    };
    for (let key in drawType) {
      if (type === Number(key)) {
        chooseDraw = drawType[key];
      }
    }
   
    this.map.pm.enableDraw(chooseDraw,
      {
        tooltips: false,
        templineStyle: {
          color: color,
        },
        hintlineStyle: {
          color: color,
          dashArray: [5, 5]
        },
        pathOptions: {
          color: color,
          fillColor: color,
        },
      })
  },
  clearEdit(){
    if(this.drawLayers.length){
      for (let i = 0; i < this.drawLayers.length; i++) {
        this.map.removeLayer(this.drawLayers[i].layer)
      }
    }
  },
  editMarker(iconUrl = require("@/assets/images/leaflet_icon/positionMark.png"), imgWidth = 10, imgHeight = 10,layersName = 'editingMarker') {
    this.clearAllEdit();
    if (this.mapControl[layersName]) {
      this.mapControl[layersName].clearLayers()
    } else {
      this.mapControl[layersName] = L.layerGroup()
    }
    let iconSize = [imgWidth, imgHeight];
    let myIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: iconSize,
      iconAnchor: iconSize
    })
    this.map.pm.enableDraw('Marker', { tooltips: false, markerStyle: { icon: myIcon } })
    this.map.on('pm:create', function (e) {
      this.drawLayers.push(e);
      localStorage.setItem('drawLatLng', JSON.stringify(e.layer._latlngs));//将数据存到localStorage
      
    })

  }
}
