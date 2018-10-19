import moment from 'moment'
import Vue from 'vue'
import DatetimePicker from 'vuetify-datetime-picker/src/components/DatetimePicker'
import 'vuetify-datetime-picker/src/stylus/main.styl'
import { DATETIME_MOMENT, DATETIME_DAY } from '~/common/format'
import DatePicker from '~/components/DatePicker'

Vue.component('v-datetime-picker', {
  extends: DatetimePicker,

  props: {
    datetime: {
      type: [moment, Date, String],
      default: null,
    },

    format: { type: String, default: DATETIME_MOMENT },
    locale: { type: String, default: 'uk' },
    clearText: { type: String, default: 'Очистити' },
    okText: { type: String, default: 'ОК' },
  },
})

Vue.component('date-picker', {
  extends: DatePicker,

  props: {
    format: { type: String, default: DATETIME_DAY },
    locale: { type: String, default: 'uk' },
    clearText: { type: String, default: 'Очистити' },
    okText: { type: String, default: 'ОК' },
  },
})
