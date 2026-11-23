// Dues (doc 06; doc 14, flow 3): the newcomer's first dues, which make him a
// member, and a member's semester, paid or overdue. Overdue is "out of good
// standing", which is shown and costs nothing.
import { apply, notHere, role, saved } from "./app.js";
import { DUES, EVERYONE, HISTORY } from "./data.js";
import { standing } from "./model.js";

if (new URLSearchParams(window.location.search).get("paid")) {
  notHere("Paid. Thank you.");
}

const me = { member: "mateo", secretary: "daniel" }[role];
if (me) {
  const entry = saved.get(`paid:${me}`) ? { paid: "today" } : EVERYONE.find((e) => e.id === me);
  const state = standing(entry, DUES.pastDue);
  const card = document.getElementById("this-semester");

  const chip = document.createElement("span");
  const [kind, word] = { paid: ["done", "Paid"], settled: ["track", "Settled"], due: ["soon", "Due"], overdue: ["overdue", "Overdue"] }[state];
  chip.className = `sum-chip sum-chip--${kind}`;
  chip.textContent = word;
  card.querySelector('[data-slot="chip"]').replaceWith(chip);

  card.querySelector('[data-slot="note"]').textContent = {
    paid: `Paid ${entry.paid === "today" ? "today" : `on ${entry.paid}`}. You're in good standing.`,
    settled: `Settled by the secretary: ${entry.settled}.`,
    due: `Due by ${DUES.dueBy}.`,
    overdue: `These were due by ${DUES.dueBy}, so you are out of good standing. Nothing changes for you: the roster and the apartment stay open. Pay when you can.`,
  }[state];

  document.getElementById("pay-own").hidden = state === "paid" || state === "settled";

  const history = document.getElementById("history");
  for (const h of HISTORY) {
    const row = document.createElement("div");
    row.className = "row-link";
    const text = document.createElement("div");
    text.className = "grow";
    const title = document.createElement("p");
    title.className = "sum-event-title";
    title.textContent = h.semester;
    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = h.paid ? `Paid on ${h.paid}` : `Settled by the secretary: ${h.settled}`;
    text.append(title, meta);
    const c = document.createElement("span");
    c.className = `sum-chip sum-chip--${h.paid ? "done" : "track"}`;
    c.textContent = h.paid ? "Paid" : "Settled";
    row.append(text, c);
    history.append(row);
  }
}

apply();
