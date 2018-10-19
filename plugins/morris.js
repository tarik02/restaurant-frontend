import Vue from 'vue'
import 'jquery'
import Raphael from 'raphael/raphael'
import DonutChart from 'vue-morris/src/components/donut-chart'
import BarChart from 'vue-morris/src/components/bar-chart'
import LineChart from 'vue-morris/src/components/line-chart'
import AreaChart from 'vue-morris/src/components/area-chart'

global.Raphael = Raphael

Vue.component('donut-chart', DonutChart)
Vue.component('bar-chart', BarChart)
Vue.component('line-chart', LineChart)
Vue.component('area-chart', AreaChart)
