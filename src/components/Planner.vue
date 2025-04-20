<template>
  <div>
    <div class="flex justify-center my-2">
      <div id="shadow-card" class="w-1/3 my-auto">
        <task-card
          :task="shadowTask"
          :shadow="true"
          class="mt-3 card"
        ></task-card>
      </div>
      <div class="flex justify-center mx-32">
        <button
          type="button"
          class="my-auto rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
          @click="savePlan"
        >
          Save
        </button>
      </div>
      <div id="planner-form" class="w-1/3">
        <div>
          <input
            type="text"
            class="form-control"
            placeholder="Type"
            v-model="newType"
          />
        </div>
        <div class="flex justify-between my-2">
          <input type="radio" name="importance" id="importance-1" value="1" />
          <label for="importance-1">
            <img
              src="assets/importance-scale/1.png"
              @click="newImportance = 1"
            />
          </label>
          <input type="radio" name="importance" id="importance-2" value="2" />
          <label for="importance-2">
            <img
              src="assets/importance-scale/2.png"
              @click="newImportance = 2"
            />
          </label>
          <input type="radio" name="importance" id="importance-3" value="3" />
          <label for="importance-3">
            <img
              src="assets/importance-scale/3.png"
              @click="newImportance = 3"
            />
          </label>
          <input type="radio" name="importance" id="importance-4" value="4" />
          <label for="importance-4">
            <img
              src="assets/importance-scale/4.png"
              @click="newImportance = 4"
            />
          </label>
          <input type="radio" name="importance" id="importance-5" value="5" />
          <label for="importance-5">
            <img
              src="assets/importance-scale/5.png"
              @click="newImportance = 5"
            />
          </label>
        </div>
        <div class="flex justify-between my-2">
          <input type="radio" name="fun" id="fun-1" value="1" />
          <label for="fun-1">
            <img src="assets/fun-scale/1.png" @click="newFun = 1" />
          </label>
          <input type="radio" name="fun" id="fun-2" value="2" />
          <label for="fun-2">
            <img src="assets/fun-scale/2.png" @click="newFun = 2" />
          </label>
          <input type="radio" name="fun" id="fun-3" value="3" />
          <label for="fun-3">
            <img src="assets/fun-scale/3.png" @click="newFun = 3" />
          </label>
          <input type="radio" name="fun" id="fun-4" value="4" />
          <label for="fun-4">
            <img src="assets/fun-scale/4.png" @click="newFun = 4" />
          </label>
          <input type="radio" name="fun" id="fun-5" value="5" />
          <label for="fun-5">
            <img src="assets/fun-scale/5.png" @click="newFun = 5" />
          </label>
        </div>
        <!-- <rating :field="newFun" name="fun"></rating> -->
        <div>
          <input
            type="number"
            min="-1"
            class="form-control"
            placeholder="Estimated Time"
            v-model="newEstimatedTime"
          />
        </div>
      </div>
    </div>
    <div id="tasklistPlanner">
      <div class="w-1/4 px-2 inline-block" v-for="task in sortedTasks()">
        <task-card
          :key="task.id"
          :task="task"
          class="mt-3 w-full inline-block align-top"
          @click.native="selectTask(task)"
        ></task-card>
      </div>
    </div>
  </div>
</template>

<script>
import TaskCard from "./TaskCard.vue";
import { Task } from "../datastructures/task.js";
import { inject, ref } from "vue";
export default {
  name: "Planner",
  components: {
    TaskCard,
  },
  emits: ["update-tasks"],
  setup() {
    const tasks = inject("tasks");
    const config = inject("config");

    const newType = ref("");
    const newImportance = ref(0);
    const newFun = ref(0);
    const newEstimatedTime = ref(-1);

    const shadowTask = new Task(-1, "Title", "Description", "Deadline");
    shadowTask.type = newType;
    shadowTask.importance = newImportance;
    shadowTask.fun = newFun;
    shadowTask.estimatedTime = newEstimatedTime;

    var selectedTask = undefined;

    return {
      tasks,
      config,
      shadowTask,
      newType,
      newImportance,
      newFun,
      newEstimatedTime,
      selectedTask,
    };
  },
  methods: {
    savePlan() {
      if (this.selectedTask == undefined) return;
      this.selectedTask.type = this.newType;
      this.selectedTask.importance = this.newImportance;
      this.selectedTask.fun = this.newFun;
      this.selectedTask.estimatedTime = parseInt(this.newEstimatedTime);
      this.$emit("update-tasks");
    },
    selectTask(task) {
      this.selectedTask = task;
      this.newType = this.selectedTask.type;
      this.newEstimatedTime = parseInt(this.selectedTask.estimatedTime);

      const checked = document.querySelectorAll("input[type=radio]:checked");
      for (let i = 0; i < checked.length; i++) {
        checked[i].checked = false;
      }

      this.newImportance = this.selectedTask.importance;
      if (this.selectedTask.importance != 0) {
        document.getElementById(
          "importance-" + this.selectedTask.importance
        ).checked = true;
      } else {
      }

      this.newFun = this.selectedTask.fun;
      if (this.selectedTask.fun != 0) {
        document.getElementById("fun-" + this.selectedTask.fun).checked = true;
      } else {
      }

      this.shadowTask.title = this.selectedTask.title;
      this.shadowTask.description = this.selectedTask.description;
      this.shadowTask.deadline = this.selectedTask.deadline;
    },
    sortedTasks() {
      const taskPlanningCompare = (taskA, taskB) => {
        let A = taskA.type == "" ? 1 : 0;
        A += taskA.importance == 0 ? 1 : 0;
        A += taskA.fun == 0 ? 1 : 0;
        A += taskA.estimatedTime == -1 ? 1 : 0;

        let B = taskB.type == "" ? 1 : 0;
        B += taskB.importance == 0 ? 1 : 0;
        B += taskB.fun == 0 ? 1 : 0;
        B += taskB.estimatedTime == -1 ? 1 : 0;

        return B - A;
      };
      const out = this.config.activeTasksFilter(this.tasks);
      out.sort(taskPlanningCompare);
      return out;
    },
  },
};
</script>

<style scoped>
img {
  height: 30px;
  margin: 5px;
  opacity: 0.25;
}

input[type="radio"] {
  display: none;
}

img:hover {
  opacity: 0.6;
  cursor: pointer;
}

img:active {
  cursor: pointer;
  opacity: 1;
}

input[type="radio"]:checked + label > img {
  /* border: 1px solid rgb(228, 207, 94); */
  opacity: 1;
}
</style>
