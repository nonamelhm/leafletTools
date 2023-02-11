<template>
  <div id="app">
    <header style="text-align:center;">Leaflet地图功能封装</header>
    <keep-alive><router-link to="/test">testView</router-link></keep-alive>
    <router-link to="/">回去首页</router-link>
    <keep-alive><router-view /> </keep-alive>
  </div>
</template>