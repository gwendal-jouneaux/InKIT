<template>
  <div id="dayview" class="container flex justify-center items-top">
    <table class="w-full" role="presentation">
      <tbody>
        <tr>
          <td class="w-1/12 text-sm text-center">
            <!-- {{ currentWeek }} -->
          </td>
          <td class="w-5/6">
            <!-- <table class="schedule-table w-full">
              <tbody>
                <tr class="header-row">
                  <td colspan="1" class="header-cells w-1/5 text-center">
                    {{ currentDay }}
                  </td>
                </tr>
              </tbody>
            </table> -->
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
                    :id="'dv-' + currentDay + '-' + row"
                    role="gridcell"
                    aria-selected="false"
                    colspan="1"
                    class="w-1/5 bg-gray-200 border-r border-solid border-black work-cells available"
                  >
                    <div class="overflow-visible" style="height: 28px"></div>
                  </td>
                  <td
                    v-if="row % 2 == 0"
                    :id="'dv-' + currentDay + '-' + row"
                    role="gridcell"
                    aria-selected="false"
                    colspan="1"
                    class="w-1/5 border-r border-solid border-black work-cells available"
                  >
                    <div class="overflow-visible" style="height: 28px"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { inject, onMounted } from "vue";

export default {
  name: "Agenda",
  setup(props, ctx) {
    const agenda = inject("agenda");
    const currentDate = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = days[currentDate.getDay()];

    const d = new Date(
      Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      )
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    const currentWeek = d.getUTCFullYear() + "-W" + weekNo;

    const clearAgenda = () => {
      const cells = document.querySelectorAll("#dayview .bg-red-300");
      cells.forEach((cell) => {
        cell.classList.remove("bg-red-300");
        cell.classList.add("available");
        const div = cell.children[0];
        div.removeAttribute("timebox-id");
        div.innerText = "";
      });
    };

    const showAgenda = () => {
      clearAgenda();
      const weekBoxes = agenda.value[currentWeek];
      if (weekBoxes == undefined) return;
      weekBoxes.forEach((box) => {
        for (let i = box.from; i <= box.to; i++) {
          const elem = document.getElementById("dv-" + box.day + "-" + i);
          if (elem == undefined) continue;
          elem.classList.add("bg-red-300");
          elem.classList.remove("available");
          elem.children[0].setAttribute("timebox-id", box.id);
        }

        if (box.day != currentDay) return;
        document.querySelector(
          "#dayview #dv-" + box.day + "-" + box.from + " div"
        ).innerText = box.title;
      });
    };

    onMounted(() => {
      showAgenda();
    });

    return {
      agenda,
      showAgenda,
      currentWeek,
      currentDay,
    };
  },
  methods: {},
};
</script>

<style scoped>
tr[id^="content-row-"],
tr[id*="time-row-"] {
  height: 30px;
}
</style>
