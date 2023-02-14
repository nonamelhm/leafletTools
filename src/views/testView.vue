<template>
  <div id="testView">
    <func-box style="width:1200px;margin: auto;" :map="map"></func-box>
    <!-- map地图，需要指定宽度高度 -->
    <div id="map2" style="width:800px;height:500px;margin: auto;"></div>
  </div>
</template>
<script>
  import hl from '@/plugins/hlLeaflet.js'
  import funcBox from '@/components/funcBox.vue'
  export default {
    name: 'testView',
    components: {
      funcBox
    },
    mounted () {
      this.map = hl._initMap("map2", { lat: 24, lon: 110, zoom: 4 })
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
        hl._changeLayers(this.map, 2)
      }
    }
  }
</script>
<style lang="">

</style>