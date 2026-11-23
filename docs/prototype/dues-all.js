// Everyone's dues, the secretary's screen (doc 06): this semester's list with
// each man's standing, a payment the app could not match, the sweatshirts
// owed for first dues, and a semester settled by hand with a note. Every
// change is kept in this browser only.
import { apply, firstPaid, request, saved } from "./app.js";
import { DUES, EVERYONE, UNMATCHED, group } from "./data.js";
import { standing } from "./model.js";

const tpl = document.getElementById("person");

// people is the list with everything done in this browser applied to it.
function people() {
  const matched = saved.get("matched");
  const list = EVERYONE.map((e) => {
    const p = { ...e };
    if (saved.get(`paid:${e.id}`)) p.paid = "today";
    if (matched === e.id) p.paid = UNMATCHED.on;
    const note = saved.get(`settled:${e.id}`);
    if (note && !p.paid) p.settled = note;
    return p;
  });
  if (firstPaid) {
    list.push({ id: "lucas", name: "Lucas", group: group(request.group).name, paid: "today", first: true });
  }
  return list;
}

function row(p, chip, meta) {
  const el = tpl.content.firstElementChild.cloneNode(true);
  el.id = `person-${p.id}`;
  el.querySelector('[data-slot="initial"]').textContent = p.name[0];
  el.querySelector('[data-slot="name"]').textContent = p.name;
  el.querySelector('[data-slot="meta"]').textContent = meta;
  const c = document.createElement("span");
  c.className = `sum-chip sum-chip--${chip[0]}`;
  c.textContent = chip[1];
  el.querySelector('[data-slot="chip"]').replaceWith(c);
  return el;
}

function render() {
  const all = people();

  // This semester.
  const list = document.getElementById("everyone");
  list.replaceChildren();
  const counts = { paid: 0, settled: 0, due: 0, overdue: 0 };
  for (const p of all) {
    const state = standing(p, DUES.pastDue);
    counts[state]++;
    const chip = { paid: ["done", "Paid"], settled: ["track", "Settled"], due: ["soon", "Due"], overdue: ["overdue", "Overdue"] }[state];
    const meta = {
      paid: `${p.group} · paid ${p.paid === "today" ? "today" : `on ${p.paid}`}${p.first ? " · first dues" : ""}`,
      settled: `${p.group} · ${p.settled}`,
      due: `${p.group} · due by ${DUES.dueBy}`,
      overdue: `${p.group} · out of good standing`,
    }[state];
    const el = row(p, chip, meta);

    if (state === "due" || state === "overdue") {
      const action = el.querySelector('[data-slot="action"]');
      const form = el.querySelector('[data-slot="settle"]');
      action.hidden = false;
      action.textContent = "Settle…";
      action.addEventListener("click", () => {
        form.hidden = false;
        action.hidden = true;
        form.note.focus();
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const note = form.note.value.trim();
        if (!note) {
          form.note.setCustomValidity("Say why, so the next secretary knows.");
          form.note.reportValidity();
          return;
        }
        saved.set(`settled:${p.id}`, note);
        render();
      });
    }
    list.append(el);
  }
  document.getElementById("summary").textContent =
    `${DUES.semester}: ${counts.paid} paid · ${counts.settled} settled · ${counts.overdue} out of good standing`;

  // The sweatshirts owed for first dues.
  const owed = document.getElementById("owed");
  owed.replaceChildren();
  for (const p of all.filter((p) => p.first)) {
    const given = saved.get(`sweatshirt:${p.id}`) === true;
    const el = row(p, given ? ["done", "Given"] : ["soon", "Owed"], `${p.group} · first dues paid ${p.paid === "today" ? "today" : `on ${p.paid}`}`);
    el.id = `sweatshirt-${p.id}`;
    if (!given) {
      const action = el.querySelector('[data-slot="action"]');
      action.hidden = false;
      action.textContent = "Mark given";
      action.addEventListener("click", () => {
        saved.set(`sweatshirt:${p.id}`, true);
        render();
      });
    }
    owed.append(el);
  }

  // The payment to match.
  const matched = saved.get("matched");
  document.getElementById("unmatched").hidden = !!matched;
  const done = document.getElementById("matched");
  done.hidden = !matched;
  if (matched) {
    done.textContent = `The $60 from ${UNMATCHED.from} is matched to ${EVERYONE.find((e) => e.id === matched).name}.`;
  }

  apply(document.getElementById("secretary-dues"));
}

const who = document.getElementById("match-who");
const choose = document.createElement("option");
choose.value = "";
choose.textContent = "Choose a member";
who.append(choose);
for (const p of EVERYONE.filter((p) => !p.paid && !p.settled)) {
  const o = document.createElement("option");
  o.value = p.id;
  o.textContent = `${p.name} (${p.group})`;
  who.append(o);
}
document.querySelector('#unmatched [data-slot="from"]').textContent = UNMATCHED.from;
document.querySelector('#unmatched [data-slot="on"]').textContent = UNMATCHED.on;
document.getElementById("match").addEventListener("click", () => {
  if (!who.value) {
    who.setCustomValidity("Choose who paid it.");
    who.reportValidity();
    return;
  }
  saved.set("matched", who.value);
  render();
});

render();
