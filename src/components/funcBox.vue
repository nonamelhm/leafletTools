<template>
  <div id="funcBox">
    <ul>
      <li @click="point()">{{ isPoint ? '清除绘点(聚合点)' : '数据绘点(聚合点)' }}</li>
      <li @click="polyline()">{{ isPolyline ? '清除绘线' : '数据绘线' }}</li>
      <li @click="polygon()">{{ isPolygon? '清除多边形' : '数据绘多边形' }}</li>
      <li @click="rectangle()">{{ isRectangle ? '清除矩形' : '数据绘矩形' }}</li>
      <li @click="circle()">{{ isCircle ? '清除圆形' : '数据绘圆形' }}</li>
      <li @click="angleCircle()">{{ isAngleCircle ? '清除角度画圆（台风风圈）' : '绘制角度画圆（台风风圈）' }}</li>
      <li @click="mearsure()">{{ isMeasure ? '清除测量' : '测量距离' }}</li>
      <li>当前测量距离单位：{{measureUnit}}</li>
      <li @click="changeMearsureUnit()">切换测量距离单位</li>
      <li @click="area()">测量面积</li>
      <li @click="hotMap()">{{ isHot ? '清除热力图' : '绘制热力图' }}</li>
      <li @click="clearEdit()">清除正在绘制</li>
      <li @click="edit(0)">{{ isEditPolygon? '清除绘制多边形':'直接绘制多边形'}}</li>
      <li @click="edit(1)">{{ isEditCircle? '清除绘制圆形':'直接绘制圆形'}}</li>
      <li @click="edit(2)">{{ isEditRectangle?'清除绘制矩形':'直接绘制矩形'}}</li>
      <li @click="editMarkerGetData()">{{iseditMarkerGetData ? '清除绘点' : '直接绘点' }}</li>
      <li @click="trackBack()">{{isTrackBack ? '清除轨迹' : '轨迹回放' }}</li>
      <li @click="quitTrack()">{{isStop?'开启轨迹回放':'暂停轨迹回放'}}</li>
      <li @click="setTrackSpeed(10)">设置轨迹回放速度为10</li>
      <li @click="restartTrack()">刷新轨迹回放</li>
      <li @click="changeLayers(1)">切换天地图卫星图</li>
      <li @click="changeLayers(2)">切换天地图地形图</li>
      <li @click="changeLayers(3)">切换天地图街道图</li>
      <li @click="changeLayers(4)">切换谷歌卫星图</li>
      <li @click="changeLayers(5)">切换谷歌地形图</li>
      <li @click="changeLayers(6)">切换谷歌街道图</li>
      <li @click="fullScreen()">全屏</li>
      <li @click="actMapZoomIO(1)">放大</li>
      <li @click="actMapZoomIO(-1)">缩小</li>
    </ul>
  </div>
</template>
<script>
  import hl from '@/plugins/hlLeaflet.js'
  // import leaf from 'leaflettools'
  import { testData } from '@/plugins/test.js';
  export default {
    name: 'funcBox',
    data () {
      return {
        hl: null,
        isHot: false,
        isTrackBack: false,
        isEditPolygon: false,
        isEditCircle: false,
        isEditRectangle: false,
        iseditMarkerGetData: false,
        isPoint: false,
        isPolyline: false,
        isPolygon: false,
        isRectangle: false,
        isCircle: false,
        isAngleCircle: false,
        isMeasure: false,
        isArea: false,
        isDrawing: false,
        isStop: false,
        measureUnit: ''
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
    watch: {
      isMeasure (newVal) {
        if (newVal) {
          this.getMeasureUnit();
        }
      }
    },
    methods: {
      clearEdit () {
        hl._clearAllEdit(this.map);
      },
      point () {
        this.isPoint = !this.isPoint
        if (this.isPoint) {
          // 显示内容提前封装在msg中
          let list = [{ lat: 24, lng: 110, id: 1, showMsg: `点击点显示内容1test` }, { lat: 22, lng: 110, id: 3, showMsg: `点击点显示内容2test` }];
          hl._renderPoint(this.map, list, 'layers1', require("@/assets/images/leaflet_icon/marker-icon-2x.png"), true)
          hl._renderPoint(this.map, [{ lat: 25, lng: 110, id: 2, showMsg: `显示内容2-25-110` }], 'layers2')
          hl._renderPoint(this.map, [{ lat: 26, lng: 110, id: 2, showMsg: `显示内容2-26-110` }], 'layers2')
        } else {
          hl._clearLayer(this.map, 'layers1')
          hl._clearLayer(this.map, 'layers2')
        }
      },
      polyline () {
        this.isPolyline = !this.isPolyline
        if (this.isPolyline) {
          let list = [{ lat: 24, lng: 110 }, { lat: 32, lng: 112 }, { lat: 21, lng: 113 }]
          hl._drawLineByData(this.map, list, 'polyline', { color: 'blue', weight: 1, showDistance: true })
          let list2 = [{ lat: 25, lng: 111 }, { lat: 30, lng: 102 }, { lat: 24, lng: 113 }]
          hl._drawLineByData(this.map, list2, 'polyline2', { color: 'red', weight: 1, showDistance: true })
          hl._drawTips(this.map, { lat: 24, lng: 110 }, 'tips', { html: 'hello-hhh' });
        } else {
          hl._clearLayer(this.map, 'polyline');
          hl._clearLayer(this.map, 'polyline2');
          hl._clearLayer(this.map, 'tips');
        }
      },
      polygon () {
        this.isPolygon = !this.isPolygon
        let list = [[{ lat: 24, lng: 110, showMsg: 'hello' }, { lat: 22, lng: 110 }, { lat: 32, lng: 112 }, { lat: 25, lng: 14 }], [{ lat: 19, lng: 10, showMsg: 'hi' }, { lat: 12, lng: 80 }, { lat: 2, lng: 22 }, { lat: 5, lng: 14 }]]
        if (this.isPolygon) {
          hl._drawByData(this.map, list, `polygon`, 'polygon', { color: 'green', weight: 1 })
        } else {
          hl._clearLayer(this.map, `polygon`)
        }
      },
      rectangle () {
        this.isRectangle = !this.isRectangle
        let list = [[{ lat: 24, lng: 110, showMsg: 'hello-rectangle' }, { lat: 24, lng: 121 }, { lat: 30, lng: 121, id: 3 }, { lat: 30, lng: 110, id: 4 }], [{ lat: 14, lng: 90, id: 5, showMsg: 'hi-rectangle' }, { lat: 14, lng: 100, id: 6 }, { lat: 20, lng: 90, id: 7 }, { lat: 20, lng: 100, id: 8 }]]
        let list2 = [{ lat: 26, lng: 130, showMsg: 'hello222-rectangle' }, { lat: 26, lng: 121 }, { lat: 30, lng: 130 }, { lat: 30, lng: 121 }];
        if (this.isRectangle) {
          hl._drawByData(this.map, list, `rectangle`, 'rectangle', { color: 'blue', weight: 1 })
          hl._drawByData(this.map, list2, `rectangle`, 'rectangle', { color: 'red', weight: 1 })

        } else {
          hl._clearLayer(this.map, `rectangle`)
        }
      },
      circle () {
        this.isCircle = !this.isCircle
        let list = [{ lat: 24, lng: 110, radius: 20000, showMsg: 'circle1' }, { lat: 25, lng: 120, radius: 60000, showMsg: 'circle2' }]
        if (this.isCircle) {
          hl._drawByData(this.map, list, `circle`, 'circle', { color: 'red', weight: 1 });
        } else {
          hl._clearLayer(this.map, `circle`);
        }
      },
      fullScreen () {
        hl._fullScreen(this.map);
      },
      actMapZoomIO: function (key) {
        if (key > 0) {
          hl._zoomAdd(this.map)
        } else if (key < 0) {
          hl._zoomSub(this.map)
        }
      },
      angleCircle () {
        this.isAngleCircle = !this.isAngleCircle
        let list = [{ lat: 25, lng: 110, seRadius: 200, neRadius: 250, swRadius: 180, nwRadius: 170 }, { lat: 15, lng: 100, seRadius: 100, neRadius: 220, swRadius: 130, nwRadius: 140 }]
        if (this.isAngleCircle) {
          hl._drawWindCircle(this.map, list);
        } else {
          hl._clearWindCircle(this.map)
        }
      },
      mearsure () {
        this.isMeasure = !this.isMeasure;
        if (this.isMeasure) {
          hl._measure(this.map);
        } else {
          hl._clearMeasure(this.map);
        }
      },
      changeMearsureUnit () {
        hl._changeMeasureUnit(this.map);
        this.getMeasureUnit(this.map);
      },
      getMeasureUnit () {
        this.measureUnit = hl._getMeasureUnit(this.map);
      },
      area () {
        let fn = function () {
          alert('test')
        }
        hl._mearsureArea(this.map);
        this.map.on('measurefinish', function (evt) { //监听绘画结束调用函数
          if (fn) fn();
        })
      },
      changeLayers (idx) {
        hl._changeLayers(this.map, idx);
      },
      draw (type) {
        hl._drawInMap(this.map, type, { iconUrl: require("@/assets/images/leaflet_icon/marker-icon.png"), iconSize: [10, 10] })
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
        this.isHot = !this.isHot;
        if (this.isHot) {
          hl._drawHeatMap(this.map, data, 'hot');
        } else {
          hl._clearLayer(this.map, 'hot');
        }

      },
      edit (type) {
        if (type === 0) { //多边形
          this.isEditPolygon = !this.isEditPolygon;
          if (this.isEditPolygon) {
            //start 初始化监听得到绘制时候经纬度
            this.map.on('pm:drawstart', e => {
              console.log('绘制开始')
              console.log(e);
            });
            this.map.on('pm:drawend', e => {
              console.log('绘制结束')
              console.log(e);
            });
            this.map.on('pm:create', e => {
              console.log('创建完成');
              console.log(e);
            });
            //end 得到绘制时候经纬度

            hl._editMapGetData(this.map, type);

          } else {
            hl._clearLayer(this.map, 'editingLayers');
          }
        } else if (type === 1) { //圆形
          this.isEditCircle = !this.isEditCircle;
          if (this.isEditCircle) {
            hl._editMapGetData(this.map, type);
          } else {
            hl._clearLayer(this.map, 'editingLayers');
          }
        } else { //矩形
          this.isEditRectangle = !this.isEditRectangle;
          if (this.isEditRectangle) {
            hl._editMapGetData(this.map, type);
          } else {
            hl._clearLayer(this.map, 'editingLayers');
          }
        }

      },
      editMarkerGetData () {
        this.iseditMarkerGetData = !this.iseditMarkerGetData;
        if (this.iseditMarkerGetData) {
          hl._editMarkerGetData(this.map);
        } else {//  清除Maker
          hl._clearLayer(this.map, 'editingMarker');
        }
      },
      trackBack () {
        this.isTrackBack = !this.isTrackBack;
        if (this.isTrackBack) {
          hl._trackPlay(this.map, testData, { isDrawLine: false });
          hl._startTrack();
        } else {//  清除轨迹
          hl._clearTrackBack(this.map);
        }
      },
      quitTrack () {
        this.isStop = !this.isStop;
        if (this.isStop) { hl._quitTrack(); } else {
          hl._startTrack();
        }
      },
      setSpeed (speed) {
        hl._setTrackSpeed(speed);
      },
      restartTrack () {
        hl._restartTrack();
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