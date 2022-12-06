<template>
  <div id="funcBox">
    <ul>
      <li @click="point()">{{ isPoint ? '清除绘点' : '直接绘点' }}</li>
      <li @click="polyline()">{{ isPolyline ? '清除绘线' : '直接绘线' }}</li>
      <li @click="polygon()">{{ isPolyline ? '清除多边形' : '直接绘多边形' }}</li>
      <li>6</li>
      <li>7</li>
      <li>8</li>
    </ul>
  </div>
</template>
<script>
import leaf from '@/plugins/leaflet_func'
export default {
  name: 'funcBox',
  data() {
    return {
      isPoint: false,
      isPolyline: false,
      isPolygon:false
    }
  },
  methods: {
    point() {
      this.isPoint = !this.isPoint
      if (this.isPoint) {
        let list = [{ lat: 24, lon: 110, id: 1 }, { lat: 22, lon: 110, id: 3 }]
        leaf.renderPoint(list, 'layers1', require("@/assets/images/leaflet_icon/marker-icon-2x.png"), true)
        leaf.renderPoint([{ lat: 25, lon: 110, id: 2 }], 'layers2')
      } else {
        leaf.clearLayer('layers1')
        leaf.clearLayer('layers2')
      }
    },
    polyline() {
      this.isPolyline = !this.isPolyline
      if (this.isPolyline) {
        let list = [{ lat: 24, lon: 110, id: 1 }, { lat: 22, lon: 110, id: 3 }]
        leaf.drawPolyline(list, 'polyline','polyline',{color:'blue',weight:1})
      } else {
        leaf.clearLayer('polyline')
      }
    },
    polygon() {
      this.isPolygon = !this.isPolygon
      if (this.isPolygon) {
        let list = [{ lat: 24, lon: 110, id: 1 }, { lat: 22, lon: 110, id: 3 },{ lat: 32, lon: 112, id: 4 },{ lat: 25, lon: 114, id: 5 }]
        leaf.drawPolygon(list, 'polygon',{color:'blue',weight:1})
      } else {
        leaf.clearLayer('polygon')
      }
    },

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
