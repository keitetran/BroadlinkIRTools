import Vue from "vue";
import Vuex from "vuex";
import config from "./config";
Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    socket: undefined,
    socketId: 70,
    socketStatus: config.socketStatus.notConnect,
    socketMsgs: undefined,

    hassInfo: undefined
  }
});

export default store;