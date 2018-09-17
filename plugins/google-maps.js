import 'vue-googlemaps/dist/vue-googlemaps.css'
import Vue from 'vue'
import VueGoogleMaps from 'vue-googlemaps'

Vue.use(VueGoogleMaps, {
  load: {
    apiKey: 'AIzaSyBLs45gvYkgg_zzBnQMIot2yTztybP1GL4',
    libraries: ['places'],
    useBetaRenderer: false,
  },
})
