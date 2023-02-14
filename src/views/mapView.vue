<template>
  <div id="mapView">
    <func-box style="width:1200px;margin: auto;" :map="map"></func-box>
    <!-- map地图，需要指定宽度高度 -->
    <div id="map" style="width:800px;height:500px;margin: auto;margin-bottom:20px;"></div>
  </div>
</template>
<script>
  import hl from '@/plugins/hlLeaflet.js'
  // import leaf from 'leaflettools'
  import funcBox from '@/components/funcBox.vue'
  export default {
    name: 'mapView',
    components: {
      funcBox
    },
    mounted () {
      this.map = hl._initMap("map", { lat: 24, lon: 110, zoom: 8 });
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