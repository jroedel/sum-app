// Putting yourself on the apartment schedule (doc 14, flow 5). It is always
// accepted. What an overlap means depends on what each booking claims (doc
// 05, model.js outcome): a meeting displaces someone studying, and he is told
// himself; a life group's meeting displaces anything, so a booking over one
// is told to give way; two meetings settle it between them; being there
// where someone studies is only a reminder to keep it quiet.
import { role, saved } from "./app.js";
import { BOOKINGS, DAYS, MEETINGS, ME, group, space } from "./data.js";
import { minutes, outcome, schedule, span, withRole } from "./model.js";

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
  for (const o of before) {
    const what = outcome(b, o);
    if (!what) continue;
    const who = o.kind === "group" ? `The ${group(o.group).name} meeting` : o.who;
    const when = span(o.start, o.end);
    const li = document.createElement("li");
    li.textContent = {
      displaces: `${o.who} is there from ${when}, and your meeting comes first. He is told himself.`,
      "is-displaced":
        o.kind === "group"
          ? `${who} has the room from ${when}, and comes first. Its leader is told, so you can settle it before then.`
          : `${o.who} has the room for a meeting from ${when}, and comes first. He is told, so you can settle it.`,
      level: `${o.who} has the room for a meeting from ${when} too. You are both told, to settle it between you.`,
      quiet: `${o.who} is studying there from ${when}. Keep it quiet.`,
    }[what];
    told.append(li);
  }

  // Sharing a room with someone studying tells nobody; it only reminds.
  const overlap = document.getElementById("overlap");
  const onlyQuiet = before.every((o) => [null, "quiet"].includes(outcome(b, o)));
  overlap.querySelector(".sum-event-title").textContent = onlyQuiet ? "Someone is studying there" : "It overlaps a booking";
  overlap.querySelector(".sum-chip").hidden = onlyQuiet;
  overlap.querySelector("p.muted").hidden = onlyQuiet;
  overlap.hidden = told.children.length === 0;
  form.hidden = true;
  document.getElementById("added").hidden = false;
});
