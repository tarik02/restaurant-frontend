<template>
  <div>
    <v-text-field
      :label="label"
      :value="formattedDate"
      readonly
      @click="display = true"
    />

    <v-dialog
      v-model="display"
      :width="width"
      persistent
      lazy
      full-width
    >
      <v-card>
        <v-card-text style="padding: 0;">
          <v-date-picker
            v-model="datePart"
            :locale="locale"
            full-width
            scrollable
            actions
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey lighten-1" flat @click.native="clearHandler">{{ clearText }}</v-btn>
          <v-btn color="green darken-1" flat @click="okHandler">{{ okText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from 'moment'

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'

export default {
  name: 'date-picker',
  model: {
    prop: 'date',
    event: 'input',
  },
  props: {
    date: {
      type: [moment, Date, String],
      default: null,
    },
    label: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 320,
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    locale: {
      type: String,
      default: 'en-us',
    },
    clearText: {
      type: String,
      default: 'CLEAR',
    },
    okText: {
      type: String,
      default: 'OK',
    },
  },
  data() {
    return {
      display: false,
      dateSelected: false,
      selectedDate: null,
    }
  },
  computed: {
    formattedDate() {
      return this.date ? moment(this.date).format(this.format) : ''
    },

    datePart: {
      get() {
        let val = this.selectedDate ? moment(this.selectedDate).format(DEFAULT_DATE_FORMAT) : ''
        return val
      },
      set(val) {
        this.dateSelected = true
        this.activeTab = 1

        let date = moment(val, DEFAULT_DATE_FORMAT)
        let input = moment().year(date.year()).month(date.month()).date(date.date())
        this.selectedDate = input.toDate()
      },
    },
  },
  created() {
    if (this.date instanceof Date) {
      this.selectedDate = moment(this.date)
    } else if (this.date instanceof String) {
      this.selectedDate = moment(this.dateString, this.format)
    } else if (this.date instanceof moment) {
      this.selectedDate = this.date
    }
  },
  methods: {
    okHandler() {
      this.display = false

      this.$emit('input', moment(this.selectedDate))
    },
    clearHandler() {
      this.display = false

      this.$emit('input', null)
    },
  },
}
</script>