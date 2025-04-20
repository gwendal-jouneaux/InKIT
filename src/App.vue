<template>
  <div id="app">
    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <button
          class="nav-link active"
          id="nav-home-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-home"
          type="button"
          role="tab"
          aria-controls="nav-home"
          aria-selected="true"
        >
          Home
        </button>
        <button
          class="nav-link"
          id="nav-todo-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-todo"
          type="button"
          role="tab"
          aria-controls="nav-todo"
          aria-selected="true"
        >
          TODO List
        </button>
        <button
          class="nav-link"
          id="nav-planning-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-planning"
          type="button"
          role="tab"
          aria-controls="nav-planning"
          aria-selected="false"
        >
          Planning
        </button>
        <button
          class="nav-link"
          id="nav-kanban-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-kanban"
          type="button"
          role="tab"
          aria-controls="nav-kanban"
          aria-selected="false"
        >
          Kanban
        </button>
        <button
          class="nav-link"
          id="nav-agenda-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-agenda"
          type="button"
          role="tab"
          aria-controls="nav-agenda"
          aria-selected="false"
        >
          Agenda
        </button>
        <button
          class="nav-link ml-auto"
          id="nav-config-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-config"
          type="button"
          role="tab"
          aria-controls="nav-config"
          aria-selected="false"
        >
          Configuration
        </button>
      </div>
    </nav>
    <div class="tab-content" id="nav-tabContent">
      <div
        class="tab-pane fade show active"
        id="nav-home"
        role="tabpanel"
        aria-labelledby="nav-home-tab"
      >
        <div class="container flex p-2 items-center">
          <div
            id="dayview-container"
            class="flex w-1/3 overflow-y-scroll no-scrollbar"
          >
            <day-view ref="dayview" />
          </div>
          <div class="flex w-2/3 pl-8"><dashboard /></div>
        </div>
      </div>
      <div
        class="tab-pane fade show"
        id="nav-todo"
        role="tabpanel"
        aria-labelledby="nav-todo-tab"
      >
        <todo-list @update-tasks="updateTasks"></todo-list>
      </div>
      <div
        class="tab-pane fade"
        id="nav-planning"
        role="tabpanel"
        aria-labelledby="nav-planning-tab"
      >
        <planner @update-tasks="updateTasks"></planner>
      </div>
      <div
        class="tab-pane fade"
        id="nav-kanban"
        role="tabpanel"
        aria-labelledby="nav-kanban-tab"
      >
        <board @update-tasks="updateTasks"></board>
      </div>
      <div
        class="tab-pane fade"
        id="nav-agenda"
        role="tabpanel"
        aria-labelledby="nav-agenda-tab"
      >
        <agenda @update-agenda="saveAgenda" />
      </div>
      <div
        class="tab-pane fade"
        id="nav-config"
        role="tabpanel"
        aria-labelledby="nav-config-tab"
      >
        <configuration @update-config="saveConfig" />
      </div>
    </div>
  </div>
</template>

<script>
import Dashboard from "./components/Dashboard.vue";
import TodoList from "./components/TodoList.vue";
import Planner from "./components/Planner.vue";
import Board from "./components/Board.vue";
import Agenda from "./components/Agenda.vue";
import DayView from "./components/DayView.vue";
import Configuration from "./components/Configuration.vue";
import { Task } from "./datastructures/task.js";
import { Config } from "./datastructures/config.js";
import "./cycle.js";
import "./slimscroll.js";
import { provide, ref, onMounted } from "vue";
export default {
  name: "App",
  components: {
    Dashboard,
    TodoList,
    Planner,
    Board,
    Agenda,
    DayView,
    Configuration,
  },
  setup() {
    const tasks = ref([]);
    provide("tasks", tasks);

    const agenda = ref({});
    provide("agenda", agenda);

    const config = ref(new Config());
    provide("config", config);

    if (localStorage.tasks) {
      tasks.value =
        JSON.retrocycle(JSON.parse(localStorage.getItem("tasks"))) || tasks;
    }
    if (localStorage.agenda) {
      agenda.value =
        JSON.retrocycle(JSON.parse(localStorage.getItem("agenda"))) || agenda;
    }
    if (localStorage.config) {
      const saved = JSON.retrocycle(JSON.parse(localStorage.getItem("config")));
      config.value.labels = saved.labels;
      config.value.activeLabels = saved.activeLabels;
    }

    const updateTasks = () => {
      if (tasks.length < 1) {
        localStorage.removeItem("tasks");
      } else {
        localStorage.setItem(
          "tasks",
          JSON.stringify(JSON.decycle(tasks.value))
        );
      }
    };

    return { tasks, agenda, config, updateTasks };
  },
  methods: {
    saveAgenda() {
      localStorage.setItem("agenda", JSON.stringify(JSON.decycle(this.agenda)));
      this.$refs.dayview.showAgenda();
    },
    saveConfig() {
      localStorage.setItem("config", JSON.stringify(JSON.decycle(this.config)));
    },
  },
};
</script>

<style scoped>
#dayview-container {
  max-height: calc(100vh - 2rem - 24px - 2px);
  /* viewport height - all padding - nav text - margin to avoid main scroll */
}
</style>
