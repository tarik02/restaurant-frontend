export const state = () => ({
  workDialog: false,

  workEnabled: false,
  trackerEnabled: false,
})

export const mutations = {
  showWorkDialog: state => {
    state.workDialog = true
  },

  hideWorkDialog: state => {
    state.workDialog = false
  },

  enableWork: state => {
    state.workEnabled = true
  },

  disableWork: state => {
    state.workEnabled = false
  },

  enableTracker: state => {
    state.trackerEnabled = true
  },

  disableTracker: state => {
    state.trackerEnabled = false
  },
}

export const actions = {

}
