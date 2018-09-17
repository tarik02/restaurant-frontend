import Vue from 'vue'
import { getOrderStatusName } from '~/common/order-status'

Vue.filter('orderStatus', getOrderStatusName)
