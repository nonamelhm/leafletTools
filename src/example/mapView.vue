<template>
  <div id="mapView">
    <func-box :map="map"></func-box>
    <!-- map地图，需要指定宽度高度 -->
    <div id="map" style="width:100%;height:600px;margin: auto;"></div>
  </div>
</template>
<script>
  import { HlLeaflet as hl } from '@/plugins/hlLeaflet.js'
  import funcBox from '@/components/funcBox.vue'
  export default {
    name: 'mapView',
    components: {
      funcBox
    },
    mounted () {
      this.map = hl._initMap("map", { lat: 24, lon: 110, zoom: 4 });
      //鼠标移动位置
      if (this.map) {
        this.map.on('mousemove', e => {
          // console.log('当前经纬度', e.latlng)
        });
      }
    },
    beforeDistroy () {
      this.map.off('mousemove');
    },
    data () {
      return {
        map: {}
      }
    },
    methods: {
      _changeLayers () {
        hl._changeLayers(this.map, 1)
      }
    }
  }
</script>
<style lang="">

</style>