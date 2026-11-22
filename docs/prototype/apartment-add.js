// Putting yourself on the apartment schedule (doc 14, flow 5). It is always
// accepted; an overlap says who is told about it (doc 05): a life group's
// leader for a meeting, a member himself for his own booking.
import { role, saved } from "./app.js";
import { BOOKINGS, DAYS, MEETINGS, ME, group, space } from "./data.js";
import { clashesWith, minutes, schedule, span, withRole } from "./model.js";

const form = document.getElementById("add");
const day = document.getElementById("day");
const error = document.getElementById("error");

for (const d of DAYS) {
  const o = document.createElement("option");
  o.value = d.iso;
  o.textContent = d.label;
  day.append(o);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(form);
  const b = {
    id: `mine-${Date.now()}`,
    who: ME[role] ?? "You",
    kind: f.get("kind"),
    space: f.get("space"),
    day: f.get("day"),
    start: f.get("start"),
    end: f.get("end"),
  };

  if (!b.start || !b.end || minutes(b.end) <= minutes(b.start)) {
    error.textContent = "Choose an end time after the start time.";
    error.hidden = false;
    return;
  }
  error.hidden = true;

  const removed = saved.get("removed") ?? [];
  const mine = saved.get("bookings") ?? [];
  const before = schedule(MEETINGS, DAYS, [...BOOKINGS, ...mine].filter((x) => !removed.includes(x.id)));
  saved.set("bookings", [...mine, b]);

  const when = DAYS.find((d) => d.iso === b.day).label;
  document.getElementById("added-what").textContent = `${space(b.space).name}, ${when}, ${span(b.start, b.end)}.`;
  document.getElementById("see").setAttribute("href", withRole(`apartment.html#b-${b.id}`, role));

  const told = document.getElementById("told");
  told.replaceChildren();
  for (const o of clashesWith(b, before)) {
    const li = document.createElement("li");
    li.textContent =
      o.kind === "meeting"
        ? `${group(o.group).name} meets there from ${span(o.start, o.end)}. Its leader is told, so you can settle it before the meeting.`
        : `${o.who} is there from ${span(o.start, o.end)}. He is told himself.`;
    told.append(li);
  }

  document.getElementById("overlap").hidden = told.children.length === 0;
  form.hidden = true;
  document.getElementById("added").hidden = false;
});
