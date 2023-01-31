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
    </ul>
  </div>
</template>
<script>
import leaf from '@/plugins/leaflet_func'
// import leaf from 'leaflettools'
export default {
  name: 'funcBox',
  data() {
    return {
      isEditPolygon:false,
      isEditCircle:false,
      isEditRectangle:false,
      isEditMarker:false,
      isPoint: false,
      isPolyline: false,
      isPolygon: false,
      isRectangle: false,
      isCircle: false,
      isAngleCircle: false,
      isMeasure:false,
      isArea:false,
      isDrawing:false
    }
  },
  methods: {
    point() {
      this.isPoint = !this.isPoint
      if (this.isPoint) {
        let fn = function(e){
        }
        let list = [{ lat: 24, lon: 110, id: 1 }, { lat: 22, lon: 110, id: 3 }]
         leaf.renderPoint(list, 'layers1', require("@/assets/images/leaflet_icon/marker-icon-2x.png"), true,fn)
        leaf.renderPoint([{ lat: 25, lon: 110, id: 2 }], 'layers2')
        leaf.renderPoint([{ lat: 26, lon: 110, id: 2 }], 'layers2')
        leaf.mapControl['layers1'].bindPopup('Hello').openPopup()
        leaf.mapControl['layers2'].bindPopup('Hello').openPopup()
      } else {
        leaf.clearLayer('layers1')
        leaf.clearLayer('layers2')
      }
    },
    polyline() {
      this.isPolyline = !this.isPolyline
      if (this.isPolyline) {
        let list = [{ lat: 24, lon: 110 }, { lat: 32, lon: 112 }, { lat: 21, lon: 113 }]
        leaf.drawDataInMap(list, 'polyline', 'polyline', { color: 'blue', weight: 1 })
      } else {
        leaf.clearLayer('polyline')
      }
    },
    polygon() {
      this.isPolygon = !this.isPolygon
      let list = [[{ lat: 24, lon: 110 }, { lat: 22, lon: 110 }, { lat: 32, lon: 112 }, { lat: 25, lon: 14 }], [{ lat: 19, lon: 10 }, { lat: 12, lon: 80 }, { lat: 2, lon: 22 }, { lat: 5, lon: 14 }]]
      if (this.isPolygon) {
        list.forEach((p, i) => {
          leaf.drawDataInMap(p, `polygon${i}`, 'polygon', { color: 'green', weight: 1 })
        })
      } else {
        for (var i in list) {
          leaf.clearLayer(`polygon${i}`)
        }
      }
    },
    rectangle() {
      this.isRectangle = !this.isRectangle
      let list = [[{ lat: 24, lon: 110, id: 1 }, { lat: 24, lon: 121, id: 2 }, { lat: 30, lon: 121, id: 3 }, { lat: 30, lon: 110, id: 4 }], [{ lat: 14, lon: 90, id: 5 }, { lat: 14, lon: 100, id: 6 }, { lat: 20, lon: 90, id: 7 }, { lat: 20, lon: 100, id: 8 }]]
      if (this.isRectangle) {
        list.forEach((p, i) => {
          leaf.drawDataInMap(p, `rectangle${i}`, 'rectangle', { color: 'blue', weight: 1 })
        })
      } else {
        for (var i in list) {
          leaf.clearLayer(`rectangle${i}`)
        }
      }
    },
    circle() {
      this.isCircle = !this.isCircle
      let list = [{ lat: 24, lon: 110, radius: 20000 }, { lat: 25, lon: 120, radius: 60000 }]
      let areaData = []
      if (this.isCircle) {
        list.forEach((p, i) => {
          leaf.drawDataInMap(p, `circle${i}`, 'circle', { color: 'red', weight: 1 })
          areaData.push([p.lat, p.lon])
        })
        leaf.fitBounds(areaData) //聚集
      } else {
        for (var i in list) {
          leaf.clearLayer(`circle${i}`)
        }
      }
    },
    fullScreen() {
      leaf.mapControl.fullscreen.link.click()
    },
    actMapZoomIO: function (key) {
      if (key > 0) {
        leaf.map.zoomIn()
      } else if (key < 0) {
        leaf.map.zoomOut()
      }
    },
    angleCircle() {
      this.isAngleCircle = !this.isAngleCircle
      let list = [{ lat: 25, lon: 110, seRadius: 200, neRadius:250, swRadius: 180, nwRadius: 170},{ lat: 15, lon: 100, seRadius: 100, neRadius:220, swRadius: 130, nwRadius: 140}]
        // 转换数据成角度画圆
        let arr = []
        for(var p of list){
          arr.push({lat:p.lat,lon:p.lon,radius:p.neRadius,startAngle:0,stopAngle:90})
          arr.push({lat:p.lat,lon:p.lon,radius:p.seRadius,startAngle:90,stopAngle:180})
          arr.push({lat:p.lat,lon:p.lon,radius:p.swRadius,startAngle:180,stopAngle:270})
          arr.push({lat:p.lat,lon:p.lon,radius:p.nwRadius,startAngle:270,stopAngle:360})
        }

      if (this.isAngleCircle) {
        arr.forEach((p, i) => {
          leaf.drawDataInMap(p, `semiCircle${i}`, 'semiCircle', { fillColor: '#FF9C00', fillOpacity: 0.3, color: 'transparent', startAngle:p.startAngle, stopAngle: p.stopAngle })
        })
      } else {
        for (var i in arr) {
          leaf.clearLayer(`semiCircle${i}`)
        }
      }
    },
    mearsure(){
      this.isMeasure = !this.isMeasure;
      leaf.measure();
    },
    area(){
      this.isArea = !this.isArea;
      leaf.mearsureArea();
    },
    changeLayers(idx){
     leaf.changeLayers(idx);
    },
    draw(type){
      leaf.drawInMap(type,{iconUrl:require("@/assets/images/leaflet_icon/marker-icon.png"),iconSize:[10,10]})
      leaf.map.on('pm:create', function (e) { //监听绘制
      if(e.shape==='Marker'){
       console.log(e.marker._latlng)
      }
    })
    },
    hotMap(){
      let data = [{
        lat:35.460756,
        lng:119.59847,
        count:1
      },{
        lat:35.560756,
        lng:119.69847,
        count:19
      }]
      leaf.drawHeatMap(data);
    },
    edit(type){
      if(type===0){ //多边形
        this.isEditPolygon = !this.isEditPolygon;
        if(this.isEditPolygon){
          leaf.editMapGetData(type);
        }else{
          leaf.clearLayer('editingLayers');
        }
      }else if(type===1){ //圆形
        this.isEditCircle = !this.isEditCircle;
        if(this.isEditCircle){
          leaf.editMapGetData(type);
        }else{
          leaf.clearLayer('editingLayers');
        }
      }else{ //矩形
        this.isEditRectangle = !this.isEditRectangle;
        if(this.isEditRectangle){
          leaf.editMapGetData(type);
        }else{
          leaf.clearLayer('editingLayers');
        }
      }
      
    },
    editMarker(){
      this.isEditMarker = !this.isEditMarker;
      if(this.isEditMarker){
        leaf.editMarker();
      }else{//  清除Maker
        leaf.clearLayer('editingMarker');
      }
     
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
