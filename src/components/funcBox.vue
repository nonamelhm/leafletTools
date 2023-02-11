<template>
  <div id="funcBox">
    <ul>
      <li @click="point()">{{ isPoint ? '清除绘点(聚合点)' : '数据绘点(聚合点)' }}</li>
      <li @click="polyline()">{{ isPolyline ? '清除绘线' : '数据绘线' }}</li>
      <li @click="polygon()">{{ isPolygon? '清除多边形' : '数据绘多边形' }}</li>
      <li @click="rectangle()">{{ isRectangle ? '清除矩形' : '数据绘矩形' }}</li>
      <li @click="circle()">{{ isCircle ? '清除圆形' : '数据绘圆形' }}</li>
      <li @click="angleCircle()">{{ isAngleCircle ? '清除角度画圆（台风风圈）' : '绘制角度画圆（台风风圈）' }}</li>
      <li @click="mearsure()">{{ isMeasure ? '取消测量' : '测量距离' }}</li>
      <li @click="area()">{{ isArea ? '取消测量' : '测量面积' }}</li>
      <li @click="draw('marker')">{{ isDrawing ? '取消地图绘点' : '地图绘点' }}</li>
      <li @click="hotMap()">热力图</li>
      <li @click="changeLayers(1)">切换天地图卫星图</li>
      <li @click="changeLayers(2)">切换天地图地形图</li>
      <li @click="changeLayers(3)">切换天地图街道图</li>
      <li @click="changeLayers(4)">切换谷歌卫星图</li>
      <li @click="changeLayers(5)">切换谷歌地形图</li>
      <li @click="changeLayers(6)">切换谷歌街道图</li>
      <li @click="fullScreen()">全屏</li>
      <li @click="actMapZoomIO(1)">放大</li>
      <li @click="actMapZoomIO(-1)">缩小</li>
      <li @click="edit(0)">{{ isEditPolygon? '清除绘制多边形':'直接绘制多边形'}}</li>
      <li @click="edit(1)">{{ isEditCircle? '清除绘制圆形':'直接绘制圆形'}}</li>
      <li @click="edit(2)">{{ isEditRectangle?'清除绘制矩形':'直接绘制矩形'}}</li>
      <li @click="editMarker()">{{isEditMarker ? '清除绘点' : '直接绘点' }}</li>
      <li @click="trackBack()">{{isTrackBack ? '清除轨迹' : '轨迹回放' }}</li>
      <li @click="quitTrack()">{{isStop?'开启轨迹回放':'暂停轨迹回放'}}</li>
      <li @click="setTrackSpeed(10)">设置轨迹回放速度为10</li>
      <li @click="restartTrack()">刷新轨迹回放</li>
    </ul>
  </div>
</template>
<script>
  import L from 'leaflet';
  import hl from '@/plugins/hlLeaflet.js'
  // import '@/plugins/index.js'
  // import leaf from 'leaflettools'
  import { testData } from '@/plugins/test.js';
  export default {
    name: 'funcBox',
    data () {
      return {
        hl: null,
        isTrackBack: false,
        isEditPolygon: false,
        isEditCircle: false,
        isEditRectangle: false,
        isEditMarker: false,
        isPoint: false,
        isPolyline: false,
        isPolygon: false,
        isRectangle: false,
        isCircle: false,
        isAngleCircle: false,
        isMeasure: false,
        isArea: false,
        isDrawing: false,
        isStop: false
      }
    },
    props: {
      map: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    methods: {
      point () {
        this.isPoint = !this.isPoint
        if (this.isPoint) {
          // 显示内容提前封装在msg中
          let list = [{ lat: 24, lon: 110, id: 1, showMsg: `显示内容1-24-110` }, { lat: 22, lon: 110, id: 3, showMsg: `显示内容2-24-110` }]
          hl._renderPoint(this.map, list, 'layers1', require("@/assets/images/leaflet_icon/marker-icon-2x.png"), true)
          hl._renderPoint(this.map, [{ lat: 25, lon: 110, id: 2, showMsg: `显示内容2-25-110` }], 'layers2')
          hl._renderPoint(this.map, [{ lat: 26, lon: 110, id: 2, showMsg: `显示内容2-26-110` }], 'layers2')
        } else {
          hl._clearLayer(this.map, 'layers1')
          hl._clearLayer(this.map, 'layers2')
        }
      },
      polyline () {
        this.isPolyline = !this.isPolyline
        if (this.isPolyline) {
          let list = [{ lat: 24, lon: 110 }, { lat: 32, lon: 112 }, { lat: 21, lon: 113 }]
          hl._drawByData(this.map, list, 'polyline', 'polyline', { color: 'blue', weight: 1 })
        } else {
          hl._clearLayer(this.map, 'polyline')
        }
      },
      polygon () {
        this.isPolygon = !this.isPolygon
        let list = [[{ lat: 24, lon: 110 }, { lat: 22, lon: 110 }, { lat: 32, lon: 112 }, { lat: 25, lon: 14 }], [{ lat: 19, lon: 10 }, { lat: 12, lon: 80 }, { lat: 2, lon: 22 }, { lat: 5, lon: 14 }]]
        if (this.isPolygon) {
          list.forEach((p, i) => {
            hl._drawByData(this.map, p, `polygon${i}`, 'polygon', { color: 'green', weight: 1 })
          })
        } else {
          for (var i in list) {
            hl._clearLayer(this.map, `polygon${i}`)
          }
        }
      },
      rectangle () {
        this.isRectangle = !this.isRectangle
        let list = [[{ lat: 24, lon: 110, id: 1 }, { lat: 24, lon: 121, id: 2 }, { lat: 30, lon: 121, id: 3 }, { lat: 30, lon: 110, id: 4 }], [{ lat: 14, lon: 90, id: 5 }, { lat: 14, lon: 100, id: 6 }, { lat: 20, lon: 90, id: 7 }, { lat: 20, lon: 100, id: 8 }]]
        if (this.isRectangle) {
          list.forEach((p, i) => {
            hl._drawByData(this.map, p, `rectangle${i}`, 'rectangle', { color: 'blue', weight: 1 })
          })
        } else {
          for (var i in list) {
            hl._clearLayer(this.map, `rectangle${i}`)
          }
        }
      },
      circle () {
        this.isCircle = !this.isCircle
        let list = [{ lat: 24, lon: 110, radius: 20000 }, { lat: 25, lon: 120, radius: 60000 }]
        let areaData = []
        if (this.isCircle) {
          list.forEach((p, i) => {
            hl._drawByData(this.map, p, `circle${i}`, 'circle', { color: 'red', weight: 1 })
            areaData.push([p.lat, p.lon])
          })
          hl._fitBounds(this.map, areaData) //适当放大
        } else {
          for (var i in list) {
            hl._clearLayer(this.map, `circle${i}`)
          }
        }
      },
      fullScreen () {
        hl.mapControl.fullscreen.link.click()
      },
      actMapZoomIO: function (key) {
        if (key > 0) {
          hl.map.zoomIn()
        } else if (key < 0) {
          hl.map.zoomOut()
        }
      },
      angleCircle () {
        this.isAngleCircle = !this.isAngleCircle
        let list = [{ lat: 25, lon: 110, seRadius: 200, neRadius: 250, swRadius: 180, nwRadius: 170 }, { lat: 15, lon: 100, seRadius: 100, neRadius: 220, swRadius: 130, nwRadius: 140 }]
        // 转换数据成角度画圆
        let arr = []
        for (var p of list) {
          arr.push({ lat: p.lat, lon: p.lon, radius: p.neRadius, startAngle: 0, stopAngle: 90 })
          arr.push({ lat: p.lat, lon: p.lon, radius: p.seRadius, startAngle: 90, stopAngle: 180 })
          arr.push({ lat: p.lat, lon: p.lon, radius: p.swRadius, startAngle: 180, stopAngle: 270 })
          arr.push({ lat: p.lat, lon: p.lon, radius: p.nwRadius, startAngle: 270, stopAngle: 360 })
        }

        if (this.isAngleCircle) {
          arr.forEach((p, i) => {
            hl._drawByData(this.map, p, `semiCircle${i}`, 'semiCircle', { fillColor: '#FF9C00', fillOpacity: 0.3, color: 'transparent', startAngle: p.startAngle, stopAngle: p.stopAngle })
          })
        } else {
          for (var i in arr) {
            hl._clearLayer(this.map, `semiCircle${i}`)
          }
        }
      },
      mearsure () {
        this.isMeasure = !this.isMeasure;
        hl.measure();
      },
      area () {
        this.isArea = !this.isArea;
        hl.mearsureArea();
      },
      changeLayers (idx) {
        hl._changeLayers(this.map, idx);
      },
      draw (type) {
        hl.drawInMap(type, { iconUrl: require("@/assets/images/leaflet_icon/marker-icon.png"), iconSize: [10, 10] })
        hl.map.on('pm:create', function (e) { //监听绘制
          if (e.shape === 'Marker') {
            console.log(e.marker._latlng)
          }
        })
      },
      hotMap () {
        let data = [{
          lat: 35.460756,
          lng: 119.59847,
          count: 1
        }, {
          lat: 35.560756,
          lng: 119.69847,
          count: 19
        }]
        hl.drawHeatMap(data);
      },
      edit (type) {
        if (type === 0) { //多边形
          this.isEditPolygon = !this.isEditPolygon;
          if (this.isEditPolygon) {
            hl.editMapGetData(type);
          } else {
            hl._clearLayer(this.map, 'editingLayers');
          }
        } else if (type === 1) { //圆形
          this.isEditCircle = !this.isEditCircle;
          if (this.isEditCircle) {
            hl.editMapGetData(type);
          } else {
            hl._clearLayer(this.map, 'editingLayers');
          }
        } else { //矩形
          this.isEditRectangle = !this.isEditRectangle;
          if (this.isEditRectangle) {
            hl.editMapGetData(type);
          } else {
            hl._clearLayer(this.map, 'editingLayers');
          }
        }

      },
      editMarker () {
        this.isEditMarker = !this.isEditMarker;
        if (this.isEditMarker) {
          hl.editMarker();
        } else {//  清除Maker
          hl._clearLayer(this.map, 'editingMarker');
        }
      },
      trackBack () {
        this.isTrackBack = !this.isTrackBack;
        if (this.isTrackBack) {
          hl.trackBack(testData);
        } else {//  清除轨迹
          hl.clearTrackBack();
        }
      },
      quitTrack () {
        this.isStop = !this.isStop;
        if (this.isStop) { hl.quitTrack(); } else {
          hl.drawTrack();
        }
      },
      setSpeed (speed) {
        hl.setTrackSpeed(speed);
      },
      restartTrack () {
        hl.restartTrack();
      }
    },

  }
</script>
<style lang="less" scoped>
  #funcBox {
    ul {
      li {
        list-style: none;
        display: inline-block;
        margin: 10px;

        &:hover {
          color: blueviolet;
          cursor: pointer;
        }
      }
    }
  }
</style>