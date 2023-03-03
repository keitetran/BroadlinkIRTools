import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import config from "./config";

const vuexPersistence = new VuexPersistence({
  reducer: (state) => {
    const { socket, socketId, socketStatus, socketMsgs, ...remainingState } = state;
    return remainingState;
  }
});

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    socket: undefined,
    socketId: 0,
    socketStatus: config.socketStatus.notConnect,
    socketMsgs: undefined,

    hassInfo: undefined
  },
  mutations: {
    ...generateMutations(["socket", "socketId", "socketStatus", "socketMsgs", "hassInfo"])
  },
  plugins: [vuexPersistence.plugin]
});

function generateMutations(stateNames) {
  return Object.fromEntries(
    stateNames.map(
      stateName => [
        stateName,
        (state, newValue) => { state[stateName] = newValue; }
      ]
    )
  );
}

export default store;