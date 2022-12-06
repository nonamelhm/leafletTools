<template>
  <div id="mapView">
  <func-box style="width:1200px;margin: auto;"></func-box>
   <!-- map地图，需要指定宽度高度 -->
  <div id="map" style="width:1200px;height:800px;margin: auto;"></div>
  </div>
</template>
<script>
import leaf from '@/plugins/leaflet_func.js'
import funcBox from '@/components/funcBox.vue'
export default {
  name:'mapView',
  components:{
    funcBox
  },
  mounted() {
    leaf.initLeaflet("map",{lat:24,lon:110,zoom:5})
  },
}
</script>
<style lang="">
  
</style>