<!-- Html -->
<template>
  <div class="container flex flex-col justify-center items-center">
    <div class="flex flex-row w-full justify-around mt-2">
      <p class="font-bold inline-block">
        You have {{ pendingTasks }} pending tasks
      </p>
      <button
        type="button"
        class="inline-flex justify-center rounded-md bg-blue-600 px-2 py-1 text-sm font-semibold text-white hover:bg-blue-500"
        @click="openTaskModal(undefined)"
      >
        Add task
      </button>
    </div>
    <div class="my-3 w-1/2">
      <div class="">
        <div
          :class="
            'flex flex-col rounded-xl item-card mt-2 ml-' + 8 * task.nesting
          "
          v-for="task in sortedTasks()"
          :key="task.id"
        >
          <div class="flex flex-col px-3 py-0 my-auto">
            <div class="flex justify-between items-center h-full">
              <div>
                <button
                  type="button"
                  class="inline-flex text-lg justify-center rounded-3xl bg-blue-600 px-1 py-0 text-sm font-semibold text-white hover:bg-blue-500"
                  @click="openTaskModal(task)"
                >
                  +
                </button>
              </div>
              <div>
                <p class="font-semibold text-center px-2">{{ task.title }}</p>
              </div>
              <div>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md bg-red-600 px-2 py-1 text-sm font-semibold text-white hover:bg-red-500"
                  @click="deleteTask(task)"
                >
                  X
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      id="taskModal"
      ref="taskModal"
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
                >
                  Create new task
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500" ref="taskModalText">
                    intro text
                  </p>
                  <div
                    class="d-flex flex-column flex-sm-row justify-content-between mt-3 mt-sm-5"
                  >
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Title"
                      v-model="newTitle"
                    />
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Description"
                      v-model="newDescription"
                    />
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Deadline"
                      v-model="newDeadline"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      ref="subtaskProportion"
                      class="form-control hidden"
                      placeholder="Proportion"
                      v-model="newProportion"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              class="bg-gray-50 flex flex-row-reverse px-6 pb-4 justify-between"
            >
              <button
                type="button"
                @click="addTask()"
                class="mt-3 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
              >
                Add
              </button>
              <button
                type="button"
                @click="closeTaskModal()"
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
<!-- Javascript -->
<script>
import { ref, onMounted, computed, watch, inject } from "vue";
import { Task } from "../datastructures/task.js";
import { Subtask } from "../datastructures/subtask.js";

export default {
  name: "TODOList",
  emits: ["update-tasks"],
  setup(props, ctx) {
    const newTitle = ref("");
    const newDescription = ref("");
    const newDeadline = ref("");
    const newProportion = ref(0);

    const tasks = inject("tasks");
    const config = inject("config");

    let parentTask = undefined;

    const deleteTask = (task) => {
      const index = tasks.value.indexOf(task);
      const removedTask = tasks.value.splice(index, 1)[0];
      if (removedTask.parent !== undefined) {
        removedTask.parent.children = removedTask.parent.children.filter(
          (e) => e.subtask.id != removedTask.id
        );
      }
      if (removedTask.children.length > 0) {
        removedTask.children.forEach((subtask) => {
          subtask.parent = undefined;
          subtask.subtask.parent = undefined;
          deleteTask(subtask.subtask);
          subtask.subtask = undefined;
        });
        removedTask.children = [];
      }
      ctx.emit("update-tasks");
    };

    const pendingTasks = computed(() => {
      return config.value
        .activeTasksFilter(tasks.value)
        .filter((x) => x.status !== "Done").length;
    });

    onMounted(() => {
      //   const maintasks = inject("tasks");
      //   tasks.value = maintasks.value;
      //   if (localStorage.tasks) {
      //     tasks.value = JSON.parse(localStorage.getItem("tasks")) || [];
      //   }
      //   console.log(tasks);
    });

    return {
      newTitle,
      newDescription,
      newDeadline,
      newProportion,
      tasks,
      config,
      deleteTask,
      pendingTasks,
    };
  },
  methods: {
    addTask() {
      if (!this.newTitle) return;
      const newTask = new Task(
        this.tasks.length,
        this.newTitle,
        this.newDescription,
        this.newDeadline
      );

      if (this.parentTask !== undefined) {
        const subtask = new Subtask(
          this.parentTask,
          newTask,
          parseInt(this.newProportion)
        );
        newTask.parent = this.parentTask;
        this.parentTask.children.push(subtask);
      }

      this.tasks.push(newTask);
      this.$refs.taskModal.classList.add("hidden");
      this.newTitle = "";
      this.newDescription = "";
      this.newDeadline = "";
      this.$emit("update-tasks");
    },
    openTaskModal(selectedTask) {
      this.parentTask = selectedTask;
      if (this.parentTask == undefined) {
        this.$refs.taskModalText.innerText = "Creation of a new main task";
      } else {
        this.$refs.taskModalText.innerText =
          "Creation of a new sub task for : " + this.parentTask.title;
        this.$refs.subtaskProportion.classList.remove("hidden");
      }

      this.$refs.taskModal.classList.remove("hidden");
    },
    closeTaskModal() {
      this.parentTask = undefined;
      this.newTitle = "";
      this.newDescription = "";
      this.newDeadline = "";
      this.$refs.taskModal.classList.add("hidden");
      this.$refs.subtaskProportion.classList.add("hidden");
    },
    sortedTasks() {
      let out = [];

      const childTree = (task, nesting) => {
        let res = [];
        res.push(task);
        task.nesting = nesting;
        task.children.forEach((child) => {
          res = res.concat(childTree(child.subtask, nesting + 1));
        });
        return res;
      };

      this.config.activeTasksFilter(this.tasks).forEach((task) => {
        if (task.parent == undefined) {
          out = out.concat(childTree(task, 0));
        }
      });

      return out;
    },
  },
};
</script>
<!-- Css -->
<style scoped>
.card-body h1 {
  color: #a813ff;
}

.message {
  color: green;
  font-weight: bold;
}

.item-card {
  height: 40px;
  background-color: #440c7e;
  color: #fff;
}

.overlay {
  background-color: rgba(160, 174, 192, 0.75);
}
</style>
