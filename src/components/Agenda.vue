<template>
  <div id="agenda" class="container flex justify-center items-top">
    <button
      class="font-bold rounded-md bg-gray-300 mt-1 px-2 py-0 hover:bg-gray-400 align-middle"
      style="height: fit-content"
      @click="prevWeek()"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <table class="w-full" role="presentation">
      <tbody>
        <tr>
          <td :key="updateKey" class="w-1/12 text-sm text-center">
            {{ getWeekNumber() }}
          </td>
          <td class="w-5/6">
            <table class="schedule-table w-full">
              <tbody>
                <tr class="header-row">
                  <td
                    v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']"
                    colspan="1"
                    class="header-cells w-1/5 text-center"
                  >
                    {{ day }}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td class="border-r border-solid border-black">
            <table class="w-full">
              <tbody>
                <tr v-for="row in 24" :id="'time-row-' + row">
                  <td
                    v-if="row % 2 == 1"
                    class="bg-gray-200 text-right pr-1 time-slots"
                  >
                    {{ (row - 1) / 2 + 8 }}:00
                  </td>
                  <td v-else class="time-cells time-slots">&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </td>
          <td class="h-full">
            <table class="w-full">
              <tbody>
                <tr v-for="row in 24" :id="'content-row-' + row" role="row">
                  <td
                    v-if="row % 2 == 1"
                    v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']"
                    :id="day + '-' + row"
                    role="gridcell"
                    aria-selected="false"
                    colspan="1"
                    class="w-1/5 bg-gray-200 border-r border-solid border-black work-cells available"
                    @mousedown="startSelection(day, row)"
                    @mouseup="endSelection(day, row)"
                    @mouseenter="updateSelection(day, row)"
                    @mouseleave="clearSelection(day, row)"
                  >
                    <div
                      class="overflow-visible"
                      style="height: 28px"
                      @click="openTimeboxUpdate"
                    ></div>
                  </td>
                  <td
                    v-if="row % 2 == 0"
                    v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']"
                    :id="day + '-' + row"
                    role="gridcell"
                    aria-selected="false"
                    colspan="1"
                    class="w-1/5 border-r border-solid border-black work-cells available"
                    @mousedown="startSelection(day, row)"
                    @mouseup="endSelection(day, row)"
                    @mouseenter="updateSelection(day, row)"
                    @mouseleave="clearSelection(day, row)"
                  >
                    <div
                      class="overflow-visible"
                      style="height: 28px"
                      @click="openTimeboxUpdate"
                    ></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <button
      class="font-bold rounded-md bg-gray-300 mt-1 px-2 py-0 hover:bg-gray-400 align-middle"
      style="height: fit-content"
      @click="nextWeek()"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
    <div
      id="timeboxModal"
      ref="timeboxModal"
      class="relative z-10 hidden"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="fixed inset-0 overlay" aria-hidden="true"></div>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <div
            class="relative overflow-hidden rounded-lg bg-white text-left shadow-xl my-8 w-full mx-8"
          >
            <div class="bg-white px-2 pt-2 pb-1">
              <div class="mt-3 text-center">
                <h3
                  class="text-base font-semibold text-gray-900"
                  id="modal-title"
                  ref="timeboxModalTitle"
                >
                  Task affectation
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500" ref="timeboxModalText">
                    intro text
                  </p>
                  <div id="tasklist">
                    <div
                      class="w-1/4 px-2 inline-block"
                      v-for="task in applicableTasks()"
                    >
                      <task-card
                        :key="task.id"
                        :task="task"
                        class="mt-3 w-full inline-block align-top"
                        @click.native="selectTask(task)"
                      ></task-card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="bg-gray-50 flex flex-row-reverse px-6 pb-4 justify-between"
            >
              <button
                type="button"
                @click="saveTimebox()"
                class="create-timebox mt-3 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
              >
                Save
              </button>
              <button
                type="button"
                @click="closeTimeboxModal()"
                class="create-timebox mt-3 inline-flex rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="deleteTimebox()"
                class="update-timebox hidden mt-3 inline-flex rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-500"
              >
                Delete
              </button>
              <button
                type="button"
                @click="updateTimebox()"
                class="update-timebox hidden mt-3 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
              >
                Update
              </button>
              <button
                type="button"
                @click="closeTimeboxModal()"
                class="update-timebox hidden mt-3 inline-flex rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-white"
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
import { inject, ref, reactive, computed, onMounted } from "vue";
import TaskCard from "./TaskCard.vue";
import { Timebox } from "../datastructures/timebox.js";

export default {
  name: "Agenda",
  components: { TaskCard },
  emits: ["update-agenda"],
  setup(props, ctx) {
    const tasks = inject("tasks");
    const agenda = inject("agenda");
    const config = inject("config");

    let idCounter = 0;
    let currentDay = ref(new Date());

    const updateKey = ref(0);

    const forceRerender = () => {
      updateKey.value += 1;
    };

    const getWeekNumber = () => {
      const d = new Date(
        Date.UTC(
          currentDay.value.getFullYear(),
          currentDay.value.getMonth(),
          currentDay.value.getDate()
        )
      );
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
      return d.getUTCFullYear() + "-W" + weekNo;
    };

    const clearAgenda = () => {
      const cells = document.querySelectorAll("#agenda .bg-red-300");
      cells.forEach((cell) => {
        cell.classList.remove("bg-red-300");
        cell.classList.add("available");
        const div = cell.children[0];
        div.removeAttribute("timebox-id");
        div.innerText = "";
      });
    };

    const getMaxTimeboxID = () => {
      let max = 0;
      Object.entries(agenda.value).forEach((week) => {
        const timeboxes = week[1];
        if (timeboxes == undefined) return;
        timeboxes.forEach((box) => (max = Math.max(max, box.id)));
      });
      return max;
    };

    const showAgenda = () => {
      clearAgenda();
      const weekBoxes = agenda.value[getWeekNumber()];
      if (weekBoxes == undefined) return;
      weekBoxes.forEach((box) => {
        for (let i = box.from; i <= box.to; i++) {
          const elem = document.getElementById(box.day + "-" + i);
          elem.classList.add("bg-red-300");
          elem.classList.remove("available");
          elem.children[0].setAttribute("timebox-id", box.id);
        }
        document.querySelector(
          "#agenda #" + box.day + "-" + box.from + " div"
        ).innerText = box.title;
      });
    };

    const prevWeek = () => {
      currentDay.value.setDate(currentDay.value.getDate() - 7);
      forceRerender();
      showAgenda();
    };
    const nextWeek = () => {
      currentDay.value.setDate(currentDay.value.getDate() + 7);
      forceRerender();
      showAgenda();
    };

    onMounted(() => {
      idCounter = getMaxTimeboxID() + 1;
      showAgenda();
    });

    let selectedTask = undefined;
    let fromDay = "";
    let fromRow = 0;
    let toRow = 0;

    let selectedTimebox = undefined;

    return {
      tasks,
      agenda,
      config,
      idCounter,
      selectedTask,
      selectedTimebox,
      getWeekNumber,
      showAgenda,
      currentDay,
      prevWeek,
      nextWeek,
      updateKey,
    };
  },
  methods: {
    applicableTasks() {
      return this.config
        .activeTasksFilter(this.tasks)
        .filter((t) => ["Week", "Day", "In Progress"].includes(t.status));
    },
    selectTask(task) {
      this.selectedTask = task;
    },
    saveTimebox() {
      const timebox = new Timebox(
        this.idCounter,
        this.getWeekNumber(),
        this.fromDay,
        this.fromRow,
        this.toRow,
        this.selectedTask.title
      );
      this.idCounter++
      if (this.agenda[this.getWeekNumber()] == undefined) {
        this.agenda[this.getWeekNumber()] = [];
      }
      this.fromDay = undefined;
      this.fromRow = undefined;
      this.toRow = undefined;
      this.agenda[this.getWeekNumber()].push(timebox);
      this.selectedTask = undefined;
      this.showAgenda();
      this.$emit("update-agenda");
      this.$refs.timeboxModal.classList.add("hidden");
    },
    openTimeboxUpdate(event) {
      if (!event.target.hasAttribute("timebox-id")) return;
      this.selectedTimebox = this.agenda[this.getWeekNumber()].filter(
        (t) => t.id == event.target.getAttribute("timebox-id")
      )[0];
      const createBtns = document.querySelectorAll("#agenda .create-timebox");
      createBtns.forEach((e) => e.classList.add("hidden"));
      const updateBtns = document.querySelectorAll("#agenda .update-timebox");
      updateBtns.forEach((e) => e.classList.remove("hidden"));
      this.$refs.timeboxModal.classList.remove("hidden");
    },
    updateTimebox() {
      this.selectedTimebox.title = this.selectedTask.title;
      this.selectedTimebox = undefined;
      this.selectedTask = undefined;
      this.$emit("update-agenda");
      this.showAgenda();
      this.$refs.timeboxModal.classList.add("hidden");
    },
    deleteTimebox() {
      this.agenda[this.getWeekNumber()] = this.agenda[
        this.getWeekNumber()
      ].filter((t) => t.id != this.selectedTimebox.id);
      this.selectedTimebox = undefined;
      this.selectedTask = undefined;
      this.$emit("update-agenda");
      this.showAgenda();
      this.$refs.timeboxModal.classList.add("hidden");
    },
    closeTimeboxModal() {
      this.fromDay = undefined;
      this.fromRow = undefined;
      this.toRow = undefined;
      this.selectedTimebox = undefined;
      this.selectedTask = undefined;
      this.$refs.timeboxModal.classList.add("hidden");
    },
    startSelection(day, row) {
      const elem = document.getElementById(day + "-" + row);
      if (!elem.classList.contains("available")) return;

      this.fromDay = day;
      this.fromRow = row;
    },
    endSelection(day, row) {
      if (this.fromDay == undefined || this.fromRow == undefined) return;
      if (this.toRow == undefined) {
        this.toRow = this.fromRow;
      }
      const fromTime =
        Math.floor((this.fromRow - 1) / 2 + 8) +
        (this.fromRow % 2 == 0 ? ":30" : ":00");
      const toTime =
        Math.ceil((this.toRow - 1) / 2 + 8) +
        (this.toRow % 2 == 1 ? ":30" : ":00");

      this.$refs.timeboxModalText.innerText =
        "Select the task for " +
        this.fromDay +
        " from " +
        fromTime +
        " to " +
        toTime;
      const createBtns = document.querySelectorAll("#agenda .create-timebox");
      createBtns.forEach((e) => e.classList.remove("hidden"));
      const updateBtns = document.querySelectorAll("#agenda .update-timebox");
      updateBtns.forEach((e) => e.classList.add("hidden"));
      this.$refs.timeboxModal.classList.remove("hidden");
    },
    updateSelection(day, row) {
      if (this.fromDay == undefined || this.fromRow == undefined) return;
      let blocked = false;
      let lastRow = row;
      for (
        let i = this.fromRow;
        this.fromRow <= row ? i <= row : row <= i;
        this.fromRow <= row ? i++ : i--
      ) {
        const cell = document.getElementById(this.fromDay + "-" + i);
        if (cell.classList.contains("available") && !blocked) {
          cell.classList.add("bg-blue-500");
          lastRow = i;
        } else {
          blocked = true;
        }
      }
      this.toRow = lastRow;
    },
    clearSelection(day, row) {
      if (this.fromDay == undefined || this.fromRow == undefined) return;
      const path = document.querySelectorAll(".work-cells.bg-blue-500");
      for (let i = 0; i < path.length; i++) {
        const cell = path[i];
        cell.classList.remove("bg-blue-500");
      }
    },
  },
};
</script>

<style scoped>
tr[id^="content-row-"],
tr[id*="time-row-"] {
  height: 30px;
}
</style>
