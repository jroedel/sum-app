// The apartment schedule (doc 14, flow 5): the next two weeks, with the life
// group meetings already on it, and the members' own bookings: studying and
// being there, which share a room, and meetings, which claim it (doc 05). A
// double booking is shown, never refused. A member removes his own; the core
// team and the priests can bump someone's.
import { apply, notHere, role, saved } from "./app.js";
import { BOOKINGS, DAYS, MEETINGS, ME, group, space } from "./data.js";
import { clashesWith, schedule, span } from "./model.js";

const days = document.getElementById("days");
const dayTpl = document.getElementById("day");
const rowTpl = document.getElementById("booking");

function chip(kind, text) {
  const c = document.createElement("span");
  c.className = `sum-chip sum-chip--${kind}`;
  c.textContent = text;
  return c;
}

function render() {
  const removed = saved.get("removed") ?? [];
  const mine = saved.get("bookings") ?? [];
  const all = schedule(MEETINGS, DAYS, [...BOOKINGS, ...mine].filter((b) => !removed.includes(b.id)));

  days.replaceChildren();
  for (const d of DAYS) {
    const section = dayTpl.content.firstElementChild.cloneNode(true);
    section.querySelector('[data-slot="label"]').textContent = d.label;
    const rows = section.querySelector('[data-slot="rows"]');

    const today = all.filter((b) => b.day === d.iso);
    if (today.length === 0) {
      const none = document.createElement("p");
      none.className = "muted nobody";
      none.textContent = "Nobody has said they will be there.";
      rows.append(none);
    }

    for (const b of today) {
      const row = rowTpl.content.firstElementChild.cloneNode(true);
      row.id = `b-${b.id}`;
      row.querySelector('[data-slot="time"]').textContent = span(b.start, b.end);

      const half = b.kind === "group" ? (b.space === "dining" ? ", first hour" : ", second hour") : "";
      row.querySelector('[data-slot="who"]').textContent = b.kind === "group" ? group(b.group).name : b.who;
      row.querySelector('[data-slot="space"]').textContent = space(b.space).name + half;

      const chips = row.querySelector('[data-slot="chips"]');
      if (b.kind === "group") chips.append(chip("track", "Life group"));
      if (b.kind === "meeting") chips.append(chip("track", "Meeting"));
      if (b.kind === "study") chips.append(chip("soon", "Studying"));
      if (clashesWith(b, all).length > 0) chips.append(chip("overdue", "Overlaps"));

      const mine = b.kind !== "group" && b.who === ME[role];
      const remove = row.querySelector('[data-slot="remove"]');
      if (mine) {
        remove.hidden = false;
        remove.addEventListener("click", () => {
          saved.set("removed", [...removed, b.id]);
          render();
        });
      }

      // The core team and the priests can bump a booking (doc 05). In the
      // mock-up that is the secretary; a life group's meeting is not bumped.
      const bump = row.querySelector('[data-slot="bump"]');
      if (role === "secretary" && !mine && b.kind !== "group") {
        bump.hidden = false;
        bump.addEventListener("click", () => {
          saved.set("removed", [...removed, b.id]);
          render();
          notHere(`Bumped. ${b.who} is told.`);
        });
      }

      rows.append(row);
    }

    days.append(section);
  }

  apply(days);

  // A link to one booking (Home's displacement notice) brings it into view.
  const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
  target?.scrollIntoView({ block: "center" });
}

render();
