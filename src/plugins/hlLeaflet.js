import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '@/assets/css/Leaflet.PolylineMeasure.css'// 画线框架
import 'leaflet.pm';
import 'leaflet.pm/dist/leaflet.pm.css';
import '@/assets/js/Leaflet.PolylineMeasure.js';
import 'leaflet-measure/dist/leaflet-measure.css';// 测面积
import 'leaflet-measure/dist/leaflet-measure.cn';
import calc from 'leaflet-measure/src/calc'
import { selectOne as selectOne } from 'leaflet-measure/src/dom'
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
    fullscreenControl: false
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
    this.mapControl.fullscreen = L.control.fullscreen();
    this.map = reMap
    return this.map;
  },
  _changeLayers (map, idx) {
    this.mapControl.layers = L.control.layers(this.tempSetting);
    this.mapControl.layers.addTo(map).setPosition('topright');
    this.mapControl.layers._layerControlInputs[idx].click();
  },
  _fitBounds: function (map, areaData) {
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
  _measure (map) {
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
    }).addTo(map)
    document.getElementById(`polyline-measure-control`).click()
  },
  _mearsureArea (map) {
    // 继承测面积插件的_handleMeasureDoubleClick方法，改写弹窗内容
    let newMeasureRules = L.Control.Measure.extend({
      _handleMeasureDoubleClick: function () {
        const latlngs = this._latlngs
        let resultFeature, popupContent
        this._finishMeasure()
        if (!latlngs.length) {
          return
        }
        if (latlngs.length > 2) {
          latlngs.push(latlngs[0]) // close path to get full perimeter measurement for areas
        }
        const calced = calc(latlngs)
        let strHtml = '', buttonHtml = ''
        if (latlngs.length === 1) {
          resultFeature = L.circleMarker(latlngs[0], this._symbols.getSymbol('resultPoint'))
          popupContent = calced
          strHtml = `<p style="margin: 0; padding-top: 10px;">${popupContent.lastCoord.dms.y} / ${popupContent.lastCoord.dms.x}</p><p style="margin: 0; padding-top: 10px;">${popupContent.lastCoord.dd.y} / ${popupContent.lastCoord.dd.x}</p>`
          buttonHtml = `<ul class="tasks"><li><a href="#" class="js-zoomto zoomto">该位置居中</a></li> <li><a href="#" class="js-deletemarkup deletemarkup">删除</a></li></ul>`
        } else if (latlngs.length === 2) {
          resultFeature = L.polyline(latlngs, this._symbols.getSymbol('resultLine'))
          popupContent = this._getMeasurementDisplayStrings(calced)
          strHtml = `<p style="margin: 0; padding-top: 10px;">${popupContent.lengthDisplay}</p>`
          buttonHtml = `<ul class="tasks"><li><a href="#" class="js-zoomto zoomto">该线段居中</a></li> <li><a href="#" class="js-deletemarkup deletemarkup">删除</a></li></ul>`
        } else {
          resultFeature = L.polygon(latlngs, this._symbols.getSymbol('resultArea'))
          strHtml = `<p style="margin: 0; padding-top: 10px;">${(calced.area * (1e-6)).toFixed(2)} 平方千米</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 0.0015).toFixed(2)} 亩</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 0.000015).toFixed(2)} 顷</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 0.0001).toFixed(2)} 公顷</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 1).toFixed(2)} 平方米</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 0.0002471).toFixed(2)} 英亩</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 3.8610e-7).toFixed(2)} 平方英里</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 10.7639104).toFixed(2)} 平方英尺</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 1.19599).toFixed(2)} 平方码</p>`
          buttonHtml = `<ul class="tasks"><li><a href="#" class="js-zoomto zoomto">该面积居中</a></li> <li><a href="#" class="js-deletemarkup deletemarkup">删除</a></li> </ul>`
        }
        const popupContainer = L.DomUtil.create('div', '')
        popupContainer.innerHTML = strHtml + buttonHtml
        const zoomLink = selectOne('.js-zoomto', popupContainer)
        if (zoomLink) {
          L.DomEvent.on(zoomLink, 'click', L.DomEvent.stop)
          L.DomEvent.on(
            zoomLink,
            'click',
            function () {
              if (resultFeature.getBounds) {
                this._map.fitBounds(resultFeature.getBounds(), {
                  padding: [20, 20],
                  maxZoom: 17
                })
              } else if (resultFeature.getLatLng) {
                this._map.panTo(resultFeature.getLatLng())
              }
            },
            this
          )
        }
        const deleteLink = selectOne('.js-deletemarkup', popupContainer)
        if (deleteLink) {
          L.DomEvent.on(deleteLink, 'click', L.DomEvent.stop)
          L.DomEvent.on(
            deleteLink,
            'click',
            function () {
              // TODO. maybe remove any event handlers on zoom and delete buttons?
              this._layer.removeLayer(resultFeature)
            },
            this
          )
        }
        resultFeature.addTo(this._layer)
        resultFeature.bindPopup(popupContainer, this.options.popupOptions)
        if (resultFeature.getBounds) {
          resultFeature.openPopup(resultFeature.getBounds().getCenter())
        } else if (resultFeature.getLatLng) {
          resultFeature.openPopup(resultFeature.getLatLng())
        }
      },
      _startMeasure: function () {
        this._locked = !0, this._measureVertexes = L.featureGroup().addTo(this._layer), this._captureMarker = L.marker(this._map.getCenter(), {
          clickable: !0,
          zIndexOffset: this.options.captureZIndex,
          opacity: 0,
          autoPanOnFocus: false
        }).addTo(this._layer), this._setCaptureMarkerIcon(), this._captureMarker.on('mouseout', this._handleMapMouseOut, this).on('dblclick', this._handleMeasureDoubleClick, this).on('click', this._handleMeasureClick, this), this._map.on('mousemove', this._handleMeasureMove, this).on('mouseout', this._handleMapMouseOut, this).on('move', this._centerCaptureMarker, this).on('resize', this._setCaptureMarkerIcon, this), L.DomEvent.on(this._container, 'mouseenter', this._handleMapMouseOut, this), this._updateMeasureStartedNoPoints(), this._map.fire('measurestart', null, !1)
      },
    })
    let measureRules = new newMeasureRules({
      position: 'topright',
      activeColor: '#0f0',
      completedColor: '#0f0',
      popupOptions: {
        className: 'leaflet-measure-resultpopup',
        autoPanPadding: [10, 10]
      },
      primaryLengthUnit: 'meters',
      secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      secondaryAreaUnit: 'hectares'
    })
    map.addControl(measureRules);
    document.querySelector(".js-start").click();
  },
  _drawInMap (map, type, iconSize = [20, 20], iconUrl = require('@/assets/images/leaflet_icon/position-icon.png')) { //绘制在地图上
    switch (type) {
      case 'marker':
        let myIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: iconSize,
          iconAnchor: [iconSize[0] / 2, iconSize[1] / 2]
        })
        map.pm.enableDraw('Marker', { tooltips: false, markerStyle: { icon: myIcon } });
        break;
      case '':
    }
  },
  _editMarkerGetData (map, iconUrl = require("@/assets/images/leaflet_icon/position-icon.png"), imgWidth = 20, imgHeight = 20, layersName = 'editingMarker') {
    this._clearAllEdit(map);
    if (map.hasLayer(this.mapControl[layersName])) {
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
    map.pm.enableDraw('Marker', {
      tooltips: false,
      markerStyle: { icon: myIcon },
      snappable: true, //启⽤捕捉到其他绘制图形的顶点
      snapDistance: 20, //顶点捕捉距离
    })
    let _this = this;
    map.on('pm:create', function (e) {
      _this.drawList = e.layer;
      _this.mapControl[layersName].addLayer(_this.drawList);
      map.addLayer(_this.mapControl[layersName]);
      localStorage.setItem('drawLatLng', JSON.stringify(e.layer._latlng));//将数据存到localStorage
      e.layer.on('pm:edit', e2 => {
        localStorage.setItem('drawLatLng', JSON.stringify(e2.sourceTarget._latlng));//将数据存到localStorage
      })
    })
  },
  _editMapGetData (map, type = 0, color = 'rgba(51, 136, 255, 1)', layersName = 'editingLayers') {
    this._clearAllEdit(map);
    if (map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName].clearLayers()
    } else {
      this.mapControl[layersName] = L.layerGroup()
    }
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
    map.pm.enableDraw(chooseDraw,
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
        snappable: true, //启⽤捕捉到其他绘制图形的顶点
        snapDistance: 20, //顶点捕捉距离
      })
    //监听地图经纬度
    let _this = this;
    map.on('pm:create', e => {
      _this.drawList = e.layer;
      _this.mapControl[layersName].addLayer(_this.drawList);
      map.addLayer(_this.mapControl[layersName]);
      if (type !== 0) {
        if (type === 1) {//圆形
          localStorage.setItem('drawLatLng', JSON.stringify(e.layer._latlng));//将数据存到localStorage
          localStorage.setItem('drawCircleRadius', e.layer._mRadius);//将数据存到localStorage

        } else {
          localStorage.setItem('drawLatLng', JSON.stringify(e.layer._latlngs));//将数据存到localStorage
        }
      }
      e.layer.pm.enable();
      e.layer.on('pm:edit', e2 => {
        if (type === 1) {//圆形
          localStorage.setItem('drawLatLng', JSON.stringify(e2.sourceTarget._latlng));//
          localStorage.setItem('drawCircleRadius', e2.sourceTarget._mRadius);//将数据存到localStorage
        } else {
          localStorage.setItem('drawLatLng', JSON.stringify(e2.sourceTarget._latlngs));//将数据存到localStorage
        }

      })
    })
    map.on('pm:drawstart', ({ workingLayer }) => { // 记录绘制的点得到数据
      workingLayer.on('pm:vertexadded', e => {
        _this.drawList = e.workingLayer;
        _this.mapControl[layersName].addLayer(_this.drawList);
        map.addLayer(_this.mapControl[layersName]);
        localStorage.setItem('drawLatLng', JSON.stringify(e.target._latlngs));//将数据存到localStorage
      })
    })

  },
  _drawHeatMap (map, data, options = { radius: 10, minOpacity: 0.85 }) {
    let heatPoints = [];
    data.forEach(item => {
      heatPoints.push([item.lat, item.lng, item.count]);
    })
    L.heatLayer(heatPoints, options).addTo(map);
  },
  _fullScreen (map) {
    this.mapControl.fullscreen.addTo(map).setPosition('topright');
    this.mapControl.fullscreen.link.click();
  },
  _zoomAdd (map) {
    map.zoomIn();
  },
  _zoomSub (map) {
    map.zoomOut();
  },
  _trackPlay (map, data, color = '#03ff09', imgUrl = require("@/assets/images/leaflet_icon/trackplay-icon.png"), width = 40, height = 40, unit = `km/h`, wakeTimeDiff = 100) { //轨迹回放
    let _this = this;
    this._loadPic(imgUrl).then(() => {
      _this.trackplay = L.trackplayback(data, map, {
        targetOptions: {
          useImg: true,
          imgUrl,
          width,
          height,
          unit,
          replayType: false, // false 多个回放 true 单个回放
          isDir: 1 // 通用图标才有方向变化
        },
        trackLineOptions: {
          isDraw: true, // 是否画线
          stroke: true,
          color, // 线条颜色
          weight: 2, // 线条宽度
          opacity: 1, // 透明度
          wakeTimeDiff// 尾迹时间控制 不传默认一年
        }
      })
      _this.trackplaybackControl = L.trackplaybackcontrol(_this.trackplay);
      _this.trackplaybackControl.addTo(map);
      _this._drawTrack();
    })
  },
  _drawTrack (isDrawLine = true) {//默认绘制路线
    document.querySelectorAll('.trackplayback-input')[1].checked = isDrawLine;  // 画线
    document.querySelector(".buttonContainer .btn-stop").click(); //开始预览
  },
  _setTrackSpeed (speed) {//设置速度

    this.trackplay.setSpeed(speed);
  },
  _clearTrackBack () {//清除
    document.querySelector(".buttonContainer .btn-close").click(); //删除轨迹
  },
  _restartTrack () {//刷新
    document.querySelector(".buttonContainer .btn-restart").click(); //重新开始
  },
  _quitTrack () { //暂停
    document.querySelector(".buttonContainer .btn-start").click(); //重新开始
  },
  _clearAllEdit (map) {
    map.pm.disableDraw('Line')
    map.pm.disableDraw('Marker')
    map.pm.disableDraw('Polygon')
    map.pm.disableDraw('Circle')
    map.pm.disableDraw('Rectangle')
  },
  _loadPic (url) {
    return new Promise(function (pass, fall) {
      var img = new Image()
      img.onload = pass()
      img.onerrof = fall()
      img.src = require(`${url}`) // 解决依赖代码不支持变量，需要转模板模式
    })
  }
}

