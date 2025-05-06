<template>
  <div class="container flex flex-col justify-center items-center">
    <p class="py-3">
      You have <span class="font-bold">{{ pendingMainTasks }}</span> pending
      tasks, detailled in
      <span class="font-bold">{{ pendingSubTasks }}</span> subtasks.
    </p>
    <p class="py-3">
      There is
      <span class="font-bold">{{ workTimeUnitRemaining }}</span> time units to
      be tackled before the end of the week (<span class="font-bold">{{
        weekTimeRemaining
      }}</span>
      remaining)
    </p>
    <div class="w-full py-3">
      <canvas id="perf-chart"></canvas>
    </div>
    <div class="flex w-full py-3 justify-center">
      <button
        type="button"
        @click="archiveTasks()"
        class="mt-3 inline-flex rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-purple-500"
      >
        Archive finished tasks
      </button>
    </div>
  </div>
</template>

<script>
import { inject, computed, onMounted } from "vue";
export default {
  name: "Dashboard",
  components: {},
  emits: ["update-tasks"],
  setup() {
    const tasks = inject("tasks");

    const pendingMainTasks = computed(() => {
      return tasks.value.filter(
        (task) =>
          task.parent == undefined &&
          !["Done", "Archived"].includes(task.status)
      ).length;
    });

    const pendingSubTasks = computed(() => {
      return tasks.value.filter(
        (task) =>
          task.parent != undefined &&
          !["Done", "Archived"].includes(task.status)
      ).length;
    });

    const workTimeUnitRemaining = computed(() => {
      const plannedForTheWeek = tasks.value.filter((task) =>
        ["Week", "Day", "In Progress"].includes(task.status)
      );
      let timeUnits = 0;
      plannedForTheWeek.forEach((task) => {
        if (task.parent == undefined && task.estimatedTime != -1) {
          let currentProgress = 0;
          if (task.progress.length > 0) {
            currentProgress =
              task.progress[task.progress.length - 1].completion;
          }
          timeUnits += task.estimatedTime * (1 - currentProgress / 100);
        }
      });
      return Math.ceil(timeUnits);
    });

    const weekTimeRemaining = computed(() => {
      const today = new Date();
      const fullDaysRemaining = today.getDay() == 6 ? 0 : 5 - today.getDay();
      const unitRemainingToday =
        Math.max(Math.min(17 - today.getHours(), 8), 0) * 2 +
        (today.getMinutes() < 30 ? 1 : 0);
      const lunchBreakDeduction = today.getHours() > 13 ? 0 : 1;
      return fullDaysRemaining * 16 + unitRemainingToday - lunchBreakDeduction;
    });

    const getDatasets = () => {
      let today = new Date();
      today = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
      );
      const lastWeek = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 7)
      );

      const dataPerDay = [
        {
          label: "Unknown",
          backgroundColor: "#9f58b999",
          data: [0, 0, 0, 0, 0, 0, 0], // => days (Sun to Sat)
        },
        {
          label: "Low",
          backgroundColor: "#5975ba99",
          data: [0, 0, 0, 0, 0, 0, 0], // => days (Sun to Sat)
        },
        {
          label: "Medium",
          backgroundColor: "#7faf4499",
          data: [0, 0, 0, 0, 0, 0, 0], // => days (Sun to Sat)
        },
        {
          label: "High",
          backgroundColor: "#e78f3699",
          data: [0, 0, 0, 0, 0, 0, 0], // => days (Sun to Sat)
        },
        {
          label: "Critical",
          backgroundColor: "#ca181899",
          data: [0, 0, 0, 0, 0, 0, 0], // => days (Sun to Sat)
        },
        {
          label: "Blocking",
          backgroundColor: "#ff040499",
          data: [0, 0, 0, 0, 0, 0, 0], // => days (Sun to Sat)
        },
      ];
      tasks.value.forEach((task) => {
        const progressLastWeek = task.progress.filter(
          (p) =>
            p.timestamp > lastWeek.toISOString() &&
            p.timestamp < today.toISOString() &&
            !p.fromChild
        );
        progressLastWeek.forEach((progress) => {
          const perf = progress.sessionPerfRate;
          const expected = 100 / task.estimatedTime;
          const outIndex =
            (new Date(progress.timestamp).getDay() + 7 - today.getDay()) % 7;
          const distToPerf = perf / expected - 1;
          dataPerDay[task.importance]["data"][outIndex] += distToPerf;
        });
      });
      return dataPerDay;
    };

    const showChart = () => {
      const chart = document.getElementById("perf-chart");

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const labels = [];
      for (let i = 0; i < 7; i++) {
        const dayIndex = (today.getDay() + i) % 7;
        labels.push(days[dayIndex]);
      }

      new Chart(chart, {
        type: "bar",
        data: {
          labels: labels,
          datasets: getDatasets(),
        },
        options: {
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
        },
      });
    };

    onMounted(() => {
      showChart();
    });

    return {
      tasks,
      pendingMainTasks,
      pendingSubTasks,
      workTimeUnitRemaining,
      weekTimeRemaining,
    };
  },
  methods: {
    archiveTasks() {
      if (!confirm("Are you sure you want to archive finished tasks ?")) {
        return;
      }
      let nbArchived = 0;
      this.tasks
        .filter((t) => t.status == "Done")
        .forEach((task) => {
          if (task.progress.length > 0) {
            const completionLevel =
              task.progress[task.progress.length - 1].completion;
            if (completionLevel >= 100) {
              nbArchived += 1;
              task.status = "Archived";
            }
          }
        });
      this.$emit("update-tasks");
      alert(nbArchived + " tasks archived");
    },
  },
};
</script>

<style scoped></style>
