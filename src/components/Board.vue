<template>
  <div class="flex justify-center flex-col">
    <div class="bg-gray-200 rounded-lg pt-3 rounded mx-4 my-2">
      <!-- <p
        class="text-gray-700 pl-3 font-semibold font-sans tracking-wide text-sm"
      >
        To Do
      </p> -->
      <!-- Each element from here will be draggable and animated. Note :key is very important here to be unique both for draggable and animations to be smooth & consistent. -->
      <div
        id="todo-row"
        class="w-full column-drag px-2 pb-4 flex flex-row overflow-x-scroll"
        v-dragula="getTasksFor('To Do')"
        bag="column-bag"
        status="To Do"
      >
        <task-card
          v-for="task in getTasksFor('To Do')"
          :key="task.id"
          :task="task"
          class="cursor-move"
          @dblclick.native="editProgress(task)"
        ></task-card>
      </div>
    </div>
    <div class="min-h-screen flex overflow-x-scroll my-2 mx-2">
      <div
        v-for="column in columns"
        class="bg-gray-200 rounded-lg px-3 py-3 w-1/4 rounded mx-2"
      >
        <p class="text-gray-700 font-semibold font-sans tracking-wide text-sm">
          {{ column }}
        </p>
        <!-- Each element from here will be draggable and animated. Note :key is very important here to be unique both for draggable and animations to be smooth & consistent. -->
        <div
          class="container column-drag"
          v-dragula="getTasksFor(column)"
          bag="column-bag"
          :status="column"
        >
          <task-card
            v-for="task in getTasksFor(column)"
            :key="task.id"
            :task="task"
            class="mt-3 cursor-move"
            @dblclick.native="editProgress(task)"
          ></task-card>
        </div>
      </div>
    </div>
    <div
      id="progressModal"
      ref="progressModal"
      class="relative z-10 hidden"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="fixed inset-0 overlay" aria-hidden="true"></div>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <div
            class="relative overflow-hidden rounded-lg bg-white text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg"
          >
            <div class="bg-white px-2 pt-2 pb-1 sm:p-6 sm:pb-4">
              <div class="mt-3 text-center sm:mt-0 sm:text-left">
                <h3
                  class="text-base font-semibold text-gray-900"
                  id="modal-title"
                  ref="progressModalTitle"
                >
                  Modal Title
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500" ref="progressModalText">
                    intro text
                  </p>
                  <input
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="Time unit spent"
                    v-model="timeSpent"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    class="form-control"
                    placeholder="Current task completion"
                    v-model="currentCompletion"
                  />
                </div>
              </div>
            </div>
            <div
              class="bg-gray-50 flex flex-row-reverse px-6 pb-4 justify-between"
            >
              <button
                type="button"
                @click="saveProgress()"
                class="mt-3 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
              >
                Save
              </button>
              <button
                type="button"
                @click="closeProgressModal()"
                class="mt-3 inline-flex rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dragula from "vue-dragula";
import TaskCard from "./TaskCard.vue";
import { Progress } from "../datastructures/progress.js";
import { inject, ref } from "vue";
import Vue from "vue";
export default {
  name: "Board",
  components: {
    TaskCard,
  },
  emits: ["update-tasks"],
  setup(props, { emit }) {
    const tasks = inject("tasks");
    const config = inject("config");
    const columns = ["Week", "Day", "In Progress", "Done"];

    Vue.vueDragula.eventBus.$on("drop", function (args) {
      const task = args[1].__vue__.task;
      const newStatus = args[2].getAttribute("status");
      task.status = newStatus;
      emit("update-tasks");
    });

    const timeSpent = ref(0);
    const currentCompletion = ref(0);
    let editedTask = undefined;

    return { tasks, config, columns, timeSpent, currentCompletion };
  },
  methods: {
    getTasksFor(status) {
      return this.config
        .activeTasksFilter(this.tasks)
        .filter((t) => t.status == status);
    },
    editProgress(task) {
      this.editedTask = task;
      this.$refs.progressModalTitle.innerText = "Progress for: " + task.title;
      let progressList = this.editedTask.progress;
      if (progressList.length < 1) {
        this.$refs.progressModalText.innerText =
          "You did not record progress for this task yet.";
      } else {
        const previousProgress = progressList[progressList.length - 1];
        this.$refs.progressModalText.innerText =
          "Last time you registered a progress of " +
          previousProgress.completion +
          "% after " +
          previousProgress.totalTime +
          " time units spent";
        this.currentCompletion = previousProgress.completion;
      }
      this.$refs.progressModal.classList.remove("hidden");
    },
    saveProgress() {
      // create Progress object and add it to the task
      let progressList = this.editedTask.progress;
      let progress = undefined;
      const timeSpent = parseInt(this.timeSpent);
      const completion = parseInt(this.currentCompletion);
      if (progressList.length < 1) {
        progress = new Progress(undefined, timeSpent, completion);
      } else {
        const previousProgress = progressList[progressList.length - 1];
        progress = new Progress(previousProgress, timeSpent, completion);
      }
      this.editedTask.progress.push(progress);

      // update status if necessary
      if (completion == 100) {
        this.editedTask.status = "Done";
      }

      // update parents progress
      let parent = this.editedTask.parent;
      let childID = this.editedTask.id;
      let weightedCompletion = progress.sessionCompletion;
      // Upward traversal
      while (parent !== undefined) {
        // compute parent completion delta based on subtask weight
        const subtask = parent.children.filter(
          (child) => child.subtask.id == childID
        )[0];
        weightedCompletion = (subtask.proportion / 100) * weightedCompletion;

        // create parent Progress object and add it to the parent
        const previousParentProgress =
          parent.progress.length > 0
            ? parent.progress[parent.progress.length - 1]
            : undefined;

        const parentProgress = new Progress(
          previousParentProgress,
          progress.duration,
          (previousParentProgress ? previousParentProgress.completion : 0) +
            weightedCompletion
        );
        parentProgress.fromChild = true;
        parent.progress.push(parentProgress);

        // update status if necessary
        if (parentProgress.completion == 100) {
          parent.status = "Done";
        }

        // rise one step in the hierarchy for the loop
        childID = parent.id;
        parent = parent.parent;
      }
      this.$emit("update-tasks");
      this.$refs.progressModal.classList.add("hidden");
    },
    closeProgressModal() {
      this.$refs.progressModal.classList.add("hidden");
    },
  },
};
</script>

<style scoped>
.column-width {
  min-width: 320px;
  width: 320px;
}
.column-drag {
  height: 95%;
}
#todo-row > div {
  width: calc(100% / 6 - 1rem);
  flex-shrink: 0;
  margin-right: 0.5rem !important;
  margin-left: 0.5rem !important;
}
/* Unfortunately @apply cannot be setup in codesandbox, 
but you'd use "@apply border opacity-50 border-blue-500 bg-gray-200" here */
.ghost-card {
  opacity: 0.5;
  background: #f7fafc;
  border: 1px solid #4299e1;
}
.overlay {
  background-color: rgba(160, 174, 192, 0.75);
}
</style>
