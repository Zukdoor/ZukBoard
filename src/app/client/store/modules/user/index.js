const state = {
  uid: ''
}

const getters = {

}

const mutations = {
  setUser: (state, user) => {
    state.uid = user.uid
  }
}

const actions = {

}

export default {
  state,
  actions,
  mutations,
  getters
}
