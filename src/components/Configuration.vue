<template>
  <div class="container flex flex-col justify-center items-center pt-2">
    <h2 class="font-semibold text-xl mt-4">Create, Update and Delete Tags</h2>
    <div class="flex flex-row w-full justify-around">
      <div class="flex">
        <badge
          v-for="(color, label) in config.labels"
          :color="color"
          class="my-2 mx-1"
          >{{ label == "" ? "Undefined" : label }}</badge
        >
      </div>
      <div class="flex flex-col">
        <input
          type="text"
          class="form-control mt-3"
          placeholder="Tag name"
          v-model="tagField"
        />
        <input
          type="text"
          class="form-control mt-3"
          placeholder="Color"
          v-model="colorField"
        />
        <div class="flex justify-between">
          <button
            type="button"
            class="mt-3 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
            @click="saveTag()"
          >
            Save
          </button>
          <button
            type="button"
            class="mt-3 inline-flex rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-500"
            @click="deleteTag()"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <h2 class="font-semibold text-xl mt-4">Selection of active Tags</h2>
    <div class="flex">
      <badge
        v-for="(color, label) in config.labels"
        :key="label"
        :color="config.activeLabels.includes(label) ? color : 'gray'"
        class="cursor-pointer my-2 mx-1"
        @click.native="toggleLabel(label)"
        >{{ label == "" ? "Undefined" : label }}</badge
      >
    </div>
  </div>
</template>

<script>
import { inject, ref } from "vue";
import Badge from "./Badge.vue";
export default {
  name: "Configuration",
  components: {
    Badge,
  },
  emits: ["update-config"],
  setup() {
    const config = inject("config");

    const tagField = ref("");
    const colorField = ref("");

    return { config, tagField, colorField };
  },
  methods: {
    toggleLabel(label) {
      if (this.config.activeLabels.includes(label)) {
        this.config.activeLabels = this.config.activeLabels.filter(
          (l) => l != label
        );
      } else {
        this.config.activeLabels.push(label);
      }
      this.$emit("update-config");
    },
    saveTag() {
      this.config.labels[this.tagField] = this.colorField;
      this.config.activeLabels.push(this.tagField);
      this.$emit("update-config");
    },
    deleteTag() {
      if (this.tagField == "" || this.tagField == "default") return;
      this.config.labels[this.tagField] = this.colorField;
      this.$emit("update-config");
    },
  },
};
</script>

<style scoped></style>
