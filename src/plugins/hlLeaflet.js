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
import '@/assets/js/trackback/control.playback.css';//引入多轨迹css
import '@/assets/js/trackback/control.trackplayback';//引入多轨迹控制
import '@/assets/js/trackback/leaflet.trackplayback';//引入多轨迹
import '@/assets/js/trackback/rastercoords';// 定向地图

/**
 * leaflet地图绘制类
 * 完成项目中基本绘制的工作
 */

export default {
  nodeRandom: 6,
  baseLayers: {},
  tempSortKey: [],
  tempSetting: {},
  map: null,
  markerGroup: null,
  pointList: {},
  drawList: {},
  polygon: null,
  polylineMeasure: false,
  mapControl: {},
  drawLatlng: {},
  trackplay: null,
  trackplaybackControl: null,
  initMapOptions: {
    lat: 23.1538555,
    lon: 113.030911,
    zoom: 4,
    maxZoom: 18,
    minZoom: 3,
    preferCanvas: true,
    attributionControl: false,
    zoomControl: false,
    fullscreenControl: false,
    measureControl: true
  },
  _conf () {
    //start---设置基本图层:空白+天地图+谷歌
    this.nodeRandom = Math.floor(Math.random() * 5) + 3 === 4 ? 6 : Math.floor(Math.random() * 5) + 3;//随机取[3,7]之间整数,t4很容易出问题
    this.baseLayers = {//start---设置基本图层:空白+天地图+谷歌
      '#Empty': {
        name: '空白',
        tiles: L.tileLayer('https://beidouim.oss-cn-hangzhou.aliyuncs.com/map/img/map_whiteBackGround.jpg', {})
      },
      '#tiandituStreet': {
        name: '天地图街道',
        tiles: L.layerGroup([L.tileLayer(`http://t${this.nodeRandom}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${this.nodeRandom}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)])
      },
      '#tiandituSatellite': {
        name: '天地图卫星',
        tiles: L.layerGroup([L.tileLayer(`http://t${this.nodeRandom}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${this.nodeRandom}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)])
      },
      '#tiandituTerrain': {
        name: '天地图地形',
        tiles: L.layerGroup([L.tileLayer(`http://t${this.nodeRandom}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`), L.tileLayer(`http://t${this.nodeRandom}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`)])
      },
      '#googleStreet': {
        name: '谷歌街道',
        tiles: L.tileLayer('http://mt0.google.com/vt/lyrs=m&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2')
      },
      '#googleSatellite': {
        name: '谷歌卫星',
        tiles: L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2')
      },
      '#googleTerrain': {
        name: "谷歌地形",
        tiles: L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2')
      }
    }
    this.tempSortKey = ['#Empty', '#tiandituSatellite', '#tiandituTerrain', '#tiandituStreet', '#googleSatellite', '#googleTerrain', '#googleStreet'] //存储名称以便切换图层
    this.tempSetting = {
      空白: this.baseLayers['#Empty'].tiles,
      天地图卫星: this.baseLayers['#tiandituSatellite'].tiles,
      天地图地形: this.baseLayers['#tiandituTerrain'].tiles,
      天地图街道: this.baseLayers['#tiandituStreet'].tiles,
      谷歌卫星: this.baseLayers['#googleSatellite'].tiles,
      谷歌地形: this.baseLayers['#googleTerrain'].tiles,
      谷歌街道: this.baseLayers['#googleStreet'].tiles
    }
    //end---设置基本图层:空白+天地图+谷歌
  },
  _initMap: function (mapId, options) {
    this._conf();
    let returnedTarget = Object.assign(this.initMapOptions, options);
    let defaultLayersNum = parseInt(sessionStorage.getItem('layerIndex'));
    let defalutLabelIndex = isNaN(defaultLayersNum) ? 3 : defaultLayersNum;
    this.map = null;
    let obj = {
      center: [this.initMapOptions.lat, this.initMapOptions.lon],
      layers: [this.baseLayers[this.tempSortKey[defalutLabelIndex]].tiles], // 默认地图
      ...returnedTarget
    }
    let reMap = L.map(mapId, {
      ...obj
    })
    reMap._controlCorners.topright.style.position = 'absolute'
    reMap._controlCorners.topright.style.left = '120%' //隐藏调整控件
    this.mapControl.zomm = L.control.zoom()
    this.mapControl.zomm.addTo(reMap).setPosition('topright')
    this.mapControl.fullscreen = L.control.fullscreen()
    this.mapControl.fullscreen.addTo(reMap).setPosition('topright')
    this.map = reMap
    return this.map;
  },
  _changeLayers (map, idx) {
    this.mapControl.layers = L.control.layers(this.tempSetting);
    this.mapControl.layers.addTo(map).setPosition('topright');
    this.mapControl.layers._layerControlInputs[idx].click();
  },
  _fitBounds: function (map, areaData) {
    console.log(areaData)
    map.fitBounds(areaData)
  },
  _fitPoint (map, pointData) {
    map.setView(pointData, 16);
  },
  _renderPoint (map, list, layersName = 'layers1', iconUrl = require("@/assets/images/leaflet_icon/marker-icon.png"), clusterFlag = false, fn) {
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
    this._loadPic(iconUrl).then(() => {
      var icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 41]
      })
      for (var p of list) {
        this.pointList[p.id] = L.marker(L.latLng(p.lat, p.lon), {
          icon: icon,
          info: p
        }).on('click', function (e) {
          let info = e.sourceTarget.options.info;
          if (info.showMsg) {
            L.popup({ offset: [0, 0], className: 'hlleaflet-marker-popup' })
              .setLatLng([e.sourceTarget._latlng.lat, e.sourceTarget._latlng.lng])
              .setContent(`${info.showMsg}`)
              .openOn(map);
          }
        }) //以id为属性作为点的区别
        this.mapControl[layersName].addLayer(this.pointList[p.id])
      }
      map.addLayer(this.mapControl[layersName]);
    })
  },
  _clearLayer (map, layersName) {
    if (map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName].clearLayers();
    }
  },
  _drawByData (map, list, layersName = 'defaultLayers', type, options = { color: '#fc4a14', weight: 2 }) { //画线
    if (map.hasLayer(this.mapControl[layersName])) {
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
    map.addLayer(this.mapControl[layersName]);
  },
  _loadPic (url) {
    return new Promise(function (pass, fall) {
      var img = new Image()
      img.onload = pass()
      img.onerrof = fall()
      img.src = require(`${url}`) // 解决依赖代码不支持变量，需要转模板模式
    })
  },

  remove: function () {
    this._bufferTracks = []
    if (this._map.hasLayer(this._trackPointFeatureGroup)) {
      this._map.removeLayer(this._trackPointFeatureGroup)
    }
  },

  clear: function () {
    this._clearLayer()
    this._bufferTracks = []
  },

  _trackLayerUpdate: function () {
    if (this._bufferTracks.length) {
      this._clearLayer()
      this._bufferTracks.forEach(function (element, index) {
        this._drawTrack(element)
      }.bind(this))
    }
  },

  _onmousemoveEvt: function (e) {
    localStorage.setItem("currentLocation", JSON.stringify(e.latlng))
  },

  _opentoolTip: function (trackpoint) {
    if (this._map.hasLayer(this._tooltip)) {
      this._map.removeLayer(this._tooltip)
    }
    this._canvas.style.cursor = 'default'
    let latlng = L.latLng(trackpoint.lat, trackpoint.lng)
    let tooltip = this._tooltip = L.tooltip(this.toolTipOptions)
    tooltip.setLatLng(latlng)
    tooltip.addTo(this._map)
    tooltip.setContent(this._getTooltipText(trackpoint))
  },

  _drawTrack: function (trackpoints) {
    // 画轨迹线
    if (this._showTrackLine) {
      this._drawTrackLine(trackpoints)
    }
    // 画船
    let targetPoint = trackpoints[trackpoints.length - 1]
    if (this.targetOptions.useImg && this._targetImg) {
      this._drawShipImage(targetPoint)
    } else {
      this._drawShipCanvas(targetPoint)
    }
    // 画标注信息
    if (this.targetOptions.showText) {
      this._drawtxt(`航向：${parseInt(targetPoint.dir)}度`, targetPoint)
    }
    // 画经过的轨迹点
    if (this._showTrackPoint) {
      if (this.trackPointOptions.useCanvas) {
        this._drawTrackPointsCanvas(trackpoints)
      } else {
        this._drawTrackPointsSvg(trackpoints)
      }
    }
  },

  _drawTrackLine: function (trackpoints) {
    let options = this.trackLineOptions
    let tp0 = this._getLayerPoint(trackpoints[0])
    this._ctx.save()
    this._ctx.beginPath()
    // 画轨迹线
    this._ctx.moveTo(tp0.x, tp0.y)
    for (let i = 1, len = trackpoints.length; i < len; i++) {
      let tpi = this._getLayerPoint(trackpoints[i])
      this._ctx.lineTo(tpi.x, tpi.y)
    }
    this._ctx.globalAlpha = options.opacity
    if (options.stroke) {
      this._ctx.strokeStyle = options.color
      this._ctx.lineWidth = options.weight
      this._ctx.stroke()
    }
    if (options.fill) {
      this._ctx.fillStyle = options.fillColor
      this._ctx.fill()
    }
    this._ctx.restore()
  },

  _drawTrackPointsCanvas: function (trackpoints) {
    let options = this.trackPointOptions
    this._ctx.save()
    for (let i = 0, len = trackpoints.length; i < len; i++) {
      if (trackpoints[i].isOrigin) {
        let latLng = L.latLng(trackpoints[i].lat, trackpoints[i].lng)
        let radius = options.radius
        let point = this._map.latLngToLayerPoint(latLng)
        this._ctx.beginPath()
        this._ctx.arc(point.x, point.y, radius, 0, Math.PI * 2, false)
        this._ctx.globalAlpha = options.opacity
        if (options.stroke) {
          this._ctx.strokeStyle = options.color
          this._ctx.stroke()
        }
        if (options.fill) {
          this._ctx.fillStyle = options.fillColor
          this._ctx.fill()
        }
      }
    }
    this._ctx.restore()
  },

  _drawTrackPointsSvg: function (trackpoints) {
    for (let i = 0, len = trackpoints.length; i < len; i++) {
      if (trackpoints[i].isOrigin) {
        let latLng = L.latLng(trackpoints[i].lat, trackpoints[i].lng)
        let cricleMarker = L.circleMarker(latLng, this.trackPointOptions)
        cricleMarker.bindTooltip(this._getTooltipText(trackpoints[i]), this.toolTipOptions)
        this._trackPointFeatureGroup.addLayer(cricleMarker)
      }
    }
  },

  _drawtxt: function (text, trackpoint) {
    let point = this._getLayerPoint(trackpoint)
    this._ctx.save()
    this._ctx.font = '12px Verdana'
    this._ctx.fillStyle = '#000'
    this._ctx.textAlign = 'center'
    this._ctx.textBaseline = 'bottom'
    this._ctx.fillText(text, point.x, point.y - 12, 200)
    this._ctx.restore()
  },

  _drawShipCanvas: function (trackpoint) {
    let point = this._getLayerPoint(trackpoint)
    let rotate = trackpoint.dir || 0
    let w = this.targetOptions.width
    let h = this.targetOptions.height
    let dh = h / 3

    this._ctx.save()
    this._ctx.fillStyle = this.targetOptions.fillColor
    this._ctx.strokeStyle = this.targetOptions.color
    this._ctx.translate(point.x, point.y)
    this._ctx.rotate((Math.PI / 180) * rotate)
    this._ctx.beginPath()
    this._ctx.moveTo(0, 0 - h / 2)
    this._ctx.lineTo(0 - w / 2, 0 - h / 2 + dh)
    this._ctx.lineTo(0 - w / 2, 0 + h / 2)
    this._ctx.lineTo(0 + w / 2, 0 + h / 2)
    this._ctx.lineTo(0 + w / 2, 0 - h / 2 + dh)
    this._ctx.closePath()
    this._ctx.fill()
    this._ctx.stroke()
    this._ctx.restore()
  },

  _drawShipImage: function (trackpoint) {
    let point = this._getLayerPoint(trackpoint)
    let dir = trackpoint.dir || 0
    let width = this.targetOptions.width
    let height = this.targetOptions.height
    let offset = {
      x: width / 2,
      y: height / 2
    }
    this._ctx.save()
    this._ctx.translate(point.x, point.y)
    this._ctx.rotate((Math.PI / 180) * dir)
    this._ctx.drawImage(this._targetImg, 0 - offset.x, 0 - offset.y, width, height)
    this._ctx.restore()
  },

  _getTooltipText: function (targetobj) {
    let content = []
    content.push('<table>')
    if (targetobj.info && targetobj.info.length) {
      for (let i = 0, len = targetobj.info.length; i < len; i++) {
        content.push('<tr>')
        content.push('<td>' + targetobj.info[i].key + '</td>')
        content.push('<td>' + targetobj.info[i].value + '</td>')
        content.push('</tr>')
      }
    }
    content.push('</table>')
    content = content.join('')
    return content
  },

  // _clearLayer: function () {
  //   // let bounds = this._trackLayer.getBounds()
  //   if (bounds) {
  //     let size = bounds.getSize()
  //     this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y)
  //   } else {
  //     this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
  //   }
  //   if (this._map.hasLayer(this._trackPointFeatureGroup)) {
  //     this._trackPointFeatureGroup.clearLayers()
  //   }
  // },

  _getLayerPoint (trackpoint) {
    return this._map.latLngToLayerPoint(L.latLng(trackpoint.lat, trackpoint.lng))
  }
}

