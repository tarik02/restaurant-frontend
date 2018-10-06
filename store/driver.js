export const state = () => ({
  trackerEnabling: false,
  trackerEnabled: false,
})

export const mutations = {
  enablingTracker: state => {
    state.trackerEnabling = true
    state.trackerEnabled = false
  },

  enableTracker: state => {
    state.trackerEnabling = false
    state.trackerEnabled = true
  },

  disableTracker: state => {
    state.trackerEnabling = false
    state.trackerEnabled = false
  },
}

export const actions = {

}
