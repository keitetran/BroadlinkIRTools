import Vue from "vue";
import router from "../lib/router";
import app from "./app";
import store from "../lib/store";
import helper from "../lib/helper";
import config from "../lib/config";
import swal from "sweetalert";

import VeeValidate from "vee-validate";
Vue.use(VeeValidate);

window.alert = function (_msg) {
  return swal(_msg);
};

Vue.prototype.$helper = helper;
Vue.prototype.$config = config;

/* eslint-disable-next-line no-new */
new Vue({
  el: "#app",
  router,
  store,
  render: r => r(app)
});