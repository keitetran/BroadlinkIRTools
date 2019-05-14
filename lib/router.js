import Vue from "vue";
import Router from "vue-router";

import home from "pages/home.vue";
import climate from "pages/climate/climate.vue";
import fan from "pages/fan/fan.vue";
import media from "pages/media/media.vue";
import other from "pages/other/other.vue";

Vue.use(Router);

const routes = [{
  path: "/",
  component: home
}, {
  path: "/climate",
  component: climate
}, {
  path: "/fan",
  component: fan
}, {
  path: "/media",
  component: media
}, {
  path: "/other",
  component: other
}];

export default new Router({
  routes
});