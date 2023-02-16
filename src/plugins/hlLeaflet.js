import 'leaflet/dist/leaflet.css';
import '../assets/css/hlLeaflet.css';// 测面积
import L from 'leaflet';
import '../assets/css/Leaflet.PolylineMeasure.css'// 画线框架
import 'leaflet.pm/dist/leaflet.pm.css';
import 'leaflet.pm';
import '../assets/js/Leaflet.PolylineMeasure.js';
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
import "../assets/js/leaflet-heatmap.js"; //引入热力图
import '../assets/js/trackback/control.playback.css';//引入轨迹回放css
import '../assets/js/trackback/control.trackplayback';//引入轨迹回放控制
import '../assets/js/trackback/leaflet.trackplayback';//引入轨迹回放
import '../assets/js/trackback/rastercoords';// 定向地图
import dayjs from 'dayjs';
import { latLonTransform } from '../utils/util';
/**
 * leaflet地图绘制类
 * 完成项目中基本绘制的工作
 */

export const HlLeaflet = {
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
  windCircleLayers: [],
  _currentLatlng: {},
  _drawLatlngs: [],
  _drawCircleRadius: '',
  initMapOptions: { //初始化配置
    lat: 23.1538555,
    lng: 113.030911,
    zoom: 4,
    maxZoom: 18,
    minZoom: 3,
    preferCanvas: true,
    attributionControl: false,
    zoomControl: false,
    fullscreenControl: false
  },
  trackplayOptions: {
    weight: 1,
    useImg: true,
    color: '#03ff09',
    imgUrl: require("../assets/images/leaflet_icon/trackplay-icon.png"),
    iconSize: [30, 30],
    iconAnchor: [20, 25],
    width: 40,
    height: 40,
    unit: `km/h`,
    replayType: false, // false 多个回放 true 单个回放
    isDir: 1,// 通用图标才有方向变化
    wakeTimeDiff: 100,
    isDrawLine: false,
    showDistance: false,
    distanceMarkers: {
      unit: 'km',
      showAll: 14,
      isReverse: false,
      offset: 10000,
      cssClass: 'hl-line',
      iconSize: [20, 20]
    },
    opacity: 1
  },
  lineOptions: {
    weight: 1,
    color: '#3388FF',
    showDistance: false, // 是否显示里程
    distanceMarkers: {
      unit: 'km',
      showAll: 14,
      isReverse: false,
      offset: 10000,
      cssClass: 'hl-line',
      iconSize: [20, 20]
    },
    opacity: 1
  },
  windCircleOptions: {
    fillColor: '#FF9C00',
    fillOpacity: 0.3,
    color: 'transparent',
    startAngle: 0,  //0是Y轴 顺时针转算度数
    stopAngle: 360
  },
  tipsOptions: {
    className: 'hl-tips',
    html: '默认',
    iconSize: 30,
    color: 'red'
  },
  pointOptions: {
    iconUrl: require("../assets/images/leaflet_icon/marker-icon.png"),
    iconSize: [25, 41],
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16,
    maxClusterRadius: 60,
    iconCreateFunction: function (cluster) {
      let tempcount = cluster.getChildCount()
      let tempclass = tempcount > 500 ? 'red' : tempcount > 200 ? 'blue2' : tempcount > 100 ? 'blue' : tempcount > 50 ? 'green2' : 'green'
      return L.divIcon({ html: '<b class="' + tempclass + '">' + cluster.getChildCount() + '</b>' });
    }
  },
  patternOptions: {
    color: '#fc4a14',
    weight: 2
  },
  trackPointImg: [
    require('../assets/images/leaflet_icon/tab_state_qidian.png'),// 起点 3
    require('../assets/images/leaflet_icon/tab_state_tingzhi.png'), // 停止点 2
    require('../assets/images/leaflet_icon/tab_state_zhongdian.png'), // 终点 4
    require('../assets/images/leaflet_icon/tab_state_lixian.png'), // 离线 5
    require('../assets/images/leaflet_icon/tab_state_sos.png'), // SOS 6
    require('../assets/images/leaflet_icon/tab_state_duandian.png'), // 断电 7
    require('../assets/images/leaflet_icon/tab_state_chaixie.png'), // 拆卸 8
    require('../assets/images/leaflet_icon/tab_state_jinru.png'), // 进入围栏 9
    require('../assets/images/leaflet_icon/tab_state_likai.png'), // 离开围栏 10
    require('../assets/images/leaflet_icon/tab_state_sudu.png'), // 超速 11
    require('../assets/images/leaflet_icon/tab_state_didianliang.png'), // 低电量 12
    require('../assets/images/leaflet_icon/tab_state_shangsheng.png'), // 高度上升 13
    require('../assets/images/leaflet_icon/tab_state_xiajiang.png'), // 高度下降 14
    require('../assets/images/leaflet_icon/tab_state_haiba.png') // 海拔 15
  ],
  //轨迹回放配置
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
  _initMap (mapId, options) {
    this._conf();
    let allOptions = Object.assign(this.initMapOptions, options);
    let defaultLayersNum = parseInt(sessionStorage.getItem('layerIndex'));
    let defalutLabelIndex = isNaN(defaultLayersNum) ? 3 : defaultLayersNum;
    this.map = null;
    let obj = {
      center: [this.initMapOptions.lat, this.initMapOptions.lng],
      layers: [this.baseLayers[this.tempSortKey[defalutLabelIndex]].tiles], // 默认地图
      ...allOptions
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
    this._hlFeatureGroup = L.featureGroup([]).addTo(this.map);
    return this.map;
  },
  _onmousemoveEvt (e) {
    this._currentLatlng = e.latlng;
  },
  _changeLayers (map, idx) {
    if (!map) return;
    this.mapControl.layers = L.control.layers(this.tempSetting);
    this.mapControl.layers.addTo(map).setPosition('topright');
    this.mapControl.layers._layerControlInputs[idx].click();
  },
  _fitBounds (map, areaData, options = { padding: [10, 10], maxZoom: 17 }) {
    if (!map) return;
    let fitData = [];
    for (let item of areaData) {
      if (!Array.isArray(item)) {
        fitData.push([item.lat, item.lng])
      } else {
        for (let p of item) {
          fitData.push([p.lat, p.lng])
        }
      }
    }
  },
  _fitPoint (map, pointData) {
    if (!map) return;
    map.setView(pointData, 16);
  },
  _renderPoint (map, data, layersName = 'defaultPointLayers', options = {}, clusterFlag = false) {
    if (!map) return;
    let allOptions = Object.assign(this.pointOptions, options);
    if (clusterFlag) {
      this.mapControl[layersName] = L.markerClusterGroup(allOptions);
    } else { //聚合点
      if (!map.hasLayer(this.mapControl[layersName])) {
        this.mapControl[layersName] = L.layerGroup().addTo(map);
      }
    }
    this._loadPic(allOptions.iconUrl).then(() => {
      let icon = L.icon(allOptions)
      data.forEach((p, i) => {
        this.pointList[i] = L.marker(L.latLng(p.lat, p.lng), {
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
        });
        this.mapControl[layersName].addLayer(this.pointList[i])
      });
      map.addLayer(this.mapControl[layersName]);
    })
  },
  _clearLayer (map, layersName) {
    if (!map) return;
    if (map.hasLayer(this.mapControl[layersName])) {
      map.removeLayer(this.mapControl[layersName]);
      map.closePopup();
    }
  },
  _drawLineByData (map, data, layersName = 'defaultLineLayers', options = { color: '#fc4a14', weight: 2, showDistance: false }) {
    if (!map) return;
    let allOptions = Object.assign(this.lineOptions, options);
    if (!map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName] = L.layerGroup().addTo(map);
    }
    let latlngs = []
    for (let p of data) {
      latlngs.push([p.lat, p.lng])
    }
    this.drawList = L.polyline(latlngs, allOptions);
    this.mapControl[layersName].addLayer(this.drawList);
    map.addLayer(this.mapControl[layersName]);
  },
  _drawTips (map, latlng, layersName = 'defaultTipsLayers', options) {
    if (!map) return;
    if (!map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName] = L.layerGroup().addTo(map);
    }
    let allOptions = Object.assign(this.tipsOptions, options);
    // 有内容介绍的线
    if (!allOptions.html) return;
    let myIcon = L.divIcon(allOptions)
    let lineTips = L.marker([latlng.lat, latlng.lng], {
      icon: myIcon,
      ...allOptions
    })
    this.mapControl[layersName].addLayer(lineTips);
    map.addLayer(this.mapControl[layersName]);
  },
  _drawByData (map, data, layersName = 'defaultLayers', type, options) {
    if (!map) return;
    if (!map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName] = L.layerGroup().addTo(map);
    }
    let allOptions = Object.assign(this.patternOptions, options);
    let latlngs = []
    if (!type.includes('circle')) {
      data.forEach((p, i) => {
        if (!Array.isArray(p)) {
          latlngs.push([p.lat, p.lng]);
          if (type === 'polygon') {
            this.drawList[i] = L.polygon(latlngs, { ...allOptions, info: data });
            this._addTipInPattern(map, this.drawList[i]);
          } else if (type === 'rectangle') {
            this.drawList[i] = L.rectangle(latlngs, { ...allOptions, info: data });
            this._addTipInPattern(map, this.drawList[i]);
          }
        } else {
          let temArr = []
          for (let item of p) {
            temArr.push([item.lat, item.lng]);
          }
          if (type === 'polygon') {
            this.drawList[i] = L.polygon(temArr, { ...allOptions, info: p });
            this._addTipInPattern(map, this.drawList[i]);
          } else if (type === 'rectangle') {
            this.drawList[i] = L.rectangle(temArr, { ...allOptions, info: p });
            this._addTipInPattern(map, this.drawList[i]);
          }
        }
        this.mapControl[layersName].addLayer(this.drawList[i]);
      })
    } else {
      data.forEach((p, i) => {
        if (!Array.isArray(p)) {
          let circlelatlngs = [];
          circlelatlngs.push(p.lat, p.lng);
          options.radius = p.radius;
          this.drawList[i] = L.circle(circlelatlngs, { ...options, info: p });
          this._addTipInPattern(map, this.drawList[i]);
          this.mapControl[layersName].addLayer(this.drawList[i]);
        }
      })
    }
    map.addLayer(this.mapControl[layersName]);
  },
  _addTipInPattern (map, layers) {
    if (!map) return;
    layers.on('click', function (e) {
      let info = e.sourceTarget.options.info;
      let content = '';
      if (!e.sourceTarget._radius) { //区别圆形数据
        content = info[0].showMsg;
      } else if (info && info.showMsg) {
        content = info.showMsg;
      }
      if (content) {
        L.popup({ offset: [0, 0], className: 'hlleaflet-pattern-popup' })
          .setLatLng([e.latlng.lat, e.latlng.lng])
          .setContent(`${content}`)
          .openOn(map);
      }
    })
  },
  _measure (map) {
    if (!map) return;
    L.control.polylineMeasure({
      unitControlTitle: {
        // Title texts to show on the Unit Control button
        text: 'Change Units',
        metres: 'metres',
        landmiles: 'land miles',
        nauticalmiles: 'nautical miles'
      },
      position: 'topleft',
      unit: 'kilometres', //最小单位
      showBearings: true,
      clearMeasurementsOnStop: false,
      showClearControl: true,
      showUnitControl: true,
      bearingTextIn: '起点',
      bearingTextOut: '终点',
      tooltipTextFinish: '<b>单击并<b>拖动到移动点</b><br>',
      tooltipTextDelete: '按shift键，然后<b>单击删除</b>',
      tooltipTextMove: '单击然后拖动<b>即可移动</b><br>',
      tooltipTextAdd: '按ctrl键或单击<b>添加点</b>',
      tooltipTextResume: '<br>按ctrl键并单击<b>重新开始</b>',
      unitControlLabel: {
        metres: '米',
        kilometres: '千米',
        feet: '英尺',
        landmiles: '英里',
        nauticalmiles: '海里'
      },
    }).addTo(map)
    document.querySelectorAll(`.leaflet-control`)[0].style.display = "none";
    document.getElementById(`polyline-measure-control`).click();
  },
  _clearMeasure (map) {
    if (map) {
      document.querySelectorAll(`.polyline-measure-clearControl`)[0].click();
    }
  },
  _changeMeasureUnit (map) {
    if (map) {
      document.getElementById(`unitControlId`).click();
    }
  },
  _getMeasureUnit (map) {
    if (map) {
      return document.getElementById(`unitControlId`).innerHTML;
    }
  },
  _mearsureArea (map) {
    if (!map) return;
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
  _drawInMap (map, type, iconSize = [20, 20], iconUrl = require('../assets/images/leaflet_icon/position-icon.png')) { //绘制在地图上
    if (!map) return;
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
  _editMarkerGetData (map, iconUrl = require("../assets/images/leaflet_icon/position-icon.png"), iconSize = [20, 20], layersName = 'editingMarker') {
    if (!map) return;
    this._clearAllEdit(map);
    // map.off('mousemove', this._onmousemoveEvt, this);
    if (!map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName] = L.layerGroup().addTo(map);
    }
    let myIcon = L.icon({
      iconUrl: iconUrl,
      iconSize,
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
      _this._drawLatlngs = e.layer._latlng;
      e.layer.on('pm:edit', e2 => {
        _this._drawLatlngs = e2.sourceTarget._latlng;
      })
    })
  },
  _editMapGetData (map, type = 0, color = 'rgba(51, 136, 255, 1)', layersName = 'editingLayers') {
    if (!map) return;
    this._clearAllEdit(map);
    // map.off('mousemove', this._onmousemoveEvt, this);
    if (!map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName] = L.layerGroup().addTo(map);
    }
    //监听地图经纬度
    let _this = this;
    map.on('pm:drawstart', ({ workingLayer }) => { // 记录绘制的点得到数据
      workingLayer.on('pm:vertexadded', e => {
        _this.drawList = e.workingLayer;
        _this.mapControl[layersName].addLayer(_this.drawList);
        map.addLayer(_this.mapControl[layersName]);
        _this._drawLatlngs = e.target._latlngs;
      })
    })
    map.on('pm:create', e => {
      _this.drawList = e.layer;
      _this.mapControl[layersName].addLayer(_this.drawList);
      map.addLayer(_this.mapControl[layersName]);
      if (e.shape === 'Circle') {//圆形
        _this._drawLatlngs = e.layer._latlng;
        _this._drawCircleRadius = e.layer._mRadius;
      } else {
        _this._drawLatlngs = e.layer._latlngs;
      }
      e.layer.pm.enable();
      e.layer.on('pm:edit', e2 => {
        if (type === 1) {//圆形
          _this._drawLatlngs = e2.sourceTarget._latlng;
          _this._drawCircleRadius = e2.sourceTarget._mRadius;
        } else {
          _this._drawLatlngs = e2.sourceTarget._latlngs;
        }
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
  },
  _drawHeatMap (map, data, layersName = 'hotLayers', options = { radius: 10, minOpacity: 0.85 }) {
    if (!map) return;
    if (!map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName] = L.layerGroup().addTo(map);
    }
    let heatPoints = [];
    data.forEach(item => {
      heatPoints.push([item.lat, item.lng, item.count]);
    })
    let hotLayers = L.heatLayer(heatPoints, options);
    this.mapControl[layersName].addLayer(hotLayers);
    map.addLayer(this.mapControl[layersName]);
  },
  _fullScreen (map) {
    if (!map) return;
    this.mapControl.fullscreen.addTo(map).setPosition('topright');
    this.mapControl.fullscreen.link.click();
  },
  _drawWindCircle (map, data, options) {
    if (!map) return;
    let allWindOptions = Object.assign(this.windCircleOptions, options)
    // 转换数据成角度画圆
    let arr = []
    for (let p of data) {
      if (!Array.isArray(p)) { //一个台风数据
        this._windCircle(map, data, allWindOptions);
      } else { //多个台风数据
        for (let pp of p) {
          this._windCircle(map, p, allWindOptions);
        }
      }
    }
  },
  _windCircle (map, data, allWindOptions) {
    if (!map) return;
    for (let p of data) {   //绘制台风需要 L.semiCircle radius需要*1000 插件
      if (p.neRadius) {
        allWindOptions = Object.assign(allWindOptions, { startAngle: 0, stopAngle: 90 })
        this.windCircleLayers.push(L.semiCircle([p.lat, p.lng], { radius: p.neRadius * 1000, ...allWindOptions }).addTo(map));
      }
      if (p.seRadius) {
        allWindOptions = Object.assign(allWindOptions, { startAngle: 90, stopAngle: 180 })
        this.windCircleLayers.push(L.semiCircle([p.lat, p.lng], { radius: p.seRadius * 1000, ...allWindOptions }).addTo(map));
      }
      if (p.swRadius) {
        allWindOptions = Object.assign(allWindOptions, { startAngle: 180, stopAngle: 270 })
        this.windCircleLayers.push(L.semiCircle([p.lat, p.lng], { radius: p.swRadius * 1000, ...allWindOptions }).addTo(map));
      }
      if (p.nwRadius) {
        allWindOptions = Object.assign(allWindOptions, { startAngle: 270, stopAngle: 360 })
        this.windCircleLayers.push(L.semiCircle([p.lat, p.lng], { radius: p.nwRadius * 1000, ...allWindOptions }).addTo(map));
      }
    }
  },
  _clearWindCircle (map) {
    if (!map) return;
    this.windCircleLayers.forEach(e => {
      if (map.hasLayer(e)) {
        map.removeLayer(e);
      }
    })
  },
  _zoomAdd (map) {
    if (!map) return;
    map.zoomIn();
  },
  _zoomSub (map) {
    if (!map) return;
    map.zoomOut();
  },
  _drawTrackPoint (map, MarkersList, options) {
    if (!map) {
      return
    }
    let layersName = 'trackplay';
    if (!map.hasLayer(this.mapControl[layersName])) {
      this.mapControl[layersName] = L.layerGroup().addTo(map);
    }
    Promise.all(this.trackPointImg).then(img => { // 全部图片加载完成
      let graphics = []
      let image
      let style = {}
      for (let i = 0; i < MarkersList.length; ++i) {
        let info = ''
        if (MarkersList[i].gDeviceStatus === null || MarkersList[i].gDeviceStatus !== 1) {
          if (MarkersList[i].gDeviceStatus === 3 || MarkersList[i].gDeviceStatus === 4) { // 起点|终点的文本信息
            info += "<div class='hl-track-point-box'>" + "纬度：" + (MarkersList[i] && MarkersList[i].lat !== -1 ? latLonTransform(MarkersList[i].lat, 'lat') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "经度：" + (MarkersList[i] && MarkersList[i].lng !== -1 ? latLonTransform(MarkersList[i].lng, 'lon') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "时间：" + (MarkersList[i].locTime ? dayjs(MarkersList[i].locTime * 1000).format('YYYY-MM-DD HH:mm:ss') : MarkersList[i].timestamp ? MarkersList[i].timestamp : "未知") + "</div>"
          } else if (MarkersList[i].gDeviceStatus === 2) { // 停止点的文本信息
            gc = MarkersList[i].stayPoint.lng, MarkersList[i].stayPoint.lat
            info += "<div class='hl-track-point-box'>" + "纬度：" + (MarkersList[i].stayPoint && MarkersList[i].stayPoint.lat !== -1 ? latLonTransform(MarkersList[i].stayPoint.lat, 'lat') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "经度：" + (MarkersList[i].stayPoint && MarkersList[i].stayPoint.lng !== -1 ? latLonTransform(MarkersList[i].stayPoint.lng, 'lon') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "停止时间：" + (MarkersList[i].startTime ? MarkersList[i].startTime : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "移动时间：" + (MarkersList[i].endTime ? MarkersList[i].endTime : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "停止时长：" + (MarkersList[i].duration ? MarkersList[i].duration : "未知") + "</div>"
          } else { // 除起点|终点|停止点以外的文本信息
            gc = MarkersList[i].stayPoint.lng, MarkersList[i].stayPoint.lat
            info += "<div class='hl-track-point-box'>" + "纬度：" + (MarkersList[i].stayPoint && MarkersList[i].stayPoint.lat !== -1 ? latLonTransform(MarkersList[i].stayPoint.lat, 'lat') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "经度：" + (MarkersList[i].stayPoint && MarkersList[i].stayPoint.lng !== -1 ? latLonTransform(MarkersList[i].stayPoint.lng, 'lon') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "时间：" + (MarkersList[i].locTime ? dayjs(MarkersList[i].locTime * 1000
            ).format('YYYY-MM-DD HH:mm:ss') : MarkersList[i].timestamp ? MarkersList[i].timestamp : "未知") + "</div>"
          }
          if (MarkersList[i].gDeviceStatus === 3) { // 起点
            image = this.trackPointImg[0]
          } else if (MarkersList[i].gDeviceStatus === 4) { // 终点
            image = this.trackPointImg[2]
          } else if (MarkersList[i].gDeviceStatus === 5) { // 离线
            image = this.trackPointImg[3]
          } else if (MarkersList[i].gDeviceStatus === 6) { // SOS
            image = this.trackPointImg[4]
          } else if (MarkersList[i].gDeviceStatus === 7) { // 断电
            image = this.trackPointImg[5]
          } else if (MarkersList[i].gDeviceStatus === 8) { // 拆卸
            image = this.trackPointImg[6]
          } else if (MarkersList[i].gDeviceStatus === 9) { // 进入围栏
            image = this.trackPointImg[7]
          } else if (MarkersList[i].gDeviceStatus === 10) { // 离开围栏
            image = this.trackPointImg[8]
          } else if (MarkersList[i].gDeviceStatus === 11) { // 超速
            image = this.trackPointImg[9]
          } else if (MarkersList[i].gDeviceStatus === 12) { // 低电量
            image = this.trackPointImg[10]
          } else if (MarkersList[i].gDeviceStatus === 13) { // 高度上升
            image = this.trackPointImg[11]
          } else if (MarkersList[i].gDeviceStatus === 14) { // 高度下降
            image = this.trackPointImg[12]
          } else if (MarkersList[i].gDeviceStatus === 15) { // 海拔
            image = this.trackPointImg[13]
          } else {
            image = this.trackPointImg[1]
          }

          let icon = L.icon({
            iconUrl: image,
            iconSize: options.iconSize,
            iconAnchor: options.iconAnchor
          })
          this.drawList[i] = L.marker(L.latLng(MarkersList[i].lat, MarkersList[i].lng), {
            icon: icon,
            info
          }).on('click', function (e) {
            let info = e.sourceTarget.options.info;
            if (info) {
              L.popup({ offset: [0, 0], className: 'hlleaflet-marker-popup' })
                .setLatLng([e.sourceTarget._latlng.lat, e.sourceTarget._latlng.lng])
                .setContent(`${info}`)
                .openOn(map);
            }
          })
          this.mapControl[layersName].addLayer(this.drawList[i]);
        }
      }
      map.addLayer(this.mapControl[layersName]);
    })
  },
  _trackPlay (map, data, options, manyLineColor = ['red', 'blue', 'yellow', 'orange', 'pink']) { //轨迹回放 lineColor多轨迹线条颜色
    if (!map) return;
    let _this = this;
    let allTargetOptions = Object.assign(this.trackplayOptions, options);
    // 画出轨迹的起点终点停止点 判断数据是单轨迹还是多轨迹
    if (!map.hasLayer(_this.mapControl['trackplay'])) {
      _this.mapControl['trackplay'] = L.layerGroup().addTo(map);
    }
    data.forEach((item, index) => {
      if (!Array.isArray(item)) { //单轨迹画出轨迹  显示里程
        let latlngs = []
        for (let p of data) {
          latlngs.push([p.lat, p.lng]);
          // 画出起点终点停止点等等
          _this._drawTrackPoint(map, data, allTargetOptions);
        }
        if (!allTargetOptions.isDrawLine) {
          _this.drawList[index] = L.polyline(latlngs, allTargetOptions).addTo(map);
        }

      } else { //多轨迹画出轨迹  不显示里程
        let latlngs = []
        for (let p of item) {
          latlngs.push([p.lat, p.lng]);
          // 画出起点终点停止点等等
          _this._drawTrackPoint(map, item, allTargetOptions);
        }
        if (!allTargetOptions.isDrawLine) {
          _this.drawList[index] = L.polyline(latlngs, { ...allTargetOptions, color: manyLineColor[index] ? manyLineColor[index] : 'green' }).addTo(map);
        }
      }
      if (!allTargetOptions.isDrawLine) {
        _this.mapControl['trackplay'].addLayer(_this.drawList[index]);
      }
    })
    _this.trackplay = L.trackplayback(data, map, {
      targetOptions: { ...allTargetOptions },
      trackLineOptions: {
        isDraw: allTargetOptions.isDrawLine, // 是否画线
        stroke: true,
        color: allTargetOptions.color, // 线条颜色
        weight: 2, // 线条宽度
        opacity: 1, // 透明度
        wakeTimeDiff: allTargetOptions.wakeTimeDiff// 尾迹时间控制 不传默认一年
      }
    })
    _this.trackplaybackControl = L.trackplaybackcontrol(_this.trackplay);
    _this.trackplaybackControl.addTo(map);
    // _this.map.addLayer(this.mapControl['trackplay']);
    return _this.trackplay;
  },
  _startTrack (trackplay) {//默认绘制路线
    if (!trackplay) return;
    trackplay.start();
  },
  _setTrackSpeed (trackplay, speed) {//设置速度
    if (!trackplay) return;
    trackplay.setSpeed(speed);
  },
  _clearTrackBack (map, trackplay) {//清除
    if (!map) return;
    if (!trackplay) return;
    if (map.hasLayer(this.mapControl['trackplay'])) {
      this._clearLayer(map, 'trackplay');//清除轨迹线图层
    }
    trackplay.dispose();
  },
  _restartTrack (trackplay) {//刷新
    trackplay.rePlaying();
  },
  _quitTrack (trackplay) {//停止
    trackplay.stop();
  },
  _showTrackLine (trackplay) {
    trackplay.showTrackLine();
  },
  _hideTrackLine (trackplay) {
    trackplay.hideTrackLine();
  },
  _getCurrentSpeed (trackplay) {
    return trackplay.getSpeed();
  },
  _getCurrentTime (trackplay) {
    return trackplay.getCurTime();
  },
  _clearAllEdit (map) {
    if (!map) return;
    map.pm.disableDraw('Line')
    map.pm.disableDraw('Marker')
    map.pm.disableDraw('Polygon')
    map.pm.disableDraw('Circle')
    map.pm.disableDraw('Rectangle')
  },
  _loadPic (url) {
    return new Promise(function (pass, fall) {
      let img = new Image()
      img.onload = pass()
      img.onerrof = fall()
      if (url.includes('http')) {
        img.src = url;
      } else {
        img.src = require(`${url}`) // 解决依赖代码不支持变量，需要转模板模式
      }
    })
  }
}
export const hlLeaflet = function () {
  return HlLeaflet;
}
