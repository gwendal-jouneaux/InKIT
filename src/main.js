import Vue from "vue";
import App from "./App.vue";
import vuetify from "vuetify";
import VueDragula from "vue-dragula";

Vue.config.productionTip = false;
Vue.use(VueDragula);

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
