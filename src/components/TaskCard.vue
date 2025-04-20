<template>
  <div class="bg-white shadow rounded px-3 pt-2 pb-3 border border-white">
    <!-- <div class="flex mb-2 justify-between items-center">
      <span class="text-sm text-gray-600">{{ task.deadline }}</span>
      <badge v-if="hasType(shadow, task)" :color="badgeColor(shadow, task)">{{
        shadow ? task.type.value : task.type
      }}</badge>
    </div> -->
    <div>
      <p class="text-black font-semibold font-sans tracking-wide text-md">
        {{ task.title }}
      </p>

      <p class="text-gray-700 font-sans tracking-wide text-sm">
        {{ task.description }}
      </p>
    </div>
    <div class="flex mt-2 justify-between items-center">
      <badge v-if="hasType(shadow, task)" :color="badgeColor(shadow, task)">{{
        shadow ? task.type.value : task.type
      }}</badge>
      <badge v-else :color="badgeColor(shadow, task)">Undefined</badge>
      <img
        class="importance-icon"
        :src="
          'assets/importance-scale/' +
          (shadow ? task.importance.value : task.importance) +
          '.png'
        "
      />
      <img
        v-if="hasNoTimeEstimate(shadow, task)"
        class="time-icon"
        src="assets/fun-scale/0.png"
      />
      <span v-else class="text-sm text-gray-600 font-semibold">
        {{ shadow ? task.estimatedTime.value : task.estimatedTime }}&nbsp;<img
          class="time-icon"
          src="assets/time.png"
      /></span>

      <img
        class="fun-icon"
        :src="
          'assets/fun-scale/' + (shadow ? task.fun.value : task.fun) + '.png'
        "
      />
    </div>
  </div>
</template>
<script>
import Badge from "./Badge.vue";
import { inject, onUpdated } from "vue";
export default {
  components: {
    Badge,
  },
  props: {
    task: {
      type: Object,
      default: () => ({}),
    },
    shadow: {
      type: Boolean,
      default: () => false,
    },
  },
  setup() {
    const config = inject("config");
    return { config };
  },
  computed: {},
  methods: {
    badgeColor(shadow, task) {
      // const mappings = {
      //   Work: "green",
      //   Perso: "purple",
      //   Project: "blue",
      //   Admin: "red",
      //   default: "teal",
      // };
      const type = shadow ? task.type.value : task.type;
      return this.config.labels[type] || this.config.labels.default;
    },
    hasType(shadow, task) {
      return shadow ? task.type.value != "" : task.type != "";
    },
    hasNoTimeEstimate(shadow, task) {
      return shadow ? task.estimatedTime.value < 0 : task.estimatedTime < 0;
    },
  },
};
</script>
<style scoped>
.importance-icon,
.time-icon,
.fun-icon {
  height: 20px;
  display: inline-block;
}
</style>
